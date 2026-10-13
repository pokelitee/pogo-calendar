import { useMemo } from 'react';
import { buildPokemonAvailability } from '../utils/pokemonAvailability';
import { useGameData } from './useGameData';

/**
 * Indexes where each Pokémon can currently be obtained.
 */
export function usePokemonAvailability() {
  const { currentEvents, eggPool, raidBosses, researchTasks, rocketLineups, loading, failedSources, retry } =
    useGameData();

  const entries = useMemo(
    () =>
      buildPokemonAvailability({
        events: currentEvents ?? [],
        eggPool,
        raidBosses,
        researchTasks,
        rocketLineups,
      }),
    [currentEvents, eggPool, raidBosses, researchTasks, rocketLineups]
  );

  return { entries, loading, failedSources, retry };
}
