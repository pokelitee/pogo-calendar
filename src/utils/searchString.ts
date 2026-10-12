export type TermState = 'include' | 'exclude';

export type StatName = 'attack' | 'defense' | 'hp';

export type StatRange = [min: number, max: number];

// '' matches a move in any slot; 1 is the fast move, 2 and 3 the charged moves.
export type MoveSlot = '' | '1' | '2' | '3';

export type RangeKey =
  | 'cp'
  | 'hp'
  | 'distance'
  | 'age'
  | 'year'
  | 'buddy'
  | 'mega'
  | 'count'
  | 'countcandy'
  | 'countcandyxl'
  | 'candykm';

export interface NumberRange {
  min: string;
  max: string;
}

export interface SearchStringState {
  // Comma-separated Pokémon names, dex numbers, or dex ranges such as 1-151.
  pokemon: string;
  includeFamily: boolean;
  // Comma-separated tag names, without the leading #.
  tags: string;
  terms: Record<string, TermState>;
  moveSlot: MoveSlot;
  // Comma-separated move names, without the leading @.
  moveNames: string;
  ranges: Partial<Record<RangeKey, NumberRange>>;
  stats: Record<StatName, StatRange>;
  custom: string;
}

export interface SearchTermGroup {
  keywords: string[];
  // Whether the move slot prefix applies, as for move-type keywords (@fire).
  slotted?: boolean;
}

export const STAT_NAMES: StatName[] = ['attack', 'defense', 'hp'];

export const FULL_STAT_RANGE: StatRange = [0, 4];

export const EMPTY_SEARCH_STATE: SearchStringState = {
  pokemon: '',
  includeFamily: false,
  tags: '',
  terms: {},
  moveSlot: '',
  moveNames: '',
  ranges: {},
  stats: { attack: FULL_STAT_RANGE, defense: FULL_STAT_RANGE, hp: FULL_STAT_RANGE },
  custom: '',
};

const DEX_TOKEN_PATTERN = /^\d+(-\d*)?$|^-\d+$/;

function splitList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function parsePokemonTokens(value: string, includeFamily: boolean): string[] {
  return splitList(value).map((token) =>
    // The family prefix only applies to species names, not dex numbers.
    includeFamily && !DEX_TOKEN_PATTERN.test(token) ? `+${token}` : token
  );
}

function withMoveSlot(keyword: string, slot: MoveSlot): string {
  return slot ? `@${slot}${keyword.slice(1)}` : keyword;
}

/**
 * Formats a numeric range term: `cp10-500`, `cp2500-` (at least), or
 * `cp-1500` (at most). Equal bounds collapse to a single value.
 */
export function formatRange(prefix: string, range: NumberRange | undefined): string | null {
  const low = range?.min.trim() ?? '';
  const high = range?.max.trim() ?? '';
  if (!low && !high) return null;
  if (low && high) return low === high ? `${prefix}${low}` : `${prefix}${low}-${high}`;
  return low ? `${prefix}${low}-` : `${prefix}-${high}`;
}

function formatStat(stat: StatName, [min, max]: StatRange): string | null {
  if (min === FULL_STAT_RANGE[0] && max === FULL_STAT_RANGE[1]) return null;
  return min === max ? `${min}${stat}` : `${min}-${max}${stat}`;
}

/**
 * Builds a Pokémon GO storage search string. In-game, `,` (OR) binds tighter
 * than `&` (AND), so each group's included terms form one OR group and every
 * excluded term becomes its own `!term` group.
 *
 * @param state The builder selections.
 * @param groups Term keywords grouped by category, in display order.
 * @param rangeKeys Range fields, in display order.
 */
export function buildSearchString(
  state: SearchStringState,
  groups: SearchTermGroup[],
  rangeKeys: RangeKey[]
): string {
  const parts: string[] = [];
  const addOrGroup = (terms: string[]) => {
    if (terms.length > 0) parts.push(terms.join(','));
  };

  addOrGroup(parsePokemonTokens(state.pokemon, state.includeFamily));
  addOrGroup(splitList(state.tags).map((tag) => `#${tag.replace(/^#/, '')}`));

  groups.forEach(({ keywords, slotted }) => {
    const format = (keyword: string) => (slotted ? withMoveSlot(keyword, state.moveSlot) : keyword);
    addOrGroup(keywords.filter((keyword) => state.terms[keyword] === 'include').map(format));
    keywords
      .filter((keyword) => state.terms[keyword] === 'exclude')
      .forEach((keyword) => parts.push(`!${format(keyword)}`));
  });

  addOrGroup(
    splitList(state.moveNames).map((move) => withMoveSlot(`@${move.replace(/^@/, '')}`, state.moveSlot))
  );

  rangeKeys.forEach((key) => {
    const term = formatRange(key, state.ranges[key]);
    if (term) parts.push(term);
  });

  STAT_NAMES.forEach((stat) => {
    const term = formatStat(stat, state.stats[stat]);
    if (term) parts.push(term);
  });

  const custom = state.custom.trim();
  if (custom) parts.push(custom);

  return parts.join('&');
}

/**
 * Cycles a term through unselected, include, and exclude.
 */
export function nextTermState(current: TermState | undefined): TermState | undefined {
  if (current === undefined) return 'include';
  if (current === 'include') return 'exclude';
  return undefined;
}

/**
 * Builds a search string matching any of the given Pokédex numbers. Numbers
 * work in every game language, unlike species names and keywords.
 */
export function buildDexSearchString(dexNumbers: Iterable<number>): string {
  return Array.from(new Set(dexNumbers))
    .sort((a, b) => a - b)
    .join(',');
}
