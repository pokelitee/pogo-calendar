import type { Timezone } from '../types/settings';

// Browsers' lists omit plain UTC, a common choice for event times.
function supportedTimeZones(): string[] {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return ['UTC', ...zones];
}

// "GMT+05:30" → 330, "GMT-08:00" → -480, "GMT" → 0.
function parseOffsetMinutes(gmtOffset: string): number {
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(gmtOffset);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  return (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes));
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

function timeZoneNamePart(timeZone: string, style: 'longOffset' | 'longGeneric', now: Date): string | undefined {
  return new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: style })
    .formatToParts(now)
    .find((part) => part.type === 'timeZoneName')?.value;
}

// "America/Argentina/Buenos_Aires" → "Buenos Aires". POSIX "Etc/GMT+12" names
// invert the offset's sign (it is UTC-12), so they show only the offset.
const cityName = (timeZone: string) =>
  timeZone.startsWith('Etc/') ? '' : timeZone.split('/').at(-1)!.replace(/_/g, ' ');

/**
 * Lists IANA time zones for the Settings picker, labelled with their current
 * UTC offset, city, and generic name, e.g. "(UTC-05:00) New York · Eastern
 * Time", sorted by offset. Uses the browser's own list, so it needs no
 * network request. The current setting is always included, since a value
 * saved earlier may not be in this browser's list.
 */
export function getTimeZoneOptions(
  current: string,
  now: Date = new Date(),
  zones: readonly string[] = supportedTimeZones()
): Timezone[] {
  const options = new Map<string, { offsetMinutes: number; text: string }>();

  [current, ...zones].forEach((timeZone) => {
    if (options.has(timeZone)) return;
    try {
      const offsetMinutes = parseOffsetMinutes(timeZoneNamePart(timeZone, 'longOffset', now) ?? 'GMT');
      const generic = timeZoneNamePart(timeZone, 'longGeneric', now);
      const city = cityName(timeZone);
      // Generic names that only restate the offset ("GMT+05:30") add nothing.
      const name = [city, generic && !generic.startsWith('GMT') && generic !== city ? generic : '']
        .filter(Boolean)
        .join(' · ');
      options.set(timeZone, { offsetMinutes, text: `(${formatOffset(offsetMinutes)})${name ? ` ${name}` : ''}` });
    } catch {
      // Zones this browser can't format can't be selected anyway.
    }
  });

  return Array.from(options, ([value, { offsetMinutes, text }]) => ({ value, text, offsetMinutes }))
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.text.localeCompare(b.text))
    .map(({ value, text }) => ({ value, text }));
}
