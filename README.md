# PoGo Calendar

A Pokémon GO event calendar and companion toolkit for tracking events and game data. This project evolved from a simple calendar display into a full-featured platform with interactive calendar views, data reference pages, advanced filtering, custom event management, and a modern, responsive user interface.

---

## Live Demo

You can view the live application here: [pokelitee.github.io/pogo-calendar](https://pokelitee.github.io/pogo-calendar/)

---

## Features

### Dynamic Calendar & Theming

- **Multiple Views:** View events in responsive month and weekly list views, powered by FullCalendar.
- **Configurable Calendar Display:** Choose an automatic, month, or list default view; set the first day of the week; show or hide event times in month view; and pick a time zone and 12- or 24-hour time.
- **Optional Event History:** Load every yearly archive of official events published by leak-duck, only when enabled in Settings.
- **Theme Modes:** Choose a light, dark, or automatic system theme with persistence in `localStorage`.
- **Custom Dark Mode Theming:** Thoroughly styled dark mode that covers all aspects of the calendar, including headers and pop-ups.
- **Responsive Header:** A modern "glassmorphism" header that becomes opaque on scroll and adapts its layout for mobile.

### Event Management

- **Color-Coded Events:** Events are colored by category, with dynamically generated colors for any new, unknown categories.
- **Pokémon Event Sprites:** Focused events can display featured Pokémon, raid bosses, or a single spawn directly in the calendar, with optional rotation for small multi-Pokémon groups. Sprites can be turned off in Settings.
- **Hover Previews:** On devices with a pointer, hovering an event shows its details without opening it.
- **Save/Favorite Events:** Mark events as "saved" with a star icon, both on the event and in the details pop-up.
- **Custom Events:** Full CRUD (Create, Read, Update, Delete) functionality for user-created events.
- **Event Notes:** Add personal notes to any event from its details pop-up.
- **"Add to Calendar":** Export any event to a universal `.ics` file that can be imported into Google Calendar, Apple Calendar, Outlook, etc.
- **Bulk Export:** Export whole categories or a hand-picked set of events to one `.ics` file.

### Data Reference Pages

- **Egg Pool:** Browse current egg hatches by egg type with rarity tier and shiny filters.
- **Raid Bosses:** View active raid bosses by tier (1-star through Mega), including shadow raids, with type, CP range, shiny, and shadow filters.
- **Research Tasks:** Search research tasks by description or Pokémon reward, and filter by reward type, task category, and shiny availability.
- **Rocket Lineup:** View current Team GO Rocket lineups for Giovanni, the leaders, and every grunt type, filtered by member, battle slot, encounter, and shiny availability.
- **Copy Search String:** Each data page, the Pokémon Finder, and each Pokémon section of an event can copy a storage search for the Pokémon shown. It uses Pokédex numbers, so it works in any game language.

The data pages are grouped under the **Game Data** menu.

### Tools

- **Search String Builder:** Build a storage search from every term in [Niantic's search guide](https://niantic.helpshift.com/hc/faq/1486-searching-filtering-your-pokemon-inventory/) plus the community-documented ones on [Serebii](https://serebii.net/pokemongo/pokemonsearch.shtml), grouped into collapsible sections: Pokémon and tags, appraisal and stats, variants, types and regions, moves (with move slots), evolution and training, origin, status/size/gender, and inventory counts. Includes presets such as transfer candidates and Great League IVs. Keywords are English, matching the game's English search terms.
- **Pokémon Finder:** Browse or search every Pokémon available from active and upcoming events, raids, eggs, research encounters, and Rocket encounters, filtered by source and shiny availability. Mark Pokémon as caught or shiny caught and hide the ones you already have.
- **Type Matchups:** Pick a current raid boss or up to two types to see every weakness and resistance with Pokémon GO's multipliers, and copy storage searches for counters. Raid boss cards link here with their types filled in.
- **Bonus Tracker:** Event bonuses active now and coming up, grouped by what they boost (Stardust, XP, Candy, shiny odds, and more), with how long each lasts.
- **What's New:** Events, raid bosses, egg hatches, research tasks, and Rocket lineups that appeared since you last marked news as seen.

### Advanced Filtering

- **Calendar Filters:** Filter events by search term, date range, time-of-day range, active status, and category, plus advanced filters for featured Pokémon and bonuses.
- **Page-Specific Filters:** Each data page has tailored filters (tiers, types, shiny status, slots, etc.) with search and bulk selection.
- **Grouped Category Filter:** Collapsible category groups with color keys, "Select All," and "Clear All" actions.
- **Integrated "Saved" Filter:** Filter by your saved events directly from the category menu.
- **Persistent State:** Calendar filters, custom events, saved events, notes, settings, your caught list, and What's New progress are preserved in `localStorage`.

### Polished User Experience

- **Fully Responsive:** Clean, mobile-friendly layout with collapsible filter drawers across all pages.
- **Skeleton Loaders:** Modern skeleton screens shown during data fetching for improved perceived performance.
- **Error Handling:** Graceful error displays with retry functionality when data fails to load.
- **Empty States:** User-friendly messages when filters result in no content.
- **Toast Notifications:** Clear feedback for actions like creating and deleting events.

---

## Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS with a hand-built component kit on Radix UI primitives
- **Calendar:** FullCalendar
- **State Management:** React Hooks (including custom hooks for logic separation)
- **Date Handling:** `date-fns` & `react-day-picker`
- **Client-Side Storage:** `localStorage`
- **Utilities:** `uuid` (for unique IDs), `ics` (for calendar file generation)
- **Build Tool:** Vite

---

## Project Structure

```
src/
├── App.tsx, main.tsx  # App shell, hash routing, and entry point
├── assets/            # Bundled images
├── components/
│   ├── calendar/      # FullCalendar view, event content, sprites
│   ├── events/        # Event detail, create/edit, and .ics export dialogs
│   ├── filters/       # Calendar and data-page filter panels
│   ├── layout/        # Header, footer, page layout
│   ├── shared/        # App-level shared components (settings, errors, loaders)
│   ├── tools/         # Components shared by the Tools pages
│   └── ui/            # Component kit built on Radix UI primitives
├── config/            # Data URLs, storage keys, colors, routes
├── contexts/          # Calendar, event data, custom events, page filters, settings
├── hooks/             # Data fetching and state hooks
├── lib/               # Class name helper for Tailwind
├── pages/             # Lazy-loaded pages (Calendar, data pages, tools, FAQ)
├── services/          # leak-duck fetching and runtime validation
├── styles/            # Calendar styles
├── types/             # TypeScript definitions for app state and leak-duck data
└── utils/             # Date/time, calendar, color, and storage helpers, plus the tools' logic
tests/                 # Node test runner unit tests
```

### Architecture Patterns

- **Context-based State Management:** Separate contexts for calendar, event data, custom events, page filters, and settings
- **Custom Hooks:** Business logic separated into reusable hooks
- **Lazy Loading:** Page components are lazy-loaded for better performance
- **Validated Data Boundaries:** Remote `leak-duck` JSON is parsed and validated before entering application state
- **GitHub Pages Routing:** Hash-based routes support direct navigation and refreshes on static hosting
- **Type Safety:** Full TypeScript coverage with comprehensive type definitions

---

## Getting Started

### Prerequisites

- Node.js 22
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/pokelitee/pogo-calendar.git
    ```
2.  Navigate into the project directory:
    ```bash
    cd pogo-calendar
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

```bash
npm run dev
```

### Validation

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

---

## Data Source

All game data comes from [leak-duck](https://github.com/pokelitee/leak-duck), served from GitHub Pages at `https://pokelitee.github.io/leak-duck/<file>`:

| File | Used for |
| --- | --- |
| `events.json` | Calendar events |
| `archives/archive_{year}.json` | Optional event history |
| `raid_bosses.json`, `egg_pool.json`, `research_tasks.json`, `rocket_lineups.json` | Data reference pages |
| `manifest.json` | "Updated" time in the header and the list of available archive years |

The time zone list in Settings comes from the browser itself (`Intl.supportedValuesOf`), so it needs no network request.

Every leak-duck response is validated in `src/services/dataValidation.ts` before it reaches application state. The schemas are documented in the [leak-duck API reference](https://pokelitee.github.io/leak-duck/#reference).

---

## Deployment

Every push to `main` is built and deployed to GitHub Pages by `.github/workflows/deploy_pages.yml`, using the official Pages actions. The repository's **Settings > Pages** source must be set to **GitHub Actions**. A deploy can also be started manually from the workflow's **Run workflow** button.

`vite.config.ts` sets `base: '/pogo-calendar'` to match the repository name.

---

## Contributing

Follow the [organization contribution guide](https://github.com/pokelitee/.github/blob/main/CONTRIBUTING.md) and the validation commands above. Changes to `main` require a pull request, passing `validate` CI, and resolved review conversations, including changes by administrators. GitHub automatically deletes merged branches. The intended live ruleset is tracked in `.github/rulesets/main.json`; editing that file alone does not apply it. The Pages environment and deployment workflow only permit `main` deployments.

---

## Credits & Attribution

- The source code for the data scraper is available at [github.com/pokelitee/leak-duck](https://github.com/pokelitee/leak-duck).
- All event information is gratefully sourced from [LeekDuck.com](https://leekduck.com/events/).
