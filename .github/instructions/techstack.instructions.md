---
description: "Complete tech stack overview: Angular, TypeScript, NgRx Signals, Material, Vitest, Playwright, json-server, and build tooling"
applyTo: "**"
---

# Tech Stack Guidelines

This project uses the following technology stack:

- **Framework:** Angular 21+ (standalone components, signals, modern control flow `@if`/`@for`/`@switch`/`@let`, no NgModules)
- **Language:** TypeScript 5.9+ (strict mode, strong typing, no `any`)
- **State Management:** NgRx Signals Store 21+ (`signalStore`, `withState`, `withMethods`, `withFeature`, `withLinkedState`, `withEntities`, `rxMethod`)
- **UI Library:** Angular Material 21+ with Material 3 theming via `mat.theme()` mixin and `--mat-sys-*` system tokens
- **Forms:** Angular Signal Forms (`@angular/forms/signals`) — schema-based validation with `form()`, `required`, `minLength`, etc.
- **HTTP / Async:** `httpResource()` and `resource()` for reactive data fetching; `HttpClient` for mutations and inside `rxMethod` pipelines
- **Reactivity:** Signals (`signal`, `computed`, `linkedSignal`, `effect`, `untracked`); RxJS only at integration boundaries via `toSignal`/`toObservable`
- **API:** Local fake REST API using json-server served from `db.json` on `http://localhost:3000`
- **Unit Testing:** Vitest 4+ via the official `@angular/build:unit-test` builder, with Angular TestBed and ng-mocks. Use `provideZonelessChangeDetection()` and `provideHttpClientTesting()` in test providers.
- **E2E Testing:** Playwright with the official Test Agents (`planner`, `generator`, `healer`) for AI-assisted authoring and self-healing tests
- **Build System:** `@angular/build` (esbuild-based application builder)
- **Git Hooks:** Lefthook (auto-format & auto-fix on commit)
- **Linting/Formatting:** ESLint with `angular-eslint` and `@ngrx/eslint-plugin`, Prettier
- **Constraints:**
  - No NgModules — standalone APIs only
  - No static or in-memory data in application code — all data access via the API layer
  - No legacy structural directives (`*ngIf`, `*ngFor`) — always use new control flow
  - No `@Input()` / `@Output()` decorators — use `input()`, `output()`, `model()` functions

For exact versions, refer to `package.json`.
