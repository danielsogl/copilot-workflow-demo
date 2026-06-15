# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Workshop demo for Claude Code workflows on a modern Angular app — Kanban-style task management. The deep architecture write-up is @docs/architecture.md; domain folders carry their own scoped `CLAUDE.md` (e.g. `src/app/features/tasks/CLAUDE.md`), and path-scoped rules live in `.claude/rules/`.

## Stack

Angular 22 · NgRx Signal Store 21 · Angular Material 21 (Material 3) · Angular Signal Forms · TypeScript 6 (strict) · Vitest 4 (via `@angular/build:unit-test`, **not** Karma) · Playwright 1.60 + playwright-bdd · ESLint 10 (flat config).

- **Package manager:** npm only — never pnpm/yarn (lockfile: `package-lock.json`). Node 22+.

## Commands

| Command                      | Notes                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm start`                  | Runs `ng serve` (`:4200`) + `json-server db.json` (`:3000`) + `tsx claude-server.ts` (`:3001`) concurrently          |
| `npm test`                   | Vitest via Angular's unit-test builder                                                                               |
| `npm run test:e2e`           | `bddgen && playwright test` — Gherkin features in `tests/bdd/` need codegen first; never run `playwright test` alone |
| `npm run lint`               | ESLint (flat config, `eslint.config.mjs`)                                                                            |
| `npm run review-bot -- <PR>` | PR reviewer using Agent SDK + `gh` CLI                                                                               |

`claude-server.ts` and `review-bot.ts` require `ANTHROPIC_API_KEY` in env; `review-bot.ts` also needs `gh` authenticated.

## Architecture (DDD)

Each domain under `src/app/features/<domain>/` is split into:

- `feature/` — smart container components (route-level, inject stores)
- `ui/` — presentational components (dumb, OnPush, no store injection)
- `data/models/` — TypeScript interfaces (`*.model.ts`)
- `data/infrastructure/` — HTTP services (`*-api.ts`)
- `data/state/` — NgRx Signal Stores (`*-store.ts`)
- `util/` — pure helper functions

Cross-domain code lives in `src/app/core/` and `src/app/theme/`. Each component and helper gets its own named subfolder. **No barrel files** (`index.ts`) — import directly from the source file. Max 400 LOC per file.

## Conventions

- **Angular 22+ idioms only.** Standalone is the default — never set `standalone: true`. No `NgModule`, no `CommonModule`/`RouterModule` imports — bring in the specific directives/pipes you need.
- **Signals first.** `input()`, `input.required()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`, `httpResource()`. Prefer `httpResource()` for component reads; `HttpClient` only for mutations or inside `rxMethod`.
- **Control flow.** `@if` / `@for` (always with `track`) / `@switch` / `@let`. Never `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Components.** `changeDetection: ChangeDetectionStrategy.OnPush` always. No type suffixes (`TaskCard`, not `TaskCardComponent`). Inject via `inject()`, never constructor injection. Selector prefix `app-` (kebab) for components, `app` (camelCase) for directives — enforced by ESLint.
- **Stores.** `signalStore({ providedIn: 'root' }, ...)`. Use `withEntities(entityConfig)` for collections. Mutate only via `patchState`. Side effects via `rxMethod` + `tapResponse`. Compose with `withFeature`, `withLinkedState`, `withProps`, `withHooks`. Prefix private members with `_`.
- **Forms.** Angular Signal Forms (`@angular/forms/signals`) — `form()` + `schema()`. Never `ReactiveFormsModule`/`FormBuilder`/`FormGroup`. Define schemas at module level for memoization.
- **Material 3.** Single global theme via `@include mat.theme((...))` in `src/app/theme/theme.scss`. `color-scheme: light dark` for automatic dark mode. Component styles consume `var(--mat-sys-*)` tokens — never hardcoded colors. No legacy `mat-palette`/`mat-light-theme`.
- **TypeScript.** Strict mode. No `any`. Explicit return types on public APIs. `kebab-case` filenames (`task-card.ts`, `task-store.ts`, `task.model.ts`, `task-api.ts`).

## Tests

- Unit/component specs live next to the source as `*.spec.ts`.
- Always include `provideZonelessChangeDetection()` in test providers.
- Use `provideHttpClientTesting()` for service tests — no separate `provideHttpClient()` needed in v21+.
- Set signal inputs with `componentRef.setInput(name, value)` then `await fixture.whenStable()`.
- Playwright BDD: features in `tests/bdd/features/`, steps in `tests/bdd/steps/`. Always run `bddgen` before `playwright test`.

## Commits

Conventional Commits — see @.github/guidelines/commit-convention.md for the full spec (types, scopes, breaking-change format).

Lefthook runs Prettier + ESLint on pre-commit and is mandatory — **never bypass with `--no-verify`**. If a hook fails, fix the underlying issue and create a new commit (don't `--amend`).

## Claude Code setup (read these directly — don't duplicate)

> Managed by **APM**: `.claude/agents`, `.claude/commands`, `.claude/rules`, `.claude/skills`, the hooks in `.claude/settings.json`, `.mcp.json` and `AGENTS.md` are **generated** from `.apm/` + `apm.yml` via `apm install --target claude && apm compile --target claude`. Edit the `.apm/` sources, not the generated files. `output-styles`, `statusline.sh` and `settings.json` permissions are Claude-only and hand-maintained.

- `.claude/agents/` — 3 subagents (`playwright-test-planner`, `playwright-test-generator`, `playwright-test-healer`). Pick one when the task fits.
- `.claude/commands/` — slash commands: `/code-review`, `/ngrx-signals-store-crud`, `/angular-signal-forms`, `/analyze-codebase-bugs`.
- `.claude/skills/` — library skills (`angular-developer`, `angular-new-app`, `ngrx-signals`, `bdd`, `skill-creator`).
- `.claude/rules/` — path-scoped rules compiled from `.apm/instructions/` (`typescript`, `angular-components`, `styling`, `architecture`, plus global `commands`/`project-overview`).
- `.claude/output-styles/` — `Workshop Tutor` (teaching voice) and `Angular PR Reviewer` (terse review voice). Switch via `/output-style`.
- `.claude/hooks/` — `session-context.sh` (SessionStart banner), `guard-destructive-bash.sh` (PreToolUse; blocks `rm -rf /`, `git push`, `git reset --hard`, `npm publish`, `--no-verify`), `format-changed-files.sh` (PostToolUse ESLint + Prettier). Wired in `.claude/settings.json`.
- `.mcp.json` — `context7` (live docs), `angular-cli` (project tools), `playwright-test` + `playwright` (browser automation), `eslint` (linting). Prefer these over manual lookups.
- `.claude-plugin/` — packages the above as the installable **angular-workshop-toolkit** plugin.
