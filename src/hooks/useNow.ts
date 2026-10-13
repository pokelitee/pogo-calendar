import { useEffect, useState } from 'react';
import { MS_PER_MINUTE } from '../config/timeConstants';

/**
 * The current time, refreshed every minute so time-based views (active vs.
 * upcoming, "ends in") stay correct in a tab left open.
 */
export function useNow(intervalMs: number = MS_PER_MINUTE): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
