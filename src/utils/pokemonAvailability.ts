import type { EggPoolData } from '../types/eggPool';
import type { GameDataKind } from '../types/gameData';
import type { EventPokemon } from '../types/events';
import type { RaidBossData } from '../types/raidBosses';
import type { ResearchTaskData } from '../types/researchTasks';
import type { RocketLineupData } from '../types/rocketLineup';
import type { EventTiming, TimedEvent } from './eventTimeUtils';

export const POKEMON_SOURCE_KIND_LABELS: Record<GameDataKind, string> = {
  event: 'Event',
  raid: 'Raid',
  egg: 'Egg',
  research: 'Research',
  rocket: 'Rocket',
};

export interface PokemonSource {
  kind: GameDataKind;
  // Raid tier, egg type, research task, Rocket member, or event title.
  group: string;
  // Event detail field key (spawns, raids, ...).
  detail?: string;
  timing?: EventTiming;
  shiny: boolean;
}

export interface PokemonAvailability {
  name: string;
  assetUrl: string | null;
  dexNumber: number | null;
  sources: PokemonSource[];
}

export interface AvailabilityData {
  eggPool?: EggPoolData | null;
  raidBosses?: RaidBossData | null;
  researchTasks?: ResearchTaskData | null;
  rocketLineups?: RocketLineupData | null;
  events?: TimedEvent[];
}

// Event fields that are not ways to obtain a Pokémon: `bonuses` is text,
// `moves` lists Pokémon that learn a special move, and `shiny` lists which
// shinies the event offers, mostly repeating its spawns or raids and sometimes
// naming Pokémon, like evolutions, that can't be obtained at the event itself.
const NON_SOURCE_EVENT_FIELDS = new Set(['bonuses', 'moves', 'shiny']);

// LeekDuck sprite filenames carry the Pokédex number in one of these forms:
// pm25.fCOSTUME.icon.png, pokemon_icon_551_00.png, poke_capture_0774_011_....png
const DEX_NUMBER_PATTERNS = [/\/pm(\d+)\./, /\/pokemon_icon_(\d+)_/, /\/poke_capture_(\d+)_/];

/**
 * Reads the Pokédex number from a LeekDuck sprite URL. Custom article images
 * (some costumed event Pokémon) carry no number and return null.
 */
export function getDexNumber(assetUrl: string | null | undefined): number | null {
  if (!assetUrl) return null;
  for (const pattern of DEX_NUMBER_PATTERNS) {
    const match = pattern.exec(assetUrl);
    if (match) return Number(match[1]);
  }
  return null;
}

/**
 * Lowercases and strips diacritics so "flabebe" matches "Flabébé".
 */
function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/**
 * Collects every place each Pokémon can currently be obtained, keyed by the
 * name shown in the data. Forms with distinct names (for example
 * "Galarian Meowth" and "Shadow Gastly") stay separate entries.
 */
export function buildPokemonAvailability(data: AvailabilityData): PokemonAvailability[] {
  const entries = new Map<string, PokemonAvailability>();

  const add = (
    pokemon: { name: string; asset_url: string | null; shiny_available?: boolean },
    source: Omit<PokemonSource, 'shiny'>
  ) => {
    let entry = entries.get(pokemon.name);
    if (!entry) {
      entry = { name: pokemon.name, assetUrl: null, dexNumber: null, sources: [] };
      entries.set(pokemon.name, entry);
    }
    entry.assetUrl ??= pokemon.asset_url;
    entry.dexNumber ??= getDexNumber(pokemon.asset_url);
    entry.sources.push({ ...source, shiny: pokemon.shiny_available === true });
  };

  data.events?.forEach(({ event, timing }) => {
    Object.entries(event.extendedProps).forEach(([field, value]) => {
      if (NON_SOURCE_EVENT_FIELDS.has(field) || !Array.isArray(value)) return;
      value.forEach((pokemon: string | EventPokemon) => {
        // Text-only sections hold plain strings without sprite or shiny data.
        if (typeof pokemon === 'string') return;
        add(pokemon, { kind: 'event', group: event.title, detail: field, timing });
      });
    });
  });

  Object.entries(data.raidBosses ?? {}).forEach(([tier, bosses]) =>
    bosses.forEach((boss) => add(boss, { kind: 'raid', group: tier }))
  );

  Object.entries(data.eggPool ?? {}).forEach(([eggType, pokemon]) =>
    pokemon.forEach((hatch) => add(hatch, { kind: 'egg', group: eggType }))
  );

  Object.values(data.researchTasks ?? {}).forEach((tasks) =>
    tasks.forEach((task) =>
      task.rewards
        .filter((reward) => reward.type === 'encounter')
        .forEach((reward) => add(reward, { kind: 'research', group: task.task }))
    )
  );

  // Only the encounter slot can be caught after a Rocket battle; the other
  // slots are battled but never obtained.
  Object.entries(data.rocketLineups ?? {}).forEach(([member, slots]) =>
    slots
      .filter((slot) => slot.is_encounter)
      .forEach((slot) =>
        slot.pokemons.forEach((pokemon) => add(pokemon, { kind: 'rocket', group: member }))
      )
  );

  return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export interface AvailabilityFilters {
  query: string;
  // Empty means every source kind.
  kinds: ReadonlySet<GameDataKind>;
  shinyOnly: boolean;
}

/**
 * Narrows entries by name (ignoring case and accents) and their sources by
 * kind and shiny eligibility, dropping Pokémon left with no sources. An empty
 * query keeps every name, so the result can be browsed.
 */
export function filterPokemonAvailability(
  entries: PokemonAvailability[],
  { query, kinds, shinyOnly }: AvailabilityFilters
): PokemonAvailability[] {
  const needle = normalizeSearchText(query);
  return entries.flatMap((entry) => {
    if (needle && !normalizeSearchText(entry.name).includes(needle)) return [];
    const sources = entry.sources.filter(
      (source) => (!shinyOnly || source.shiny) && (kinds.size === 0 || kinds.has(source.kind))
    );
    return sources.length > 0 ? [{ ...entry, sources }] : [];
  });
}
