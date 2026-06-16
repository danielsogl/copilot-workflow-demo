# BDD with Playwright — 2026 Reference

End-to-end behavior-driven testing in Playwright. The 2026 recommended approach is **`playwright-bdd`** by Vitaly Slobodin (`vitalets/playwright-bdd`), which converts `.feature` files into Playwright test files at build time and runs them through Playwright's native runner. This preserves fixtures, tracing, parallel workers, sharding, and visual regression — all features that are lost when using `@cucumber/cucumber` as the runner.

- **Current stable:** `playwright-bdd@8.5.x` (May 2026); `9.0.0-beta` available.
- **Required:** Playwright `>= 1.44` (8.x) or `>= 1.60` (9.x beta); Node.js `>= 18` (8.x) or `>= 20` (9.x).
- **Verdict:** Still the recommended choice in 2026. `@cucumber/cucumber` + Playwright-as-library remains valid only when you must share Gherkin across languages or you have a large legacy Cucumber estate.

## 1. When to use Playwright BDD

Use Playwright BDD when:

- The scenario describes a **user journey** (login → search → checkout → logout) that crosses pages, domains, or sub-systems.
- A **non-engineer** (PM, QA lead, compliance) must read or co-author the scenario.
- You need **living documentation** that doubles as a regression gate.
- You want **the same Gherkin** to drive smoke, regression, and release-gate runs via tags.

Do NOT use Playwright BDD for:

- Unit-level logic checks of a function or component → use **Vitest BDD** instead.
- Pure API contract testing → use Pact / Vitest with a request fixture.
- Component-in-isolation rendering → use Storybook + Playwright component testing without BDD.

Rule of thumb: if `page.goto()` does not appear anywhere in the scenario, BDD-at-this-layer is the wrong layer.

## 2. Setup

For a zero-to-running install (package.json scripts, tsconfig, gitignore, CI sharding),
see **`references/install-playwright.md`**. The short version:

```bash
npm init playwright@latest         # installs Playwright + browsers
npm install -D playwright-bdd
npx playwright install --with-deps # CI-friendly
```

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps:    ['steps/**/*.ts', 'fixtures.ts'],   // include the file that exports `test`
})

export default defineConfig({
  testDir,
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
  ],
})
```

Recommended layout: `features/` for `.feature`, `pages/` for POMs,
`steps/` for step bindings, and `fixtures.ts` at the root exporting the
extended `test`. `.features-gen/` is build output and goes in `.gitignore`.

`importTestFrom` is **deprecated** as of v8 — auto-detected from `steps`.

## 3. Writing a feature file

`features/checkout/checkout.feature`:

```gherkin
@checkout @regression
Feature: Guest checkout
  As a visitor
  I want to buy a product without signing up
  So that I can complete a purchase quickly

  Background:
    Given the storefront is online
    And the catalog contains a "Bluetooth Speaker" priced at "$59.00"

  @smoke
  Scenario: Single-item happy path
    Given I open the homepage
    When  I search for "Bluetooth Speaker"
    And   I add the first result to my cart
    And   I proceed to checkout as a guest
    And   I enter shipping details for "Ada Lovelace" in "London"
    And   I pay with test card "4242 4242 4242 4242"
    Then  I see an order confirmation
    And   the order total reads "$59.00"

  @regression
  Scenario Outline: Tax is applied per region
    Given I open the homepage
    When  I add "Bluetooth Speaker" to my cart
    And   I check out shipping to "<region>"
    Then  the displayed tax rate is "<rate>"

    Examples:
      | region          | rate  |
      | California, US  | 8.5%  |
      | Berlin, DE      | 19%   |
      | Tokyo, JP       | 10%   |
```

## 4. Step definitions with Playwright fixtures

`steps/checkout.steps.ts`:

```ts
import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

Given('I open the homepage', async ({ page }) => {
  await page.goto('/');
});

When('I search for {string}', async ({ page }, query: string) => {
  await page.getByRole('searchbox').fill(query);
  await page.getByRole('searchbox').press('Enter');
});

