# End-to-end checklist

Print mentally (or in chat) before starting work. Tick each item as you go.

## Pre-flight

- [ ] Figma URL received
- [ ] User story or behavior described (if missing, ask)
- [ ] Figma MCP authenticated (otherwise call `mcp__figma__authenticate` and wait)
- [ ] Identified file key and node-id from the URL
- [ ] Confirmed which frame is the target (only relevant if URL points at a whole file)

## Extract

- [ ] Pulled frame structure via Figma MCP
- [ ] Pulled variables / published styles
- [ ] Resolved component instances to their masters
- [ ] Cached raw extract to `/tmp/figma-<id>.json`

## Audit (write this in chat for the developer to review)

- [ ] Token census (bound vs. raw counts)
- [ ] Inconsistencies listed
- [ ] Component-hierarchy issues listed
- [ ] Empty/loading/error/overflow states clarified
- [ ] Tablet & desktop variants clarified (or marked "infer from mobile")
- [ ] **Sent open-questions list. Waiting for answers.**

## Plan (write this in chat too)

- [ ] Feature folder name
- [ ] Page component name and route
- [ ] UI components to create (one per reused Figma component)
- [ ] Data models / services / signal stores needed
- [ ] Token gaps to close in `styles.scss`, named

## Implement

- [ ] Closed token gaps in `styles.scss` with `// gap-closed:` comments
- [ ] Generated components via `ng generate component features/<feature>/...`
- [ ] Mobile SCSS written first
- [ ] Tablet media query added (if Figma or developer indicates a change)
- [ ] Desktop media query added (same)
- [ ] Material components used over custom HTML where appropriate
- [ ] Standalone, OnPush, signal I/O, `inject()`, `@if/@for`
- [ ] Route registered in `app.routes.ts` (if a new route)

## Validate

- [ ] `npx ng lint` — clean
- [ ] `npx ng build` — succeeds
- [ ] Visual check at 390 × 844 — matches Figma mobile
- [ ] Visual check at 768 × 1024 — matches Figma tablet (or documented adaptation)
- [ ] Visual check at 1440 × 900 — matches Figma desktop (or documented adaptation)
- [ ] Resize sweep — no layout breaks
- [ ] Dark mode — reviewed
- [ ] User-story behavior — exercised end-to-end

## Report

When done, summarize back to the developer:

- What was built (feature folder, components, route)
- What tokens were closed (with the gap-closed names and why)
- What was skipped / left as TODO and why
- Screenshots at each breakpoint
- Known diffs vs. Figma (if any) with reasons
