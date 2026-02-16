import { test, expect } from "@playwright/test";
import { resetDatabase } from "./helpers/reset-db";

test.describe("Task CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    await page.goto("/");
    await expect(page.locator(".task-card").first()).toBeVisible();
  });

  test.describe("Create Task", () => {
    test("should open create dialog when FAB is clicked", async ({ page }) => {
      await page.locator("button.fab-add").click();
      await expect(
        page.getByText("Create Task", { exact: true }),
      ).toBeVisible();
    });

    test("should have disabled Create button when form is empty", async ({
      page,
    }) => {
      await page.locator("button.fab-add").click();
      await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
    });

    test("should close dialog on Cancel", async ({ page }) => {
      await page.locator("button.fab-add").click();
      await expect(
        page.getByText("Create Task", { exact: true }),
      ).toBeVisible();

      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(
        page.getByText("Create Task", { exact: true }),
      ).not.toBeVisible();
    });

    test("should create a new task", async ({ page }) => {
      await page.locator("button.fab-add").click();

      await page.getByLabel("Title").fill("New E2E Test Task");
      await page.getByLabel("Description").fill("Created by Playwright");

      // Select high priority
      await page.getByLabel("Priority").click();
      await page.getByRole("option", { name: "High" }).click();

      // Set due date via keyboard input
      await page.getByLabel("Due Date").click();
      await page.getByLabel("Due Date").pressSequentially("03/15/2026");
      await page.getByLabel("Due Date").press("Escape");

      await page.getByRole("button", { name: "Create" }).click();

      // Verify task appears in Todo column
      const todoColumn = page.locator(".column").filter({ hasText: "To Do" });
      await expect(
        todoColumn
          .locator(".task-title")
          .filter({ hasText: "New E2E Test Task" }),
      ).toBeVisible();

      // Verify snackbar confirmation
      await expect(page.getByText("Task created")).toBeVisible();
    });

    test("should enable Create button only when form is valid", async ({
      page,
    }) => {
      await page.locator("button.fab-add").click();
      const createBtn = page.getByRole("button", { name: "Create" });

      // Only title filled - still disabled
      await page.getByLabel("Title").fill("Test");
      await expect(createBtn).toBeDisabled();

      // Title + description - still disabled (no date)
      await page.getByLabel("Description").fill("Description");
      await expect(createBtn).toBeDisabled();

      // Add date - now valid
      await page.getByLabel("Due Date").click();
      await page.getByLabel("Due Date").pressSequentially("03/15/2026");
      await page.getByLabel("Due Date").press("Escape");

      await expect(createBtn).toBeEnabled();
    });
  });

  test.describe("Edit Task", () => {
    test("should open edit dialog with pre-filled data", async ({ page }) => {
      const taskCard = page
        .locator(".task-card")
        .filter({ hasText: "Client presentation" });
      await taskCard.locator(".menu-btn").click();
      await page.getByRole("menuitem", { name: "Edit" }).click();

      await expect(page.getByText("Edit Task", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Title")).toHaveValue("Client presentation");
      await expect(page.getByLabel("Description")).toHaveValue(
        "Present project progress to stakeholders and gather feedback",
      );
    });

    test("should update a task", async ({ page }) => {
      const taskCard = page
        .locator(".task-card")
        .filter({ hasText: "Client presentation" });
      await taskCard.locator(".menu-btn").click();
      await page.getByRole("menuitem", { name: "Edit" }).click();

      await page.getByLabel("Title").clear();
      await page.getByLabel("Title").fill("Updated Presentation");

      await page.getByRole("button", { name: "Update" }).click();

      await expect(
        page.locator(".task-title").filter({ hasText: "Updated Presentation" }),
      ).toBeVisible();
      await expect(page.getByText("Task updated")).toBeVisible();
    });

    test("should not update when dialog is cancelled", async ({ page }) => {
      const taskCard = page
        .locator(".task-card")
        .filter({ hasText: "Client presentation" });
      await taskCard.locator(".menu-btn").click();
      await page.getByRole("menuitem", { name: "Edit" }).click();

      await page.getByLabel("Title").clear();
      await page.getByLabel("Title").fill("Should Not Appear");

      await page.getByRole("button", { name: "Cancel" }).click();

      await expect(
        page.locator(".task-title").filter({ hasText: "Client presentation" }),
      ).toBeVisible();
      await expect(page.getByText("Should Not Appear")).not.toBeVisible();
    });
  });

  test.describe("Delete Task", () => {
    test("should open confirmation dialog", async ({ page }) => {
      const taskCard = page
        .locator(".task-card")
        .filter({ hasText: "Client presentation" });
      await taskCard.locator(".menu-btn").click();
      await page.getByRole("menuitem", { name: "Delete" }).click();

      await expect(page.getByText("Delete Task")).toBeVisible();
      await expect(
        page.getByText(
          'Are you sure you want to delete "Client presentation"?',
        ),
      ).toBeVisible();
    });

    test("should delete task on confirmation", async ({ page }) => {
      const taskCard = page
        .locator(".task-card")
        .filter({ hasText: "Client presentation" });
      await taskCard.locator(".menu-btn").click();
      await page.getByRole("menuitem", { name: "Delete" }).click();

      // Click Delete button inside the dialog
      const dialog = page.locator("mat-dialog-container");
      await dialog.getByRole("button", { name: "Delete" }).click();

      await expect(
        page.locator(".task-title").filter({ hasText: "Client presentation" }),
      ).not.toBeVisible();
      await expect(page.getByText("Task deleted")).toBeVisible();

      // Total should decrease
      const totalCard = page.locator(".stat-card").filter({ hasText: "Total" });
      await expect(totalCard.locator(".stat-value")).toHaveText("7");
    });

    test("should not delete task on cancel", async ({ page }) => {
      const taskCard = page
        .locator(".task-card")
        .filter({ hasText: "Client presentation" });
      await taskCard.locator(".menu-btn").click();
      await page.getByRole("menuitem", { name: "Delete" }).click();

      const dialog = page.locator("mat-dialog-container");
      await dialog.getByRole("button", { name: "Cancel" }).click();

      await expect(
        page.locator(".task-title").filter({ hasText: "Client presentation" }),
      ).toBeVisible();
    });
  });
});
