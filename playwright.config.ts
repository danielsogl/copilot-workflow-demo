import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const bddTestDir = defineBddConfig({
  features: "tests/bdd/features/**/*.feature",
  steps: ["tests/bdd/steps/**/*.ts", "tests/fixtures/api-mock.ts"],
});

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4200",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "bdd",
      testDir: bddTestDir,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e",
      testDir: "./tests",
      testIgnore: ["**/bdd/**"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run start",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env["CI"],
  },
});
