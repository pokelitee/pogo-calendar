import type { GameDataKind } from '../types/gameData';
import { ROUTES } from './routes';

export const GAME_DATA_PAGES: Record<GameDataKind, { title: string; path: string }> = {
  event: { title: 'Events', path: ROUTES.CALENDAR },
  raid: { title: 'Raid Bosses', path: ROUTES.RAID_BOSSES },
  egg: { title: 'Egg Pool', path: ROUTES.EGG_POOL },
  research: { title: 'Research Tasks', path: ROUTES.RESEARCH_TASKS },
  rocket: { title: 'Rocket Lineups', path: ROUTES.ROCKET_LINEUP },
};
