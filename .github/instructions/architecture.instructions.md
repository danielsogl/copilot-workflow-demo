---
description: "DDD-based project structure with domain folders, feature/ui/data/util organization, naming conventions, and component subfolder requirements"
applyTo: "**"
---

# Architecture

> **Note:** The use of barrel files (index.ts files for re-exporting) is strictly prohibited in this project. Do not create, reference, or use barrel files in any part of the codebase or documentation.

This project follows a Domain-Driven Design (DDD) approach for modularity, maintainability, and scalability.

## 1. Naming Conventions

> **Note:** For complete naming guidelines including identifiers, selectors, and patterns, see `angular.instructions.md`

### File Naming

- **Use kebab-case:** Separate words with hyphens in file names
  - Example: `user-profile.ts`, `task-list.ts`, `dashboard-overview.html`

- **No type suffixes in file names:** Do not include `.component`, `.service`, `.directive`, `.pipe` in file names
  - Correct: `user-profile.ts`, `task-api.ts`, `highlight.ts`
  - Avoid: `user-profile.component.ts`, `task.service.ts`

- **Match file names to class names:** The file name should reflect the class it contains
  - Class `UserProfile` → file `user-profile.ts`
  - Class `TaskApi` → file `task-api.ts`

- **Related files share the same base name:**
  ```
  user-profile/
    user-profile.ts      # Component class
    user-profile.html    # Template
    user-profile.scss    # Styles
    user-profile.spec.ts # Tests
  ```

- **Model files:** Keep `.model` suffix for model/interface files
  - Example: `task.model.ts`, `user.model.ts`

### Class Naming

- **No type suffixes:** Use `PascalCase` WITHOUT type suffixes
  - The Angular decorator already indicates the type (`@Component`, `@Injectable`, `@Directive`, `@Pipe`)
  - Correct: `UserProfile`, `TaskList`, `TaskApi`, `Highlight`, `DateFormat`
  - Avoid: `UserProfileComponent`, `TaskService`, `HighlightDirective`, `DateFormatPipe`

## 2. DDD Structure

- **Domains:**
  - Business domains live under `src/app/features/<domain>/` (e.g., `features/tasks/`, `features/dashboard/`).
  - Each domain contains subfolders for different layers: `feature/`, `ui/`, `data/`, `util/`.

- **Layered Folders (per domain):**
  - `feature/`: Smart container components (route-level), orchestrating domain logic and UI. They inject stores and pass data to `ui/` components.
  - `ui/`: Presentational ("dumb") components, directives, and pipes. OnPush, signal inputs/outputs only, no store/service injection.
  - `data/`: Data access layer — `models/` (interfaces/types), `infrastructure/` (HTTP clients), `state/` (NgRx Signal Stores).
  - `util/`: Pure helper functions specific to the domain.

- **Component, Directive, and Pipe Subfolders:**
  - All components, directives, pipes, and services must be placed in their own subfolders named after the construct.
  - Example: A component named `task-list.ts` is located at `src/app/features/tasks/feature/task-list/task-list.ts`, not directly in the `feature/` folder.

- **Cross-domain code:**
  - App-wide infrastructure (navbar, layout, app-level services) lives in `src/app/core/`.
  - Theming lives in `src/app/theme/`.
  - There is **no** `shared/` folder — promote shared code into `core/` only when it is truly used by multiple domains.

## 3. Example Folder Structure

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
  theme/
    theme.scss
  features/
    tasks/
      feature/
        task-dashboard/
          task-dashboard.ts
          task-dashboard.html
          task-dashboard.scss
          task-dashboard.spec.ts
      ui/
        task-card/
          task-card.ts
          task-card.html
          task-card.scss
        task-board/
          task-board.ts
          task-board.html
          task-board.scss
      data/
        models/
          task.model.ts
        infrastructure/
          task-api.ts
        state/
          task-store.ts
      util/
        task-helpers/
          task-helpers.ts
    dashboard/
      feature/
        dashboard-overview/
          dashboard-overview.ts
          ...
      ui/
        dashboard-stats-card/
          dashboard-stats-card.ts
          ...
      data/
        models/
          dashboard.model.ts
        infrastructure/
          dashboard-api.ts
```

## 4. Key Principles

- **Feature Isolation:** Each domain is self-contained with its own features, UI, data, and utilities
- **Clear Boundaries:** Domains communicate through well-defined interfaces
- **Shared Code:** Only truly shared code lives in `src/app/core/` — there is no `shared/` folder
- **Scalability:** The structure supports growth without reorganization
- **Discoverability:** Developers can easily find code by following the domain/layer/component pattern
