# Shop list — Figma to Angular

I built the "Shop list" screen from the Figma frame as a new `shop` feature, mirroring the DDD layout used by `tasks/` and `posts/` (`feature/`, `ui/`, `data/{models,state,infrastructure}`). Everything is written to the `outputs/` tree — no `src/` files were touched. The proposed routes + navbar updates are emitted as side-by-side files so you can apply them in your own commit.

## What the design contains

From `mcp__figma__get_design_context` on node `24:3285`:

- **Top app bar** (small, flat): leading menu icon, centered title "Shop list", trailing account icon.
- **Three "stacked-card" product cards** (M3 elevated cards) — image / headline (title + price) / supporting text / two action buttons ("Add to favourite" outlined, "Buy" filled).
- **FAB** in the secondary-container colour with a chat-bubble icon, anchored bottom-right.
- Tokens used by the design (already present in the project Material 3 theme via `mat.theme()` and `--mat-sys-*`): `surface`, `on-surface`, `on-surface-variant`, `primary`, `on-primary`, `outline`, `secondary-container`, plus M3 elevation 2/3 shadows. The Figma palette is a warm brown (#9A4521 primary, #FFDBCD secondary-container), but I deliberately mapped everything to project `--mat-sys-*` tokens so the screen picks up the existing app theme rather than the Figma sample's palette. If you want the exact Figma brown palette, swap `src/theme/_theme-colors.scss` for a brown-seeded one — the components themselves don't need to change.

## Files produced

```
outputs/
  response.md                          (this file)
  figma-reference.png                  (screenshot pulled from Figma)
  app.routes.proposed.ts               (adds /shop lazy route)
  navbar.proposed.html                 (adds a Shop nav link)
  db.products.seed.json                (json-server seed under "products")
  src/app/features/shop/
    data/
      models/product.model.ts
      infrastructure/product-api.ts
      state/product-store.ts
      state/product-store.spec.ts
    ui/product-card/
      product-card.ts
      product-card.html
      product-card.scss
    feature/shop-list/
      shop-list.ts
      shop-list.html
      shop-list.scss
```

## Architecture decisions

- **Standalone components, OnPush, signals only.** No `NgModule`, no decorators, no `*ngIf`/`*ngFor`. Templates use `@if`/`@for` with `track`, plus `@let` for the destructured product.
- **NgRx Signal Store with `withEntities`**, same pattern as `PostStore`/`TaskStore`. Includes `loadProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `toggleFavourite`, `selectProduct`, `clearError`, and `favourites`/`hasData`/`isEmpty` computed selectors.
- **HTTP via `HttpClient` inside `rxMethod`** (mutations) — consistent with how `PostApi` is wired. Reads go through `loadProducts` rxMethod, not `httpResource`, to stay consistent with the existing posts feature.
- **`json-server` integration.** `ProductApi` points to `http://localhost:3000/products`. Drop the contents of `db.products.seed.json` into the top-level `db.json` next to `tasks` to make the screen live immediately.
- **Material components used** (Angular Material v3): `MatToolbar`, `MatIconButton`, `MatFabButton`, `MatCard` + `MatCardContent`, `MatButton` (stroked + flat for the two card actions), `MatIcon`, `MatProgressSpinner`, `MatSnackBar`. No custom buttons — the Figma "outlined" + "filled" pair maps cleanly to `mat-stroked-button` + `mat-flat-button` styled with `border-radius: 100px` to match the M3 pill shape.
- **Theme tokens, never hard-coded colours.** All colours come from `var(--mat-sys-*)` so light/dark mode and any future seed-color change work for free. The 12 px card radius and the two-layer shadow from the Figma "M3/Elevation Light/2" effect are reproduced with `color-mix(... var(--mat-sys-shadow))`.
- **Mobile-first responsive grid.** Single-column card list ≤600 px (matches the 360 px Figma frame), `auto-fill, minmax(320px, 1fr)` at ≥600 px, denser gutters at ≥960 px. FAB stays bottom-right and floats above the list.
- **Accessibility.** Toolbar buttons have `aria-label`s, the favourite button toggles `aria-pressed`, the list is rendered as a real `<ul>` with `role="list"`, images carry meaningful `alt` text, the empty state has `role="status"`. The card title uses semantic `<h3>` (the toolbar title is the page's `<h1>`).
- **No `any`, no barrels, no `index.ts` re-exports.** All imports are direct, return types are explicit on public APIs.

## Notable design adaptations

- The Figma frame has the FAB sitting visually overlapping the first product card. I anchored it `position: fixed` to the viewport (matching how `TaskDashboard` does it) — this is the conventional M3 behaviour and works on all viewports.
- "Add to favourite" becomes a real toggle (`toggleFavourite` in the store + `aria-pressed`) instead of a static label, because the Figma file documents the card as a stateful component but only shows the default state.
- The card image in Figma is a hard-coded asset URL from the MCP server (7-day expiry). I parameterised it on the `Product` model and seeded `db.json` with three Unsplash product photos so the screen looks correct out of the box. Swap to real CDN URLs whenever you have them.
- Currency is rendered with Angular's `CurrencyPipe` (`USD` → `$27.50`), which is a small upgrade over the Figma "27,5 $" literal — adjust the locale if EUR formatting is required.

## To wire it up in `src/`

1. Apply `outputs/app.routes.proposed.ts` over `src/app/app.routes.ts` (adds the `/shop` lazy route).
2. Apply `outputs/navbar.proposed.html` over `src/app/core/navbar/navbar.html` (adds the Shop nav link).
3. Merge `outputs/db.products.seed.json` into the top-level `db.json` (add a `products` array next to the existing `tasks` array).
4. Copy `outputs/src/app/features/shop/` into `src/app/features/shop/`.
5. `npm start` — the page is available at `/shop`.

## Tests

`product-store.spec.ts` covers: default state, load, favourites computed, toggleFavourite, error path, clearError. It follows the same Vitest + `provideZonelessChangeDetection()` + `MockProvider` pattern as `post-store.spec.ts`. Run with `npm test` after copying into `src/`.

## What I deliberately did NOT do

- Did not run `ng generate`, `ng build`, or `ng lint` (per task constraints).
- Did not modify any file under `src/`.
- Did not regenerate `_theme-colors.scss` to the Figma brown palette — the project already has a generated palette and re-seeding it is a global decision, not a per-feature one.
- Did not add a product-detail route — the Figma frame only shows the list view. The store already supports `selectedProduct` for when a detail screen is added.
