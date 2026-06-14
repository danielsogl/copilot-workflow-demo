# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Tool-agnostic baseline conventions live in @AGENTS.md; the deep architecture write-up is @docs/architecture.md. This file keeps the Claude-specific setup; domain folders carry their own scoped `CLAUDE.md` (e.g. `src/app/features/tasks/CLAUDE.md`), and path-scoped rules live in `.claude/rules/`.

## Project

Workshop demo for Claude Code workflows on a modern Angular app. Kanban-style task management.

- **Stack:** Angular 21.2, NgRx Signal Store 21, Angular Material 21 (Material 3), Angular Signal Forms, Vitest 4 (via `@angular/build:unit-test`), Playwright 1.59 + playwright-bdd
- **Package manager:** npm only — never pnpm/yarn (lockfile: `package-lock.json`)
- **Node:** 22+

## Commands

| Command                      | Notes                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm start`                  | Runs `ng serve` (`:4200`) + `json-server db.json` (`:3000`) + `tsx claude-server.ts` (`:3001`) concurrently |
| `npm test`                   | Vitest via Angular's new unit-test builder — not Karma                                                      |
| `npm run test:e2e`           | Must be `bddgen && playwright test` — Gherkin features in `tests/bdd/` need codegen first                   |
| `npm run lint`               | ESLint (flat config, `eslint.config.js`)                                                                    |
| `npm run review-bot -- <PR>` | PR reviewer using Agent SDK + `gh` CLI                                                                      |

`claude-server.ts` and `review-bot.ts` require `ANTHROPIC_API_KEY` in env. `review-bot.ts` also needs `gh` authenticated.

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

- **Angular 21+ idioms only.** Standalone is the default — never set `standalone: true`. No `NgModule`, no `CommonModule`/`RouterModule` imports — bring in the specific directives/pipes you need.
- **Signals first.** `input()`, `input.required()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`, `httpResource()`. Prefer `httpResource()` for component reads; `HttpClient` only for mutations or inside `rxMethod`.
- **Control flow.** `@if` / `@for` (always with `track`) / `@switch` / `@let`. Never `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Components.** `changeDetection: ChangeDetectionStrategy.OnPush` always. No type suffixes (`TaskCard`, not `TaskCardComponent`). Inject via `inject()`, never constructor injection. Selector prefix `app-` (kebab) for components, `app` (camelCase) for directives — enforced by ESLint.
- **Stores.** `signalStore({ providedIn: 'root' }, ...)`. Use `withEntities(entityConfig)` for collections. Mutate only via `patchState`. Side effects via `rxMethod` + `tapResponse`. Compose with `withFeature`, `withLinkedState`, `withProps`, `withHooks`. Prefix private members with `_`.
- **Forms.** Angular Signal Forms (`@angular/forms/signals`) — `form()` + `schema()`. Never `ReactiveFormsModule`/`FormBuilder`/`FormGroup`. Define schemas at module level for memoization.
- **Material 3.** Single global theme via `@include mat.theme((...))` in `src/app/theme/theme.scss`. `color-scheme: light dark` for automatic dark mode. Component styles consume `var(--mat-sys-*)` tokens — never hardcoded colors. No legacy `mat-palette`/`mat-light-theme`.
- **TypeScript.** Strict mode. No `any`. Explicit return types on public APIs. `kebab-case.type.ts` filenames (`task-card.ts`, `task-store.ts`, `task.model.ts`).

## Tests

- Live next to the source as `*.spec.ts`.
- Always include `provideZonelessChangeDetection()` in test providers.
- Use `provideHttpClientTesting()` for service tests — no separate `provideHttpClient()` needed in v21+.
- Set signal inputs with `componentRef.setInput(name, value)` then `await fixture.whenStable()`.
- Playwright BDD: features in `tests/bdd/features/`, steps in `tests/bdd/steps/`. Always run `bddgen` before `playwright test`.

## Commits

Conventional Commits — see `@.github/guidelines/commit-convention.md` for the full spec (types, scopes, breaking-change format).

Lefthook runs Prettier + ESLint on pre-commit and is mandatory — **never bypass with `--no-verify`**. If a hook fails, fix the underlying issue and create a new commit (don't `--amend`).

## Claude Code setup (don't duplicate — read these directly)

- `.claude/agents/` — 9 specialized subagents (`angular-reviewer`, `feature-scaffolder`, `signal-store-creator`, `unit-test-writer`, `refactor-to-signals`, `material-theme-advisor`, three `playwright-test-*`). Pick one when the task fits.
- `.claude/commands/` — slash commands: `/code-review`, `/scaffold-signal-store`, `/scaffold-signal-form`.
- `.claude/skills/` — bundled skills (`angular-developer`, `ngrx-signals`, `bdd`, `playwright-cli`, `skill-creator`).
- `.claude/rules/` — path-scoped rules auto-loaded by glob: `signal-store.md` (`**/*-store.ts`), `testing.md` (`**/*.spec.ts`, `tests/**`).
- `.claude/output-styles/` — `Workshop Tutor` (teaching voice) and `Angular PR Reviewer` (terse review voice). Switch via `/output-style`.
- `.claude/hooks/` — `session-context.sh` (SessionStart banner), `guard-destructive-bash.sh` (PreToolUse; blocks `rm -rf /`, `git push`, `git reset --hard`, `npm publish`, `--no-verify`), `format-changed-files.sh` (PostToolUse ESLint + Prettier). Wired in `.claude/settings.json`.
- `.claude/statusline.sh` — custom status line (model · dir · branch · cost), wired via `statusLine` in `.claude/settings.json`.
- `.mcp.json` — `context7` (live docs), `angular-cli` (project tools), `playwright-test` (browser automation), `eslint` (linting). Prefer these over manual lookups.
- `.claude-plugin/` — `marketplace.json` + `plugin.json` package the above agents/commands/skills as the installable **angular-workshop-toolkit** plugin.
