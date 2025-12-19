import { test, expect } from "@playwright/test";

test.describe("Todo Create Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tasks");
  });

  test("should show Add todo button initially", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add todo" })).toBeVisible();
  });

  test("should expand todo form when Add todo button is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    await expect(
      page.getByRole("textbox", { name: "Todo item" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("should have Add button disabled when input is empty", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const addButton = page.getByRole("button", { name: "Add" });
    await expect(addButton).toBeDisabled();
  });

  test("should enable Add button when input has valid text", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    await todoInput.fill("New todo item");

    const addButton = page.getByRole("button", { name: "Add" });
    await expect(addButton).toBeEnabled();
  });

  test("should show validation error for exceeding max length", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    const longText = "a".repeat(201);
    await todoInput.fill(longText);

    await expect(
      page.getByText("Maximum length is 200 characters"),
    ).toBeVisible();
  });

  test("should collapse form when Cancel button is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add todo" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(
      page.getByRole("textbox", { name: "Todo item" }),
    ).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Add todo" })).toBeVisible();
  });

  test("should add todo and collapse form on submit", async ({ page }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    await todoInput.fill("Test todo item");

    await page.getByRole("button", { name: "Add" }).click();

    // Form should collapse after submission
    await expect(todoInput).not.toBeVisible({ timeout: 2000 });
    await expect(page.getByRole("button", { name: "Add todo" })).toBeVisible();
  });

  test("should clear input after adding todo", async ({ page }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    await todoInput.fill("First todo");
    await page.getByRole("button", { name: "Add" }).click();

    // Expand form again
    await page.getByRole("button", { name: "Add todo" }).click();

    // Input should be empty
    await expect(todoInput).toHaveValue("");
  });

  test("should submit on Enter key press", async ({ page }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    await todoInput.fill("Todo via Enter key");
    await todoInput.press("Enter");

    // Form should collapse after submission
    await expect(todoInput).not.toBeVisible({ timeout: 2000 });
  });

  test("should collapse on Escape key press", async ({ page }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    await todoInput.press("Escape");

    await expect(todoInput).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Add todo" })).toBeVisible();
  });

  test("should not submit with only whitespace", async ({ page }) => {
    await page.getByRole("button", { name: "Add todo" }).click();

    const todoInput = page.getByRole("textbox", { name: "Todo item" });
    await todoInput.fill("   ");

    const addButton = page.getByRole("button", { name: "Add" });
    await expect(addButton).toBeDisabled();
  });
});
