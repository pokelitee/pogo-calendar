import { format } from 'date-fns';

/**
 * Safely converts a string or Date into a valid Date object, or null.
 *
 * @param value The input value to convert.
 * @returns A valid Date object, or null if the input is invalid.
 */
export function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  // If it's already a Date object, return it directly (after validation).
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value);
  // Check if parsing the string resulted in a valid date.
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date string into a readable string.
 *
 * @param dateString The date string to format.
 * @param hour12 If true, use 12-hour format.
 * @param showTime If true, includes the time in the output. Defaults to true.
 * @returns A formatted date string (e.g., "Sep 11, 2025 10:45 AM").
 */
export function formatDateLine(
  dateString: string | null,
  hour12: boolean,
  showTime: boolean = true
): string | null {
  if (!dateString) return null;
  const date = toDate(dateString);
  if (!date) return null;

  const formatString = showTime
    ? `MMM d, yyyy ${hour12 ? 'h:mm a' : 'HH:mm'}`
    : 'MMM d, yyyy';
  return format(date, formatString);
}

/**
 * Formats an hour value (0-24) to a 12-hour time string with AM/PM.
 */
export function formatHour(value: number): string {
  if (value === 24 || value === 0) return '12 AM';
  const ampm = value < 12 ? 'AM' : 'PM';
  const hour = value % 12 === 0 ? 12 : value % 12;
  return `${hour} ${ampm}`;
}

/**
 * Formats a Date object or a date string into a timezone-agnostic ISO-like string.
 * This format (YYYY-MM-DDTHH:mm:ss) is interpreted as "local time" by FullCalendar.
 * @param date - The date to format.
 * @returns The formatted date string.
 */
export function formatToLocalTime(date: string | Date): string {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Restores the space FullCalendar 7 drops before AM/PM in event times:
 * "10:00AM" → "10:00 AM", "6:00 – 7:00PM" → "6:00 – 7:00 PM".
 */
export function formatEventTimeText(text: string): string {
  return text.replace(/(\d)(AM|PM|am|pm)\b/g, '$1 $2');
}
