import {
  EVENTS_URL,
  getArchivePath,
  getArchiveUrl,
} from '../config/api';
import type { ApiEvent, CalendarEvent } from '../types/events';
import { toCalendarEvent } from '../utils/eventTimeUtils';
import { getEventArchiveYears } from '../utils/eventHistoryUtils';
import { createDataFetcher, fetchManifest } from './dataService';
import { parseArchiveEventData, parseEventData } from './dataValidation';

type ApiResponse = Record<string, ApiEvent[]>;

// Keyed by year; the stored hash lets a refresh pick up a changed archive.
const archiveDataCache = new Map<number, { sha256: string; data: ApiResponse }>();

/**
 * Converts every event in a leak-duck response, skipping (and logging) any
 * whose times can't be converted rather than failing the whole calendar.
 */
function transformApiData(data: ApiResponse, timezone: string): CalendarEvent[] {
  return Object.values(data)
    .flat()
    .flatMap((event) => {
      try {
        return [toCalendarEvent(event, timezone)];
      } catch (error) {
        console.error(`Failed to parse event: ${event.title}`, error);
        return [];
      }
    });
}

async function fetchArchiveData(
  year: number,
  sha256: string
): Promise<ApiResponse> {
  const cached = archiveDataCache.get(year);
  if (cached?.sha256 === sha256) return cached.data;

  const data = await createDataFetcher(getArchiveUrl(year), parseArchiveEventData)();
  archiveDataCache.set(year, { sha256, data });
  return data;
}

const fetchEventData = createDataFetcher(EVENTS_URL, parseEventData);

/**
 * Fetches leak-duck's current events and converts them into CalendarEvent objects.
 */
export const fetchEvents = async (timezone: string): Promise<CalendarEvent[]> =>
  transformApiData(await fetchEventData(), timezone);

export const fetchEventHistory = async (
  timezone: string
): Promise<CalendarEvent[]> => {
  const manifest = await fetchManifest();
  const archives = await Promise.all(
    getEventArchiveYears(manifest).map((year) =>
      fetchArchiveData(year, manifest.files[getArchivePath(year)].sha256)
    )
  );

  return archives.flatMap((archive) => transformApiData(archive, timezone));
};
