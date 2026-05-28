// spec: specs/mobile-view.plan.md
// seed: tests/mobile/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("AI Assistant chat panel adapts to mobile", async ({ page }) => {
    await page.goto("http://localhost:4200/board");

    // 1. Tap the 'AI Assistant' nav icon from /board on mobile viewport
    await page.getByRole("link", { name: "AI Assistant" }).click();
    await expect(page).toHaveURL(/\/assistant/);
    await expect(
      page.getByRole("textbox", { name: "Ask your assistant..." }),
    ).toBeVisible();

    // 2. Tap the message input field and type 'Hello from mobile'
    const chatInput = page.getByRole("textbox", {
      name: "Ask your assistant...",
    });
    await chatInput.click();
    await chatInput.fill("Hello from mobile");
    await expect(chatInput).toHaveValue("Hello from mobile");

    // 3. Submit the message (tap Send or press Enter)
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Hello from mobile")).toBeVisible();
    await expect(page.locator(".chat-message").last()).toBeVisible();
  });
});
