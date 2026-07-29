// spec: .scratch/color-mode-toggle/PRD.md

import { test, expect } from "./fixtures/api-mock";

test.describe("color-mode-toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/board");
    await expect(page.locator(".task-card").first()).toBeVisible();
  });

  test("Clicking the color mode button changes the page's visible appearance", async ({
    page,
  }) => {
    const toggle = page.locator(".color-mode-toggle");
    await expect(toggle).toBeVisible();

    // Cycle twice (System -> Light -> Dark) to land on Dark deterministically,
    // regardless of which mode the OS/browser default resolves "System" to.
    await toggle.click();
    await toggle.click();

    await expect(toggle.locator("mat-icon")).toHaveText("dark_mode");
    await expect(toggle).toHaveAttribute("aria-label", "Color mode: dark");
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.style.colorScheme),
      )
      .toBe("dark");
  });

  test("The color mode survives a page reload", async ({ page }) => {
    const toggle = page.locator(".color-mode-toggle");

    // Cycle System -> Light -> Dark, ending on an explicit, non-default mode.
    await toggle.click();
    await toggle.click();
    await expect(toggle.locator("mat-icon")).toHaveText("dark_mode");

    await page.reload();
    await expect(page.locator(".task-card").first()).toBeVisible();

    await expect(page.locator(".color-mode-toggle mat-icon")).toHaveText(
      "dark_mode",
    );
    await expect(page.locator(".color-mode-toggle")).toHaveAttribute(
      "aria-label",
      "Color mode: dark",
    );
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.style.colorScheme),
      )
      .toBe("dark");
  });
});
