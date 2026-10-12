export type TermState = 'include' | 'exclude';

export type StatName = 'attack' | 'defense' | 'hp';

export type StatRange = [min: number, max: number];

export interface SearchStringState {
  // Comma-separated Pokémon names, dex numbers, or dex ranges such as 1-151.
  pokemon: string;
  includeFamily: boolean;
  terms: Record<string, TermState>;
  cpMin: string;
  cpMax: string;
  stats: Record<StatName, StatRange>;
  custom: string;
}

export const STAT_NAMES: StatName[] = ['attack', 'defense', 'hp'];

export const FULL_STAT_RANGE: StatRange = [0, 4];

export const EMPTY_SEARCH_STATE: SearchStringState = {
  pokemon: '',
  includeFamily: false,
  terms: {},
  cpMin: '',
  cpMax: '',
  stats: { attack: FULL_STAT_RANGE, defense: FULL_STAT_RANGE, hp: FULL_STAT_RANGE },
  custom: '',
};

const DEX_TOKEN_PATTERN = /^\d+(-\d*)?$|^-\d+$/;

function parsePokemonTokens(value: string, includeFamily: boolean): string[] {
  return value
    .split(/[,;]/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .map((token) =>
      // The family prefix only applies to species names, not dex numbers.
      includeFamily && !DEX_TOKEN_PATTERN.test(token) ? `+${token}` : token
    );
}

function formatRange(prefix: string, min: string, max: string): string | null {
  const low = min.trim();
  const high = max.trim();
  if (!low && !high) return null;
  if (low && high) return `${prefix}${low}-${high}`;
  return low ? `${prefix}${low}-` : `${prefix}-${high}`;
}

function formatStat(stat: StatName, [min, max]: StatRange): string | null {
  if (min === FULL_STAT_RANGE[0] && max === FULL_STAT_RANGE[1]) return null;
  return min === max ? `${min}${stat}` : `${min}-${max}${stat}`;
}

/**
 * Builds a Pokémon GO storage search string. In-game, `,` (OR) binds tighter
 * than `&` (AND), so each category's included terms form one OR group and
 * every excluded term becomes its own `!term` group.
 *
 * @param state The builder selections.
 * @param categories Term keywords grouped by category, in display order.
 */
export function buildSearchString(
  state: SearchStringState,
  categories: string[][]
): string {
  const groups: string[] = [];

  const pokemon = parsePokemonTokens(state.pokemon, state.includeFamily);
  if (pokemon.length > 0) groups.push(pokemon.join(','));

  categories.forEach((keywords) => {
    const included = keywords.filter((keyword) => state.terms[keyword] === 'include');
    if (included.length > 0) groups.push(included.join(','));
    keywords
      .filter((keyword) => state.terms[keyword] === 'exclude')
      .forEach((keyword) => groups.push(`!${keyword}`));
  });

  const cp = formatRange('cp', state.cpMin, state.cpMax);
  if (cp) groups.push(cp);

  STAT_NAMES.forEach((stat) => {
    const term = formatStat(stat, state.stats[stat]);
    if (term) groups.push(term);
  });

  const custom = state.custom.trim();
  if (custom) groups.push(custom);

  return groups.join('&');
}

/**
 * Cycles a term through unselected, include, and exclude.
 */
export function nextTermState(current: TermState | undefined): TermState | undefined {
  if (current === undefined) return 'include';
  if (current === 'include') return 'exclude';
  return undefined;
}
