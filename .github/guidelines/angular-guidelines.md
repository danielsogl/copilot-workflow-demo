# Angular Guidelines

Use this guidelines when working with Angular related code.

## 1. Core Architecture

- **Standalone Components:** Components, directives, and pipes are standalone by default. The `standalone: true` flag is no longer required and should be omitted in new code (Angular v17+ and above).
- **Strong Typing:** TypeScript types, interfaces, and models provide type safety throughout the codebase
- **Single Responsibility:** Each component and service has a single, well-defined responsibility
- **Rule of One:** Files focus on a single concept or functionality
- **Reactive State:** Signals provide reactive and efficient state management
- **Dependency Injection:** Angular's DI system manages service instances
- **Function-Based DI:** Use function-based dependency injection with the `inject()` function instead of constructor-based injection in all new code. Example:

  ```typescript
  import { inject } from "@angular/core";
  import { HttpClient } from "@angular/common/http";

  export class MyService {
    private readonly http = inject(HttpClient);
    // ...
  }
  ```

- **Lazy Loading:** Deferrable Views and route-level lazy loading with `loadComponent` improve performance
- **Directive Composition:** The Directive Composition API enables reusable component behavior
- **Standalone APIs Only:** Do not use NgModules, CommonModule, or RouterModule. Import only required standalone features/components.
- **No Legacy Modules:** Do not use or generate NgModules for new features. Migrate existing modules to standalone APIs when possible.

## 2. Angular Style Guide Patterns

- **Code Size:** Files are limited to 400 lines of code
- **Single Purpose Files:** Each file defines one entity (component, service, etc.)
- **Naming Conventions:** Symbols have consistent, descriptive names
- **Folder Structure:** Code is organized by feature-based folders
- **File Separation:** Templates and styles exist in their own files for components
- **Property Decoration:** Input and output properties have proper decoration
- **Component Selectors:** Component selectors use custom prefixes and kebab-case (e.g., `app-feature-name`)
- **No CommonModule or RouterModule Imports:** Do not import CommonModule or RouterModule in standalone components. Import only the required standalone components, directives, or pipes.

## 3. Input Signal Patterns

- **Signal-Based Inputs:** The `input()` function creates InputSignals:

  ```typescript
  // Current pattern
  readonly value = input(0);  // Creates InputSignal

  // Legacy pattern
  @Input() value = 0;
  ```

- **Required Inputs:** The `input.required()` function marks inputs as mandatory:

  ```typescript
  readonly value = input.required<number>();
  ```

- **Input Transformations:** Transformations convert input values:

  ```typescript
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = input(0, { transform: numberAttribute });
  ```

- **Two-Way Binding:** Model inputs enable two-way binding:

  ```typescript
  readonly value = model(0);  // Creates a model input with change propagation

  // Model values update with .set() or .update()
  increment(): void {
    this.value.update(v => v + 1);
  }
  ```

- **Input Aliases:** Aliases provide alternative input names:
  ```typescript
  readonly value = input(0, { alias: "sliderValue" });
  ```

## 3a. Typed Reactive Forms

