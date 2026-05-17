# AGENTS.md

Single source of project conventions for any AI coding agent (Copilot, Copilot CLI, Claude Code, Codex) working in this repo. Detailed how-tos live in **skills** (see below) — this file stays concise and authoritative.

## Commands

| Task                   | Command            |
| ---------------------- | ------------------ |
| Dev server + mock API  | `npm start`        |
| Production build       | `npm run build`    |
| Unit tests (Vitest)    | `npm test`         |
| E2E tests (Playwright) | `npm run test:e2e` |
| Lint                   | `npm run lint`     |

Always use **npm**. Never pnpm/yarn.

## Stack

- **Angular 21** — standalone components, signals, `@if` / `@for` / `@switch` / `@let` control flow. No `NgModule`, no `*ngIf` / `*ngFor`.
- **TypeScript 5.9** — strict mode. No `any`. Explicit return types on public APIs.
- **NgRx Signals Store 21** — `signalStore`, `withEntities`, `rxMethod`, `signalMethod`, `withFeature`, `withLinkedState`.
- **Angular Material 21** — Material 3 via `mat.theme()` and `--mat-sys-*` tokens. Legacy palette/theme APIs are forbidden.
- **Angular Signal Forms** — `form()`, `schema()`, `FormField`. Preferred over Reactive/Template-driven forms for new code.
- **Vitest 4** (via `@angular/build:unit-test`) + Angular **TestBed** + **ng-mocks**.
- **Playwright** for E2E.
- **json-server** mock REST API on `http://localhost:3000`.
- **ESLint** + **Prettier** + **Lefthook** pre-commit hooks — do not bypass with `--no-verify`.

## Critical rules (must follow)

1. **No barrel files.** Never create `index.ts` re-export files. Import directly from source.
2. **Standalone only.** No `NgModule`. No `CommonModule` / `RouterModule` imports — import specific directives (`RouterLink`).
3. **Signals over decorators** — `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`, `httpResource()`. Never `@Input()` / `@Output()`.
4. **Function DI** — `inject(Service)`. Never constructor injection in new code.
5. **OnPush on every component.** Tests use `provideZonelessChangeDetection()`.
6. **Modern control flow** in templates: `@if`, `@for` (with `track`), `@switch`, `@let`.
7. **No `any`.** Prefer `unknown` + type guards. Strong types on public APIs.
8. **DDD layering** (see `project-architecture` skill). Every component / directive / pipe / service in its own subfolder. No `shared/` folder.
9. **File naming**: `kebab-case.ts` without `.component` / `.service` / `.directive` / `.pipe` suffixes. Keep `.model.ts` for models. Tests are `*.spec.ts`.
10. **Class naming**: `PascalCase` without type suffix (`TaskCard`, not `TaskCardComponent`).
11. **Immutable state updates** — always `patchState(store, ...)`, never mutate.
12. **HTTP** — `httpResource()` for reactive component reads, `HttpClient` inside `rxMethod` pipelines for mutations.

## Skills (project-local)

| Skill                      | When to use                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| `project-architecture`     | Scaffolding a feature, component, store, or moving files around            |
| `angular-material-theming` | Editing `theme.scss` or any component style; Material 3 tokens & overrides |
| `vitest-angular-testing`   | Writing `*.spec.ts` for components / services / directives / pipes / HTTP  |
| `pr-review`                | Reviewing a pull request                                                   |

## Skills (library)

These ship as agent skill libs and are auto-discovered:

| Skill                    | When to use                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `angular-developer`      | Generic Angular 21 guidance (components, DI, routing, ARIA, animations, CLI) |
| `angular-new-app`        | Creating a new Angular workspace                                             |
| `ngrx-signals`           | Authoring or testing any NgRx Signal Store (`*-store.ts`, `*-store.spec.ts`) |
| `reference-core`         | Deep Angular core reference                                                  |
| `reference-compiler-cli` | Angular compiler / CLI reference                                             |
| `reference-signal-forms` | Signal Forms API reference                                                   |
| `adev-writing-guide`     | Style for any docs you author                                                |
| `find-skills`            | Discover additional skills                                                   |

## Project layout (TL;DR)

```
src/app/
  app.ts / app.config.ts / app.routes.ts
  core/                                # cross-domain (navbar, layout, app-level services)
  theme/theme.scss                     # global mat.theme()
  features/<domain>/
    feature/<container>/<container>.ts # smart, route-level
    ui/<component>/<component>.ts      # presentational, OnPush
    data/
      models/<thing>.model.ts
      infrastructure/<thing>-api.ts
      state/<thing>-store.ts
    util/<helper>/<helper>.ts
```

## Tools available to agents

- **MCP servers** (`.mcp.json`): `context7` (current library docs), `angular-cli` (project introspection), `playwright-test`, `playwright`, `eslint`.
- **LSP** (`.github/lsp.json`): TypeScript, Angular Language Service, HTML/CSS/JSON, YAML. Used by **Copilot CLI in the terminal** and by the **cloud agent** — the only diagnostics path when no IDE is attached. The VS Code Copilot Chat extension and the Claude Code IDE bridge ignore this file and rely on the IDE's own language servers instead, so this config is portable and IDE-agnostic.
- **Hooks** (`.github/hooks/hooks.json`): `SessionStart` injects project context, `PreToolUse` blocks destructive bash, `PostToolUse` auto-formats with Prettier + auto-fixes with ESLint.
- **Always reach for `context7` first** when the user asks about a library, framework, or API — prefer current docs over training data.

## Don'ts

- No code comments unless explicitly requested.
- No `console.log` in committed code.
- No mocking the database in integration tests — they hit the real `json-server` instance.
- No `--no-verify` on commits.
