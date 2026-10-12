import assert from 'node:assert/strict';
import test from 'node:test';
import { SEARCH_PRESETS, SEARCH_TERM_KEYWORDS } from '../src/config/searchTerms.ts';
import {
  EMPTY_SEARCH_STATE,
  buildDexSearchString,
  buildSearchString,
  nextTermState,
} from '../src/utils/searchString.ts';

const CATEGORIES = [
  ['shiny', 'lucky', 'shadow'],
  ['fire', 'water'],
];

test('builds an empty string when nothing is selected', () => {
  assert.equal(buildSearchString(EMPTY_SEARCH_STATE, CATEGORIES), '');
});

test('ORs included terms within a category and ANDs categories', () => {
  const state = {
    ...EMPTY_SEARCH_STATE,
    terms: { shiny: 'include', lucky: 'include', fire: 'include' } as const,
  };

  assert.equal(buildSearchString(state, CATEGORIES), 'shiny,lucky&fire');
});

test('negates each excluded term as its own group', () => {
  const state = {
    ...EMPTY_SEARCH_STATE,
    terms: { shiny: 'exclude', shadow: 'exclude', water: 'include' } as const,
  };

  assert.equal(buildSearchString(state, CATEGORIES), '!shiny&!shadow&water');
});

test('adds the family prefix to names but not dex numbers', () => {
  const state = {
    ...EMPTY_SEARCH_STATE,
    pokemon: 'Pikachu, 1-151; 25 , ',
    includeFamily: true,
  };

  assert.equal(buildSearchString(state, CATEGORIES), '+pikachu,1-151,25');
});

test('formats open and closed CP and IV stat ranges', () => {
  const state = {
    ...EMPTY_SEARCH_STATE,
    cpMax: '1500',
    stats: { attack: [0, 1], defense: [4, 4], hp: [0, 4] } as typeof EMPTY_SEARCH_STATE.stats,
    custom: ' age0-7 ',
  };

  assert.equal(buildSearchString(state, CATEGORIES), 'cp-1500&0-1attack&4defense&age0-7');
  assert.equal(buildSearchString({ ...EMPTY_SEARCH_STATE, cpMin: '2500' }, CATEGORIES), 'cp2500-');
  assert.equal(
    buildSearchString({ ...EMPTY_SEARCH_STATE, cpMin: '10', cpMax: '500' }, CATEGORIES),
    'cp10-500'
  );
});

test('cycles a term through include, exclude, and unselected', () => {
  assert.equal(nextTermState(undefined), 'include');
  assert.equal(nextTermState('include'), 'exclude');
  assert.equal(nextTermState('exclude'), undefined);
});

test('builds the documented preset strings', () => {
  const build = (label: string) =>
    buildSearchString(
      {
        ...EMPTY_SEARCH_STATE,
        ...SEARCH_PRESETS.find((preset) => preset.label === label)!.state,
      },
      SEARCH_TERM_KEYWORDS
    );

  assert.equal(build('Hundos'), '4*');
  assert.equal(build('Nundos'), '0attack&0defense&0hp');
  assert.equal(build('Great League IVs'), 'cp-1500&0-1attack&3-4defense&3-4hp');
  assert.equal(build('Trade evolutions'), 'tradeevolve&!traded');
  assert.equal(
    build('Transfer candidates'),
    '0*,1*,2*&!shiny&!lucky&!shadow&!legendary&!mythical&!ultrabeasts&!costume&!background&!favorite&!xxs&!xxl'
  );
});

test('uses each search keyword only once', () => {
  const keywords = SEARCH_TERM_KEYWORDS.flat();
  assert.equal(new Set(keywords).size, keywords.length);
});

test('builds a sorted, de-duplicated dex number search', () => {
  assert.equal(buildDexSearchString([570, 25, 104, 25]), '25,104,570');
  assert.equal(buildDexSearchString([]), '');
});
