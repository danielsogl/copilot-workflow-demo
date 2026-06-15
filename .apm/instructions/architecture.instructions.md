---
description: DDD layering, no barrel files, and file/class naming conventions for source code.
applyTo: "src/app/**"
---

- **DDD layering** — `feature/` (smart, route-level), `ui/` (presentational, OnPush), `data/` (`models/`, `infrastructure/`, `state/`), `util/`. Cross-domain code lives in `core/`.
- **No barrel files.** Never create `index.ts` re-export files. Import directly from source.
- **No `shared/` folder.** Every component / directive / pipe / service lives in its own subfolder.
- **File naming**: `kebab-case.ts` without `.component` / `.service` / `.directive` / `.pipe` suffixes. Keep `.model.ts` for models. Tests are `*.spec.ts`.
- **Class naming**: `PascalCase` without type suffix (`TaskCard`, not `TaskCardComponent`).
