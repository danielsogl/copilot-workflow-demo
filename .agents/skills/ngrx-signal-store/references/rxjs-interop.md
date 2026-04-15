# RxJS Interop: rxMethod, tapResponse

Sources:

- https://ngrx.io/guide/signals/signal-store (rxMethod)
- https://ngrx.io/guide/operators (tapResponse)

Imports:

- `rxMethod` → `@ngrx/signals/rxjs-interop`
- `tapResponse` → `@ngrx/operators`

## rxMethod

`rxMethod` wraps an RxJS operator pipeline into a store method. Use it whenever a service returns an `Observable` or when you need RxJS operators like `debounceTime`, `switchMap`, `mergeMap`, `distinctUntilChanged`.

The method accepts: a **signal**, a **static value**, or an **Observable** — and automatically subscribes/unsubscribes with the store's lifetime.

### Signature

```typescript
rxMethod<Input>(pipeline: (source$: Observable<Input>) => Observable<unknown>)
```

### Basic Example

```typescript
import { inject } from "@angular/core";
import { pipe, switchMap, tap } from "rxjs";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";

export const BooksStore = signalStore(
  withState({
    books: [] as Book[],
    loading: false,
    error: null as string | null,
  }),
  withMethods((store, booksService = inject(BooksService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          booksService.getAll().pipe(
            tapResponse({
              next: (books) => patchState(store, { books, loading: false }),
              error: (err: HttpErrorResponse) =>
                patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

### Reactive Search with Debounce

```typescript
loadByQuery: rxMethod<string>(
  pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => patchState(store, { loading: true })),
    switchMap((query) =>
      booksService.getByQuery(query).pipe(
        tapResponse({
          next: (books) => patchState(store, { books, loading: false }),
          error: (err: HttpErrorResponse) =>
            patchState(store, { loading: false, error: err.message }),
        })
      )
    )
  )
),
```

### Calling rxMethod

```typescript
const store = inject(BooksStore);

// Static value
store.loadByQuery("angular");

// Signal — re-runs whenever signal value changes
store.loadByQuery(this.searchQuery);

// Observable
store.loadByQuery(searchQuery$);
```

## tapResponse

`tapResponse` is a pipeable operator that handles Observable next/error paths. It prevents unhandled errors from terminating the stream.

```typescript
import { tapResponse } from "@ngrx/operators";

someObservable.pipe(
  tapResponse({
    next: (value) => {
      /* handle success */
    },
    error: (err: HttpErrorResponse) => {
      /* handle error */
    },
    finalize: () => {
      /* optional — always runs */
    },
  }),
);
```

## Operator Choice Guide

| Scenario                        | Operator                                              |
| ------------------------------- | ----------------------------------------------------- |
| One request, cancel previous    | `switchMap`                                           |
| Parallel requests               | `mergeMap`                                            |
| Sequential, wait for previous   | `concatMap`                                           |
| Dedup identical rapid emissions | `exhaustMap`                                          |
| Reactive input (search field)   | `switchMap` + `debounceTime` + `distinctUntilChanged` |

## Rules

- Always use `tapResponse` instead of plain `catchError` inside `rxMethod` pipelines — it keeps the stream alive on error
- Always update `loading` and `error` state around async operations
- Use `switchMap` for load operations (cancels previous), `mergeMap` for mutations where ordering doesn't matter
- Do **not** use `async/await` when the service returns an Observable — use `rxMethod`
