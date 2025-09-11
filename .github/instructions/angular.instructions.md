---
applyTo: "**/*.ts, **/*.html, **/*.scss"
---

## 1. Core Architecture

- **Standalone Components:** Components, directives, and pipes are standalone by default. Do NOT set `standalone: true` in decorators as it's the default behavior.
- **Strong Typing:** Use strict TypeScript type checking, prefer type inference when obvious, avoid `any` type - use `unknown` when uncertain
- **Single Responsibility:** Each component and service has a single, well-defined responsibility
- **Rule of One:** Files focus on a single concept or functionality
- **Reactive State:** Signals provide reactive and efficient state management for all state
- **Function-Based DI:** Use the `inject()` function instead of constructor-based injection in all new code:

  ```typescript
  import { inject } from "@angular/core";
  import { HttpClient } from "@angular/common/http";

  export class MyService {
    private readonly http = inject(HttpClient);
    // ...
  }
  ```

- **Lazy Loading:** Use deferrable views with `@defer` blocks and route-level lazy loading with `loadComponent`
- **No NgModules:** Do NOT use NgModules for new features. Always use standalone components, directives, and pipes
- **No Legacy Imports:** Do not import CommonModule, RouterModule, or other NgModule-based APIs. Import only required standalone features
- **OnPush Strategy:** Set `changeDetection: ChangeDetectionStrategy.OnPush` in all components

## 2. Angular Style Guide Patterns

- **Code Size:** Files are limited to 400 lines of code
- **Single Purpose Files:** Each file defines one entity (component, service, etc.)
- **Naming Conventions:** Symbols have consistent, descriptive names
- **Folder Structure:** Code is organized by feature-based folders
- **File Separation:** Templates and styles exist in their own files for components
- **Property Decoration:** Input and output properties have proper decoration
- **Component Selectors:** Component selectors use custom prefixes and kebab-case (e.g., `app-feature-name`)
- **No CommonModule or RouterModule Imports:** Do not import CommonModule or RouterModule in standalone components. Import only the required standalone components, directives, or pipes.

## 3. Input and Output Patterns

- **Function-Based Inputs:** Use the `input()` function instead of `@Input()` decorator:

  ```typescript
  // Modern pattern - required input
  readonly value = input.required<number>();

  // Modern pattern - optional input with default
  readonly disabled = input(false);

  // Legacy pattern - avoid
  @Input() value = 0;
  ```

- **Input Transformations:** Apply transformations to convert input values:

  ```typescript
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = input(0, { transform: numberAttribute });
  ```

- **Two-Way Binding:** Use `model()` for two-way binding instead of separate input/output:

  ```typescript
  readonly value = model(0);  // Creates a model input with change propagation

  // Update model values with .set() or .update()
  increment(): void {
    this.value.update(v => v + 1);
  }
  ```

- **Function-Based Outputs:** Use the `output()` function instead of `@Output()` decorator:

  ```typescript
  // Modern pattern
  readonly click = output<void>();
  readonly valueChange = output<number>();

  // Legacy pattern - avoid
  @Output() click = new EventEmitter<void>();
  ```

- **Input Aliases:** Use aliases when needed:
  ```typescript
  readonly value = input(0, { alias: "sliderValue" });
  ```

## 3a. Typed Reactive Forms

- **Typed Forms:** Always use strictly typed reactive forms by defining an interface for the form values and using `FormGroup<MyFormType>`, `FormBuilder.group<MyFormType>()`, and `FormControl<T>()`.
- **Non-Nullable Controls:** Prefer `nonNullable: true` for controls to avoid null issues and improve type safety.
- **Patch and Get Values:** Use `patchValue` and `getRawValue()` to work with typed form values.

## 4. Component Patterns

- **Naming Pattern:** Components follow consistent naming - `feature.type.ts` (e.g., `hero-list.component.ts`)
- **Template Size:** Keep templates small and focused. Use inline templates only for very simple components
- **Style Extraction:** Styles exist in separate `.css/.scss` files for maintainability
- **Function-Based Inputs/Outputs:** Use `input()` and `output()` functions instead of decorators
- **Two-Way Binding:** Use `model()` for two-way binding scenarios
- **Change Detection:** Always set `changeDetection: ChangeDetectionStrategy.OnPush`
- **Element Selectors:** Use element selectors (`selector: 'app-hero-detail'`)
- **Logic Delegation:** Delegate complex logic to services, keep components lean
- **Signal State:** Use `signal()` for local component state, `computed()` for derived state
- **Modern Control Flow:** Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- **Class Bindings:** Use `[class.className]` instead of `ngClass`
- **Style Bindings:** Use `[style.property]` instead of `ngStyle`
- **Deferred Loading:** Use `@defer` blocks for heavy components and features
- **Error Handling:** Implement loading and error states appropriately
- **No Host Decorators:** Use `host` object in component decorator instead of `@HostBinding`/`@HostListener`
- **NgOptimizedImage:** Use `NgOptimizedImage` for all static images (not inline base64)

