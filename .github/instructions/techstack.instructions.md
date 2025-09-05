---
applyTo: "**"
---

# Tech Stack Guidelines

This project uses the following technology stack:

- **Framework:** Angular v20.2.4
- **Language:** TypeScript v5.9.2 (strict mode, strong typing)
- **State Management:** NgRx Signals Store v20.0.1
- **UI Library:** Angular Material v20.2.2
- **Component Patterns:** Standalone components, modern Angular control flow
- **API:** Local fake REST API using json-server v1.0.0-beta.3 served from `db.json` on `http://localhost:3000`
- **Testing:** Vitest v3.2.4, ng-mocks v14.13.5, Playwright v1.55.0 (E2E)
- **Build System:** @angular/build v20.2.2 (esbuild-based)
- **Git Hooks:** Lefthook v1.12.3 (auto-format & auto-fix on commit)
- **Linting/Formatting:** ESLint with Angular rules, Prettier
- **Other:**
  - No NgModules (standalone APIs only)
  - No static or in-memory data in application code
  - All data access via the API layer

For more details, see the architecture and coding instructions in `.github/instructions/`.
