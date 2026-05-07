---
name: ngrx-signals
description: Build, refactor, and architect Angular state with the @ngrx/signals Signal Store. Use whenever the user mentions signalStore, withState, withMethods, withComputed, withHooks, signalStoreFeature, withEntities, rxMethod, signalMethod, patchState, or wants to refactor BehaviorSubject/service-based state to Signal Store. Also use for designing custom store features, request status, optimistic updates, entity collections, and the store/service split in Angular. Do NOT use for @ngrx/store (classic Redux), createReducer/createEffect, or generic RxJS questions unrelated to Signal Store.
---

# NgRx Signal Store

Modern, lightweight, signal-based state management for Angular. This skill produces idiomatic, type-safe, well-architected `@ngrx/signals` code.

## When to use this skill

Trigger on any of these signals:

- The user names the API: `signalStore`, `signalStoreFeature`, `withState`, `withMethods`, `withComputed`, `withHooks`, `withProps`, `withEntities`, `rxMethod`, `signalMethod`, `patchState`, `getState`, `signalState`.
- The user wants to **refactor** a service that uses `BehaviorSubject`/`Subject` or a class with mutable fields into a Signal Store.
- The user asks for **feature/page state** in Angular and either mentions Angular Signals or asks for a "modern" approach.
- The user wants a **custom store feature** (`withRequestStatus`, `withSelectedEntity`, `withLogger`, etc.) or asks how to compose features.
- The user asks about **optimistic updates**, **request status**, **entity collections**, or **CRUD against an HTTP API** in an Angular feature.

Do NOT use for classic `@ngrx/store` (actions, reducers, effects, separate-file selectors), Redux DevTools wiring without Signal Store, or pure RxJS pipeline questions.

## Mental model

A Signal Store is a tree of composed **features**. Each feature contributes some combination of state, computed signals, methods, props, and lifecycle hooks. Composition happens at definition time:

```typescript
export const FooStore = signalStore(
  { providedIn: 'root' },     // optional Angular provider config
  withState(initialState),    // declares state slices (signals)
  withComputed(...),          // derived signals
  withProps(...),             // non-reactive deps & values (often via inject())
  withMethods(...),           // actions / mutations
  withHooks({ onInit, onDestroy })
);
```

Three rules every Signal Store author needs to internalize:

1. **State updates go through `patchState(store, updater)`.** Direct mutation does not exist. Updaters can be a partial object, a function `(state) => Partial<State>`, or a custom updater that returns one of those.
2. **Stores are Angular providers.** Inject them with `inject(Store)` or `TestBed.inject(Store)`. Provide them at root, on a route, or on a component (`providers: [Store]`) for component-scoped state.
3. **Composition over inheritance.** Reuse comes from custom features built with `signalStoreFeature(...)`, not by extending classes.

## Canonical scaffold (use as a starting point)

For 80% of feature stores, this is the shape. Copy it, adapt it, then read the references for anything non-obvious.

```typescript
import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { FooApi } from "./foo.api";
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from "./with-request-status";

type FooState = {
  items: Foo[];
  filter: string;
};

const initialState: FooState = {
  items: [],
  filter: "",
};

export const FooStore = signalStore(
  { providedIn: "root" },
  withState<FooState>(initialState),
  withRequestStatus(),
  withComputed(({ items, filter }) => ({
    filteredItems: computed(() =>
      items().filter((i) => i.name.includes(filter())),
    ),
    count: computed(() => items().length),
  })),
  withMethods((store, api = inject(FooApi)) => ({
    setFilter(filter: string): void {
      patchState(store, { filter });
    },
    async loadAll(): Promise<void> {
      patchState(store, setPending());
      try {
        const items = await api.getAll();
        patchState(store, { items }, setFulfilled());
      } catch (e) {
        patchState(store, setError(e instanceof Error ? e.message : "Failed"));
      }
    },
  })),
);
```

For collections with stable IDs, swap `items: T[]` in state for `withEntities<T>()`. See `references/entities.md`.

## Workflow

1. **Decide the scope.** Component-local? `providers: [Store]`. App-wide? `{ providedIn: 'root' }`. Per-route? Provide on the route. Don't put route-scoped state in `root`.
2. **Decide on store/service split.** State, computed, and orchestration belong in the store. **HTTP / persistence / WebSocket / IndexedDB** belong in a separate service the store `inject()`s. Both pieces become independently testable; the backend can be swapped without touching the store.
3. **Type the state explicitly.** `withState<FooState>(initialState)` — never inferred-only. Future `patchState` callers depend on the type to catch typos.
4. **Compose features.** Pull request status, entity management, logging into `signalStoreFeature(...)` so they are reusable across stores.
5. **Pick the right async tool.**
   - **`async` method** for a single awaited call.
   - **`rxMethod<Input>(pipe(...))`** when you need RxJS operators (`debounceTime`, `switchMap`, retry, cancellation).
   - **`signalMethod<Input>((value) => ...)`** (v19+) when input is a signal/value and the body is synchronous — no RxJS overhead.
6. **Test through the public API only.** `TestBed.inject(Store)`, mock injected services with `provide:`, assert on signals + method effects.

## Wrong → Right (the corrections that matter most)

These are the mistakes that show up most often. Keep these patterns visible whenever generating code.

### 1. `updateEntity` — function form for state-dependent updates

```typescript
// ❌ Wrong: read entityMap manually then patch with a partial — race-prone
//          and leaks store internals into the method body.
const current = store.entityMap()[id];
patchState(
  store,
  updateEntity({ id, changes: { completed: !current.completed } }),
);

// ✅ Right: function-form changes — atomic, no manual lookup.
patchState(
  store,
  updateEntity({
    id,
    changes: (todo) => ({ completed: !todo.completed }),
  }),
);
```

