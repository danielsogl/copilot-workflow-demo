---
name: figma-to-angular
description: Transforms a Figma screen (URL) into production-ready Angular code that follows this project's standards — standalone components, signals, Angular Material v3 system tokens, mobile-first responsive layouts, and the existing src/app/features/* structure. Trigger this whenever the developer shares a Figma file/frame URL, asks to "implement this design", "build this screen", "translate Figma to Angular", "port this mock", or pastes a figma.com link alongside a user story. Also trigger when the user mentions building UI from a designer handoff, even if they don't explicitly say "Figma" but reference design tokens, screens, or visual mocks that need to become Angular components.
license: MIT
metadata:
  author: Daniel Sogl
  version: "1.0"
---

# Figma → Angular

Turn a Figma screen into Angular code that fits **this** project: Angular 21+, standalone components, signals, Angular Material v3 with `mat.theme`, mobile-first SCSS that scales to tablet and desktop, and the `feature/` vs `ui/` split under `src/app/features/`.

The skill is built around a single principle: **the Figma file is the source of truth, but it is rarely complete**. Your job is not to "draw the design" — it is to extract structure, surface gaps, ask the developer to resolve them, and only then write code. Guessing silently is the worst failure mode of this skill.

## Inputs

- **Required:** a Figma URL (file, frame, or node). The developer will paste this in chat.
- **Optional:** a user story or text description of behavior (what the screen does, not just what it looks like).

If only a screen URL arrives with no behavior context, **ask the developer for the user story** before coding. A screen without behavior is decoration.

## Required tools

- **Figma MCP** (`mcp__figma__*`) — the only supported source for Figma data. If the server is not authenticated, call `mcp__figma__authenticate`, share the URL with the developer, and wait. Do not work from screenshots; do not guess from the URL.
- **Angular CLI** via the `angular-developer` skill — for component/service scaffolding and architectural guidance.
- **Context7** (`mcp__context7__*`) — fetch fresh Angular Material v3 docs whenever an API or token detail is in doubt; defaults change between versions.
- **playwright-cli** skill — visual validation at the end.
- **ESLint + ng build** — code-correctness gates before declaring done.

## The workflow

Follow this order. Each step has a reason — the order exists to prevent the most common failure (writing code, then discovering the design was incomplete).

### 1. Fetch from Figma

Use the Figma MCP tools to pull the frame, its component tree, layout properties, text styles, and any variables/tokens published in the file. Save what you extract to `/tmp/figma-<frame-id>.json` (or similar) so you can re-read it during implementation without re-fetching.

What to extract, in priority order:

1. **Frame dimensions** — confirm the design is the mobile breakpoint (typical: 360–430px wide). If it's only a desktop frame, you have a problem; see [risks.md](references/risks.md).
2. **Variables / Local styles** — color tokens, typography styles, effect styles, spacing variables. These map to `--mat-sys-*` and the project's `theme.scss`.
3. **Layout structure** — auto-layout direction, gap, padding, alignment, sizing modes. This becomes Flex/Grid in SCSS.
4. **Component instances** — anything that's an instance of a Figma component is a candidate to be a reused Angular component (`ui/*`) rather than inline markup.
5. **Text content and roles** — headings, body, captions, links. Map to `--mat-sys-headline-*`, `--mat-sys-title-*`, `--mat-sys-body-*`.
6. **Imagery and icons** — note required SVG/raster assets. Material icons should map to `<mat-icon>`.

See [references/figma-extraction.md](references/figma-extraction.md) for the concrete MCP tool sequence.

### 2. Audit for gaps and risks

Before writing a single component, produce a short audit. This is the single most valuable step in the skill — it's where silent guessing gets caught. Walk through [references/risks.md](references/risks.md) and answer each risk explicitly:

- Does the Figma file use **published variables/tokens**, or are values hardcoded?
- Are there **token gaps** — spacings, radii, colors used in the frame but not defined as variables?
- Are component instances **consistent** with their masters (no detached overrides that change semantics)?
- Is the **component hierarchy** sensible? (e.g., is a "Card" actually a Card, or is it a Frame styled like one?)
- Are there **tablet and desktop variants** in Figma, or only mobile? If only mobile, you'll need to make responsive decisions — but ask the developer first.

**Output a numbered list of questions to the developer** for everything ambiguous. Do not proceed until they answer. The cost of one round-trip is dwarfed by the cost of building the wrong screen.

### 3. Plan the Angular structure

Before scaffolding, sketch the structure in chat so the developer can correct it cheaply:

- **Feature folder name** under `src/app/features/<feature>/`.
- **Page component** under `feature/<feature-page>/` — the routable container, holds state.
- **UI components** under `ui/<thing>/` — dumb, presentational, signal inputs/outputs.
- **Data/util** under `data/` and `util/` only if needed (services, helpers).
- **Routing** — is this a new lazy route? Where does it slot into `app.routes.ts`?
- **State** — local signals, ngrx signalStore, or none?

Read [references/component-hierarchy.md](references/component-hierarchy.md) for the rules this project follows.

### 4. Reconcile tokens

