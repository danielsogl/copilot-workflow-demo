## Context

The application uses Angular Material v3 with a single light theme defined in `src/styles.scss` via `mat.theme()` with `theme-type: light`. Color palettes are defined in `src/theme/_theme-colors.scss` and already contain the full tonal range (0–100) needed for dark mode. Several component SCSS files contain hardcoded hex colors (`#e53935`, `#757575`, `#1e88e5`, `#43a047`, `#fde8e8`, `#f5f7fa`) that won't adapt to dark mode. The navbar currently has no theme toggle control.

## Goals / Non-Goals

**Goals:**

- Support light and dark themes using Angular Material's built-in `theme-type` mechanism
- Detect system color scheme preference via `prefers-color-scheme` media query and apply it automatically on initial load
- Provide a manual toggle (light / dark / system) in the navbar for user override
- Persist user preference in `localStorage` so it survives page reloads
- Replace all hardcoded hex colors in component styles with Material design tokens (`--mat-sys-*` CSS custom properties)

**Non-Goals:**

- Custom user-defined color palettes or palette editor
- Per-component theme overrides or multiple branded themes
- Server-side preference storage or user account sync
- High-contrast / accessibility-specific themes (can be added later)

## Decisions

### 1. Theme application via CSS class + `mat.theme()` dark override

Apply the light theme at the `html` selector (current behavior). Apply the dark theme scoped under a `.dark-theme` class on `<html>`. Angular Material's `mat.theme()` with `theme-type: dark` generates all needed dark CSS custom properties.

**Rationale**: This is the standard Angular Material v3 approach. Scoping via CSS class is simpler than runtime style injection and works with `prefers-color-scheme` via a `@media` block for the system-default case.

**Alternative considered**: Using two separate `mat.theme()` calls with `@media (prefers-color-scheme: dark)` only — rejected because it doesn't support manual override without JavaScript class toggling anyway.

### 2. Theme service as an injectable singleton

Create a `ThemeManager` service in `src/app/core/theme/` that:

- Reads `localStorage` for saved preference on init (`'light' | 'dark' | 'system'`)
- Defaults to `'system'` when no preference is stored
- Listens to `window.matchMedia('(prefers-color-scheme: dark)')` for system changes
- Exposes a `themeMode` signal (`'light' | 'dark' | 'system'`) and a `resolvedTheme` computed signal (`'light' | 'dark'`)
- Toggles the `.dark-theme` class on `document.documentElement`

**Rationale**: A signal-based service integrates naturally with Angular's reactivity model. Placing it in `core/` follows the project's DDD architecture for cross-cutting concerns.

**Alternative considered**: Storing theme state in NgRx Signals Store — rejected as overkill for a simple UI preference that doesn't involve API calls or complex state transitions.

### 3. Three-way toggle (system / light / dark) with system as default

The navbar toggle will cycle through: system → light → dark → system. An icon button with `mat-icon` will visually indicate the current mode (`brightness_auto` for system, `light_mode` for light, `dark_mode` for dark).

**Rationale**: Three-way toggle is the modern standard (macOS, Android, VS Code all use it). System-default respects user OS preference without forcing a choice.

### 4. Replace hardcoded colors with Material design tokens

All hardcoded hex colors in component SCSS files will be replaced with `--mat-sys-*` CSS custom properties or Material palette references. This ensures colors automatically adapt when the theme switches.

**Rationale**: Material's theme system already provides semantic color tokens that respond to light/dark mode. Using them eliminates manual dark-mode overrides per component.

## Risks / Trade-offs

- [FOUC on initial load] → Mitigate by reading `localStorage` synchronously in the service constructor and applying the class before first render. The service is injected at the app root level.
- [System preference change while app is open] → Mitigate by using `matchMedia.addEventListener('change', ...)` to react in real-time.
- [Hardcoded colors in third-party components] → Low risk since Angular Material components use design tokens internally. Only custom styles need updating.
- [Testing complexity for media query] → Mitigate by abstracting `matchMedia` access so it can be mocked in tests.
