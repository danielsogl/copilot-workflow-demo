# Tasks domain

Domain-scoped guidance for `src/app/features/tasks/` — the Kanban board. Lazy-loaded by Claude Code when you work inside this folder, on top of the root `CLAUDE.md`.

## Layout

- `feature/` — route-level board/column containers; inject `TasksStore`.
- `ui/` — presentational cards, column headers, dialogs (OnPush, inputs/outputs only — no store).
- `data/models/` — `task.model.ts` (the `Task` interface, status enum).
- `data/infrastructure/` — `tasks-api.ts` (CRUD against `json-server` on `:3000`).
- `data/state/` — `tasks-store.ts` (`withEntities`, drag-and-drop reordering, optimistic updates).
- `util/` — pure board helpers (grouping by status, ordering).

## Domain rules

- Board mutations (move, reorder, status change) go through `patchState` in `TasksStore` — UI components emit an `output()` and never mutate state themselves.
- Optimistic update pattern: patch the entity first, then reconcile in `tapResponse`'s error branch by reverting.
- Task edit forms use Angular Signal Forms (`form()` + module-level `schema()`), never `ReactiveFormsModule`.
- Keep status values in one place in `task.model.ts`; columns derive from it — don't hardcode status strings in `ui/`.
