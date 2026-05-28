// spec: specs/mobile-view.plan.md

import { test } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
});

test.describe("mobile-layout seed", () => {
  test("seed", async ({ page }) => {
    await page.goto("http://localhost:4200/board");
  });
});
