# Architecture

This project follows a Domain-Driven Design (DDD) approach for modularity, maintainability, and scalability, enforced with [Sheriff](https://github.com/softarc-consulting/sheriff) for strict module boundaries.

## 1. DDD Structure

- **Domains:**
  - `src/app/` is organized by business domains (e.g., `user/`, `order/`, `product/`).
  - Each domain contains subfolders for different types: `feature/`, `ui/`, `data/`, `util/`.
- **Layered Folders:**
  - `feature/`: Feature modules, orchestrating domain logic and UI.
  - `ui/`: Presentational components, directives, and pipes.
  - `data/`: Data access, API clients, persistence logic.
  - `util/`: Utilities and helpers.
- **Shared Kernel:**
  - Cross-domain code (shared types, utilities) is placed in `src/app/shared/`.

## 2. Module Boundaries with Sheriff

- **Module Tagging:**
  - Sheriff tags modules using the pattern: `src/app/<domain>/<type>` → `domain:<domain>`, `type:<type>`.
- **Public APIs:**
  - Each domain/type module exposes a public API via an `index.ts` file.
  - Only exports from `index.ts` are accessible to other modules.
- **Dependency Rules:**
  - `root`: Can depend on any module (`*`).
  - `domain:*`: Can depend on modules with the same domain tag and on `domain:shared`.
  - `type:feature`: Can depend on `type:ui`, `type:data`, and `type:util` modules.
  - `type:ui`: Can depend on `type:data` and `type:util` modules.
  - `type:data`: Can depend on `type:util` modules.
  - `type:util`: Cannot depend on any other type.
  - Cross-domain dependencies are only allowed via the shared kernel.
- **Sheriff Integration:**
  - Sheriff is configured via its CLI and/or ESLint plugin.
  - Run `npx sheriff init` to scaffold configuration.
  - Add rules to `.sheriffrc.json` or `sheriff.config.js` to enforce boundaries.

## 3. Example Folder Structure

```text
src/app/
  user/
    feature/
      user-overview.feature.ts
      ...
      index.ts
    ui/
      user-list.ui.ts
      ...
      index.ts
    data/
      user-api.data.ts
      ...
      index.ts
    util/
      user-helpers.util.ts
      ...
      index.ts
  order/
    ...
  shared/
    ...
```

---

For more, see the [Sheriff documentation](https://sheriff.softarc.io/) and the guidelines in `.github/guidelines/`.
