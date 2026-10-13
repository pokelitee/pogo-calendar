import {
  EVENTS_URL,
  TIMEZONES_URL,
  getArchivePath,
  getArchiveUrl,
} from '../config/api';
import type { ApiEvent, CalendarEvent } from '../types/events';
import type { Timezone } from '../types/settings';
import {
  formatInstantInTimeZone,
  localDateTimeToInstant,
} from '../utils/eventTimeUtils';
import { getEventArchiveYears } from '../utils/eventHistoryUtils';
import { createDataFetcher, fetchManifest } from './dataService';
import { parseArchiveEventData, parseEventData } from './dataValidation';

type ApiResponse = Record<string, ApiEvent[]>;

// Keyed by year; the stored hash lets a refresh pick up a changed archive.
const archiveDataCache = new Map<number, { sha256: string; data: ApiResponse }>();

interface TimezoneApiItem {
  text: string;
  utc: string[];
}

function parseApiTime(
  time: string | number,
  isLocal: boolean,
  timezone: string
): string {
  let date: Date;

  if (isLocal && typeof time === 'string') {
    // Validate the ISO string
    date = new Date(time);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ISO date string: ${time}`);
    }
    return time;
  } else if (typeof time === 'number') {
    // Validate a non-negative integer UNIX timestamp.
    if (!Number.isInteger(time) || time < 0) {
      throw new Error(`Invalid UNIX timestamp: ${time}`);
    }
    date = new Date(time * 1000);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date created from UNIX timestamp: ${time}`);
    }
  } else {
    throw new Error(
      'Invalid time format. Expected ISO string for local time or UNIX timestamp for UTC time.'
    );
  }

  return formatInstantInTimeZone(date, timezone);
}

function getApiInstant(
  time: string | number,
  isLocal: boolean,
  timezone: string
): string {
  return isLocal
    ? localDateTimeToInstant(String(time), timezone).toISOString()
    : new Date(Number(time) * 1000).toISOString();
}

/**
 * Transforms the raw API response data into an array of CalendarEvent objects.
 *
 * @param data The raw API response data.
 * @returns An array of CalendarEvent objects.
 */
function transformApiData(
  data: ApiResponse,
  timezone: string
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  Object.values(data).forEach((eventsInCategory) => {
    eventsInCategory.forEach((event: ApiEvent) => {
      try {
        const startTime = parseApiTime(
          event.start_time,
          event.is_local_time,
          timezone
        );
        const endTime = parseApiTime(
          event.end_time,
          event.is_local_time,
          timezone
        );
        const startInstant = getApiInstant(
          event.start_time,
          event.is_local_time,
          timezone
        );
        const endInstant = getApiInstant(
          event.end_time,
          event.is_local_time,
          timezone
        );

        events.push({
          title: event.title,
          start: startTime,
          end: endTime,
          extendedProps: {
            category: event.category,
            article_url: event.article_url,
            banner_url: event.banner_url,
            description: event.description,
            is_local_time: event.is_local_time,
            start_instant: startInstant,
            end_instant: endInstant,
            ...event.details,
          },
        });
      } catch (error) {
        console.error(`Failed to parse event: ${event.title}`, error);
        // Skip invalid events rather than crashing the entire app
      }
    });
  });

  return events;
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

/**
 * Fetches a list of IANA time zones.
 *
 * @returns A promise that resolves to an array of Timezone objects.
 */
export const fetchTimezones = async (): Promise<Timezone[]> => {
  const response = await fetch(TIMEZONES_URL);
  if (!response.ok) {
    throw new Error(
      `Timezone API request failed with status ${response.status}`
    );
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Timezone API returned an invalid response');
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const timezone = item as Partial<TimezoneApiItem>;
    const value = timezone.utc?.[0];
    if (typeof timezone.text !== 'string' || typeof value !== 'string') {
      return [];
    }
    return [{ text: timezone.text, value }];
  });
};
