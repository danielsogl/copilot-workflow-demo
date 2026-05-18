// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Navbar collapses to icon-only on mobile", async ({ page }) => {
    // 1. Navigate to http://localhost:4200/ on a 390×844 mobile viewport
    await page.goto("http://localhost:4200/");
    await expect(page).toHaveURL(/\/board/);

    const toolbar = page.locator(".app-toolbar");
    await expect(toolbar).toBeVisible();

    const toolbarBox = await toolbar.boundingBox();
    expect(toolbarBox?.height).toBeGreaterThanOrEqual(55);
    expect(toolbarBox?.height).toBeLessThanOrEqual(70);

    const subtitle = page.locator(".subtitle");
    await expect(subtitle).toHaveCSS("display", "none");

    // 2. Inspect the primary navigation links 'Board' and 'AI Assistant'
    const boardLink = page.getByRole("link", { name: "Board" });
    const assistantLink = page.getByRole("link", { name: "AI Assistant" });
    await expect(boardLink).toBeVisible();
    await expect(assistantLink).toBeVisible();

    const boardLabelSpan = page.locator(".nav-links a span").first();
    await expect(boardLabelSpan).toHaveCSS("display", "none");

    // 3. Tap the 'AI Assistant' nav icon
    await assistantLink.click();
    await expect(page).toHaveURL(/\/assistant/);

    // 4. Tap the 'Board' nav icon
    await boardLink.click();
    await expect(page).toHaveURL(/\/board/);
  });
});
