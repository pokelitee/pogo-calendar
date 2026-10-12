export const LEAK_DUCK_DATA_BASE_URL = 'https://pokelitee.github.io/leak-duck';

export const GITHUB_EVENTS_API_URL = `${LEAK_DUCK_DATA_BASE_URL}/events.json`;

export const getEventArchiveApiUrl = (year: number) =>
  `${LEAK_DUCK_DATA_BASE_URL}/archives/archive_${year}.json`;

export const GITHUB_LAST_UPDATED_API_URL =
  'https://api.github.com/repos/pokelitee/leak-duck/commits?sha=data&path=events.json&page=1&per_page=1';

export const TIMEZONES_API_URL =
  'https://raw.githubusercontent.com/dmfilipenko/timezones.json/master/timezones.json';
