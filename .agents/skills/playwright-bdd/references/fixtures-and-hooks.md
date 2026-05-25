# Fixtures, hooks & test lifecycle reference

How to share setup across scenarios, manage authentication state, and stub APIs without leaking state between tests.

## Custom fixtures

Fixtures are Playwright's mechanism for reusable test setup. In a playwright-bdd project, they're the right place for: API mocks, seed data, page objects, authenticated sessions, and anything that takes multiple lines to wire up.

Define the extended `test` in one file and point `importTestFrom` at it (see `playwright-bdd-config.md`).

### Test-scoped vs worker-scoped

| Scope                                 | When it runs             | Use for                                               |
| ------------------------------------- | ------------------------ | ----------------------------------------------------- |
| Test-scoped (default)                 | Once per scenario        | API mocks, fresh seed data, per-scenario page objects |
| Worker-scoped (`{ scope: 'worker' }`) | Once per parallel worker | DB connections, auth tokens, expensive global state   |

### Test-scoped example: API mock with `auto: true`

```ts
import { test as base } from "playwright-bdd";
import { type Route } from "@playwright/test";

interface Task {
  id: string;
  title: string;
  status: "todo" | "done";
}

export const SEED_TASKS: Task[] = [
  { id: "1", title: "Ship v1", status: "todo" },
];

export const test = base.extend<{ tasksApi: Task[] }>({
  tasksApi: [
    async ({ context }, use) => {
      const tasks = new Map(SEED_TASKS.map((t) => [t.id, structuredClone(t)]));

      await context.route("http://localhost:3000/tasks**", async (route) => {
        const method = route.request().method();
        if (method === "GET") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(Array.from(tasks.values())),
          });
        }
        // ... POST, PATCH, DELETE handling
        await route.continue();
      });

      await use(Array.from(tasks.values()));
    },
    { auto: true }, // installs the route handler for every scenario, even ones that don't ask for tasksApi
  ],
});

export const expect = test.expect;
```

`{ auto: true }` is what makes route mocks work without every step file remembering to opt in. Use it when the fixture installs a side effect you want everywhere.

### Worker-scoped example: authenticated session

```ts
export const test = base.extend<{}, { authToken: string }>({
  authToken: [
    async ({}, use) => {
      const token = await loginViaApi(
        process.env.E2E_USER!,
        process.env.E2E_PASS!,
      );
      await use(token);
    },
    { scope: "worker" },
  ],
});
```

For UI-authenticated sessions, prefer `storageState` (Playwright's built-in serialization) over per-scenario UI login. Set it up once in a global setup script, then point each test at the file:

```ts
export default defineConfig({
  use: { storageState: "playwright/.auth/user.json" },
  // ...
});
```

### Page Object fixture

```ts
class TaskBoardPage {
  constructor(public page: Page) {}

  async open() {
    await this.page.goto("/");
  }

  async createTask(title: string) {
    await this.page.getByRole("button", { name: "Add task" }).click();
    await this.page.getByLabel("Title").fill(title);
    await this.page
      .getByRole("button", { name: "Create", exact: true })
      .click();
  }
}

export const test = base.extend<{ taskBoard: TaskBoardPage }>({
  taskBoard: async ({ page }, use) => use(new TaskBoardPage(page)),
});
```

Steps then read like prose:

```ts
Given("I am on the task board", async ({ taskBoard }) => {
  await taskBoard.open();
});
When("I create a task titled {string}", async ({ taskBoard }, title) => {
  await taskBoard.createTask(title);
});
```

## Hooks

`playwright-bdd` mirrors Cucumber's hook vocabulary but maps onto Playwright's lifecycle.

### `Before` / `After` (per scenario)

```ts
import { Before, After } from "playwright-bdd";

Before(async ({ page }) => {
  await page.context().clearCookies();
});

After(async ({ page }, $testInfo) => {
  if ($testInfo.status !== $testInfo.expectedStatus) {
    await page.screenshot({ path: `screenshots/${$testInfo.title}.png` });
  }
});
```

### `BeforeAll` / `AfterAll` (per worker)

Runs once per parallel worker, before any scenarios it handles. Use worker-scoped fixtures inside.

```ts
import { BeforeAll, AfterAll } from "playwright-bdd";

BeforeAll(async ({ $workerInfo }) => {
  console.log(`Worker ${$workerInfo.workerIndex} starting up`);
});

AfterAll(async () => {
  // tear down expensive global state
});
```

### Tagged hooks

Target a hook to specific scenarios with a tag expression:

```ts
Before({ tags: "@auth" }, async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  // ...
});

Before({ tags: "@admin and not @readonly" }, async ({ adminApi }) => {
  await adminApi.grant("write");
});
```

For `BeforeAll`/`AfterAll`, only **feature-level tags** are meaningful — worker hooks can't fire selectively per scenario, only per file.

### Hook ordering

When multiple hooks match a scenario, they fire in registration order. Don't rely on file-import order — keep hooks in one file per concern (`hooks/auth.ts`, `hooks/seed.ts`).

## Built-in step fixtures

Available inside step functions without declaring them on the custom `test`:

| Fixture     | What it is                                                                              |
| ----------- | --------------------------------------------------------------------------------------- |
| `$test`     | The Playwright `test` object — for `test.skip()`, `test.setTimeout(ms)`, `test.fail()`. |
| `$testInfo` | Standard Playwright `TestInfo` — for `attach`, `outputPath`, `status`.                  |
| `$tags`     | `string[]` of tags on the current scenario.                                             |
| `$step`     | Current step descriptor (`title`, keyword).                                             |

### Conditional skip / timeout via tags

```ts
Given("the test starts", async ({ browserName, $test, $tags }) => {
  if ($tags.includes("@chromium-only") && browserName !== "chromium")
    $test.skip();
  if ($tags.includes("@slow")) $test.setTimeout(60_000);
});
```

### Dynamic fixture values from tags

```ts
export const test = base.extend({
  locale: async ({ $tags, locale }, use) => {
    if ($tags.includes("@locale-de")) locale = "de-DE";
    if ($tags.includes("@locale-fi")) locale = "fi-FI";
    await use(locale);
  },
});
```

Now scenarios tagged `@locale-de` get a German browser without any imperative setup in steps.

## Fixture anti-patterns

- **Module-level mutable state.** If you `let cache: Map<...>;` at the top of a step file and mutate it across steps, you leak between scenarios because the runner imports the file once per worker, not per scenario. Store per-scenario state on a fixture.
- **Conditional fixtures done in `Before`.** If you're tempted to write `Before(() => { if (tag) ... })`, prefer an `{ auto: true }` fixture that reads `$tags` — it composes cleanly with the rest of the fixture graph.
- **Login-via-UI in `Before`.** Slow and flaky. Use `storageState` once, share the cookie jar across all tests.
- **Mocking inside individual steps.** If a route mock is reused, lift it to a fixture so future scenarios get it free.
