// spec: specs/mobile-view.plan.md
// seed: tests/mobile/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("Create task dialog adapts to mobile width", async ({ page }) => {
    await page.goto("http://localhost:4200/board");
    const totalStat = page
      .locator("article")
      .filter({ hasText: "Total" })
      .locator("generic")
      .first();
    const todoStat = page
      .locator("article")
      .filter({ hasText: "To Do" })
      .locator("generic")
      .first();
    const totalBefore = await totalStat.textContent();
    const todoBefore = await todoStat.textContent();

    // 1. Navigate to /board on mobile viewport and tap the floating 'Create new task' button
    await page.locator('[aria-label="Create new task"]').click();
    await expect(
      page.getByRole("dialog", { name: "Create Task" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Description" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Priority" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Due Date" })).toBeVisible();

    // 2. Fill in 'Mobile smoke test task' as title and 'Created from mobile viewport' as description
    await page
      .getByRole("textbox", { name: "Title" })
      .fill("Mobile smoke test task");
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Created from mobile viewport");
    await page.getByRole("textbox", { name: "Due Date" }).fill("2026-12-31");

    // 3. Tap the Save / Create action
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mobile smoke test task" }),
    ).toBeVisible();
    const totalAfter = await totalStat.textContent();
    const todoAfter = await todoStat.textContent();
    expect(Number(totalAfter)).toBe(Number(totalBefore) + 1);
    expect(Number(todoAfter)).toBe(Number(todoBefore) + 1);

    // 4. Tap the floating 'Create new task' button again, then tap the close/cancel control
    await page.locator('[aria-label="Create new task"]').click();
    await expect(
      page.getByRole("dialog", { name: "Create Task" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
