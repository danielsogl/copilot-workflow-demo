// spec: specs/mobile-view.plan.md
// seed: tests/mobile/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("Task card menu and edit flow are usable on mobile", async ({
    page,
  }) => {
    // 1. Navigate to /board on mobile viewport and locate the 'Client presentation' card in the 'To Do' column
    await page.goto("http://localhost:4200/board");
    await expect(
      page.getByRole("heading", { name: "Client presentation" }),
    ).toBeVisible();

    // 2. Tap the 'more_vert' button on the 'Client presentation' card
    const clientCard = page
      .locator("mat-card")
      .filter({ hasText: "Client presentation" });
    await clientCard.getByRole("button").click();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();

    // 3. Tap the 'Edit' action
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect(page.getByRole("dialog", { name: "Edit Task" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue(
      "Client presentation",
    );

    // 4. Change the title to 'Client presentation (mobile edit)' and save
    await page
      .getByRole("textbox", { name: "Title" })
      .fill("Client presentation (mobile edit)");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Client presentation (mobile edit)" }),
    ).toBeVisible();
  });
});
