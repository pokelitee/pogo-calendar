import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getEventArchiveYears,
  mergeEventCollections,
} from '../src/utils/eventHistoryUtils.ts';
import type { CalendarEvent } from '../src/types/events.ts';

function event(id: string, title: string): CalendarEvent {
  return {
    title,
    start: '2025-01-01T10:00:00',
    end: '2025-01-01T11:00:00',
    extendedProps: {
      category: 'Event',
      article_url: id,
      banner_url: 'https://example.com/banner.png',
    },
  };
}

test('lists archive years from the manifest in ascending order', () => {
  const file = { sha256: 'abc123', size: 1, updated_at: '2026-01-01T00:00:00Z' };
  const manifest = {
    files: {
      'archives/archive_2026.json': file,
      'events.json': file,
      'archives/archive_2025.json': file,
      'archives/notes.json': file,
    },
  };

  assert.deepEqual(getEventArchiveYears(manifest), [2025, 2026]);
  assert.deepEqual(getEventArchiveYears({ files: {} }), []);
});

test('merges archived and current events with the current version winning', () => {
  const archivedOnly = event('archived', 'Archived event');
  const archivedDuplicate = event('duplicate', 'Old title');
  const currentDuplicate = event('duplicate', 'Updated title');
  const currentOnly = event('current', 'Current event');

  const merged = mergeEventCollections(
    [archivedOnly, archivedDuplicate],
    [currentDuplicate, currentOnly]
  );

  assert.deepEqual(
    merged.map(({ title }) => title),
    ['Archived event', 'Updated title', 'Current event']
  );
});
