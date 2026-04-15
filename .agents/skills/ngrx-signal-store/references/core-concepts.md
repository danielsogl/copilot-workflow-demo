# Core Concepts: signalStore, withState, patchState, getState

Source: https://ngrx.io/guide/signals/signal-store

## signalStore

`signalStore` is the factory function for creating Signal Stores. It accepts optional configuration and a sequence of store features.

```typescript
import { signalStore, withState } from "@ngrx/signals";

// Global singleton store
export const AppStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
);

// Component/feature-scoped store (no providedIn)
export const LocalStore = signalStore(withState(initialState));
// Provide via component `providers: [LocalStore]`
```

### Store Options

| Option           | Type      | Description                                       |
| ---------------- | --------- | ------------------------------------------------- |
| `providedIn`     | `'root'`  | Register as root singleton                        |
| `protectedState` | `boolean` | Default `true` — blocks external patchState calls |

## withState

Defines initial state. State shape is always a **flat object** at the root level. Arrays are wrapped inside object properties.

```typescript
interface TaskState {
  tasks: Task[]; // ✅ Array inside object
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  selectedId: null,
};

export const TaskStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
);
```

Each top-level property becomes a **signal** on the store:

```typescript
const store = inject(TaskStore);
store.loading(); // Signal<boolean>
store.selectedId(); // Signal<string | null>
```

## patchState

The **only** way to mutate store state. Accepts partial state objects, updater functions, or a sequence of both.

```typescript
import { patchState } from "@ngrx/signals";

// Partial state object
patchState(store, { loading: true });

// Updater function (access previous state)
patchState(store, (state) => ({
  tasks: [...state.tasks, newTask],
}));

// Sequence of partial objects and updater functions
patchState(store, { loading: false }, (state) => ({
  error: state.tasks.length === 0 ? "No tasks found" : null,
}));
```

## getState

Returns a plain snapshot of the entire store state. Useful inside `effect()` for full-state tracking.

```typescript
import { effect } from "@angular/core";
import { getState } from "@ngrx/signals";

withHooks({
  onInit(store) {
    effect(() => {
      const state = getState(store);
      console.log("state changed", state);
    });
  },
});
```

## Private Members

Prefix internal state, computed, and methods with `_` to mark them as private:

```typescript
withState({
  tasks: [] as Task[],
  _currentPage: 1, // private state
});
withComputed(({ tasks, _currentPage }) => ({
  count: computed(() => tasks().length),
  _offset: computed(() => (_currentPage() - 1) * 10), // private computed
}));
```
