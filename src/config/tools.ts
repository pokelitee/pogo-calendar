import { MapPin, Search, type LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';

export interface ToolDefinition {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export const TOOLS: ToolDefinition[] = [
  {
    label: 'Search String Builder',
    description: 'Build a Pokémon storage search string from every filter the game supports, then copy it.',
    path: ROUTES.SEARCH_STRING_BUILDER,
    icon: Search,
  },
  {
    label: 'Pokémon Finder',
    description: 'See every current event, raid, egg, research task, and Rocket encounter that offers a Pokémon.',
    path: ROUTES.POKEMON_FINDER,
    icon: MapPin,
  },
];
