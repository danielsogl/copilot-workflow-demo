import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { resetDatabase } from "../../helpers/reset-db";

const { Given, When, Then } = createBdd();

Given("the task board is loaded with seed data", async ({ page }) => {
  await resetDatabase();
  await page.goto("/");
  await expect(page.locator(".task-card").first()).toBeVisible();
});

Then(
  "I should see tasks in the {string} column",
  async ({ page }, columnName: string) => {
    const column = page.locator(".column").filter({ hasText: columnName });
    await expect(column.locator(".task-card").first()).toBeVisible();
  },
);

When("I open the create task dialog", async ({ page }) => {
  await page.locator("button.fab-add").click();
  await expect(page.getByText("Create Task", { exact: true })).toBeVisible();
});

When("I fill in the title {string}", async ({ page }, title: string) => {
  await page.getByLabel("Title").fill(title);
});

When(
  "I fill in the description {string}",
  async ({ page }, description: string) => {
    await page.getByLabel("Description").fill(description);
  },
);

When(
  "I select {string} as the priority",
  async ({ page }, priority: string) => {
    await page.getByLabel("Priority").click();
    await page.getByRole("option", { name: priority }).click();
  },
);

When("I set the due date to {string}", async ({ page }, date: string) => {
  await page.getByLabel("Due Date").click();
  await page.getByLabel("Due Date").pressSequentially(date);
  await page.getByLabel("Due Date").press("Tab");
});

When("I submit the form", async ({ page }) => {
  await page.getByRole("button", { name: "Create" }).click();
});

Then(
  "I should see {string} in the {string} column",
  async ({ page }, taskTitle: string, columnName: string) => {
    const column = page.locator(".column").filter({ hasText: columnName });
    await expect(
      column.locator(".task-title").filter({ hasText: taskTitle }),
    ).toBeVisible();
  },
);

When(
  "I filter tasks by {string} priority",
  async ({ page }, priority: string) => {
    await page
      .locator(".priority-chip")
      .filter({ hasText: priority.toLowerCase() })
      .click();
  },
);

Then("I should only see high priority tasks", async ({ page }) => {
  await expect(page.locator(".task-card").first()).toBeVisible();
  await expect(page.locator(".badge--medium")).toHaveCount(0);
  await expect(page.locator(".badge--low")).toHaveCount(0);
});

Then("I should not see low priority tasks", async ({ page }) => {
  await expect(page.locator(".badge--low")).toHaveCount(0);
});
