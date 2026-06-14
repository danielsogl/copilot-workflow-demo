---
description: NgRx Signal Store conventions — loaded when touching store files
paths:
  - "**/*-store.ts"
  - "**/data/state/**"
---

When creating or editing a Signal Store:

- Declare with `signalStore({ providedIn: 'root' }, ...)`; model collections with `withEntities(entityConfig)`.
- Mutate state **only** through `patchState` — never reassign a signal or mutate entities in place.
- Run async side effects through `rxMethod` + `tapResponse` (always handle `error` and finalize). No bare `.subscribe()`.
- Compose cross-cutting behaviour with `withFeature` / `withLinkedState` / `withProps` / `withHooks`.
- Keep derived state in `withComputed`; prefix private members with `_`.
- Pair the store with an `*-api.ts` infrastructure service for HTTP; the store never calls `HttpClient` for reads that a component could do via `httpResource()`.
