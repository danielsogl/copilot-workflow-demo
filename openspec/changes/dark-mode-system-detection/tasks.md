## 1. Dark Theme Definition

- [ ] 1.1 Add dark theme `mat.theme()` block scoped under `.dark-theme` class in `src/styles.scss`
- [ ] 1.2 Replace hardcoded `background-color: #f5f7fa` on `body` with Material surface token `var(--mat-sys-surface)`

## 2. Theme Manager Service

- [ ] 2.1 Create `ThemeManager` service at `src/app/core/theme/theme-manager.ts` with `themeMode` signal (`'light' | 'dark' | 'system'`), `resolvedTheme` computed signal, `localStorage` read/write, and `matchMedia` listener
- [ ] 2.2 Write unit tests for `ThemeManager` at `src/app/core/theme/theme-manager.spec.ts`

## 3. Navbar Theme Toggle

- [ ] 3.1 Add theme toggle `mat-icon-button` to `Navbar` component that injects `ThemeManager` and cycles through system → light → dark
- [ ] 3.2 Display appropriate icon based on current mode: `brightness_auto` / `light_mode` / `dark_mode`

## 4. Theme-Aware Component Styles

- [ ] 4.1 Replace hardcoded hex colors in `task-card.scss` (`#e53935`) with Material error token `var(--mat-sys-error)`
- [ ] 4.2 Replace hardcoded hex colors in `dashboard-stats.scss` (`#757575`, `#1e88e5`, `#43a047`, `#e53935`) with Material design tokens
- [ ] 4.3 Replace hardcoded background color in `task-filters.scss` (`#fde8e8`) with Material error-container token `var(--mat-sys-error-container)`

## 5. Verification

- [ ] 5.1 Run linter to confirm no remaining hardcoded hex colors in component SCSS files
- [ ] 5.2 Run existing unit tests to confirm no regressions
