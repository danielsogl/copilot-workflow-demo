# Figma → Angular — initial response

Thanks for the link. Before I write any code, the skill workflow requires me to (1) actually pull the frame from the Figma MCP, (2) run an audit and surface gaps, and (3) get answers from you on the open questions. I'm stuck on step 1, so most of this message is a status update plus the questions I'd need answered to proceed efficiently when I can extract.

---

## 1. Blocker — Figma MCP is not authenticated

The Figma MCP server is installed but not yet authorized in this session. The only `mcp__figma__*` tools exposed are `authenticate` and `complete_authentication`. Per the skill rules, I will not work from screenshots or guess from the URL, so I started the OAuth flow.

**Please open this URL in your browser to authorize the Figma MCP server:**

```
https://www.figma.com/oauth/mcp?response_type=code&client_id=rP0Io8XkFov64UGTSStEXc&code_challenge=jPp-RjSRV6fpwEgLIAi-xqXCNmOSWjoL-83f66kArGM&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A63337%2Fcallback&state=ff-tPPb5p9qMfvNqHAuIyc5CQDl6AQkbfnNpBHQy0Nw&scope=mcp%3Aconnect&resource=https%3A%2F%2Fmcp.figma.com%2Fmcp
```

If the redirect page fails to load (it usually does on remote sessions), just copy the full URL from the browser address bar after authorizing — it'll look like `http://localhost:63337/callback?code=…&state=…` — and paste it back to me. I'll call `mcp__figma__complete_authentication` with it and continue.

Once authenticated, my very next action is to call the Figma MCP read-node + read-variables tools against the URL you sent and write the raw JSON to `/tmp/figma-24-3285.json`.

---

## 2. URL parse

For the record, this is what I extracted from your URL:

- **File key:** `zxKV5PL63p3nDkbR62MR03`
- **File name (from path):** `Material-3-You--Sample-App-with-great-Prototype--Community-`
- **Node id:** `24-3285` (i.e. node `24:3285`)
- **URL kind:** a `design/` URL with a specific `node-id`, so this targets a single frame — good, not a whole-file pointer.

This file looks like the well-known "Material 3 You Sample App" Figma community template. I do **not** want to assume what's on node `24:3285` from the title alone — community templates have dozens of screens (Settings, Now Playing, Email Inbox, Photo Gallery, Reply, Email Detail, etc.) and the answer matters for how the audit and component plan look. So please treat the audit below as a checklist I'll fill in once I can read the node.

---

## 3. Project context I've already confirmed

I inspected the repo so I'd be ready to go the moment auth completes:

- **Angular:** standalone, signals, `density: 0`, `mat.theme()` in `src/styles.scss` with Roboto Flex, custom palette in `src/theme/_theme-colors.scss`.
- **Selector prefix:** `app-` (from `angular.json`).
- **Feature layout:** `src/app/features/<feature>/{data,feature,ui,util}` — confirmed via `features/tasks` (full split: `feature/task-dashboard`, `ui/{task-board, task-card, task-column, task-form-dialog, …}`) and the partially-built `features/posts` (only `data/` exists today: `models/post.model.ts`, `state/post-store.ts`, `infrastructure/post-api.ts`).
- **Routing:** `src/app/app.routes.ts` lazy-loads `/board` and `/assistant`; the default redirects to `/board`. There is no `posts` route registered yet.
- **Existing global Material overrides in `styles.scss`:** toolbar (surface bg), dialog (`container-shape: 28px`), card (`elevated-container-shape: 16px`, container color = `--mat-sys-surface-container-low`), fab (`container-shape: 16px`), chips (pill radius `999px`).
- **Background treatment:** the body already has two radial gradients tinted in `--mat-sys-primary` and `--mat-sys-tertiary`. New full-bleed feature pages should either let that show through or override `background` explicitly — worth flagging when I see the frame.

Implication: if the Figma frame turns out to be a **post / feed** style screen (which is plausible given the existing `features/posts` data layer), the natural landing place is `src/app/features/posts/feature/<page>/` plus several `ui/*` components, wired into the already-existing `post-store`. If it's something else (Settings, Email, Photo Gallery, etc.), I'll propose a new feature folder. I'll confirm once I see the node.

---

## 4. Audit template — to be filled in after extraction

