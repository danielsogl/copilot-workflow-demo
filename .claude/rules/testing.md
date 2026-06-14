---
description: Vitest + Angular + Playwright test conventions — loaded when touching test files
paths:
  - "**/*.spec.ts"
  - "tests/**"
---

When writing or editing tests:

- Always add `provideZonelessChangeDetection()` to TestBed providers.
- Use `provideHttpClientTesting()` for service tests — no separate `provideHttpClient()` in v21+.
- Set signal inputs via `componentRef.setInput(name, value)`, then `await fixture.whenStable()`.
- Tests live next to the source as `*.spec.ts`. Run them with `npm test` (Vitest via `@angular/build:unit-test`, not Karma).
- Playwright BDD: features in `tests/bdd/features/`, steps in `tests/bdd/steps/`. Always run `bddgen` before `playwright test` (`npm run test:e2e`).
