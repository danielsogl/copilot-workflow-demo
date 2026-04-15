# Entity Management: withEntities, entityConfig, CRUD Updaters

Source: https://ngrx.io/guide/signals/signal-store/entity-management

Import from: `@ngrx/signals/entities`

## Setup with entityConfig (Always Required)

Use `entityConfig` to centralise entity definition, ID selector, and optional collection name. Reuse the **same config constant** across all operations.

```typescript
import { entityConfig, withEntities } from "@ngrx/signals/entities";
import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from "@ngrx/signals";

const taskEntityConfig = entityConfig({
  entity: type<Task>(), // Type helper (no value at runtime)
  collection: "task", // Prefixes store signals: taskIds, taskEntityMap, taskEntities
  selectId: (task: Task) => task.id, // Custom ID selector
});

export const TaskStore = signalStore(
  { providedIn: "root" },
  withState({ loading: false, error: null as string | null }),
  withEntities(taskEntityConfig),
  // methods follow...
);
```

### Signals Added by withEntities

When `collection: 'task'` is specified:

| Signal          | Type                      | Description               |
| --------------- | ------------------------- | ------------------------- |
| `taskIds`       | `Signal<EntityId[]>`      | Ordered array of IDs      |
| `taskEntityMap` | `Signal<EntityMap<Task>>` | Map of id → entity        |
| `taskEntities`  | `Signal<Task[]>`          | Ordered array of entities |

Without a named collection, signals are `ids`, `entityMap`, `entities`.

## Entity Updaters (use with patchState)

All updaters are imported from `@ngrx/signals/entities` and passed to `patchState`.

### Create

```typescript
import {
  addEntity,
  addEntities,
  setEntity,
  setAllEntities,
} from "@ngrx/signals/entities";

// Add a single entity (error if ID already exists)
patchState(store, addEntity(task, taskEntityConfig));

// Add or replace a single entity
patchState(store, setEntity(task, taskEntityConfig));

// Replace entire collection
patchState(store, setAllEntities(tasks, taskEntityConfig));

// Add multiple entities
patchState(store, addEntities(tasks, taskEntityConfig));
```

### Update

```typescript
import {
  updateEntity,
  updateEntities,
  updateAllEntities,
} from "@ngrx/signals/entities";

// Partial update by ID
patchState(
  store,
  updateEntity({ id: task.id, changes: { completed: true } }, taskEntityConfig),
);

// Partial update matching predicate
patchState(
  store,
  updateEntities(
    { predicate: (t) => t.status === "pending", changes: { status: "done" } },
    taskEntityConfig,
  ),
);

// Update all entities
patchState(store, updateAllEntities({ completed: true }, taskEntityConfig));
```

### Delete

```typescript
import {
  removeEntity,
  removeEntities,
  removeAllEntities,
} from "@ngrx/signals/entities";

// Remove by ID — no custom selectId needed for remove operations
patchState(store, removeEntity(task.id, taskEntityConfig));

// Remove matching predicate
patchState(
  store,
  removeEntities((t) => !t.text, taskEntityConfig),
);

// Remove all
patchState(store, removeAllEntities(taskEntityConfig));
```

## Full CRUD Store Example

```typescript
const taskEntityConfig = entityConfig({
  entity: type<Task>(),
  collection: "task",
  selectId: (task: Task) => task.id,
});

export const TaskStore = signalStore(
  { providedIn: "root" },
  withState({ loading: false, error: null as string | null }),
  withEntities(taskEntityConfig),
  withMethods((store, api = inject(TaskApi)) => ({
    loadTasks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.getAll().pipe(
            tapResponse({
              next: (tasks) =>
                patchState(store, setAllEntities(tasks, taskEntityConfig), {
                  loading: false,
                }),
              error: () =>
                patchState(store, {
                  loading: false,
                  error: "Failed to load tasks",
                }),
            }),
          ),
        ),
      ),
    ),

    addTask(task: Task): void {
      patchState(store, addEntity(task, taskEntityConfig));
    },

    updateTask(id: string, changes: Partial<Task>): void {
      patchState(store, updateEntity({ id, changes }, taskEntityConfig));
    },

    removeTask(id: string): void {
      patchState(store, removeEntity(id, taskEntityConfig));
    },
  })),
);
```

## Rules

- Always use `entityConfig` — never hardcode collection strings in updater calls
- Do **not** create parallel arrays/maps that duplicate the entity collection
- Loading/error/selection metadata belongs in `withState`, not inside entities
- Use `setAllEntities` when the API returns the full list (e.g., after load)
- Use `addEntity`/`updateEntity`/`removeEntity` for optimistic or confirmed mutations
