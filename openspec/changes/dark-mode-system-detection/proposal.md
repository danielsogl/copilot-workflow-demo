## Why

The application currently only supports a light theme (hardcoded `theme-type: light` in `styles.scss`). Users on dark system themes get a jarring bright UI, and there's no way to switch. Adding dark mode with system preference detection improves usability, accessibility, and aligns with modern UX expectations.

## What Changes

- Add a dark theme configuration alongside the existing light theme using Angular Material's `mat.theme()` with `theme-type: dark`
- Implement system color scheme detection via `prefers-color-scheme` media query as the default behavior
- Add a manual theme toggle button in the navbar allowing users to override system preference (light / dark / system)
- Persist the user's theme preference in `localStorage`
- Update component styles that use hardcoded colors (e.g., `background-color: #f5f7fa` on `body`) to use theme-aware tokens instead

## Capabilities

### New Capabilities

- `dark-mode`: Theme switching infrastructure including dark theme definition, system detection, manual toggle, preference persistence, and theme-aware component styles

### Modified Capabilities

## Impact

- **Styles**: `src/styles.scss` — replace hardcoded light theme with dynamic light/dark theme application; remove hardcoded background color
- **Theme**: `src/theme/_theme-colors.scss` — no changes needed (palettes already define full tonal range for dark mode)
- **Navbar**: `src/app/core/navbar/` — add theme toggle button with icon
- **New service**: A theme service/manager to handle system detection, manual override, and localStorage persistence
- **Component styles**: Any component using hardcoded colors needs updating to use Material design tokens
