import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type {
  EggPoolFilterOptions,
  EggPoolFilters,
  RaidBossFilterOptions,
  RaidBossFilters,
  ResearchTaskFilterOptions,
  ResearchTaskFilters,
  RocketLineupFilterOptions,
  RocketLineupFilters,
} from '../types/pageFilters';

// Default filter states for each page type
export const defaultEggPoolFilters: EggPoolFilters = {
  pokemonSearch: '',
  selectedEggTiers: [],
  selectedRarityTiers: [],
  shinyOnly: false,
};

export const defaultRaidBossFilters: RaidBossFilters = {
  pokemonSearch: '',
  selectedRaidTiers: [],
  selectedTypes: [],
  shinyOnly: false,
  shadowOnly: false,
  minCP: 0,
  maxCP: 60000,
};

export const defaultResearchTaskFilters: ResearchTaskFilters = {
  taskSearch: '',
  pokemonSearch: '',
  rewardTypes: [],
  shinyOnly: false,
  selectedCategories: [],
};

export const defaultRocketLineupFilters: RocketLineupFilters = {
  pokemonSearch: '',
  selectedLeaders: [],
  selectedSlots: [],
  encounterOnly: false,
  shinyOnly: false,
};

export const emptyEggPoolOptions: EggPoolFilterOptions = { eggTiers: [], rarityTiers: [] };
export const emptyRaidBossOptions: RaidBossFilterOptions = { raidTiers: [], types: [] };
export const emptyResearchTaskOptions: ResearchTaskFilterOptions = { categories: [], rewardTypes: [] };
export const emptyRocketLineupOptions: RocketLineupFilterOptions = { leaders: [] };

export const countEggPoolFilters = (filters: EggPoolFilters) =>
  (filters.pokemonSearch ? 1 : 0) +
  filters.selectedEggTiers.length +
  filters.selectedRarityTiers.length +
  (filters.shinyOnly ? 1 : 0);

export const countRaidBossFilters = (filters: RaidBossFilters) =>
  (filters.pokemonSearch ? 1 : 0) +
  filters.selectedRaidTiers.length +
  filters.selectedTypes.length +
  (filters.shinyOnly ? 1 : 0) +
  (filters.shadowOnly ? 1 : 0) +
  (filters.minCP > defaultRaidBossFilters.minCP || filters.maxCP < defaultRaidBossFilters.maxCP ? 1 : 0);

export const countResearchTaskFilters = (filters: ResearchTaskFilters) =>
  (filters.taskSearch ? 1 : 0) +
  (filters.pokemonSearch ? 1 : 0) +
  filters.rewardTypes.length +
  (filters.shinyOnly ? 1 : 0) +
  filters.selectedCategories.length;

export const countRocketLineupFilters = (filters: RocketLineupFilters) =>
  (filters.pokemonSearch ? 1 : 0) +
  filters.selectedLeaders.length +
  filters.selectedSlots.length +
  (filters.encounterOnly ? 1 : 0) +
  (filters.shinyOnly ? 1 : 0);

export interface PageFilterState<F, O> {
  filters: F;
  setFilters: Dispatch<SetStateAction<F>>;
  resetFilters: () => void;
  activeFilterCount: number;
  options: O;
  setOptions: Dispatch<SetStateAction<O>>;
}

export function usePageFilterState<F, O>(
  defaultFilters: F,
  countActiveFilters: (filters: F) => number,
  emptyOptions: O
): PageFilterState<F, O> {
  const [filters, setFilters] = useState<F>(defaultFilters);
  const [options, setOptions] = useState<O>(emptyOptions);

  const resetFilters = useCallback(() => setFilters(defaultFilters), [defaultFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters,
      resetFilters,
      activeFilterCount: countActiveFilters(filters),
      options,
      setOptions,
    }),
    [filters, resetFilters, countActiveFilters, options]
  );
}
