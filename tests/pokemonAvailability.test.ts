import assert from 'node:assert/strict';
import test from 'node:test';
import type { CalendarEvent } from '../src/types/events.ts';
import {
  buildPokemonAvailability,
  getDexNumber,
  getShinyAvailability,
  searchPokemonAvailability,
} from '../src/utils/pokemonAvailability.ts';

const CDN = 'https://cdn.leekduck.com/assets/img/pokemon_icons';

const pokemon = (name: string, asset_url: string | null, shiny_available = false) => ({
  name,
  asset_url,
  shiny_available,
});

function event(title: string, details: CalendarEvent['extendedProps']): CalendarEvent {
  return {
    title,
    start: '2026-10-01T10:00:00',
    end: '2026-10-02T10:00:00',
    extendedProps: { ...details, category: 'Event', article_url: title, banner_url: '' },
  };
}

test('reads dex numbers from every LeekDuck sprite naming scheme', () => {
  assert.equal(getDexNumber(`${CDN}/pm25.fGLASS_HELMET_2026.icon.png`), 25);
  assert.equal(getDexNumber(`${CDN}_crop/pm104.icon.png`), 104);
  assert.equal(getDexNumber(`${CDN}/pokemon_icon_551_00.png`), 551);
  assert.equal(getDexNumber(`${CDN}/poke_capture_0774_011_uk_n_00000000_f_n.png`), 774);
  assert.equal(getDexNumber('https://cdn.leekduck.com/assets/img/events/pikachu-hat.png'), null);
  assert.equal(getDexNumber(null), null);
});

test('collects sources from every data set under one entry per name', () => {
  const entries = buildPokemonAvailability({
    events: [
      {
        event: event('Zorua Community Day', {
          spawns: [pokemon('Zorua', `${CDN}/pm570.icon.png`, true)],
          bonuses: ['Triple Stardust'],
          moves: [pokemon('Zoroark', `${CDN}/pm571.icon.png`)],
        }),
        timing: 'active',
      },
    ],
    raidBosses: {
      '1-Star Raids': [
        {
          ...pokemon('Zorua', `${CDN}/pm570.icon.png`),
          tier: '1-Star Raids',
          is_shadow: false,
          cp_range: null,
          boosted_cp_range: null,
          types: ['Dark'],
        },
      ],
    },
    eggPool: {
      '5 km Eggs': [
        { ...pokemon('Zorua', null), hatch_distance: 5, rarity_tier: 1 },
      ],
    },
    researchTasks: {
      'Catching Tasks': [
        {
          task: 'Catch 5 Pokémon',
          rewards: [
            { type: 'encounter', ...pokemon('Zorua', `${CDN}/pm570.icon.png`, true) },
            { type: 'item', name: 'Poké Ball', asset_url: null, quantity: 5 },
          ],
        },
      ],
    },
    rocketLineups: {
      Cliff: [
        { slot: 1, pokemons: [pokemon('Cubone', `${CDN}/pm104.icon.png`, true)], is_encounter: true },
        { slot: 2, pokemons: [pokemon('Snorlax', `${CDN}/pm143.icon.png`)], is_encounter: false },
      ],
    },
  });

  assert.deepEqual(
    entries.map(({ name }) => name),
    ['Cubone', 'Zorua']
  );
  const zorua = entries.find(({ name }) => name === 'Zorua')!;
  assert.equal(zorua.dexNumber, 570);
  assert.deepEqual(
    zorua.sources.map(({ kind, group, detail, timing, shiny }) => [kind, group, detail, timing, shiny]),
    [
      ['event', 'Zorua Community Day', 'spawns', 'active', true],
      ['raid', '1-Star Raids', undefined, undefined, false],
      ['egg', '5 km Eggs', undefined, undefined, false],
      ['research', 'Catch 5 Pokémon', undefined, undefined, true],
    ]
  );
});

test('ignores legacy string entries in event details', () => {
  const entries = buildPokemonAvailability({
    events: [{ event: event('Old Event', { spawns: ['Pidgey'] }), timing: 'upcoming' }],
  });

  assert.deepEqual(entries, []);
});

test('searches names ignoring case and accents', () => {
  const entries = buildPokemonAvailability({
    eggPool: {
      '5 km Eggs': [
        { ...pokemon('Flabébé', null), hatch_distance: 5, rarity_tier: 1 },
        { ...pokemon('Galarian Meowth', null), hatch_distance: 5, rarity_tier: 1 },
      ],
    },
  });

  assert.deepEqual(searchPokemonAvailability(entries, 'FLABEBE').map(({ name }) => name), ['Flabébé']);
  assert.deepEqual(searchPokemonAvailability(entries, 'meow').map(({ name }) => name), ['Galarian Meowth']);
  assert.deepEqual(searchPokemonAvailability(entries, '  '), []);
});

test('keeps only shiny sources, optionally for some source kinds', () => {
  const entries = buildPokemonAvailability({
    eggPool: {
      '5 km Eggs': [
        { ...pokemon('Zorua', null, true), hatch_distance: 5, rarity_tier: 1 },
        { ...pokemon('Pidgey', null, false), hatch_distance: 5, rarity_tier: 1 },
      ],
    },
    rocketLineups: {
      Cliff: [{ slot: 1, pokemons: [pokemon('Zorua', null, false)], is_encounter: true }],
    },
  });

  const shiny = getShinyAvailability(entries);
  assert.deepEqual(shiny.map(({ name }) => name), ['Zorua']);
  assert.deepEqual(shiny[0].sources.map(({ kind }) => kind), ['egg']);
  assert.deepEqual(getShinyAvailability(entries, new Set(['rocket'])), []);
  assert.deepEqual(getShinyAvailability(entries, new Set()).map(({ name }) => name), ['Zorua']);
});
