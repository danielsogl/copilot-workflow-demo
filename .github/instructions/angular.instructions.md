---
description: "Angular v20+ patterns including standalone components, signals, modern control flow, naming conventions, and best practices from angular.dev/style-guide"
applyTo: "**/*.ts, **/*.html, **/*.scss"
---

# Angular Development Guide

This guide covers Angular coding patterns, style conventions, and best practices based on the official Angular style guide at https://angular.dev/style-guide.

> **Note:** When in doubt, prefer consistency with the existing codebase over these recommendations.

## 1. Core Architecture

- **Standalone Components:** Components, directives, and pipes are standalone by default. Do NOT set `standalone: true` in decorators as it's the default behavior.
- **Strong Typing:** Use strict TypeScript type checking, prefer type inference when obvious, avoid `any` type - use `unknown` when uncertain
- **Single Responsibility:** Each component and service has a single, well-defined responsibility
- **Rule of One:** Files focus on a single concept or functionality
- **Reactive State:** Signals provide reactive and efficient state management for all state
- **Lazy Loading:** Use deferrable views with `@defer` blocks and route-level lazy loading with `loadComponent`
- **No NgModules:** Do NOT use NgModules for new features. Always use standalone components, directives, and pipes
- **No Legacy Imports:** Do not import CommonModule, RouterModule, or other NgModule-based APIs. Import only required standalone features
- **OnPush Strategy:** Set `changeDetection: ChangeDetectionStrategy.OnPush` in all components

## 2. Naming Conventions

### File Naming

- **Separate words with hyphens:** Use hyphens to separate words in file names (kebab-case)
  - Example: `user-profile.ts`, `task-list.ts`

- **Match file names to TypeScript identifiers:** File names should describe the contents and match the primary class name
  - Example: Class named `UserProfile` → file name `user-profile.ts`

- **Test files:** End unit test file names with `.spec.ts`
  - Example: `user-profile.spec.ts` for testing `user-profile.ts`

- **Component files:** Use the same name for TypeScript, template, and styles with different extensions
  ```
  user-profile.ts
  user-profile.html
  user-profile.scss
  ```

- **Avoid generic names:** Do not use generic names like `helpers.ts`, `utils.ts`, or `common.ts`

### Class Naming

- **No type suffixes:** Use `PascalCase` WITHOUT type suffixes
  - Do NOT include suffixes like `Component`, `Service`, `Directive`, `Pipe`, `Guard`, etc.
  - The Angular decorator (`@Component`, `@Injectable`, `@Directive`, `@Pipe`) already indicates the type
  - Example: `UserProfile`, `TaskList`, `Auth`, `Highlight`, `DateFormat`
  - Avoid: `UserProfileComponent`, `AuthService`, `HighlightDirective`, `DateFormatPipe`

### Other Identifiers

- **Properties and Methods:** Use `camelCase`
  - Example: `userName`, `isActive`, `getUserData()`

- **Constants:** Use `UPPER_SNAKE_CASE`
  - Example: `MAX_RETRIES`, `DEFAULT_TIMEOUT`

- **Event Handlers:** Name for the action they perform, not the triggering event
  - Prefer: `saveUserData()`, `commitNotes()`
  - Avoid: `handleClick()`, `onKeydown()`

### Component Selectors

- Use application-specific prefixes for component selectors with kebab-case
- Example: `app-user-profile`, `app-task-list`

### Directive Selectors

- Use the same application-specific prefix as components
- Use `camelCase` for attribute selectors
- Example: `[appTooltip]`, `[appHighlight]`

## 3. Project Structure

> **Note:** For detailed DDD folder organization, see `architecture.instructions.md`

- **All UI code goes in `src`:** Keep Angular UI code (TypeScript, HTML, styles) in `src`
- **Bootstrap in `main.ts`:** The application entry point should always be `src/main.ts`
- **Group related files together:** Components consist of TypeScript, template, and style files grouped in the same directory
- **Unit tests alongside code:** Test files should live in the same directory as the code being tested
- **Each construct in its own subfolder:** Every component, directive, pipe, and service must be in its own named subfolder
  - Example: `user-profile/user-profile.ts`, not `user-profile.ts` directly in a parent folder
- **Organize by feature areas:** Structure the project by business features, not by code type
  - Prefer: `src/app/user/`, `src/app/tasks/`
  - Avoid: `src/app/components/`, `src/app/services/`
- **One concept per file:** Each file should focus on a single concept (typically one component, directive, or service per file)

## 4. Dependency Injection

- **Function-Based DI:** ALWAYS use the `inject()` function instead of constructor-based injection:

  ```typescript
  import { inject } from "@angular/core";
  import { HttpClient } from "@angular/common/http";

  @Injectable({ providedIn: "root" })
  export class UserApi {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
  }
  ```

