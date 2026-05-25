# Playwright locators & assertions reference

Step definitions live or die by their locators. This file captures the patterns that produce stable tests and the patterns that produce flaky ones.

## Locator priority

When picking a locator, work down this list. Stop at the first option that uniquely matches:

1. **`getByRole`** — matches the accessibility tree. Closest to "what the user perceives".
2. **`getByLabel`** — form fields associated with a `<label>`.
3. **`getByPlaceholder`** — inputs with placeholder text (less stable than label).
4. **`getByText`** — visible text content.
5. **`getByAltText`** — images and named regions.
6. **`getByTitle`** — `title` attribute (rare in modern UIs).
7. **`getByTestId`** — `data-testid` attribute. Use when the above don't disambiguate.
8. **`locator(cssSelector)`** — last resort. Brittle.

The first four describe what a user perceives; the last describes what the DOM happens to look like today. Internal class names change; ARIA roles don't.

## Examples — good

```ts
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByLabel("Email").fill("a@b.com");
await page.getByRole("option", { name: "High" }).click();
await page
  .getByRole("dialog", { name: "Create Task" })
  .getByRole("button", { name: "Create" })
  .click();
await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
```

## Examples — bad

```ts
// Brittle: depends on CSS framework, class order, DOM nesting
await page.locator(".mat-mdc-button.primary > span.label").click();

// Brittle: XPath chains snap on any structural change
await page.locator("//div[2]/div[1]/button[3]").click();

// Brittle: matches any "Create" anywhere on the page
await page.getByText("Create").click();
// Better: scope it
await page.getByRole("button", { name: "Create", exact: true }).click();
```

## `exact: true` matters

Without `exact: true`, role/text matchers do a case-insensitive substring match. `getByRole('button', { name: 'Create' })` also matches "Create task", "Create user", and "Recreate". When the page can have any of those, pass `exact: true` or narrow with `.filter(...)`.

## Filtering and chaining

`.filter(...)` narrows a locator without committing to a fragile descendant selector:

```ts
// Find the Todo column, then the task card inside it with a specific title
const todoColumn = page.locator(".column").filter({ hasText: "To Do" });
const taskCard = todoColumn
  .locator(".task-card")
  .filter({ hasText: "Ship v1" });
await expect(taskCard).toBeVisible();
```

`hasText` is regex-aware; `has` accepts another locator to require a descendant match.

```ts
// "Find the row that contains both an Active badge and the user 'Alice'"
const row = page
  .getByRole("row")
  .filter({
    has: page.getByText("Active"),
  })
  .filter({ hasText: "Alice" });
```

## Web-first assertions

Always use `await expect(locator).<matcher>()` — auto-retries until the condition is met or the timeout expires.

```ts
// Good — retries
await expect(page.getByRole("alert")).toHaveText("Saved");
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
await expect(page.getByTestId("cart-count")).toHaveText("3");

// Bad — snapshot at one moment, flaky
expect(await page.getByRole("alert").textContent()).toBe("Saved");
expect(await page.getByTestId("cart-count").innerText()).toBe("3");
```

### Useful matchers

| Matcher                            | Checks                                   |
| ---------------------------------- | ---------------------------------------- |
| `toBeVisible()` / `toBeHidden()`   | Element is in the DOM and (in)visible.   |
| `toBeEnabled()` / `toBeDisabled()` | Form-control state.                      |
| `toBeChecked()`                    | Checkboxes / radios.                     |
| `toHaveText(value)`                | Text equals (string) or matches (regex). |
| `toContainText(value)`             | Text contains a substring.               |
| `toHaveValue(value)`               | Input value.                             |
| `toHaveCount(n)`                   | A locator matches exactly N elements.    |
| `toHaveAttribute(name, value)`     | Attribute equality.                      |
| `toHaveURL(url)`                   | Page URL.                                |
| `toHaveTitle(value)`               | `<title>` content.                       |

### Negative assertions

`toHaveCount(0)` is the idiomatic way to assert absence:

```ts
await expect(page.locator(".error-banner")).toHaveCount(0);
await expect(page.getByRole("alert")).not.toBeVisible(); // also fine
```

## Framework-specific gotchas

### Angular Material / Material 3

- **`mat-select` opens a portal-rendered overlay.** The selected option isn't inside the trigger element. Open it, then click the option in the overlay scope:
  ```ts
  await page.getByLabel("Priority").click();
  await page.getByRole("option", { name: "High" }).click();
  ```
- **`mat-dialog-container` portals to body.** Scope assertions to the dialog so background content doesn't match:
  ```ts
  const dialog = page.locator("mat-dialog-container");
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  ```
- **`mat-datepicker` input** rejects `fill()` because of input masking. Use `pressSequentially` plus a `Tab` to commit:
  ```ts
  await page.getByLabel("Due Date").click();
  await page.getByLabel("Due Date").pressSequentially("03/15/2026");
  await page.getByLabel("Due Date").press("Tab");
  ```
- **`mat-checkbox`** sometimes presents as a button to ARIA. Try `getByRole('checkbox', { name })`; fall back to `.locator('mat-checkbox').filter({ hasText })`.

### React + MUI / Headless UI

- Listbox options also portal — same rule as `mat-select`.
- Toasts (Snackbar) auto-dismiss. Assert against them with a tight retry window, or pause the timer.

### Drag and drop

Synthetic drag events don't reach modern frameworks. Use either:

- `dragTo()` for native HTML5 DnD:
  ```ts
  await page.locator("#source").dragTo(page.locator("#target"));
  ```
- Manual `mouse.down() / mouse.move() / mouse.up()` with intermediate moves, for CDK/HTML5 hybrid implementations.

### iframes

Wrap the locator with `frameLocator`:

```ts
const frame = page.frameLocator('iframe[name="stripe"]');
await frame.getByLabel("Card number").fill("4242 4242 4242 4242");
```

## Timeouts and waits

- Default timeout for actions and assertions is 5s (assertions) / 30s (test).
- Never `page.waitForTimeout(N)`. Replace with an assertion that proves the thing you were waiting for.
- For network-dependent steps, prefer `page.waitForResponse` or mocked routes over polling the UI.

```ts
// Bad
await page.click("button.submit");
await page.waitForTimeout(2000);
await expect(page.locator(".success")).toBeVisible();

// Good — toBeVisible already retries up to the timeout
await page.getByRole("button", { name: "Submit" }).click();
await expect(page.getByRole("alert")).toContainText("Saved");
```

## Debugging locators

- `npx playwright test --ui` opens the time-travel UI; click a step to see the matched locator.
- `await page.pause()` inside a step opens the Inspector mid-run.
- `await page.locator(...).highlight()` flashes the element in headed mode.
- `npx playwright codegen <url>` generates suggested locators by recording clicks.
