import { MapPin, Search, Swords, type LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';

export interface ToolDefinition {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const TOOLS: ToolDefinition[] = [
  {
    label: 'Search String Builder',
    path: ROUTES.SEARCH_STRING_BUILDER,
    icon: Search,
  },
  {
    label: 'Pokémon Finder',
    path: ROUTES.POKEMON_FINDER,
    icon: MapPin,
  },
  {
    label: 'Type Matchups',
    path: ROUTES.TYPE_MATCHUPS,
    icon: Swords,
  },
];
