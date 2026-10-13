import type { ApiEvent, CalendarEvent } from '../types/events';

const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getDateTimeParts(date: Date, timeZone: string): DateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  );
  return values as unknown as DateTimeParts;
}

function parseLocalDateTime(value: string): DateTimeParts {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid local date-time: ${value}`);
  }
  const [, year, month, day, hour, minute, second] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };
}

function partsToUtcMilliseconds(parts: DateTimeParts): number {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
}

export function formatInstantInTimeZone(
  instant: Date,
  timeZone: string
): string {
  if (Number.isNaN(instant.getTime())) throw new Error('Invalid instant');
  const parts = getDateTimeParts(instant, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

export function localDateTimeToInstant(
  localDateTime: string,
  timeZone: string
): Date {
  const requestedParts = parseLocalDateTime(localDateTime);
  const requestedAsUtc = partsToUtcMilliseconds(requestedParts);
  let candidate = requestedAsUtc;

  // Recalculate to account for DST transitions at the requested wall time.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actualParts = getDateTimeParts(new Date(candidate), timeZone);
    const difference = requestedAsUtc - partsToUtcMilliseconds(actualParts);
    if (difference === 0) break;
    candidate += difference;
  }

  const result = new Date(candidate);
  if (formatInstantInTimeZone(result, timeZone) !== localDateTime) {
    throw new Error(
      `Local date-time ${localDateTime} does not exist in ${timeZone}`
    );
  }
  return result;
}

/**
 * Converts one leak-duck event into a CalendarEvent for a time zone. Local-time
 * events happen at the same wall-clock time everywhere, so they keep their
 * wall time; other events are Unix timestamps shown in `timeZone`. Both get
 * canonical instants for status checks and exports. Throws for a time that
 * can't be converted, such as a local time skipped by a daylight saving change.
 */
export function toCalendarEvent(event: ApiEvent, timeZone: string): CalendarEvent {
  const convert = (time: string | number) => {
    if (event.is_local_time) {
      const wallTime = String(time);
      return { wallTime, instant: localDateTimeToInstant(wallTime, timeZone).toISOString() };
    }
    if (typeof time !== 'number' || !Number.isInteger(time) || time < 0) {
      throw new Error(`Invalid Unix timestamp: ${time}`);
    }
    const instant = new Date(time * 1000);
    return { wallTime: formatInstantInTimeZone(instant, timeZone), instant: instant.toISOString() };
  };
  const start = convert(event.start_time);
  const end = convert(event.end_time);

  return {
    title: event.title,
    start: start.wallTime,
    end: end.wallTime,
    extendedProps: {
      category: event.category,
      article_url: event.article_url,
      banner_url: event.banner_url,
      description: event.description,
      is_local_time: event.is_local_time,
      start_instant: start.instant,
      end_instant: end.instant,
      ...event.details,
    },
  };
}

export function getEventInstant(
  event: CalendarEvent,
  edge: 'start' | 'end'
): Date | null {
  const instant = event.extendedProps[`${edge}_instant`];
  const value = typeof instant === 'string' ? instant : event[edge];
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type EventTiming = 'active' | 'upcoming';

export interface TimedEvent {
  event: CalendarEvent;
  timing: EventTiming;
  start: Date | null;
  end: Date;
}

/**
 * Returns the events that have not ended yet, tagged as active or upcoming.
 */
export function getCurrentEvents(events: CalendarEvent[], now: Date = new Date()): TimedEvent[] {
  return events.flatMap((event): TimedEvent[] => {
    const start = getEventInstant(event, 'start');
    const end = getEventInstant(event, 'end');
    if (!end || end <= now) return [];
    return [{ event, timing: start && start > now ? 'upcoming' : 'active', start, end }];
  });
}
