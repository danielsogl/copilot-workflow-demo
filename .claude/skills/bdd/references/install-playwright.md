# Installing BDD for Playwright — 2026 Setup Guide

Zero-to-running setup for **`playwright-bdd@8.x`** on **`@playwright/test ≥ 1.44`** (verified on 1.60.x). Follow these steps in order — empty directory to compiled-and-generated specs in three to four minutes (most of that is `npx playwright install` pulling browser binaries).

Once installed, see `references/playwright.md` for the actual writing-tests guide; this file is purely the install workflow.

## 1. Prerequisites

| Tool        | Version    |
|-------------|------------|
| Node.js     | ≥ 18 LTS (Node 20 recommended; **Node 20+ required for playwright-bdd v9 beta**) |
| Package mgr | npm 10+, pnpm 9+, or yarn 4+ |
| TypeScript  | ≥ 5.4 |
| Disk        | ~700 MB free for browser binaries (chromium + firefox + webkit) |

Check what you have:

```bash
node --version && npm --version
```

## 2. Install — Playwright first, then BDD layer

```bash
# 2a. Bootstrap Playwright (adds @playwright/test + browsers + sample config)
npm init playwright@latest

# 2b. Add the BDD layer
npm install -D playwright-bdd

# 2c. Make sure browsers are installed (the init step usually does this; CI needs it explicitly)
npx playwright install --with-deps
```

For pnpm / yarn:

```bash
pnpm create playwright    # then: pnpm add -D playwright-bdd
yarn create playwright    # then: yarn add -D playwright-bdd
```

Skip step 2a if Playwright is already installed in this project — just run 2b + 2c.

## 3. `package.json` scripts

```json
{
  "name": "your-project",
  "private": true,
  "scripts": {
    "bdd:gen": "bddgen",
    "test": "bddgen && playwright test",
    "test:headed": "bddgen && playwright test --headed",
    "test:ui": "bddgen && playwright test --ui",
    "typecheck": "tsc --noEmit",
    "report": "playwright show-report"
  }
}
```

The canonical pair is **`bddgen && playwright test`**. `bddgen` compiles `.feature` files into Playwright `.spec.js` files under `.features-gen/`, then Playwright's runner executes them. Skipping `bddgen` runs whatever was generated *last time* — silent, hard-to-debug staleness.

**Do not** set `"type": "module"` for the Playwright config — Playwright's config loader expects CJS or TS files. Conflicts here cause cryptic "Cannot find module" errors at startup.

## 4. `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

// bddgen reads .feature + steps, writes .features-gen/.../*.spec.js.
// Playwright's testDir then points at that generated directory.
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'fixtures.ts'],   // include the file exporting `test`
})

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['blob'],                                 // for CI shard merges
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox',  use: devices['Desktop Firefox'] },
    { name: 'webkit',   use: devices['Desktop Safari']  },
  ],
})
```

Critical bits:

- **`steps`** glob *must* include the file that exports your extended `test` (your `fixtures.ts`). Since v8 `importTestFrom` is deprecated — auto-detected from `steps`.
- **`testDir`** is set to the path `defineBddConfig` returns (under `.features-gen/`), NOT to `features/`.
- **`fullyParallel: true`** runs scenarios concurrently. Turn it off per project only if scenarios in one feature share mutable backend state.

## 5. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "types": ["@playwright/test", "node"]
  },
  "include": ["features", "pages", "steps", "fixtures.ts", "playwright.config.ts"],
  "exclude": ["node_modules", ".features-gen"]
}
```

Watch-outs:

- **Exclude `.features-gen`** — those are generated `.spec.js` files, not source. Including them in `tsc` slows it down and clutters error output.
- **`types: ["@playwright/test", "node"]`** so Playwright globals (`test`, `expect`, `Page`, etc.) and Node globals (`process`, `Buffer`) both resolve.

## 6. Folder layout

```
project/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── fixtures.ts                  # exports `test` (via test.extend) + Given/When/Then
├── features/
│   ├── auth/login.feature
│   └── checkout/checkout.feature
├── pages/                       # page-object models
│   ├── LoginPage.ts
│   └── CheckoutPage.ts
└── steps/                       # step definitions
    ├── auth.steps.ts
    └── checkout.steps.ts
```

- `features/` is the human-readable layer (committed to git).
- `pages/` owns Playwright locators (`getByRole`, `getByTestId`) — no selectors in step files.
- `steps/` is thin glue: import `Given/When/Then` from `../fixtures`, call page-object methods.
- `fixtures.ts` is the "World" — exports `test = base.extend<Fixtures>({...})` and the result of `createBdd(test)`.

## 7. `.gitignore`

```
node_modules
.features-gen/              # bddgen output — must be regenerated every run
test-results/
playwright-report/
blob-report/
playwright/.cache/          # only if you use Playwright auth state caching
```

**Never** commit `.features-gen/` — it's a build artifact and goes stale silently.

## 8. Hello-world verification — should take 3-4 minutes (browsers download once)

Wire up the smallest possible runnable example. Files:

`features/smoke.feature`

```gherkin
Feature: Playwright BDD install smoke check

  Scenario: The Playwright homepage loads
    Given the visitor opens "https://playwright.dev"
    Then  the page title contains "Playwright"
```

