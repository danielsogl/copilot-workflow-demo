import { test, expect } from "@playwright/test";
import { resetDatabase } from "./helpers/reset-db";

test.describe("Dashboard Statistics", () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    await page.goto("/");
    await expect(page.locator(".task-card").first()).toBeVisible();
  });

  test("should display total task count", async ({ page }) => {
    const totalCard = page.locator(".stat-card").filter({ hasText: "Total" });
    await expect(totalCard.locator(".stat-value")).toHaveText("8");
  });

  test("should display todo count", async ({ page }) => {
    const todoCard = page.locator(".stat-card").filter({ hasText: "To Do" });
    await expect(todoCard.locator(".stat-value")).toHaveText("3");
  });

  test("should display in progress count", async ({ page }) => {
    const progressCard = page
      .locator(".stat-card")
      .filter({ hasText: "In Progress" });
    await expect(progressCard.locator(".stat-value")).toHaveText("2");
  });

  test("should display done count", async ({ page }) => {
    const doneCard = page.locator(".stat-card").filter({ hasText: "Done" });
    await expect(doneCard.locator(".stat-value")).toHaveText("3");
  });

  test("should display completion rate as percentage", async ({ page }) => {
    const rateCard = page.locator(".stat-card").filter({ hasText: "Complete" });
    await expect(rateCard.locator(".stat-value")).toHaveText("38%");
  });

  test("should update stats after creating a task", async ({ page }) => {
    await page.locator("button.fab-add").click();

    await page.getByLabel("Title").fill("Stats test task");
    await page.getByLabel("Description").fill("Testing stats update");

    // Set due date via keyboard input
    await page.getByLabel("Due Date").click();
    await page.getByLabel("Due Date").pressSequentially("03/15/2026");
    await page.getByLabel("Due Date").press("Tab");

    await page.getByRole("button", { name: "Create" }).click();

    // Total should now be 9
    const totalCard = page.locator(".stat-card").filter({ hasText: "Total" });
    await expect(totalCard.locator(".stat-value")).toHaveText("9");
  });
});
