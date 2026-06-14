# Architecture

This document is the deep-dive companion to `CLAUDE.md`. `CLAUDE.md` imports it via `@docs/architecture.md` so Claude can pull it in on demand without bloating every session.

## Domain-Driven layering

The app is organised by **feature domain**, not by technical type. Every domain under `src/app/features/<domain>/` follows the same internal split:

```
src/app/features/<domain>/
├── feature/            # smart, route-level containers — inject stores, wire UI
│   └── <name>/<name>.ts
├── ui/                 # dumb presentational components — OnPush, inputs/outputs only
│   └── <name>/<name>.ts
├── data/
│   ├── models/         # *.model.ts — TypeScript interfaces / types
│   ├── infrastructure/ # *-api.ts — HTTP services (mutations, rxMethod sources)
│   └── state/          # *-store.ts — NgRx Signal Stores
└── util/               # pure helper functions (no Angular deps)
```

Current domains: `tasks` (the Kanban board), `posts`, `ai-assistant`.

### Why this split

- **`feature/` vs `ui/`** — containers know about stores and routing; presentational components are reusable, side-effect-free, and trivially testable. A `ui/` component never injects a store.
- **`data/` three-way split** — models (shape), infrastructure (I/O), state (orchestration) change for different reasons and at different rates.
- **`util/`** — pure functions are the cheapest things to unit-test; keep logic here when it doesn't need DI.

## State management

NgRx Signal Store is the single source of truth for feature state.

- One store per domain collection, `signalStore({ providedIn: 'root' }, ...)`.
- Collections via `withEntities(entityConfig)`; derived state via `withComputed`.
- All mutation flows through `patchState` — never reassign a signal directly.
- Async work runs through `rxMethod` + `tapResponse`, calling the domain's `*-api.ts` service. Components prefer `httpResource()` for reads.

See `.claude/rules/signal-store.md` for the enforced store checklist.

## Styling & theming

A single Material 3 theme is declared in `src/app/theme/theme.scss` with `@include mat.theme(...)` and `color-scheme: light dark` for automatic dark mode. Components consume `var(--mat-sys-*)` design tokens — no hardcoded colors, no legacy `mat-palette`/`mat-light-theme`.

## Boundaries

- **No barrel files** (`index.ts`) — import directly from the source file so dependency edges stay explicit.
- **Max 400 LOC per file** — split before a file grows past it.
- Cross-domain code belongs in `src/app/core/` (services, guards, interceptors) or `src/app/theme/` (design system), never imported sideways between feature domains.

## Testing topology

- Unit/component specs live next to source as `*.spec.ts` (Vitest via `@angular/build:unit-test`).
- E2E lives in `tests/bdd/` as Gherkin features + step definitions; `bddgen` generates the runnable specs before `playwright test`.
- Mobile-specific Playwright fixtures live in `tests/mobile/`.
