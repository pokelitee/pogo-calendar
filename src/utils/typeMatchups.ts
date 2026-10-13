export const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

interface AttackMatchups {
  superEffective: PokemonType[];
  notVeryEffective: PokemonType[];
  // Pokémon GO has no immunities; these take the double-resist multiplier.
  immune: PokemonType[];
}

// The main-series type chart (Generation 6 onward), keyed by attacking type.
export const TYPE_CHART: Record<PokemonType, AttackMatchups> = {
  Normal: { superEffective: [], notVeryEffective: ['Rock', 'Steel'], immune: ['Ghost'] },
  Fire: {
    superEffective: ['Grass', 'Ice', 'Bug', 'Steel'],
    notVeryEffective: ['Fire', 'Water', 'Rock', 'Dragon'],
    immune: [],
  },
  Water: {
    superEffective: ['Fire', 'Ground', 'Rock'],
    notVeryEffective: ['Water', 'Grass', 'Dragon'],
    immune: [],
  },
  Electric: {
    superEffective: ['Water', 'Flying'],
    notVeryEffective: ['Electric', 'Grass', 'Dragon'],
    immune: ['Ground'],
  },
  Grass: {
    superEffective: ['Water', 'Ground', 'Rock'],
    notVeryEffective: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
    immune: [],
  },
  Ice: {
    superEffective: ['Grass', 'Ground', 'Flying', 'Dragon'],
    notVeryEffective: ['Fire', 'Water', 'Ice', 'Steel'],
    immune: [],
  },
  Fighting: {
    superEffective: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
    notVeryEffective: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
    immune: ['Ghost'],
  },
  Poison: {
    superEffective: ['Grass', 'Fairy'],
    notVeryEffective: ['Poison', 'Ground', 'Rock', 'Ghost'],
    immune: ['Steel'],
  },
  Ground: {
    superEffective: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
    notVeryEffective: ['Grass', 'Bug'],
    immune: ['Flying'],
  },
  Flying: {
    superEffective: ['Grass', 'Fighting', 'Bug'],
    notVeryEffective: ['Electric', 'Rock', 'Steel'],
    immune: [],
  },
  Psychic: { superEffective: ['Fighting', 'Poison'], notVeryEffective: ['Psychic', 'Steel'], immune: ['Dark'] },
  Bug: {
    superEffective: ['Grass', 'Psychic', 'Dark'],
    notVeryEffective: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
    immune: [],
  },
  Rock: {
    superEffective: ['Fire', 'Ice', 'Flying', 'Bug'],
    notVeryEffective: ['Fighting', 'Ground', 'Steel'],
    immune: [],
  },
  Ghost: { superEffective: ['Psychic', 'Ghost'], notVeryEffective: ['Dark'], immune: ['Normal'] },
  Dragon: { superEffective: ['Dragon'], notVeryEffective: ['Steel'], immune: ['Fairy'] },
  Dark: { superEffective: ['Psychic', 'Ghost'], notVeryEffective: ['Fighting', 'Dark', 'Fairy'], immune: [] },
  Steel: {
    superEffective: ['Ice', 'Rock', 'Fairy'],
    notVeryEffective: ['Fire', 'Water', 'Electric', 'Steel'],
    immune: [],
  },
  Fairy: {
    superEffective: ['Fighting', 'Dragon', 'Dark'],
    notVeryEffective: ['Fire', 'Poison', 'Steel'],
    immune: [],
  },
};

// Pokémon GO's damage multipliers for one type matchup.
export const SUPER_EFFECTIVE_MULTIPLIER = 1.6;
export const NOT_VERY_EFFECTIVE_MULTIPLIER = 0.625;
export const IMMUNE_MULTIPLIER = 0.390625;

/**
 * Returns the damage multiplier for an attacking type against a Pokémon of
 * one or two defending types, using Pokémon GO's multipliers.
 */
export function getEffectiveness(attacking: PokemonType, defending: readonly PokemonType[]): number {
  const matchups = TYPE_CHART[attacking];
  const multiplier = defending.reduce((total, type) => {
    if (matchups.superEffective.includes(type)) return total * SUPER_EFFECTIVE_MULTIPLIER;
    if (matchups.notVeryEffective.includes(type)) return total * NOT_VERY_EFFECTIVE_MULTIPLIER;
    if (matchups.immune.includes(type)) return total * IMMUNE_MULTIPLIER;
    return total;
  }, 1);
  // Rounded so float products such as 1.6 × 1.6 compare and group exactly.
  return Math.round(multiplier * 1e6) / 1e6;
}

export interface EffectivenessGroup {
  multiplier: number;
  types: PokemonType[];
}

/**
 * Groups every attacking type by its multiplier against the defending types,
 * strongest first.
 */
export function getDefensiveMatchups(defending: readonly PokemonType[]): EffectivenessGroup[] {
  const groups = new Map<number, PokemonType[]>();
  POKEMON_TYPES.forEach((attacking) => {
    const multiplier = getEffectiveness(attacking, defending);
    groups.set(multiplier, [...(groups.get(multiplier) ?? []), attacking]);
  });
  return Array.from(groups, ([multiplier, types]) => ({ multiplier, types })).sort(
    (a, b) => b.multiplier - a.multiplier
  );
}

/**
 * Attacking types that deal more than neutral damage, strongest first.
 */
export function getWeaknesses(defending: readonly PokemonType[]): PokemonType[] {
  return getDefensiveMatchups(defending)
    .filter(({ multiplier }) => multiplier > 1)
    .flatMap(({ types }) => types);
}

export function isPokemonType(value: string): value is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

// A Pokémon has at most two types.
export const MAX_DEFENDING_TYPES = 2;

/**
 * Parses a comma-separated type list (as stored in a URL), keeping known,
 * distinct types up to the two a Pokémon can have. Repeating a type would
 * otherwise apply its multiplier twice.
 */
export function parseTypeList(value: string | null): PokemonType[] {
  const types = (value ?? '').split(',').filter(isPokemonType);
  return [...new Set(types)].slice(0, MAX_DEFENDING_TYPES);
}

/**
 * Formats a multiplier for display, e.g. 2.56 → "×2.56", 0.390625 → "×0.39".
 */
export function formatMultiplier(multiplier: number): string {
  return `×${Number(multiplier.toFixed(2))}`;
}

/**
 * Storage searches for Pokémon with moves of the given attacking types.
 * `anyMove` matches a move of any listed type in any slot; `fastAndCharged`
 * requires a fast move and a charged move of the listed types.
 */
export function buildCounterSearches(attacking: readonly PokemonType[]): {
  anyMove: string;
  fastAndCharged: string;
} {
  const names = attacking.map((type) => type.toLowerCase());
  if (names.length === 0) return { anyMove: '', fastAndCharged: '' };
  return {
    anyMove: names.map((name) => `@${name}`).join(','),
    fastAndCharged: [
      names.map((name) => `@1${name}`).join(','),
      names.flatMap((name) => [`@2${name}`, `@3${name}`]).join(','),
    ].join('&'),
  };
}
