# Validation — four gates before you call it done

Don't tell the developer "done" until all four pass. They're cheap; do them.

## 1. Lint

```bash
npx ng lint
```

Fix every error. Warnings are case-by-case — if the warning is "use signal inputs instead of decorators" and your code uses signal inputs, the warning is stale; otherwise, fix it.

If `ng lint` reveals you imported a Material module that isn't used, remove it. Standalone components only import what they render.

## 2. Build

```bash
npx ng build
```

Type-check and bundle. Common failures and what they actually mean:

| Error                                           | Usually means                                                                                        |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NG8001: '<mat-xyz>' is not a known element`    | Forgot to import the Material module in the component's `imports` array                              |
| `Property 'x' does not exist on type 'unknown'` | A signal input is missing a type; use `input.required<T>()` or `input<T>()`                          |
| SCSS error: "Undefined variable: $...palette"   | The component SCSS is reaching into `_theme-colors.scss` directly — don't; use `--mat-sys-*` instead |
| `Module not found` for a `loadComponent` route  | Path or class name typo in `app.routes.ts`                                                           |

If the build is slow or hangs, drop `--watch` and run a one-shot `npx ng build`.

## 3. Visual fidelity against Figma

This is where `playwright-cli` earns its keep. Start the dev server (you'll need it running for screenshots) and step through each breakpoint.

```bash
# In one shell, start the dev server
npm start
# (or: npx ng serve)

# In another, drive the browser
playwright-cli open http://localhost:4200/<route> --browser=chrome
playwright-cli resize 390 844    # mobile
playwright-cli screenshot --filename=mobile.png
playwright-cli resize 768 1024   # tablet
playwright-cli screenshot --filename=tablet.png
playwright-cli resize 1440 900   # desktop
playwright-cli screenshot --filename=desktop.png
playwright-cli close
```

Compare each screenshot against the corresponding Figma frame (export the frame from Figma, or have the developer share an image). Walk through this checklist:

- [ ] Spacing matches (eyeball 4px diffs; flag 8px+ diffs)
- [ ] Colors match (compare on-surface vs. surface, primary vs. tertiary)
- [ ] Typography hierarchy matches (headline vs. title vs. body)
- [ ] Corner radii match (especially cards, buttons, chips)
- [ ] Elevation matches (shadows)
- [ ] Icon set matches
- [ ] Component variants match (filled vs. outlined buttons, etc.)

If diffs exist that are not explained by your audit, **stop and reconcile**. Don't ship "close enough" without naming the diffs.

## 4. Responsive behavior

Visual fidelity at each breakpoint is necessary but not sufficient. Resize the browser through a range and confirm the layout doesn't break between breakpoints:

```bash
playwright-cli resize 360 640
playwright-cli snapshot
playwright-cli resize 414 896
playwright-cli snapshot
playwright-cli resize 600 800
playwright-cli snapshot
playwright-cli resize 768 1024
playwright-cli snapshot
playwright-cli resize 1024 768
playwright-cli snapshot
playwright-cli resize 1280 800
playwright-cli snapshot
playwright-cli resize 1440 900
playwright-cli snapshot
playwright-cli resize 1920 1080
playwright-cli snapshot
```

Look for:

- Horizontal scrollbars at any width (almost always a layout bug)
- Content that "jumps" awkwardly between breakpoints (one extra column appearing, padding doubling)
- Overlapping elements (FAB covering content, header sitting on top of first card)
- Text overflow at the narrowest width (titles cut off, buttons squeezed)

### Optional: dark mode

If the project supports light + dark (it does — `color-scheme: light dark` is set), test both:

```bash
playwright-cli run-code "async (page) => await page.emulateMedia({ colorScheme: 'dark' })"
playwright-cli screenshot --filename=mobile-dark.png
```

Material tokens flip automatically, but custom tokens you added (`--app-*`) need to be reviewed in both modes. If a custom color is the same in both modes, ask whether that's intentional.

## What "done" looks like

```
✅ ng lint: clean
✅ ng build: succeeded
✅ Visual diff vs Figma at 390 × 844: matches (or: documented diffs)
✅ Visual diff vs Figma at 768 × 1024: matches
✅ Visual diff vs Figma at 1440 × 900: matches
✅ Resize sweep 360 → 1920: no layout breaks
✅ Dark mode: matches (or: documented diffs)
```

Anything less, and you say it explicitly.
