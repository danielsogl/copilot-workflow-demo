Scaffold a complete DDD domain feature for this Angular 21 project.

Ask the user for:
1. **Domain name** (kebab-case, e.g., "projects", "notifications", "categories")
2. **Entity properties** (what fields does the main entity have?)
3. **Features needed** (list, detail, create, edit, delete?)
4. **API endpoint** (what json-server endpoint to use?)

Then create the complete domain structure:

```
src/app/features/{domain}/
  feature/{domain}-dashboard/    — Smart feature component
  ui/{domain}-card/              — Presentational card component
  ui/{domain}-list/              — Presentational list component
  data/models/{entity}.model.ts  — TypeScript interfaces
  data/infrastructure/{domain}-api.ts — HTTP service
  data/state/{domain}-store.ts   — NgRx Signal Store
  util/{domain}-helpers/         — Utility functions
```

Plus test files for each `.ts` file.

Follow ALL project conventions:
- Standalone components with OnPush
- Signal inputs/outputs
- @if/@for/@switch control flow
- NgRx Signal Store with rxMethod + tapResponse
- Vitest + provideZonelessChangeDetection() for tests
- No barrel files, no type suffixes in names
- kebab-case files, PascalCase classes

Add a route to `src/app/app.routes.ts` using lazy loading.
Add mock data to `db.json` if applicable.
