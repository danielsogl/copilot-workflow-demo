---
description: Build/test/lint commands and global project rules (npm-only, no bypassing hooks).
---

## Commands

| Task                     | Command             |
| ------------------------ | ------------------- |
| Dev server + API         | `npm start`         |
| Backend only             | `npm run start:api` |
| Production build         | `npm run build`     |
| Backend build            | `npm run build:api` |
| Unit tests (Vitest)      | `npm test`          |
| Backend tests (xUnit v3) | `npm run test:api`  |
| E2E tests (Playwright)   | `npm run test:e2e`  |
| Lint                     | `npm run lint`      |

Always use **npm**. Never pnpm/yarn.

## Don'ts

- No code comments unless explicitly requested.
- No `console.log` in committed code.
- No mocking the API in integration tests — they hit the real `TaskApi` instance on `:3000`.
- No `--no-verify` on commits. Fix the failing hook instead.
