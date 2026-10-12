import type {
  RangeKey,
  SearchStringState,
  SearchTermGroup,
  TermState,
} from '../utils/searchString';

export interface SearchTerm {
  keyword: string;
  label: string;
}

export interface SearchTermCategory {
  id: string;
  title: string;
  terms: SearchTerm[];
  slotted?: boolean;
}

export interface SearchRangeField {
  key: RangeKey;
  label: string;
  hint: string;
}

export type SearchSectionField = 'pokemon' | 'tags' | 'stats' | 'moveSlot' | 'moveNames' | 'custom';

export interface SearchSection {
  id: string;
  title: string;
  description: string;
  fields: SearchSectionField[];
  categories: string[];
  ranges: RangeKey[];
}

const term = (keyword: string, label = keyword): SearchTerm => ({ keyword, label });

const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
];

// Pokémon GO's English storage search keywords, from Niantic's help article
// "Searching and filtering your Pokémon inventory" and Serebii's search term
// list. The game localizes them, so they only work in English.
export const SEARCH_TERM_CATEGORIES: SearchTermCategory[] = [
  {
    id: 'appraisal',
    title: 'Appraisal',
    terms: [
      term('0*', '0★'),
      term('1*', '1★'),
      term('2*', '2★'),
      term('3*', '3★'),
      term('4*', '4★ (hundo)'),
    ],
  },
  {
    id: 'variant',
    title: 'Variant',
    terms: [
      term('shiny', 'Shiny'),
      term('lucky', 'Lucky'),
      term('shadow', 'Shadow'),
      term('purified', 'Purified'),
      term('costume', 'Costume'),
      term('dynamax', 'Dynamax'),
      term('gigantamax', 'Gigantamax'),
      term('fusion', 'Fusion'),
      term('adventureeffect', 'Adventure effect'),
    ],
  },
  {
    id: 'background',
    title: 'Background',
    terms: [
      term('background', 'Any background'),
      term('locationbackground', 'Location background'),
      term('specialbackground', 'Special background'),
    ],
  },
  {
    id: 'classification',
    title: 'Classification',
    terms: [
      term('legendary', 'Legendary'),
      term('mythical', 'Mythical'),
      term('ultrabeast', 'Ultra Beast'),
      term('eggsonly', 'Baby (eggs only)'),
    ],
  },
  {
    id: 'type',
    title: 'Pokémon type',
    terms: POKEMON_TYPES.map((type) => term(type.toLowerCase(), type)),
  },
  {
    id: 'region',
    title: 'Region',
    terms: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'].map(
      (region) => term(region.toLowerCase(), region)
    ),
  },
  {
    id: 'moveType',
    title: 'Move type',
    slotted: true,
    terms: POKEMON_TYPES.map((type) => term(`@${type.toLowerCase()}`, type)),
  },
  {
    id: 'moveStatus',
    title: 'Move status',
    terms: [term('@special', 'Legacy or event move'), term('@weather', 'Weather boosted')],
  },
  {
    id: 'superEffective',
    title: 'Has a move super effective against',
    terms: POKEMON_TYPES.map((type) => term(`>${type.toLowerCase()}`, type)),
  },
  {
    id: 'evolution',
    title: 'Evolution',
    terms: [
      term('evolve', 'Can evolve'),
      term('evolvenew', 'New Pokédex entry'),
      term('evolvequest', 'Quest evolution'),
      term('tradeevolve', 'Trade evolution'),
      term('item', 'Item evolution'),
      term('megaevolve', 'Can Mega Evolve'),
    ],
  },
  {
    id: 'training',
    title: 'Training',
    terms: [term('hypertraining', 'Hyper Training'), term('candyxl', 'Above level 40')],
  },
  {
    id: 'origin',
    title: 'Caught from',
    terms: [
      term('traded', 'Traded'),
      term('hatched', 'Hatched'),
      term('research', 'Research'),
      term('raid', 'Raid'),
      term('remoteraid', 'Remote raid'),
      term('megaraid', 'Mega raid'),
      term('primalraid', 'Primal raid'),
      term('exraid', 'EX raid'),
      term('rocket', 'Team GO Rocket'),
      term('gbl', 'GO Battle League'),
      term('snapshot', 'Snapshot'),
      term('party', 'Party'),
    ],
  },
  {
    id: 'status',
    title: 'Status',
    terms: [term('favorite', 'Favorite'), term('defender', 'Gym defender')],
  },
  {
    id: 'size',
    title: 'Size',
    terms: [term('xxs', 'XXS'), term('xs', 'XS'), term('xl', 'XL'), term('xxl', 'XXL')],
  },
  {
    id: 'gender',
    title: 'Gender',
    terms: [term('male', 'Male'), term('female', 'Female'), term('genderunknown', 'Unknown')],
  },
];

export const SEARCH_RANGE_FIELDS: SearchRangeField[] = [
  { key: 'cp', label: 'CP', hint: 'Combat Power' },
  { key: 'hp', label: 'HP', hint: 'Maximum HP' },
  { key: 'mega', label: 'Mega level', hint: '0 (never) to 3 (max)' },
  { key: 'year', label: 'Year caught', hint: 'For example 2016' },
  { key: 'age', label: 'Age (days)', hint: '0 is caught today' },
  { key: 'distance', label: 'Distance (km)', hint: 'From where it was caught' },
  { key: 'buddy', label: 'Buddy level', hint: '0 (never) to 5 (best)' },
  { key: 'count', label: 'Owned of the species', hint: 'How many you have' },
  { key: 'countcandy', label: 'Candy', hint: 'Candy for the species' },
  { key: 'countcandyxl', label: 'XL Candy', hint: 'XL Candy for the species' },
  { key: 'candykm', label: 'Buddy Candy distance (km)', hint: '1, 3, 5, or 20' },
];

