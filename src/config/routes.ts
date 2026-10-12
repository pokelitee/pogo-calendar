/**
 * Application route configuration
 * Centralizes all route paths to avoid string repetition
 */

export const ROUTES = {
  CALENDAR: '/',
  EGG_POOL: '/egg-pool',
  RAID_BOSSES: '/raid-bosses',
  RESEARCH_TASKS: '/research-tasks',
  ROCKET_LINEUP: '/rocket-lineup',
  TOOLS: '/tools',
  SEARCH_STRING_BUILDER: '/tools/search-string',
  FAQ: '/faq',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
