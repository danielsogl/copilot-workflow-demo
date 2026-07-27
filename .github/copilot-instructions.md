<!-- Build ID: 2d23c3f9a3c8 -->

## Commands

| Task                     | Command             |
| ------------------------ | ------------------- |
| Dev server + API         | `npm start`         |
| Backend only             | `npm run start:api` |
| Production build         | `npm run build`     |
| Backend build            | `npm run build:api` |
| Unit tests (Vitest)      | `npm test`          |
| Backend tests (xUnit v3) | `npm run test:api`  |
| E2E tests (Playwright)   | `npm run test:e2e`  |
| Lint                     | `npm run lint`      |

Always use **npm**. Never pnpm/yarn.

## Don'ts

- No code comments unless explicitly requested.
- No `console.log` in committed code.
- No mocking the API in integration tests — they hit the real `TaskApi` instance on `:3000`.
- No `--no-verify` on commits. Fix the failing hook instead.

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
- **.NET 10** Minimal API under `backend/` on `http://localhost:3000`, tested with xUnit v3.
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

Skills are installed with `gh skill install <owner>/<repo> <skill> --agent github-copilot|claude-code` — Copilot reads `.agents/skills/`, Claude Code reads `.claude/skills/`, so each skill is installed twice. Provenance (repo, tag, tree SHA) sits in each `SKILL.md` frontmatter; `gh skill update --all` refreshes them.

| Skill               | When to use                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| `angular-developer` | Generic Angular 22 guidance (components, DI, routing, styling, ARIA)    |
| `angular-new-app`   | Creating a new Angular workspace                                         |
| `ngrx-signals`      | Authoring or testing any NgRx Signal Store (`*-store.ts`)               |
| `bdd`               | Gherkin/Cucumber specs, Playwright BDD, executable acceptance criteria   |
| `skill-creator`     | Authoring or improving a skill                                           |
| `test-anti-patterns` | Auditing a suite for tests that pass but verify nothing — any language |
| `exp-test-gap-analysis` | Pseudo-mutation analysis: would these tests catch the bug?          |
| `crap-score` · `coverage-analysis` | Where complex code meets thin tests                      |
| `generate-testability-wrappers` | Cutting a seam into code that has none                      |
| `migrate-xunit-to-xunit-v3` | Moving a suite onto xUnit v3 / the Microsoft Testing Platform    |
| `run-tests`         | Running and filtering `dotnet test` correctly                            |
| `grill-with-docs` → `to-spec` → `to-tickets` → `implement` | The spec-driven chain, in that order |
| `tdd` · `code-review` | Red-green-refactor, and reviewing a diff                               |

The .NET skills come from `dotnet/skills` (official, Microsoft-owned) at
release tag `v1.0.0`; the spec chain from `mattpocock/skills`. There is no
official Stryker skill — that gap is deliberate, it is a workshop exercise.
