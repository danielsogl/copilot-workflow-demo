# Custom Features: signalStoreFeature, withFeature, withHooks, withLinkedState

Sources:

- https://ngrx.io/guide/signals/signal-store/custom-store-features
- https://ngrx.io/guide/signals/signal-store/lifecycle-hooks
- https://ngrx.io/guide/signals/signal-store/linked-state

## signalStoreFeature

Creates a **reusable composition unit** — bundles state, computed, methods, and hooks. Compose multiple base features or other custom features.

```typescript
import {
  signalStoreFeature,
  withState,
  withMethods,
  withComputed,
} from "@ngrx/signals";

export function withRequestStatus() {
  return signalStoreFeature(
    withState({
      loading: false,
      error: null as string | null,
    }),
    withComputed(({ loading, error }) => ({
      isPending: computed(() => loading()),
      hasError: computed(() => error() !== null),
    })),
    withMethods((store) => ({
      _setLoading(): void {
        patchState(store, { loading: true, error: null });
      },
      _setError(error: string): void {
        patchState(store, { loading: false, error });
      },
      _setLoaded(): void {
        patchState(store, { loading: false });
      },
    })),
  );
}

// Usage
export const BooksStore = signalStore(
  withEntities<Book>(),
  withRequestStatus(),
  withMethods((store, api = inject(BooksApi)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => store._setLoading()),
        switchMap(() =>
          api.getAll().pipe(
            tapResponse({
              next: (books) => {
                patchState(store, setAllEntities(books, bookConfig));
                store._setLoaded();
              },
              error: (err: HttpErrorResponse) => store._setError(err.message),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

## withFeature (Dynamic Feature Inputs)

Use `withFeature` when you need to pass values from the **current store** into a custom feature. This allows features that depend on existing store signals.

```typescript
import { withFeature } from "@ngrx/signals";

export function withBooksFilter(books: Signal<Book[]>) {
  return signalStoreFeature(
    withState({ query: "" }),
    withComputed(({ query }) => ({
      filteredBooks: computed(() =>
        books().filter((b) => b.name.includes(query())),
      ),
    })),
    withMethods((store) => ({
      setQuery(query: string): void {
        patchState(store, { query });
      },
    })),
  );
}

export const BooksStore = signalStore(
  withEntities<Book>(),
  // 👇 withFeature passes entities signal into the custom feature
  withFeature(({ entities }) => withBooksFilter(entities)),
);
```

## withHooks (Lifecycle)

Runs logic when the store is **initialized** or **destroyed**. The only way to set up effects or subscriptions that run for the store's lifetime.

```typescript
import { effect } from "@angular/core";
import { getState, withHooks } from "@ngrx/signals";

withHooks({
  onInit(store) {
    // Load data on store creation
    store.loadAll();

    // React to all state changes
    effect(() => {
      console.log("state:", getState(store));
    });
  },
  onDestroy(store) {
    // Cleanup if needed
    console.log("store destroyed");
  },
});
```

### Logging Feature (withHooks in signalStoreFeature)

```typescript
export function withLogger(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          console.log(`[${name}] state:`, getState(store));
        });
      },
    }),
  );
}
```

## withLinkedState

Adds a **writable state slice** whose value is automatically re-derived whenever its source signals change. Use for selection state that should reset when the underlying collection changes.

### Implicit (computation function — simple reset)

```typescript
import { withLinkedState } from "@ngrx/signals";

withLinkedState(({ options }) => ({
  // Resets to first option whenever options changes
  selectedOption: () => options()[0] ?? undefined,
}));
```

### Explicit (linkedSignal — preserve previous value)

```typescript
import { linkedSignal } from "@angular/core";
import { withLinkedState } from "@ngrx/signals";

withLinkedState(({ options }) => ({
  selectedOption: linkedSignal<Option[], Option>({
    source: options,
    computation: (newOptions, previous) => {
      // Try to keep the same item selected across option changes
      return (
        newOptions.find((o) => o.id === previous?.value.id) ?? newOptions[0]
      );
    },
  }),
}));
```

`withLinkedState` slices support `patchState` just like regular `withState` slices:

```typescript
withMethods((store) => ({
  select(option: Option): void {
    patchState(store, { selectedOption: option });
  },
}));
```

## Composition Order

Features are applied **top to bottom** — each feature can only access members defined in earlier features:

```
signalStore(
  withState(...)           // 1st — base state
  withEntities(...)        // 2nd — entity collection
  withLinkedState(...)     // 3rd — can access state & entities
  withComputed(...)        // 4th — can access all above
  withMethods(...)         // 5th — full store access
  withHooks(...)           // 6th — runs after store is fully built
)
```
