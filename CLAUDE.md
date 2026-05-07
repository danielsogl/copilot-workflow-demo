# Claude Code Workshop — Angular 21 + NgRx Signals

Workshop demo for **Claude Code** workflows on a modern Angular application. Use this file as the single source of truth for project conventions; deeper domain rules live in `.claude/agents/`, `.claude/commands/`, and the configured MCP servers.

## Project

- **Stack:** Angular 21 (standalone, signals, control flow), NgRx Signal Store 21, Angular Material 21 (Material 3), Angular Signal Forms, Vitest 4, Playwright 1.59
- **Architecture:** Domain-Driven Design — `feature/`, `ui/`, `data/`, `util/` per domain under `src/app/features/`
- **Repo:** `danielsogl/copilot-workflow-demo` (branch `claude-code`)
- **Demo app:** Kanban-style task management — `json-server` mock API on `:3000`, Angular dev server on `:4200`, Claude assistant server on `:3001`

## Commands

| Command                      | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `npm start`                  | Dev server + json-server mock API + Claude assistant server (concurrently) |
| `npm run build`              | Production build                                                           |
| `npm test`                   | Unit tests (Vitest via `@angular/build:unit-test`)                         |
| `npm run test:e2e`           | Playwright E2E (`bddgen && playwright test`)                               |
| `npm run lint`               | ESLint                                                                     |
| `npm run review-bot -- <PR>` | PR review using the Claude Agent SDK                                       |

Always use **npm**, never pnpm/yarn.

## Architecture (DDD)

Each domain under `src/app/features/<domain>/` is split into:

- `feature/` — smart container components (route-level, inject stores)
- `ui/` — presentational components (dumb, OnPush, no store injection)
- `data/models/` — TypeScript interfaces and types (`*.model.ts`)
- `data/infrastructure/` — HTTP services (`*-api.ts`)
- `data/state/` — NgRx Signal Stores (`*-store.ts`)
- `util/` — pure helper functions

Cross-domain code lives in `src/app/core/` and `src/app/theme/`. Components and helpers each get their own named subfolder. **No barrel files** (`index.ts`) — import directly from the source file.

## Conventions

- **Angular 21+ idioms only.** Standalone is the default — never set `standalone: true`. No `NgModule`. No `CommonModule`/`RouterModule` imports — bring in the specific directives/pipes you need.
- **Signals first.** `input()`, `input.required()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`, `httpResource()`. Prefer `httpResource()` for component reads; `HttpClient` only for mutations or inside `rxMethod`.
- **Control flow.** `@if` / `@for` (always with `track`) / `@switch` / `@let`. Never `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Components.** `changeDetection: ChangeDetectionStrategy.OnPush` always. No type suffixes (`TaskCard`, not `TaskCardComponent`). Inject via `inject()`, never constructor injection.
- **Stores.** `signalStore({ providedIn: 'root' }, ...)`. Use `withEntities(entityConfig)` for collections. Mutate only via `patchState`. Side effects via `rxMethod` + `tapResponse`. Compose with `withFeature`, `withLinkedState`, `withProps`, `withHooks`. Prefix private members with `_`.
- **Forms.** Angular Signal Forms (`@angular/forms/signals`) — `form()` + `schema()`. Never `ReactiveFormsModule`/`FormBuilder`/`FormGroup`. Define schemas at module level for memoization.
- **Material 3.** Single global theme via `@include mat.theme((...))` in `src/app/theme/theme.scss`. `color-scheme: light dark` for automatic dark mode. Component styles consume `var(--mat-sys-*)` tokens — never hardcoded colors. No legacy `mat-palette`/`mat-light-theme`.
- **TypeScript.** Strict mode. No `any`. Explicit return types on public APIs. `kebab-case.type.ts` filenames (`task-card.ts`, `task-store.ts`, `task.model.ts`).
- **Tests.** Live next to the source file as `*.spec.ts`. Always include `provideZonelessChangeDetection()`. Use `provideHttpClientTesting()` for service tests (no `provideHttpClient()` needed in v21+). Set signal inputs with `componentRef.setInput(name, value)` + `await fixture.whenStable()`.
- **Files.** Max 400 LOC per file. Each component in its own subfolder.
- **Lefthook** (Prettier + ESLint on pre-commit) is mandatory — never bypass with `--no-verify`.

## Claude Code setup

- **Subagents** in `.claude/agents/` — invoke via `/agents` or have Claude pick one based on the task. Highlights: `angular-reviewer`, `feature-scaffolder`, `signal-store-creator`, `unit-test-writer`, `refactor-to-signals`, `material-theme-advisor`, three `playwright-test-*` agents.
- **Slash commands** in `.claude/commands/` — `/code-review`, `/scaffold-signal-form`, `/scaffold-signal-store`.
- **MCP servers** in `.mcp.json` — `context7` (live docs), `angular-cli` (project tools), `playwright-test` (browser automation), `eslint` (linting).
- **Skills** install on demand via `npx skills` — pick only what fits this stack (`angular-developer`, `ngrx-signals`, `pr-review`).

## Workshop demos

- `claude-server.ts` — Express assistant server using `@anthropic-ai/claude-agent-sdk` with custom MCP tools (`get_tasks`, `create_task`, `update_task_status`).
- `review-bot.ts` — CLI PR reviewer using the Agent SDK + `gh` CLI.

## Reference files

- Tasks feature: `src/app/features/tasks/feature/task-dashboard/task-dashboard.ts`
- UI: `src/app/features/tasks/ui/task-card/task-card.ts`
- Store: `src/app/features/tasks/data/state/task-store.ts`
- API: `src/app/features/tasks/data/infrastructure/task-api.ts`
- Models: `src/app/features/tasks/data/models/task.model.ts`
- Theme: `src/app/theme/theme.scss`
