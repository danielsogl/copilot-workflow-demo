# Desktop

Desktop is where Material 3 patterns earn their keep: drawers, navigation rails, multi-column layouts, hover states. It's also where bad responsive code becomes obvious — typography that looks gigantic, line lengths that span 1600px, FABs floating in the middle of nowhere.

## Breakpoint

```scss
@media (min-width: 1280px) { ... }
```

1280 is the Material "large" breakpoint. Many projects also add `1600px` ("extra large") for ultrawide; only add it if the design has a variant for it.

Validation viewports:

- 1280 × 800 — laptop
- 1440 × 900 — common designer mockup width (Figma defaults)
- 1920 × 1080 — desktop monitor

## What changes at desktop

- **Bounded content width.** Don't let main content stretch to 1920px. Cap reading-width containers at ~1200–1280px, centered:
  ```scss
  @media (min-width: 1280px) {
    .posts-page__list {
      max-width: 1200px;
      margin-inline: auto;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  ```
- **Persistent navigation drawer.** Mobile uses a hamburger; desktop typically shows a permanent `<mat-sidenav mode="side" opened>`. If the project's navbar already implements this responsively, lean on it.
- **Hover affordances** become real. Cards lift on hover, links underline, buttons show state-layer hover. The project's `task-card.scss` is a good reference for the elevation/translate pattern.
- **Tap targets** can shrink to `40px` if information density demands it — but never below the WCAG minimum. The project default of `48px` is fine; only tighten when Figma is explicit.
- **Dialogs** open as floating modals (centered), not full-screen. Already configured in `styles.scss`.

## Multi-column patterns from Figma

| Figma desktop layout | Angular pattern                                                    |
| -------------------- | ------------------------------------------------------------------ |
| Sidebar + main       | `mat-sidenav-container` with `mode="side" opened`                  |
| 3-up card grid       | CSS Grid `repeat(3, 1fr)`                                          |
| Hero + cards         | One-off CSS Grid (`grid-template-areas`)                           |
| Master/detail        | Sidenav with a content router-outlet                               |
| Dashboard tiles      | CSS Grid with `grid-auto-flow: dense` if tiles are different sizes |

## Typography scale

Material 3 type scale doesn't grow indefinitely. `display-large` is the top; if a Figma desktop hero is even bigger than that, it's a custom display style — close the gap with an `--app-text-hero` token rather than scaling `display-large` globally.

## Hover, focus, and pointer-only affordances

Wrap hover styles in `@media (hover: hover) and (pointer: fine)` so they only apply to mouse/trackpad users:

```scss
@media (hover: hover) and (pointer: fine) {
  .post-card:hover {
    border-color: color-mix(in srgb, var(--mat-sys-primary) 35%, transparent);
    box-shadow: var(--mat-sys-level2);
    transform: translateY(-1px);
  }
}
```

Always provide a focus equivalent for keyboard users:

```scss
.post-card:focus-visible {
  outline: 2px solid var(--mat-sys-primary);
  outline-offset: 2px;
}
```

## If Figma has no desktop variant

This is the most common shape of the problem. Ask the developer:

1. "Stretch the mobile layout." → Bound the max-width and center; don't introduce columns.
2. "Match a sibling screen's desktop layout." → Find the sibling, adapt the pattern, document the borrowed pattern.
3. "Design as you see fit." → Push back. Get at least a sketch. If the developer insists, propose 2–3 layouts (1-col bounded, 2-col, 3-col grid) and ask them to pick.

Never silently build a desktop layout that wasn't reviewed.

## Testing on desktop

```bash
playwright-cli resize 1440 900
playwright-cli goto http://localhost:4200/<route>
playwright-cli snapshot
playwright-cli screenshot --filename=desktop-1440.png

playwright-cli resize 1920 1080
playwright-cli snapshot
playwright-cli screenshot --filename=desktop-1920.png
```

Compare both against the Figma desktop frame. On 1920 specifically, watch for: content edges touching the viewport, text lines longer than ~80 characters, navigation drifting to the wrong side.
