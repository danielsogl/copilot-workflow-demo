---
description: Styling conventions — Angular Material 3 theming via mat.theme() and system tokens.
applyTo: "**/*.scss"
---

- **Material 3 only** — theme via the `mat.theme()` mixin and `--mat-sys-*` system tokens.
- Legacy palette/theme APIs are **forbidden**.
- Global theme lives in `src/app/theme/theme.scss`; component overrides use `--mat-sys-*` tokens.
