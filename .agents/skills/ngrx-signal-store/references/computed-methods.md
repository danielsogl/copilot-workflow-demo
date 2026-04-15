# Computed Signals & Methods: withComputed, withMethods

Source: https://ngrx.io/guide/signals/signal-store

## withComputed

Adds derived signals that are recomputed when their dependencies change. The factory receives the current store slice (state signals + previously defined computed/props).

```typescript
import { computed } from "@angular/core";
import { signalStore, withComputed, withState } from "@ngrx/signals";

export const BookSearchStore = signalStore(
  withState({
    books: [] as Book[],
    filter: { query: "", order: "asc" as "asc" | "desc" },
  }),
  withComputed(({ books, filter }) => ({
    // Explicit computed() — for complex logic
    booksCount: computed(() => books().length),

    // Shorthand — arrow function auto-wrapped in computed()
    sortedBooks: () => {
      const direction = filter.order() === "asc" ? 1 : -1;
      return books().toSorted(
        (a, b) => direction * a.title.localeCompare(b.title),
      );
    },
  })),
);
```

### Rules for withComputed

- Only access signals **from previous features** (state, other computed) — never later ones
- Avoid side effects inside computed functions
- Prefix internal computed with `_`

## withMethods

Adds methods to the store. The factory receives the store instance (state signals + computed + previous methods). Runs inside the Angular **injection context**, so `inject()` works directly.

```typescript
import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export const TaskStore = signalStore(
  withState({ tasks: [] as Task[], loading: false }),
  withMethods((store, taskService = inject(TaskService)) => ({
    // Synchronous method
    selectTask(id: string): void {
      patchState(store, { selectedId: id });
    },

    // Async method
    async loadTasks(): Promise<void> {
      patchState(store, { loading: true });
      try {
        const tasks = await taskService.getAll();
        patchState(store, { tasks, loading: false });
      } catch {
        patchState(store, { loading: false, error: "Failed to load" });
      }
    },
  })),
);
```

### Dependency Injection in withMethods

Inject services via default parameter syntax inside the factory:

```typescript
withMethods(
  (store, taskService = inject(TaskService), router = inject(Router)) => ({
    // both services available
  }),
);
```

### When to Use Async vs rxMethod

| Pattern       | When                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| `async/await` | One-shot async calls, Promise-based services                           |
| `rxMethod`    | Observable-based services, streams, debouncing, `switchMap`/`mergeMap` |

> See [rxjs-interop.md](./rxjs-interop.md) for `rxMethod` patterns.

## withProps

Adds static properties, observables, or raw dependencies to the store (not reactive signals).

```typescript
import { toObservable } from "@angular/core/rxjs-interop";
import { withProps } from "@ngrx/signals";

withProps((store) => ({
  // Expose a signal as Observable for components that need it
  tasks$: toObservable(store.tasks),
}));
```