When('I add the first result to my cart', async ({ page }) => {
  await page
    .getByTestId('product-card')
    .first()
    .getByRole('button', { name: /add to cart/i })
    .click();
});

Then('the order total reads {string}', async ({ page }, total: string) => {
  await expect(page.getByTestId('order-total')).toHaveText(total);
});
```

Step parameters are typed positionally; the **first argument is always the fixtures object**. Always import `Given/When/Then` from your own `fixtures.ts`, never from `playwright-bdd` directly — otherwise custom fixtures aren't visible.

## 5. Custom fixtures / World pattern

`fixtures.ts` is the 2026 idiomatic equivalent of Cucumber's "World" — but with Playwright's full DI graph:

```ts
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage';

type Fixtures = {
  loginPage: LoginPage;
  checkoutPage: CheckoutPage;
  testUserEmail: string;
};

export const test = base.extend<Fixtures>({
  loginPage:    async ({ page }, use) => { await use(new LoginPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  testUserEmail: async ({}, use, testInfo) => {
    await use(`user+${testInfo.workerIndex}-${Date.now()}@example.com`);
  },
});

export const { Given, When, Then, Before, After, BeforeAll, AfterAll, Step } = createBdd(test);
```

Built-in BDD fixtures available inside any step:

- `$tags` — string array of the scenario's tags (e.g. `['@smoke', '@jira-123']`).
- `$test`, `$testInfo` — the Playwright test handle and `TestInfo`.
- `$step` — current step metadata, including doc-string media type.

## 6. Page Object Model integration

`pages/LoginPage.ts`:

```ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;

  constructor(public readonly page: Page) {
    this.email    = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.submit   = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() { await this.page.goto('/login'); }

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async expectSignedIn() {
    await expect(this.page.getByTestId('user-menu')).toBeVisible();
  }
}
```

`steps/auth.steps.ts`:

```ts
import { Given, When, Then } from '../fixtures';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I sign in as {string} with password {string}',
  async ({ loginPage }, email: string, password: string) => {
    await loginPage.signIn(email, password);
});

Then('I see my account dashboard', async ({ loginPage }) => {
  await loginPage.expectSignedIn();
});
```

The POM is injected **as a fixture**, never imported and `new`'d inside a step. This keeps steps trivially mockable and lets workers share construction logic.

## 7. Tags and test filtering

Tags can sit on `Feature`, `Scenario`, or `Examples`. They flow through to Playwright as test annotations and into the `$tags` fixture.

```bash
# tag expression (preferred — supports and/or/not):
npx bddgen --tags "@smoke and not @flaky"
npx playwright test

# Playwright-native grep also works on the generated specs:
npx playwright test --grep "@regression"
```

Tag-targeted hook (only fires for `@auth`-tagged scenarios):

```ts
import { Before } from '../fixtures';

Before({ tags: '@auth' }, async ({ page }) => {
  await page.context().clearCookies();
});
```

Special tags: `@only`, `@skip`, `@fixme` map to Playwright's `test.only` / `.skip` / `.fixme` and are filtered out of `$tags`.

## 8. Background and hooks

| Hook                            | Runs                                  | Scope        | Typical use                            |
|---------------------------------|---------------------------------------|--------------|----------------------------------------|
| `BeforeAll` / `BeforeWorker`    | Once per worker, before its scenarios | Worker       | Spin up DB seed, warm caches           |
| `AfterAll`  / `AfterWorker`     | Once per worker, after its scenarios  | Worker       | Drop seeded data                       |
| `Before`    / `BeforeScenario`  | Before each scenario                  | Test         | Per-scenario reset, login              |
| `After`     / `AfterScenario`   | After each scenario                   | Test         | Attach screenshot/trace on failure     |
| Gherkin `Background:`           | Before each scenario in that feature  | Test         | Common given-steps that belong in spec |

Rule: if a non-engineer should see the setup, put it in `Background`. If they shouldn't (auth tokens, DB seeding), put it in a hook.

```ts
import { Before, After, BeforeAll, AfterAll } from '../fixtures';

BeforeAll(async ({ $workerInfo }) => {
  await seedDatabase(`worker-${$workerInfo.workerIndex}`);
});

AfterAll(async ({ $workerInfo }) => {
  await purgeDatabase(`worker-${$workerInfo.workerIndex}`);
});

Before({ tags: '@auth' }, async ({ page, testUserEmail }) => {
  await page.goto('/login');
  await loginAs(page, testUserEmail);
});

After(async ({ page, $testInfo }) => {
  if ($testInfo.status !== $testInfo.expectedStatus) {
    await $testInfo.attach('final-state', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  }
});
```

`Playwright.beforeEach` still works on the generated spec, but it can't see Gherkin tags — prefer `Before({ tags })` in BDD code.

## 9. Scenario Outline → data-driven E2E

Each row in `Examples:` becomes a separate Playwright test, so 12 rows × 3 browser projects = 36 jobs. Use Scenario Outline when:

- Rows represent **distinct business rules** (tax per region, role-based permissions).
- The expected outcomes differ — not just the inputs.

Avoid it when:

- You're really fuzz-testing one input field — that belongs in unit/integration.
- The matrix explodes CI time. Convert to a tagged subset (`@regression`-only outline rows).
- The only variation is data — use a single Scenario + parameterized fixture instead.

For reporting (HTML, blob, Allure, Cucumber-style JSON) and full CI
configurations including sharding, see `references/install-playwright.md` §9
and the [Playwright CI docs](https://playwright.dev/docs/ci). Playwright's
own HTML reporter is sufficient for engineering use — no Cucumber-specific
wiring required.

## 10. Common pitfalls

- **`expect` in `Given`/`When`**. Assertions belong in `Then`. Verifying preconditions in `Given` couples setup to validation and produces confusing failures.
- **Auth leakage between scenarios**. `storageState` set once at config level is shared by default. Use the `storageState`-override fixture pattern (see below) or call `context.clearCookies()` in a `Before` hook for `@noauth`.
- **Selectors buried inside step definitions**. Selectors live in **page objects only**. A step that calls `page.locator('div.x > span:nth-child(2)')` is unmaintainable.
- **Over-decomposing into 12 tiny steps**. A scenario should read like a user story, not an API trace. Three to seven steps is the sweet spot.
- **Stale `bddgen` output**. After editing a `.feature`, running `playwright test` alone may execute the previous spec. Always `bddgen && playwright test`.
- **Importing `Given/When/Then` from `playwright-bdd` directly**. Strips custom fixtures. Always import from your `fixtures.ts`.
- **One giant Background block**. Long backgrounds slow every scenario and hide real setup; move infra setup to `BeforeAll`.
- **Sharing mutable test data between scenarios**. Each scenario must be independent. Use worker-scoped fixtures + per-scenario IDs (e.g. `testUserEmail` above).
- **`@only` in committed code**. Add a lint rule.

Tag-driven storage-state override (the right way to handle `@noauth`):

```ts
export const test = base.extend({
  storageState: async ({ $tags, storageState }, use) => {
    if ($tags.includes('@noauth')) storageState = { cookies: [], origins: [] };
    await use(storageState);
  },
});
```

## Sources

- [vitalets/playwright-bdd (GitHub)](https://github.com/vitalets/playwright-bdd)
- [playwright-bdd documentation site](https://vitalets.github.io/playwright-bdd/)
- [playwright-bdd CHANGELOG](https://github.com/vitalets/playwright-bdd/blob/main/CHANGELOG.md)
- [playwright-bdd authentication guide](https://github.com/vitalets/playwright-bdd/blob/main/docs/guides/authentication.md)
- [Playwright reporters documentation](https://playwright.dev/docs/test-reporters)
- [BrowserStack: Playwright BDD Testing Without Cucumber](https://www.browserstack.com/guide/playwright-bdd)
