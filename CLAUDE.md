# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `npm start` - Starts Angular dev server on :4200 and json-server API on :3000 concurrently
- `ng serve` - Runs only the Angular dev server
- `npx json-server db.json` - Runs only the mock API server

### Testing

- `npm test` - Runs unit tests with Vitest
- `npm run test:e2e` - Runs Playwright E2E tests (requires dev server running)

### Build & Quality

- `npm run build` - Builds production bundle
- `npm run lint` - Runs ESLint with Angular rules and auto-fixes issues

## Architecture Overview

Angular 21 task management app following Domain-Driven Design (DDD) with NgRx Signals Store.

### Tech Stack

- **Angular v21.1.4** — standalone components, no NgModules
- **NgRx Signals Store v21.0.1** — reactive state management
- **Angular Material v21.1.4** — UI components (Material Design 3)
- **TypeScript v5.9.3** — strict mode
- **Vitest v4.0.17** + ng-mocks v14.15.0 — unit testing
- **Playwright v1.58.2** — E2E testing
- **json-server v1.0.0-beta.6** — mock REST API on `http://localhost:3000`

### Project Structure (DDD)

```
src/app/features/{domain}/
  feature/         # Smart components (inject stores, orchestrate)
  ui/              # Dumb components (input/output only)
  data/
    models/        # TypeScript interfaces
    infrastructure/# HTTP services
    state/         # NgRx Signal Stores
  util/            # Domain utilities
src/app/core/      # App-wide components (navbar, layout)
src/app/shared/    # Cross-domain shared code
```

### Critical Rules

- **No barrel files** (`index.ts`) — strictly prohibited
- **Each component in its own subfolder** within feature/ or ui/
- **No type suffixes** — `TaskCard` not `TaskCardComponent`, `TaskApi` not `TaskApiService`
- **Standalone + OnPush** on every component
- **Signal inputs/outputs** — `input()`, `output()`, never decorators
- **Modern control flow** — `@if`, `@for`, `@switch`
- **`inject()` function** — not constructor injection

### API Endpoints

- `/tasks` — Task CRUD
- `/users` — User data
- Data stored in `db.json` at project root

### Git Hooks

- **Lefthook** manages pre-commit hooks (Prettier + ESLint auto-fix)
- Configuration in `lefthook.yml`

### Commit Conventions

Angular format: `type(scope): description`
Types: feat, fix, docs, style, refactor, test, chore

## Detailed Guidelines (Source of Truth)

The instruction files in `.github/instructions/` are the **single source of truth** for coding patterns. Agents and skills reference these files — do not duplicate their content.

| File                                   | Covers                                                              |
| -------------------------------------- | ------------------------------------------------------------------- |
| `angular.instructions.md`              | Angular v21+ patterns, standalone components, signals, control flow |
| `angular-material.instructions.md`     | Material Design 3 component usage and theming                       |
| `angular-signal-forms.instructions.md` | Signal-based forms API                                              |
| `angular-testing.instructions.md`      | Vitest + TestBed testing patterns                                   |
| `architecture.instructions.md`         | DDD structure, folder organization, naming                          |
| `ngrx-signals.instructions.md`         | NgRx Signals Store patterns                                         |
| `ngrx-signals-testing.instructions.md` | Store testing strategies                                            |
| `techstack.instructions.md`            | Complete technology stack                                           |
| `typescript.instructions.md`           | TypeScript conventions, strict mode                                 |

## Agent & Tool Usage

### When to use which agent

| Task                        | Agent/Command                               |
| --------------------------- | ------------------------------------------- |
| Scaffold new domain feature | `feature-scaffolder` agent or `/scaffold`   |
| Create NgRx Signal Store    | `signal-store-creator` agent or `/store`    |
| Write unit tests            | `unit-test-writer` agent or `/test`         |
| Review branch changes       | `branch-code-reviewer` agent or `/review`   |
| Migrate to signals          | `refactor-to-signals` agent                 |
| Material components/theming | `material-theme-advisor` agent              |
| Plan E2E tests              | `playwright-test-planner` agent             |
| Generate E2E tests          | `playwright-test-generator` agent or `/e2e` |
| Fix failing E2E tests       | `playwright-test-healer` agent              |
| Lint & fix                  | `/lint`                                     |
| Commit changes              | `/commit`                                   |

### MCP Servers available

| Server            | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `angular-cli`     | Angular CLI operations (generate, build, serve) |
| `eslint`          | Lint files programmatically                     |
| `playwright-test` | Browser automation, E2E test execution          |
| `context7`        | Up-to-date library documentation lookup         |
