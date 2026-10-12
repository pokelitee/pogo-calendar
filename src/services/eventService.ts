import {
  GITHUB_EVENTS_API_URL,
  TIMEZONES_API_URL,
  getEventArchiveApiUrl,
} from '../config/api';
import type { ApiEvent, CalendarEvent } from '../types/events';
import type { Timezone } from '../types/settings';
import {
  formatInstantInTimeZone,
  localDateTimeToInstant,
} from '../utils/eventTimeUtils';
import { getEventArchiveYears } from '../utils/eventHistoryUtils';
import { fetchManifest } from './dataService';
import { parseArchiveEventData, parseEventData } from './dataValidation';

type EventDetails = ApiEvent['details'];

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
 * Extracts detail fields from the details object.
 * Bonuses and all other fields (Pokemon-related) are passed through as-is.
 *
 * @param details The details object from the API event.
 * @returns An object containing all detail fields.
 */
function extractDetails(details: EventDetails) {
  return { ...details };
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
        const extractedDetails = extractDetails(event.details);

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
            ...extractedDetails,
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

  const response = await fetch(getEventArchiveApiUrl(year), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      `Archive request for ${year} failed with status ${response.status}`
    );
  }

  const data = parseArchiveEventData(await response.json());
  archiveDataCache.set(year, { sha256, data });
  return data;
}

/**
 * Fetches events from the GitHub Events API and transforms them into CalendarEvent objects.
 *
 * @returns A promise that resolves to an array of CalendarEvent objects fetched from the API.
 */
export const fetchEvents = async (
  timezone: string
): Promise<CalendarEvent[]> => {
  const response = await fetch(GITHUB_EVENTS_API_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data: ApiResponse = parseEventData(await response.json());

  return transformApiData(data, timezone);
};

export const fetchEventHistory = async (
  timezone: string
): Promise<CalendarEvent[]> => {
  const manifest = await fetchManifest();
  const archives = await Promise.all(
    getEventArchiveYears(manifest).map((year) =>
      fetchArchiveData(year, manifest.files[`archives/archive_${year}.json`].sha256)
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
  const response = await fetch(TIMEZONES_API_URL);
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
