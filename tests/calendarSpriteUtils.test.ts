import assert from 'node:assert/strict';
import test from 'node:test';
import type { CalendarEvent, EventPokemon } from '../src/types/events.ts';
import {
  getCalendarSprites,
  MAX_ROTATING_SPRITES,
} from '../src/utils/calendarSpriteUtils.ts';

function pokemon(name: string): EventPokemon {
  return {
    name,
    asset_url: `https://example.com/${name}.png`,
    shiny_available: false,
  };
}

function eventWith(
  category: string,
  details: Record<string, EventPokemon[]>
): CalendarEvent {
  return {
    title: 'Test event',
    start: '2026-08-01T10:00:00',
    end: '2026-08-01T11:00:00',
    extendedProps: {
      category,
      article_url: 'test-event',
      banner_url: '',
      ...details,
    },
  };
}

test('prioritizes up to six featured Pokémon over raids and spawns', () => {
  const features = [pokemon('One'), pokemon('Two')];
  const event = eventWith('Event', {
    features,
    raids: [pokemon('Raid')],
    spawns: [pokemon('Spawn')],
  });

  assert.deepEqual(getCalendarSprites(event), features);
});

test('suppresses feature groups above the shared rotation limit', () => {
  const features = Array.from({ length: MAX_ROTATING_SPRITES + 1 }, (_, index) =>
    pokemon(`Feature ${index}`)
  );
  const event = eventWith('Event', { features, raids: [pokemon('Raid')] });

  assert.deepEqual(getCalendarSprites(event), []);
});

test('rotates up to six bosses for dedicated Raid Battles events', () => {
  const raids = [pokemon('Regirock'), pokemon('Regice'), pokemon('Registeel')];

  assert.deepEqual(getCalendarSprites(eventWith('Raid Battles', { raids })), raids);
});

test('applies the shared rotation limit to dedicated Raid Battles events', () => {
  const allowedRaids = Array.from({ length: MAX_ROTATING_SPRITES }, (_, index) =>
    pokemon(`Raid ${index}`)
  );
  const excessRaids = [...allowedRaids, pokemon('Extra Raid')];

  assert.deepEqual(
    getCalendarSprites(eventWith('Raid Battles', { raids: allowedRaids })),
    allowedRaids
  );
  assert.deepEqual(
    getCalendarSprites(eventWith('Raid Battles', { raids: excessRaids })),
    []
  );
});

test('does not show multi-boss pools outside dedicated Raid Battles events', () => {
  const event = eventWith('Event', {
    raids: [pokemon('One'), pokemon('Two')],
    spawns: [pokemon('Spawn')],
  });

  assert.deepEqual(getCalendarSprites(event), []);
});

test('shows exactly one raid or spawn when higher-priority fields are absent', () => {
  const raid = pokemon('Raid');
  const spawn = pokemon('Spawn');

  assert.deepEqual(getCalendarSprites(eventWith('Event', { raids: [raid] })), [raid]);
  assert.deepEqual(getCalendarSprites(eventWith('Event', { spawns: [spawn] })), [spawn]);
  assert.deepEqual(
    getCalendarSprites(eventWith('Event', { spawns: [spawn, pokemon('Other')] })),
    []
  );
});

test('omits Pokémon without usable sprite assets', () => {
  const missingAsset = { ...pokemon('Missing'), asset_url: null };
  const blankAsset = { ...pokemon('Blank'), asset_url: '  ' };

  assert.deepEqual(getCalendarSprites(eventWith('Event', { features: [missingAsset] })), []);
  assert.deepEqual(getCalendarSprites(eventWith('Event', { raids: [blankAsset] })), []);
});
