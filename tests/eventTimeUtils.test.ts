import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatInstantInTimeZone,
  getCurrentEvents,
  getEventInstant,
  localDateTimeToInstant,
} from '../src/utils/eventTimeUtils.ts';

test('formats an absolute instant in the selected timezone', () => {
  assert.equal(
    formatInstantInTimeZone(
      new Date('2026-07-08T20:00:00.000Z'),
      'America/New_York'
    ),
    '2026-07-08T16:00:00'
  );
});

test('converts a local wall time to its canonical instant', () => {
  assert.equal(
    localDateTimeToInstant(
      '2026-07-20T10:00:00',
      'America/New_York'
    ).toISOString(),
    '2026-07-20T14:00:00.000Z'
  );
});

test('rejects wall times skipped by daylight saving transitions', () => {
  assert.throws(() =>
    localDateTimeToInstant(
      '2026-03-08T02:30:00',
      'America/New_York'
    )
  );
});

test('prefers canonical event instants for calculations', () => {
  const instant = getEventInstant(
    {
      title: 'Global event',
      start: '2026-07-08T16:00:00',
      end: '2026-07-08T17:00:00',
      extendedProps: {
        category: 'Event',
        article_url: 'https://example.com',
        banner_url: 'https://example.com/banner.png',
        start_instant: '2026-07-08T20:00:00.000Z',
      },
    },
    'start'
  );

  assert.equal(instant?.toISOString(), '2026-07-08T20:00:00.000Z');
});

test('keeps events that have not ended, tagged active or upcoming', () => {
  const event = (title: string, start: string, end: string) => ({
    title,
    start,
    end,
    extendedProps: {
      category: 'Event',
      article_url: title,
      banner_url: '',
      start_instant: start,
      end_instant: end,
    },
  });
  const now = new Date('2026-10-12T12:00:00Z');
  const current = getCurrentEvents(
    [
      event('Ended', '2026-10-01T00:00:00Z', '2026-10-12T11:59:59Z'),
      event('Active', '2026-10-12T00:00:00Z', '2026-10-13T00:00:00Z'),
      event('Upcoming', '2026-10-14T00:00:00Z', '2026-10-15T00:00:00Z'),
    ],
    now
  );

  assert.deepEqual(
    current.map(({ event, timing }) => [event.title, timing]),
    [
      ['Active', 'active'],
      ['Upcoming', 'upcoming'],
    ]
  );
});
