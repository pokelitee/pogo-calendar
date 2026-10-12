export interface CPRange {
  min: number;
  max: number;
}

export interface RaidBoss {
  name: string;
  tier: number | string;
  shiny_available: boolean;
  is_shadow: boolean;
  cp_range: CPRange | null;
  boosted_cp_range: CPRange | null;
  types: string[];
  asset_url: string | null;
}

// Using index signature to support any raid tier (1-Star Raids, 5-Star Raids, Mega Raids, etc.).
// Shadow and regular bosses share their tier's list.
export interface RaidBossData {
  [tier: string]: RaidBoss[];
}
