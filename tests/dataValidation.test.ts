import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseArchiveEventData,
  parseEventData,
  parseManifestData,
  parseRaidBossData,
  parseResearchTaskData,
} from '../src/services/dataValidation.ts';

const apiEvent = (overrides: Record<string, unknown> = {}) => ({
  title: 'Example Event',
  category: 'Event',
  is_local_time: false,
  start_time: 1,
  end_time: 2,
  article_url: 'https://example.invalid/event',
  banner_url: 'https://example.invalid/banner.jpg',
  description: 'Event description.',
  details: {},
  ...overrides,
});

const withoutDescription = (overrides: Record<string, unknown> = {}) => {
  const event: Record<string, unknown> = apiEvent(overrides);
  delete event.description;
  return event;
};

test('accepts leak-duck resource rewards and nullable assets', () => {
  const parsed = parseResearchTaskData({
    Tasks: [
      {
        task: 'Power up a Pokémon',
        rewards: [
          {
            type: 'resource',
            name: 'Stardust',
            quantity: 500,
            asset_url: null,
          },
        ],
      },
    ],
  });

  assert.equal(parsed.Tasks[0].rewards[0].type, 'resource');
  assert.equal(parsed.Tasks[0].rewards[0].asset_url, null);
});

test('accepts string raid tiers and nullable CP ranges', () => {
  const parsed = parseRaidBossData({
    'Mega Raids': [
      {
        name: 'Mega Example',
        tier: 'Mega Raids',
        shiny_available: false,
        is_shadow: false,
        cp_range: null,
        boosted_cp_range: null,
        types: ['Water'],
        asset_url: null,
      },
    ],
  });

  assert.equal(parsed['Mega Raids'][0].tier, 'Mega Raids');
  assert.equal(parsed['Mega Raids'][0].cp_range, null);
});

test('requires the shadow flag on raid bosses', () => {
  const parsed = parseRaidBossData({
    '1-Star Raids': [
      {
        name: 'Shadow Example',
        tier: '1-Star Raids',
        shiny_available: false,
        is_shadow: true,
        cp_range: null,
        boosted_cp_range: null,
        types: ['Ghost'],
        asset_url: null,
      },
    ],
  });

  assert.equal(parsed['1-Star Raids'][0].is_shadow, true);
  assert.throws(
    () =>
      parseRaidBossData({
        '1-Star Raids': [{ ...parsed['1-Star Raids'][0], is_shadow: undefined }],
      }),
    /raid_bosses\.1-Star Raids\[0\]\.is_shadow/
  );
});

test('requires a description for current events', () => {
  assert.throws(
    () => parseEventData({ Event: [withoutDescription()] }),
    /events\.Event\[0\]\.description/
  );
});

test('keeps a missing description undefined in archives', () => {
  const parsed = parseArchiveEventData({ Event: [withoutDescription()] });

  assert.equal(parsed.Event[0].description, undefined);
  assert.equal(parsed.Event[0].title, 'Example Event');
});

test('rejects a non-string archive description', () => {
  assert.throws(
    () => parseArchiveEventData({ Event: [apiEvent({ description: 42 })] }),
    /archive\.Event\[0\]\.description/
  );
});

test('accepts both legacy and current Pokemon formats in archives', () => {
  const parsed = parseArchiveEventData({
    Event: [
      apiEvent({
        details: {
          bonuses: ['2x Stardust'],
          spawns: ['Zubat'],
          raids: [
            { name: 'Palkia', asset_url: null, shiny_available: true },
          ],
        },
      }),
    ],
  });

  assert.deepEqual(parsed.Event[0].details.spawns, ['Zubat']);
  assert.deepEqual(parsed.Event[0].details.raids, [
    { name: 'Palkia', asset_url: null, shiny_available: true },
  ]);
});

test('rejects malformed archive records other than the description', () => {
  assert.throws(
    () => parseArchiveEventData({ Event: [withoutDescription({ details: [] })] }),
    /archive\.Event\[0\]\.details/
  );
});

test('rejects malformed remote records with a useful path', () => {
  assert.throws(
    () =>
      parseResearchTaskData({
        Tasks: [{ task: 'Broken', rewards: [{ type: 'item' }] }],
      }),
    /research_tasks\.Tasks\[0\]\.rewards\[0\]\.name/
  );
});

test('parses manifest file entries', () => {
  const parsed = parseManifestData({
    files: {
      'events.json': {
        sha256: 'abc123',
        size: 1024,
        updated_at: '2026-10-12T17:30:07Z',
      },
    },
  });

  assert.equal(parsed.files['events.json'].updated_at, '2026-10-12T17:30:07Z');
});

test('rejects manifest entries with an invalid update time', () => {
  assert.throws(
    () =>
      parseManifestData({
        files: {
          'events.json': { sha256: 'abc123', size: 1024, updated_at: 'soon' },
        },
      }),
    /manifest\.files\.events\.json\.updated_at/
  );
});
