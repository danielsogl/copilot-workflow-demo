# CopilotWorkflowDemo

This demo app lets users manage tasks with a timer, todos, and status tracking. It is de## GitHub Copilot Setup & Automation

This project is enhanced with a custom GitHub Copilot configuration to streamline development, enforce standards, and automate repetitive tasks. The setup includes:

- **Custom Copilot Instructions:**
  - Enforces project-specific TypeScript, Angular, and DDD guidelines from `.github/instructions/`.
  - Ensures strong typing, modularity, and best practices in all generated code.
  - Integrates architectural and testing conventions directly into Copilot's code suggestions.

- **Model Context Protocol (MCP) Servers:**
  - **GitHub MCP:** Enables GitHub-related tasks and repository interactions.
  - **Context7:** Provides up-to-date documentation for libraries and frameworks.
  - **Sequential Thinking:** Helps break down complex tasks into manageable steps.
  - **Playwright:** Supports end-to-end testing automation and scenarios.

- **Reusable Prompt Files:**
  - Domain-specific instructions are stored in `.github/instructions/` and automatically applied.
  - Common coding, refactoring, and testing tasks are available as reusable prompts.
  - Promotes consistency and speeds up onboarding for new contributors.

### Configuration

The Copilot setup is configured in `.vscode/settings.json` with:

- Prompt file discovery enabled for automatic instruction loading
- MCP servers configured for enhanced capabilities
- Commit message generation following project conventions
- Format-on-save and consistent code stylingcase how GitHub Copilot can help you build and extend real-world Angular applications.

## Project Structure & Architecture

- **Domain-Driven Design (DDD):**
  - Code is organized by business domain under `src/app/<domain>/<type>` (e.g., `task/feature/`, `task/ui/`, `task/data/`, `task/util/`).
  - Each domain/type exposes a public API via an `index.ts` file.
  - Shared code lives in `src/app/shared/`.
- **Tech Stack:**
  - Angular v19+ (standalone components, modern control flow, no NgModules)
  - TypeScript (strict mode, strong typing, ESLint, Prettier)
  - NgRx Signals Store for state management
  - Angular Material v3 for UI
  - json-server for local API (see `db.json`)
  - Unit testing with Vitest, ng-mocks, Playwright (E2E)

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
- See `.github/instructions/` for detailed coding and architecture guidelines.

---

## GitHub Copilot Setup & Automation

This project is enhanced with a custom GitHub Copilot configuration to streamline development, enforce standards, and automate repetitive tasks. The setup includes:

- **Custom Copilot Instructions:**
  - Enforces project-specific TypeScript, Angular, and DDD guidelines.
  - Ensures strong typing, modularity, and best practices in all generated code.
  - Integrates architectural and testing conventions directly into Copilot's code suggestions.

- **Developer Experience:**
  - Copilot is context-aware of the project's boundaries and DDD structure.
  - All code suggestions and automations respect the public API boundaries and modularity enforced by the project structure.
  - Custom instructions are maintained in `.github/instructions/` and automatically loaded via prompt file discovery.

For more details on the Copilot setup, see the `.github/instructions/` directory and the VS Code settings configuration.
