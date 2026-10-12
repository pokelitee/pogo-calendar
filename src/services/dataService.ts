import { LEAK_DUCK_DATA_BASE_URL } from '../config/api';
import type { EggPoolData } from '../types/eggPool';
import type { RaidBossData } from '../types/raidBosses';
import type { ResearchTaskData } from '../types/researchTasks';
import type { RocketLineupData } from '../types/rocketLineup';
import {
  parseEggPoolData,
  parseRaidBossData,
  parseResearchTaskData,
  parseRocketLineupData,
} from './dataValidation';

export const GITHUB_EGG_POOL_URL = `${LEAK_DUCK_DATA_BASE_URL}/egg_pool.json`;
export const GITHUB_RAID_BOSSES_URL = `${LEAK_DUCK_DATA_BASE_URL}/raid_bosses.json`;
export const GITHUB_RESEARCH_TASKS_URL = `${LEAK_DUCK_DATA_BASE_URL}/research_tasks.json`;
export const GITHUB_ROCKET_LINEUP_URL = `${LEAK_DUCK_DATA_BASE_URL}/rocket_lineups.json`;

/**
 * Generic data fetcher factory function
 * Creates a type-safe fetch function for a given URL
 *
 * @template T - The expected response type
 * @param url - The URL to fetch data from
 * @returns An async function that fetches and returns typed data
 */
export const createDataFetcher =
  <T>(url: string, parse: (value: unknown) => T) =>
  async (): Promise<T> => {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return parse(await response.json());
  };

/**
 * Fetch egg pool data from leak-duck
 */
export const fetchEggPool = createDataFetcher<EggPoolData>(
  GITHUB_EGG_POOL_URL,
  parseEggPoolData
);

/**
 * Fetch raid bosses data from leak-duck
 */
export const fetchRaidBosses = createDataFetcher<RaidBossData>(
  GITHUB_RAID_BOSSES_URL,
  parseRaidBossData
);

/**
 * Fetch research tasks data from leak-duck
 */
export const fetchResearchTasks = createDataFetcher<ResearchTaskData>(
  GITHUB_RESEARCH_TASKS_URL,
  parseResearchTaskData
);

/**
 * Fetch rocket lineup data from leak-duck
 */
export const fetchRocketLineup = createDataFetcher<RocketLineupData>(
  GITHUB_ROCKET_LINEUP_URL,
  parseRocketLineupData
);
