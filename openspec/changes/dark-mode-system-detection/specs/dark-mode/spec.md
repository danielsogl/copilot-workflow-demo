## ADDED Requirements

### Requirement: Dark theme definition

The application SHALL define a dark theme using Angular Material's `mat.theme()` with `theme-type: dark`, scoped under a `.dark-theme` CSS class on the `html` element. The dark theme SHALL use the same primary and tertiary palettes as the light theme.

#### Scenario: Dark theme is applied when class is present

- **WHEN** the `html` element has the `dark-theme` class
- **THEN** Angular Material components and custom styles SHALL render using dark theme colors

#### Scenario: Light theme is applied by default

- **WHEN** the `html` element does not have the `dark-theme` class
- **THEN** Angular Material components and custom styles SHALL render using light theme colors

### Requirement: System color scheme detection

The application SHALL detect the user's system color scheme preference using the `prefers-color-scheme` media query on initial load and apply the matching theme automatically.

#### Scenario: System prefers dark mode on initial load

- **WHEN** the user's operating system is set to dark mode
- **AND** no theme preference is stored in `localStorage`
- **THEN** the application SHALL apply the dark theme

#### Scenario: System prefers light mode on initial load

- **WHEN** the user's operating system is set to light mode
- **AND** no theme preference is stored in `localStorage`
- **THEN** the application SHALL apply the light theme

#### Scenario: System preference changes while app is running

- **WHEN** the user changes their system color scheme preference while the app is open
- **AND** the theme mode is set to `system`
- **THEN** the application SHALL switch to the matching theme in real-time without requiring a page reload

### Requirement: Manual theme toggle

The navbar SHALL display a theme toggle button that allows the user to cycle through three modes: `system`, `light`, and `dark`.

#### Scenario: Toggle from system to light

- **WHEN** the current theme mode is `system`
- **AND** the user clicks the theme toggle button
- **THEN** the theme mode SHALL change to `light` and the light theme SHALL be applied

#### Scenario: Toggle from light to dark

- **WHEN** the current theme mode is `light`
- **AND** the user clicks the theme toggle button
- **THEN** the theme mode SHALL change to `dark` and the dark theme SHALL be applied

#### Scenario: Toggle from dark to system

- **WHEN** the current theme mode is `dark`
- **AND** the user clicks the theme toggle button
- **THEN** the theme mode SHALL change to `system` and the theme matching the system preference SHALL be applied

#### Scenario: Toggle icon reflects current mode

- **WHEN** the theme mode is `system`
- **THEN** the toggle button SHALL display the `brightness_auto` icon
- **WHEN** the theme mode is `light`
- **THEN** the toggle button SHALL display the `light_mode` icon
- **WHEN** the theme mode is `dark`
- **THEN** the toggle button SHALL display the `dark_mode` icon

### Requirement: Theme preference persistence

The application SHALL persist the user's selected theme mode in `localStorage` under a defined key so that it survives page reloads and browser restarts.

#### Scenario: Preference is saved on toggle

- **WHEN** the user changes the theme mode via the toggle
- **THEN** the selected mode (`system`, `light`, or `dark`) SHALL be written to `localStorage`

#### Scenario: Preference is restored on load

- **WHEN** the application loads
- **AND** a valid theme preference exists in `localStorage`
- **THEN** the stored preference SHALL be applied instead of the default `system` mode

#### Scenario: Invalid stored preference is handled

- **WHEN** the application loads
- **AND** the `localStorage` value is invalid or corrupted
- **THEN** the application SHALL fall back to `system` mode

### Requirement: Theme-aware component styles

All component styles SHALL use Angular Material design tokens (`--mat-sys-*` CSS custom properties) instead of hardcoded hex color values, ensuring styles adapt automatically to the active theme.

#### Scenario: Body background adapts to theme

- **WHEN** the dark theme is active
- **THEN** the body background SHALL use the Material surface token instead of the hardcoded `#f5f7fa`

#### Scenario: Task card priority colors adapt to theme

- **WHEN** the dark theme is active
- **THEN** task card priority indicators SHALL use Material error/warning tokens instead of hardcoded hex colors

#### Scenario: Dashboard stats colors adapt to theme

- **WHEN** the dark theme is active
- **THEN** dashboard stat values and indicators SHALL use Material design tokens instead of hardcoded hex colors
