# Angular Feature Development Prompt

## Goal

Develop a new feature in this Angular project according to the DDD architecture, TypeScript, and Angular guidelines. Each step must be completed and tested before proceeding to the next.

## Steps

1. **Set Up Folder Structure**

   - Create the required folder structure for the new feature under `src/app/<domain>/`:
     - `feature/` for feature components
     - `ui/` for presentational components
     - `data/` for data services and API clients
     - `util/` for utilities
   - Follow DDD and Sheriff module boundary rules.
   - Add an `index.ts` file for the public API in each subfolder.
   - **Write unit tests for any utility functions or helpers created. Only proceed when all tests pass.**

2. **Implement Data Services**

   - Implement all necessary data services in the `data/` folder.
   - Use Angular's function-based DI (`inject()`), strong typing, and error handling.
   - All data access must go through the API layer (no static/in-memory data).
   - Services must be covered by unit tests (AAA pattern, strong typing).
   - **Proceed only when all service tests are green.**

3. **Create Signal Store**

   - Create a strongly typed Signal Store in the `feature/` folder.
   - Use NgRx Signals Store patterns: `withState`, `withEntities`, `withMethods`, etc.
   - Configure entity adapters and state shape as required.
   - Write unit tests for the store, covering state, computed properties, and methods.
   - **Proceed only when all store tests are green.**

4. **Develop UI Components**

   - Build presentational components in the `ui/` folder.
   - Use signal-based inputs (`input()`, `model()`), Angular Material v3, and modern control flow (`@if`, `@for`).
   - Templates and styles must be in separate files.
   - Write unit tests for each UI component, covering all input/output and rendering logic.
   - **Continue only after all UI component tests pass.**

5. **Implement Feature Components**

   - Implement feature components in the `feature/` folder.
   - Compose UI components and connect to the Signal Store.
   - Handle loading, error, and empty states.
   - Use strong typing, OnPush change detection, and accessibility best practices.
   - Write unit tests for feature components, including integration with the store and UI components.
   - **Advance only when all feature component tests are green.**

6. **Finalization**
   - Ensure all code passes ESLint and Prettier checks.
   - Remove unused code and update documentation if needed.
   - Run the full test suite and verify all tests pass.

## References

- [Angular Guidelines](../guidelines/angular-guidelines.md)
- [TypeScript Guidelines](../guidelines/typescript-guidelines.md)
- [NgRx Signals Patterns](../guidelines/ngrx-signals-guidelines.md)
- [Architecture Guidelines](../guidelines/architecture-guidelines.md)

---

**Follow this workflow strictly: complete and test each step before moving to the next.**
