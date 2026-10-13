import type { EggPoolData, EggPokemon } from '../types/eggPool';
import type { ApiEvent, EventPokemon } from '../types/events';
import type { DataManifest, ManifestFile } from '../types/manifest';
import type { CPRange, RaidBoss, RaidBossData } from '../types/raidBosses';
import type {
  ResearchTask,
  ResearchTaskData,
  TaskReward,
} from '../types/researchTasks';
import type {
  RocketLineupData,
  RocketPokemon,
  RocketSlot,
} from '../types/rocketLineup';

type JsonRecord = Record<string, unknown>;

function fail(path: string, expectation: string): never {
  throw new Error(`Invalid data at ${path}: expected ${expectation}`);
}

function asRecord(value: unknown, path: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(path, 'an object');
  }
  return value as JsonRecord;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, 'an array');
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    fail(path, 'a non-empty string');
  }
  return value;
}

function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') fail(path, 'a boolean');
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'a finite number');
  }
  return value;
}

function asNullableString(value: unknown, path: string): string | null {
  return value === null ? null : asString(value, path);
}

function asNullableNumber(value: unknown, path: string): number | null {
  return value === null || value === undefined ? null : asNumber(value, path);
}

function asStringArray(value: unknown, path: string): string[] {
  return asArray(value, path).map((item, index) =>
    asString(item, `${path}[${index}]`)
  );
}

function parseSections<T>(
  value: unknown,
  label: string,
  parseItem: (item: unknown, path: string) => T
): Record<string, T[]> {
  const record = asRecord(value, label);
  return Object.fromEntries(
    Object.entries(record).map(([section, items]) => [
      section,
      asArray(items, `${label}.${section}`).map((item, index) =>
        parseItem(item, `${label}.${section}[${index}]`)
      ),
    ])
  );
}

function parsePokemonBase(value: unknown, path: string) {
  const item = asRecord(value, path);
  return {
    item,
    name: asString(item.name, `${path}.name`),
    shiny_available: asBoolean(
      item.shiny_available,
      `${path}.shiny_available`
    ),
    asset_url: asNullableString(item.asset_url, `${path}.asset_url`),
  };
}

function parseEggPokemon(value: unknown, path: string): EggPokemon {
  const base = parsePokemonBase(value, path);
  return {
    name: base.name,
    shiny_available: base.shiny_available,
    asset_url: base.asset_url,
    hatch_distance: asNullableNumber(
      base.item.hatch_distance,
      `${path}.hatch_distance`
    ),
    rarity_tier: asNullableNumber(
      base.item.rarity_tier,
      `${path}.rarity_tier`
    ),
  };
}

function parseCpRange(value: unknown, path: string): CPRange | null {
  if (value === null) return null;
  const range = asRecord(value, path);
  return {
    min: asNumber(range.min, `${path}.min`),
    max: asNumber(range.max, `${path}.max`),
  };
}

function parseRaidBoss(value: unknown, path: string): RaidBoss {
  const base = parsePokemonBase(value, path);
  const tier = base.item.tier;
  if (typeof tier !== 'string' && typeof tier !== 'number') {
    fail(`${path}.tier`, 'a string or number');
  }
  return {
    name: base.name,
    shiny_available: base.shiny_available,
    asset_url: base.asset_url,
    tier,
    is_shadow: asBoolean(base.item.is_shadow, `${path}.is_shadow`),
    cp_range: parseCpRange(base.item.cp_range, `${path}.cp_range`),
    boosted_cp_range: parseCpRange(
      base.item.boosted_cp_range,
      `${path}.boosted_cp_range`
    ),
    types: asStringArray(base.item.types, `${path}.types`),
  };
}

function parseReward(value: unknown, path: string): TaskReward {
  const reward = asRecord(value, path);
  const parsed: TaskReward = {
    type: asString(reward.type, `${path}.type`),
    name: asString(reward.name, `${path}.name`),
    asset_url: asNullableString(reward.asset_url, `${path}.asset_url`),
  };
  if (reward.quantity !== undefined) {
    parsed.quantity = asNumber(reward.quantity, `${path}.quantity`);
  }
  if (reward.shiny_available !== undefined) {
    parsed.shiny_available = asBoolean(
      reward.shiny_available,
      `${path}.shiny_available`
    );
  }
  if (reward.cp_range !== undefined) {
    parsed.cp_range = parseCpRange(reward.cp_range, `${path}.cp_range`);
  }
  return parsed;
}

function parseResearchTask(value: unknown, path: string): ResearchTask {
  const task = asRecord(value, path);
  return {
    task: asString(task.task, `${path}.task`),
    rewards: asArray(task.rewards, `${path}.rewards`).map((reward, index) =>
      parseReward(reward, `${path}.rewards[${index}]`)
    ),
  };
}

function parseRocketPokemon(value: unknown, path: string): RocketPokemon {
  const base = parsePokemonBase(value, path);
  return {
    name: base.name,
    shiny_available: base.shiny_available,
    asset_url: base.asset_url,
  };
}

