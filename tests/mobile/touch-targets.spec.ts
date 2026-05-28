// spec: specs/mobile-view.plan.md
// seed: tests/mobile/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("Touch interactions and tap targets", async ({ page }) => {
    // 1. On mobile viewport at /board, measure the bounding box of key interactive controls
    await page.goto("http://localhost:4200/board");
    await expect(
      page.getByRole("button", { name: "Create new task" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Board" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "AI Assistant" }),
    ).toBeVisible();

    const fabBox = await page
      .getByRole("button", { name: "Create new task" })
      .boundingBox();
    expect(fabBox?.width).toBeGreaterThanOrEqual(40);
    expect(fabBox?.height).toBeGreaterThanOrEqual(40);

    const boardLinkBox = await page
      .getByRole("link", { name: "Board" })
      .boundingBox();
    expect(boardLinkBox?.width).toBeGreaterThanOrEqual(40);
    expect(boardLinkBox?.height).toBeGreaterThanOrEqual(40);

    const moreVertBtn = page.locator("mat-card").first().getByRole("button");
    const moreVertBox = await moreVertBtn.boundingBox();
    expect(moreVertBox?.width).toBeGreaterThanOrEqual(40);
    expect(moreVertBox?.height).toBeGreaterThanOrEqual(40);

    // 2. Perform a tap on the 'Create new task' button
    await page.locator('[aria-label="Create new task"]').click();
    await expect(
      page.getByRole("dialog", { name: "Create Task" }),
    ).toBeVisible();

    // 3. Close the dialog and tap a task card body area (not the menu button)
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
