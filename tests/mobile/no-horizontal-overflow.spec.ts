// spec: specs/mobile-view.plan.md
// seed: tests/mobile/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("No horizontal overflow on any primary route", async ({ page }) => {
    // 1. On mobile viewport, navigate to /board and check scrollWidth vs innerWidth
    await page.goto("http://localhost:4200/board");
    const boardScrollWidth = await page
      .locator("html")
      .evaluate((el) => el.scrollWidth);
    expect(boardScrollWidth).toBeLessThanOrEqual(390);

    // 2. Navigate to /assistant and repeat the measurement
    await page.goto("http://localhost:4200/assistant");
    await expect(
      page.getByRole("heading", { name: "AI Task Assistant" }),
    ).toBeVisible();
    const assistantScrollWidth = await page
      .locator("html")
      .evaluate((el) => el.scrollWidth);
    expect(assistantScrollWidth).toBeLessThanOrEqual(390);

    // 3. Open the create-task dialog on mobile and measure the dialog's bounding box
    await page.goto("http://localhost:4200/board");
    await page.locator('[aria-label="Create new task"]').click();
    const dialog = page.getByRole("dialog", { name: "Create Task" });
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.right).toBeLessThanOrEqual(391);
    const dialogScrollWidth = await page
      .locator("html")
      .evaluate((el) => el.scrollWidth);
    expect(dialogScrollWidth).toBeLessThanOrEqual(390);
    await page.getByRole("button", { name: "Cancel" }).click();
  });
});