function parseRocketSlot(value: unknown, path: string): RocketSlot {
  const slot = asRecord(value, path);
  return {
    slot: asNumber(slot.slot, `${path}.slot`),
    pokemons: asArray(slot.pokemons, `${path}.pokemons`).map((pokemon, index) =>
      parseRocketPokemon(pokemon, `${path}.pokemons[${index}]`)
    ),
    is_encounter: asBoolean(slot.is_encounter, `${path}.is_encounter`),
  };
}

function parseEventPokemon(value: unknown, path: string): EventPokemon {
  const base = parsePokemonBase(value, path);
  return {
    name: base.name,
    shiny_available: base.shiny_available,
    asset_url: base.asset_url,
  };
}

function parseEventDetails(
  value: unknown,
  path: string
): NonNullable<ApiEvent['details']> {
  const details = asRecord(value, path);
  // Bonuses are text; every other section lists Pokémon with a sprite and
  // shiny flag.
  return Object.fromEntries(
    Object.entries(details).map(([key, items]) => {
      if (key === 'bonuses') return [key, asStringArray(items, `${path}.${key}`)];
      return [
        key,
        asArray(items, `${path}.${key}`).map((item, index) =>
          parseEventPokemon(item, `${path}.${key}[${index}]`)
        ),
      ];
    })
  );
}

function parseApiEvent(
  value: unknown,
  path: string,
  category: string,
  allowMissingDescription: boolean
): ApiEvent {
  const event = asRecord(value, path);
  const isLocalTime = asBoolean(event.is_local_time, `${path}.is_local_time`);
  const parseTime = (time: unknown, timePath: string): string | number => {
    if (isLocalTime) return asString(time, timePath);
    const timestamp = asNumber(time, timePath);
    if (!Number.isInteger(timestamp)) fail(timePath, 'an integer Unix timestamp');
    return timestamp;
  };
  const eventCategory = asString(event.category, `${path}.category`);
  if (eventCategory !== category) {
    fail(`${path}.category`, `the enclosing category ${category}`);
  }
  return {
    title: asString(event.title, `${path}.title`),
    category: eventCategory,
    is_local_time: isLocalTime,
    start_time: parseTime(event.start_time, `${path}.start_time`),
    end_time: parseTime(event.end_time, `${path}.end_time`),
    article_url: asString(event.article_url, `${path}.article_url`),
    banner_url: asString(event.banner_url, `${path}.banner_url`),
    description:
      allowMissingDescription && event.description === undefined
        ? undefined
        : asString(event.description, `${path}.description`),
    details: parseEventDetails(event.details, `${path}.details`),
  };
}

function parseManifestFile(value: unknown, path: string): ManifestFile {
  const file = asRecord(value, path);
  const updatedAt = asString(file.updated_at, `${path}.updated_at`);
  if (Number.isNaN(new Date(updatedAt).getTime())) {
    fail(`${path}.updated_at`, 'an ISO 8601 timestamp');
  }
  return {
    sha256: asString(file.sha256, `${path}.sha256`),
    size: asNumber(file.size, `${path}.size`),
    updated_at: updatedAt,
  };
}

export const parseManifestData = (value: unknown): DataManifest => {
  const files = asRecord(asRecord(value, 'manifest').files, 'manifest.files');
  return {
    files: Object.fromEntries(
      Object.entries(files).map(([path, file]) => [
        path,
        parseManifestFile(file, `manifest.files.${path}`),
      ])
    ),
  };
};

export const parseEggPoolData = (value: unknown): EggPoolData =>
  parseSections(value, 'egg_pool', parseEggPokemon);

export const parseRaidBossData = (value: unknown): RaidBossData =>
  parseSections(value, 'raid_bosses', parseRaidBoss);

export const parseResearchTaskData = (value: unknown): ResearchTaskData =>
  parseSections(value, 'research_tasks', parseResearchTask);

export const parseRocketLineupData = (value: unknown): RocketLineupData =>
  parseSections(value, 'rocket_lineups', parseRocketSlot);

function parseEventSections(
  value: unknown,
  label: string,
  allowMissingDescription: boolean
): Record<string, ApiEvent[]> {
  const record = asRecord(value, label);
  return Object.fromEntries(
    Object.entries(record).map(([category, events]) => [
      category,
      asArray(events, `${label}.${category}`).map((event, index) =>
        parseApiEvent(
          event,
          `${label}.${category}[${index}]`,
          category,
          allowMissingDescription
        )
      ),
    ])
  );
}

/**
 * Parses freshly published events, which always carry a description.
 */
export const parseEventData = (value: unknown): Record<string, ApiEvent[]> =>
  parseEventSections(value, 'events', false);

/**
 * Parses a yearly event archive. Archived events whose source page has been
 * removed may omit `description`; every other field is parsed strictly.
 */
export const parseArchiveEventData = (
  value: unknown
): Record<string, ApiEvent[]> => parseEventSections(value, 'archive', true);
