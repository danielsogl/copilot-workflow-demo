# NgRx Signals Patterns

This document outlines the state management patterns used in our Angular applications with NgRx Signals Store.

## 1. NgRx Signals Architecture

- **Component-Centric Design:** Stores are designed around component requirements
- **Hierarchical State:** State is organized in hierarchical structures
- **Computed State:** Derived state uses computed values
- **Declarative Updates:** State updates use patchState for immutability
- **Store Composition:** Stores compose using features and providers
- **Reactivity:** UIs build on automatic change detection
- **Signal Interoperability:** Signals integrate with existing RxJS-based systems
- **SignalMethod & RxMethod:** Use `signalMethod` for lightweight, signal-driven side effects; use `rxMethod` for Observable-based side effects and RxJS integration. When a service returns an Observable, always use `rxMethod` for side effects instead of converting to Promise or using async/await.

## 2. Signal Store Structure

- **Store Creation:** The `signalStore` function creates stores
- **Protected State:** Signal Store state is protected by default (`{ protectedState: true }`)
- **State Definition:** Initial state shape is defined with `withState<StateType>({...})`
  - Root level state is always an object: `withState({ users: [], count: 0 })`
  - Arrays are contained within objects: `withState({ items: [] })`
- **Dependency Injection:** Stores are injectable with `{ providedIn: 'root' }` or feature/component providers
- **Store Features:** Built-in features (`withEntities`, `withHooks`, `signalStoreFeature`) handle cross-cutting concerns and enable store composition
- **State Interface:** State interfaces provide strong typing
- **Private Members:** Prefix all internal state, computed signals, and methods with an underscore (`_`). Ensure unique member names across state, computed, and methods.
  ```typescript
  withState({ count: 0, _internalCount: 0 });
  withComputed(({ count, _internalCount }) => ({
    doubleCount: computed(() => count() * 2),
    _doubleInternal: computed(() => _internalCount() * 2),
  }));
  ```
- **Member Integrity:** Store members have unique names across state, computed, and methods
- **Initialization:** State initializes with meaningful defaults
- **Collection Management:** The `withEntities` feature manages collections. Prefer atomic entity operations (`addEntity`, `updateEntity`, `removeEntity`, `setAllEntities`) over bulk state updates. Use `entityConfig` and `selectId` for entity identification.
- **Entity Adapter Configuration:** Use `entityConfig` to configure the entity adapter for each store. Always specify the `entity` type, `collection` name, and a `selectId` function for unique entity identification. Pass the config to `withEntities<T>(entityConfig)` for strong typing and consistent entity management.

```typescript
const userEntityConfig = entityConfig({
  entity: type<User>(),
  collection: "users",
  selectId: (user: User) => user.id,
});

export const UserStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(userEntityConfig),
  // ...
);
```

- **Custom Store Properties:** Use `withProps` to add static properties, observables, and dependencies. Expose observables with `toObservable`.

```typescript
// Signal store structure example
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  type,
} from "@ngrx/signals";
import { withEntities, entityConfig } from "@ngrx/signals/entities";
import { computed, inject } from "@angular/core";
import { UserService } from "./user.service";
import { User } from "./user.model";
import { setAllEntities } from "@ngrx/signals/entities";

export interface UserState {
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  selectedUserId: null,
  loading: false,
  error: null,
};

const userEntityConfig = entityConfig({
  entity: type<User>(),
  collection: "users",
  selectId: (user: User) => user.id,
});

export const UserStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(userEntityConfig),
  withComputed(({ usersEntities, usersEntityMap, selectedUserId }) => ({
    selectedUser: computed(() => {
      const id = selectedUserId();
      return id ? usersEntityMap()[id] : undefined;
    }),
    totalUserCount: computed(() => usersEntities().length),
  })),
  withMethods((store, userService = inject(UserService)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { loading: true, error: null });
          return userService.getUsers().pipe(
            tapResponse({
              next: (users) =>
                patchState(store, setAllEntities(users, userEntityConfig), {
                  loading: false,
                }),
              error: () =>
                patchState(store, {
                  loading: false,
                  error: "Failed to load users",
                }),
            }),
          );
        }),
      ),
    ),
    selectUser(userId: string | null): void {
      patchState(store, { selectedUserId: userId });
    },
  })),
);
```

## 3. Signal Store Methods

