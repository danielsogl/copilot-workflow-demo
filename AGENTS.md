# AGENTS.md

Project conventions for AI coding agents working in this repository.

## Commands

- `npm start` — dev server + json-server mock API
- `npm run build` — production build
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — Playwright E2E
- `npm run lint` — ESLint

Always use **npm**, never pnpm/yarn.

## Stack

- Angular 21 (standalone components, signals, `@if`/`@for` control flow, no NgModules)
- NgRx Signal Store 21 for state
- Angular Material 21 (Material 3)
- TypeScript 5.9 strict mode
- Vitest + ng-mocks for unit tests
- Playwright for E2E

## Architecture (DDD)

Each domain under `src/app/features/<domain>/` is split into:

- `feature/` — smart container components (route-level)
- `ui/` — presentational components (dumb, OnPush)
- `data/` — `models/`, `infrastructure/` (HTTP), `state/` (Signal Stores)
- `util/` — pure helpers

Cross-domain code goes in `src/app/core/` and `src/app/theme/`.

## Conventions

- Standalone components only. No `NgModule`.
- Prefer signals over RxJS where possible. Use `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`.
- Inputs/outputs as signals, not decorators.
- Strict TypeScript: no `any`, explicit return types on public APIs.
- File naming: `kebab-case.type.ts` (e.g. `task-card.ts`, `task-store.ts`, `task.model.ts`).
- Tests live next to the file: `*.spec.ts`.
- Prettier + ESLint enforced via lefthook pre-commit hook — do not bypass.

## Detailed guidance

See `.github/instructions/` for domain-specific rules (Angular, NgRx Signals, Material, Testing, Architecture, TypeScript). They are auto-applied by Copilot via `applyTo` globs.

## Caveman Mode (Token-Efficient Communication)

Use this mode for ultra-compressed responses when requested (for example: "caveman mode", "talk like caveman", "use caveman", "less tokens", "be brief", or `/caveman`).

- Goal: Keep full technical accuracy, remove fluff, and reduce token usage.
- Persistence: Once enabled, keep active every response until user says "stop caveman" or "normal mode".
- Default level: `full`.
- Level switch: `/caveman lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra`.

### Core Rules

- Drop filler, pleasantries, hedging, and unnecessary words.
- Fragments are allowed in `full` and `ultra`.
- Keep technical terms, code blocks, command syntax, and quoted errors exact.
- Preferred response pattern: `[thing] [action] [reason]. [next step].`

### Intensity Levels

- `lite`: Tight professional sentences, no fluff.
- `full`: Classic caveman brevity; drop articles where possible.
- `ultra`: Maximum compression; abbreviations and arrows allowed (`X -> Y`).
- `wenyan-lite|wenyan-full|wenyan-ultra`: Classical Chinese compression variants.

### Auto-Clarity Exceptions

Temporarily use normal clarity for:

- Security warnings.
- Irreversible/destructive action confirmations.
- Multi-step sequences where fragments may cause misread.
- Cases where the user asks for clarification.

Resume caveman mode after the clear/safety-critical part.

### Boundaries

- Code, commits, and PR artifacts should remain normal style unless explicitly requested otherwise.
- Mode level persists until changed by user or session ends.
