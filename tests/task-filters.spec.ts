import { test, expect } from "@playwright/test";
import { resetDatabase } from "./helpers/reset-db";

test.describe("Task Filters", () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    await page.goto("/");
    await expect(page.locator(".task-card").first()).toBeVisible();
  });

  test.describe("Search", () => {
    test("should filter tasks by title", async ({ page }) => {
      await page.getByLabel("Search tasks...").fill("critical bug");

      await expect(page.locator(".task-card")).toHaveCount(1);
      await expect(
        page.locator(".task-title").filter({ hasText: "Fix critical bug" }),
      ).toBeVisible();
    });

    test("should filter tasks by description", async ({ page }) => {
      await page.getByLabel("Search tasks...").fill("quarterly performance");

      await expect(page.locator(".task-card")).toHaveCount(1);
      await expect(
        page
          .locator(".task-title")
          .filter({ hasText: "Review team performance" }),
      ).toBeVisible();
    });

    test("should be case-insensitive", async ({ page }) => {
      await page.getByLabel("Search tasks...").fill("CLIENT PRESENTATION");

      await expect(page.locator(".task-card")).toHaveCount(1);
      await expect(
        page.locator(".task-title").filter({ hasText: "Client presentation" }),
      ).toBeVisible();
    });

    test("should show empty columns when no match", async ({ page }) => {
      await page.getByLabel("Search tasks...").fill("xyznonexistent");

      await expect(page.locator(".task-card")).toHaveCount(0);
      await expect(page.getByText("No tasks")).toHaveCount(3);
    });

    test("should clear search with clear button", async ({ page }) => {
      await page.getByLabel("Search tasks...").fill("critical");
      await expect(page.locator(".task-card")).toHaveCount(1);

      await page.getByRole("button", { name: "Clear search" }).click();

      await expect(page.locator(".task-card")).toHaveCount(8);
    });

    test("should show results across all columns", async ({ page }) => {
      // "budget" matches "Prepare budget report" (completed, title)
      // Search across columns to verify results span multiple columns
      await page.getByLabel("Search tasks...").fill("proposal");

      // "Complete project proposal" in done column
      await expect(page.locator(".task-card")).toHaveCount(1);
      const doneColumn = page.locator(".column").filter({ hasText: "Done" });
      await expect(
        doneColumn
          .locator(".task-title")
          .filter({ hasText: "Complete project proposal" }),
      ).toBeVisible();
    });
  });

  test.describe("Priority Filter", () => {
    test("should filter by high priority", async ({ page }) => {
      await page.locator(".priority-chip").filter({ hasText: "high" }).click();

      // High: Client presentation, Fix critical bug, Complete project proposal, Prepare budget report
      await expect(page.locator(".task-card")).toHaveCount(4);
    });

    test("should filter by medium priority", async ({ page }) => {
      await page
        .locator(".priority-chip")
        .filter({ hasText: "medium" })
        .click();

      // Medium: Review team performance, Schedule team meeting, Code review session
      await expect(page.locator(".task-card")).toHaveCount(3);
    });

    test("should filter by low priority", async ({ page }) => {
      await page.locator(".priority-chip").filter({ hasText: "low" }).click();

      // Low: Update website content
      await expect(page.locator(".task-card")).toHaveCount(1);
      await expect(
        page
          .locator(".task-title")
          .filter({ hasText: "Update website content" }),
      ).toBeVisible();
    });

    test("should deselect filter on second click", async ({ page }) => {
      await page.locator(".priority-chip").filter({ hasText: "high" }).click();
      await expect(page.locator(".task-card")).toHaveCount(4);

      await page.locator(".priority-chip").filter({ hasText: "high" }).click();
      await expect(page.locator(".task-card")).toHaveCount(8);
    });

    test("should switch between priority filters", async ({ page }) => {
      await page.locator(".priority-chip").filter({ hasText: "high" }).click();
      await expect(page.locator(".task-card")).toHaveCount(4);

      await page.locator(".priority-chip").filter({ hasText: "low" }).click();
      await expect(page.locator(".task-card")).toHaveCount(1);
    });
  });

  test.describe("Combined Filters", () => {
    test("should combine search and priority filter", async ({ page }) => {
      await page.locator(".priority-chip").filter({ hasText: "high" }).click();
      await page.getByLabel("Search tasks...").fill("proposal");

      // Only "Complete project proposal" matches both: high priority + "proposal" in title
      await expect(page.locator(".task-card")).toHaveCount(1);
      await expect(
        page
          .locator(".task-title")
          .filter({ hasText: "Complete project proposal" }),
      ).toBeVisible();
    });

    test("should show no results when combined filters exclude all", async ({
      page,
    }) => {
      await page.locator(".priority-chip").filter({ hasText: "low" }).click();
      await page.getByLabel("Search tasks...").fill("critical");

      // "critical" doesn't match any low priority task
      await expect(page.locator(".task-card")).toHaveCount(0);
    });
  });
});
