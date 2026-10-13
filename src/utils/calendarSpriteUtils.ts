import type { CalendarEvent, EventPokemon } from '../types/events';

export const MAX_ROTATING_SPRITES = 6;

export type CalendarSprite = EventPokemon & { asset_url: string };

type PokemonField = 'features' | 'raids' | 'spawns';

function getPokemonList(event: CalendarEvent, field: PokemonField): EventPokemon[] {
  const value = event.extendedProps[field];
  if (!Array.isArray(value)) return [];

  return value as EventPokemon[];
}

function withAssets(pokemon: EventPokemon[]): CalendarSprite[] {
  return pokemon.filter(
    (item): item is CalendarSprite =>
      typeof item.asset_url === 'string' && item.asset_url.trim().length > 0
  );
}

export function getCalendarSprites(event: CalendarEvent): CalendarSprite[] {
  const features = getPokemonList(event, 'features');
  if (features.length > 0) {
    return features.length <= MAX_ROTATING_SPRITES ? withAssets(features) : [];
  }

  const raids = getPokemonList(event, 'raids');
  if (raids.length > 0) {
    const canShowRaids =
      raids.length === 1 ||
      (event.extendedProps.category === 'Raid Battles' &&
        raids.length <= MAX_ROTATING_SPRITES);

    return canShowRaids ? withAssets(raids) : [];
  }

  const spawns = getPokemonList(event, 'spawns');
  return spawns.length === 1 ? withAssets(spawns) : [];
}
