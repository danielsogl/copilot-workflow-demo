# @ngrx/signals — API Reference

Idiomatic, runnable examples of every primitive in the library (verified against `@ngrx/signals` 22). Read the section that matches the task; you do not need to load this whole file unless you're new to the API.

## Table of contents

- [signalStore](#signalstore)
- [withState](#withstate)
- [withComputed](#withcomputed)
- [withLinkedState](#withlinkedstate)
- [withMethods](#withmethods)
- [withProps](#withprops)
- [withHooks](#withhooks)
- [patchState](#patchstate)
- [getState / watchState](#getstate--watchstate)
- [signalState (component-local)](#signalstate-component-local)
- [rxMethod](#rxmethod)
- [signalMethod](#signalmethod)
- [Private members (`_` prefix)](#private-members-_-prefix)
- [Provider configuration](#provider-configuration)
- [Events plugin (`@ngrx/signals/events`)](#events-plugin-ngrxsignalsevents)
- [Resource extensions (`@ngrx/signals/resource`)](#resource-extensions-ngrxsignalsresource)

## signalStore

Factory that returns an injectable Angular service class assembled from the features you pass.

```typescript
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

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

Nested object literals are exposed as deep signals: `store.filter.query()` works. Since v22 this also applies to union members, so a `user: { name: string } | null` slice becomes `DeepSignal<{ name: string }> | Signal<null>`.

`withState` also accepts a **factory**, which runs in an injection context. Use it when initial state comes from DI:

```typescript
const BOOK_SEARCH_STATE = new InjectionToken<BookSearchState>('BookSearchState', {
  factory: () => initialState,
});

export const BookSearchStore = signalStore(
  withState(() => inject(BOOK_SEARCH_STATE))
);
```

## withComputed

Creates derived signals. The factory runs in an injection context, so you can `inject(...)` services here too. It receives state, props, and methods declared above it.

```typescript
import { computed } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';

export const BookSearchStore = signalStore(
  withState(initialState),
  withComputed(({ books, filter }) => ({
    booksCount: computed(() => books().length),
    sortedBooks: computed(() => {
      const direction = filter.order() === 'asc' ? 1 : -1;
      return [...books()].sort((a, b) => direction * a.title.localeCompare(b.title)); // toSorted needs lib es2023; Angular CLI targets ES2022
    }),
  }))
);
```

A plain computation function (`booksCount: () => books().length`) is shorthand for `computed(...)`. Computed values are memoized and only recompute when the underlying signals change.

## withLinkedState

State that **resets when its source changes but stays writable** (Angular's `linkedSignal`, as store state). Use it instead of an `effect` or a method that re-syncs one slice when another changes. Linked slices are regular state: deep signals, updatable via `patchState`.

```typescript
import { linkedSignal } from '@angular/core';
import { patchState, signalStore, withLinkedState, withMethods, withState } from '@ngrx/signals';

type Option = { id: number; label: string };

export const OptionsStore = signalStore(
  withState({ options: [] as Option[] }),
  withLinkedState(({ options }) => ({
    // Computation function: resets to the first option whenever options change.
    selectedOption: () => options()[0] ?? null,
    // linkedSignal: keeps the previous selection if it still exists.
    stickyOption: linkedSignal<Option[], Option | null>({
      source: options,
      computation: (next, prev) =>
        next.find((o) => o.id === prev?.value?.id) ?? next[0] ?? null,
    }),
  })),
  withMethods((store) => ({
    select(selectedOption: Option): void {
      patchState(store, { selectedOption });
    },
  }))
);
```

## withMethods

Adds methods to the store. The factory receives the store instance (with state, computed, and any earlier props/methods) and runs in an injection context.

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

Attaches non-reactive properties to the store. Useful for grouping injected dependencies that other features will use, or for exposing derived non-signal values (e.g. `toObservable(isLoading)`).

```typescript
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';

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

Prefix props with `_` (`_booksService`) if they should not be visible to store consumers.

## withHooks

Lifecycle hooks called when the store is created/destroyed.

```typescript
import { inject } from '@angular/core';
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

State is **protected** by default: `patchState(store, ...)` from outside the store (component, other service) is a compile error. Expose a method instead.

## getState / watchState

`getState` is a snapshot read of the entire state object — useful for capturing a "before" copy for rollback.

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

`watchState` runs a watcher **synchronously on every state change** (unlike `effect`, which batches). Call it in an injection context (e.g. `onInit`); it is cleaned up with the store.

```typescript
withHooks({
  onInit(store) {
    watchState(store, (state) => console.log('[Books]', state));
  },
})
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

- A static value (one-shot emission),
- An `Observable<T>` (subscribed),
- A `Signal<T>` or a computation function `() => T` (re-emits on changes).

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

**Injection context:** passing a signal, computation function, or observable **outside** an injection context is deprecated (warns since v21.1, will throw). Call it in a constructor/field initializer, or pass the caller's injector: `store.loadByQuery(query, { injector })`. The subscription then lives as long as that injector.

## signalMethod

Pure-signal alternative to `rxMethod`. Use when input is a value, signal, or computation function and the body is synchronous (or just needs an `effect`-like reaction).

```typescript
import { patchState, signalMethod, signalStore, withMethods, withState } from '@ngrx/signals';

export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),
  withMethods((store) => ({
    incrementBy: signalMethod<number>((step) => {
      patchState(store, ({ count }) => ({ count: count + step }));
    }),
  }))
);

// In a component:
store.incrementBy(5);                             // one-shot
store.incrementBy(this.step);                     // re-runs when the signal changes
store.incrementBy(() => this.a() + this.b());     // computation function
```

The same injection-context rule as `rxMethod` applies to signal / computation-function inputs (`{ injector }` config otherwise).

## Private members (`_` prefix)

Prefix any state slice, computed signal, prop, or method with `_` to make it private to the store. Public callers cannot access it; features declared **after** it in the same store can.

```typescript
export const CounterStore = signalStore(
  withState({ count: 0, _audit: [] as string[] }),
  withMethods((store) => ({
    _record(event: string): void {
      patchState(store, ({ _audit }) => ({ _audit: [..._audit, event] }));
    },
  })),
  // A method can't call a sibling from the same withMethods factory — use a second one.
  withMethods((store) => ({
    increment(): void {
      store._record('increment');
      patchState(store, ({ count }) => ({ count: count + 1 }));
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
- `{ providedIn: 'platform' }` — shared across multiple Angular apps on the same page (micro-frontends). Rare.
- Omit the config — the store is **not** providedIn anything; consumers must list it in `providers: [Store]` on a component or route. Use this for component- or route-scoped state that should be created/destroyed with its host.
- `{ protectedState: false }` — allows `patchState` from outside the store. Avoid; in tests use `unprotected(store)` from `@ngrx/signals/testing` instead.

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

## Events plugin (`@ngrx/signals/events`)

Opt-in Flux-style layer (stable since v21). Reach for it when **several stores must react to the same thing** (logout clears cart + profile) or you want decoupled, traceable flows. For a single store, plain methods are simpler.

```typescript
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { signalStore, type, withState } from '@ngrx/signals';
import { Events, eventGroup, injectDispatch, on, withEventHandlers, withReducer } from '@ngrx/signals/events';
import { mapResponse } from '@ngrx/operators';

export const bookSearchEvents = eventGroup({
  source: 'Book Search Page',
  events: { opened: type<void>(), queryChanged: type<string>() },
});
export const booksApiEvents = eventGroup({
  source: 'Books API',
  events: { loadedSuccess: type<Book[]>(), loadedFailure: type<string>() },
});

export const BookSearchStore = signalStore(
  withState<SearchState>({ query: '', books: [], isLoading: false }),
  withReducer(
    on(bookSearchEvents.queryChanged, ({ payload: query }) => ({ query, isLoading: true })),
    on(booksApiEvents.loadedSuccess, ({ payload: books }) => ({ books, isLoading: false })),
    on(booksApiEvents.loadedFailure, () => ({ isLoading: false })),
  ),
  withEventHandlers((store, events = inject(Events), api = inject(BooksService)) => ({
    loadBooks$: events.on(bookSearchEvents.opened, bookSearchEvents.queryChanged).pipe(
      switchMap(() =>
        api.getByQuery(store.query()).pipe(
          mapResponse({
            next: (books) => booksApiEvents.loadedSuccess(books),
            error: (e: { message: string }) => booksApiEvents.loadedFailure(e.message),
          })
        )
      )
    ),
  }))
);

// Component: const dispatch = injectDispatch(bookSearchEvents); dispatch.queryChanged('ngrx');
```

- `withEffects` was **renamed to `withEventHandlers`** in v21 (`ng update` migrates it).
- Events returned from a handler stream are dispatched automatically.
- Dispatch can be scoped: `dispatch({ scope: 'parent' }).opened()` / `'global'`; provide a local scope with `provideDispatcher()`.

## Resource extensions (`@ngrx/signals/resource`)

**Experimental (v22).** Wraps an Angular `resource`/`httpResource` to change what `value()` returns while loading or on error, keeping the resource type.

```typescript
import { httpResource } from '@angular/common/http';
import { extendResource, withPreviousValueOnLoading, withValueOnError } from '@ngrx/signals/resource';

readonly todosResource = extendResource(
  httpResource<Todo[]>(() => `/api/todos?page=${this.page()}`),
  withPreviousValueOnLoading(),   // no flicker while paginating
  withValueOnError(undefined),    // value() doesn't throw on error
);
```

Also: `withValueOnLoading(v)`, `withPreviousValueOnError()`, and `provideResourceExtensions(...)` to set defaults per app/route/component. Inside a store, create the resource in `withProps` (prefix `_` to keep it private) and derive signals in `withComputed`.