## 5. Styling Patterns

- **Component Encapsulation:** Components use scoped styles with proper encapsulation
- **CSS Methodology:** BEM methodology guides CSS class naming when not using Angular Material
- **Component Libraries:** Angular Material or other component libraries provide consistent UI elements
- **Theming:** Color systems and theming enable consistent visual design
- **Accessibility:** Components follow a11y standards
- **Dark Mode:** Components support dark mode where appropriate

## 5a. Angular Material and Angular CDK Usage

- **Standard UI Library:** Use Angular Material v3 for all standard UI components (buttons, forms, navigation, dialogs, etc.) to ensure consistency, accessibility, and alignment with Angular best practices.
- **Component Development:** Build new UI components and features using Angular Material components as the foundation. Only create custom components when Material does not provide a suitable solution.
- **Behavioral Primitives:** Use Angular CDK for advanced behaviors (drag-and-drop, overlays, accessibility, virtual scrolling, etc.) and for building custom components that require low-level primitives.
- **Theming:** Leverage Angular Material's theming system for consistent color schemes, dark mode support, and branding. Define and use custom themes in `styles.scss` or feature-level styles as needed.
- **Accessibility:** All UI components must meet accessibility (a11y) standards. Prefer Material components for built-in a11y support. When using CDK or custom components, follow WCAG and ARIA guidelines.
- **Best Practices:**
  - Prefer Material's layout and typography utilities for spacing and text.
  - Use Material icons and fonts for visual consistency.
  - Avoid mixing multiple UI libraries in the same project.
- **CDK Utilities:** Use Angular CDK utilities for custom behaviors, overlays, accessibility, and testing harnesses.
- **Migration:** For legacy or custom components, migrate to Angular Material/CDK where feasible.

## 5b. Template Patterns

- **Modern Control Flow:** ALWAYS use the new Angular control flow syntax: `@if`, `@for`, `@switch` in templates. NEVER use legacy structural directives `*ngIf`, `*ngFor`, or `*ngSwitch`.

  ```html
  <!-- Modern - REQUIRED -->
  @if (user(); as currentUser) {
  <p>Welcome, {{ currentUser.name }}!</p>
  } @for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
  } @switch (status()) { @case ('loading') {
  <spinner />
  } @case ('error') {
  <error-message />
  } @default {
  <content />
  } }

  <!-- Legacy - FORBIDDEN -->
  <p *ngIf="user$ | async as currentUser">Welcome, {{ currentUser.name }}!</p>
  <div *ngFor="let item of items; trackBy: trackByFn">{{ item.name }}</div>
  ```

- **Conditional Value Access:** When using `@if`, reference the result using the `as` keyword for safe access within the block
- **Track Functions:** Always provide track functions in `@for` loops for performance
- **Async Pipe Usage:** Use async pipe to handle observables in templates, especially with `@if` blocks
- **Template Simplicity:** Keep templates simple and avoid complex logic - delegate to component methods or computed signals

## 6. Service and DI Patterns

- **Service Declaration:** Services use the `@Injectable()` decorator with `providedIn: 'root'` for singletons
- **Function-Based DI:** ALWAYS use the `inject()` function instead of constructor-based injection:

  ```typescript
  import { inject } from "@angular/core";
  import { HttpClient } from "@angular/common/http";

  @Injectable({ providedIn: "root" })
  export class DataService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    // Methods here...
  }
  ```

- **Data Services:** Data services handle API calls and data operations with proper error handling
- **Service Hierarchy:** Services follow the Angular DI hierarchy and use appropriate providers
- **Service Contracts:** Use TypeScript interfaces to define service contracts
- **Focused Responsibilities:** Services focus on specific, single tasks
- **Signal Integration:** Services can expose signals for reactive state management
- **Error Handling:** Services include comprehensive error handling and recovery strategies

## 7. Directive and Pipe Patterns

- **Attribute Directives:** Directives handle presentation logic without templates and are standalone by default
- **Host Property:** Use the `host` object instead of `@HostBinding` and `@HostListener` decorators:

  ```typescript
  @Directive({
    selector: "[appHighlight]",
    host: {
      // Host bindings
      "[class.highlighted]": "isHighlighted",
      "[style.color]": "highlightColor",

      // Host listeners
      "(click)": "onClick($event)",
      "(mouseenter)": "onMouseEnter()",
      "(mouseleave)": "onMouseLeave()",

      // Static properties
      role: "button",
      "[attr.aria-label]": "ariaLabel",
    },
  })
  export class HighlightDirective {
    // Use inject() for dependencies
    private readonly renderer = inject(Renderer2);
    private readonly el = inject(ElementRef);
  }
  ```

