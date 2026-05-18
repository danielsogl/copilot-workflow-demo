// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Task board stacks columns vertically on mobile", async ({ page }) => {
    // 1. Navigate to /board on mobile viewport
    await page.goto("http://localhost:4200/board");

    const board = page.locator(".board");
    await expect(board).toBeVisible();

    const gridColumns = await board.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns,
    );
    expect(gridColumns).not.toMatch(/repeat\(3/);
    expect(gridColumns).not.toMatch(/280px/);

    await expect(
      page.getByRole("heading", { name: "To Do", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "In Progress", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Done", level: 2 }),
    ).toBeVisible();

    const scrollWidth = await page
      .locator("html")
      .evaluate((el) => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // 2. Scroll down the page
    await page.keyboard.press("End");
    await expect(page.locator('[aria-label="Create new task"]')).toBeVisible();

    // 3. Inspect the dashboard stats row at the top of /board
    await page.keyboard.press("Home");
    await expect(
      page.locator("article").filter({ hasText: "Total" }),
    ).toBeVisible();
    await expect(
      page.locator("article").filter({ hasText: "To Do" }),
    ).toBeVisible();
    await expect(
      page.locator("article").filter({ hasText: "In Progress" }),
    ).toBeVisible();
    await expect(
      page.locator("article").filter({ hasText: "Done" }),
    ).toBeVisible();
    await expect(
      page.locator("article").filter({ hasText: "Overdue" }),
    ).toBeVisible();
    await expect(
      page.locator("article").filter({ hasText: "Complete" }),
    ).toBeVisible();
  });
});
