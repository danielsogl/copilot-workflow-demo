---
description: A reusable prompt for generating Angular Signal Forms with complete validation and dynamic field management for a specified entity.
name: angular-signal-forms-generator
agent: agent
tools: ['edit', 'search', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTests', 'search/usages', 'read/problems', 'todo', 'context7/*', 'angular-cli/*']
---

# Angular Signal Forms Generator

## Goal

Generate a complete Angular Signal Form with schema validation, error handling, and dynamic field management for a specified entity, following the project's architecture patterns and modern Angular Signal Forms API with built-in schema validation.

> **Important**: This prompt follows the patterns defined in `angular-signal-forms.instructions.md`. Review that file for comprehensive Signal Forms patterns, schema validation approaches, and best practices before generating forms.

## Prerequisites

Before running this prompt, ensure you have:

1. **Entity Definition**: The target entity model must be defined and linked in the chat context
2. **Form Purpose**: Specify the form's purpose (e.g., "User Registration", "Task Creation", "Profile Update")
3. **Form Type**: Indicate if it's a create, edit, or multi-purpose form
4. **Field Requirements**: Any specific field requirements or validation rules

## Instructions

### Step 1: Entity and Requirements Analysis

- Analyze the provided entity model to understand its structure, types, and relationships
- Identify which fields should be included in the form (some entity fields might be auto-generated or readonly)
- Determine appropriate input types for each field (text, email, number, date, select, checkbox, etc.)
- Check for any existing validation patterns or business rules in the codebase
- Identify nested objects and array fields that require dynamic management

### Step 2: Form Component Generation

Generate a complete Angular Signal Form component with schema validation:

#### Core Imports and Dependencies
```typescript
import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import {
  form,
  schema,
  FormField,
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  applyEach,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

// Material 21+: import individual components, not *Module umbrellas
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
```

#### Form Definition with Inline Schema

Define the form by passing the model signal and a schema function directly to `form()`. The schema function receives a `fieldPath` for type-safe validator wiring:

```typescript
interface [EntityType] {
  name: string;
  email: string;
  description?: string;
  address: {
    street: string;
    city: string;
  };
  tags: string[];
}

const EMPTY_[ENTITY_NAME]: [EntityType] = {
  name: '',
  email: '',
  description: '',
  address: { street: '', city: '' },
  tags: [],
};
```

#### Component Structure
```typescript
@Component({
  selector: 'app-[entity-name]-form',
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardContent,
    MatButton,
    MatFormField, MatLabel, MatError,
    MatInput,
    MatSelect, MatOption,
    MatCheckbox,
    MatDatepicker, MatDatepickerInput, MatDatepickerToggle,
    FormField,
    JsonPipe,
  ],
  templateUrl: './[entity-name]-form.html',
  styleUrl: './[entity-name]-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class [EntityName]Form {
  // Signal-backed form model
  protected readonly [entityName]Model = signal<[EntityType]>(EMPTY_[ENTITY_NAME]);

  // Validation schema (defined at module level for reuse and memoization)
  private readonly [entityName]Schema = schema<[EntityType]>((f) => {
    required(f.name, { message: 'Name is required' });
    minLength(f.name, 2, { message: 'Name must be at least 2 characters' });

    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Enter a valid email address' });

    maxLength(f.description, 500, { message: 'Description cannot exceed 500 characters' });

    // Nested objects
    required(f.address.street, { message: 'Street is required' });
    required(f.address.city, { message: 'City is required' });

    // Arrays
    applyEach(f.tags, (tag) => {
      minLength(tag, 1, { message: 'Tag cannot be empty' });
    });
  });

  // Form with schema
  protected readonly [entityName]Form = form(this.[entityName]Model, this.[entityName]Schema);

  // Computed form state — dirty check at field level, not form level
  protected readonly canSubmit = computed(() =>
    this.[entityName]Form().valid() &&
    (this.[entityName]Form.name().dirty() || this.[entityName]Form.email().dirty()),
  );

  protected onSubmit(): void {
    if (!this.canSubmit()) return;
    const value = this.[entityName]Model();
    // ... call store / API
  }
}
```

### Step 3: Template Generation

Create a comprehensive template with modern Angular patterns:

#### Form Structure
```html
<mat-card>
  <mat-card-header>
    <mat-card-title>[Form Title]</mat-card-title>
  </mat-card-header>

  <mat-card-content>
    <form (ngSubmit)="onSubmit()">
      <!-- Form fields based on entity structure -->
    </form>
  </mat-card-content>
</mat-card>
```

#### Field Templates
For each entity field, generate appropriate input with validation:

**Text/Email Fields:**
```html
<mat-form-field class="w-full">
  <mat-label>[Field Label]</mat-label>
  <input matInput [formField]="[entityName]Form.[fieldName]" placeholder="[Placeholder]">
  @if([entityName]Form.[fieldName]().touched() || [entityName]Form.[fieldName]().dirty()) {
    @for (error of [entityName]Form.[fieldName]().errors(); track error.kind) {
      <mat-error>{{ error.message }}</mat-error>
    }
  }
</mat-form-field>
```

**Select Fields:**
```html
<mat-form-field class="w-full">
  <mat-label>[Field Label]</mat-label>
  <mat-select [formField]="[entityName]Form.[fieldName]">
    @for (option of [options]; track option.value) {
      <mat-option [value]="option.value">{{ option.label }}</mat-option>
    }
  </mat-select>
  @if([entityName]Form.[fieldName]().touched() || [entityName]Form.[fieldName]().dirty()) {
    @for (error of [entityName]Form.[fieldName]().errors(); track error.kind) {
      <mat-error>{{ error.message }}</mat-error>
    }
  }
</mat-form-field>
```

**Dynamic Array Fields:**
```html
<div class="array-field-section">
  <h3>[Array Field Label]</h3>
  @for (item of [entityName]Form.[arrayField]; track item; let i = $index) {
    <mat-card class="mb-4">
      <!-- Array item fields -->
      <button mat-icon-button color="warn" type="button" (click)="remove[ArrayItem](i)">
        <mat-icon>delete</mat-icon>
      </button>
    </mat-card>
  }
  @empty {
    <p class="text-muted">No [items] added yet.</p>
  }
  <button mat-stroked-button type="button" (click)="add[ArrayItem]()">
    <mat-icon>add</mat-icon> Add [Item]
  </button>
</div>
```

### Step 4: Component Methods Implementation

#### Dynamic Field Management
Implement methods for adding/removing dynamic fields:

```typescript
add[ArrayItem](): void {
  this.[entityName].update(state => ({
    ...state,
    [arrayField]: [...state.[arrayField], {
      // Default values for new item
    }]
  }));
}

remove[ArrayItem](index: number): void {
  this.[entityName].update(state => ({
    ...state,
    [arrayField]: state.[arrayField].filter((_, i) => i !== index)
  }));
}
```

#### Form Submission
```typescript
onSubmit(): void {
  if (this.[entityName]Form().valid()) {
    const formData = this.[entityName]();
    console.log('Form submitted with valid data:', formData);

    // Handle form submission (emit event, call service, etc.)
    this.handleFormSubmit(formData);
  } else {
    // Mark all fields as touched to show validation errors
    this.markAllFieldsTouched();
  }
}

private handleFormSubmit(data: [EntityType]): void {
  // Emit to parent component or call service
  this.formSubmit.emit(data);
}

private markAllFieldsTouched(): void {
  // Implementation to mark all fields as touched for validation display
  // This will trigger error display for all invalid fields
}
```

### Step 5: Styling and Accessibility

#### Component Styles
Create responsive and accessible styles:

```scss
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.form-section {
  margin-bottom: 2rem;
}

.array-field-section {
  .mat-card {
    position: relative;

    .remove-button {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .form-container {
    padding: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
```

#### Accessibility Features
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Step 6: Integration Guide

#### Component Usage
```html
<app-[entity-name]-form
  [initialData]="[entityName]"
  (formSubmit)="onFormSubmit($event)"
  (formCancel)="onFormCancel()">
</app-[entity-name]-form>
```

#### Input/Output Properties
```typescript
// Add these to the component if needed
readonly initialData = input<Partial<[EntityType]>>();
readonly mode = input<'create' | 'edit'>('create');

readonly formSubmit = output<[EntityType]>();
readonly formCancel = output<void>();
```

#### Parent Component Integration
```typescript
// Example parent component usage
@Component({
  template: `
    <app-[entity-name]-form
      [initialData]="selectedEntity()"
      (formSubmit)="handleFormSubmit($event)">
    </app-[entity-name]-form>
  `
})
export class Parent {
  selectedEntity = signal<[EntityType] | null>(null);

  handleFormSubmit(data: [EntityType]): void {
    // Handle form submission
  }
}
```

## File Structure

Create the following files in the appropriate domain folder:

```
src/app/[domain]/
├── feature/
│   ├── [entity-name]-form/
│   │   ├── [entity-name]-form.ts
│   │   ├── [entity-name]-form.html
│   │   └── [entity-name]-form.scss
└── data/
    └── models/
        └── [entity-name].model.ts               # Entity model reference
```

## Best Practices

1. **Schema-Based Validation**: Always use Angular's built-in `schema()` function for declarative validation following `angular-signal-forms.instructions.md`. Define schemas at module level (not inside the class) for memoization and reusability.
2. **Modern Angular Patterns**: Use standalone components, function-based DI with `inject()`, and modern control flow (`@if`, `@for`)
3. **Signal-First Approach**: Leverage signals for all reactive state management
4. **Material Design**: Use Angular Material components for consistent UI and built-in accessibility
5. **Type Safety**: Maintain strict TypeScript typing throughout the form with proper interfaces
6. **Dirty Check at Field Level**: Use `field().dirty()` on individual fields — the form-level `form()` object only exposes `valid()`, not `dirty()`
7. **Responsive Design**: Ensure forms work well on all device sizes
8. **Error Handling**: Provide clear, user-friendly error messages with custom messages in validators
9. **Performance**: Use OnPush change detection and efficient signal updates with computed signals
10. **Built-in Validators**: Use Angular's built-in validators (`required`, `email`, `minLength`, etc.) for common validation needs

## Key References

> **Primary Reference**: [Angular Signal Forms Instructions](../instructions/angular-signal-forms.instructions.md) - Comprehensive guide for Signal Forms with schema validation

### Supporting References
- [Angular Instructions](../instructions/angular.instructions.md) - Core Angular patterns and best practices
- [Angular Material Instructions](../instructions/angular-material.instructions.md) - Material Design component usage
- [TypeScript Instructions](../instructions/typescript.instructions.md) - TypeScript conventions and typing
