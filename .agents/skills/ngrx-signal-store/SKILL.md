---
name: ngrx-signal-store
description: "Create, extend, or review NgRx Signal Store state management code. Use when creating a new store with signalStore, adding withState/withComputed/withMethods/withEntities/withHooks, writing rxMethod for RxJS side effects, building reusable signalStoreFeature, managing entity collections, or writing store tests. Triggers on requests about NgRx Signals, signalStore, withState, withEntities, rxMethod, patchState, entity adapters, or store features."
argument-hint: "Describe the state management need, e.g. 'create a task store with CRUD operations'"
---

# NgRx Signal Store

## When to Use

- Creating a new store (`signalStore`)
- Adding or updating state slices (`withState`, `withLinkedState`)
- Adding derived/computed values (`withComputed`)
- Adding methods and side effects (`withMethods`, `rxMethod`)
- Managing entity collections (`withEntities`, `entityConfig`)
- Building reusable cross-cutting features (`signalStoreFeature`, `withHooks`)
- Writing unit tests for a store

## Architecture Principles

- Signal Store state is **protected by default** (`{ protectedState: true }`)
- State is always a **flat object** at the root; arrays live inside object keys
- All internal/private members are prefixed with `_`
- Use `patchState` for all state mutations — never reassign signals directly
- Use `rxMethod` for Observable-based side effects; prefer it over `async/await` when a service returns an Observable
- Inject dependencies inside `withMethods` factory via `inject()`
- For global singletons use `{ providedIn: 'root' }`; for feature/component-scoped stores provide them in `providers`

## Quick Decision Guide

| Need                                    | Solution                        |
| --------------------------------------- | ------------------------------- |
| State slice                             | `withState`                     |
| Derived/computed value                  | `withComputed`                  |
| Writable state linked to another signal | `withLinkedState`               |
| Sync or async methods                   | `withMethods`                   |
| RxJS-based side effect                  | `rxMethod` in `withMethods`     |
| Entity collection (CRUD)                | `withEntities` + `entityConfig` |
| Lifecycle hooks (init/destroy)          | `withHooks`                     |
| Cross-cutting reusable feature          | `signalStoreFeature`            |
| Pass inputs to feature                  | `withFeature`                   |
| Static properties / observables         | `withProps`                     |

## Procedure

1. **Read the relevant reference** for the feature you need (see table below)
2. **Define state interface** with strict TypeScript types (no `any`)
3. **Create the store** using `signalStore` with appropriate options
4. **Compose features** in the correct order (state → computed → methods → hooks)
5. **Validate** with `ng build` or `npm test`

## Reference Files

| Topic                                                                                | File                                                      |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Core concepts: `signalStore`, `withState`, `patchState`, `getState`                  | [core-concepts.md](./references/core-concepts.md)         |
| Derived state & methods: `withComputed`, `withMethods`                               | [computed-methods.md](./references/computed-methods.md)   |
| Entity management: `withEntities`, `entityConfig`, CRUD updaters                     | [entity-management.md](./references/entity-management.md) |
| RxJS interop: `rxMethod`, `tapResponse`                                              | [rxjs-interop.md](./references/rxjs-interop.md)           |
| Custom features: `signalStoreFeature`, `withFeature`, `withHooks`, `withLinkedState` | [custom-features.md](./references/custom-features.md)     |
| Testing stores with Vitest + TestBed                                                 | [testing.md](./references/testing.md)                     |

## Minimal Store Template

```typescript
import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";

interface ExampleState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  items: [],
  loading: false,
  error: null,
};

export const ExampleStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed(({ items }) => ({
    count: computed(() => items().length),
  })),
  withMethods((store, service = inject(ExampleService)) => ({
    // methods here
  })),
);
```
