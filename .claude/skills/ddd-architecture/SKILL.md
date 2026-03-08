---
name: ddd-architecture
description: Domain-Driven Design architecture guide for this Angular project. Activates when discussing folder structure, file placement, domain organization, component organization, or creating new features/components/services.
---

# DDD Architecture Guide (Project-Specific)

This project follows Domain-Driven Design with strict organizational rules.

## Directory Structure

```
src/app/
  features/
    {domain}/              # Business domain (tasks, user, projects, etc.)
      feature/             # Smart components — orchestrate domain logic
        {name}/
          {name}.ts
          {name}.html
          {name}.scss
          {name}.spec.ts
      ui/                  # Dumb components — presentational only
        {name}/
          {name}.ts
          {name}.html
          {name}.scss
          {name}.spec.ts
      data/
        models/            # TypeScript interfaces and types
          {entity}.model.ts
        infrastructure/    # API services, HTTP clients
          {name}-api.ts
          {name}-api.spec.ts
        state/             # NgRx Signal Stores
          {name}-store.ts
          {name}-store.spec.ts
      util/                # Domain-specific helpers
        {name}/
          {name}.ts
          {name}.spec.ts
  core/                    # App-wide components (navbar, layout)
  shared/                  # Cross-domain shared code
    models/
    utilities/
```

## Critical Rules

### NEVER create barrel files
`index.ts` files for re-exporting are **strictly prohibited**. Always use direct imports.

### Every component gets its own subfolder
```
✅ feature/task-dashboard/task-dashboard.ts
❌ feature/task-dashboard.ts
```

### Naming conventions
| Type | File Name | Class Name |
|------|-----------|------------|
| Component | `task-card.ts` | `TaskCard` |
| Service | `task-api.ts` | `TaskApi` |
| Store | `task-store.ts` | `TaskStore` |
| Model | `task.model.ts` | `Task` (interface) |
| Helper | `task-helpers.ts` | (exported functions) |
| Test | `task-card.spec.ts` | — |

- **kebab-case** for file names
- **PascalCase** for classes, **no type suffixes** (no `Component`, `Service`, `Directive`)
- **`.model.ts`** suffix only for model/interface files

### Layer responsibilities
- **feature/** — Smart components that inject stores and services, handle routing
- **ui/** — Dumb components with `input()`/`output()` only, no injected stores
- **data/infrastructure/** — HTTP services returning `Observable<T>`
- **data/state/** — NgRx Signal Stores
- **data/models/** — Pure TypeScript interfaces and types
- **util/** — Pure functions, no Angular dependencies preferred

### Cross-domain rules
- Domains should NOT import from other domains
- Shared code goes in `src/app/shared/`
- Core app components go in `src/app/core/`
