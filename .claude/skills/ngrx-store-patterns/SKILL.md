---
name: ngrx-store-patterns
description: Project-specific NgRx Signals Store patterns for this Angular 21 DDD application. Activates when code involves signalStore, withEntities, rxMethod, patchState, tapResponse, or any NgRx signals state management.
---

# NgRx Signals Store Patterns (Project-Specific)

This skill provides the exact NgRx Signals Store patterns used in this project. All stores follow the same structure as `src/app/features/tasks/data/state/task-store.ts`.

## Store File Location

Always place stores at: `src/app/features/{domain}/data/state/{domain}-store.ts`

## Required Imports

```typescript
import {
  signalStore, withState, withComputed, withMethods,
  patchState, type,
} from '@ngrx/signals';
import {
  withEntities, entityConfig, setAllEntities,
  addEntity, updateEntity, removeEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
```

## Store Structure (Always Follow This Order)

1. **State interface** — exported, with `loading` and `error` always included
2. **Initial state** — `const initialState: StateType = { ... }`
3. **Entity config** — if using entities, with `type<T>()`, `collection`, `selectId`
4. **Store definition** — `signalStore({ providedIn: 'root' }, ...)`
   - `withState(initialState)`
   - `withEntities(entityConfig)` (if entities)
   - `withComputed(...)` — derived signals
   - `withMethods(...)` — rxMethod for async, plain methods for sync

## Async Method Pattern (rxMethod + tapResponse)

```typescript
loadItems: rxMethod<void>(
  pipe(
    tap(() => patchState(store, { loading: true, error: null })),
    switchMap(() =>
      api.getAll().pipe(
        tapResponse({
          next: (items) =>
            patchState(store, setAllEntities(items, config), { loading: false }),
          error: (error: Error) =>
            patchState(store, { loading: false, error: `Failed: ${error.message}` }),
        }),
      ),
    ),
  ),
),
```

## Synchronous Method Pattern

```typescript
setFilter(value: string): void {
  patchState(store, { filterValue: value });
},
```

## Entity Operations

- `setAllEntities(items, config)` — replace all
- `addEntity(item, config)` — add one
- `updateEntity({ id, changes }, config)` — update one
- `removeEntity(id, config)` — remove one

## Key Rules

- State is **protected by default** — external code cannot `patchState`
- Prefix private members with `_`
- Entity collection names are pluralized (e.g., `'tasks'`, `'users'`)
- Entity access: `store.{collection}Entities()` returns the array
- Always handle loading/error states in async methods
- Use `tapResponse` from `@ngrx/operators`, NOT from `@ngrx/component-store`