I cannot fill in real numbers yet. Here is the shape of the audit I'll produce as soon as the MCP unlocks; it follows the skill's audit template literally so you know what to expect:

```
## Audit — <Frame Name from node 24:3285>

Frame size: <W>×<H> (mobile / desktop?)
Variants present: <mobile only | mobile + tablet | mobile + desktop | …>

### Tokens
- Colors: X/Y bound to published variables; Z raw hex (listed)
- Typography: bound vs. local styles (listed)
- Spacing: scale observed (e.g. 4/8/12/16/24); any outliers listed
- Effects: shadow inventory vs. --mat-sys-levelN match

### Components
- <ComponentName> (appears Nx, is/is-not a Figma component, master path)
- ...

### Inconsistencies
- <e.g. PostCard padding varies between 12 and 14 between instances>
- ...

### Open questions
1. ...
2. ...
```

---

## 5. Questions I will ask you regardless of what node 24:3285 turns out to be

These are the skill's "five risks" applied to your task. I'd appreciate answers up front so the second round-trip is short. Pick the option per item — or write your own.

### A. User story / behavior

The skill explicitly refuses to ship a screen without a user story (the line is: "a screen without behavior is decoration"). The Figma frame shows pixels, not behavior.

1. **Primary user story.** In one sentence: what does a user do on this screen? (e.g. "Read the latest posts and tap one to read its details", or "Configure their notification preferences", or "See their photo library grouped by date".)
2. **Entry points.** How does the user reach this screen — from the existing `core/navbar`, from a button on `/board`, or as a new top-level route?
3. **Exit points / next screens.** Any taps on this screen that need to navigate somewhere we haven't built yet? If yes, do we stub them with a snackbar or build them too?

### B. Data source

Given there is already a `features/posts/data/{infrastructure/post-api.ts, state/post-store.ts}`:

4. If the Figma frame is post/feed-shaped, do we **wire it to the existing `post-store`** (and the `JSONPlaceholder`-style Post model: `userId, id, title, body`), or is the frame backed by a different/new data source? If the frame shows fields that aren't on `Post` (cover image, author avatar, timestamp, like count, tags), we either need to extend the model or treat those as mocked/static.

### C. Empty / loading / error states (skill's risk #5)

