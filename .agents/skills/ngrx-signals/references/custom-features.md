# @ngrx/signals — Custom Store Features

`signalStoreFeature` is the composition primitive. A custom feature is a function that returns a feature; the body uses the same `withState`/`withComputed`/`withMethods`/`withHooks` calls as a store.

## Why custom features

- **Reuse.** `withRequestStatus()`, `withLogger('books')`, `withSelectedEntity<T>()` get added to many stores.
- **Cohesion.** Keep related state, computed, and methods in one named unit instead of scattering them across the store.
- **Type-safety across stores.** Features can declare what they expect from the host store, so you can't accidentally compose `withSelectedEntity` onto a store that doesn't have entities.

## Pattern: `withRequestStatus`

The canonical example. Every store with async loading wants this.

```typescript
import { computed } from '@angular/core';
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };
export type RequestStatusState = { requestStatus: RequestStatus };

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      error: computed(() => {
        const s = requestStatus();
        return typeof s === 'object' ? s.error : null;
      }),
    }))
  );
}

// Standalone updaters — return Partial<State>, callable via patchState(store, setX()).
export function setPending(): RequestStatusState {
  return { requestStatus: 'pending' };
}
export function setFulfilled(): RequestStatusState {
  return { requestStatus: 'fulfilled' };
}
export function setError(error: string): RequestStatusState {
  return { requestStatus: { error } };
}
```

Use it:

```typescript
import { withRequestStatus, setPending, setFulfilled } from './with-request-status';

export const BooksStore = signalStore(
  withState<BooksState>({ books: [] }),
  withRequestStatus(),
  withMethods((store, api = inject(BooksService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, setPending());
      const books = await api.getAll();
      patchState(store, { books }, setFulfilled());
    },
  }))
);
```

## Pattern: `withLogger`

Logs every state change in dev. Good intro to `withHooks` + `effect`.

```typescript
import { effect } from '@angular/core';
import { getState, signalStoreFeature, withHooks } from '@ngrx/signals';

export function withLogger(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = getState(store);
          console.log(`[${name}]`, state);
        });
      },
    })
  );
}
```

Add it as the **last** feature so it sees the fully-assembled state.

## Pattern: typed feature with input requirements

Sometimes a feature only makes sense on top of another (`withSelectedEntity` needs `withEntities`). Use the typed `signalStoreFeature` overload to declare what you require.

```typescript
import { computed } from '@angular/core';
import { signalStoreFeature, type, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { EntityId, EntityState } from '@ngrx/signals/entities';

type SelectedEntityState = { selectedId: EntityId | null };

export function withSelectedEntity<T extends { id: EntityId }>() {
  return signalStoreFeature(
    // Declare the prerequisite shape.
    { state: type<EntityState<T>>() },
    withState<SelectedEntityState>({ selectedId: null }),
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
    }))
  );
}

// Usage — order matters: withEntities first.
export const BooksStore = signalStore(
  withEntities<Book>(),
  withSelectedEntity<Book>()
);
```

Compile-time error if you put `withSelectedEntity` on a store without `withEntities`. That's the whole point of the typed declaration.

## Pattern: `withFeature` (v19+) for outside inputs

Sometimes a feature needs something computed from the store at composition time (e.g. an injected token configured by the caller). `withFeature(callback)` gives you a function that receives the store-so-far and returns a feature.

```typescript
import { withFeature } from '@ngrx/signals';

export const BooksStore = signalStore(
  withState<BooksState>({ books: [] }),
  withFeature((store) => withLogger(`Books(${store.books().length})`))
);
```

Most of the time you won't need this — prefer the plain function form.

## Composition rules

- A feature is just a function. Name it `withXxx`. Return `signalStoreFeature(...)`.
- Order matters. Features can only see what's been declared **above** them.
- Keep features small. If `withCart` adds 5 state slices and 12 methods, it's not a feature, it's a store.
- Test features in isolation by wrapping them in a minimal `signalStore` (see `testing.md`).

## When NOT to use a custom feature

- Logic used in only one store. Just inline it.
- "Generic" wrappers around `inject()`. Use a service.
- Anything that does I/O. That belongs in a service the feature/store calls.
