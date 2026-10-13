import type { CalendarEvent } from '../types/events';
import type { DataManifest } from '../types/manifest';

// Matches getArchivePath in config/api.ts, which tests can't import at runtime.
const ARCHIVE_PATH_PATTERN = /^archives\/archive_(\d{4})\.json$/;

export function getEventArchiveYears(manifest: DataManifest): number[] {
  return Object.keys(manifest.files)
    .flatMap((path) => {
      const match = ARCHIVE_PATH_PATTERN.exec(path);
      return match ? [Number(match[1])] : [];
    })
    .sort((a, b) => a - b);
}

export function mergeEventCollections(
  archivedEvents: CalendarEvent[],
  currentEvents: CalendarEvent[]
): CalendarEvent[] {
  const eventsById = new Map<string, CalendarEvent>();

  archivedEvents.forEach((event) => {
    eventsById.set(event.extendedProps.article_url, event);
  });
  currentEvents.forEach((event) => {
    eventsById.set(event.extendedProps.article_url, event);
  });

  return Array.from(eventsById.values());
}
