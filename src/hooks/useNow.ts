import { useEffect, useState } from 'react';

const ONE_MINUTE_MS = 60_000;

/**
 * The current time, refreshed every minute so time-based views (active vs.
 * upcoming, "ends in") stay correct in a tab left open.
 */
export function useNow(intervalMs: number = ONE_MINUTE_MS): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
