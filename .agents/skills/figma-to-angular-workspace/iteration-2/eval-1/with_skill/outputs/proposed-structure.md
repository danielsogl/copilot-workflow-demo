# Proposed Angular feature structure — Posts feed

Slots into the existing `src/app/features/posts/` (which currently only has `data/`).
We add `feature/`, `ui/`, and a route entry. Everything follows the pattern already
used by `src/app/features/tasks/`.

## Folder tree

```
src/app/features/posts/
├── data/                                  (already exists)
│   ├── infrastructure/post-api.ts
│   ├── models/post.model.ts
│   └── state/post-store.ts                (NgRx signalStore — reused as-is)
│
├── feature/
│   └── post-feed-page/                    NEW — routable container
│       ├── post-feed-page.ts
│       ├── post-feed-page.html
│       ├── post-feed-page.scss
│       └── post-feed-page.spec.ts
│
├── ui/                                    NEW
│   └── stacked-card/                      NEW — 1:1 with Figma "stacked-card" instance (used 3x)
│       ├── stacked-card.ts
│       ├── stacked-card.html
│       ├── stacked-card.scss
│       └── stacked-card.spec.ts
│
└── util/                                  (none needed yet)
```

Why no `ui/feed-fab` or `ui/post-feed-toolbar`:

- The FAB is a single `<button mat-fab>` in the page template — a wrapper component
  would be over-engineering for one element.
- The top-app-bar in Figma maps to the existing app shell toolbar in
  `src/app/app.html`. If the design implies a feature-local toolbar instead, we
  will add `ui/post-feed-toolbar/` later — flagged in open questions.

## Components

### `feature/post-feed-page` (PostFeedPage)

- Selector: `app-post-feed-page`.
- Standalone, `ChangeDetectionStrategy.OnPush`, signal-based.
- Injects `PostStore` (already `providedIn: 'root'`).
- On init: `store.loadPosts()` (rxMethod — pass `void` arg or use a `signal` source).
- Template renders:
  - Optional in-page title row (only if Figma top-app-bar is not the app shell toolbar — see Q2).
  - `@if (store.isEmpty()) { <empty state> } @else { @for (post of store.postsEntities(); track post.id) { <app-stacked-card [post]="post" /> } }`
  - `<button mat-fab class="post-feed-page__fab" (click)="onCreate()"><mat-icon>add</mat-icon></button>`
- Loading state: `@if (store.loading()) { ... }` — skeleton vs spinner is in open questions.
- Error state: bound to `store.error()`.
- Layout: vertical flex with `gap: var(--app-feed-card-gap)`, side padding `var(--app-feed-side-gutter)`.
- FAB is `position: fixed; right: var(--app-fab-edge-inset); bottom: var(--app-fab-edge-inset);`.

### `ui/stacked-card` (StackedCard)

- Selector: `app-stacked-card`.
- Standalone, OnPush.
- Signal input: `readonly post = input.required<Post>();`
- Outputs: `readonly open = output<Post>();` (tap on card body) and possibly
  `readonly menu = output<Post>();` (overflow icon — depends on Figma master).
- Built on `mat-card` (the project already overrides `elevated-container-shape: 16px`).
- Inner structure is a placeholder until the Figma master is inspected:
  - `<mat-card-header>` — title (`--mat-sys-title-large`) + supporting text (`--mat-sys-body-medium`).
  - Optional media slot (no media URL field in `Post` model today — see Q4).
  - `<mat-card-content>` — `body` text, clamped (`@open question on overflow`).
  - `<mat-card-actions>` — TBD (open question whether the master ships actions).
- Width: fills the page column (max-width matches the 360dp from Figma on mobile,
  expands on tablet/desktop per open question).

## Routing

In `src/app/app.routes.ts`, append:

```ts
{
  path: "posts",
  loadComponent: () =>
    import("./features/posts/feature/post-feed-page/post-feed-page").then(
      (m) => m.PostFeedPage,
    ),
}
```

We do NOT touch the existing redirect to `/board`. Navigation entry point
(e.g., adding "Posts" to the main app navigation) is out of scope until the
developer confirms it.

## State

- Use the existing `PostStore` as-is. It already provides `loadPosts`, `createPost`,
  `updatePost`, `deletePost`, plus `isEmpty`, `hasData`, `loading`, `error`.
- No additional store, no `signalStoreFeature`, no `linkedSignal` needed for this
  screen. Pure read + open + create flow.

## Tokens used

From `outputs/proposed-tokens.scss`:

- Page side padding: `var(--app-feed-side-gutter)` — 24px.
- Card-to-card vertical gap: `var(--app-feed-card-gap)` — 35px (PROVISIONAL).
- FAB inset: `var(--app-fab-edge-inset)` — 24px.

Everything else flows through `--mat-sys-*` system tokens — no new color, type,
or elevation tokens required.

## Responsive plan (to be confirmed)

Mobile (base, < 768px): single column, cards 100% of available column width.
Tablet (>= 768px): single column centered, max-width ~640px. Or two columns —
**ask developer**.
Desktop (>= 1280px): three-column masonry-ish grid, or a centered single column
matching tablet. **Ask developer.**

## Files we will touch when implementing

- NEW: `src/app/features/posts/feature/post-feed-page/{post-feed-page.ts,.html,.scss,.spec.ts}`
- NEW: `src/app/features/posts/ui/stacked-card/{stacked-card.ts,.html,.scss,.spec.ts}`
- EDIT: `src/styles.scss` — append the three `gap-closed` CSS custom properties.
- EDIT: `src/app/app.routes.ts` — add the `posts` lazy route.
- UNCHANGED: `src/app/features/posts/data/**` — store and API are already in place.
- UNCHANGED: `src/theme/_theme-colors.scss` — colors all map to existing M3 roles.
