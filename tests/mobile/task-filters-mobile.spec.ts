// spec: specs/mobile-view.plan.md
// seed: tests/mobile/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("Filters bar is usable on mobile", async ({ page }) => {
    // 1. Navigate to /board on mobile viewport
    await page.goto("http://localhost:4200/board");
    await expect(
      page.getByRole("textbox", { name: "Search tasks..." }),
    ).toBeVisible();
    await expect(page.getByText("high")).toBeVisible();
    await expect(page.getByText("medium")).toBeVisible();
    await expect(page.getByText("low")).toBeVisible();

    // 2. Type 'bug' into the search input
    await page.getByRole("textbox", { name: "Search tasks..." }).fill("bug");
    await expect(
      page.getByRole("heading", { name: "Fix critical bug" }),
    ).toBeVisible();

    // 3. Clear the search and tap the 'high' priority chip
    await page.getByRole("textbox", { name: "Search tasks..." }).fill("");
    const highChip = page.locator("#mat-mdc-chip-0").getByText("high");
    await highChip.click();
    await expect(
      page.getByRole("heading", { name: "Fix critical bug" }),
    ).toBeVisible();

    // 4. Tap the 'high' chip again to deselect
    await highChip.click();
    await expect(
      page.getByRole("heading", { name: "Fix critical bug" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Update website content" }),
    ).toBeVisible();
  });
});
