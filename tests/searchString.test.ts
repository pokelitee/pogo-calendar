import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SEARCH_PRESET_GROUPS,
  SEARCH_RANGE_FIELDS,
  SEARCH_RANGE_KEYS,
  SEARCH_SECTIONS,
  SEARCH_TERM_CATEGORIES,
  SEARCH_TERM_GROUPS,
} from '../src/config/searchTerms.ts';
import { POKEMON_TYPES } from '../src/utils/typeMatchups.ts';
import {
  EMPTY_SEARCH_STATE,
  buildDexSearchString,
  buildSearchString,
  formatRange,
  nextTermState,
  type SearchStringState,
} from '../src/utils/searchString.ts';

const SEARCH_PRESETS = SEARCH_PRESET_GROUPS.flatMap(({ presets }) => presets);

const GROUPS = [
  { keywords: ['shiny', 'lucky', 'shadow'] },
  { keywords: ['fire', 'water'] },
  { keywords: ['@fire', '@water'], slotted: true },
];

const build = (overrides: Partial<SearchStringState>) =>
  buildSearchString({ ...EMPTY_SEARCH_STATE, ...overrides }, GROUPS, ['cp', 'buddy']);

test('builds an empty string when nothing is selected', () => {
  assert.equal(build({}), '');
});

test('ORs included terms within a category and ANDs categories', () => {
  assert.equal(build({ terms: { shiny: 'include', lucky: 'include', fire: 'include' } }), 'shiny,lucky&fire');
});

test('negates each excluded term as its own group', () => {
  assert.equal(build({ terms: { shiny: 'exclude', shadow: 'exclude', water: 'include' } }), '!shiny&!shadow&water');
});

test('adds the family prefix to names but not dex numbers', () => {
  assert.equal(build({ pokemon: 'Pikachu, 1-151; 25 , ', includeFamily: true }), '+pikachu,1-151,25');
});

test('prefixes tags with # and move names with @', () => {
  assert.equal(build({ tags: 'battle, #trade', moveNames: 'Hyper Beam, @scratch' }), '#battle,#trade&@hyper beam,@scratch');
});

test('applies the move slot to move types and move names only', () => {
  assert.equal(
    build({ moveSlot: '3', terms: { '@fire': 'include', '@water': 'exclude', shiny: 'include' }, moveNames: 'shadow ball' }),
    'shiny&@3fire&!@3water&@3shadow ball'
  );
});

test('formats open, closed, and single-value ranges', () => {
  assert.equal(formatRange('cp', { min: '', max: '1500' }), 'cp-1500');
  assert.equal(formatRange('cp', { min: '2500', max: '' }), 'cp2500-');
  assert.equal(formatRange('cp', { min: '10', max: '500' }), 'cp10-500');
  assert.equal(formatRange('buddy', { min: '4', max: '4' }), 'buddy4');
  assert.equal(formatRange('cp', { min: ' ', max: '' }), null);
  assert.equal(formatRange('cp', undefined), null);
});

test('orders ranges and IV stats after keyword groups', () => {
  assert.equal(
    build({
      terms: { shiny: 'include' },
      ranges: { buddy: { min: '2', max: '5' }, cp: { min: '', max: '1500' } },
      stats: { attack: [0, 1], defense: [4, 4], hp: [0, 4] },
      custom: ' age0-7 ',
    }),
    'shiny&cp-1500&buddy2-5&0-1attack&4defense&age0-7'
  );
});

test('cycles a term through include, exclude, and unselected', () => {
  assert.equal(nextTermState(undefined), 'include');
  assert.equal(nextTermState('include'), 'exclude');
  assert.equal(nextTermState('exclude'), undefined);
});

test('builds the documented preset strings', () => {
  const preset = (label: string) =>
    buildSearchString(
      { ...EMPTY_SEARCH_STATE, ...SEARCH_PRESETS.find((p) => p.label === label)!.state },
      SEARCH_TERM_GROUPS,
      SEARCH_RANGE_KEYS
    );

  assert.equal(preset('Hundos'), '4*');
  assert.equal(preset('Nundos'), '0attack&0defense&0hp');
  assert.equal(preset('Great League IVs'), 'cp-1500&0-1attack&3-4defense&3-4hp');
  assert.equal(preset('Trade evolutions'), 'tradeevolve&!traded');
  assert.equal(preset('Legacy moves'), '@special');
  assert.equal(preset('Little Cup IVs'), 'cp-500&0-1attack&3-4defense&3-4hp');
  assert.equal(preset('Ultra League IVs'), 'cp-2500&0-1attack&3-4defense&3-4hp');
  assert.equal(preset('Master League IVs'), '3-4attack&3-4defense&3-4hp');
  assert.equal(preset('Lucky trade candidates'), '!lucky&!traded&year2016,year2017,year2018,year2019');
  assert.equal(preset('Max Battle Pokémon'), 'dynamax,gigantamax');
  assert.equal(
    preset("Today's catches to transfer"),
    '0*,1*,2*&!shiny&!lucky&!shadow&!costume&!background&!legendary&!mythical&!ultrabeast&!favorite&!xxs&!xxl&age0'
  );
  assert.equal(
    preset('Transfer candidates'),
    '0*,1*,2*&!shiny&!lucky&!shadow&!costume&!background&!legendary&!mythical&!ultrabeast&!favorite&!xxs&!xxl'
  );
});

test('gives every preset a unique label', () => {
  const labels = SEARCH_PRESETS.map(({ label }) => label);
  assert.equal(new Set(labels).size, labels.length);
});

test('uses each search keyword and range only once', () => {
  const keywords = SEARCH_TERM_GROUPS.flatMap(({ keywords }) => keywords);
  assert.equal(new Set(keywords).size, keywords.length);
  assert.equal(new Set(SEARCH_RANGE_KEYS).size, SEARCH_RANGE_KEYS.length);
});

test('places every category and range in exactly one existing section', () => {
  const sectionCategories = SEARCH_SECTIONS.flatMap(({ categories }) => categories);
  const sectionRanges = SEARCH_SECTIONS.flatMap(({ ranges }) => ranges);

  assert.deepEqual([...sectionCategories].sort(), SEARCH_TERM_CATEGORIES.map(({ id }) => id).sort());
  assert.deepEqual([...sectionRanges].sort(), SEARCH_RANGE_FIELDS.map(({ key }) => key).sort());
});

test('lists the same Pokémon types as the type chart', () => {
  const typeKeywords = SEARCH_TERM_CATEGORIES.find(({ id }) => id === 'type')!.terms.map(({ label }) => label);
  assert.deepEqual(typeKeywords, [...POKEMON_TYPES]);
});

test('builds a sorted, de-duplicated dex number search', () => {
  assert.equal(buildDexSearchString([570, 25, 104, 25]), '25,104,570');
  assert.equal(buildDexSearchString([]), '');
});
