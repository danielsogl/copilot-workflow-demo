---
applyTo: "**"
---

# Architecture

> **Note:** The use of barrel files (index.ts files for re-exporting) is strictly prohibited in this project. Do not create, reference, or use barrel files in any part of the codebase or documentation.

This project follows a Domain-Driven Design (DDD) approach for modularity, maintainability, and scalability.

## 1. DDD Structure

- **Domains:**
  - `src/app/` is organized by business domains (e.g., `user/`, `order/`, `product/`).
  - Each domain contains subfolders for different types: `feature/`, `ui/`, `data/`, `util/`.
- **Layered Folders:**
  - `feature/`: Feature modules, orchestrating domain logic and UI.
  - `ui/`: Presentational components, directives, and pipes.
  - `data/`: Data access, API clients, persistence logic.
  - `util/`: Utilities and helpers.
- **Component, Directive, and Pipe Subfolders:**
  - All components, directives, and pipes must be placed in their own subfolders within their respective type folders. For example, a component named `task-list.component.ts` should be located at `src/app/tasks/feature-task/task-list/task-list.component.ts` (i.e., inside a `task-list` subfolder), not directly in the `feature-task` folder. This applies to all new code and ensures a scalable, maintainable structure.
- **Shared Kernel:**
  - Cross-domain code (shared types, utilities) is placed in `src/app/shared/`.

## 2. Example Folder Structure

```text
src/app/
  user/
    feature/
      user-overview/
        user-overview.component.ts
        user-overview.store.ts
        ...
      ...
    ui/
      user-list/
        user-list.component.ts
        ...
      ...
    data/
      models/
        user.model.ts
      infrastructure/
        user.infrastructure.ts
      state/
        user.store.ts
        ...
      ...
    util/
      user-helpers/
        user-helpers.util.ts
        ...
      ...
  order/
    ...
  shared/
    ...
```

---
