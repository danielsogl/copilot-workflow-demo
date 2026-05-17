---
name: project-architecture
description: Project DDD architecture, folder layout, and Angular naming conventions for this repository. Use whenever you scaffold a new component, service, store, directive, pipe, or domain feature, or when verifying that file paths and class names follow project rules.
---

# Project Architecture (DDD, Angular 21)

> Barrel files (`index.ts`) are **strictly prohibited**. Import directly from source files.

## Folder layout

```
src/app/
  app.ts                       app.config.ts        app.routes.ts
  core/                        # cross-domain infrastructure (navbar, layout, app-level services)
  theme/                       # global theme.scss (mat.theme())
  features/<domain>/
    feature/                   # smart container components (route-level, inject stores)
    ui/                        # presentational components (OnPush, signal I/O, no DI of stores/services)
    data/
      models/                  # interfaces + types
      infrastructure/          # HTTP clients (`*-api.ts`)
      state/                   # NgRx Signal Stores (`*-store.ts`)
    util/                      # pure helper functions
```

- **No `shared/` folder.** Promote shared code into `core/` only when it is truly cross-domain.
- **Every component / directive / pipe / service lives in its own subfolder** named after the construct.
  - Correct: `features/tasks/feature/task-list/task-list.ts`
  - Wrong:   `features/tasks/feature/task-list.ts`

## Naming

### Files (kebab-case)

| Construct  | File                    |
| ---------- | ----------------------- |
| Component  | `task-card.ts` + `.html` / `.scss` / `.spec.ts` |
| Directive  | `highlight.ts`          |
| Pipe       | `date-format.ts`        |
| Service / API | `task-api.ts`        |
| Store      | `task-store.ts`         |
| Model      | `task.model.ts`         |
| Helper     | `task-helpers.ts`       |

No `.component.ts` / `.service.ts` / `.directive.ts` / `.pipe.ts` suffixes — the decorator already conveys the type. Keep `.model.ts` for interfaces/types.

### Classes (PascalCase, no type suffix)

- `TaskCard`, `TaskApi`, `TaskStore`, `Highlight`, `DateFormat`
- ❌ `TaskCardComponent`, `TaskApiService`, `HighlightDirective`

### Stores

- Class: `FeatureNameStore` (e.g. `TaskStore`)
- Provider helper (when needed): `provideFeatureNameStore()`

## Principles

- **Feature isolation** — each domain is self-contained
- **Boundary direction** — `feature/` depends on `ui/` + `data/` + `util/`; `ui/` depends on nothing else in the domain; `data/` is leaf
- **Discoverability** — file path follows `domain/layer/construct/construct.ts`
- **Scalability** — adding a domain never requires moving existing ones
