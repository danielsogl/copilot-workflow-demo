# GitHub Copilot for Angular & NgRx - Setup Demo

This repository demonstrates how to set up and configure **GitHub Copilot** in **Visual Studio Code** for Angular development with NgRx Signals Store. It showcases a complete task management application with timer functionality, built using modern Angular patterns and enhanced by intelligent Copilot assistance.

## 🚀 GitHub Copilot Setup for Visual Studio Code

### Prerequisites

1. **GitHub Copilot subscription** - Individual, Business, or Enterprise
2. **Visual Studio Code** with the GitHub Copilot extension installed
3. **Node.js 18+** and **npm**

### Step 1: Install Required Extensions

Install these VS Code extensions for the best Angular + Copilot experience:

```bash
# Core Copilot extensions
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat

# Angular development extensions
code --install-extension Angular.ng-template
code --install-extension ms-vscode.vscode-typescript-next
```

### Step 2: Configure Copilot for Angular & NgRx

Copy the `.vscode/settings.json` configuration from this repository to enable:

- **Prompt file discovery** for automatic instruction loading
- **Commit message generation** following Angular conventions
- **Chat edit requests** for inline code improvements
- **Test generation** with proper Angular testing patterns

Key settings:

```json
{
  "chat.promptFiles": true,
  "github.copilot.chat.commitMessageGeneration.instructions": [
    { "file": ".github/guidelines/commit-convention.md" }
  ],
  "github.copilot.chat.generateTests.codeLens": true,
  "github.copilot.chat.setupTests.enabled": true
}
```

### Step 3: Custom Instructions for Angular & NgRx

This project includes specialized Copilot instructions in `.github/instructions/`:

- **`angular.instructions.md`** - Angular 19+ standalone components, modern control flow
- **`ngrx-signals.instructions.md`** - NgRx Signals Store patterns and best practices
- **`architecture.instructions.md`** - Domain-driven design structure
- **`angular-testing.instructions.md`** - Vitest and ng-mocks testing patterns
- **`typescript.instructions.md`** - Strict TypeScript configuration

These instructions are automatically loaded and help Copilot generate code that follows your project's patterns and conventions.

### Step 4: Using Copilot with Angular & NgRx

Once configured, Copilot will assist with:

- **Component Generation**: Creates standalone Angular components following the project's DDD structure
- **Service & Store Creation**: Generates NgRx Signals stores with proper typing and patterns
- **Test Scaffolding**: Produces comprehensive tests using Vitest and ng-mocks
- **Code Completion**: Provides context-aware suggestions for Angular APIs and NgRx patterns
- **Refactoring**: Helps modernize code to use Angular's latest features (control flow, signals)

### Example Copilot Prompts

Try these prompts in GitHub Copilot Chat:

```
Generate a new task feature with NgRx Signals store
Create a unit test for the TaskService using ng-mocks
Refactor this component to use Angular's new control flow syntax
Add proper TypeScript typing to this NgRx store
```

## 📁 Project Structure & Architecture

- **Domain-Driven Design (DDD):**
  - Code is organized by business domain under `src/app/<domain>/<type>` (e.g., `task/feature/`, `task/ui/`, `task/data/`, `task/util/`).
  - Each domain/type exposes a public API via an `index.ts` file.
  - Shared code lives in `src/app/shared/`.
- **Tech Stack:**
  - **Angular v20+** (standalone components, modern control flow, no NgModules)
  - **TypeScript** (strict mode, strong typing, ESLint, Prettier)
  - **NgRx Signals Store** for state management
  - **Angular Material v20** for UI components
  - **json-server** for local REST API (see `db.json`)
  - **Vitest** for unit testing with **ng-mocks**
  - **Playwright** for end-to-end testing

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

## ✨ Demo Application Features

This task management app demonstrates real-world Angular + NgRx patterns:

- **Task Management**: Create, view, and manage tasks with titles, descriptions, and todo lists
- **Timer Functionality**: Set timers for tasks with start, pause, and stop controls
- **Status Tracking**: Automatic status updates (in progress, overdue, finished)
- **Todo Management**: Mark individual todos as complete to track task progress
- **Responsive UI**: Built with Angular Material for a modern user experience

### Business Logic

- When a timer runs out before task completion → task marked as **overdue**
- When all todos are completed → task marked as **finished** and timer stops
- Tasks can be manually marked as finished to stop the timer early

## 🔧 Development Setup

### API & Mock Data

- Uses [json-server](https://github.com/typicode/json-server#readme) for a local REST API
- Mock data is defined in `db.json`
- API runs at `http://localhost:3000`

## 📚 Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [NgRx Signals Documentation](https://ngrx.io/guide/signals)
- [GitHub Copilot for VS Code](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-your-ide)
- Project-specific guidelines in `.github/instructions/`

---

## 🤝 Contributing

This project demonstrates best practices for Angular + NgRx development with GitHub Copilot. The custom instructions and configuration serve as a template for setting up Copilot in your own Angular projects.

Feel free to explore the `.github/instructions/` directory to understand how the custom Copilot instructions work and adapt them for your needs.
