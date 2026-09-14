---
paths:
  - "**"
---

This repo is an Angular 22 + NgRx Signals workshop demo. Agent configuration is managed by **APM** — author primitives under `.apm/`, then run `apm install && apm compile --target codex`. Never hand-edit the generated files (`.claude/rules`, `.claude/agents`, `.claude/skills`, `.mcp.json`, `AGENTS.md`).

**CodeGraph:** when `.codegraph/` exists, reach for `codegraph_explore` (MCP) or `codegraph explore "<symbols or question>"` (shell) before grep or reading files — one call returns the relevant source plus its call paths. The index is **not** built by `apm install`; if `.codegraph/` is missing (the server reports "not initialized"), run `apm run codegraph-setup` (= `codegraph init`) once — CodeGraph's daemon keeps it in sync afterwards.

## Stack

- **Angular 22** — standalone components, signals, `@if` / `@for` / `@switch` / `@let` control flow. No `NgModule`, no `*ngIf` / `*ngFor`.
- **TypeScript 6.0** — strict mode. No `any`. Explicit return types on public APIs.
- **NgRx Signals Store 22** — `signalStore`, `withEntities`, `rxMethod`, `signalMethod`, `withFeature`, `withLinkedState`, `withEventHandlers`.
- **Angular Material 22** — Material 3 via `mat.theme()` and `--mat-sys-*` tokens. Legacy palette/theme APIs are forbidden.
- **Angular Signal Forms** — `form()`, `schema()`, `FormField`. Preferred over Reactive/Template-driven forms for new code.
- **Vitest 4** (via `@angular/build:unit-test`) + Angular **TestBed** + **ng-mocks**. Pinned to 4.x — `@angular/build` peers `vitest ^4.0.8`.
- **TypeScript pinned to 6.0.x** — `@angular/build` and `@angular/compiler-cli` peer `typescript >=6.0 <6.1`. Do not bump to 7.x.
- **Playwright** for E2E.
- **json-server** mock REST API on `http://localhost:3000`.
- **ESLint** + **Prettier** + **Lefthook** pre-commit hooks — do not bypass with `--no-verify`.

## Project layout

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

## Skills

Skills are deployed to `.claude/skills/`, which Claude Code, Copilot in VS Code and the Copilot CLI all
read. Knowledge skills are `apm` dependencies in `apm.yml`; workflow skills live in `.apm/skills/` and
are invoked as slash commands.

| Skill                      | When to use                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `angular-developer`        | Generic Angular 22 guidance (components, DI, routing, styling, ARIA)  |
| `ngrx-signals`             | Authoring or testing any NgRx Signal Store (`*-store.ts`)             |
| `bdd`                      | Gherkin/Cucumber specs, Playwright BDD, executable acceptance criteria |
| `/review-branch`           | Severity-ranked review of the current branch against `main`           |
| `/analyze-codebase-bugs`   | Bug hunt in a given scope                                             |
| `/ngrx-signals-store-crud` | Scaffold API service + CRUD Signal Store + tests for an entity        |
| `/angular-signal-forms`    | Scaffold a Signal Forms component with validation for an entity       |
