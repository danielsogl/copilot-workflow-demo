# Posts feed (Figma `24:3285`) — audit + plan before I scaffold

I pulled the frame from the Figma MCP. Two important things up front:

1. **You're on the Figma Starter MCP plan, and we hit the per-session tool-call cap after three calls.** `whoami`, `get_metadata` on the page frame, and `get_variable_defs` succeeded; `get_design_context`, `get_screenshot`, and follow-up `get_metadata` calls on the `stacked-card`/`top-app-bar` masters were all rejected with `"You've reached the Figma MCP tool call limit on the Starter plan."` That means I have the page-level structure and tokens, but I do **not** have the inside of the card master. I've flagged everywhere that affects below.
2. The frame I have is mobile only (411 × 731, "Google Pixel 2 - 1"). No tablet/desktop frames in this URL.

---

## Audit — Google Pixel 2 - 1 (24:3285)

**Frame size:** 411 × 731 (mobile, scrolling — content runs to ~1610px tall)
**Variants present:** mobile only. No tablet / desktop frames at this node id.

### Component inventory

- `top-app-bar` — 1× instance at `(-1, 0)` 412 × 64. Material 3 top app bar (small variant by height).
- `stacked-card` — **3× instances** of the same master, at `y=99, 614, 1129`, each 360 × 480, x=25. Strong reuse signal → `ui/stacked-card`.
- `FAB` — 1× plain frame (NOT a Figma component) at `(331, 651)`, 56 × 56 with a 24 × 24 icon at `(16, 16)`. Sits 24px from right and 24px from bottom of the visible viewport. Treat as a single `<button mat-fab>` in the page.

### Tokens (from `get_variable_defs`)

All eleven values exposed on this node are bound to published M3 variables — **100% bound at the page level**:

| Figma variable                                      | Maps to                         |
| --------------------------------------------------- | ------------------------------- |
| `M3/sys/light/on-surface` (#201A18)                 | `--mat-sys-on-surface`          |
| `M3/sys/light/on-surface-variant` (#52433E)         | `--mat-sys-on-surface-variant`  |
| `M3/sys/light/primary` (#9A4521)                    | `--mat-sys-primary`             |
| `M3/sys/light/on-primary` (#FFFFFF)                 | `--mat-sys-on-primary`          |
| `M3/sys/light/surface` (#FCFCFC)                    | `--mat-sys-surface`             |
| `M3/sys/light/outline` (#85736D)                    | `--mat-sys-outline`             |
| `M3/sys/light/secondary-container` (#FFDBCD)        | `--mat-sys-secondary-container` |
| `M3/body/medium` (Roboto 14/20, ls 0.25)            | `--mat-sys-body-medium`         |
| `M3/label/large` (Roboto 14/20, weight 500, ls 0.1) | `--mat-sys-label-large`         |
| `M3/title/large` (Roboto 22/28, ls 0)               | `--mat-sys-title-large`         |
| `M3/Elevation Light/2` (two-layer drop shadow)      | `--mat-sys-level2`              |
| `M3/Elevation Light/3` (two-layer drop shadow)      | `--mat-sys-level3`              |

**Caveat:** that "100% bound" only counts what is visible on the frame node itself. I could not inspect inside the `stacked-card` master (rate-limited), so any locally-overridden fills inside the card are invisible to this audit.

### Spacing scale

Project scale is 4 / 8 / 12 / 16 / 24 / 32. The frame uses:

- **24-25px** side gutter (cards at `x=25` on a 411 wide frame). Matches Material's 24dp mobile margin to within 1px → propose `--app-feed-side-gutter: 24px`.
- **35px** clearance below the top app bar (first card at `y=99` and app bar bottom at `y=64`).
- **35px** vertical gap between consecutive `stacked-card` instances.
- **24px** inset from the right and bottom edges of the visible viewport for the FAB → matches the Material default.

The 35px gap is the only real outlier — it is not on the project's spacing scale and is not exposed as a published variable. I want to ask before silently rounding it to 32px.

### Elevations & shapes

- `mat.card-overrides()` in `src/styles.scss` already sets `elevated-container-shape: 16px`. Material 3 default is 12dp. Until I see the card master, I can't tell which one Figma uses. If 12dp, we need to override the override locally on the feature.
- Two elevation styles are referenced (`Elevation Light/2` and `Elevation Light/3`). `mat-card` defaults to level 1, so the `stacked-card` likely sets a higher elevation. Unknown which until the master is readable.

### Inconsistencies

None visible at the page level — all three card instances are the same component, same size, same x-position. (Inconsistencies inside the master cannot be checked from here.)

---

## Risks I want you to resolve before I code

1. **Card master is opaque.** The `stacked-card` (used 3×) has no design context I can read on this plan. I need either (a) the Figma plan upgraded so I can call `get_design_context` on `17:377` and `get_metadata` on the master, or (b) you to paste the structure: which areas are media / title / supporting text / actions, what icons it uses, whether tap on the card opens a detail page, and whether it has a kebab/overflow menu. Without this I can scaffold a component shell but the inner layout will be guesswork.
2. **Top app bar — feature-local or app-shell?** Your app already has a global toolbar (`src/app/app.html`). Should the Figma top-app-bar replace it for this route, or are you treating it as the same app shell with a "Posts" page title swapped in? My default is "this is the app shell — just set the route title".
3. **FAB icon and behavior.** The 24×24 icon glyph isn't extractable from the frame metadata. Material default for "create new post" would be `add`. Behavior: open a `mat-dialog` to compose a post, or navigate to a new route? Default: open a `PostFormDialog` modeled on `task-form-dialog`.
4. **Post model vs Figma card.** Today `Post` has `userId / id / title / body`. The Figma card is 360×480 — that is big for just title + body, and the M3 "stacked card" template usually has a media area. Will we be adding a media/image field? If yes, is the source already in the API, or is it design-only?
5. **States not in Figma:**
   - Empty state — what shows when `postsEntities()` is empty?
   - Loading state — skeleton card, spinner, or nothing?
   - Error state — toast, inline banner, or full-page error?
   - Long-text overflow — clamp `body` at N lines, or expand on tap?
     Without answers I'll default to: empty = "No posts yet" centered illustration-less text; loading = a single inline `mat-progress-bar` at the top of the list; error = `mat-snack-bar` from `store.error()`; body clamped to 4 lines with ellipsis.
6. **Card vertical gap.** 35px is not on the project's 4/8/12/16/24/32 scale. Confirm: is `35px` intentional, or should I close the gap as 32px? I will close the gap as a CSS custom property either way (`--app-feed-card-gap`), but the value should be your call.
7. **Tablet / desktop adaptation.** Figma only has mobile. Three options on tablet/desktop:
   - (a) keep a single centered column at ~640px wide (safest, matches mobile rhythm),
   - (b) two columns at tablet, three at desktop (more screen real estate),
   - (c) full-bleed list with wider cards.
     My default is (a) unless you say otherwise.
8. **Navigation entry.** This becomes `/posts` as a lazy route. Should I also add a nav item somewhere (sidebar / toolbar menu / nowhere)? Default: add the route only; nav stays untouched.

---

## Proposed plan (won't write code until you ack)

### Folder layout (slots into the existing `features/posts/`)

```
features/posts/
├── data/                          (already there — kept as-is)
├── feature/post-feed-page/        NEW — routable container, holds PostStore wiring
└── ui/stacked-card/               NEW — dumb component, 1:1 with Figma instance
```

No `util/`, no new store. The existing `PostStore` (NgRx signalStore with entities + `loadPosts/create/update/delete/isEmpty/loading/error`) covers this screen.

### Components

- **`PostFeedPage`** (`feature/post-feed-page`) — standalone, OnPush, signal-based. Calls `store.loadPosts()` on init. Renders the empty state, the `@for` over `postsEntities()`, the loading/error chrome, and the FAB. FAB click opens a `mat-dialog` to create (placeholder until Q3 is answered).
- **`StackedCard`** (`ui/stacked-card`) — standalone, OnPush, `input.required<Post>()`, `output<Post>()` for `open`. Built on `mat-card` so it inherits the project's `elevated-container-shape: 16px` and color overrides. Inner layout is a stub (header / body / actions) pending Q1.

### Routing

Append to `src/app/app.routes.ts`:

```ts
{
  path: "posts",
  loadComponent: () =>
    import("./features/posts/feature/post-feed-page/post-feed-page").then(
      (m) => m.PostFeedPage,
    ),
}
```

### Tokens

I'll add **three** `gap-closed` custom properties to `src/styles.scss` (full file in `outputs/proposed-tokens.scss`):

```scss
// gap-closed: app-feed-side-gutter   — 24px (Figma 25px, rounded to Material 24dp)
// gap-closed: app-feed-card-gap      — 35px (PROVISIONAL — see Q6)
// gap-closed: app-fab-edge-inset     — 24px (matches Material default)
```

No new color, typography, or elevation tokens — all eleven Figma variables on the frame map cleanly to existing `--mat-sys-*` roles.

### Validation gates (per the skill)

After implementation: `npx ng lint`, `npx ng build`, Playwright visual check at mobile / tablet / desktop, behavior check (load → open card → FAB → create).

---

## What I need from you

Please answer Q1–Q8 above (or at minimum Q1, Q3, Q5, Q6, Q7). Once I have those:

- If Q1 is "upgrade Figma plan" or "here's the structure", I will re-call the MCP and finish the audit, then scaffold.
- If Q1 is "just go with sensible defaults", I will scaffold `StackedCard` with header / body / actions and we iterate on visual diff.

Files I produced for this audit (not in `src/`):

- `outputs/figma-extract.json` — full raw extraction including the bound variables, frame dimensions, child instances, and the rate-limit notes.
- `outputs/proposed-tokens.scss` — the three CSS custom properties to add to `styles.scss`, each with the `gap-closed:` annotation the skill requires.
- `outputs/proposed-structure.md` — the folder + component breakdown.