- **Advantages of `inject()`:**
  - More readable, especially with many dependencies
  - Better type inference
  - Allows for comments on injected dependencies
  - Cleaner syntax with modern TypeScript

- **Service Declaration:** Services use `@Injectable()` decorator with `providedIn: 'root'` for singletons

## 5. Input and Output Patterns

### Function-Based Inputs

Use the `input()` function instead of `@Input()` decorator:

```typescript
// Required input
readonly value = input.required<number>();

// Optional input with default
readonly disabled = input(false);

// Input with transformation
readonly disabled = input(false, { transform: booleanAttribute });
readonly value = input(0, { transform: numberAttribute });

// Input with alias
readonly value = input(0, { alias: "sliderValue" });
```

### Function-Based Outputs

Use the `output()` function instead of `@Output()` decorator:

```typescript
// Modern pattern
readonly click = output<void>();
readonly valueChange = output<number>();

// Emit events
this.valueChange.emit(42);
```

### Two-Way Binding

Use `model()` for two-way binding instead of separate input/output:

```typescript
readonly value = model(0);  // Creates a model input with change propagation

// Update model values with .set() or .update()
increment(): void {
  this.value.update(v => v + 1);
}
```

## 6. Component Patterns

- **Change Detection:** Always set `changeDetection: ChangeDetectionStrategy.OnPush`
- **Element Selectors:** Use element selectors (`selector: 'app-hero-detail'`)
- **Template Size:** Keep templates small and focused. Use inline templates only for very simple components
- **Style Extraction:** Styles exist in separate `.css/.scss` files for maintainability
- **Logic Delegation:** Delegate complex logic to services, keep components lean
- **Signal State:** Use `signal()` for local component state, `computed()` for derived state
- **No Host Decorators:** Use `host` object in component decorator instead of `@HostBinding`/`@HostListener`
- **NgOptimizedImage:** Use `NgOptimizedImage` for all static images (not inline base64)

### Property Organization

Group Angular-specific properties at the top:
1. Injected dependencies
2. Input properties
3. Output properties
4. Queries (`viewChild`, `contentChild`, etc.)
5. Then define other properties and methods

```typescript
@Component({
  template: `<p>{{ fullName() }}</p>`,
})
export class UserProfile {
  // Dependencies first
  private readonly userApi = inject(UserApi);

  // Inputs
  readonly firstName = input.required<string>();
  readonly lastName = input.required<string>();

  // Outputs
  readonly saved = output<void>();

  // Computed/derived state
  protected readonly fullName = computed(() =>
    `${this.firstName()} ${this.lastName()}`
  );
}
```

### Use `readonly` and `protected`

- Use `readonly` for Angular-managed properties (inputs, outputs, models)
- Use `protected` for template-accessed members that shouldn't be public API

### Lifecycle Hooks

- Keep lifecycle hooks simple - extract complex logic into well-named methods
- Implement lifecycle hook interfaces (`OnInit`, `OnDestroy`, etc.)

```typescript
export class UserProfile implements OnInit, OnDestroy {
  ngOnInit() {
    this.startLogging();
    this.runBackgroundTask();
  }
}
```

## 7. Template Patterns

### Modern Control Flow (Required)

ALWAYS use the new Angular control flow syntax. NEVER use legacy structural directives.

```html
<!-- Modern - REQUIRED -->
@if (user(); as currentUser) {
  <p>Welcome, {{ currentUser.name }}!</p>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

@switch (status()) {
  @case ('loading') { <spinner /> }
  @case ('error') { <error-message /> }
  @default { <content /> }
}

<!-- Legacy - FORBIDDEN -->
<p *ngIf="user$ | async as currentUser">...</p>
<div *ngFor="let item of items; trackBy: trackByFn">...</div>
```

### Best Practices

- **Track Functions:** Always provide track functions in `@for` loops for performance
- **Conditional Access:** Use `as` keyword with `@if` for safe value access
- **Async Pipe:** Use async pipe to handle observables in templates
- **Template Simplicity:** Keep templates simple - delegate complex logic to computed signals or methods
- **Class Bindings:** Use `[class.className]` instead of `ngClass`
- **Style Bindings:** Use `[style.property]` instead of `ngStyle`

```html
<!-- Prefer -->
<div [class.admin]="isAdmin()" [class.dense]="density() === 'high'">
<div [style.color]="textColor()">

<!-- Avoid -->
<div [ngClass]="{admin: isAdmin, dense: density === 'high'}">
```

## 8. Directive and Pipe Patterns

### Directives

- Directives handle presentation logic without templates and are standalone by default
- Use the `host` object instead of `@HostBinding` and `@HostListener`:

```typescript
@Directive({
  selector: "[appHighlight]",
  host: {
    "[class.highlighted]": "isHighlighted",
    "[style.color]": "highlightColor",
    "(click)": "onClick($event)",
    "(mouseenter)": "onMouseEnter()",
    role: "button",
    "[attr.aria-label]": "ariaLabel",
  },
})
export class Highlight {
  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);
}
```

### Pipes

- Make pipes pure when possible for better performance
- Follow camelCase naming conventions for pipe names
- Use `inject()` function for dependencies

## 9. Service Patterns

- **Data Services:** Handle API calls and data operations with proper error handling
- **Service Hierarchy:** Follow the Angular DI hierarchy and use appropriate providers
- **Service Contracts:** Use TypeScript interfaces to define service contracts
- **Focused Responsibilities:** Services focus on specific, single tasks
- **Signal Integration:** Services can expose signals for reactive state management
- **Error Handling:** Include comprehensive error handling and recovery strategies

## 10. State Management Patterns

- **Signals-First:** Signals serve as the primary state management solution

```typescript
@Component({ /* ... */ })
export class Counter {
  // Local state
  private readonly count = signal(0);
  private readonly loading = signal(false);

  // Derived state
  readonly isEven = computed(() => this.count() % 2 === 0);
  readonly displayText = computed(() =>
    this.loading() ? 'Loading...' : `Count: ${this.count()}`
  );

  increment() {
    this.count.update(c => c + 1);
  }
}
```

- **Signal Updates:** Use `set()` for replacing values, `update()` for transforming - NEVER use `mutate()`
- **Side Effects:** Use `effect()` for side effects that depend on signal changes
- **Observable Interop:** Use `toSignal()` and `toObservable()` for RxJS interoperability
- **Linked Signals:** Use `linkedSignal()` for complex state relationships

## 11. Styling Patterns

- **Component Encapsulation:** Use scoped styles with proper encapsulation
- **CSS Methodology:** BEM methodology guides CSS class naming when not using Angular Material
- **Theming:** Use Angular Material's theming system for consistent color schemes
- **Accessibility:** Components follow a11y standards
- **Dark Mode:** Support dark mode where appropriate

### Angular Material and CDK

- **Standard UI Library:** Use Angular Material v3 for all standard UI components
- **Behavioral Primitives:** Use Angular CDK for advanced behaviors (drag-and-drop, overlays, virtual scrolling)
- **Theming:** Leverage Material's theming system for consistent branding
- **Accessibility:** Prefer Material components for built-in a11y support
- **Best Practices:**
  - Use Material's layout and typography utilities
  - Use Material icons and fonts
  - Avoid mixing multiple UI libraries

## 12. Forms

For all forms, refer to `angular-signal-forms.instructions.md` which provides comprehensive guidance on using Angular Signal Forms with schema validation.

## 13. Testing Patterns

- **Test Coverage:** Tests cover components and services
- **Unit Tests:** Focused unit tests verify services, pipes, and components
- **Component Testing:** TestBed and component harnesses test components
- **Mocking:** Tests use mocking techniques for dependencies
- **Test Organization:** Tests follow the AAA pattern (Arrange, Act, Assert)
- **Test Naming:** Tests have descriptive names that explain expected behavior
- **Playwright:** Playwright handles E2E testing with fixtures and test isolation

## 14. Performance Patterns

- **OnPush Strategy:** ALWAYS use `changeDetection: ChangeDetectionStrategy.OnPush`
- **Signal-Driven Updates:** Leverage signals for efficient, targeted updates
- **Lazy Loading:** Use route-level lazy loading with `loadComponent` and `@defer` blocks
- **Virtual Scrolling:** Use Angular CDK Virtual Scrolling for large lists
- **Image Optimization:** Use `NgOptimizedImage` with proper loading strategies
- **Track Functions:** Always provide track functions in `@for` loops
- **Computed Caching:** Use `computed()` to cache expensive calculations
- **Effect Cleanup:** Properly clean up effects and subscriptions

## 15. Security Patterns

- **XSS Prevention:** User input undergoes sanitization
- **CSRF Protection:** CSRF tokens secure forms
- **Content Security Policy:** CSP headers restrict content sources
- **Authentication:** Secure authentication protects user accounts
- **Authorization:** Authorization checks control access
- **Sensitive Data:** Client-side code excludes sensitive data

## 16. Accessibility Patterns

- **ARIA Attributes:** Properly apply ARIA attributes
- **Keyboard Navigation:** All interactive elements support keyboard access
- **Color Contrast:** Maintain WCAG-compliant color contrast ratios
- **Screen Readers:** Components work with assistive technologies
- **Focus Management:** Proper focus management guides navigation
- **Alternative Text:** All images include descriptive alt text
- **Angular CDK A11y:** Use CDK accessibility utilities
- **Semantic HTML:** Use semantic HTML elements
