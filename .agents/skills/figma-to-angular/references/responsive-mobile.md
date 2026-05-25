# Mobile (base layer)

Mobile is the **default** — every SCSS file starts at mobile, and tablet/desktop layer on top via `@media (min-width: …)`. Do not invert this.

## Breakpoint and viewport

| Target           | Min width   | Typical viewport (Playwright)  |
| ---------------- | ----------- | ------------------------------ |
| Small mobile     | up to 359px | 360 × 640                      |
| Mobile (default) | 360–767px   | 390 × 844 (iPhone 14 baseline) |

Most Figma mobile frames are drawn at 390 or 393 wide. Match that in validation so visual diffs are meaningful.

## Layout rules

- Single column. Stack vertically. Don't try to fit two columns on mobile unless the design explicitly does (e.g., a 2-column gallery).
- **Edge-to-edge content** with `16px` (1rem) horizontal padding on the page container. The token already lives in the project — use `padding-inline: 16px;` for now and migrate to a `--app-space-md` token if the value repeats outside the page wrapper.
- Tap targets minimum **48×48 px** (Material default — `touch-target-size` token is `48px` for buttons).
- Sticky bottom action bar / FAB at `bottom: 16px; right: 16px;`. Respect `env(safe-area-inset-bottom)` on iOS:
  ```scss
  .fab {
    position: fixed;
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom));
  }
  ```
- Navbar/toolbar height: respect `--mat-toolbar-standard-height` (56px on mobile by default).

## Typography on mobile

- Body: `--mat-sys-body-medium` (14px usually) — the smaller end. Don't drop below 14px for body copy.
- Headings: scale down one step from desktop. If Figma shows `headline-medium` on mobile, that's fine — Material's tokens are already responsive-aware via the type scale.
- Maximum line length: not an issue on mobile; the screen does the wrapping.

## Interaction

- **Hover** doesn't exist on touch. Don't depend on `:hover` for affordances — use a visible icon, a chevron, an outline. Use `@media (hover: hover)` to scope hover styles so they don't fire on tap-and-hold:
  ```scss
  @media (hover: hover) {
    .post-card:hover { ... }
  }
  ```
- **Long-press / swipe**: only if the design says so. Don't invent gestures.

## Material density

Leave at `density: 0` (the project default). Touch UIs benefit from a roomier density; only go denser if the design clearly demands it and the developer agrees.

## Common Figma → mobile-SCSS patterns

A typical mobile page from Figma:

```
Frame: 390 × N
  Header (sticky top)
  Scroll area
    Card 1
    Card 2
    …
  FAB (sticky bottom-right)
```

Maps to:

```html
<section class="posts-page">
  <app-posts-header class="posts-page__header" />
  <main class="posts-page__list">
    @for (post of posts(); track post.id) {
    <app-post-card [post]="post" />
    }
  </main>
  <button mat-fab class="posts-page__fab" (click)="createPost()">
    <mat-icon>add</mat-icon>
  </button>
</section>
```

```scss
.posts-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;

  &__header {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--mat-sys-surface);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px calc(96px + env(safe-area-inset-bottom));
  }

  &__fab {
    position: fixed;
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
```

Note `100dvh` (dynamic viewport) — `100vh` is wrong on iOS Safari when the URL bar shows/hides.

## What not to do

- Don't use `vw` for spacing. It produces inconsistent results between mobile sizes.
- Don't write `@media (max-width: …)` — this is mobile-first; the mobile rules ARE the base, and you `min-width` up from there.
- Don't hide content with `display: none` to "make it fit" on mobile. If Figma shows different content per breakpoint, that's a content decision; ask the developer.
