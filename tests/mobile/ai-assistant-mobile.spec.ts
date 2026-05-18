// spec: specs/mobile-view.plan.md

import { test, expect } from "@playwright/test";

test.describe("mobile-layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("AI Assistant chat panel adapts to mobile", async ({ page }) => {
    await page.goto("http://localhost:4200/board");

    // 1. Tap the 'AI Assistant' nav icon from /board on mobile viewport
    await page.getByRole("link", { name: "AI Assistant" }).click();
    await expect(page).toHaveURL(/\/assistant/);

    const chatPanel = page.locator(".messages");
    await expect(chatPanel).toBeVisible();

    const panelBox = await chatPanel.boundingBox();
    expect(panelBox?.width).toBeLessThanOrEqual(390);

    // 2. Tap the message input field and type 'Hello from mobile'
    const chatInput = page.getByRole("textbox", {
      name: "Ask your assistant...",
    });
    await chatInput.click();
    await chatInput.fill("Hello from mobile");

    const inputBox = await chatInput.boundingBox();
    expect(inputBox?.y).toBeGreaterThan(0);
    expect(inputBox?.y).toBeLessThan(844);

    // 3. Submit the message (tap Send or press Enter)
    await page.getByRole("button", { name: "Send message" }).click();

    const userMessage = page
      .locator(".chat-message.user")
      .filter({ hasText: "Hello from mobile" });
    await expect(userMessage).toBeVisible();

    const userMsgBox = await userMessage.boundingBox();
    expect(userMsgBox?.right).toBeLessThanOrEqual(390 + 1);

    await expect(page.locator(".chat-message.assistant").last()).toBeVisible();
  });
});
