import assert from 'node:assert/strict';
import test from 'node:test';
import { getTimeZoneOptions } from '../src/utils/timeZones.ts';

// A winter date, so no daylight saving offsets apply in the northern hemisphere.
const JANUARY = new Date('2026-01-15T12:00:00Z');

test('labels zones with their offset and city, sorted by offset', () => {
  const options = getTimeZoneOptions('UTC', JANUARY, ['Asia/Tokyo', 'America/New_York', 'America/Argentina/Buenos_Aires']);

  assert.deepEqual(
    options.map(({ value }) => value),
    ['America/New_York', 'America/Argentina/Buenos_Aires', 'UTC', 'Asia/Tokyo']
  );
  assert.match(options[0].text, /^\(UTC-05:00\) New York/);
  assert.match(options[1].text, /^\(UTC-03:00\) Buenos Aires/);
  assert.match(options[3].text, /^\(UTC\+09:00\) Tokyo/);
});

test('uses the offset in effect on the given date', () => {
  const [july] = getTimeZoneOptions('America/New_York', new Date('2026-07-15T12:00:00Z'), []);
  assert.match(july.text, /^\(UTC-04:00\) New York/);
});

test('always includes the current setting and skips zones that cannot be formatted', () => {
  const options = getTimeZoneOptions('Etc/GMT+12', JANUARY, ['Asia/Tokyo', 'Not/A_Zone']);

  assert.deepEqual(
    options.map(({ value }) => value),
    ['Etc/GMT+12', 'Asia/Tokyo']
  );
  assert.equal(options[0].text, '(UTC-12:00)');
});
