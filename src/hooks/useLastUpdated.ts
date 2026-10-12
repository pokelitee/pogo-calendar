import { format } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchManifest } from '../services/dataService';

/**
 * Custom hook to fetch and manage the time leak-duck's events.json last changed.
 *
 * @returns The formatted last updated time with loading and error states.
 */
export function useLastUpdated() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const manifest = await fetchManifest();
      const updatedAt = manifest.files['events.json']?.updated_at;
      if (requestId === requestIdRef.current) {
        setLastUpdated(
          updatedAt ? format(new Date(updatedAt), 'MMM d, h:mm a') : 'N/A'
        );
      }
    } catch (err: unknown) {
      if (requestId === requestIdRef.current) {
        setError('Could not load update time.');
      }
      console.error(err);
      throw err; // Re-throw error for the caller to handle
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch().catch(() => undefined);
    return () => {
      requestIdRef.current += 1;
    };
  }, [refetch]);

  return { lastUpdated, loading, error, refetch };
}
