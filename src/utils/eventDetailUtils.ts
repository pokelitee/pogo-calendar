const POKEMON_FIELD_TITLES: Record<string, string> = {
  features: 'Featured Pokémon',
  spawns: 'Wild Encounters',
  raids: 'Raid Battles',
  eggs: 'Egg Hatches',
  shiny: 'Available Shinies',
  shadow: 'Available Shadows',
  moves: 'Special Moves',
};

/**
 * Returns the display title for an event detail field such as `spawns`.
 */
export function getPokemonFieldTitle(fieldName: string): string {
  if (fieldName in POKEMON_FIELD_TITLES) {
    return POKEMON_FIELD_TITLES[fieldName];
  }
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
