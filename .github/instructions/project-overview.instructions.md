---
description: Project overview, stack summary, layout, and skill index for the Angular 22 + NgRx Signals workshop demo.
---

This repo is an Angular 22 + NgRx Signals workshop demo with a .NET 10 backend under `backend/`. It is configured for **two harnesses at once**: GitHub Copilot reads `.github/`, Claude Code reads `.claude/`. Skills are shared — one copy in `.agents/skills/`, symlinked into `.claude/skills/`. Edit the harness files directly; there is no generator.

**CodeGraph:** the `codegraph_*` MCP tools are backed by a tree-sitter index that is **not** built automatically. If `.codegraph/` is missing (the server reports "not initialized"), run `codegraph init` once; CodeGraph's daemon keeps it in sync afterwards.

## Stack

- **Angular 22** — standalone components, signals, `@if` / `@for` / `@switch` / `@let` control flow. No `NgModule`, no `*ngIf` / `*ngFor`.
- **TypeScript 6.0** — strict mode. No `any`. Explicit return types on public APIs.
- **NgRx Signals Store 21** — `signalStore`, `withEntities`, `rxMethod`, `signalMethod`, `withFeature`, `withLinkedState`.
- **Angular Material 22** — Material 3 via `mat.theme()` and `--mat-sys-*` tokens. Legacy palette/theme APIs are forbidden.
- **Angular Signal Forms** — `form()`, `schema()`, `FormField`. Preferred over Reactive/Template-driven forms for new code.
- **Vitest 4** (via `@angular/build:unit-test`) + Angular **TestBed** + **ng-mocks**.
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

Skills are managed with the `skills` CLI (`npx skills add <owner>/<repo> -a claude-code github-copilot`), pinned in `skills-lock.json` and auto-discovered by both harnesses. `npx skills experimental_install` restores them from the lockfile.

| Skill               | When to use                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| `angular-developer` | Generic Angular 22 guidance (components, DI, routing, styling, ARIA)    |
| `angular-new-app`   | Creating a new Angular workspace                                         |
| `ngrx-signals`      | Authoring or testing any NgRx Signal Store (`*-store.ts`)               |
| `bdd`               | Gherkin/Cucumber specs, Playwright BDD, executable acceptance criteria   |
| `skill-creator`     | Authoring or improving a skill                                           |
| `dotnet-webapi`     | ASP.NET Core Minimal APIs under `backend/`                              |
| `test-anti-patterns` | Auditing a suite for tests that pass but verify nothing — any language |
| `find-untested-sources` | Locating production code with no test behind it                     |
| `generate-testability-wrappers` | Cutting a seam into code that has none                      |
| `coverage-analysis` | Coverage and CRAP score                                                  |
| `grade-tests`       | Judging whether generated tests are worth keeping                        |
| `grill-with-docs` → `to-spec` → `to-tickets` → `implement` | The spec-driven chain, in that order |
| `tdd` · `code-review` | Red-green-refactor, and reviewing a diff                               |

The .NET skills come from `dotnet/skills` (official, Microsoft-owned); the
spec chain from `mattpocock/skills`. There is no official xUnit or Stryker
skill — that gap is deliberate, it is a workshop exercise.
