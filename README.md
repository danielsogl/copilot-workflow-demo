# CopilotWorkflowDemo

This demo app lets users manage tasks with a timer, todos, and status tracking. It is designed to showcase how GitHub Copilot can help you build and extend real-world Angular applications.

## Project Structure & Architecture

- **Domain-Driven Design (DDD):**
  - Code is organized by business domain under `src/app/<domain>/<type>` (e.g., `task/feature/`, `task/ui/`, `task/data/`, `task/util/`).
  - Each domain/type exposes a public API via an `index.ts` file.
  - Shared code lives in `src/app/shared/`.
- **Module Boundaries:**
  - Enforced with [Sheriff](https://github.com/softarc-consulting/sheriff) and configured in `sheriff.config.ts`.
  - Only public APIs (`index.ts`) are accessible across modules.
- **Tech Stack:**
  - Angular v19+ (standalone components, modern control flow, no NgModules)
  - TypeScript (strict mode, strong typing, ESLint, Prettier)
  - NgRx Signals Store for state management
  - Angular Material v3 for UI
  - json-server for local API (see `db.json`)
  - Unit testing with Jasmine, ng-mocks, Playwright (E2E)

### Example Folder Structure

```text
src/app/
  task/
    feature/
    ui/
    data/
    util/
  shared/
  core/
    components/
      navbar/
```

## Features

- **Task Management:** Create, view, and manage tasks. Each task has a title, description, and a list of todos.
- **Todos:** Each task contains multiple todos. Mark todos as done to track progress.
- **Timer:** Set a timer for each task. Start, pause, or stop the timer. When the timer finishes, the task is marked as overdue.
- **Overdue & Finished Logic:**
  - If the timer runs out before the task is finished, the task is marked as overdue.
  - If all todos are completed or the task is manually marked as finished, the timer stops and the task is marked as finished.
- **Status Tracking:** Tasks can be in progress, overdue, or finished.

## API & Mock Data

- The app uses a local fake REST API powered by [json-server](https://github.com/typicode/json-server#readme).
- Mock data is defined in `db.json`.
- API runs at `http://localhost:3000`.

## Development

### Start the Angular App

```bash
ng serve
```

App runs at [http://localhost:4200](http://localhost:4200).

### Start the API Server

```bash
npx json-server --watch db.json --port 3000
```

### Code Scaffolding

Use Angular CLI to generate components, directives, or pipes:

```bash
ng generate component component-name
```

### Building

```bash
ng build
```

### Running Unit Tests

```bash
ng test
```

### Running End-to-End Tests

```bash
ng e2e
```

## Linting & Formatting

- Code must pass all ESLint and Prettier checks.
- Run linting with:

```bash
npx eslint . --ext .ts
```

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Sheriff Documentation](https://sheriff.softarc.io/)
- See `.github/guidelines/` for detailed coding and architecture guidelines.
