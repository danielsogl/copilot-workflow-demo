# @ngrx/signals — API Reference

Idiomatic, runnable examples of every primitive in the library. Read the section that matches the task; you do not need to load this whole file unless you're new to the API.

## Table of contents

- [signalStore](#signalstore)
- [withState](#withstate)
- [withComputed](#withcomputed)
- [withMethods](#withmethods)
- [withProps](#withprops)
- [withHooks](#withhooks)
- [patchState](#patchstate)
- [getState](#getstate)
- [signalState (component-local)](#signalstate-component-local)
- [rxMethod](#rxmethod)
- [signalMethod](#signalmethod)
- [Private members (`_` prefix)](#private-members-_-prefix)
- [Provider configuration](#provider-configuration)

## signalStore

Factory that returns an injectable Angular service class assembled from the features you pass.

```typescript
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';

export const CounterStore = signalStore(
  { providedIn: 'root' },        // optional
  withState({ count: 0 }),
  withComputed(({ count }) => ({
    doubleCount: () => count() * 2,
  })),
  withMethods((store) => ({
    increment(): void {
      patchState(store, ({ count }) => ({ count: count + 1 }));
    },
  }))
);
```

Inject like any other service:

```typescript
const counter = inject(CounterStore);
counter.count();        // signal getter
counter.doubleCount();  // computed getter
counter.increment();    // method
```

## withState

Declares state slices. Each top-level key becomes a `Signal<T>` on the store.

**Always type the state explicitly.** This makes `patchState` errors point at the right place.

```typescript
import { signalStore, withState } from '@ngrx/signals';

type BookSearchState = {
  books: Book[];
  isLoading: boolean;
  filter: { query: string; order: 'asc' | 'desc' };
};

const initialState: BookSearchState = {
  books: [],
  isLoading: false,
  filter: { query: '', order: 'asc' },
};

export const BookSearchStore = signalStore(withState(initialState));
```

Nested state slices are exposed as deep signals (each key in the nested object becomes its own readable signal accessor where possible).

## withComputed

Creates derived signals. The factory runs in an injection context, so you can `inject(...)` services here too.

```typescript
import { computed } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';

export const BookSearchStore = signalStore(
  withState(initialState),
  withComputed(({ books, filter }) => ({
    booksCount: computed(() => books().length),
    sortedBooks: computed(() => {
      const direction = filter.order() === 'asc' ? 1 : -1;
      return books().toSorted((a, b) => direction * a.title.localeCompare(b.title));
    }),
  }))
);
```

Computed values are memoized and only recompute when the underlying signals change.

## withMethods

Adds methods to the store. The factory receives the store instance (with state, computed, and any earlier props) and runs in an injection context.

```typescript
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export const BookSearchStore = signalStore(
  withState(initialState),
  withMethods((store, booksService = inject(BooksService)) => ({
    updateQuery(query: string): void {
      patchState(store, (state) => ({
        filter: { ...state.filter, query },
      }));
    },
    async loadBooks(): Promise<void> {
      patchState(store, { isLoading: true });
      const books = await booksService.getAll();
      patchState(store, { books, isLoading: false });
    },
  }))
);
```

Inject services as default parameters — this keeps the method body free of `inject()` calls and lets test code override via `provide:`.

## withProps

Attaches non-reactive properties to the store. Useful for grouping injected dependencies that other features will use.

```typescript
import { inject } from '@angular/core';
import { signalStore, withProps, withState } from '@ngrx/signals';

export const BooksStore = signalStore(
  withState<BooksState>({ books: [], isLoading: false }),
  withProps(() => ({
    booksService: inject(BooksService),
    logger: inject(Logger),
  })),
  withMethods(({ booksService, logger, ...store }) => ({
    async loadBooks(): Promise<void> {
      logger.debug('Loading books...');
      patchState(store, { isLoading: true });
      const books = await booksService.getAll();
      patchState(store, { books, isLoading: false });
    },
  }))
);
```

## withHooks

Lifecycle hooks called when the store is created/destroyed.

```typescript
import { signalStore, withHooks, withProps } from '@ngrx/signals';

export const BooksStore = signalStore(
  withProps(() => ({ logger: inject(Logger) })),
  withHooks({
    onInit({ logger }) {
      logger.debug('BooksStore initialized');
    },
    onDestroy({ logger }) {
      logger.debug('BooksStore destroyed');
    },
  })
);
```

The hook callbacks receive the fully-assembled store, so you can call methods (e.g. trigger an initial load).

## patchState

Immutable state update. Three forms:

```typescript
import { patchState } from '@ngrx/signals';

// 1. Partial state object — shallow-merge.
patchState(store, { isLoading: true });

// 2. Updater function — receives current state, returns partial.
patchState(store, (state) => ({ count: state.count + 1 }));

// 3. Spread of named updaters (composable).
patchState(store, setPending(), setQuery('angular'));
```

Custom updaters are just functions that return one of forms 1 or 2:

```typescript
function setPending(): Partial<RequestStatusState> {
  return { requestStatus: 'pending' };
}

function setError(message: string): Partial<RequestStatusState> {
  return { requestStatus: { error: message } };
}
```

Custom updaters are the right tool when the same state shape is patched in many places. Define them next to the feature that owns the state.

## getState

Snapshot read of the entire state object — useful for capturing a "before" copy for rollback.

```typescript
import { getState, patchState } from '@ngrx/signals';

const previous = getState(store);
patchState(store, { items: optimistic });
try {
  await api.save(optimistic);
} catch (e) {
  patchState(store, { items: previous.items });
  throw e;
}
```

## signalState (component-local)

For pure component-local state where a full store is overkill, use `signalState`. It is a smaller version of `withState` you can use directly inside a component.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';

@Component({
  selector: 'ngrx-counter',
  template: `
    <p>Count: {{ state.count() }}</p>
    <button (click)="increment()">+</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Counter {
  readonly state = signalState({ count: 0 });
  increment(): void {
    patchState(this.state, (s) => ({ count: s.count + 1 }));
  }
}
```

If you reach for a Signal Store for state used in exactly one component and never re-injected, prefer `signalState` (or even a plain `signal()`).

## rxMethod

Bridges RxJS into the store. Use when you need RxJS operators — `debounceTime`, `switchMap`, retry, cancellation. The argument can be:

- A value (becomes a one-shot stream),
- An `Observable<T>` (subscribed),
- A `Signal<T>` (converted to an observable internally and re-emits on changes).

```typescript
import { inject } from '@angular/core';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

export const BookSearchStore = signalStore(
  withState(initialState),
  withMethods((store, booksService = inject(BooksService)) => ({
    loadByQuery: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
        switchMap((query) =>
          booksService.getByQuery(query).pipe(
            tapResponse({
              next: (books) => patchState(store, { books, isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            })
          )
        )
      )
    ),
  }))
);
```

Use `tapResponse` from `@ngrx/operators` rather than a bare `subscribe` — it preserves error propagation and avoids breaking the outer stream.

## signalMethod

Pure-signal alternative to `rxMethod` (v19+). Use when input is a value or signal and the body is synchronous (or just needs an `effect`-like reaction).

```typescript
import { signalStore, signalMethod, withMethods, withState, patchState } from '@ngrx/signals';

export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),
  withMethods((store) => ({
    incrementBy: signalMethod<number>((step) => {
      patchState(store, ({ count }) => ({ count: count + step }));
    }),
  }))
);
```

When called with a signal, the method re-runs whenever the signal changes — so it's the right tool for "react to a signal" without dragging in RxJS.

## Private members (`_` prefix)

Prefix any state slice, computed signal, prop, or method with `_` to make it private to the store. Public callers cannot access it; other features inside the same store can.

```typescript
export const CounterStore = signalStore(
  withState({ count: 0, _audit: [] as string[] }),
  withMethods((store) => ({
    increment(): void {
      store._record('increment');
      patchState(store, ({ count }) => ({ count: count + 1 }));
    },
    _record(event: string): void {
      patchState(store, ({ _audit }) => ({ _audit: [..._audit, event] }));
    },
  }))
);
```

Use private members to enforce a clean public API. From outside, only `count` and `increment` are visible.

## Provider configuration

The first argument to `signalStore` may be a config object:

```typescript
signalStore(
  { providedIn: 'root' },
  withState(...),
);
```

Common shapes:

- `{ providedIn: 'root' }` — singleton across the app.
- Omit the config — the store is **not** providedIn anything; consumers must list it in `providers: [Store]` on a component or route. Use this for component- or route-scoped state that should be created/destroyed with its host.

Component-scoped example:

```typescript
@Component({
  selector: 'app-cart-page',
  providers: [CartStore],   // a fresh store per CartPageComponent instance
  ...
})
export class CartPageComponent {
  readonly cart = inject(CartStore);
}
```
