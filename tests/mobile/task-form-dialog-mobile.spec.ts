// spec: specs/mobile-view.plan.md

import { test, expect } from "../fixtures/api-mock";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Create task dialog adapts to mobile width", async ({ page }) => {
    // 1. Navigate to /board on mobile viewport and tap the floating 'Create new task' button
    await page.goto("http://localhost:4200/board");
    await page.locator('[aria-label="Create new task"]').click();

    const dialog = page.getByRole("dialog", { name: "Create Task" });
    await expect(dialog).toBeVisible();

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.width).toBeLessThanOrEqual(390);

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
    await page.getByRole("textbox", { name: "Due Date" }).fill("06/15/2026");

    const createBtn = dialog.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await expect(createBtn).toBeVisible();

    // 3. Tap the Save / Create action
    await createBtn.click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mobile smoke test task", level: 3 }),
    ).toBeVisible();

    // 4. Tap the floating 'Create new task' button again, then tap the close/cancel control
    await page.locator('[aria-label="Create new task"]').click();
    const dialog2 = page.getByRole("dialog", { name: "Create Task" });
    await expect(dialog2).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog2).not.toBeVisible();
    await expect(page.locator(".cdk-overlay-backdrop")).not.toBeVisible();
  });
});
