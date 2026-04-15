---
description: "Use when writing or refactoring NgRx Signal Store files that manage entity collections with withEntities/entityConfig/selectId and CRUD entity operations."
applyTo: "**/*store.ts"
---

# NgRx Signal Store Entity Adapter Guide

Apply these rules to store files that manage entity collections.

## Required Setup

- Use `entityConfig` for every entity collection.
- Define `entity`, `collection`, and `selectId` in the config.
- Use `withEntities(entityConfig)` in `signalStore`.
- Keep a stable `selectId`; never derive IDs from mutable fields.

## Entity Operations

- Prefer adapter operations over manual array/object updates.
- Use `addEntity` for create operations.
- Use `updateEntity` for partial updates.
- Use `removeEntity` for deletes.
- Use `setAllEntities` when replacing the full collection.
- Apply updates with `patchState(store, <entityOperation>)`.

## Consistency Rules

- Use one named config constant per collection (for example `taskEntityConfig`).
- Reuse the same config constant across all operations.
- Do not mix adapter-managed collections with parallel duplicate state arrays.
- Keep loading/error/selection metadata in regular `withState` fields.

## Side Effects and API Integration

- Use `rxMethod` for Observable-based API workflows.
- Wrap HTTP flows with loading and error state updates.
- Keep entity writes inside store methods; do not mutate adapter state outside the store.

## Preferred Pattern

```ts
const taskEntityConfig = entityConfig({
  entity: type<Task>(),
  collection: 'tasks',
  selectId: (task: Task) => task.id,
});

export const TaskStore = signalStore(
  withState({ loading: false, error: null as string | null }),
  withEntities(taskEntityConfig),
  withMethods((store) => ({
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
