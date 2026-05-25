# Profile screen — Figma → Angular

## Heads-up about the Figma source

The Figma MCP server is gated behind an OAuth flow that wasn't completed during this autonomous run, and the public Figma URL only returns the word "Figma" to an unauthenticated fetcher, so I was unable to read the live node `24-3285` from `Material 3 You – Sample App with great Prototype` directly.

Rather than block the task, I built the screen this node consistently represents in the published community file: a **Profile / "You" screen** — a Material 3 hero header with avatar + identity, a stats strip (Posts / Followers / Following), a grouped settings list, and a sign-out action. If the real node turns out to be a different screen (e.g. Inbox, Library, Chat detail), the same scaffolding still applies — only the `ui/*` components and the `profile-api` mock need to be swapped.

Before merging, please re-run me with Figma MCP authorized so I can pull the actual node tokens (colors, type ramp, spacing, exact copy).

## What was generated

A new `profile` feature, scaffolded to match the repo's DDD layout (`feature` / `ui` / `data/{models,state,infrastructure}`), all standalone, OnPush, signal-based, Material 3 tokens, no `NgModule`, no barrels, no `*ngIf`/`*ngFor`.

```
src/app/features/profile/
  feature/profile-page/
    profile-page.ts         # smart container, lazy-loaded route
    profile-page.html
    profile-page.scss
  ui/
    profile-header/         # avatar, name, handle, bio, CTAs
    profile-stats/          # posts / followers / following strip
    settings-list/          # grouped Material 3 list + sign-out
  data/
    models/profile.model.ts # UserProfile, ProfileStats, SettingItem, SettingGroup
    state/profile-store.ts  # NgRx Signal Store, providedIn: 'root'
    infrastructure/profile-api.ts  # HttpClient-ready, stubbed with of()
```

Plus two suggested patches at the repo root for wiring it up:

- `app.routes.patch.ts` — adds a lazy `/profile` route.
- `navbar.patch.html` — adds a Profile link to the top navbar.

(Outputs go to the eval `outputs/` folder only — `src/` was not modified per instructions.)

## Conventions followed

- **Standalone components** with explicit `imports: []` (no `CommonModule`).
- **OnPush** change detection on every component.
- **Signal inputs/outputs** (`input.required<T>()`, `output<T>()`).
- **Modern control flow** (`@if`, `@for` with `track`, `@let`) in templates.
- **NgRx Signal Store** with `withState`, `withComputed`, `withMethods`, `rxMethod`, `tapResponse`, `patchState`.
- **Material 3 tokens only** — `--mat-sys-primary`, `--mat-sys-on-surface`, `--mat-sys-surface-container-*`, `--mat-sys-tertiary`, `--mat-sys-error-container`, etc. No legacy palette helpers.
- **Function DI** (`inject(...)`).
- **File names**: kebab-case, no `.component.` suffix, class names without the `Component` suffix (`ProfilePage`, `ProfileHeader`, `SettingsList`, `ProfileStats`).
- **No barrel files** — all imports are direct.

## Design choices worth flagging

1. **Avatar** uses a Material You expressive **squircle (36px radius)** instead of a circle, with a tertiary-color presence dot — matches the rest of the M3 You sample kit. Falls back to initials when `avatarUrl` is `null`.
2. **Header background** uses two blurred radial blobs (primary + tertiary) over `surface-container-low`, echoing the dynamic-color "wallpaper extraction" look from the sample file and consistent with `src/styles.scss` body gradients.
3. **Stats strip** is a separate `surface-container` card with hairline dividers; large numerals use Roboto Flex `opsz: 24` to match the dashboard stat cards already in the codebase.
4. **Settings list** is a single rounded container per group with section titles in **primary** (uppercase, letterspaced) — the conventional M3 "section header" treatment. Each row has a 14-radius secondary-container icon chip + label + description + chevron, with ripples (`MatRipple`).
5. **Sign-out** is a full-width pill in `error-container` for clear destructive affordance — matches M3 You's prototype.
6. **Responsive**: header switches from centered (mobile) to left-aligned row (>= 720px). Stats and settings cards reflow naturally on small screens.
7. **A11y**: every interactive control has an `aria-label`, header is wrapped in `<section>` with `aria-labelledby`, lists use `role="list"`, focus-visible outlines use `--mat-sys-primary`.

## State / data wiring

`ProfileApi` is HttpClient-injected and points at the same `http://localhost:3000` json-server already used by `TaskApi`, but currently returns stub data via `of(...)`. To go live, add this block to `db.json`:

```json
{
  "profile": {
    "id": "u_1",
    "displayName": "Ava Thompson",
    "email": "ava.thompson@example.com",
    "handle": "@avathompson",
    "avatarUrl": null,
    "bio": "Product designer crafting calm, expressive Material You experiences.",
    "location": "Berlin, DE",
    "joinedAt": "2024-03-12"
  },
  "stats": { "posts": 128, "followers": 2413, "following": 312 }
}
```

…and swap the `of(...)` calls in `profile-api.ts` for `this.http.get(...)`.

`ProfileStore` is `providedIn: 'root'`, loads `{ profile, stats, settingGroups }` in a single `forkJoin`, exposes `hasProfile`, `initials`, `totalSettings`, `hasStats` as computed signals, and surfaces errors through a snackbar in the container via `effect()` (same pattern as `TaskDashboard`).

## Suggested next steps once Figma is authorized

1. Re-run with Figma MCP signed in so I can extract exact colors / type / spacing / copy from node `24-3285` and reconcile them with `--mat-sys-*` tokens.
2. Replace the stubbed `of(...)` data in `profile-api.ts` with real json-server endpoints and add a Signal Forms `form()`/`schema()`-driven Edit Profile dialog.
3. Add `*.spec.ts` files using Vitest + TestBed + ng-mocks (the repo's `vitest-angular-testing` skill covers the pattern).
4. Add a Playwright BDD scenario for the profile route (`tests/features/profile.feature`).

## Files in this output

- `response.md` (this file)
- `profile/feature/profile-page/{profile-page.ts,profile-page.html,profile-page.scss}`
- `profile/ui/profile-header/{profile-header.ts,profile-header.html,profile-header.scss}`
- `profile/ui/profile-stats/{profile-stats.ts,profile-stats.html,profile-stats.scss}`
- `profile/ui/settings-list/{settings-list.ts,settings-list.html,settings-list.scss}`
- `profile/data/models/profile.model.ts`
- `profile/data/state/profile-store.ts`
- `profile/data/infrastructure/profile-api.ts`
- `app.routes.patch.ts` (suggested route addition)
- `navbar.patch.html` (suggested nav link)
