# PoGo Calendar

A Pokémon GO event calendar with game-data reference pages and planning tools. Built with React, TypeScript, Vite, Tailwind CSS, Radix UI, and FullCalendar.

## Live app

Open [pokelitee.github.io/pogo-calendar](https://pokelitee.github.io/pogo-calendar/).

## Features

- Month and weekly list calendars, with time-zone, display, and theme settings.
- Event search and category filters, optional historical events, featured Pokémon sprites, and hover previews.
- Saved events, personal notes, custom events, and individual or bulk `.ics` exports.
- Raid, egg, research, and Team GO Rocket reference pages with filters and Pokémon storage searches.
- Pokémon Finder, search-string builder, type matchups, bonus tracker, and a feed of newly seen game data.

Settings, custom events, notes, saved events, caught Pokémon, and news progress are stored in your browser's `localStorage`. They do not sync between devices.

## Getting started

Use Node.js 22 and npm:

```sh
git clone https://github.com/pokelitee/pogo-calendar.git
cd pogo-calendar
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`, then `npm run preview`.

## Architecture

`src/pages/` contains lazy-loaded pages; `src/components/` groups UI by feature. Contexts and hooks manage application state, services fetch and validate remote data, and `src/config/` centralizes URLs and shared settings. Hash-based routing supports static hosting on GitHub Pages.

See [Development](docs/development.md#architecture) for the source layout and development conventions.

## Data source

All game data comes from [leak-duck](https://github.com/pokelitee/leak-duck), served from GitHub Pages at `https://pokelitee.github.io/leak-duck/<file>`:

| File | Used for |
| --- | --- |
| `events.json` | Calendar events |
| `archives/archive_{year}.json` | Optional event history |
| `raid_bosses.json`, `egg_pool.json`, `research_tasks.json`, `rocket_lineups.json` | Data reference pages |
| `manifest.json` | "Updated" time in the header and the list of available archive years |

The time zone list in Settings comes from the browser itself (`Intl.supportedValuesOf`), so it needs no network request.

Every leak-duck response is validated in `src/services/dataValidation.ts` before it reaches application state. The schemas are documented in the [leak-duck API reference](https://pokelitee.github.io/leak-duck/#reference).

## Documentation

- The app's FAQ explains user-facing behavior.
- [Leak Duck API reference](https://pokelitee.github.io/leak-duck/#reference) defines the upstream data contract.
- [Development](docs/development.md) covers checks, architecture, data integration, dependency updates, deployment, and troubleshooting.

## Contributing

Follow the [organization contribution guide](https://github.com/pokelitee/.github/blob/main/CONTRIBUTING.md) and the [development guide](docs/development.md). Use a short-lived branch and a pull request into `main`.

## Credits

Game data is collected by [Leak Duck](https://github.com/pokelitee/leak-duck) from [Leek Duck](https://leekduck.com/events/).
