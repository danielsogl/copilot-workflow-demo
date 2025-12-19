import { test, expect } from "@playwright/test";

test.describe("Task Create Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tasks");
    await page.getByRole("button", { name: "New Task" }).click();
    await expect(
      page.getByRole("heading", { name: "Create New Task" }),
    ).toBeVisible();
  });

  test("should open create task modal", async ({ page }) => {
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Create New Task" }),
    ).toBeVisible();
  });

  test("should display all form fields", async ({ page }) => {
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
  });

  test("should have Create Task button disabled initially when required fields are empty", async ({
    page,
  }) => {
    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.clear();

    await expect(
      page.getByRole("button", { name: "Create Task" }),
    ).toBeDisabled();
  });

  test("should show character count for title", async ({ page }) => {
    const titleInput = page.getByRole("textbox", { name: "Title *" });
    await titleInput.fill("Test Task");

    await expect(page.getByText("9/100")).toBeVisible();
  });

  test("should show character count for description", async ({ page }) => {
    const descriptionInput = page.getByRole("textbox", {
      name: "Description",
    });
    await descriptionInput.fill("Test description");

    await expect(page.getByText("16/500")).toBeVisible();
  });

  test("should show validation error for short title", async ({ page }) => {
    const titleInput = page.getByRole("textbox", { name: "Title *" });

    await titleInput.fill("ab");
    await titleInput.blur();

    await expect(
      page.getByText("Title must be at least 3 characters"),
    ).toBeVisible();
  });

  test("should show validation error for missing title", async ({ page }) => {
    const titleInput = page.getByRole("textbox", { name: "Title *" });

    await titleInput.fill("");
    await titleInput.blur();

    await expect(page.getByText("Title is required")).toBeVisible();
  });

  test("should allow selecting priority", async ({ page }) => {
    const prioritySelect = page.getByRole("combobox", { name: "Priority *" });

    await prioritySelect.click();
    await page.getByRole("option", { name: "High" }).click();

    await expect(prioritySelect).toContainText("High");
  });

  test("should close modal when Cancel button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should close modal when close button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Close dialog" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should create a task with valid data", async ({ page }) => {
    const titleInput = page.getByRole("textbox", { name: "Title *" });
    const descriptionInput = page.getByRole("textbox", {
      name: "Description",
    });
    const prioritySelect = page.getByRole("combobox", { name: "Priority *" });
    const dueDateInput = page.getByRole("textbox", { name: "Due Date *" });

    await titleInput.fill("E2E Test Task");
    await descriptionInput.fill("This is a test task created by E2E tests");

    await prioritySelect.click();
    await page.getByRole("option", { name: "High" }).click();

    await page.getByRole("button", { name: "Open calendar" }).click();
    await page.locator(".mat-calendar-body-active").first().click();

    const createButton = page.getByRole("button", { name: "Create Task" });
    await expect(createButton).toBeEnabled();

    await createButton.click();

    // Modal should close after successful creation
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });

  test("should enable Create Task button when all required fields are filled", async ({
    page,
  }) => {
    const titleInput = page.getByRole("textbox", { name: "Title *" });
    const prioritySelect = page.getByRole("combobox", { name: "Priority *" });

    await titleInput.fill("Valid Task Title");

    await prioritySelect.click();
    await page.getByRole("option", { name: "High" }).click();

    await page.getByRole("button", { name: "Open calendar" }).click();
    await page.locator(".mat-calendar-body-active").first().click();

    await expect(
      page.getByRole("button", { name: "Create Task" }),
    ).toBeEnabled();
  });
});
