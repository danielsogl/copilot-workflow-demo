// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test("Breakpoint boundary behavior", async ({ page }) => {
    // 1. Set viewport to 640×900 (exactly at the navbar/app breakpoint) and load /board
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto("http://localhost:4200/board");

    await expect(page.locator(".subtitle")).toHaveCSS("display", "none");
    await expect(page.locator(".nav-links a .nav-label").first()).toHaveCSS(
      "display",
      "none",
    );

    const toolbarBox640 = await page.locator(".app-toolbar").boundingBox();
    expect(toolbarBox640?.height).toBeLessThanOrEqual(70);

    // 2. Set viewport to 641×900 and reload /board
    await page.setViewportSize({ width: 641, height: 900 });
    await page.goto("http://localhost:4200/board");

    await expect(page.locator(".subtitle")).toBeVisible();
    await expect(page.locator(".subtitle")).not.toHaveCSS("display", "none");
    await expect(page.locator(".nav-links a .nav-label").first()).not.toHaveCSS(
      "display",
      "none",
    );

    // 3. Set viewport to 1024×800 and reload /board
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("http://localhost:4200/board");

    const boardGrid1024 = page.locator(".board");
    await expect(boardGrid1024).toBeVisible();
    const cols1024 = await boardGrid1024.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns,
    );
    expect(cols1024).not.toMatch(/280px/);

    // 4. Set viewport to 1025×800 and reload /board
    await page.setViewportSize({ width: 1025, height: 800 });
    await page.goto("http://localhost:4200/board");

    const boardGrid1025 = page.locator(".board");
    await expect(boardGrid1025).toBeVisible();
    const cols1025 = await boardGrid1025.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns,
    );
    const colWidths = cols1025
      .split(" ")
      .filter(Boolean)
      .map((c) => parseFloat(c));
    expect(colWidths).toHaveLength(3);
    for (const width of colWidths) {
      expect(width).toBeGreaterThanOrEqual(280);
    }
  });
});
