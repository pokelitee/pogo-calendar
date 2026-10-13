import assert from 'node:assert/strict';
import test from 'node:test';
import type { CalendarEvent } from '../src/types/events.ts';
import {
  collectNewsItems,
  findNewItems,
  updateSnapshot,
  type NewsData,
} from '../src/utils/whatsNew.ts';

const EMPTY: NewsData = { events: null, raidBosses: null, eggPool: null, researchTasks: null, rocketLineups: null };

const event = (id: string): CalendarEvent => ({
  title: `Event ${id}`,
  start: '2026-10-12T10:00:00',
  end: '2026-10-13T10:00:00',
  extendedProps: { category: 'Event', article_url: id, banner_url: '' },
});

const boss = (name: string) => ({
  name,
  tier: '5-Star Raids',
  shiny_available: false,
  is_shadow: false,
  cp_range: null,
  boosted_cp_range: null,
  types: ['Dragon'],
  asset_url: null,
});

test('collects items only for data sets that loaded', () => {
  const items = collectNewsItems({ ...EMPTY, events: [event('a')], raidBosses: { '5-Star Raids': [boss('Dialga')] } });

  assert.deepEqual(Object.keys(items).sort(), ['event', 'raid']);
  assert.equal(items.raid?.[0].id, '5-Star Raids|Dialga');
});

test('treats a changed Rocket lineup as new', () => {
  const lineup = (name: string) => ({
    ...EMPTY,
    rocketLineups: {
      Cliff: [{ slot: 1, pokemons: [{ name, shiny_available: false, asset_url: null }], is_encounter: true }],
    },
  });
  const seen = updateSnapshot({}, collectNewsItems(lineup('Cubone')));

  assert.deepEqual(findNewItems(collectNewsItems(lineup('Cubone')), seen), []);
  assert.deepEqual(
    findNewItems(collectNewsItems(lineup('Grimer')), seen).map(({ title, detail }) => [title, detail]),
    [['Cliff', 'Slot 1: Grimer']]
  );
});

test('finds items missing from the snapshot, but only for kinds with a baseline', () => {
  const items = collectNewsItems({ ...EMPTY, events: [event('a'), event('b')], raidBosses: { '5-Star Raids': [boss('Palkia')] } });

  assert.deepEqual(
    findNewItems(items, { event: ['a'] }).map(({ id }) => id),
    ['b']
  );
});

test('keeps the previous snapshot for kinds that did not load', () => {
  const previous = { event: ['a'], raid: ['5-Star Raids|Dialga'] };
  const next = updateSnapshot(previous, collectNewsItems({ ...EMPTY, events: [event('b')] }));

  assert.deepEqual(next, { event: ['b'], raid: ['5-Star Raids|Dialga'] });
});