- **Typed Forms:** Always use strictly typed reactive forms by defining an interface for the form values and using `FormGroup<MyFormType>`, `FormBuilder.group<MyFormType>()`, and `FormControl<T>()`.
- **Non-Nullable Controls:** Prefer `nonNullable: true` for controls to avoid null issues and improve type safety.
- **Patch and Get Values:** Use `patchValue` and `getRawValue()` to work with typed form values.
- **Reference:** See the [Angular Typed Forms documentation](https://angular.dev/guide/forms/typed-forms) for details and examples.

## 4. Component Patterns

- **Naming Pattern:** Components follow consistent naming - `feature.type.ts` (e.g., `hero-list.component.ts`)
- **Template Extraction:** Non-trivial templates exist in separate `.html` files
- **Style Extraction:** Styles exist in separate `.css/.scss` files
- **Signal-Based Inputs:** Components use the `input()` function for inputs
- **Two-Way Binding:** Components use the `model()` function for two-way binding
- **Lifecycle Hooks:** Components implement appropriate lifecycle hook interfaces (OnInit, OnDestroy, etc.)
- **Element Selectors:** Components use element selectors (`selector: 'app-hero-detail'`)
- **Logic Delegation:** Services contain complex logic
- **Input Initialization:** Inputs have default values or are marked as required
- **Lazy Loading:** The `@defer` directive loads heavy components or features
- **Error Handling:** Try-catch blocks handle errors
- **Modern Control Flow:** Templates use `@if`, `@for`, `@switch` instead of structural directives
- **State Representation:** Components implement loading and error states
- **Derived State:** The `computed()` function calculates derived state
- **No NgModules:** Do not use or reference NgModules in new code.

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
  - Reference the [Angular Material documentation](https://material.angular.io) for usage patterns and updates.
- **CDK Utilities:** Use Angular CDK utilities for custom behaviors, overlays, accessibility, and testing harnesses.
- **Migration:** For legacy or custom components, migrate to Angular Material/CDK where feasible.

## 5b. Template Patterns

- **Modern Control Flow:** Use the new Angular control flow syntax: `@if`, `@for`, `@switch` in templates. Do not use legacy structural directives such as `*ngIf`, `*ngFor`, or `*ngSwitch`.
- **No Legacy Structural Directives:** Remove or migrate any usage of `*ngIf`, `*ngFor`, or `*ngSwitch` to the new control flow syntax in all new code. Legacy code should be migrated when touched.
- **Referencing Conditional Results:** When using `@if`, reference the result using the `as` keyword, e.g. `@if (user(); as u) { ... }`. This is the recommended pattern for accessing the value inside the block. See the [Angular documentation](https://angular.dev/guide/templates/control-flow#referencing-the-conditional-expressions-result) for details.

## 6. Service and DI Patterns

- **Service Declaration:** Services use the `@Injectable()` decorator with `providedIn: 'root'` for singletons
- **Data Services:** Data services handle API calls and data operations
- **Error Handling:** Services include error handling
- **DI Hierarchy:** Services follow the Angular DI hierarchy
- **Service Contracts:** Interfaces define service contracts
- **Focused Responsibilities:** Services focus on specific tasks
- **Function-Based DI:** Use function-based dependency injection with the `inject()` function instead of constructor-based injection in all new code. Example:

  ```typescript
  import { inject } from "@angular/core";
  import { HttpClient } from "@angular/common/http";

  export class MyService {
    private readonly http = inject(HttpClient);
    // ...
  }
  ```

## 7. Directive and Pipe Patterns

- **Attribute Directives:** Directives handle presentation logic without templates
- **Host Property:** The `host` property manages bindings and listeners:

  ```typescript
  @Directive({
    selector: '[appHighlight]',
    host: {
      // Host bindings
      '[class.highlighted]': 'isHighlighted',
      '[style.color]': 'highlightColor',

      // Host listeners
      '(click)': 'onClick($event)',
      '(mouseenter)': 'onMouseEnter()',
      '(mouseleave)': 'onMouseLeave()',

      // Static properties
      'role': 'button',
      '[attr.aria-label]': 'ariaLabel'
    }
  })
  ```

- **Selector Prefixes:** Directive selectors use custom prefixes
- **Pure Pipes:** Pipes are pure when possible for better performance
- **Pipe Naming:** Pipes follow camelCase naming conventions

## 8. State Management Patterns

- **Signals:** Signals serve as the primary state management solution
- **Component Inputs:** Signal inputs with `input()` handle component inputs
- **Two-Way Binding:** Model inputs with `model()` enable two-way binding
- **Local State:** Writable signals with `signal()` manage local component state
- **Derived State:** Computed signals with `computed()` calculate derived state
- **Side Effects:** The `effect()` function handles side effects
- **Error Handling:** Signal computations include error handling
- **Signal Conversion:** The `toSignal()` and `toObservable()` functions enable interoperability with RxJS

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

- **Change Detection:** Components use OnPush change detection strategy
- **Lazy Loading:** Routes and components load lazily
- **Virtual Scrolling:** Virtual scrolling renders long lists efficiently
- **Memoization:** Memoization optimizes expensive computations
- **Bundle Size:** Bundle size monitoring and optimization reduce load times
- **Server-Side Rendering:** SSR improves initial load performance
- **Web Workers:** Web workers handle intensive operations

## 11. Security Patterns

- **XSS Prevention:** User input undergoes sanitization
- **CSRF Protection:** CSRF tokens secure forms
- **Content Security Policy:** CSP headers restrict content sources
- **Authentication:** Secure authentication protects user accounts
- **Authorization:** Authorization checks control access
- **Sensitive Data:** Client-side code excludes sensitive data

## 12. Accessibility Patterns

- **ARIA Attributes:** ARIA attributes enhance accessibility
- **Keyboard Navigation:** Interactive elements support keyboard access
- **Color Contrast:** UI elements maintain proper color contrast ratios
- **Screen Readers:** Components work with screen readers
- **Focus Management:** Focus management guides user interaction
- **Alternative Text:** Images include alt text
