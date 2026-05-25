# The five risks — and how to address each

Every Figma-to-Angular run hits at least one of these. Walk through this list before writing code; do not skip even if you "know" the file is clean.

## 1. Not all Figma projects use tokens

**Symptom:** Fills are raw hex; text uses local font weights/sizes, not published text styles; spacings vary (`14px`, `15px`, `17px` — non-systematic).

**Why it's bad:** Without tokens, every value is a one-off. You'll either (a) reproduce the chaos in SCSS (rapidly unmaintainable) or (b) silently bend values to fit existing tokens (the design no longer matches Figma). Neither is acceptable.

**How to address:**

1. Run an upfront token census in your audit: "Of the N color values used in this frame, M are bound to variables and N–M are raw hex."
2. Tell the developer the percentage. Above 80% bound → fine, just close the small gaps. Below 50% → flag it as a design-side issue and propose a remediation path before coding (see [token-management.md](token-management.md), section "When the Figma file has no tokens at all").
3. **Never** silently substitute the nearest Material token for a raw hex. That hides the mismatch from the designer.

## 2. Token gaps (spacings etc.)

**Symptom:** Most values use tokens, but a few don't — typically spacing values (`6px`, `14px`, `22px`) that don't fit the project's 4/8/12/16/24 scale, or a custom corner radius.

**Why it's bad:** If you don't formalize them, the next session will re-add the same token under a different name. The codebase ends up with `--app-space-mid`, `--app-space-md-2`, `--app-space-mid-md`, all `14px`.

**How to address:** Use the gap-closure ritual from [token-management.md](token-management.md). Every gap → one named token → one `// gap-closed:` comment in `styles.scss` → reuse from there.

## 3. Screens / components are not consistent

**Symptom:** Two cards on the same screen have slightly different paddings. A button label is `Action` on one screen and `Take action` on a sibling. An icon size shifts between instances of the "same" component.

**Why it's bad:** You will reproduce the inconsistency in code unless you ask. The result: visual diffs against Figma look "right" per screen, but the codebase is full of overrides that fight each other.

**How to address:**

1. In the audit, identify each inconsistency by name: "PostCard padding varies between 12 and 14 across instances on this frame."
2. Ask the developer which version is canonical.
3. Build only the canonical version. Note rejected variants in the gap report.

## 4. Component hierarchy not correct

**Symptom:** A "Card" in Figma is actually a frame with a fill and a corner radius — not an instance of any component. A button is a text node with a stroke around it, not a Button instance. Multiple "the same" things are not connected by component relationships.

**Why it's bad:** The Figma file says nothing about reuse intent. If you treat each occurrence as separate, you'll end up generating five inline blobs of HTML instead of one Angular component used five times.

**How to address:**

1. In the audit, list every node that looks-like-a-component-but-isn't: "PostCard appears 5× but is not a Figma component."
2. Treat it as a `ui/` component anyway if you're confident it should be reused. **But tell the developer.** They may want to fix it in Figma first.
3. The reverse also happens: a Figma component is used once on this screen but is part of a design system. Check the master's name (`@design-system/Card` vs. `Posts/InlineCard`) — system-scoped components map to `ui/`; one-off frames stay inline.

## 5. Screens are not the single source of truth

**Symptom:** The developer says "but the API returns these other fields too", or "we have a server-driven label here", or "this should also handle the empty state, which isn't in Figma." The design captures the happy path; reality has more shapes.

**Why it's bad:** Implementing only what's in Figma produces an incomplete feature. Implementing extra "obvious" things — empty state, error state, loading state, long-text overflow — without designer input produces a different feature than the team agreed on.

**How to address:** Before scaffolding, ask explicitly:

1. **Empty state** — what shows when the list is empty?
2. **Loading state** — skeleton, spinner, nothing?
3. **Error state** — toast, inline banner, full-page error?
4. **Long-text overflow** — clamp, ellipsis, expand-on-tap?
5. **Permissions / variants** — does an admin see something a regular user doesn't?
6. **Server-driven content** — are any labels/copy localized or admin-editable?

For each one the developer can't answer in the moment, write a TODO comment with the question and proceed with the most conservative behavior (e.g., "show nothing if empty"). Don't leave the question silent.

## The audit template

Before you write any code, output something shaped like this:

```
## Audit — <Frame Name>

Frame size: 390 × 844 (mobile)
Variants present: mobile only / mobile+desktop / etc.

### Tokens
- Colors: 11/13 bound to variables, 2 raw hex (#3F8 used as accent, #FA4 used in chip)
- Typography: all bound to published text styles
- Spacing: scale appears 4/8/12/16/24; 1 outlier at 6px
- Effects: 2 shadows match elevation tokens, 1 custom (`0 2px 14px -4px rgba(0,0,0,.12)`)

### Components
- PostCard (appears 5×, is a Figma component, master `Components/PostCard`)
- Header (1×, is a Figma component)
- FAB (1×, NOT a Figma component — just a frame; treat as `<mat-fab>`)

### Inconsistencies
- None.

### Open questions
1. Empty state for the feed — what should render when no posts?
2. Long titles — clamp at 2 lines or expand on tap?
3. Tablet/desktop variants — not in Figma. Stretch + center, or different layout?
4. The custom shadow — close the gap with `--app-shadow-card-soft` and proceed, OK?
```

Send that audit. Wait for answers. Then code.
