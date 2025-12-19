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
  - `src/app/` is organized by business domains (e.g., `user/`, `tasks/`, `dashboard/`).
  - Each domain contains subfolders for different types: `feature/`, `ui/`, `data/`, `util/`.

- **Layered Folders:**
  - `feature/`: Feature components, orchestrating domain logic and UI.
  - `ui/`: Presentational components, directives, and pipes.
  - `data/`: Data access, API clients, state management, persistence logic.
  - `util/`: Utilities and helpers.

- **Component, Directive, and Pipe Subfolders:**
  - All components, directives, pipes, and services must be placed in their own subfolders.
  - Example: A component named `task-list.ts` should be located at `src/app/tasks/feature/task-list/task-list.ts` (inside a `task-list` subfolder), not directly in the `feature` folder.

- **Shared Kernel:**
  - Cross-domain code (shared types, utilities) is placed in `src/app/shared/`.

## 3. Example Folder Structure

```text
src/app/
  tasks/
    feature/
      task-list/
        task-list.ts
        task-list.html
        task-list.scss
        task-list.spec.ts
      task-create-modal/
        task-create-modal.ts
        task-create-modal.html
        task-create-modal.scss
    ui/
      task-item/
        task-item.ts
        task-item.html
        task-item.scss
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
        dashboard-data.ts
  shared/
    models/
      common.model.ts
    utilities/
      date-utils.ts
```

## 4. Key Principles

- **Feature Isolation:** Each domain is self-contained with its own features, UI, data, and utilities
- **Clear Boundaries:** Domains communicate through well-defined interfaces
- **Shared Code:** Only truly shared code goes in `src/app/shared/`
- **Scalability:** The structure supports growth without reorganization
- **Discoverability:** Developers can easily find code by following the domain/layer/component pattern
