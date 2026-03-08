Create a new NgRx Signal Store for a domain feature.

Ask the user for:
1. **Domain name** (e.g., "projects", "notifications")
2. **Entity type** and its properties
3. **Operations needed** (CRUD? search? filter?)
4. **API endpoint** on json-server

Then create:

1. **Model file**: `src/app/features/{domain}/data/models/{entity}.model.ts`
   - Entity interface with proper types
   - Form data type if creating/editing
   - Any enums needed

2. **API service**: `src/app/features/{domain}/data/infrastructure/{domain}-api.ts`
   - Injectable with `{ providedIn: 'root' }`
   - HttpClient via `inject()`
   - Observable-returning methods for each operation

3. **Store**: `src/app/features/{domain}/data/state/{domain}-store.ts`
   - State interface with `loading` and `error`
   - entityConfig with proper collection name
   - signalStore with withState, withEntities, withComputed, withMethods
   - rxMethod + tapResponse for async operations
   - patchState for synchronous updates

4. **Store tests**: `src/app/features/{domain}/data/state/{domain}-store.spec.ts`
   - Vitest + TestBed + provideZonelessChangeDetection
   - Test initial state, computed signals, methods, async operations

Follow the exact patterns from `src/app/features/tasks/data/state/task-store.ts`.
