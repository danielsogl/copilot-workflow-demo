# Step definition reference

How to write step files that match a feature file and run inside Playwright. The same Gherkin can be implemented in three styles — pick whichever the project already uses.

## Playwright-style (recommended default)

Uses Playwright fixtures directly. This is what almost every modern project uses, and the one to default to in a greenfield setup.

```ts
import { createBdd } from "playwright-bdd";
import { test, expect } from "../../fixtures/api-mock"; // your project's fixture file
const { Given, When, Then } = createBdd(test);

Given("I am on the task board", async ({ page }) => {
  await page.goto("/");
});

When("I create a task titled {string}", async ({ page }, title: string) => {
  await page.getByRole("button", { name: "Add task" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Create", exact: true }).click();
});

Then(
  "I see {string} in the {string} column",
  async ({ page }, title: string, column: string) => {
    await expect(
      page.locator(".column").filter({ hasText: column }).getByText(title),
    ).toBeVisible();
  },
);
```

Why this style: fixtures arrive as destructured arguments, the closure stays tiny, and TypeScript can type-check the fixture shape.

## Cucumber-style (legacy, occasional)

Uses `this` for state, like classic `@cucumber/cucumber`. Useful when porting an existing Cucumber suite, otherwise avoid — `this` is less discoverable than fixtures.

```ts
import { Given, When, Then } from "playwright-bdd";

Given("I am on the task board", async function () {
  await this.page.goto("/");
});
```

## Decorator-style (Page Object Model)

Bind steps to Page Object methods with decorators. Good for large suites where each feature maps cleanly to a Page Object.

```ts
import { Fixture, Given, When, Then } from "playwright-bdd/decorators";

@Fixture("taskBoardPage")
export class TaskBoardPage {
  constructor(public page: Page) {}

  @Given("I am on the task board")
  async open() {
    await this.page.goto("/");
  }

  @When("I create a task titled {string}")
  async createTask(title: string) {
    await this.page.getByRole("button", { name: "Add task" }).click();
    await this.page.getByLabel("Title").fill(title);
    await this.page.getByRole("button", { name: "Create" }).click();
  }
}
```

Requires `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig`, plus registering the class as a fixture.

## Parameter capture (Cucumber expressions)

| Pattern    | Function arg type    | Example value in Gherkin       |
| ---------- | -------------------- | ------------------------------ |
| `{string}` | `string`             | `"High"` (quotes are required) |
| `{int}`    | `number`             | `42`                           |
| `{float}`  | `number`             | `3.14`                         |
| `{word}`   | `string` (no spaces) | `admin`                        |

Parameters appear after fixtures in the function signature, in pattern order:

```ts
When(
  "I move {string} from {string} to {string}",
  async ({ page }, title: string, fromCol: string, toCol: string) => {
    // ...
  },
);
```

## Regular expression patterns

Use only when Cucumber expressions can't express the match. Capture groups become typed arguments via `parseInt`/`parseFloat` as needed:

```ts
Given(/^I wait (\d+) seconds?$/, async ({ page }, seconds: string) => {
  await page.waitForTimeout(Number(seconds) * 1000);
});
```

Regex patterns are harder to refactor and search for — prefer Cucumber expressions whenever possible.

## Data Tables

When a step has a Gherkin table beneath it, the table is the last argument:

```gherkin
Given the following tasks exist:
  | title       | priority |
  | Ship the v1 | high     |
  | Write docs  | medium   |
```

```ts
import type { DataTable } from "playwright-bdd";

Given("the following tasks exist:", async ({ tasksApi }, table: DataTable) => {
  for (const row of table.hashes()) {
    await tasksApi.create({ title: row.title, priority: row.priority });
  }
});
```

`DataTable` methods:

- `hashes()` — array of row objects keyed by the header row.
- `rows()` — array of cell arrays, header excluded.
- `raw()` — array of cell arrays, header included.
- `rowsHash()` — two-column table → object (`{ key: value }`).

## Doc Strings

A `"""`-fenced block becomes the last argument as a string:

```ts
When("I send the request:", async ({ page }, body: string) => {
  const json = JSON.parse(body);
  // ...
});
```

## Scoped steps with tags

If two features both have `When I click the PLAY button` but the implementation differs, scope each step file with a tag so the right one runs:

```ts
// game.steps.ts
const { Given, When, Then } = createBdd(test, { tags: "@game" });

When("I click the PLAY button", async ({ page }) => {
  /* game-specific */
});
```

```ts
// video.steps.ts
const { Given, When, Then } = createBdd(test, { tags: "@video" });

When("I click the PLAY button", async ({ page }) => {
  /* video-specific */
});
```

The feature file tags determine which file's definition is used.

## Built-in playwright-bdd fixtures

Available inside any step function:

| Fixture     | What it gives you                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `$test`     | The underlying Playwright `test` object. Use for `test.skip()`, `test.setTimeout(...)`, `test.fail()`. |
| `$testInfo` | Playwright's `TestInfo`. Use for `testInfo.attach(...)`, `testInfo.outputPath(...)`.                   |
| `$tags`     | `string[]` of tags on the current scenario.                                                            |
| `$step`     | Info about the current step (title, kind).                                                             |

```ts
Given("I am a flaky integration", async ({ browserName, $test, $tags }) => {
  if (browserName === "firefox") $test.skip();
  if ($tags.includes("@slow")) $test.setTimeout(60_000);
});
```

## Common shape mistakes

- **Forgetting `await`** on Playwright actions — every `.click()`, `.fill()`, and `expect(...)` is async. Missing one leads to scenarios that pass by accident.
- **Mixing styles** in one project. Pick one and stick to it; the runner supports all three but readability tanks when files alternate.
- **Stateful module-level variables** in step files. The runner reuses files across scenarios — state leaks. Put state on fixtures or in `Before` hooks.
- **Hardcoded waits** (`page.waitForTimeout(2000)`). Replace with auto-retrying `expect(...)` assertions. Timeouts are smell, not solution.

## File organization

The convention `tests/bdd/features/<name>.feature` ↔ `tests/bdd/steps/<name>.ts` keeps feature and steps colocated by topic. Cross-cutting steps (login, common navigation) belong in `tests/bdd/steps/_common.ts` or similar.

Steps are matched globally by pattern — not by file — so identical patterns across files cause runtime errors. Use scoped tags (above) to disambiguate.