### 2. `removeEntities` — predicate form, not filter+map

```typescript
// ❌ Wrong: pulls everything into the method body, fragile if signal shape changes.
const ids = store
  .entities()
  .filter((t) => t.completed)
  .map((t) => t.id);
patchState(store, removeEntities(ids));

// ✅ Right: predicate is evaluated against each entity by the updater.
patchState(
  store,
  removeEntities((todo) => todo.completed),
);
```

### 3. Optimistic update — snapshot with `getState`, restore on error

```typescript
// ❌ Wrong: no rollback path — the UI lies if the API call fails.
patchState(store, addEntity(item));
await api.add(item);

// ✅ Right: snapshot, patch optimistically, restore on failure.
const previous = getState(store);
patchState(store, addEntity(item));
try {
  await api.add(item);
} catch (e) {
  patchState(store, { entityMap: previous.entityMap, ids: previous.ids });
  throw e;
}
```

### 4. Request status — standalone updaters, not store-bound methods

```typescript
// ❌ Wrong: reaching into the store from the feature, can't compose into patchState calls.
withMethods((store) => ({
  setPending() {
    patchState(store, { requestStatus: "pending" });
  },
}));

// ✅ Right: standalone updater functions that return Partial<State>.
//          Compose with other updaters in a single patchState call.
export function setPending(): RequestStatusState {
  return { requestStatus: "pending" };
}
patchState(store, setAllEntities(items), setFulfilled());
```

### 5. Custom feature with prerequisites — typed overload

```typescript
// ❌ Wrong: bare signalStoreFeature — no compile error if used without withEntities.
export function withSelectedEntity<T>() {
  return signalStoreFeature(withState({ selectedId: null }) /* ... */);
}

// ✅ Right: declare prerequisite via { state: type<EntityState<T>>() }.
//          Now misuse is a compile error.
export function withSelectedEntity<T extends { id: EntityId }>() {
  return signalStoreFeature(
    { state: type<EntityState<T>>() },
    withState<{ selectedId: EntityId | null }>({ selectedId: null }),
    withComputed(({ selectedId, entityMap }) => ({
      selectedEntity: computed(() => {
        const id = selectedId();
        return id == null ? null : (entityMap()[id] ?? null);
      }),
    })),
    withMethods((store) => ({
      select(id: EntityId): void {
        patchState(store, { selectedId: id });
      },
      clearSelection(): void {
        patchState(store, { selectedId: null });
      },
    })),
  );
}
```

### 6. Refactoring `BehaviorSubject` — what maps to what

| Before                              | After                                              |
| ----------------------------------- | -------------------------------------------------- |
| `BehaviorSubject<T>` field          | state slice in `withState<FooState>(...)`          |
| `.next(...)`                        | `patchState(store, ...)`                           |
| `.value`                            | signal getter `store.foo()` (or `getState(store)`) |
| `combineLatest` / `map` derived obs | `withComputed(...)` returning `computed(...)`      |
| HTTP method on the service          | new `FooApi` service injected by the store         |
| Component subscribes via `\| async` | reads signal: `{{ store.foo() }}` (no async pipe)  |

## Output contract

When generating code:

- **Always** TypeScript with explicit state types and explicit imports from `@ngrx/signals` / `@ngrx/signals/entities` / `@ngrx/signals/rxjs-interop`.
- **Always** use `patchState` for mutations — never assign to signals directly.
- **Always** keep HTTP in a service injected via `inject(SomeApi)`; the store does not import `HttpClient`.
- **Prefer** named, typed updater functions (`setPending()`, `setError(msg)`) when the same update happens in multiple places.
- **Prefer** `withEntities<T>()` over a hand-rolled `T[]` array when items have stable `id`s.
- **Prefer** `signalMethod` over `rxMethod` when no RxJS operator is needed.
- Comment only when the WHY is non-obvious. Don't narrate the obvious.

## Pattern → reference quick map

Read the **one** reference file that matches the task. Most tasks need only one.

| Task                                           | Read                            |
| ---------------------------------------------- | ------------------------------- |
| Plain feature store, computed, methods         | `references/api-reference.md`   |
| `rxMethod` / `signalMethod` / RxJS bridge      | `references/api-reference.md`   |
| Entity collection (CRUD with IDs)              | `references/entities.md`        |
| Custom reusable feature (`withXxx`)            | `references/custom-features.md` |
| Architecture: scoping, optimistic, BS-refactor | `references/patterns.md`        |
| Tests: TestBed, mocks, signalMethod tests      | `references/testing.md`         |

If a task spans patterns (e.g., "entity store with optimistic updates and request status"), the scaffold above plus `entities.md` is usually enough.

## Anti-patterns to flag

If the request or existing code shows any of these, point it out:

- **Confusing `@ngrx/store` with `@ngrx/signals`.** Different packages. `createReducer`/`createEffect`/`@Effect` is classic NgRx, not Signal Store.
- **HTTP inside the store.** Push it into a service. The store should not import `HttpClient`.
- **Cross-store imports.** Stores never inject other stores. Lift state up, compose via a feature, or share a service.
- **Hand-rolled `T[]` arrays for entity data.** With stable IDs, use `withEntities<T>()`.
- **Direct signal mutation from outside.** `store.count.set(...)` breaks encapsulation. Expose a method.
- **`rxMethod` for trivial sync logic.** Use `signalMethod` (v19+) or a plain method.
- **Untyped state.** `withState({ count: 0 })` works; `withState<CounterState>({ count: 0 })` makes future patches type-safe.
