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
- `ng lint` - Alternative lint command

## Architecture Overview

This is an Angular 20.2.4 task management application following Domain-Driven Design (DDD) principles with NgRx Signals Store for state management.

### Tech Stack

- **Angular v20.2.4** with standalone components (no NgModules)
- **NgRx Signals Store v20.0.1** for reactive state management
- **Angular Material v20.2.2** for UI components
- **TypeScript v5.9.2** in strict mode
- **Vitest v3.2.4** with ng-mocks v14.13.5 for unit testing
- **Playwright v1.55.0** for E2E testing
- **json-server v1.0.0-beta.3** for mock REST API

### Project Structure

The codebase follows DDD with this organization:

```
src/app/
  <domain>/           # Business domains (tasks, user, etc.)
    feature/         # Feature components & orchestration
    ui/              # Presentational components
    data/            # Data access, API, state
      infrastructure/
      models/
      state/
    util/            # Domain utilities
  core/              # Core app components (navbar, etc.)
  shared/            # Cross-domain shared code
    models/
```

**Important:** Each component, directive, or pipe must be in its own subfolder within the appropriate type folder. Barrel files (index.ts) are prohibited.

### Key Patterns

1. **Standalone Components**: All components use standalone: true with direct imports
2. **Signals & Control Flow**: Use Angular's new @if, @for, @switch syntax and signals
3. **NgRx Signals Store**: State management uses signalStore() with withMethods, withComputed
4. **Testing**: Vitest with ng-mocks for isolation, avoid TestBed when possible
5. **Strict TypeScript**: No implicit any, strict null checks enabled

### API Configuration

- Mock API runs on `http://localhost:3000` using json-server
- Data is stored in `db.json` at project root
- Main endpoints: `/tasks`, `/users`

### Testing Approach

- Unit tests use Vitest with ng-mocks for component isolation
- Prefer MockBuilder over TestBed for better performance
- E2E tests use Playwright with parallel execution across browsers
- Run `npm test` for unit tests, `npm run test:e2e` for E2E

### Build System

- Uses **@angular/build v20.2.2** (modern esbuild-based builder)
- Application builder: `@angular/build:application`
- Unit test builder: `@angular/build:unit-test` with Vitest runner
- Dev server: `@angular/build:dev-server`

### Git Hooks

- **Lefthook v1.12.3** manages pre-commit hooks (replaced Husky)
- Auto-formats with Prettier on commit
- Auto-fixes with ESLint on commit
- Configuration in `lefthook.yml`

### Commit Conventions

Follow Angular commit format: `type(scope): description`

- Types: feat, fix, docs, style, refactor, test, chore
- Keep messages concise and descriptive

## Detailed Guidelines

For comprehensive coding standards and patterns, refer to the instruction files in `.github/instructions/`:

- **`.github/instructions/angular.instructions.md`** - Angular v20+ patterns, standalone components, modern control flow
- **`.github/instructions/angular-material.instructions.md`** - Material Design component usage and theming
- **`.github/instructions/angular-testing.instructions.md`** - Vitest and ng-mocks testing patterns
- **`.github/instructions/architecture.instructions.md`** - DDD structure, folder organization, component placement
- **`.github/instructions/ngrx-signals.instructions.md`** - NgRx Signals Store patterns and best practices
- **`.github/instructions/ngrx-signals-testing.instructions.md`** - Testing strategies for NgRx Signals
- **`.github/instructions/techstack.instructions.md`** - Complete technology stack overview
- **`.github/instructions/typescript.instructions.md`** - TypeScript conventions and strict mode configuration

These files contain specific implementation patterns, code examples, and detailed guidelines that should be followed when working in this codebase.
