# Angular Standalone Migration Prompt

## Goal

Migrate only the provided legacy Angular files (using NgModules, CommonModule, or RouterModule) to the modern Angular Standalone API, following the latest Angular, project, and TypeScript guidelines.

## Instructions

1. **Preparation:**

   - Commit all work and use a clean git branch before starting.

2. **Automated Migration (Recommended):**

   - Run the official Angular schematic only on the files provided as context:
     ```sh
     ng g @angular/core:standalone --path <relative-path-to-file-or-folder>
     ```
   - Do not run the migration on the entire project. Only migrate the files explicitly provided as context.
   - Follow the prompts to:
     1. Convert all components, directives, and pipes in the provided files to standalone.
     2. Remove unnecessary NgModule classes in the provided files.
     3. Switch to the standalone bootstrapping API if the root module is included in the context.
   - See the official guide for details: https://angular.dev/reference/migrations/standalone

3. **Manual Migration Steps (for provided files):**

   - Remove all `@NgModule` classes and related metadata.
   - Move providers to `@Injectable({ providedIn: 'root' })` on services or to the `providers` property of components if needed.
   - Convert all components, directives, and pipes to standalone (remove `standalone: true` if Angular v17+; standalone is default).
   - Use only the required standalone imports in the `imports` property of the component/directive/pipe decorator. Do not import `CommonModule` or `RouterModule`.
   - Replace module imports with direct imports of standalone components, directives, and pipes.
   - For routing, use `loadComponent` for lazy loading and route-level code splitting.
   - Move non-trivial templates to `.html` files and styles to `.scss`/`.css` files. Use element selectors with custom prefixes (e.g., `app-feature-name`).
   - Replace legacy `@Input()` and `@Output()` with the `input()` and `model()` functions for signal-based inputs and two-way binding. Use `input.required<T>()` for required inputs.
   - Replace all legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) with the new control flow syntax (`@if`, `@for`, `@switch`). Reference conditional results using the `as` keyword (e.g., `@if (user(); as u) { ... }`).
   - Use signals for local/component state. For shared/complex state, use NgRx Signals Store with strong typing and recommended patterns.
   - Update or add unit tests to cover migrated code, using strong typing and the AAA pattern.
   - Ensure all UI components meet accessibility standards and use Angular Material v3 for standard UI components and theming.

4. **After Migration:**

   - Remove any remaining NgModule declarations manually if needed.
   - Run all unit tests and fix any failures.
   - Run code formatters and linters, and fix any warnings or errors.

5. **References:**
   - [Official Angular Standalone Migration Guide](https://angular.dev/reference/migrations/standalone)
   - [Angular Guidelines](../guidelines/angular-guidelines.md)
   - [TypeScript Guidelines](../guidelines/typescript-guidelines.md)

---

### Example Migration Steps

1. **Before (NgModule-based):**

```typescript
@NgModule({
  declarations: [UserListComponent],
  imports: [CommonModule, RouterModule],
  exports: [UserListComponent],
})
export class UserModule {}
```

2. **After (Standalone):**

```typescript
// user-list.component.ts
@Component({
  selector: "app-user-list",
  imports: [MatListModule],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
})
export class UserListComponent {}
```

---

**Always follow the latest Angular, TypeScript, and project guidelines. For more, see:**

- [Official Angular Standalone Migration Guide](https://angular.dev/reference/migrations/standalone)
- [Angular Guidelines](../guidelines/angular-guidelines.md)
- [TypeScript Guidelines](../guidelines/typescript-guidelines.md)
