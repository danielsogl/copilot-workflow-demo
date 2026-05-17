# GitHub Copilot for Angular & NgRx - Workshop Demo

This repository demonstrates how to set up and configure **GitHub Copilot** in **Visual Studio Code** for Angular development with NgRx Signals Store. It showcases a complete task management application built using modern Angular 21 patterns, enhanced by intelligent Copilot assistance.

## 🚀 GitHub Copilot Setup for Visual Studio Code

### Prerequisites

1. **GitHub Copilot subscription** — Individual, Business, or Enterprise
2. **Visual Studio Code** with the GitHub Copilot extension installed
3. **Node.js 22+** and **npm**

### Step 1: Install Required Extensions

Install these VS Code extensions for the best Angular + Copilot experience:

```bash
# GitHub Copilot (chat + completions in one extension)
code --install-extension GitHub.copilot-chat

# Angular language support
code --install-extension Angular.ng-template
code --install-extension ms-vscode.vscode-typescript-next
```

### Step 2: Configure Copilot for Angular & NgRx

Copy `.vscode/settings.json` and `.vscode/mcp.json` from this repo. The setup:

- **`AGENTS.md`** at the repo root is the single source of project conventions, loaded by every agent (Copilot, Copilot CLI, Claude Code, Codex).
- **Agent skills** (portable across VS Code, Copilot CLI and the cloud agent) live in `.github/skills/` and `.agents/skills/` and are loaded automatically.
- **No `.github/copilot-instructions.md`** and no `.github/instructions/**` — everything is either in `AGENTS.md` or in a skill.

### Step 3: Skills

Project-local skills (`.github/skills/`):

| Skill                      | When it fires                                                             |
| -------------------------- | ------------------------------------------------------------------------- |
| `project-architecture`     | Scaffolding a feature, component, store, moving files                     |
| `angular-material-theming` | Editing `theme.scss` or component styles, Material 3 token work           |
| `vitest-angular-testing`   | Writing `*.spec.ts` for components / services / directives / pipes / HTTP |
| `pr-review`                | Reviewing a pull request                                                  |

Library skills (auto-discovered, locked via `skills-lock.json`):

| Skill                    | Source               |
| ------------------------ | -------------------- |
| `angular-developer`      | `angular/angular`    |
| `angular-new-app`        | `angular/angular`    |
| `ngrx-signals`           | NgRx skills lib      |
| `reference-core`         | `angular/angular`    |
| `reference-compiler-cli` | `angular/angular`    |
| `reference-signal-forms` | `angular/angular`    |
| `adev-writing-guide`     | `angular/angular`    |
| `find-skills`            | `vercel-labs/skills` |

### Step 4: Reusable Prompts

Ready-to-use prompt templates in `.github/prompts/`:

- **`angular-signal-forms.prompt.md`** — Scaffold a complete Signal Forms component
- **`ngrx-signals-store-crud.prompt.md`** — Generate a full NgRx Signal Store with CRUD
- **`code-review.prompt.md`** — Angular code review checklist

### Step 5: Custom Agents

Specialized agents in `.github/agents/` for automated tasks:

- **`angular-reviewer`** — Full Angular 21 code review
- **`feature-scaffolder`** — Scaffold a DDD domain feature end-to-end
- **`signal-store-creator`** — Generate NgRx Signal Stores
- **`unit-test-writer`** — Write Vitest tests for components, stores, services
- **`playwright-test-generator`** — Generate E2E tests
- **`refactor-to-signals`** — Migrate legacy Angular patterns to signals

## 📁 Project Structure & Architecture

This project follows **Domain-Driven Design (DDD)**. Each domain under `src/app/features/<domain>/` is split into four layers:

| Layer                  | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `feature/`             | Smart container components (route-level, inject stores)      |
| `ui/`                  | Presentational components (dumb, OnPush, no store injection) |
| `data/models/`         | TypeScript interfaces and types                              |
| `data/infrastructure/` | HTTP services (`*-api.ts`)                                   |
| `data/state/`          | NgRx Signal Stores (`*-store.ts`)                            |
| `util/`                | Pure helper functions                                        |

### Example Folder Structure

```text
src/app/
  app.ts
  app.config.ts
  app.routes.ts
  core/
    navbar/
      navbar.ts
      navbar.html
      navbar.scss
  features/
    tasks/
      feature/
        task-dashboard/
          task-dashboard.ts
          task-dashboard.html
          task-dashboard.spec.ts
      ui/
        task-card/
          task-card.ts
          task-card.html
          task-card.spec.ts
        task-form-dialog/
          task-form-dialog.ts
          task-form-dialog.html
      data/
        models/
          task.model.ts
        infrastructure/
          task-api.ts
          task-api.spec.ts
        state/
          task-store.ts
      util/
        task-helpers/
          task-helpers.ts
          task-helpers.spec.ts
```

> **Note:** Barrel files (`index.ts`) are strictly prohibited. Import directly from the source file.

## 🛠️ Tech Stack

| Technology               | Version | Role                                                         |
| ------------------------ | ------- | ------------------------------------------------------------ |
| **Angular**              | 21      | Framework — standalone, signals, `@if`/`@for` control flow   |
| **TypeScript**           | 5.9     | Strict mode, no `any`                                        |
| **NgRx Signals**         | 21      | State management (`signalStore`, `withEntities`, `rxMethod`) |
| **Angular Material**     | 21      | UI — Material 3 via `mat.theme()` mixin                      |
| **Angular Signal Forms** | 21      | `form()`, `schema()`, `FormField` directive                  |
| **Vitest**               | 4       | Unit testing via `@angular/build:unit-test`                  |
| **Playwright**           | 1.59    | E2E testing                                                  |
| **json-server**          | —       | Local mock REST API on `http://localhost:3000`               |
| **ESLint**               | 9       | Flat config with `angular-eslint`, `@ngrx/eslint-plugin`     |
| **Prettier**             | 3       | Code formatting                                              |
| **Lefthook**             | 2       | Git hooks — auto-format & auto-lint on commit                |

## ✨ Demo Application

A task management app demonstrating real-world Angular 21 + NgRx patterns:

- **Kanban Board**: Tasks organized by status — _To Do_, _In Progress_, _Completed_
- **Task CRUD**: Create, edit, delete tasks via a Signal Forms dialog
- **Drag & Drop**: Reorder tasks within and across columns
- **Filters**: Filter tasks by priority and search term
- **Dashboard Stats**: Live computed statistics (total, overdue, completion rate)

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server + mock API (concurrently)
npm start           # Angular dev server on :4200, json-server on :3000

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Lint
npm run lint
```

### Git Hooks (Lefthook)

Lefthook runs automatically on `git commit`:

- **Prettier** formats all staged files (`.ts`, `.html`, `.scss`, `.json`, `.md`, …)
- **ESLint** auto-fixes staged `.ts` and `.html` files

## 📚 Resources

- [Angular Documentation](https://angular.dev)
- [NgRx Signals Documentation](https://ngrx.io/guide/signals)
- [Angular Material](https://material.angular.io)
- [GitHub Copilot for VS Code](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-your-ide)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
