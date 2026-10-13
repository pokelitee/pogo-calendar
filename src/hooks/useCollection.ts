import { useCallback, useEffect, useMemo, useState } from 'react';
import { COLLECTION_KEY } from '../config/constants';
import { safeGetJSON, safeSetJSON } from '../utils/storageUtils';

// 'registered' means the Pokémon is caught; 'shiny' means its shiny is caught.
export type CollectionList = 'registered' | 'shiny';

type Collection = Record<CollectionList, string[]>;

const toNameList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((name): name is string => typeof name === 'string') : [];

// Stored data may come from an older version or be edited by hand, so only
// string arrays are kept.
function readCollection(): Collection {
  const stored = safeGetJSON<Partial<Record<CollectionList, unknown>> | null>(COLLECTION_KEY, null);
  return { registered: toNameList(stored?.registered), shiny: toNameList(stored?.shiny) };
}

/**
 * The Pokémon a trainer has marked as caught or caught shiny, keyed by the
 * name shown in the data and saved in this browser.
 */
export function useCollection() {
  const [collection, setCollection] = useState<Collection>(readCollection);

  useEffect(() => {
    safeSetJSON(COLLECTION_KEY, collection);
  }, [collection]);

  const sets = useMemo(
    () => ({ registered: new Set(collection.registered), shiny: new Set(collection.shiny) }),
    [collection]
  );

  const has = useCallback((list: CollectionList, name: string) => sets[list].has(name), [sets]);

  const toggle = useCallback((list: CollectionList, name: string) => {
    setCollection((prev) => ({
      ...prev,
      [list]: prev[list].includes(name) ? prev[list].filter((entry) => entry !== name) : [...prev[list], name],
    }));
  }, []);

  return { has, toggle };
}
