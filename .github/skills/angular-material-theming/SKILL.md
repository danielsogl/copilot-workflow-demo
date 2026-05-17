---
name: angular-material-theming
description: Material 3 theming for Angular Material v21+ using the mat.theme() mixin and --mat-sys-* system tokens. Use whenever the user works on theme.scss, component .scss files, color/typography/density configuration, dark mode, or component-specific token overrides. Use also when reviewing styles that reference colors or fonts.
---

# Angular Material Theming (Material 3, v21+)

This project uses the **Material 3** theming API exclusively. Legacy APIs are forbidden:
`mat-palette`, `mat-light-theme`, `mat-dark-theme`, `angular-material-theme`, `mat-typography-config`, `define-palette` — none of these are allowed.

## File layout

- Global theme: **`src/app/theme/theme.scss`** (or `src/styles.scss`). Applied to `html`.
- One source of truth — colors, typography, and density live there.
- Component styles consume `--mat-sys-*` tokens; they never define palettes.

## Global theme

```scss
@use '@angular/material' as mat;

html {
  color-scheme: light dark;

  @include mat.theme((
    color: mat.$violet-palette,   // any M3 palette: $azure, $rose, $magenta, $cyan, ...
    typography: Roboto,
    density: 0,                    // 0 = standard; -1 / -2 / -3 for denser layouts
  ));
}
```

`color-scheme: light dark` enables automatic OS-driven light/dark switching via the CSS `light-dark()` function — **do not** create a separate `.dark-theme` block.

## Component styles

Consume system tokens; never hardcode colors or fonts:

```scss
.task-card {
  background: var(--mat-sys-surface-container);
  color: var(--mat-sys-on-surface);
  border: 1px solid var(--mat-sys-outline-variant);
  border-radius: var(--mat-sys-corner-medium);
  font: var(--mat-sys-body-large);
  padding: 16px;
}

.task-card__title {
  color: var(--mat-sys-primary);
  font: var(--mat-sys-title-medium);
}
```

### Common token groups

| Group       | Examples                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------- |
| Color       | `--mat-sys-primary`, `--mat-sys-on-primary`, `--mat-sys-primary-container`, `--mat-sys-on-primary-container`, `--mat-sys-secondary`, `--mat-sys-tertiary`, `--mat-sys-error`, `--mat-sys-surface`, `--mat-sys-surface-container`, `--mat-sys-on-surface`, `--mat-sys-outline`, `--mat-sys-outline-variant` |
| Typography  | `--mat-sys-display-large`, `--mat-sys-headline-medium`, `--mat-sys-title-large`, `--mat-sys-body-large`, `--mat-sys-body-medium`, `--mat-sys-label-large` |
| Shape       | `--mat-sys-corner-small`, `--mat-sys-corner-medium`, `--mat-sys-corner-large`                |

## Component-level overrides

Use the per-component override mixins instead of attribute selectors and `!important`:

```scss
@use '@angular/material' as mat;

.special-button {
  @include mat.button-overrides((
    container-color: var(--mat-sys-tertiary-container),
    label-text-color: var(--mat-sys-on-tertiary-container),
  ));
}
```

## Per-section theme overrides

Scope theme-level token overrides under a class on the section root:

```scss
.high-emphasis {
  @include mat.theme-overrides((
    primary-container: #84ffff,
  ));
}
```

Or inline at the theme call site:

```scss
@include mat.theme((
  color: mat.$azure-palette,
  typography: Roboto,
  density: 0,
), $overrides: (
  primary-container: orange,
));
```

## Forced color scheme

```scss
.force-dark { color-scheme: dark; }
.force-light { color-scheme: light; }
```

## Rules

- Always `@use '@angular/material' as mat;` — never `@import`.
- Never hardcode colors, fonts, or sizes in component styles.
- No `!important` in theme or component styles.
- No SCSS color manipulation (`lighten()`, `darken()`, `mix()`) on theme colors — pick the appropriate `-container` / `on-` token instead.
- Never duplicate the theme block for dark mode.
