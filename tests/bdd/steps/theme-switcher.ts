import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

When("I switch the theme mode to {string}", async ({ page }, mode: string) => {
  await page
    .locator(`.theme-toggle mat-button-toggle[value="${mode}"] button`)
    .click();
});

Then(
  "the color scheme should be {string}",
  async ({ page }, expectedScheme: string) => {
    const scheme = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("color-scheme"),
    );
    await expect(scheme).toBe(expectedScheme);
  },
);

When("I reload the page", async ({ page }) => {
  await page.reload();
});

Then(
  "the selected theme mode should be {string}",
  async ({ page }, expectedMode: string) => {
    await expect(
      page.locator(
        `.theme-toggle mat-button-toggle[value="${expectedMode}"].mat-button-toggle-checked`,
      ),
    ).toBeVisible();
  },
);