- **Directive Selectors:** Use custom prefixes in directive selectors for clarity
- **Pure Pipes:** Make pipes pure when possible for better performance
- **Pipe Naming:** Follow camelCase naming conventions for pipes
- **Function-Based DI:** Use `inject()` function in directives and pipes instead of constructor injection

## 8. State Management Patterns

- **Signals-First:** Signals serve as the primary state management solution for all application state
- **Local State:** Use writable signals with `signal()` for local component state:

  ```typescript
  @Component({
    /*...*/
  })
  export class MyComponent {
    private readonly count = signal(0);
    private readonly loading = signal(false);

    increment() {
      this.count.update((c) => c + 1);
    }
  }
  ```

- **Derived State:** Use computed signals with `computed()` for derived state that depends on other signals:

  ```typescript
  readonly isEven = computed(() => this.count() % 2 === 0);
  readonly displayText = computed(() =>
    this.loading() ? 'Loading...' : `Count: ${this.count()}`
  );
  ```

- **Component Inputs:** Use signal inputs with `input()` for reactive component inputs
- **Two-Way Binding:** Use model inputs with `model()` for two-way binding scenarios
- **Side Effects:** Use the `effect()` function for side effects that depend on signal changes
- **Signal Updates:** Use `set()` for replacing values, `update()` for transforming values - NEVER use `mutate()`
- **Error Handling:** Handle errors in signal computations and effects appropriately
- **Observable Interop:** Use `toSignal()` and `toObservable()` for RxJS interoperability when needed
- **Linked Signals:** Use `linkedSignal()` for complex state relationships and dependent updates

## 9. Testing Patterns

- **Test Coverage:** Tests cover components and services
- **Unit Tests:** Focused unit tests verify services, pipes, and components
- **Component Testing:** TestBed and component harnesses test components
- **Mocking:** Tests use mocking techniques for dependencies
- **Test Organization:** Tests follow the AAA pattern (Arrange, Act, Assert)
- **Test Naming:** Tests have descriptive names that explain the expected behavior
- **Playwright Usage:** Playwright handles E2E testing with fixtures and test isolation
- **Test Environment:** Test environments match production as closely as possible

## 10. Performance Patterns

- **OnPush Strategy:** ALWAYS use `changeDetection: ChangeDetectionStrategy.OnPush` for all components
- **Signal-Driven Updates:** Leverage signals for efficient, targeted updates instead of zone-based change detection
- **Lazy Loading:** Use route-level lazy loading with `loadComponent` and `@defer` blocks for code splitting
- **Virtual Scrolling:** Use Angular CDK Virtual Scrolling for large lists to improve performance
- **Image Optimization:** Use `NgOptimizedImage` for all static images with proper loading strategies
- **Bundle Optimization:** Monitor and optimize bundle sizes with build analysis tools
- **Track Functions:** Always provide track functions in `@for` loops for efficient list updates:

  ```html
  @for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
  }
  ```

- **Computed Caching:** Use `computed()` signals to cache expensive calculations
- **Effect Cleanup:** Properly clean up effects and subscriptions to prevent memory leaks
- **Preloading:** Configure route preloading strategies for better perceived performance
- **Server-Side Rendering:** Implement SSR/SSG for improved initial load performance when needed

## 11. Security Patterns

- **XSS Prevention:** User input undergoes sanitization
- **CSRF Protection:** CSRF tokens secure forms
- **Content Security Policy:** CSP headers restrict content sources
- **Authentication:** Secure authentication protects user accounts
- **Authorization:** Authorization checks control access
- **Sensitive Data:** Client-side code excludes sensitive data

## 12. Accessibility Patterns

- **ARIA Attributes:** ARIA attributes enhance accessibility and are properly applied
- **Keyboard Navigation:** All interactive elements support keyboard access and focus management
- **Color Contrast:** UI elements maintain WCAG-compliant color contrast ratios
- **Screen Readers:** Components work seamlessly with screen readers and assistive technologies
- **Focus Management:** Proper focus management guides user interaction and navigation
- **Alternative Text:** All images include descriptive alt text for accessibility
- **Angular CDK A11y:** Use Angular CDK accessibility utilities for consistent a11y implementation
- **Semantic HTML:** Use semantic HTML elements for better accessibility and SEO
