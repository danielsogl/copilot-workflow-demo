# Tech Stack Guidelines

This project uses the following technology stack:

- **Framework:** Angular v19+
- **Language:** TypeScript (strict mode, strong typing)
- **State Management:** NgRx Signals Store
- **UI Library:** Angular Material v3
- **Component Patterns:** Standalone components, modern Angular control flow
- **API:** Local fake REST API using [json-server](https://github.com/typicode/json-server#readme) served from `db.json` on `http://localhost:3000`
- **Testing:** Jasmine, ng-mocks, Playwright (E2E)
- **Module Boundaries:** Enforced with [Sheriff](https://github.com/softarc-consulting/sheriff)
- **Linting/Formatting:** ESLint, Prettier
- **Other:**
  - No NgModules (standalone APIs only)
  - No static or in-memory data in application code
  - All data access via the API layer

For more details, see the architecture and coding guidelines in `.github/guidelines/`.
