// Page-specific filter types

// Egg Pool Filters
export interface EggPoolFilters {
  pokemonSearch: string;
  selectedEggTiers: string[];
  selectedRarityTiers: string[];
  shinyOnly: boolean;
}

// Raid Boss Filters
export interface RaidBossFilters {
  pokemonSearch: string;
  selectedRaidTiers: string[];
  selectedTypes: string[];
  shinyOnly: boolean;
  shadowOnly: boolean;
  minCP: number;
  maxCP: number;
}

// Research Task Filters
export interface ResearchTaskFilters {
  taskSearch: string;
  pokemonSearch: string;
  rewardTypes: string[]; // 'encounter' | 'item'
  shinyOnly: boolean;
  selectedCategories: string[];
}

// Rocket Lineup Filters
export interface RocketLineupFilters {
  pokemonSearch: string;
  selectedLeaders: string[];
  selectedSlots: number[];
  encounterOnly: boolean;
  shinyOnly: boolean;
}

export interface EggPoolFilterOptions {
  eggTiers: string[];
  rarityTiers: string[];
}

export interface RaidBossFilterOptions {
  raidTiers: string[];
  types: string[];
}

export interface ResearchTaskFilterOptions {
  categories: string[];
  rewardTypes: string[];
}

export interface RocketLineupFilterOptions {
  leaders: string[];
}
