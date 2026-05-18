// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Task card menu and edit flow are usable on mobile", async ({
    page,
  }) => {
    // 1. Navigate to /board on mobile viewport and locate the 'Client presentation' card
    await page.goto("http://localhost:4200/board");

    const card = page
      .locator("mat-card")
      .filter({ hasText: "Client presentation" });
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("heading", { name: "Client presentation", level: 3 }),
    ).toBeVisible();

    const menuBtn = card.locator("button.menu-btn");
    await expect(menuBtn).toBeVisible();

    const menuBtnBox = await menuBtn.boundingBox();
    expect(menuBtnBox?.width).toBeGreaterThanOrEqual(36);
    expect(menuBtnBox?.height).toBeGreaterThanOrEqual(36);

    // 2. Tap the 'more_vert' button on the 'Client presentation' card
    await menuBtn.click();

    const editItem = page.getByRole("menuitem", { name: "Edit" });
    const deleteItem = page.getByRole("menuitem", { name: "Delete" });
    await expect(editItem).toBeVisible();
    await expect(deleteItem).toBeVisible();

    const menuBox = await editItem.evaluate((el) => {
      const parent = el.closest('[role="menu"]');
      return parent ? parent.getBoundingClientRect() : null;
    });
    expect(menuBox?.right).toBeLessThanOrEqual(390 + 1);

    // 3. Tap the 'Edit' action
    await editItem.click();

    const dialog = page.getByRole("dialog", { name: "Edit Task" });
    await expect(dialog).toBeVisible();

    const titleInput = page.getByRole("textbox", { name: "Title" });
    await expect(titleInput).toHaveValue("Client presentation");

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.width).toBeLessThanOrEqual(390);

    // 4. Change the title to 'Client presentation (mobile edit)' and save
    await titleInput.clear();
    await titleInput.fill("Client presentation (mobile edit)");
    await page.getByRole("button", { name: "Update" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Client presentation (mobile edit)",
        level: 3,
      }),
    ).toBeVisible();
  });
});
