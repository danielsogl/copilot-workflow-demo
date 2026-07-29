# Task Board

A task management web app (Angular 22 + NgRx Signals frontend, .NET 10 backend).

## Language

**Color Mode**:
The user's chosen light/dark appearance preference for the app UI: System, Light, or Dark. Controlled via a button in the navbar.
_Avoid_: Theme, Dark Mode (as the umbrella term), Display Mode, Appearance

**Effective Color Mode**:
The actually-rendered appearance — always either Light or Dark. Equal to Color Mode when it's Light or Dark; resolved from the OS preference when Color Mode is System.
_Avoid_: Resolved Theme, Actual Mode

**Theme**:
The Angular Material 3 color palette (primary/tertiary colors) applied via the `mat.theme()` mixin and `--mat-sys-*` tokens. Distinct from Color Mode — Theme governs _which colors_, Color Mode governs _light vs. dark_.
_Avoid_: Color Mode, Palette (informally used, but "Theme" is canonical here since it matches the `mat.theme()` API)
