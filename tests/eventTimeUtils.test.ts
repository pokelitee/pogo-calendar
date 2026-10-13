import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatInstantInTimeZone,
  getCurrentEvents,
  toCalendarEvent,
  getEventInstant,
  localDateTimeToInstant,
} from '../src/utils/eventTimeUtils.ts';
import type { ApiEvent } from '../src/types/events.ts';

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

const apiEvent = (overrides: Partial<ApiEvent>): ApiEvent => ({
  title: 'Example',
  category: 'Event',
  is_local_time: false,
  start_time: 0,
  end_time: 0,
  article_url: 'https://example.invalid/event',
  banner_url: 'https://example.invalid/banner.jpg',
  description: 'Description',
  details: { bonuses: ['2x Stardust'] },
  ...overrides,
});

test('keeps local-time events at the same wall time in every time zone', () => {
  const event = apiEvent({ is_local_time: true, start_time: '2026-10-12T10:00:00', end_time: '2026-10-12T19:00:00' });
  const newYork = toCalendarEvent(event, 'America/New_York');
  const tokyo = toCalendarEvent(event, 'Asia/Tokyo');

  assert.equal(newYork.start, '2026-10-12T10:00:00');
  assert.equal(tokyo.start, '2026-10-12T10:00:00');
  assert.equal(newYork.extendedProps.start_instant, '2026-10-12T14:00:00.000Z');
  assert.equal(tokyo.extendedProps.start_instant, '2026-10-12T01:00:00.000Z');
});

test('shows absolute events in the selected time zone', () => {
  // 2026-10-12T12:00:00Z
  const event = apiEvent({ start_time: 1791806400, end_time: 1791810000 });
  const newYork = toCalendarEvent(event, 'America/New_York');

  assert.equal(newYork.start, '2026-10-12T08:00:00');
  assert.equal(toCalendarEvent(event, 'Asia/Tokyo').start, '2026-10-12T21:00:00');
  assert.equal(newYork.extendedProps.start_instant, '2026-10-12T12:00:00.000Z');
  assert.equal(newYork.extendedProps.end_instant, '2026-10-12T13:00:00.000Z');
});

test('carries event fields and details into extendedProps', () => {
  const { extendedProps } = toCalendarEvent(apiEvent({ start_time: 0, end_time: 60 }), 'UTC');

  assert.equal(extendedProps.category, 'Event');
  assert.equal(extendedProps.is_local_time, false);
  assert.deepEqual(extendedProps.bonuses, ['2x Stardust']);
});

test('rejects local times skipped by daylight saving and invalid timestamps', () => {
  const skipped = apiEvent({ is_local_time: true, start_time: '2026-03-08T02:30:00', end_time: '2026-03-08T04:00:00' });

  assert.throws(() => toCalendarEvent(skipped, 'America/New_York'), /does not exist/);
  assert.doesNotThrow(() => toCalendarEvent(skipped, 'Asia/Tokyo'));
  assert.throws(() => toCalendarEvent(apiEvent({ start_time: -1 }), 'UTC'), /Invalid Unix timestamp/);
});
