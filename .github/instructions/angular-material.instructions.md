---
description: "Guidelines for implementing Angular Material 3 themes (mat.theme mixin), system tokens, typography, density, and component theming for Angular Material v21+"
applyTo: "**/*.ts, **/*.html, **/*.scss"
---

# Angular Material Theming Guidelines (Material 3, v21+)

These guidelines define how to implement, structure, and maintain themes using the Material 3 theming system in Angular Material v21+. The legacy `mat-light-theme`, `mat-palette`, and `angular-material-theme` APIs are **forbidden** — use the `mat.theme()` mixin and system tokens (`--mat-sys-*`) exclusively.

---

## 1. Theme Structure & Organization

- **Central theme file:** Define the global theme in `src/app/theme/theme.scss` (or `src/styles.scss`). Apply it to the `html` selector so CSS variables cascade across the entire app.
- **One source of truth:** All color, typography, and density configuration lives in the central theme. Components must consume system tokens, never hardcode colors or fonts.
- **Feature overrides:** For feature-specific token overrides, scope `mat.theme-overrides()` under a CSS class on the feature root.

## 2. Defining the Theme

Use the `mat.theme()` mixin with a Material 3 palette, font, and density:

```scss
@use '@angular/material' as mat;

html {
  color-scheme: light dark;

  @include mat.theme((
    color: mat.$violet-palette,   // any M3 palette: $azure, $rose, $magenta, $cyan, etc.
    typography: Roboto,
    density: 0,                    // 0 = standard; -1, -2, -3 for denser layouts
  ));
}
```

`color-scheme: light dark` enables automatic light/dark switching from the user's OS preference (Material 3 colors are emitted via the CSS `light-dark()` function).

### Per-section overrides

```scss
.high-emphasis {
  @include mat.theme-overrides((
    primary-container: #84ffff,
  ));
}
```

Or inline at the top level:

```scss
@include mat.theme((
  color: mat.$azure-palette,
  typography: Roboto,
  density: 0,
), $overrides: (
  primary-container: orange,
));
```

## 3. Consuming Theme Tokens in Components

Material 3 emits CSS custom properties prefixed with `--mat-sys-*`. Components consume these directly — never SCSS variables or hex values.

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

Common system token groups:

- **Color roles:** `--mat-sys-primary`, `--mat-sys-on-primary`, `--mat-sys-primary-container`, `--mat-sys-on-primary-container`, `--mat-sys-secondary`, `--mat-sys-tertiary`, `--mat-sys-error`, `--mat-sys-surface`, `--mat-sys-surface-container`, `--mat-sys-on-surface`, `--mat-sys-outline`, `--mat-sys-outline-variant`
- **Typography:** `--mat-sys-display-large`, `--mat-sys-headline-medium`, `--mat-sys-title-large`, `--mat-sys-body-large`, `--mat-sys-body-medium`, `--mat-sys-label-large`
- **Shape:** `--mat-sys-corner-small`, `--mat-sys-corner-medium`, `--mat-sys-corner-large`

## 4. Component Theming

Material components automatically pick up the theme. For component-specific token overrides, use the per-component override mixins:

```scss
@use '@angular/material' as mat;

.special-button {
  @include mat.button-overrides((
    container-color: var(--mat-sys-tertiary-container),
    label-text-color: var(--mat-sys-on-tertiary-container),
  ));
}
```

## 5. SCSS Usage Rules

- **Always use `@use`** — never `@import` for `@angular/material`.
- **Never use legacy APIs:** `mat-palette`, `mat-light-theme`, `mat-dark-theme`, `angular-material-theme`, `mat-typography-config`, `define-palette` are all forbidden.
- **Never hardcode colors or fonts** in component styles. Always reference `--mat-sys-*` tokens.
- **No `!important`** in theme or component styles.
- **No SCSS color manipulation** (`lighten()`, `darken()`, `mix()`) on theme colors — use the appropriate `-container` / `on-` token instead.

## 6. Dark Mode

With `color-scheme: light dark` and the `mat.theme()` mixin, dark mode is automatic — Material emits `light-dark(lightValue, darkValue)` CSS for every color token. Do **not** create a separate dark theme block or toggle a `.dark-theme` class.

To force a specific scheme on a subtree:

```scss
.force-dark {
  color-scheme: dark;
}
```

## 7. Do's and Don'ts

**Do:**
- Configure all theming in one central file via `mat.theme()`
- Consume colors and typography exclusively through `--mat-sys-*` CSS variables
- Rely on `color-scheme: light dark` for automatic dark mode
- Use per-component override mixins (`mat.button-overrides()`, etc.) when specific instances need different tokens

**Don't:**
- Use `mat-palette`, `mat-light-theme`, `angular-material-theme`, or any other legacy theming API
- Hardcode colors, fonts, or sizes in component styles
- Maintain separate light and dark theme blocks
- Use `@import` for `@angular/material`
