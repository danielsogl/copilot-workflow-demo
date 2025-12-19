import { test, expect } from "@playwright/test";

/**
 * Task Edit Modal E2E Tests
 *
 * Tests for the task edit modal functionality using user-facing locators.
 */

test.describe("Task Edit Modal", () => {
  test("should open edit modal when Edit button is clicked", async ({
    page,
  }) => {
    await page.goto("/tasks");

    // Click the first Edit button
    await page.getByRole("button", { name: "Edit Task" }).first().click();

    await expect(
      page.getByRole("heading", { name: "Edit Task" }),
    ).toBeVisible();
  });

  test("should display all form fields with pre-populated data", async ({
    page,
  }) => {
    await page.goto("/tasks");

    // Open edit modal
    await page.getByRole("button", { name: "Edit Task" }).first().click();

    await expect(page.getByRole("textbox", { name: "Title *" })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Description" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Priority *" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Due Date *" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Estimated Time (minutes)" }),
    ).toBeVisible();

    // Verify that title field is pre-populated
    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await expect(titleInput).not.toHaveValue("");
  });

  test("should show character count for title with existing value", async ({
    page,
  }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    // Should show character count based on existing title length
    await expect(page.getByText(/\/100$/)).toBeVisible();
  });

  test("should show character count for description with existing value", async ({
    page,
  }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    // Should show character count based on existing description length
    await expect(page.getByText(/\/500$/)).toBeVisible();
  });

  test("should allow editing title", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();
    await titleInput.fill("Updated Task Title");

    await expect(titleInput).toHaveValue("Updated Task Title");
  });

  test("should show validation error for short title when editing", async ({
    page,
  }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();
    await titleInput.fill("ab");
    await titleInput.blur();

    await expect(
      page.getByText("Title must be at least 3 characters"),
    ).toBeVisible();
  });

  test("should show validation error for missing required fields", async ({
    page,
  }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();
    await titleInput.blur();

    await expect(page.getByText("Title is required")).toBeVisible();
  });

  test("should allow changing priority", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const prioritySelect = page.getByRole("combobox", { name: "Priority *" });
    await prioritySelect.click();
    await page.getByRole("option", { name: "Low" }).click();

    await expect(prioritySelect).toContainText("Low");
  });

  test("should allow editing estimated time", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const estimatedTimeInput = page.getByRole("textbox", {
      name: "Estimated Time (minutes)",
    });
    await estimatedTimeInput.clear();
    await estimatedTimeInput.fill("120");

    await expect(estimatedTimeInput).toHaveValue("120");
  });

  test("should validate estimated time range", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const estimatedTimeInput = page.getByRole("textbox", {
      name: "Estimated Time (minutes)",
    });

    await estimatedTimeInput.clear();
    await estimatedTimeInput.fill("-1");
    await estimatedTimeInput.blur();

    await expect(
      page.getByText("Estimated Time must be at least 0"),
    ).toBeVisible();

    await estimatedTimeInput.clear();
    await estimatedTimeInput.fill("10000");
    await estimatedTimeInput.blur();

    await expect(
      page.getByText("Estimated Time cannot exceed 9999"),
    ).toBeVisible();
  });

  test("should close modal when Cancel button is clicked", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should close modal when close button is clicked", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    await page.getByRole("button", { name: "Close dialog" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should have Save Changes button disabled with validation errors", async ({
    page,
  }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();

    const saveButton = page.getByRole("button", { name: "Save Changes" });
    await expect(saveButton).toBeDisabled();
  });

  test("should save task changes with valid data", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();
    await titleInput.fill("Updated Task Title");

    const descriptionInput = page.getByRole("textbox", {
      name: "Description",
    });
    await descriptionInput.clear();
    await descriptionInput.fill("Updated description for the task");

    const saveButton = page.getByRole("button", { name: "Save Changes" });
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    // Modal should close after successful save
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });

  test("should show saving indicator while updating", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: "Edit Task" }).first().click();

    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();
    await titleInput.fill("Modified Title");

    await page.getByRole("button", { name: "Save Changes" }).click();

    // Should show saving indicator
    await expect(page.getByText("Saving...")).toBeVisible();
  });
});