- **Method Definition:** Methods are defined within `withMethods`
- **Dependency Injection:** The `inject()` function accesses services within `withMethods`
- **Method Organization:** Methods are grouped by domain functionality
- **Method Naming:** Methods have clear, action-oriented names
- **State Updates:** `patchState(store, newStateSlice)` or `patchState(store, (currentState) => newStateSlice)` updates state immutably
- **Async Operations:** Methods handle async operations and update loading/error states
- **Computed Properties:** `withComputed` defines derived state
- **RxJS Integration:** `rxMethod` integrates RxJS streams. Use `rxMethod` for all store methods that interact with Observable-based APIs or services. Avoid using async/await with Observables in store methods.

```typescript
// Signal store method patterns
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { TodoService } from "./todo.service";
import { Todo } from "./todo.model";

export interface TodoState {
  todos: Todo[];
  loading: boolean;
}

export const TodoStore = signalStore(
  { providedIn: "root" },
  withState<TodoState>({ todos: [], loading: false }),
  withMethods((store, todoService = inject(TodoService)) => ({
    addTodo(todo: Todo): void {
      patchState(store, (state) => ({
        todos: [...state.todos, todo],
      }));
    },

    loadTodosSimple: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { loading: true });
          return todoService.getTodos().pipe(
            tapResponse({
              next: (todos) => patchState(store, { todos, loading: false }),
              error: () => patchState(store, { loading: false }),
            }),
          );
        }),
      ),
    ),
  })),
);
```

## 4. Entity Management

- **Entity Configuration:** Entity configurations include ID selectors
- **Collection Operations:** Entity operations handle CRUD operations
- **Entity Relationships:** Computed properties manage entity relationships
- **Entity Updates:** Prefer atomic entity operations (`addEntity`, `updateEntity`, `removeEntity`, `setAllEntities`) over bulk state updates. Use `entityConfig` and `selectId` for entity identification.

```typescript
// Entity management patterns
const userEntityConfig = entityConfig({
  entity: type<User>(),
  collection: "users",
  selectId: (user: User) => user.id,
});

export const UserStore = signalStore(
  withEntities(userEntityConfig),
  withMethods((store) => ({
    addUser: signalMethod<User>((user) => {
      patchState(store, addEntity(user, userEntityConfig));
    }),
    updateUser: signalMethod<{ id: string; changes: Partial<User> }>(
      ({ id, changes }) => {
        patchState(store, updateEntity({ id, changes }, userEntityConfig));
      },
    ),
    removeUser: signalMethod<string>((id) => {
      patchState(store, removeEntity(id, userEntityConfig));
    }),
    setUsers: signalMethod<User[]>((users) => {
      patchState(store, setAllEntities(users, userEntityConfig));
    }),
  })),
);
```

## 5. Component Integration

### Component State Access

- **Signal Properties:** Components access signals directly in templates
- **OnPush Strategy:** Signal-based components use OnPush change detection
- **Store Injection:** Components inject store services with the `inject` function
- **Default Values:** Signals have default values
- **Computed Values:** Components derive computed values from signals
- **Signal Effects:** Component effects handle side effects