Map every Figma value to a `--mat-sys-*` token. For each value that **does not** have a matching system token (a "token gap"):

1. Add the missing token to `src/styles.scss` via `mat.theme-overrides` or to `src/theme/_theme-colors.scss`, depending on its kind (color → palette/override; corner/spacing/typography → component overrides or new CSS custom property).
2. **Annotate the gap** with a SCSS comment in the form:
   ```scss
   // gap-closed: <short-name> — source: Figma <frame name>, value <raw>. Reuse via var(--app-<name>).
   ```
3. Reuse the same token if the same gap appears again — never re-declare. The annotation is what makes this possible across sessions.

The full token strategy lives in [references/token-management.md](references/token-management.md).

### 5. Scaffold with Angular CLI

Invoke the `angular-developer` skill for the actual code generation conventions (signals, standalone, control flow, host bindings, etc.). Use `ng generate component` — do not hand-write component files when the CLI works.

Project conventions to enforce as you write code:

- **Standalone**, no NgModules.
- **Signal inputs/outputs** (`input()`, `output()`, `model()`), never `@Input()` decorators in new code.
- **Control flow** with `@if`, `@for`, `@switch` — not `*ngIf`.
- **`ChangeDetectionStrategy.OnPush`** by default.
- **`inject()`**, not constructor DI.
- **`mat.*` system tokens** in SCSS — never raw hex outside `theme.scss`.
- **BEM-ish class names** matching the existing pattern (`.task-card`, `.task-card--overdue`).

### 6. Implement mobile-first, scale up

Write the SCSS mobile-first. The base styles target the smallest breakpoint; tablet and desktop come via `@media` queries. Concrete breakpoints, layout shifts, and Material density tweaks per form factor are in:

- [references/responsive-mobile.md](references/responsive-mobile.md) — base layer
- [references/responsive-tablet.md](references/responsive-tablet.md) — `@media (min-width: 768px)`
- [references/responsive-desktop.md](references/responsive-desktop.md) — `@media (min-width: 1280px)`

If Figma only ships mobile, ask the developer how tablet/desktop should adapt — do not invent layouts.

### 7. Material v3 fidelity

When choosing components, prefer Angular Material v3 primitives (`mat-card`, `mat-button`, `mat-form-field`, `mat-chip`, `mat-dialog`, `mat-icon`, etc.) over custom HTML. Customize via `mat.<component>-overrides()` in `styles.scss`, not by overriding internal `.mdc-*` selectors.

The full Material v3 cheatsheet — palette, system tokens, component overrides, when to reach for Context7 — is in [references/angular-material-v3.md](references/angular-material-v3.md).

### 8. Validate

Don't claim the screen is "done" until all four checks pass:

1. `npx ng lint` — ESLint clean.
2. `npx ng build` — type-checks and builds.
3. **Visual check at mobile, tablet, desktop** via the `playwright-cli` skill, against the Figma frame.
4. **Behavior check** — interact with the screen and confirm the user story works.

The exact validation recipe (URLs, viewport sizes, snapshot comparison) is in [references/validation.md](references/validation.md).

## Decision rules

- **Unclear designer intent → ask.** Never guess. List your questions explicitly.
- **Missing token → close the gap, annotate it, reuse it later.** Never reintroduce a magic number.
- **Mobile only in Figma → ask** how tablet/desktop should adapt. Don't extrapolate silently.
- **Detached instance with semantic differences → ask** whether it's intentional or a Figma artifact.
- **A "card" that's actually a frame → flag it.** Don't paper over a broken hierarchy with custom HTML.

## Quick reference table

| Concern                                            | Read                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Pulling structured data from Figma                 | [references/figma-extraction.md](references/figma-extraction.md)       |
| Angular Material v3 theming & tokens               | [references/angular-material-v3.md](references/angular-material-v3.md) |
| Tokenization strategy, gap closure, naming         | [references/token-management.md](references/token-management.md)       |
| Project component hierarchy (feature/ui/data/util) | [references/component-hierarchy.md](references/component-hierarchy.md) |
| Mobile baseline                                    | [references/responsive-mobile.md](references/responsive-mobile.md)     |
| Tablet adaptations                                 | [references/responsive-tablet.md](references/responsive-tablet.md)     |
| Desktop adaptations                                | [references/responsive-desktop.md](references/responsive-desktop.md)   |
| The five risks and how to address them             | [references/risks.md](references/risks.md)                             |
| Final validation (lint, build, visual, responsive) | [references/validation.md](references/validation.md)                   |
| End-to-end checklist                               | [references/workflow-checklist.md](references/workflow-checklist.md)   |

## Why this skill is built this way

A Figma file is rarely a contract. It's a high-fidelity drawing of one snapshot of intent. Naive design-to-code tools fail because they treat the file as complete — they convert pixels to divs, hardcode the colors, miss the responsive story, and produce code that doesn't fit the rest of the codebase. This skill inverts that: it treats the Figma file as **input to a conversation**, surfaces the unknowns to the developer, lands them in the right place in the existing token system, and only then generates code that looks like it belongs.
