# Copilot & Claude Code for Angular + .NET — Workshop Demo

A task management app on **Angular 22 + NgRx Signals** with a **.NET 10** backend,
set up for **two agent harnesses side by side**: GitHub Copilot and Claude Code.
Same skills, same rules, two sets of harness files — which is the point of the
demo, not an accident.

| Harness            | Reads                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/instructions/**`, `.github/prompts/`, `.github/agents/`, `.github/hooks/hooks.json`, `.agents/skills/` |
| **Claude Code**    | `.claude/CLAUDE.md`, `.claude/rules/`, `.claude/commands/`, `.claude/agents/`, `.claude/settings.json`, `.claude/skills/`                          |
| **Both**           | `scripts/hooks/` (one copy, both `settings.json` point at it), `.mcp.json` / `.vscode/mcp.json`                                                    |

Everything is hand-owned — no generator, no compile step. The price is visible
duplication: rules exist twice, and `gh skill` installs each skill into both
directories. That trade-off is the discussion this repo is meant to start.

### Prerequisites

1. **GitHub Copilot subscription** — Individual, Business, or Enterprise
2. **VS Code** with the Copilot extension, and/or **Claude Code**
3. **Node.js 22+** and **npm**
4. **.NET 10 SDK** for the backend

### Step 1: Install Required Extensions

Install these VS Code extensions for the best Angular + Copilot experience:

```bash
# GitHub Copilot (chat + completions in one extension)
code --install-extension GitHub.copilot-chat

# Angular language support
code --install-extension Angular.ng-template
code --install-extension ms-vscode.vscode-typescript-next
```

### Step 2: Rules and instructions

Conventions live twice, once per harness, because the two read different files:

- **Copilot** — `.github/copilot-instructions.md` (global) and
  `.github/instructions/*.instructions.md` (path-scoped via `applyTo`)
- **Claude Code** — `.claude/CLAUDE.md` and `.claude/rules/*.md`

The content is deliberately the same. Change one, change the other — or decide
as a team that only one harness is supported and delete the other.

> **CodeGraph index:** the tree-sitter index behind the `codegraph_*` MCP tools
> is **not** built automatically. Run `codegraph init` once to create the
> gitignored `.codegraph/` index — otherwise the tools report "not initialized".

### Step 3: Skills

Skills are installed with **`gh skill`** (GitHub CLI ≥ 2.90, public preview) —
once per harness, because each writes to its own directory:

```bash
gh skill install dotnet/skills test-anti-patterns --agent github-copilot  # .agents/skills/
gh skill install dotnet/skills test-anti-patterns --agent claude-code     # .claude/skills/

gh skill list                                # installed skills, agent, scope, source
gh skill preview dotnet/skills crap-score    # read it before you trust it
gh skill update --all                        # refresh against upstream
```

| Skill                                                                              | Source              | When it fires                                                                                    |
| ---------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| `angular-developer`                                                                | `angular/skills`    | General Angular 22 guidance (DI, routing, styling)                                               |
| `angular-new-app`                                                                  | `angular/skills`    | Creating a new Angular workspace                                                                 |
| `ngrx-signals`                                                                     | `danielsogl/skills` | Authoring or testing a NgRx Signal Store                                                         |
| `bdd`                                                                              | `danielsogl/skills` | Gherkin/Cucumber specs, Playwright BDD                                                           |
| `skill-creator`                                                                    | `anthropics/skills` | Authoring or improving a skill                                                                   |
| `test-anti-patterns`                                                               | `dotnet/skills`     | Auditing a suite for tests that pass but verify nothing — language-agnostic, works on Vitest too |
| `exp-test-gap-analysis`                                                            | `dotnet/skills`     | Pseudo-mutation analysis: would these tests catch the bug?                                       |
| `crap-score` · `coverage-analysis`                                                 | `dotnet/skills`     | Where complex code meets thin tests                                                              |
| `generate-testability-wrappers`                                                    | `dotnet/skills`     | Cutting a seam into code that has none                                                           |
| `migrate-xunit-to-xunit-v3`                                                        | `dotnet/skills`     | Moving a suite onto xUnit v3 / the Microsoft Testing Platform                                    |
| `run-tests`                                                                        | `dotnet/skills`     | Running and filtering `dotnet test` correctly                                                    |
| `to-spec` · `to-tickets` · `implement` · `grill-with-docs` · `tdd` · `code-review` | `mattpocock/skills` | The spec-driven chain: vague request → spec → tickets → implementation                           |

Two consequences of how `gh skill` works:

- **No lockfile.** Provenance sits in each `SKILL.md` frontmatter —
  `github-repo`, `github-ref` (e.g. `refs/tags/v1.0.0`), `github-tree-sha`.
  The installed files _are_ the record, so both directories are committed.
- **It resolves to the latest release tag, not `main`.** For `dotnet/skills`
  that is `v1.0.0` — a different set than the default branch. Skills that only
  exist on `main` (`dotnet-webapi`, `find-untested-sources`, `grade-tests`) are
  not installable this way yet.

> The .NET skills come from **`dotnet/skills`**, the official Microsoft-owned
> repo. It has no Stryker skill and its authoring guidance is MSTest-leaning —
> a gap worth filling with a hand-built skill.

### Step 4: Reusable Prompts

Prompt templates in `.github/prompts/` for Copilot, mirrored as slash commands in `.claude/commands/` for Claude Code:

- **`analyze-codebase-bugs.prompt.md`** — Structured bug-focused review of files, folders, or the workspace
- **`angular-signal-forms.prompt.md`** — Scaffold a complete Signal Forms component
- **`ngrx-signals-store-crud.prompt.md`** — Generate a full NgRx Signal Store with CRUD
- **`code-review.prompt.md`** — Angular code review checklist

### Step 5: Custom Agents

Specialized agents in `.github/agents/` (Copilot) and `.claude/agents/` (Claude Code):

- **`playwright-test-planner`** — Build a structured E2E test plan by exploring the app
- **`playwright-test-generator`** — Generate a single Playwright spec from a plan item
- **`playwright-test-healer`** — Debug and fix failing Playwright tests

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

| Technology               | Version | Role                                                             |
| ------------------------ | ------- | ---------------------------------------------------------------- |
| **Angular**              | 22      | Framework — standalone, signals, `@if`/`@for` control flow       |
| **TypeScript**           | 6.0     | Strict mode, no `any`                                            |
| **NgRx Signals**         | 21      | State management (`signalStore`, `withEntities`, `rxMethod`)     |
| **Angular Material**     | 22      | UI — Material 3 via `mat.theme()` mixin                          |
| **Angular Signal Forms** | 22      | `form()`, `schema()`, `FormField` directive                      |
| **Vitest**               | 4       | Unit testing via `@angular/build:unit-test`                      |
| **Playwright**           | 1.61    | E2E testing                                                      |
| **.NET**                 | 10      | ASP.NET Core Minimal API on `http://localhost:3000` (`backend/`) |
| **xUnit**                | v3      | Backend tests on the Microsoft Testing Platform                  |
| **ESLint**               | 10      | Flat config with `angular-eslint`, `@ngrx/eslint-plugin`         |
| **Prettier**             | 3       | Code formatting                                                  |
| **Lefthook**             | 2       | Git hooks — auto-format & auto-lint on commit                    |
| **`gh skill`**           | preview | Skill installation for both harnesses (GitHub CLI ≥ 2.90)        |

## ✨ Demo Application

A task management app demonstrating real-world Angular 22 + NgRx patterns:

- **Kanban Board**: Tasks organized by status — _To Do_, _In Progress_, _Completed_
- **Task CRUD**: Create, edit, delete tasks via a Signal Forms dialog
- **Drag & Drop**: Reorder tasks within and across columns
- **Filters**: Filter tasks by priority and search term
- **Dashboard Stats**: Live computed statistics (total, overdue, completion rate)

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server + API (concurrently)
npm start           # Angular on :4200, .NET API on :3000, assistant on :3001

# Run unit tests
npm test            # Angular / Vitest
npm run test:api    # Backend / xUnit v3

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
npm run build:api

# Lint
npm run lint
```

### Backend (`backend/`)

A .NET 10 Minimal API replaces the former json-server. It serves the same
`/tasks` contract on the same port, seeded from `db.json`, and holds state in
memory — a restart resets the board.

- `backend/TaskApi` — endpoints in `Program.cs`, logic in `TaskStore.cs`
- `backend/TaskApi.Tests` — xUnit v3 on the Microsoft Testing Platform, the
  prerequisite for `dotnet stryker --test-runner mtp`

Requires the **.NET 10 SDK**. There is deliberately no bundled `gate` command:
wiring build, test and format into a single exit code is a workshop exercise.

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
