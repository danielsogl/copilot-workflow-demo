# Claude Code for Angular & NgRx — Workshop Demo

This branch (`claude-code`) demonstrates how to set up and configure **[Claude Code](https://docs.claude.com/en/docs/claude-code)** for Angular development with NgRx Signals Store. It showcases a complete task management application built using modern Angular 22 patterns, enhanced by Claude Code subagents, slash commands, MCP servers, and the Claude Agent SDK — all managed declaratively via [APM](https://microsoft.github.io/apm/).

> The `main` branch shows the same project with **GitHub Copilot** instead. Compare both branches side-by-side in your workshops.

## Claude Code setup

### Prerequisites

1. **Anthropic account** with access to Claude Code (or a compatible provider)
2. **Node.js 22+** and **npm**
3. **Claude Code CLI** — install once: `npm install -g @anthropic-ai/claude-code`
4. (For the review bot) `ANTHROPIC_API_KEY` environment variable + GitHub CLI (`gh`)

### Step 1: Open the project

```bash
git clone https://github.com/danielsogl/copilot-workflow-demo.git
cd copilot-workflow-demo
git checkout claude-code
npm install
claude
```

The first `claude` invocation in this directory loads:

- [`CLAUDE.md`](./CLAUDE.md) — primary project memory (conventions, stack, architecture)
- [`.claude/settings.json`](./.claude/settings.json) — committed permission allowlist + enabled MCP servers
- [`.mcp.json`](./.mcp.json) — project-scope MCP server configuration

> **Managed by APM.** Everything below (`.claude/`, `.mcp.json`, `AGENTS.md`) is **generated** by the [Agent Package Manager](https://microsoft.github.io/apm/) from the sources in `.apm/` + `apm.yml`. Edit the sources, then run `apm install --target claude && apm compile --target claude` — never hand-edit the generated files. The `main` branch compiles the same `.apm/` for GitHub Copilot. `CLAUDE.md`, `.claude/output-styles/`, `.claude/statusline.sh` and `settings.json` permissions are Claude-only and stay hand-maintained.

### Step 2: Project memory — `CLAUDE.md`

A single file at the repo root captures everything Claude needs to know about the project (stack, DDD layout, signal-first conventions, Material 3 rules, testing patterns). Claude loads it automatically into every session — no manual `@`-references required.

### Step 3: Subagents — `.claude/agents/`

Specialized agents Claude can dispatch to (authored in `.apm/agents/`). Invoke with `/agents` or let Claude pick one based on the task.

| Agent                           | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| **`playwright-test-planner`**   | Build a structured E2E test plan by exploring the app |
| **`playwright-test-generator`** | Generate a single Playwright spec from a plan item    |
| **`playwright-test-healer`**    | Debug and fix failing Playwright tests                |

### Step 4: Slash commands — `.claude/commands/`

Type `/` in Claude Code to see them (authored as prompts in `.apm/prompts/`).

| Command                    | What it does                                                            |
| -------------------------- | ----------------------------------------------------------------------- |
| `/code-review`             | Review the changes on the active branch against project standards       |
| `/ngrx-signals-store-crud` | Generate an NgRx Signal Store with full CRUD for an entity              |
| `/angular-signal-forms`    | Scaffold an Angular Signal Form with schema validation                  |
| `/analyze-codebase-bugs`   | Run a structured bug-focused review of files, folders, or the workspace |

### Step 5: MCP servers — `.mcp.json`

Project-scope MCP servers (declared in `apm.yml › dependencies.mcp`), auto-enabled via `.claude/settings.json`:

| Server                | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| **`context7`**        | Live docs for Angular, NgRx, Material, Playwright, …                      |
| **`angular-cli`**     | Project-aware Angular CLI tooling (`get_best_practices`, `find_examples`) |
| **`playwright-test`** | Test runner automation for the Playwright agents                          |
| **`playwright`**      | Browser automation (accessibility-tree driven)                            |
| **`eslint`**          | Lint files via the official ESLint MCP server                             |

### Step 6: Skills

Library skills are managed by **APM** — declared in `apm.yml`, version-pinned in `apm.lock.yaml`, and deployed to `.claude/skills/`:

- `angular-developer`, `angular-new-app`, `ngrx-signals`, `bdd`, `skill-creator`

Run `apm install` to (re)deploy them after editing `apm.yml`.

## Workshop demos: Claude Agent SDK

Two small Node scripts show the [`@anthropic-ai/claude-agent-sdk`](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) in action.

### `claude-server.ts`

Express server on `:3001` that exposes a chat endpoint backed by Claude. Custom MCP tools (`get_tasks`, `create_task`, `update_task_status`) talk to the local `json-server` so the assistant can answer "show me all open tasks", "create a high-priority task", etc.

```bash
npm start
# Angular dev :4200 + json-server :3000 + claude-server :3001
```

### `review-bot.ts`

CLI PR reviewer using the Agent SDK + `gh` CLI. Run with:

```bash
ANTHROPIC_API_KEY=... npm run review-bot -- 123
```

It fetches the diff via a custom MCP tool and prints a structured review (summary, issues, suggestions, verdict).

## Project structure & architecture

This project follows **Domain-Driven Design (DDD)**. Each domain under `src/app/features/<domain>/` is split into four layers:

| Layer                  | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `feature/`             | Smart container components (route-level, inject stores)      |
| `ui/`                  | Presentational components (dumb, OnPush, no store injection) |
| `data/models/`         | TypeScript interfaces and types                              |
| `data/infrastructure/` | HTTP services (`*-api.ts`)                                   |
| `data/state/`          | NgRx Signal Stores (`*-store.ts`)                            |
| `util/`                | Pure helper functions                                        |

### Example folder structure

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

## Tech stack

| Technology               | Version | Role                                                         |
| ------------------------ | ------- | ------------------------------------------------------------ |
| **Angular**              | 22      | Framework — standalone, signals, `@if`/`@for` control flow   |
| **TypeScript**           | 6.0     | Strict mode, no `any`                                        |
| **NgRx Signals**         | 21      | State management (`signalStore`, `withEntities`, `rxMethod`) |
| **Angular Material**     | 22      | UI — Material 3 via `mat.theme()` mixin                      |
| **Angular Signal Forms** | 22      | `form()`, `schema()`, `FormField` directive                  |
| **Vitest**               | 4       | Unit testing via `@angular/build:unit-test`                  |
| **Playwright**           | 1.61    | E2E testing (+ `playwright-bdd`)                             |
| **json-server**          | —       | Local mock REST API on `http://localhost:3000`               |
| **ESLint**               | 10      | Flat config with `angular-eslint`, `@ngrx/eslint-plugin`     |
| **Prettier**             | 3       | Code formatting                                              |
| **Lefthook**             | 2       | Git hooks — auto-format & auto-lint on commit                |
| **Claude Agent SDK**     | 0.3     | Workshop server / review bot                                 |
| **APM**                  | 0.20    | Agent Package Manager — compiles `.apm/` → `.claude/`        |

## Demo application

A task management app demonstrating real-world Angular 22 + NgRx patterns:

- **Kanban board:** tasks organized by status — _To Do_, _In Progress_, _Completed_
- **Task CRUD:** create, edit, delete tasks via a Signal Forms dialog
- **Drag & drop:** reorder tasks within and across columns
- **Filters:** filter tasks by priority and search term
- **Dashboard stats:** live computed statistics (total, overdue, completion rate)
- **Claude assistant:** ask the in-app assistant for tasks ("show me all open tasks", "create a high-priority task for tomorrow")

## Development

```bash
npm install         # Install dependencies
npm start           # Angular :4200 + json-server :3000 + claude-server :3001
npm test            # Vitest unit tests
npm run test:e2e    # Playwright E2E
npm run build       # Production build
npm run lint        # ESLint
```

### Git hooks (Lefthook)

Lefthook runs automatically on `git commit`:

- **Prettier** formats all staged files (`.ts`, `.html`, `.scss`, `.json`, `.md`, …)
- **ESLint** auto-fixes staged `.ts` and `.html` files

Never bypass with `--no-verify`.

## Resources

- [Claude Code documentation](https://docs.claude.com/en/docs/claude-code)
- [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
- [Angular documentation](https://angular.dev)
- [NgRx Signals documentation](https://ngrx.io/guide/signals)
- [Angular Material](https://material.angular.io)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
