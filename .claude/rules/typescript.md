---
paths:
  - "**/*.ts"
---

- **No `any`.** Prefer `unknown` + type guards. Strong types on public APIs.
- **Explicit return types** on public APIs.
- **Function DI** — `inject(Service)`. Never constructor injection in new code.
- **Immutable state updates** — always `patchState(store, ...)`, never mutate state directly.
- No `console.log` in committed code.
- No code comments unless explicitly requested.