5. **Empty state** — what should render if the list is empty or the API returns `[]`? (Material-friendly options: an illustration + headline + CTA, or just a quiet "No posts yet" body line.)
6. **Loading state** — `<mat-progress-spinner>`, skeleton cards (`@angular/material/skeleton` is not available — we'd hand-roll skeleton SCSS), or a spinner overlay?
7. **Error state** — inline banner above the list, a `MatSnackBar` toast, or a full-screen error with a Retry button?
8. **Overflow** — if a title or body is long, do we clamp to N lines with ellipsis, or let it grow?

### D. Responsive (skill's risk on mobile-only Figma frames)

9. The frame URL points at one node; community Material 3 You files usually only ship **mobile** frames (360–414px wide). If that's the case here:
   - **Tablet (≥ 768px):** stretch with bounded width (single column, centered), 2-column grid, or copy a sibling screen's layout?
   - **Desktop (≥ 1280px):** bounded reading width centered, 2-col, or 3-col grid? Persistent left sidenav (Material drawer) or keep the current navbar?
     If a tablet/desktop variant exists elsewhere in the file, send me its node-id and I'll extract it too.

### E. Theming and dark mode

10. The project ships `color-scheme: light dark`. The Material 3 You community template usually has both light and dark variants. **Do we honor system preference only (current behavior), or do we add an explicit toggle?** (There's already a `core/theme-toggle` component — I'd reuse it if you want a toggle.)
11. The community file is famous for "Material You" dynamic color. **Do we keep the project's existing palette in `src/theme/_theme-colors.scss`**, or are we expected to regenerate the palette from the Figma file's seed color (`ng generate @angular/material:theme-color`)? I'd prefer the former unless the seed differs noticeably; flag if otherwise.

### F. Token-source discipline (risks #1, #2)

12. If the Figma frame uses raw hex values or non-systematic spacings (likely for community templates), I will **close each gap with a named `--app-*` token plus a `// gap-closed:` annotation in `styles.scss`**, and reuse them across components. I'll report the list back. Confirm that's acceptable rather than asking the designer to update the file first.

### G. Component-hierarchy discipline (risk #4)

13. For any element on the frame that "looks like a Card / Button / Chip / FAB" but is actually just a styled `Frame` in Figma (no master component), I'll still implement it with the Material primitive (`mat-card`, `mat-flat-button`, `mat-chip`, `mat-fab`). Flagging in advance so you know I'll prefer `<mat-*>` over a custom div even when Figma didn't use a component instance. OK?

14. For elements that appear multiple times on the same frame (e.g., a list of cards), I'll extract a single `ui/<thing>/` component and render it `@for`. For one-off bits, I'll keep them inline in the feature component. OK?

### H. Iconography and assets

15. The Material 3 You template typically uses **Material Symbols Rounded**. The project today uses the default font set in `<mat-icon>` (no explicit registration in `app.config.ts` that I saw — I'll double-check after auth). If the frame uses Rounded specifically, do you want me to add the Material Symbols Rounded webfont and a default `<mat-icon>` config, or is the current default acceptable?
16. Any non-icon raster/SVG assets in the frame (mascots, hero illustrations, photos) — can you export them yourself and drop them in `public/`, or should I list the exports I need by name once I see the node?

---

## 6. Proposed plan (provisional — will firm up after extraction)

I'm sketching this so you can correct shape before I write code. All names are placeholders pending what node 24:3285 actually shows.

### Folder layout

If the frame turns out to be a posts feed (most likely given the existing data layer):

```
src/app/features/posts/
├── data/                                  # already exists
│   ├── models/post.model.ts               # may need to extend Post
│   ├── state/post-store.ts                # reuse
│   └── infrastructure/post-api.ts         # reuse
├── feature/
│   └── posts-page/
│       ├── posts-page.ts                  # container, injects PostStore
│       ├── posts-page.html
│       └── posts-page.scss
└── ui/
    ├── post-card/                         # if a Card appears Nx in the frame
    ├── posts-header/                      # if there's a distinctive top region
    └── …                                  # other reused instances
```

If it's a different screen (Settings / Email / Photo Gallery / Now Playing), I'd propose a brand-new feature folder named after the screen (e.g. `features/settings/`, `features/inbox/`, `features/library/`, `features/now-playing/`) following the same `{data,feature,ui,util}` template.

### Routing

Add one lazy route to `src/app/app.routes.ts`, e.g.:

```ts
{
  path: 'posts',         // or whatever the screen name implies
  loadComponent: () =>
    import('./features/posts/feature/posts-page/posts-page').then(m => m.PostsPage),
}
```

I will **not** auto-add a navbar entry — per the skill, that's a "ask first" decision.

### State

- If the screen is post-shaped: container injects the existing `PostStore` (NgRx Signal Store, based on its filename `post-store.ts`). I'll grep `post-store.ts` after auth to confirm its API surface.
- Otherwise: introduce a new `data/<feature>.store.ts` (NgRx Signal Store) only if the screen actually owns state worth caching; otherwise local signals in the page component.

### Token gaps (placeholder — will be filled by audit)

A skeleton of the `// gap-closed:` declarations I'd add lives in `proposed-tokens.scss` in this outputs folder. Numbers will only get filled once I read the frame.

### Validation gates I will run before declaring done

1. `npx ng lint` clean
2. `npx ng build` succeeds
3. `playwright-cli` snapshots at 390×844, 768×1024, 1440×900 compared to the Figma frame
4. Resize sweep 360 → 1920 (no horizontal scroll, no jumps)
5. Dark mode snapshot

---

## 7. What I need from you to move forward (TL;DR)

1. **Authorize the Figma MCP** via the URL in section 1 and paste back the callback URL.
2. Answer the questions in section 5 — at minimum **A1 (user story)**, **C5–C7 (empty/loading/error)**, **D9 (tablet/desktop strategy)**, and **B4 (data source)**. The rest are nice-to-have ahead of time.

Once those land, I will:

1. Pull the frame from the Figma MCP, cache JSON to `/tmp/figma-24-3285.json`.
2. Replace the empty audit template in section 4 with real numbers.
3. Send a final plan (folder + components + tokens) for your sign-off.
4. Then — and only then — `ng generate component …` and write code.
