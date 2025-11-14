---
description: "Complete tech stack overview: Angular, TypeScript, NgRx Signals, Material, Vitest, Playwright, json-server, and build tooling"
applyTo: "**"
---

# Tech Stack Guidelines

This project uses the following technology stack:

- **Framework:** Angular (latest version)
- **Language:** TypeScript (strict mode, strong typing)
- **State Management:** NgRx Signals Store
- **UI Library:** Angular Material
- **Component Patterns:** Standalone components, modern Angular control flow
- **API:** Local fake REST API using json-server served from `db.json` on `http://localhost:3000`
- **Testing:** Vitest with ng-mocks for unit testing, Playwright for E2E testing
- **Build System:** @angular/build (esbuild-based)
- **Git Hooks:** Lefthook (auto-format & auto-fix on commit)
- **Linting/Formatting:** ESLint with Angular rules, Prettier
- **Other:**
  - No NgModules (standalone APIs only)
  - No static or in-memory data in application code
  - All data access via the API layer

For specific versions, refer to `package.json`
