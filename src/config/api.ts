const LEAK_DUCK_DATA_BASE_URL = 'https://pokelitee.github.io/leak-duck';

// File paths as leak-duck lists them in manifest.json.
export const EVENTS_PATH = 'events.json';
export const getArchivePath = (year: number) => `archives/archive_${year}.json`;

const dataUrl = (path: string) => `${LEAK_DUCK_DATA_BASE_URL}/${path}`;

export const EVENTS_URL = dataUrl(EVENTS_PATH);
export const getArchiveUrl = (year: number) => dataUrl(getArchivePath(year));
export const MANIFEST_URL = dataUrl('manifest.json');
export const EGG_POOL_URL = dataUrl('egg_pool.json');
export const RAID_BOSSES_URL = dataUrl('raid_bosses.json');
export const RESEARCH_TASKS_URL = dataUrl('research_tasks.json');
export const ROCKET_LINEUPS_URL = dataUrl('rocket_lineups.json');

export const TIMEZONES_URL =
  'https://raw.githubusercontent.com/dmfilipenko/timezones.json/master/timezones.json';
