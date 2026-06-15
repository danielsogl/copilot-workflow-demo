---
description: Build/test/lint commands and global project rules (npm-only, no bypassing hooks).
---

## Commands

| Task                   | Command            |
| ---------------------- | ------------------ |
| Dev server + mock API  | `npm start`        |
| Production build       | `npm run build`    |
| Unit tests (Vitest)    | `npm test`         |
| E2E tests (Playwright) | `npm run test:e2e` |
| Lint                   | `npm run lint`     |

Always use **npm**. Never pnpm/yarn.

## Don'ts

- No code comments unless explicitly requested.
- No `console.log` in committed code.
- No mocking the database in integration tests — they hit the real `json-server` instance.
- No `--no-verify` on commits. Fix the failing hook instead.
