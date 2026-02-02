import { test, expect } from "@playwright/test";

test.describe("Person Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/persons");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
  });

  test("should display the person list page", async ({ page }) => {
    // Check page title
    await expect(page.getByRole("heading", { name: "Persons" })).toBeVisible();

    // Check Add Person button exists
    await expect(
      page.getByRole("button", { name: /add person/i }),
    ).toBeVisible();

    // Check Dashboard button exists
    await expect(
      page.getByRole("button", { name: /dashboard/i }),
    ).toBeVisible();
  });

  test("should display the list of persons", async ({ page }) => {
    // Wait for persons to load
    await page.waitForSelector("table", { timeout: 10000 });

    // Check that table is visible
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check for column headers
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Email" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Phone" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "City" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Country" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();

    // Check that at least one person is displayed
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display total person count", async ({ page }) => {
    // Wait for the summary to appear
    await page.waitForSelector(".summary", { timeout: 10000 });

    // Check total count
    await expect(page.getByText(/Total: \d+ person/)).toBeVisible();
  });

  test("should open create person modal", async ({ page }) => {
    // Click Add Person button
    await page
      .getByRole("button", { name: /add person/i })
      .first()
      .click();

    // Check modal is visible
    await expect(
      page.getByRole("heading", { name: "Create New Person" }),
    ).toBeVisible();

    // Check form fields are present
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Phone")).toBeVisible();
    await expect(page.getByLabel("Date of Birth")).toBeVisible();
    await expect(page.getByLabel("Address")).toBeVisible();
    await expect(page.getByLabel("City")).toBeVisible();
    await expect(page.getByLabel("Country")).toBeVisible();

    // Check buttons
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create person/i }),
    ).toBeVisible();
  });

  test("should create a new person", async ({ page }) => {
    // Click Add Person button
    await page
      .getByRole("button", { name: /add person/i })
      .first()
      .click();

    // Use a unique email to avoid conflicts
    const timestamp = Date.now();
    const uniqueEmail = `test.user.${timestamp}@example.com`;

    // Fill in the form
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Phone").fill("+1-555-9999");
    await page.getByLabel("Address").fill("123 Test Street");
    await page.getByLabel("City").fill("Test City");
    await page.getByLabel("Country").fill("Test Country");

    // Fill date of birth
    await page.getByLabel("Date of Birth").fill("1995-05-15");

    // Submit the form
    await page.getByRole("button", { name: /create person/i }).click();

    // Wait for modal to close and data to load
    await page.waitForTimeout(1000);

    // Check that the new person appears in the list
    await expect(page.getByText(uniqueEmail).first()).toBeVisible();
  });

  test("should cancel person creation", async ({ page }) => {
    // Click Add Person button
    await page
      .getByRole("button", { name: /add person/i })
      .first()
      .click();

    // Check modal is visible
    await expect(
      page.getByRole("heading", { name: "Create New Person" }),
    ).toBeVisible();

    // Click Cancel button
    await page.getByRole("button", { name: "Cancel" }).click();

    // Modal should be closed
    await expect(
      page.getByRole("heading", { name: "Create New Person" }),
    ).not.toBeVisible();
  });

  test("should validate required fields in create form", async ({ page }) => {
    // Click Add Person button
    await page
      .getByRole("button", { name: /add person/i })
      .first()
      .click();

    // Wait for modal
    await page.waitForSelector('h2:has-text("Create New Person")');

    // Try to submit empty form - button should be disabled initially
    const createButton = page.locator('button:has-text("Create Person")');
    await expect(createButton).toBeDisabled();
  });

  test("should open edit person modal", async ({ page }) => {
    // Wait for persons to load
    await page.waitForSelector("table", { timeout: 10000 });

    // Click the first edit button using icon
    const editButton = page.locator('button[mattooltip="Edit person"]').first();
    await editButton.click();

    // Check modal is visible
    await expect(
      page.getByRole("heading", { name: "Edit Person" }),
    ).toBeVisible();

    // Check form fields are present and populated with any values
    await expect(page.getByLabel("First Name")).not.toBeEmpty();
    await expect(page.getByLabel("Last Name")).not.toBeEmpty();
    await expect(page.getByLabel("Email")).not.toBeEmpty();
  });

  test("should edit a person", async ({ page }) => {
    // Wait for persons to load
    await page.waitForSelector("table", { timeout: 10000 });

    // Click the first edit button using icon
    const editButton = page.locator('button[mattooltip="Edit person"]').first();
    await editButton.click();

    // Update the city
    const cityField = page.getByLabel("City");
    await cityField.clear();
    await cityField.fill("Updated City");

    // Submit the form
    const updateButton = page.locator('button:has-text("Update Person")');
    await updateButton.click();

    // Wait for modal to close and data to reload
    await page.waitForTimeout(1000);

    // Check that the updated city appears in the list
    await expect(page.getByText("Updated City")).toBeVisible();
  });

  test("should delete a person", async ({ page }) => {
    // Wait for persons to load
    await page.waitForSelector("table", { timeout: 10000 });

    // Get initial row count
    const initialRows = await page.locator("table tbody tr").count();

    // Setup dialog handler to confirm deletion
    page.on("dialog", (dialog) => dialog.accept());

    // Click the first delete button using icon/tooltip
    const deleteButton = page
      .locator('button[mattooltip="Delete person"]')
      .first();
    await deleteButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Check that row count decreased
    const newRows = await page.locator("table tbody tr").count();
    expect(newRows).toBe(initialRows - 1);
  });

  test("should navigate to dashboard", async ({ page }) => {
    // Click Dashboard button
    await page.getByRole("button", { name: /dashboard/i }).click();

    // Check that we're on the dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should show loading state", async ({ page }) => {
    // This test is skipped because the loading state is too fast to catch reliably
    // The loading spinner appears and disappears very quickly
    test.skip();
  });

  test("should display empty state when no persons exist", async ({ page }) => {
    // This test is skipped because it modifies the database state
    // which can affect other tests running in parallel
    test.skip();
  });
});
