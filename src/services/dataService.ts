import {
  EGG_POOL_URL,
  MANIFEST_URL,
  RAID_BOSSES_URL,
  RESEARCH_TASKS_URL,
  ROCKET_LINEUPS_URL,
} from '../config/api';
import type { EggPoolData } from '../types/eggPool';
import type { DataManifest } from '../types/manifest';
import type { RaidBossData } from '../types/raidBosses';
import type { ResearchTaskData } from '../types/researchTasks';
import type { RocketLineupData } from '../types/rocketLineup';
import {
  parseEggPoolData,
  parseManifestData,
  parseRaidBossData,
  parseResearchTaskData,
  parseRocketLineupData,
} from './dataValidation';

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
      throw new Error(`Request for ${url} failed with status ${response.status}`);
    }

    return parse(await response.json());
  };

/**
 * Fetch egg pool data from leak-duck
 */
export const fetchEggPool = createDataFetcher<EggPoolData>(
  EGG_POOL_URL,
  parseEggPoolData
);

/**
 * Fetch raid bosses data from leak-duck
 */
export const fetchRaidBosses = createDataFetcher<RaidBossData>(
  RAID_BOSSES_URL,
  parseRaidBossData
);

/**
 * Fetch research tasks data from leak-duck
 */
export const fetchResearchTasks = createDataFetcher<ResearchTaskData>(
  RESEARCH_TASKS_URL,
  parseResearchTaskData
);

/**
 * Fetch rocket lineup data from leak-duck
 */
export const fetchRocketLineup = createDataFetcher<RocketLineupData>(
  ROCKET_LINEUPS_URL,
  parseRocketLineupData
);

/**
 * Fetch the leak-duck manifest, which lists every published file and when its
 * content last changed
 */
export const fetchManifest = createDataFetcher<DataManifest>(
  MANIFEST_URL,
  parseManifestData
);