`fixtures.ts`

```ts
import { test as base, createBdd } from 'playwright-bdd'

export const test = base.extend({})   // empty extend — we'll add fixtures later

export const { Given, When, Then, Before, After } = createBdd(test)
```

`steps/smoke.steps.ts`

```ts
import { expect } from '@playwright/test'
import { Given, Then } from '../fixtures'

Given('the visitor opens {string}', async ({ page }, url: string) => {
  await page.goto(url)
})

Then('the page title contains {string}', async ({ page }, snippet: string) => {
  await expect(page).toHaveTitle(new RegExp(snippet, 'i'))
})
```

Run:

```bash
npm test
```

Expected output (abridged):

```
Running 3 tests using 3 workers
  ✓ [chromium] smoke.feature.spec.js
  ✓ [firefox]  smoke.feature.spec.js
  ✓ [webkit]   smoke.feature.spec.js
  3 passed
```

If you see this, the install is good — proceed to `references/playwright.md` for fixtures, POMs, and the real workflow.

## 9. CI — GitHub Actions with sharding

```yaml
# .github/workflows/e2e.yml
name: E2E
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx bddgen
      - run: npx playwright test --shard=${{ matrix.shard }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: blob-${{ strategy.job-index }}
          path: blob-report

  merge-reports:
    needs: e2e
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - uses: actions/download-artifact@v4
        with: { path: all-blob, pattern: blob-* }
      - run: npx playwright merge-reports --reporter=html ./all-blob
      - uses: actions/upload-artifact@v4
        with: { name: html-report, path: playwright-report }
```

Browser binaries get cached by `actions/setup-node` via the `~/.cache/ms-playwright` path; the `--with-deps` flag is what makes the install idempotent on a cold runner.

## 10. Troubleshooting — install-time errors

| Symptom                                                                            | Cause / fix                                                                                       |
|------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `Error: Cannot find module 'playwright-bdd'`                                       | Run `npm install -D playwright-bdd` in the project root (or the right workspace package).        |
| `Error: browserType.launch: Executable doesn't exist`                              | `npx playwright install --with-deps` was never run, or `~/.cache/ms-playwright` got nuked.       |
| `bddgen: command not found`                                                        | `node_modules/.bin` not on PATH. Use `npx bddgen` or run via npm script (`npm run bdd:gen`).     |
| Running `playwright test` shows 0 tests                                            | `bddgen` wasn't run first; `.features-gen/` is empty or stale. Always pair: `bddgen && playwright test`. |
| `testDir not found: .features-gen/...`                                             | Same — run `bddgen` once, or wire it into a `pretest` script.                                    |
| `importTestFrom is deprecated`                                                     | Old (pre-v8) config. Remove `importTestFrom` and add the file that exports `test` to `steps`.    |
| Step `expect(...)` errors with "expect is not a function"                          | Import `expect` from `@playwright/test`, not from `'expect'` or `'vitest'`.                      |
| Tests can't see custom fixtures (`Cannot read properties of undefined (reading 'loginPage')`) | Step file imports `Given/When/Then` from `'playwright-bdd'` directly. Import them from your own `fixtures.ts` instead. |
| Browser binaries time-out during install in CI                                     | Add `npx playwright install --with-deps chromium` (single-browser install) instead of the full set, if firefox/webkit aren't needed. |
| `Cannot find name 'process'`                                                       | `tsconfig.json` `types` missing `"node"`; install `@types/node` (auto-installed with `npm init playwright`). |

## 11. Choosing a package manager — does it matter?

No — works identically on npm/pnpm/yarn/bun. The one wrinkle: `npm init playwright@latest` is npm-specific; the pnpm/yarn equivalents are `pnpm create playwright` and `yarn create playwright` respectively (see §2).

## 12. What you do NOT need

- `@cucumber/cucumber` — `playwright-bdd` is a Playwright-native runner, not Cucumber-as-a-library. Keep `@cucumber/cucumber` only if you have a legacy estate to migrate.
- A separate Gherkin parser.
- A custom reporter for Gherkin output by default — Playwright's HTML reporter shows the scenario tree because each scenario is a real Playwright `test()` block.
- `ts-node` / Babel — Playwright has its own TS transformer.

## 13. Upgrading

- **v8 (current stable):** `importTestFrom` deprecated; auto-detected from `steps` glob. Requires `@playwright/test >= 1.44`, Node >= 18.
- **v9 (beta):** Drops `enrichReporterData` option; switch to JUnit `nameFormat: 'cucumber'`. Requires `@playwright/test >= 1.60`, Node >= 20.

Pin a known-good combination if you depend on a specific behavior — both `playwright-bdd` and `@playwright/test` move quickly.

## References

- [`playwright-bdd` repository](https://github.com/vitalets/playwright-bdd)
- [`playwright-bdd` docs site](https://vitalets.github.io/playwright-bdd/)
- [`playwright-bdd` CHANGELOG](https://github.com/vitalets/playwright-bdd/blob/main/CHANGELOG.md)
- [Playwright config reference](https://playwright.dev/docs/test-configuration)
- [Playwright CI guide](https://playwright.dev/docs/ci)
- Skill internal: `references/playwright.md` — writing scenarios, fixtures, POM patterns, tags, parallelism.
