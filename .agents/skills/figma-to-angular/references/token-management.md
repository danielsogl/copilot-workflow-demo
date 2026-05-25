# Token management — closing Figma → SCSS gaps without losing your sanity

Every value in a Figma file should map to a system token. In practice it doesn't. This file is the rulebook for what to do about that.

## Where tokens live in this project

- `src/styles.scss` — the global theme (`mat.theme(...)`) and global component overrides (`mat.card-overrides`, `mat.button-overrides`, etc.). **This is where most "gap closures" land.**
- `src/theme/_theme-colors.scss` — the generated palette. Don't hand-edit unless you're regenerating with `ng generate @angular/material:theme-color`.
- Component `.scss` files — local layout only. **No raw hex.** No new tokens defined here.

## The four kinds of Figma value, and where each goes

| Figma value                          | Maps to                                                                                    | Where it lives                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| Color bound to a published variable  | `--mat-sys-<role>` if the role fits, else a custom CSS var                                 | `styles.scss` overrides or palette      |
| Raw hex color                        | Closed gap, named CSS custom property                                                      | `styles.scss` (`:root` or `html` block) |
| Spacing (4/8/12/16/24/32…)           | A `--app-space-*` token if the project has them, else inline `px` (but document the scale) | `styles.scss` `:root`                   |
| Border radius / corner               | Material component override (`*-container-shape`) or `--app-corner-*` token                | `styles.scss`                           |
| Typography (matches a Material role) | `--mat-sys-<level>`                                                                        | nothing to do — use it                  |
| Typography (doesn't match)           | New `--app-text-*` token with full font shorthand                                          | `styles.scss`                           |
| Shadow (matches an elevation)        | `--mat-sys-levelN`                                                                         | nothing to do — use it                  |
| Shadow (custom)                      | `--app-shadow-*` token                                                                     | `styles.scss`                           |

## The gap-closure ritual

When you discover a value the project doesn't have a token for, do this — exactly this — every time:

1. **Name it descriptively.** Not `--app-color-1`. Use `--app-warning-soft`, `--app-corner-pill`, `--app-space-2xs`. Names beat numbers because the next gap might collide.
2. **Add it once, in `styles.scss`** (or the relevant Material override block).
3. **Leave a comment in this exact form** so future runs of this skill can find and reuse it:
   ```scss
   // gap-closed: <name> — source: Figma <frame or component>, raw value <value>. Reuse via var(--app-<name>).
   ```
4. **Use it in the component SCSS.** Never paste the raw value at the call site.
5. **Search before adding.** Before declaring a new gap, grep for the value or the descriptive name. If a previous session already closed it, reuse it.

Example — closing a custom spacing gap:

```scss
// in src/styles.scss inside :root or html
html {
  // gap-closed: app-space-2xs — source: Figma Posts/Feed, raw value 6px. Reuse via var(--app-space-2xs).
  --app-space-2xs: 6px;
  // gap-closed: app-card-corner-soft — source: Figma Posts/PostCard, raw value 14px. Reuse via var(--app-card-corner-soft).
  --app-card-corner-soft: 14px;
}
```

And then in `post-card.scss`:

```scss
.post-card {
  border-radius: var(--app-card-corner-soft);
  padding: var(--app-space-2xs);
}
```

## When the Figma file has no tokens at all

This is the worst case. The frame is full of hardcoded hex and odd spacing values, and no published variables. Don't paper over it silently.

1. **Tell the developer.** Something like: "The Figma file doesn't expose published variables. I can either (a) stop and let you ask the designer for tokens, or (b) infer a small token set from the values I see and document it for you to harden later. Which?"
2. If they pick (b), proceed — but produce a **gap report** at the end listing every inferred token, so the design team can adopt or reject each one.

## When the Figma file has tokens but they don't match `--mat-sys-*`

Common situation: the designer has `color/primary/500`, `color/primary/600`, etc., but the project uses the M3 role naming (`primary`, `primary-container`, etc.).

- For each Figma variable, decide which `--mat-sys-*` token is the closest semantic match (not the closest hex match — semantics first).
- Document the mapping at the top of the audit summary.
- Ask the developer to confirm the mapping before writing code.

Do not invent new palette levels in `_theme-colors.scss` — that file is regenerated from a primary/tertiary input and your edits will be overwritten next time the theme is updated.

## Why the comment format matters

The comment format `// gap-closed: <name> — source: ...` is not decoration. It's the contract between sessions:

- A future session that reads `styles.scss` can grep `gap-closed:` to find every previously-resolved gap.
- The `source:` tells you which Figma frame justified the token, so when the design changes you can find the token to update.
- The `Reuse via` reminds the model writing the next component to look here before adding a duplicate.

If you skip the comment, the next session will re-add the same gap under a different name. The codebase will accumulate `--app-pill`, `--app-pill-radius`, `--app-radius-pill`, `--app-corner-pill` — all the same value. The comment prevents that.
