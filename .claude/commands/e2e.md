Run or create Playwright E2E tests for this project.

**Usage:**
- No arguments: Run all E2E tests
- With "plan": Plan new E2E test scenarios
- With "generate": Generate new E2E tests from a plan
- With a file path: Run specific test file

**Steps for running tests:**

1. Check if dev server is running on :4200 and :3000
2. Run `npm run test:e2e` (or specific file with `npx playwright test {path}`)
3. Analyze results:
   - Passed/failed/skipped per browser (chromium, firefox, webkit)
   - For failures: show error, screenshot if available, suggest fix
4. If tests fail, offer to launch the `playwright-test-healer` agent

**Steps for planning tests:**

1. Analyze the application routes and features
2. Identify critical user journeys
3. Create a test plan with:
   - Test suite name
   - Individual test cases with steps and assertions
   - Seed file for page setup
4. Save plan to `tests/specs/` directory

**Steps for generating tests:**

1. Read the test plan from `tests/specs/`
2. Launch the `playwright-test-generator` agent for each test case
3. Tests are saved to `tests/` directory

**Configuration:** `playwright.config.ts`
- Base URL: `http://localhost:4200`
- Browsers: chromium, firefox, webkit
- Serial execution (shared json-server)
