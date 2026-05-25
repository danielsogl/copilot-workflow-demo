# Tablet

Tablet is where most "responsive bugs" actually live: not narrow enough to behave like mobile, not wide enough to behave like desktop. Treat it as a deliberate layer, not as "whatever happens between two other breakpoints."

## Breakpoint

```scss
@media (min-width: 768px) { ... }
```

768 matches the Material Design "medium" breakpoint and the iPad portrait width (768). For larger tablets (iPad landscape, 1024), the desktop layer often takes over — see [responsive-desktop.md](responsive-desktop.md).

Typical Playwright viewports for validation:

- 768 × 1024 (iPad portrait)
- 1024 × 768 (iPad landscape — may render in desktop layer depending on design)

## What changes at tablet

- **Page gutters grow.** Mobile uses 16px; tablet typically uses 24–32px. If you closed a gap for the mobile gutter as `--app-space-md`, add `--app-space-lg` for tablet and switch via the media query.
- **Lists can become two-column grids.** A vertical feed of cards on mobile becomes a 2-col grid on tablet if the design shows it. Use CSS Grid:
  ```scss
  @media (min-width: 768px) {
    .posts-page__list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
  }
  ```
- **Sticky FAB position** — usually stays bottom-right, but on tablet some designs replace the FAB with an inline "Create" button in the header. Check Figma; ask if unclear.
- **Navbar** — mobile navbars often collapse navigation behind a hamburger; tablet may expand it inline. The project's `core/navbar` already exists — check if it has its own breakpoint behavior before adding more.
- **Dialogs** — Material `MatDialog` is full-bleed on mobile by default but constrained on tablet/desktop. The project already overrides dialog `container-shape: 28px` and a max width is set via the `.task-dialog` rule; reuse that pattern.

## Tablet-only patterns

- **Master / detail split**: only introduce if Figma actually shows it. Don't invent.
- **Side rail navigation**: if Figma has a tablet variant with a side rail, use `<mat-nav-list>` inside a `mat-drawer` that starts open at this breakpoint.

## Density tweaks

Tablet content is denser than mobile but still touch-first. Stay at `density: 0` unless the design explicitly compacts.

## If Figma has no tablet variant

Ask the developer. Don't invent. The realistic answers are:

1. "Let it scale — same as mobile, just wider." → No tablet-specific CSS; the mobile layer handles it. Confirm column count stays at 1.
2. "Apply the desktop layout earlier." → Move the `min-width: 1280px` rule to `min-width: 768px`.
3. "Build a 2-column intermediate." → Now you need a designer-validated decision on what the 2-col looks like. Push back politely.

Record the decision in the gap report.

## Testing on tablet

```bash
playwright-cli resize 768 1024
playwright-cli goto http://localhost:4200/<route>
playwright-cli snapshot
playwright-cli screenshot --filename=tablet-portrait.png
playwright-cli resize 1024 768
playwright-cli snapshot
playwright-cli screenshot --filename=tablet-landscape.png
```

Compare against the Figma tablet frame (if it exists). If not, eyeball the mobile and desktop versions for continuity — nothing should look "broken" in between.
