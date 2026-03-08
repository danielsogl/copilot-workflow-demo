Run the project's unit tests and provide a clear summary of results.

**Steps:**

1. Run `npm test` to execute Vitest unit tests
2. Analyze the output:
   - Total tests, passed, failed, skipped
   - For each failure: file, test name, error message, and root cause analysis
3. If tests fail:
   - Read the failing test file and the source file it tests
   - Identify the root cause (code bug vs test bug)
   - Suggest a specific fix with code examples
4. If all tests pass:
   - Report summary with test count and duration
   - Note any skipped tests that should be enabled

**Optional arguments:**
- Pass a file path to run tests for a specific file: `npm test -- {path}`
- Pass `--watch` to enable watch mode
