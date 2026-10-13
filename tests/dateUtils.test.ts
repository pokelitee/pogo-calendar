import assert from 'node:assert/strict';
import test from 'node:test';
import { formatEventTimeText } from '../src/utils/dateUtils.ts';

test('adds the space FullCalendar drops before AM and PM', () => {
  assert.equal(formatEventTimeText('10:00AM'), '10:00 AM');
  assert.equal(formatEventTimeText('6:00AM – 9:00PM'), '6:00 AM – 9:00 PM');
  assert.equal(formatEventTimeText('6:00 – 7:00PM'), '6:00 – 7:00 PM');
  assert.equal(formatEventTimeText('10am'), '10 am');
});

test('leaves 24-hour times and text unchanged', () => {
  assert.equal(formatEventTimeText('10:00 – 21:00'), '10:00 – 21:00');
  assert.equal(formatEventTimeText('All-day'), 'All-day');
  assert.equal(formatEventTimeText(''), '');
});
