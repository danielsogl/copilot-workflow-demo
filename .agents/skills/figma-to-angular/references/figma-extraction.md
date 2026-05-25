# Extracting structured data from Figma

The Figma MCP server (`mcp__figma__*`) is the only sanctioned source for Figma data in this skill. Screenshots and visual descriptions degrade quickly — variables get lost, auto-layout intent is invisible, and you'll end up guessing. The MCP gives you the raw structure.

## Before you start

1. **Confirm the MCP is connected.** If the only `mcp__figma__*` tools you see are `authenticate` and `complete_authentication`, the server is not connected yet — call `mcp__figma__authenticate`, share the URL with the developer, and pause. Do not proceed.
2. **Parse the URL.** Figma URLs come in several shapes:
   - `https://www.figma.com/design/<FILE_KEY>/<file-name>?node-id=<NODE_ID>&...`
   - `https://www.figma.com/file/<FILE_KEY>/<file-name>?node-id=<NODE_ID>&...`
   - `https://www.figma.com/proto/<FILE_KEY>/...`
     The `FILE_KEY` and `node-id` (when present) are what you actually need. If the URL has no `node-id`, you're being pointed at a whole file, not a single frame — ask the developer which frame is the target.

## Tool sequence (typical)

The exact tool names depend on what the connected Figma MCP exposes — common ones include reading a node, listing variables, and pulling code/structure. Run the calls roughly in this order:

1. **Get the node** — fetches the frame's structure (children, layout, fills, strokes, effects, text styles).
2. **Get variables / styles** — pulls every published color, typography, number (spacing/radius), and effect variable in the file.
3. **Get component / instance info** — for each instance in the frame, resolve which master it points to. Instances are reuse candidates.
4. **Get image fills / exports** — if there are raster images or vector exports, note their `imageRef`s so you can ask the developer to provide assets.

Cache the raw JSON you pull to `/tmp/figma-<short-id>.json` so you can re-read during implementation without re-fetching (Figma rate limits and the data is large).

## What to look for in the response

### Layout (the most useful field)

Auto-layout frames have `layoutMode` (`HORIZONTAL`/`VERTICAL`), `itemSpacing` (gap), `paddingLeft/Right/Top/Bottom`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutSizingHorizontal`/`Vertical` (`FIXED`/`FILL`/`HUG`).

Translation cheatsheet:

| Figma                                  | SCSS / Angular                           |
| -------------------------------------- | ---------------------------------------- |
| `layoutMode: HORIZONTAL`               | `display: flex; flex-direction: row;`    |
| `layoutMode: VERTICAL`                 | `display: flex; flex-direction: column;` |
| `itemSpacing: 16`                      | `gap: 16px;` (then move to a token)      |
| `layoutSizingHorizontal: FILL`         | `flex: 1 1 auto;` or `width: 100%`       |
| `layoutSizingHorizontal: HUG`          | (no width — content drives)              |
| `primaryAxisAlignItems: CENTER`        | `justify-content: center;`               |
| `counterAxisAlignItems: CENTER`        | `align-items: center;`                   |
| `primaryAxisAlignItems: SPACE_BETWEEN` | `justify-content: space-between;`        |

A frame with no `layoutMode` is **not** auto-layout — children are absolutely positioned. That's almost always a design mistake; flag it.

### Colors

Look for fill/stroke entries that point to a **variable** vs. a raw hex. Variables look like `boundVariables: { color: { id: 'VariableID:...' } }`. Hex-only fills are token gaps — see [token-management.md](token-management.md).

### Typography

Text nodes have `style: { fontFamily, fontWeight, fontSize, lineHeightPx, letterSpacing }` and may reference a published text style. Map published text styles to `--mat-sys-display-*`, `--mat-sys-headline-*`, `--mat-sys-title-*`, `--mat-sys-body-*`, `--mat-sys-label-*`. Unpublished text styles are typography gaps.

### Effects (shadows, blurs)

Effects with `type: DROP_SHADOW` map to `box-shadow`. Material v3 ships with elevation tokens `--mat-sys-level0` through `--mat-sys-level5`; prefer those over raw shadows when the elevation roughly matches.

### Component instances

If `type: INSTANCE`, the node points to a master component. Two instances of the same master → likely two render sites of one Angular component. Detached instances (`overrides` that change semantics, not just text content) are smell — ask whether they're intentional.

## What not to extract

- Pixel-perfect positions of every leaf node. Auto-layout intent matters; absolute coords almost never do.
- Hidden layers (`visible: false`). Skip them unless the developer specifically asks.
- Prototype interactions / links. Those describe navigation flow; capture them as notes for the user story, not for layout.

## Summarize before coding

After extraction, write a short summary back to the developer:

```
Frame: Posts / Feed (mobile, 390×844)
Components found: PostCard (×5), HeaderBar, FAB
Tokens used: 11 color vars, 4 text styles
Token gaps: 2 unbound colors, 1 raw shadow, spacing 14px is not in the variable set
Open questions:
  1. ...
  2. ...
```

This summary is what the developer reviews before you start writing code. It's also what makes the difference between "the skill worked" and "the skill produced something that needs to be redone."
