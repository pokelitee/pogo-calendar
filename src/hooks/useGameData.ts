import { useCallback, useMemo } from 'react';
import { GAME_DATA_PAGES } from '../config/gameData';
import {
  fetchEggPool,
  fetchRaidBosses,
  fetchResearchTasks,
  fetchRocketLineup,
} from '../services/dataService';
import { getCurrentEvents } from '../utils/eventTimeUtils';
import { useEventDataContext } from './useEventDataContext';
import { useNow } from './useNow';
import { usePageData } from './usePageData';

/**
 * Loads current events and every game data set. Sets that fail to load are
 * reported by name so callers can still show the rest.
 */
export function useGameData() {
  const eggPool = usePageData(fetchEggPool);
  const raidBosses = usePageData(fetchRaidBosses);
  const researchTasks = usePageData(fetchResearchTasks);
  const rocketLineups = usePageData(fetchRocketLineup);
  const { allEvents, loading: eventsLoading, error: eventsError, refetchEvents } = useEventDataContext();

  const now = useNow();
  const currentEvents = useMemo(() => getCurrentEvents(allEvents, now), [allEvents, now]);

  const sources = [
    { label: GAME_DATA_PAGES.event.title, loading: eventsLoading, error: eventsError },
    { label: GAME_DATA_PAGES.raid.title, ...raidBosses },
    { label: GAME_DATA_PAGES.egg.title, ...eggPool },
    { label: GAME_DATA_PAGES.research.title, ...researchTasks },
    { label: GAME_DATA_PAGES.rocket.title, ...rocketLineups },
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
    // Null while loading or after a failure.
    currentEvents: eventsLoading || eventsError ? null : currentEvents,
    eggPool: eggPool.data,
    raidBosses: raidBosses.data,
    researchTasks: researchTasks.data,
    rocketLineups: rocketLineups.data,
    loading: sources.some((source) => source.loading),
    failedSources,
    retry,
  };
}
