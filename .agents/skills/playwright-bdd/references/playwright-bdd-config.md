# playwright-bdd config & CLI reference

How the runner is wired up, what the `bddgen` CLI offers, and how to set up a fresh project.

## `defineBddConfig` in playwright.config.ts

This is the bridge between Gherkin files and Playwright. `defineBddConfig` returns a generated test directory that you hand to a Playwright project as `testDir`.

```ts
import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const bddTestDir = defineBddConfig({
  features: "tests/bdd/features/**/*.feature",
  steps: "tests/bdd/steps/**/*.ts",
  importTestFrom: "tests/fixtures/api-mock.ts", // optional but very common
});

export default defineConfig({
  projects: [
    {
      name: "bdd",
      testDir: bddTestDir,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### Key options

| Option                | Purpose                                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features`            | Glob(s) where `.feature` files live.                                                                                                                                                                  |
| `steps`               | Glob(s) where step files live. Single string or array.                                                                                                                                                |
| `importTestFrom`      | Path to a file that exports a customized `test` (extended with fixtures). Every step file should `createBdd(test)` from this same module. Without it, you get the bare `test` and lose your fixtures. |
| `outputDir`           | Where generated `.spec.js` files go. Defaults to `.features-gen/`. Add this to `.gitignore`.                                                                                                          |
| `language`            | Gherkin language code (`en`, `de`, `fr`...).                                                                                                                                                          |
| `paramTypeRegistry`   | Register custom Cucumber parameter types.                                                                                                                                                             |
| `verbose`             | Log details during generation.                                                                                                                                                                        |
| `examplesTitleFormat` | Template for Scenario Outline test titles.                                                                                                                                                            |

### `importTestFrom` is the part people forget

If the project has API mocks, seed data, page objects, or any extended `test`, it lives in this file. Step files **must** import `test` from this module — not from `@playwright/test` and not from `playwright-bdd`. Importing from the wrong place produces tests that compile but skip the fixtures, so the mocks never install and the suite hits real APIs (or fails opaquely).

```ts
// fixtures/api-mock.ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ tasksApi: Task[] }>({
  tasksApi: [async ({ context }, use) => { /* set up route mocks */; await use(...); }, { auto: true }],
});

export const expect = test.expect;
```

```ts
// steps/task-management.ts
import { createBdd } from "playwright-bdd";
import { test, expect } from "../../fixtures/api-mock"; // ← from the fixtures file
const { Given, When, Then } = createBdd(test);
```

## The `bddgen` CLI

`bddgen` reads `.feature` files plus step definitions and generates `.spec.js` files that Playwright can run. You re-run it whenever features or steps change.

```bash
# generate + run
npx bddgen && npx playwright test --project=bdd

# tag filter (only generates matching scenarios)
npx bddgen --tags "@smoke and not @slow" && npx playwright test --project=bdd

# explicit config (monorepo)
npx bddgen -c apps/web/playwright.config.ts

# list every registered step pattern — invaluable before writing a new feature
npx bddgen export

# environment / version info
npx bddgen env

# help
npx bddgen -h
```

### Why `bddgen export` matters

The single most useful command for the **write a feature** workflow. It prints every step pattern the project has implemented:

```
List of all steps (12):
* Given the task board is loaded with seed data
* When I open the create task dialog
* When I fill in the title {string}
* When I select {string} as the priority
* Then I should see {string} in the {string} column
...
```

Scan this list **before** writing new Gherkin. Reusing `When I fill in the title "Foo"` instead of inventing `When I enter "Foo" into the title field` keeps the step catalogue from doubling in size with synonyms.

## Adding playwright-bdd to a fresh project

```bash
npm i -D playwright-bdd @playwright/test
npx playwright install
```

Minimal `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "tests/bdd/features/**/*.feature",
  steps: "tests/bdd/steps/**/*.ts",
});

export default defineConfig({
  testDir,
  reporter: "html",
});
```

Add a script to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "bddgen && playwright test"
  }
}
```

`.gitignore`:

```
.features-gen/
playwright-report/
test-results/
```

## Tag-based test partitioning

For larger suites, partition CI runs by tag:

```yaml
# .github/workflows/e2e.yml — sketch
- run: npx bddgen --tags "@smoke" && npx playwright test --project=bdd
- run: npx bddgen --tags "@regression and not @flaky" && npx playwright test --project=bdd
```

Tag expressions support `and`, `or`, `not`, and parentheses. See `gherkin-syntax.md` for the grammar.

## Troubleshooting

| Symptom                                                | Likely cause                                                                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| "Undefined step" warning despite a definition existing | Step file isn't in the `steps` glob, or wasn't saved before `bddgen` ran.                                                           |
| Fixtures don't run (tests hit live API)                | Step file imports `test` from `@playwright/test` or `playwright-bdd` instead of the `importTestFrom` module.                        |
| Test passes locally but fails in CI with timeout       | Add `@slow` tag or set per-step `$test.setTimeout(...)`. CI machines are slower; auto-retrying assertions help but aren't infinite. |
| Scenario Outline rows collide on title                 | Add placeholders to the scenario name: `Scenario Outline: Reject "<password>"`.                                                     |
