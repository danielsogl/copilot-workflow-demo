import { test, expect } from "@playwright/test";
import { resetDatabase } from "./helpers/reset-db";

test.describe("Task Board", () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    await page.goto("/");
    await expect(page.locator(".task-card").first()).toBeVisible();
  });

  test("should redirect root to /board", async ({ page }) => {
    await expect(page).toHaveURL(/\/board/);
  });

  test("should display the navbar with app title", async ({ page }) => {
    await expect(page.getByText("Task Board", { exact: true })).toBeVisible();
  });

  test("should display three columns with correct titles", async ({ page }) => {
    await expect(
      page.locator(".column-title").filter({ hasText: "To Do" }),
    ).toBeVisible();
    await expect(
      page.locator(".column-title").filter({ hasText: "In Progress" }),
    ).toBeVisible();
    await expect(
      page.locator(".column-title").filter({ hasText: "Done" }),
    ).toBeVisible();
  });

  test("should display correct task counts per column", async ({ page }) => {
    const todoColumn = page.locator(".column").filter({ hasText: "To Do" });
    await expect(todoColumn.locator(".column-count")).toHaveText("3");

    const progressColumn = page
      .locator(".column")
      .filter({ hasText: "In Progress" });
    await expect(progressColumn.locator(".column-count")).toHaveText("2");

    const doneColumn = page.locator(".column").filter({ hasText: "Done" });
    await expect(doneColumn.locator(".column-count")).toHaveText("3");
  });

  test("should display task cards with title and description", async ({
    page,
  }) => {
    await expect(
      page.locator(".task-title").filter({ hasText: "Client presentation" }),
    ).toBeVisible();
    await expect(
      page.locator(".task-title").filter({ hasText: "Fix critical bug" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".task-title")
        .filter({ hasText: "Complete project proposal" }),
    ).toBeVisible();
  });

  test("should display priority badges on task cards", async ({ page }) => {
    const highBadges = page
      .locator("app-priority-badge")
      .filter({ hasText: "high" });
    expect(await highBadges.count()).toBeGreaterThanOrEqual(1);
  });

  test("should display the add task FAB button", async ({ page }) => {
    await expect(page.locator("button.fab-add")).toBeVisible();
  });
});
