import assert from 'node:assert/strict';
import test from 'node:test';
import {
  POKEMON_TYPES,
  TYPE_CHART,
  buildCounterSearches,
  formatMultiplier,
  getDefensiveMatchups,
  getEffectiveness,
  getWeaknesses,
  parseTypeList,
} from '../src/utils/typeMatchups.ts';

test('matches the standard chart totals', () => {
  const count = (key: 'superEffective' | 'notVeryEffective' | 'immune') =>
    POKEMON_TYPES.reduce((total, type) => total + TYPE_CHART[type][key].length, 0);

  assert.equal(count('superEffective'), 51);
  assert.equal(count('notVeryEffective'), 61);
  assert.equal(count('immune'), 8);
});

test('lists each defending type at most once per attacking type', () => {
  POKEMON_TYPES.forEach((type) => {
    const { superEffective, notVeryEffective, immune } = TYPE_CHART[type];
    const all = [...superEffective, ...notVeryEffective, ...immune];
    assert.equal(new Set(all).size, all.length, type);
  });
});

test('applies Pokémon GO multipliers to single and dual types', () => {
  assert.equal(getEffectiveness('Fire', ['Grass']), 1.6);
  assert.equal(getEffectiveness('Water', ['Grass']), 0.625);
  assert.equal(getEffectiveness('Ground', ['Flying']), 0.390625);
  assert.equal(getEffectiveness('Normal', ['Normal']), 1);
  // Gyarados (Water/Flying) takes double-super-effective Electric damage.
  assert.equal(getEffectiveness('Electric', ['Water', 'Flying']), 2.56);
  // Ferrothorn (Grass/Steel) takes double-super-effective Fire damage.
  assert.equal(getEffectiveness('Fire', ['Grass', 'Steel']), 2.56);
  // Ghost vs Normal/Ghost: immune times super effective.
  assert.equal(getEffectiveness('Ghost', ['Normal', 'Ghost']), 0.625);
});

test('groups attacking types by multiplier, strongest first', () => {
  const groups = getDefensiveMatchups(['Water', 'Flying']);

  assert.deepEqual(groups[0], { multiplier: 2.56, types: ['Electric'] });
  assert.deepEqual(groups[1], { multiplier: 1.6, types: ['Rock'] });
  assert.equal(groups.reduce((total, { types }) => total + types.length, 0), POKEMON_TYPES.length);
  assert.deepEqual(groups.at(-1), { multiplier: 0.390625, types: ['Ground'] });
});

test('lists weaknesses strongest first', () => {
  assert.deepEqual(getWeaknesses(['Water', 'Flying']), ['Electric', 'Rock']);
  assert.deepEqual(getWeaknesses(['Ghost']), ['Ghost', 'Dark']);
  assert.deepEqual(getWeaknesses(['Normal']), ['Fighting']);
});

test('formats multipliers to two decimals', () => {
  assert.equal(formatMultiplier(2.56), '×2.56');
  assert.equal(formatMultiplier(1.6), '×1.6');
  assert.equal(formatMultiplier(0.390625), '×0.39');
});

test('builds counter searches for move types', () => {
  assert.deepEqual(buildCounterSearches(['Electric', 'Rock']), {
    anyMove: '@electric,@rock',
    fastAndCharged: '@1electric,@1rock&@2electric,@3electric,@2rock,@3rock',
  });
  assert.deepEqual(buildCounterSearches([]), { anyMove: '', fastAndCharged: '' });
});

test('parses distinct known types, at most two', () => {
  assert.deepEqual(parseTypeList('Water,Flying'), ['Water', 'Flying']);
  assert.deepEqual(parseTypeList('Fire,Fire'), ['Fire']);
  assert.deepEqual(parseTypeList('Fire,Banana,Water,Grass'), ['Fire', 'Water']);
  assert.deepEqual(parseTypeList(null), []);
});
