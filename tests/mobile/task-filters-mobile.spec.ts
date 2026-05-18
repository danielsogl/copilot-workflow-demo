// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Filters bar is usable on mobile", async ({ page }) => {
    // 1. Navigate to /board on mobile viewport
    await page.goto("http://localhost:4200/board");

    const searchInput = page.getByRole("textbox", { name: "Search tasks..." });
    await expect(searchInput).toBeVisible();

    const highChip = page.locator("mat-chip.priority-chip--high");
    const mediumChip = page.locator("mat-chip.priority-chip--medium");
    const lowChip = page.locator("mat-chip.priority-chip--low");
    await expect(highChip).toBeVisible();
    await expect(mediumChip).toBeVisible();
    await expect(lowChip).toBeVisible();

    const filtersScrollWidth = await page
      .locator(".filters")
      .evaluate((el) => el.scrollWidth);
    const filtersClientWidth = await page
      .locator(".filters")
      .evaluate((el) => el.clientWidth);
    expect(filtersScrollWidth).toBeLessThanOrEqual(filtersClientWidth + 1);

    // 2. Type 'bug' into the search input
    await searchInput.fill("bug");

    await expect(
      page.getByRole("heading", { name: "Fix critical bug", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Client presentation", level: 3 }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Update website content", level: 3 }),
    ).not.toBeVisible();

    // 3. Clear the search and tap the 'high' priority chip
    await page.getByRole("button", { name: "Clear search" }).click();
    await highChip.click();

    await expect(
      page.getByRole("heading", { name: "Client presentation", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fix critical bug", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Complete project proposal",
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Prepare budget report", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Update website content", level: 3 }),
    ).not.toBeVisible();

    // 4. Tap the 'high' chip again to deselect
    await highChip.click();

    await expect(
      page.getByRole("heading", { name: "Update website content", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Schedule team meeting", level: 3 }),
    ).toBeVisible();

    await expect(highChip).not.toHaveAttribute("aria-selected", "true");
  });
});
