---
description: A reusable prompt for generating NgRx Signal stores with complete CRUD operations for a specified entity.
name: ngrx-signals-store-crud-generator
agent: signal-store-creator
tools: ['edit', 'search', 'execute/runInTerminal', 'execute/getTerminalOutput', 'read/terminalLastCommand', 'execute/runTests', 'read/problems', 'read/readFile', 'search/usages', 'todos', 'eslint/*', 'context7/*', 'angular-cli/*']
---

# NgRx Signal Store CRUD Generator

## Goal

Generate a complete NgRx Signal Store with CRUD operations for a specified entity, following the project's architecture patterns and best practices.

## Prerequisites

Before running this prompt, ensure you have:

1. **Entity Definition**: The target entity model must be defined and linked in the chat context
2. **Store Name**: Specify the desired store name (e.g., `UserStore`, `TaskStore`)
3. **Entity Name**: Specify the entity name (e.g., `User`, `Task`)

## Instructions

### Step 1: Entity and Service Analysis
- Analyze the provided entity model to understand its structure and properties
- Check if an Angular service with HTTP CRUD methods already exists for this entity
- If no service exists, create one with the following demo endpoints based on the entity structure:
  ```typescript
  // Example endpoints for a User entity
  getUsers(): Observable<User[]>
  getUserById(id: string): Observable<User>
  createUser(user: CreateUserRequest): Observable<User>
  updateUser(id: string, updates: Partial<User>): Observable<User>
  deleteUser(id: string): Observable<void>
  ```

### Step 2: Signal Store Generation
Generate a complete NgRx Signal Store with:

#### Core Structure
```typescript
export interface [EntityName]State {
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initial[EntityName]State: [EntityName]State = {
  loading: false,
  error: null,
  selectedId: null,
};

const [entityName]EntityConfig = entityConfig({
  entity: type<[EntityName]>(),
  collection: '[entityName]',
  selectId: ([entityName]: [EntityName]) => [entityName].id,
});

export const [EntityName]Store = signalStore(
  { providedIn: 'root' },
  withState(initial[EntityName]State),
  withEntities([entityName]EntityConfig),
  // ... computed properties
  // ... methods
);
```

#### Required CRUD Methods
Implement all CRUD operations using `rxMethod` for Observable-based service calls:

1. **Load All**: `load[EntityName]s(): void`
2. **Load By ID**: `load[EntityName]ById(id: string): void`
3. **Create**: `create[EntityName]([entityName]: Create[EntityName]Request): void`
4. **Update**: `update[EntityName](id: string, updates: Partial<[EntityName]>): void`
5. **Delete**: `delete[EntityName](id: string): void`
6. **Select**: `select[EntityName](id: string | null): void`

#### Computed Properties
Include these computed signals:
- `selected[EntityName]`: The currently selected entity
- `total[EntityName]Count`: Total number of entities
- `hasData`: Whether any entities are loaded
- `isEmpty`: Whether the collection is empty

#### Error Handling
- Use `tapResponse` for proper error handling in all async operations
- Set loading states appropriately for all operations
- Clear errors when starting new operations

### Step 3: Implementation Details

#### State Management
- Use `patchState` for all state updates
- Implement proper loading states for each operation
- Handle errors gracefully with user-friendly messages

#### Entity Operations
- Use atomic entity operations: `addEntity`, `updateEntity`, `removeEntity`, `setAllEntities`
- Pass `entityConfig` to all entity updaters for type safety
- Handle optimistic updates where appropriate

#### Service Integration
- Inject the service using `inject()` within `withMethods`
- Use `rxMethod` for all Observable-based operations
- Never convert Observables to Promises in store methods

### Step 4: Integration Guide
Provide example component integration showing:
- Store injection
- Signal binding in templates
- Method calls for CRUD operations
- Loading and error state handling

## File Structure

Create the following files in the appropriate domain folder:

```
src/app/[domain]/
├── data/
│   ├── [entity-name].ts        # HTTP service (if not exists)
│   └── [entity-name].spec.ts   # Service tests
├── feature/
│   ├── [entity-name]-store.ts          # Signal store
└── data/
    └── models/
        └── [entity-name].model.ts       # Entity model (reference)
```

## References

- [NgRx Signals Patterns](../instructions/ngrx-signals.instructions.md) - Complete NgRx Signals architecture and patterns
