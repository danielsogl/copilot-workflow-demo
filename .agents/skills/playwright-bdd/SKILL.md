---
name: playwright-bdd
description: Author Gherkin .feature files and generate Playwright step definitions for the playwright-bdd runner. Use this whenever the user wants to write BDD scenarios, create or extend .feature files, implement steps for an existing feature, translate a user story into Given/When/Then, or build E2E tests with Cucumber-style syntax on Playwright. Trigger even if the user just says "write a BDD test", "add a scenario", "create a feature for X", "generate steps for this feature", or pastes Gherkin and asks for the test code. Also trigger when the user mentions playwright-bdd, bddgen, scenario outlines, step definitions, or asks to refactor existing Playwright tests into BDD format.
metadata:
  type: workflow
---

# Playwright BDD

Author Gherkin feature files and generate matching step definitions for [playwright-bdd](https://vitalets.github.io/playwright-bdd/), which compiles `.feature` files into Playwright tests via the `bddgen` CLI.

The workflow has two phases that can run independently or together:

1. **Write the feature** — produce a `.feature` file in business language, reusing existing step phrasing.
2. **Generate the steps** — implement step definitions in TypeScript using Playwright's latest locator and assertion APIs.

Most user requests target one phase. Confirm which one before diving in.

## Before you start: inspect the project

Skip none of this — feature consistency depends on it.

1. **Find the BDD root.** Read `playwright.config.ts` (or `*.config.*`) and locate the `defineBddConfig({ features, steps, importTestFrom })` call. The `features` glob tells you where new `.feature` files go; `steps` tells you where step definitions live; `importTestFrom` reveals the custom fixture file every step file should import from.
2. **List existing steps.** Run `npx bddgen export` from the project root. This prints every registered step pattern. Reuse these patterns verbatim in new scenarios — duplicate steps with slightly different phrasing are the most common BDD failure mode.
3. **Detect the step style.** Open one existing step file and identify which of three styles the project uses:
   - **Playwright-style** (most common): `Given('...', async ({ page }, arg) => { ... })` created via `createBdd(test)`.
   - **Cucumber-style**: `Given('...', async function (arg) { await this.page.goto(...) })`.
   - **Decorators**: `@Given('...')` on a class method (Page Object Model).
     Match whatever exists. Don't introduce a new style.
4. **Note the fixture import.** Step files normally import `test` and `expect` from a project-local fixtures file (e.g. `../../fixtures/api-mock.ts`), not directly from `@playwright/test`. The fixture file is what `importTestFrom` points to.

If the project has none of this yet, see `references/playwright-bdd-config.md` for a fresh setup.

## Phase 1 — Writing the feature file

A good Gherkin scenario reads like a stakeholder describing behavior, not like a script reading the DOM. The user should be able to read the file without knowing it ever became code.

### Anatomy

```gherkin
Feature: <capability under test>
  As a <persona>
  I want <goal>
  So that <business value>

  Background:
    Given <shared preconditions for every scenario>

  Scenario: <one observable behavior>
    Given <starting state>
    When <single action>
    Then <observable outcome>
    And <additional outcome>
```

### Rules of thumb

- **One scenario, one behavior.** If you find yourself writing two `When`s separated by a `Then`, split it into two scenarios. The `When` is the action under test; everything else is setup or verification.
- **Declarative, not imperative.** Write `When I submit the form` instead of `When I click the "#submit-btn" button`. CSS selectors belong in step definitions, not feature files. A reader who doesn't know HTML should still understand the scenario.
- **Reuse step phrasing.** Before inventing `When I create a task with title "Foo"`, check whether `When I create a task titled "Foo"` already exists from `bddgen export`. Same intent + different words = duplicate work for the next maintainer.
- **Background is for shared setup only.** Anything that varies between scenarios goes inside the scenario.
- **Use Scenario Outline for the same behavior across data variants** — not for unrelated cases that happen to share words.

### When to use what

| Construct                         | Use it for                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `Scenario Outline` + `Examples:`  | Same flow, different inputs (e.g. login with various invalid passwords).       |
| `Data Table` (pipes below a step) | A single step that needs a small structured payload (a list of users to seed). |
| `Doc String` (`"""` below a step) | Multi-line content like a JSON body or SQL block.                              |
| Tags (`@smoke`, `@desktop`)       | Filtering runs (`bddgen --tags`), conditional fixtures, and hook targeting.    |

For full Gherkin reference (parameter types, tag expressions, escaping), read `references/gherkin-syntax.md`.

## Phase 2 — Generating the step definitions

Once the feature exists, implement each step that `bddgen` reports as missing.

### Process

1. **Run `npx bddgen` once** to surface undefined steps. The CLI prints a list ready to paste — copy those patterns rather than retyping the Gherkin strings.
2. **Add steps to the existing file** for the feature, or create a new sibling file under the `steps` glob. Match the project's filename convention (e.g. `task-management.feature` → `task-management.ts`).
3. **Import from the project's fixture file**, not from `playwright-bdd` directly:
   ```ts
   import { createBdd } from "playwright-bdd";
   import { test, expect } from "../../fixtures/api-mock"; // path varies by project
   const { Given, When, Then } = createBdd(test);
   ```
   The custom `test` carries API mocks, seed data, page objects, and anything else `importTestFrom` injects. Skip it and the test loses its fixtures.
4. **Pick the right Playwright locator.** Default order: `getByRole` → `getByLabel` → `getByText` → `getByTestId` → `locator(cssSelector)`. The first four describe what the user sees; the last describes what the DOM happens to look like today.
5. **Use web-first assertions.** Always `await expect(locator).toBeVisible()` etc. Never `expect(await locator.isVisible()).toBe(true)` — the former retries automatically, the latter snapshots a single moment and produces flaky tests.
6. **Re-run `npx bddgen && npx playwright test --project=bdd`** to verify the scenario passes.

### Parameter capture

Cucumber expressions in step patterns map to typed function arguments:

| Pattern    | Function arg type    | Example value |
| ---------- | -------------------- | ------------- |
| `{string}` | `string`             | `"High"`      |
| `{int}`    | `number`             | `5`           |
| `{float}`  | `number`             | `2.5`         |
| `{word}`   | `string` (no spaces) | `admin`       |

```ts
When(
  "I select {string} as the priority",
  async ({ page }, priority: string) => {
    await page.getByLabel("Priority").click();
    await page.getByRole("option", { name: priority }).click();
  },
);
```

Use regex patterns only when Cucumber expressions can't express the match — they're harder to read and refactor.

### Common locator pitfalls

These come up constantly when porting scenarios to Playwright:

- **`page.locator('.task-card')`** works but breaks on every CSS rename. Prefer `page.getByRole('article', { name: ... })` or `page.getByTestId('task-card')`.
- **Filtering by text inside repeated elements** uses `.filter({ hasText: ... })`, not nested `:has-text()` selectors.
- **Material/CDK overlays** (mat-select, mat-dialog) render in a portal — scope assertions to the dialog with `page.locator('mat-dialog-container').getByRole(...)`, otherwise stale background elements match first.
- **Date and dropdown inputs** often need `pressSequentially` + `Tab` rather than `fill`, because the component intercepts the input event.

For the full locator guide and assertion patterns, read `references/playwright-locators.md`. For step file structure, parameter types, and the three definition styles, read `references/step-definitions.md`. For custom fixtures, tags, and hooks, read `references/fixtures-and-hooks.md`.

## Output checklist

Before declaring the task done:

- [ ] Feature reads as plain English; no selectors leaked from steps.
- [ ] Every step in the feature has a definition (or already existed — verified via `bddgen export`).
- [ ] Step file imports `test` from the project's fixture module, not `@playwright/test`.
- [ ] Locators prefer `getByRole`/`getByLabel`/`getByText`/`getByTestId` over CSS.
- [ ] All assertions are `await expect(...)` web-first style.
- [ ] `npx bddgen && npx playwright test --project=bdd` passes (or the user has been told what command to run).

## References

- `references/gherkin-syntax.md` — Full Gherkin grammar: Background, Scenario Outline, Data Tables, Doc Strings, tags, parameter types, escaping.
- `references/playwright-bdd-config.md` — `defineBddConfig`, `importTestFrom`, `bddgen` CLI, tag filtering, fresh project setup.
- `references/step-definitions.md` — Playwright-style vs Cucumber-style vs decorator steps, scoped steps with `createBdd(test, { tags })`, parameter types.
- `references/playwright-locators.md` — Locator hierarchy, web-first assertions, common anti-patterns, framework-specific gotchas (Angular Material, MUI, portals).
- `references/fixtures-and-hooks.md` — Custom fixtures, `Before`/`After`/`BeforeAll`/`AfterAll`, built-in `$tags`/`$step`/`$test` fixtures.
- `assets/examples/task-search.feature` + `task-search.steps.ts.example` — A complete feature + step pair you can crib structure from. The `.example` suffix keeps TypeScript from compiling the template; rename to `.ts` when copying into the project's `tests/bdd/steps/`.
