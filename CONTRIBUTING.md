# Contributing

Follow the [organization contribution guide](https://github.com/pokelitee/.github/blob/main/CONTRIBUTING.md) and use the [README](README.md) for setup.

## Local checks

Use Node.js 22 and install the locked dependencies with `npm ci`.

```sh
npm run lint
npm test
npm run build
```

These are the checks run by CI. The build runs TypeScript checking before Vite; use `npm run typecheck` to check types without building the site. Unit tests use Node's test runner and TypeScript stripping.

Use `npm run dev` for development and `npm run preview` to inspect a production build. When changing dependencies, update and commit `package-lock.json` alongside `package.json`. Dependabot checks npm dependencies and GitHub Actions weekly, with related packages grouped.

## Architecture

```text
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

Contexts own application state, while hooks share data-fetching and state logic. Remote JSON is validated in `src/services/dataValidation.ts` before entering application state. Pages are lazy-loaded, and hash routes support direct navigation on GitHub Pages.

Keep data URLs, storage keys, colors, and routes in `src/config/`. Browser `localStorage` holds user settings and personal data; there is no server-side account store.

## Deployment

Every push to `main` is built and deployed to GitHub Pages by `.github/workflows/deploy_pages.yml`, using the official Pages actions. The repository's **Settings > Pages** source must be set to **GitHub Actions**. A deploy can also be started manually from the workflow's **Run workflow** button.

`vite.config.ts` sets `base: '/pogo-calendar'` to match the repository name.

## Repository settings

Changes to `main` require a pull request, passing `validate` CI, and resolved review conversations, including changes by administrators. No approving review is required while there is one maintainer. GitHub automatically deletes merged branches.

The Pages environment and deployment workflow permit only `main`. The intended live ruleset is tracked in `.github/rulesets/main.json`; editing that file alone does not apply the settings to GitHub.
