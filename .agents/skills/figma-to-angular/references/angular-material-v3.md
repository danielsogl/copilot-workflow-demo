# Angular Material v3 — applied to this project

This project already has a Material 3 theme set up in `src/styles.scss` with `mat.theme(...)` and a generated palette in `src/theme/_theme-colors.scss`. You almost never need to redefine the theme; you need to use it correctly.

## Where colors come from

The base theme call:

```scss
@include mat.theme(
  (
    color: (
      primary: tt-theme.$primary-palette,
      tertiary: tt-theme.$tertiary-palette,
    ),
    typography: (
      plain-family: "Roboto Flex",
      brand-family: "Roboto Flex",
      ...,
    ),
    density: 0,
  )
);
```

…generates the full set of `--mat-sys-*` CSS custom properties. Use those in every component SCSS file. Never reach into `_theme-colors.scss` from a component.

### System color tokens you'll use most

```
--mat-sys-primary              --mat-sys-on-primary
--mat-sys-primary-container    --mat-sys-on-primary-container
--mat-sys-secondary            --mat-sys-on-secondary
--mat-sys-tertiary             --mat-sys-on-tertiary
--mat-sys-error                --mat-sys-on-error
--mat-sys-error-container      --mat-sys-on-error-container
--mat-sys-surface              --mat-sys-on-surface
--mat-sys-surface-container-lowest / -low / (default) / -high / -highest
--mat-sys-outline              --mat-sys-outline-variant
--mat-sys-shadow               --mat-sys-scrim
--mat-sys-inverse-surface      --mat-sys-inverse-on-surface
```

### Typography tokens

```
--mat-sys-display-large / -medium / -small
--mat-sys-headline-large / -medium / -small
--mat-sys-title-large / -medium / -small
--mat-sys-body-large / -medium / -small
--mat-sys-label-large / -medium / -small
```

Use shorthand: `font: var(--mat-sys-body-medium);` applies family, size, weight, line-height, and tracking in one go.

### Elevation tokens

```
--mat-sys-level0 .. --mat-sys-level5
```

Apply with `box-shadow: var(--mat-sys-level2);` instead of raw `box-shadow: 0 4px 8px ...`.

## Component overrides — the right way to customize

Material v3 exposes per-component override mixins. Use them in `src/styles.scss` (global) when the customization is theme-wide. Use scoped overrides only when truly local.

```scss
@include mat.button-overrides(
  (
    filled-container-shape: 12px,
    filled-horizontal-padding: 20px,
  )
);

@include mat.card-overrides(
  (
    elevated-container-shape: 16px,
    elevated-container-color: var(--mat-sys-surface-container-low),
  )
);
```

The project already overrides toolbar, dialog, card, fab, and chips in `styles.scss`. Add to that block; don't sprinkle overrides into feature SCSS files.

**Never** override the internal MDC selectors (`.mdc-button__label`, `.mat-mdc-form-field-flex`, etc.). They are not API and will break on minor Material upgrades. If a token doesn't exist for what you need to change, check the component's "Styling" doc page on context7 — the token might be named differently than you'd expect.

## Component selection rules

| Need                            | Use                                           | Not                                                                  |
| ------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Tappable surface with elevation | `<mat-card appearance="elevated">`            | A custom `<div class="card">`                                        |
| Primary action                  | `<button mat-flat-button>` (filled)           | `<button class="btn">`                                               |
| Secondary action                | `<button mat-stroked-button>` (outlined)      |                                                                      |
| Tertiary / low-emphasis action  | `<button mat-button>` (text)                  |                                                                      |
| FAB                             | `<button mat-fab>` or `<button mat-mini-fab>` |                                                                      |
| Inline status                   | `<mat-chip>`                                  | Custom pill                                                          |
| Icon                            | `<mat-icon>fontset_name</mat-icon>`           | `<img>`                                                              |
| Form input                      | `<mat-form-field>` + `<input matInput>`       | Bare `<input>`                                                       |
| List                            | `<mat-list>` / `<mat-nav-list>`               | `<ul>` styled to look like a list (only when there's no interaction) |
| Tabs                            | `<mat-tab-group>`                             | Custom tabs                                                          |
| Dialog                          | `MatDialog.open(...)`                         | Custom modal                                                         |
| Snackbar / toast                | `MatSnackBar`                                 | Custom notification                                                  |

Reach for headless ARIA primitives from `@angular/material/aria` (Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid) only when Material's components don't fit and you need a custom-styled accessible widget. See the `angular-developer` skill's `angular-aria.md` reference.

## Density

The project ships at `density: 0`. If a Figma design clearly uses a denser look (compact rows, tighter buttons), apply a scoped density override instead of mutating the global theme:

```scss
.compact-zone {
  @include mat.button-density(-1);
  @include mat.form-field-density(-2);
}
```

## When to call context7

If you need to:

- Know the exact tokens a component exposes for overrides → context7 docs: "Styling" tab on that component.
- Verify behavior change between Material versions (e.g., is `mat-card` still the right primitive in v21?) → context7 `/websites/material_angular_dev`.
- Look up an API you're unsure about (signal inputs on `MatChip`, `appearance` variants, etc.).

Don't rely on training data for tokens or APIs — they change between releases.

## Dark mode

The project sets `color-scheme: light dark` on `html`, which gives the user-agent dark/light handling. Material tokens flip automatically. **Test both** in playwright validation — use `playwright-cli eval "matchMedia('(prefers-color-scheme: dark)').matches"` and toggle via the emulation API.
