import { useCallback, useMemo } from 'react';
import {
  fetchEggPool,
  fetchRaidBosses,
  fetchResearchTasks,
  fetchRocketLineup,
} from '../services/dataService';
import { getCurrentEvents } from '../utils/eventTimeUtils';
import { buildPokemonAvailability } from '../utils/pokemonAvailability';
import { useEventDataContext } from './useEventDataContext';
import { usePageData } from './usePageData';

/**
 * Loads current events and every game data set, and indexes where each
 * Pokémon can be obtained. Sources that fail to load are reported by name so
 * the rest can still be shown.
 */
export function usePokemonAvailability() {
  const eggPool = usePageData(fetchEggPool);
  const raidBosses = usePageData(fetchRaidBosses);
  const researchTasks = usePageData(fetchResearchTasks);
  const rocketLineups = usePageData(fetchRocketLineup);
  const { allEvents, loading: eventsLoading, error: eventsError, refetchEvents } = useEventDataContext();

  const timedEvents = useMemo(() => getCurrentEvents(allEvents), [allEvents]);

  const entries = useMemo(
    () =>
      buildPokemonAvailability({
        events: timedEvents,
        eggPool: eggPool.data,
        raidBosses: raidBosses.data,
        researchTasks: researchTasks.data,
        rocketLineups: rocketLineups.data,
      }),
    [timedEvents, eggPool.data, raidBosses.data, researchTasks.data, rocketLineups.data]
  );

  const sources = [
    { label: 'Events', loading: eventsLoading, error: eventsError },
    { label: 'Raid Bosses', ...raidBosses },
    { label: 'Egg Pool', ...eggPool },
    { label: 'Research', ...researchTasks },
    { label: 'Rocket', ...rocketLineups },
  ];
  const failedSources = sources.filter((source) => source.error).map((source) => source.label);

  const eggPoolRefetch = eggPool.refetch;
  const raidBossesRefetch = raidBosses.refetch;
  const researchTasksRefetch = researchTasks.refetch;
  const rocketLineupsRefetch = rocketLineups.refetch;
  const retry = useCallback(() => {
    eggPoolRefetch();
    raidBossesRefetch();
    researchTasksRefetch();
    rocketLineupsRefetch();
    void refetchEvents().catch(() => undefined);
  }, [eggPoolRefetch, raidBossesRefetch, researchTasksRefetch, rocketLineupsRefetch, refetchEvents]);

  return {
    entries,
    loading: sources.some((source) => source.loading),
    failedSources,
    retry,
  };
}