```typescript
// Component integration patterns
@Component({
  standalone: true,
  imports: [UserListComponent],
  template: `
    @if (userStore.users().length > 0) {
      <app-user-list [users]="userStore.users()"></app-user-list>
    } @else {
      <p>No users loaded yet.</p>
    }

    <div>Selected user: {{ selectedUserName() }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersContainerComponent implements OnInit {
  readonly userStore = inject(UserStore);

  selectedUserName = computed(() => {
    const user = this.userStore.selectedUser();
    return user ? user.name : "None";
  });

  constructor() {
    effect(() => {
      const userId = this.userStore.selectedUserId();
      if (userId) {
        console.log(`User selected: ${userId}`);
      }
    });
  }

  ngOnInit() {
    this.userStore.loadUsers();
  }
}
```

### Signal Store Hooks

- **Lifecycle Hooks:** The `withHooks` feature adds lifecycle hooks to stores
- **Initialization:** The `onInit` hook initializes stores
- **Cleanup:** The `onDestroy` hook cleans up resources
- **State Synchronization:** Hooks synchronize state between stores

```typescript
// Signal store hooks patterns
export const UserStore = signalStore(
  withState<UserState>({
    /* initial state */
  }),
  withMethods(/* store methods */),
  withHooks({
    onInit: (store) => {
      // Initialize the store
      store.loadUsers();

      // Return cleanup function if needed
      return () => {
        // Cleanup code
      };
    },
  }),
);
```

## 6. Advanced Signal Patterns

### Signal Store Features

- **Feature Creation:** The `signalStoreFeature` function creates reusable features
- **Generic Feature Types:** Generic type parameters enhance feature reusability
  ```typescript
  function withMyFeature<T>(config: Config<T>) {
    return signalStoreFeature(/*...*/);
  }
  ```
- **Feature Composition:** Multiple features compose together
- **Cross-Cutting Concerns:** Features handle logging, undo/redo, and other concerns
- **State Slices:** Features define and manage specific state slices

```typescript
// Signal store feature patterns
export function withUserFeature() {
  return signalStoreFeature(
    withState<UserFeatureState>({
      /* feature state */
    }),
    withComputed((state) => ({
      /* computed properties */
    })),
    withMethods((store) => ({
      /* methods */
    })),
  );
}

// Using the feature
export const AppStore = signalStore(
  withUserFeature(),
  withOtherFeature(),
  withMethods((store) => ({
    /* app-level methods */
  })),
);
```

### Signals and RxJS Integration

- **Signal Conversion:** `toSignal()` and `toObservable()` convert between Signals and Observables
- **Effects:** Angular's `effect()` function reacts to signal changes
- **RxJS Method:** `rxMethod<T>(pipeline)` handles Observable-based side effects. Always prefer `rxMethod` for Observable-based service calls in stores. Do not convert Observables to Promises for store logic.
  - Accepts input values, Observables, or Signals
  - Manages subscription lifecycle automatically
- **Reactive Patterns:** Signals combine with RxJS for complex asynchronous operations

```typescript
// Signal and RxJS integration patterns
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { pipe, switchMap } from "rxjs";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.model";

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const UserStore = signalStore(
  { providedIn: "root" },
  withState({ users: [], loading: false, error: null }),
  withMethods((store, http = inject(HttpClient)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { loading: true, error: null });
          return http.get<User[]>("/api/users").pipe(
            tapResponse({
              next: (users) => patchState(store, { users, loading: false }),
              error: () =>
                patchState(store, {
                  loading: false,
                  error: "Failed to load users",
                }),
            }),
          );
        }),
      ),
    ),
  })),
);
```

### Signal Method for Side Effects

The `signalMethod` function manages side effects driven by Angular Signals within Signal Store:

- **Input Flexibility:** The processor function accepts static values or Signals
- **Automatic Cleanup:** The underlying effect cleans up when the store is destroyed
- **Explicit Tracking:** Only the input signal passed to the processor function is tracked
- **Lightweight:** Smaller bundle size compared to `rxMethod`

```typescript
// Signal method patterns
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { signalMethod } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Logger } from './logger';

interface UserPreferencesState {
  theme: 'light' | 'dark';
  sendNotifications: boolean;

const initialState: UserPreferencesState = {
  theme: 'light',
  sendNotifications: true,
};

export const PreferencesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    logger:  inject(Logger),
  }));
  withMethods((store) => ({
    setSendNotifications(enabled: boolean): void {
      patchState(store, { sendNotifications: enabled });
    },

    // Signal method reacts to theme changes
    logThemeChange: signalMethod<'light' | 'dark'>((theme) => {
      store.logger.log(`Theme changed to: ${theme}`);
    }),

    setTheme(newTheme: 'light' | 'dark'): void {
      patchState(store, { theme: newTheme });
    },
  })),
);
```

## 7. Custom Store Properties

- **Custom Properties:** The `withProps` feature adds static properties, observables, and dependencies
- **Observable Exposure:** `toObservable` within `withProps` exposes state as observables
  ```typescript
  withProps(({ isLoading }) => ({
    isLoading$: toObservable(isLoading),
  }));
  ```
- **Dependency Grouping:** `withProps` groups dependencies for use across store features
  ```typescript
  withProps(() => ({
    booksService: inject(BooksService),
    logger: inject(Logger),
  }));
  ```

## 8. Project Organization

### Store Organization

- **File Location:** Store definitions (`*.store.ts`) exist in dedicated files
- **Naming Convention:** Stores follow the naming pattern `FeatureNameStore`
- **Model Co-location:** State interfaces and models exist near store definitions
- **Provider Functions:** Provider functions (`provideFeatureNameStore()`) encapsulate store providers

```typescript
// Provider function pattern
import { Provider } from "@angular/core";
import { UserStore } from "./user.store";

export function provideUserSignalStore(): Provider {
  return UserStore;
}
```

### Store Hierarchy

- **Parent-Child Relationships:** Stores have clear relationships
- **State Sharing:** Related components share state
- **State Ownership:** Each state slice has a clear owner
- **Store Composition:** Complex UIs compose multiple stores
