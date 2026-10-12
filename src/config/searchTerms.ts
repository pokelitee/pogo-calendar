import type { SearchStringState, TermState } from '../utils/searchString';

export interface SearchTerm {
  keyword: string;
  label: string;
}

export interface SearchTermCategory {
  id: string;
  title: string;
  description: string;
  terms: SearchTerm[];
}

const term = (keyword: string, label = keyword): SearchTerm => ({ keyword, label });

const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
];

// Pokémon GO's English storage search keywords. The game localizes these, so
// they only work with the game language set to English.
export const SEARCH_TERM_CATEGORIES: SearchTermCategory[] = [
  {
    id: 'appraisal',
    title: 'Appraisal',
    description: 'Star rating from the in-game appraisal.',
    terms: [
      term('0*', '0★'),
      term('1*', '1★'),
      term('2*', '2★'),
      term('3*', '3★'),
      term('4*', '4★ (hundo)'),
    ],
  },
  {
    id: 'special',
    title: 'Special',
    description: 'Rare variants and classifications.',
    terms: [
      term('shiny', 'Shiny'),
      term('lucky', 'Lucky'),
      term('shadow', 'Shadow'),
      term('purified', 'Purified'),
      term('legendary', 'Legendary'),
      term('mythical', 'Mythical'),
      term('ultrabeasts', 'Ultra Beasts'),
      term('costume', 'Costume'),
      term('background', 'Any background'),
      term('locationbackground', 'Location background'),
      term('specialbackground', 'Special background'),
      term('dynamax', 'Dynamax'),
      term('gigantamax', 'Gigantamax'),
    ],
  },
  {
    id: 'evolution',
    title: 'Evolution',
    description: 'Evolution options for Pokémon you own.',
    terms: [
      term('evolve', 'Can evolve'),
      term('evolvenew', 'Evolves into a new Pokédex entry'),
      term('tradeevolve', 'Trade evolution'),
      term('item', 'Item evolution'),
      term('megaevolve', 'Can Mega Evolve'),
      term('eggsonly', 'Baby (eggs only)'),
    ],
  },
  {
    id: 'origin',
    title: 'Origin',
    description: 'How the Pokémon was obtained.',
    terms: [
      term('traded', 'Traded'),
      term('hatched', 'Hatched'),
      term('research', 'Research'),
      term('raid', 'Raid'),
      term('exraid', 'EX Raid'),
      term('gbl', 'GO Battle League'),
      term('snapshot', 'Snapshot'),
    ],
  },
  {
    id: 'status',
    title: 'Status',
    description: 'Flags you set or that change in play.',
    terms: [term('favorite', 'Favorite'), term('defender', 'Gym defender')],
  },
  {
    id: 'size',
    title: 'Size',
    description: 'Size class shown on the Pokémon.',
    terms: [term('xxs', 'XXS'), term('xs', 'XS'), term('xl', 'XL'), term('xxl', 'XXL')],
  },
  {
    id: 'gender',
    title: 'Gender',
    description: 'Gender of the Pokémon.',
    terms: [term('male', 'Male'), term('female', 'Female'), term('genderunknown', 'Unknown')],
  },
  {
    id: 'type',
    title: 'Pokémon Type',
    description: 'Matches either of the Pokémon’s types.',
    terms: POKEMON_TYPES.map((type) => term(type.toLowerCase(), type)),
  },
  {
    id: 'moveType',
    title: 'Move Type',
    description: 'Has a fast or charged move of this type.',
    terms: POKEMON_TYPES.map((type) => term(`@${type.toLowerCase()}`, type)),
  },
  {
    id: 'region',
    title: 'Region',
    description: 'Region the species is native to.',
    terms: [
      'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea',
    ].map((region) => term(region.toLowerCase(), region)),
  },
];

export const SEARCH_TERM_KEYWORDS: string[][] = SEARCH_TERM_CATEGORIES.map((category) =>
  category.terms.map(({ keyword }) => keyword)
);

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
  ultrabeasts: 'exclude',
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
    state: withTerms({}, { cpMax: '1500', stats: { attack: [0, 1], defense: [3, 4], hp: [3, 4] } }),
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
];
