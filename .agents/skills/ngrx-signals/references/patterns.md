# @ngrx/signals — Architectural Patterns

Patterns that go beyond the API surface. These are the "how should I structure this?" answers.

## Table of contents

- [Store / Service split](#store--service-split)
- [Scoping: root vs route vs component](#scoping-root-vs-route-vs-component)
- [Optimistic updates with rollback](#optimistic-updates-with-rollback)
- [Refactoring `BehaviorSubject` services](#refactoring-behaviorsubject-services)
- [Lifecycle: triggering loads](#lifecycle-triggering-loads)
- [No cross-store imports](#no-cross-store-imports)
- [Loading + error UX](#loading--error-ux)

## Store / Service split

The single most important architectural rule: **the store holds reactive state, the service performs I/O.**

```typescript
// books.service.ts — pure I/O
@Injectable({ providedIn: "root" })
export class BooksService {
  private readonly http = inject(HttpClient);
  getAll(): Promise<Book[]> {
    return firstValueFrom(this.http.get<Book[]>("/api/books"));
  }
  getById(id: string): Observable<Book> {
    return this.http.get<Book>(`/api/books/${id}`);
  }
}

// books.store.ts — state, computed, orchestration
export const BooksStore = signalStore(
  { providedIn: "root" },
  withState<BooksState>({ books: [], isLoading: false }),
  withMethods((store, books = inject(BooksService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true });
      const list = await books.getAll();
      patchState(store, { books: list, isLoading: false });
    },
  })),
);
```

Why:

- **Testable in isolation.** The service is mocked, the store is reasoned about with synchronous `expect`s.
- **Replaceable backend.** Swap `BooksService` to GraphQL/IndexedDB without touching the store.
- **No `HttpClient` in stores.** Keeps the store framework-agnostic and easy to read.

If you find `inject(HttpClient)` inside `withMethods`, the code has skipped the service layer — call that out.

## Scoping: root vs route vs component

| Scope                | Provider                                   | Use when                                     |
| -------------------- | ------------------------------------------ | -------------------------------------------- |
| App-wide singleton   | `signalStore({ providedIn: 'root' }, ...)` | Auth, current user, app-wide settings, cart  |
| Route-scoped         | `providers: [Store]` on the route          | State that should reset when navigating away |
| Component-scoped     | `providers: [Store]` on the component      | Per-instance editor state, per-modal state   |
| Component-local only | `signalState({...})` inside the component  | Trivially local, never shared                |

Common mistake: putting per-page state in `root`. The store survives navigation and leaks stale data to the next visit. If state should die when the page unmounts, scope it to the route or component.

## Optimistic updates with rollback

Three steps: snapshot, patch optimistically, rollback on failure.

```typescript
withMethods((store, todos = inject(TodosService)) => ({
  async toggleComplete(id: string): Promise<void> {
    const previous = getState(store);
    patchState(
      store,
      updateEntity({ id, changes: (t) => ({ completed: !t.completed }) }),
    );
    try {
      await todos.toggleComplete(id);
    } catch (err) {
      patchState(store, { entityMap: previous.entityMap, ids: previous.ids });
      throw err;
    }
  },
}));
```

Notes:

- For entity stores, restore both `entityMap` and `ids` (entity feature uses both as state slices).
- Rethrow or surface the error so the UI can show feedback. Swallowing the error gives a confusing UX where the change "stuck" then "un-stuck" with no explanation.
- Pair optimistic updates with a request-status feature so consumers can show a subtle "saving…" indicator.

## Refactoring `BehaviorSubject` services

Common Angular legacy pattern:

```typescript
// before
@Injectable({ providedIn: "root" })
export class CartService {
  private readonly _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items$.asObservable();

  add(item: CartItem) {
    this._items$.next([...this._items$.value, item]);
  }
}
```

Idiomatic Signal Store version:

```typescript
type CartState = { items: CartItem[] };

export const CartStore = signalStore(
  { providedIn: "root" },
  withState<CartState>({ items: [] }),
  withComputed(({ items }) => ({
    total: computed(() => items().reduce((s, i) => s + i.price, 0)),
    count: computed(() => items().length),
  })),
  withMethods((store) => ({
    add(item: CartItem): void {
      patchState(store, ({ items }) => ({ items: [...items, item] }));
    },
    remove(id: string): void {
      patchState(store, ({ items }) => ({
        items: items.filter((i) => i.id !== id),
      }));
    },
    clear(): void {
      patchState(store, { items: [] });
    },
  })),
);
```

Migration checklist:

- `BehaviorSubject<T>` → state slice in `withState`.
- `.next(...)` → `patchState(store, ...)`.
- Computed/derived observables (`map`, `combineLatest`) → `withComputed`.
- Side-effecting methods (HTTP, debounced search) → `withMethods` (use `rxMethod` only if you actually need RxJS operators).
- Components subscribing via `async` pipe → call signals directly: `{{ cart.total() }}`.

## Lifecycle: triggering loads

Common need: load data once when the store is created. Use `withHooks`:

```typescript
export const BooksStore = signalStore(
  { providedIn: "root" },
  withState<BooksState>({ books: [], isLoading: false }),
  withMethods(/* ... loadAll() ... */),
  withHooks({
    onInit(store) {
      store.loadAll();
    },
  }),
);
```

For route-scoped stores, this fires per-navigation — exactly when you want.

For loads driven by a route param or a search input, prefer `rxMethod`/`signalMethod` connected to that input rather than a manual subscription in the component.

## No cross-store imports

A store should never `inject(OtherStore)` or import another store directly. It creates implicit cycles, makes test setup gross, and tangles the dependency graph.

Allowed alternatives:

1. **Lift the shared state up** to a higher-scoped store both consumers can use.
2. **Compose via a custom feature** (`signalStoreFeature`) so both stores include the same slice.
3. **Pull the shared logic into a service** that both stores inject. The service is the integration point, not another store.

If two stores genuinely need to coordinate (e.g., user logout clears a cart), use the events plugin or expose a shared service that both react to.

## Loading + error UX

Pair every async method with a consistent status:

```typescript
withMethods((store, api = inject(BooksService)) => ({
  async loadAll(): Promise<void> {
    patchState(store, setPending());
    try {
      const books = await api.getAll();
      patchState(store, { books }, setFulfilled());
    } catch (e) {
      patchState(
        store,
        setError(e instanceof Error ? e.message : "Failed to load"),
      );
    }
  },
}));
```

`setPending`, `setFulfilled`, `setError` are the standard names from the `withRequestStatus` custom feature. See `references/custom-features.md`.

In the component:

```html
@if (store.isPending()) {
<app-spinner />
} @if (store.error(); as msg) {
<app-error [message]="msg" />
} @if (store.isFulfilled()) {
<ul>
  @for (book of store.books(); track book.id) {
  <li>{{ book.title }}</li>
  }
</ul>
}
```

This three-state pattern — pending / fulfilled / error — covers ~90% of UI loading needs and avoids the trap of using a bare boolean `isLoading` that can't represent error.
