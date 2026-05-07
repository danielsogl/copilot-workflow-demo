---
description: Generate an NgRx Signal Store with full CRUD operations for a specified entity, plus models, infrastructure service, and tests.
argument-hint: <entity-name> [domain-name]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm:*)
---

Generate a complete NgRx Signal Store with CRUD operations for the entity **$1** in the **$2** domain (defaults to `$1` pluralized if omitted), following the project's architecture and best practices defined in @CLAUDE.md.

This command is best paired with the `signal-store-creator` subagent — invoke it via `/agents` if you want a guided setup, or follow the steps below for a direct generation.

## Prerequisites

1. The entity model **$1** is defined or will be created at `src/app/features/$2/data/models/$1.model.ts`.
2. The store name follows the pattern `${PascalCase($1)}Store` (e.g., `UserStore`, `TaskStore`).

## Steps

### 1. Entity & service analysis

- Analyze the entity model — structure, properties, relationships.
- Check whether an Angular service with HTTP CRUD methods already exists.
- If not, create one with these demo endpoints (adapt to the entity):

```typescript
get$1s(): Observable<$1[]>
get$1ById(id: string): Observable<$1>
create$1($1: Create$1Request): Observable<$1>
update$1(id: string, updates: Partial<$1>): Observable<$1>
delete$1(id: string): Observable<void>
```

### 2. Signal Store

```typescript
export interface $1State {
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initial$1State: $1State = {
  loading: false,
  error: null,
  selectedId: null,
};

const $1EntityConfig = entityConfig({
  entity: type<$1>(),
  collection: "$1s",
  selectId: (e: $1) => e.id,
});

export const $1Store = signalStore(
  { providedIn: "root" },
  withState(initial$1State),
  withEntities($1EntityConfig),
  // computed: selected$1, total$1Count, hasData, isEmpty
  // methods: load$1s, load$1ById, create$1, update$1, delete$1, select$1
);
```

### 3. Required CRUD methods

Implement all CRUD via `rxMethod` for Observable-based service calls:

1. **Load all:** `load$1s(): void`
2. **Load by ID:** `load$1ById(id: string): void`
3. **Create:** `create$1(data: Create$1Request): void`
4. **Update:** `update$1(id: string, updates: Partial<$1>): void`
5. **Delete:** `delete$1(id: string): void`
6. **Select:** `select$1(id: string | null): void`

### 4. Computed properties

- `selected$1` — currently selected entity
- `total$1Count` — total number of entities
- `hasData` — whether any entities are loaded
- `isEmpty` — whether the collection is empty

### 5. Error handling

- `tapResponse` for proper error handling in all async ops
- Set loading states appropriately for each operation
- Clear errors when starting new operations

### 6. State & entity ops

- `patchState` for all state updates — no direct mutation
- Atomic entity ops: `addEntity`, `updateEntity`, `removeEntity`, `setAllEntities`
- Pass `entityConfig` to all entity updaters for type safety
- Handle optimistic updates where appropriate

### 7. Service integration

- Inject the service with `inject()` inside `withMethods`
- Use `rxMethod` for all Observable-based ops
- Never convert Observables to Promises in store methods

## File structure

```
src/app/features/$2/
  data/
    models/$1.model.ts        # Entity interface & DTOs
    infrastructure/
      $1-api.ts               # HttpClient service
      $1-api.spec.ts          # Service tests
    state/
      $1-store.ts             # Signal store
      $1-store.spec.ts        # Store tests
```

## References

- Existing reference: `src/app/features/tasks/data/state/task-store.ts`
- Use `mcp__context7__query-docs` for `/ngrx/platform` with `signal store v21` if unsure about new APIs (`withFeature`, `withLinkedState`, `withProps`, `withHooks`).

## Integration example

Provide a short integration example showing:

- Store injection in a feature component
- Signal binding in templates (`@if (store.hasData()) { @for (e of store.entitiesEntities(); track e.id) {} }`)
- Method calls for CRUD operations
- Loading and error state handling
