Run ESLint on the project and fix any issues found.

**Steps:**

1. Run `npm run lint` to execute ESLint with auto-fix
2. Analyze the output:
   - Count of errors vs warnings
   - Group issues by category (Angular, TypeScript, NgRx, formatting)
3. For auto-fixable issues: confirm they were resolved
4. For remaining issues:
   - Show file, line, rule, and message
   - Provide the specific code fix for each
   - Apply fixes directly

**Common issues in this project:**
- `@angular-eslint/prefer-on-push-component-change-detection` — add OnPush
- `@typescript-eslint/no-explicit-any` — add proper types
- `@ngrx/prefer-signal-store-methods` — use store methods correctly
- Unused imports or variables