export const SEARCH_SECTIONS: SearchSection[] = [
  {
    id: 'pokemon',
    title: 'Pokémon',
    description: 'Names, Pokédex numbers, families, and tags.',
    fields: ['pokemon', 'tags'],
    categories: [],
    ranges: [],
  },
  {
    id: 'stats',
    title: 'Appraisal & Stats',
    description: 'Star rating, IV bars, CP, and HP.',
    fields: ['stats'],
    categories: ['appraisal'],
    ranges: ['cp', 'hp'],
  },
  {
    id: 'attributes',
    title: 'Variants & Classification',
    description: 'Shiny, shadow, costumes, backgrounds, legendaries, and more.',
    fields: [],
    categories: ['variant', 'background', 'classification'],
    ranges: [],
  },
  {
    id: 'typing',
    title: 'Types & Regions',
    description: 'Pokémon type and native region.',
    fields: [],
    categories: ['type', 'region'],
    ranges: [],
  },
  {
    id: 'moves',
    title: 'Moves',
    description: 'Move types, specific moves, legacy moves, and matchups.',
    fields: ['moveSlot', 'moveNames'],
    categories: ['moveType', 'moveStatus', 'superEffective'],
    ranges: [],
  },
  {
    id: 'evolution',
    title: 'Evolution & Training',
    description: 'Evolution options, Mega level, and Hyper Training.',
    fields: [],
    categories: ['evolution', 'training'],
    ranges: ['mega'],
  },
  {
    id: 'origin',
    title: 'Origin',
    description: 'How, when, and how far away it was caught.',
    fields: [],
    categories: ['origin'],
    ranges: ['year', 'age', 'distance'],
  },
  {
    id: 'status',
    title: 'Status, Size & Gender',
    description: 'Favorites, gym defenders, buddies, size class, and gender.',
    fields: [],
    categories: ['status', 'size', 'gender'],
    ranges: ['buddy'],
  },
  {
    id: 'inventory',
    title: 'Inventory Counts',
    description: 'How many you own, Candy, and buddy Candy distance.',
    fields: [],
    categories: [],
    ranges: ['count', 'countcandy', 'countcandyxl', 'candykm'],
  },
  {
    id: 'other',
    title: 'Other Terms',
    description: 'Anything else, added as-is.',
    fields: ['custom'],
    categories: [],
    ranges: [],
  },
];

export const SEARCH_TERM_GROUPS: SearchTermGroup[] = SEARCH_TERM_CATEGORIES.map(({ terms, slotted }) => ({
  keywords: terms.map(({ keyword }) => keyword),
  slotted,
}));

export const SEARCH_RANGE_KEYS: RangeKey[] = SEARCH_RANGE_FIELDS.map(({ key }) => key);

export interface SearchPreset {
  label: string;
  description: string;
  // Applied on top of an empty builder state.
  state: Partial<SearchStringState>;
}

const withTerms = (
  terms: Record<string, TermState>,
  overrides: Partial<SearchStringState> = {}
): Partial<SearchStringState> => ({ ...overrides, terms });

const KEEPER_EXCLUSIONS: Record<string, TermState> = {
  shiny: 'exclude',
  lucky: 'exclude',
  shadow: 'exclude',
  legendary: 'exclude',
  mythical: 'exclude',
  ultrabeast: 'exclude',
  costume: 'exclude',
  background: 'exclude',
  favorite: 'exclude',
  xxs: 'exclude',
  xxl: 'exclude',
};

export const SEARCH_PRESETS: SearchPreset[] = [
  {
    label: 'Transfer candidates',
    description: '0–2★ Pokémon that are not shiny, lucky, shadow, legendary, costumed, or favorited.',
    state: withTerms({ '0*': 'include', '1*': 'include', '2*': 'include', ...KEEPER_EXCLUSIONS }),
  },
  {
    label: 'Hundos',
    description: 'Perfect 15/15/15 Pokémon.',
    state: withTerms({ '4*': 'include' }),
  },
  {
    label: 'Nundos',
    description: 'Zero-IV 0/0/0 Pokémon.',
    state: withTerms({}, { stats: { attack: [0, 0], defense: [0, 0], hp: [0, 0] } }),
  },
  {
    label: 'Great League IVs',
    description: 'Low attack, high defense and HP, at or under 1,500 CP.',
    state: withTerms(
      {},
      { ranges: { cp: { min: '', max: '1500' } }, stats: { attack: [0, 1], defense: [3, 4], hp: [3, 4] } }
    ),
  },
  {
    label: 'Trade evolutions',
    description: 'Untraded Pokémon that evolve for free after a trade.',
    state: withTerms({ tradeevolve: 'include', traded: 'exclude' }),
  },
  {
    label: 'New Pokédex entries',
    description: 'Evolutions that would register a new Pokédex entry.',
    state: withTerms({ evolvenew: 'include' }),
  },
  {
    label: 'Legacy moves',
    description: 'Pokémon knowing a move they can no longer learn.',
    state: withTerms({ '@special': 'include' }),
  },
];
