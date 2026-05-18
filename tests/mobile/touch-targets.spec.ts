// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Touch interactions and tap targets", async ({ page }) => {
    // 1. On mobile viewport at /board, measure bounding boxes of interactive controls
    await page.goto("http://localhost:4200/board");

    const fab = page.locator('[aria-label="Create new task"]');
    const fabBox = await fab.boundingBox();
    expect(fabBox?.width).toBeGreaterThanOrEqual(40);
    expect(fabBox?.height).toBeGreaterThanOrEqual(40);

    const boardLink = page.getByRole("link", { name: "Board" });
    const boardLinkBox = await boardLink.boundingBox();
    expect(boardLinkBox?.width).toBeGreaterThanOrEqual(40);
    expect(boardLinkBox?.height).toBeGreaterThanOrEqual(40);

    const menuBtn = page.locator("mat-card").first().locator("button.menu-btn");
    const menuBtnBox = await menuBtn.boundingBox();
    expect(menuBtnBox?.width).toBeGreaterThanOrEqual(36);
    expect(menuBtnBox?.height).toBeGreaterThanOrEqual(36);

    // 2. Perform a tap on the 'Create new task' button using touch emulation
    await fab.tap();

    const dialog = page.getByRole("dialog", { name: "Create Task" });
    await expect(dialog).toBeVisible();

    // 3. Close the dialog and tap a task card body area (not the menu button)
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();

    const taskTitle = page.getByRole("heading", {
      name: "Fix critical bug",
      level: 3,
    });
    await taskTitle.tap();

    await expect(
      page.locator('.cdk-overlay-container [role="menu"]'),
    ).not.toBeVisible();
  });
});
