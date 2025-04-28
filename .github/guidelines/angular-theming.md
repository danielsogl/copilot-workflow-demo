# Angular Material Theming Guidelines (v3)

These guidelines define how to implement, structure, and maintain themes using Angular Material v3 in this project. They are based on the official [Angular Material Theming Guide](https://material.angular.io/guide/theming) and tailored for consistency, scalability, and maintainability.

---

## 1. Theme Structure & Organization

- **Central Theme File:**
  - Define all theme configuration in a single SCSS file (e.g., `src/theme/_theme-colors.scss`).
  - Import this file in `src/styles.scss`.
- **No Inline Styles:**
  - Do not use inline styles or hardcoded colors in components. Always use theme variables.
- **Feature-Level Theming:**
  - For feature-specific overrides, create a dedicated SCSS partial (e.g., `feature/_feature-theme.scss`) and import it in the main theme file.

## 2. Color System

- **Material Color Palettes:**
  - Use Material color palettes (`mat-palette`) for primary, accent, and warn colors.
  - Define palettes for both light and dark themes.
- **Custom Colors:**
  - Define custom palettes using `mat-palette` and reference them via theme variables.
- **Surface & Background:**
  - Use Material surface and background tokens for backgrounds, cards, and containers.

## 3. Theme Definition & Application

- **Create Themes:**
  - Use `mat-light-theme` and `mat-dark-theme` to define light and dark themes.
  - Example:
    ```scss
    $my-primary: mat-palette($mat-indigo);
    $my-accent: mat-palette($mat-pink, A200, A100, A400);
    $my-warn: mat-palette($mat-red);
    $my-theme: mat-light-theme(
      (
        color: (
          primary: $my-primary,
          accent: $my-accent,
          warn: $my-warn,
        ),
      )
    );
    ```
- **Apply Themes Globally:**
  - Use `@include angular-material-theme($my-theme);` in your global styles.
- **Dark Mode:**
  - Define a dark theme and apply it using a CSS class (e.g., `.dark-theme`).
  - Example:
    ```scss
    .dark-theme {
      @include angular-material-theme($my-dark-theme);
    }
    ```
  - Toggle dark mode by adding/removing the class on the root element.

## 4. Typography

- **Material Typography Config:**
  - Use `mat-typography-config` to define custom typography.
  - Apply with `@include angular-material-typography($my-typography);`.
- **Consistent Font Usage:**
  - Use theme typography variables in all components.

## 5. Component Theming

- **Theming Mixins:**
  - Use Angular Material theming mixins for custom components.
  - Example:
    ```scss
    @use "@angular/material" as mat;
    @include mat.button-theme($my-theme);
    ```
- **Custom Component Themes:**
  - For custom components, define and use your own theming mixins that accept a theme config.

## 6. SCSS Usage & Best Practices

- **@use Syntax:**
  - Use the `@use` rule for all Angular Material imports (not `@import`).
- **No Direct Color Usage:**
  - Never use raw color values. Always use theme variables or palette functions.
- **Variables Naming:**
  - Name theme variables descriptively (e.g., `$app-primary`, `$app-accent`).
- **No !important:**
  - Avoid `!important` in theme styles.

## 7. Do's and Don'ts

**Do:**

- Centralize all theming logic in SCSS theme files
- Use Material mixins and tokens for all component theming
- Support both light and dark themes
- Use CSS classes to toggle themes
- Document custom palettes and typography in the theme file

**Don't:**

- Hardcode colors or typography in components
- Use inline styles for theming
- Use legacy `@import` for Material SCSS
- Mix multiple theme definitions in a single file

## 8. Integration & Maintenance

- **Import Order:**
  - Always import theme files before component styles in `styles.scss`.
- **Upgrades:**
  - Review the [Angular Material changelog](https://github.com/angular/components/blob/main/CHANGELOG.md) for theming changes on upgrades.
- **Documentation:**
  - Document all customizations and overrides in the theme file.

---

For more details, see the [official Angular Material Theming Guide](https://material.angular.io/guide/theming).
