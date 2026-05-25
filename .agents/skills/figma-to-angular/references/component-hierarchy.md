# Component hierarchy in this project

The codebase splits feature code into four siblings under `src/app/features/<feature>/`:

```
src/app/features/<feature>/
├── data/      — services, signal stores, models, types
├── feature/   — routable, container components (own state, inject services)
├── ui/        — presentational, standalone, signal I/O only
└── util/      — pure helpers, pipes, guards, etc.
```

Match this exactly when scaffolding from Figma. Deviating creates churn in code review.

## Mapping Figma → folders

| Figma artifact                                    | Goes to                                                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A full screen frame (whole page)                  | `feature/<page-name>/`                                                                                |
| A reused component instance (Card, Header, FAB)   | `ui/<component-name>/`                                                                                |
| A one-off layout element only used in this screen | Inline markup in the feature component — **don't** invent a new `ui/` component for a single use site |
| A data model (Post, User, Comment)                | `data/<model>.model.ts`                                                                               |
| Loading data from an API                          | `data/<feature>.store.ts` (signal store) or `data/<feature>.service.ts`                               |
| Formatting / date math / sorting                  | `util/`                                                                                               |

## "When is something a `ui/` component?" — the cheap heuristic

Ask three questions:

1. **Is it an instance of a Figma component?** If yes, it's a `ui/` candidate. Multiple call sites confirm it.
2. **Does it have state independent of its parent?** (e.g., its own hover/expand state.) If yes, it's `ui/`.
3. **Would a reasonable developer reuse it?** If no — if you only ever see it on this screen and it's tied to this screen's data shape — keep it inline.

When in doubt, **start inline**. It's much cheaper to extract later than to over-decompose now.

## Naming

- Feature page component: `<feature>-page` or `<feature>-dashboard` — match the existing convention in `src/app/features/tasks/feature/task-dashboard`.
- UI components: noun describing the thing (`task-card`, `priority-badge`, `chat-message`).
- Selectors: kebab-case with a project prefix if there is one (check `angular.json` for `prefix`); otherwise default `app-`.

## File layout per component

Use the Angular CLI default for new components:

```
ui/<name>/
├── <name>.html
├── <name>.scss
├── <name>.spec.ts
└── <name>.ts
```

The CLI does this for you via `ng generate component features/<feature>/ui/<name>` (run from the project root). Do not hand-create these files.

## Signal I/O — the contract for `ui/` components

Every `ui/` component takes data via signal inputs and emits via outputs. No services injected, no router, no HTTP.

```ts
@Component({
  selector: "app-post-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./post-card.html",
  styleUrl: "./post-card.scss",
  imports: [MatCardModule, MatIconModule, DatePipe],
})
export class PostCard {
  post = input.required<Post>();
  selected = input(false);
  toggle = output<Post>();
}
```

The container in `feature/` is allowed to inject services, work with the router, and own writable state.

## Routing

If the screen is a new route:

1. Add the lazy route to `src/app/app.routes.ts`:
   ```ts
   {
     path: 'posts',
     loadComponent: () =>
       import('./features/posts/feature/posts-page/posts-page').then(m => m.PostsPage),
   }
   ```
2. Add navigation entry to the navbar (`src/app/core/navbar/`) only if the developer says it belongs there. Don't assume.

## What this is not

This is **not** an Nx-style "libs/apps" structure. Everything lives under `src/app`. Don't propose splitting into libraries unless the developer asks.
