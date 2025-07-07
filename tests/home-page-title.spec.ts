import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Task Manager', { exact: true })).toBeVisible();
  });
});
