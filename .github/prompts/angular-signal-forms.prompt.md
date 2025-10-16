---
description: A reusable prompt for generating Angular Signal Forms with complete validation and dynamic field management for a specified entity.
mode: agent
model: Claude Sonnet 4.5 (copilot)
tools: ["edit","search","new","runCommands","runTasks","usages","problems","todos","think","context7/*"]
---

# Angular Signal Forms Generator

## Goal

Generate a complete Angular Signal Form with validation, error handling, and dynamic field management for a specified entity, following the project's architecture patterns and modern Angular Signal Forms API.

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

Generate a complete Angular Signal Form component with:

#### Core Imports and Dependencies
```typescript
import { Component, signal, effect } from '@angular/core';
import { form, required, email, minLength, maxLength, min, max, schema, applyEach, Control } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
```

#### Entity Types and Interfaces
- Define or import the entity type and any nested types
- Create separate types for form data if different from the entity (e.g., `CreateUserRequest`, `UpdateUserRequest`)
- Define validation error types if needed

#### Validation Schema
Create a comprehensive validation schema using `@angular/forms/signals`:

```typescript
const [entityName]Schema = schema<[EntityType]>((f) => {
  required(f.fieldName, { message: 'Field name is required' });
  email(f.email, { message: 'Invalid email format' });
  minLength(f.name, 2, { message: 'Name must be at least 2 characters' });
  maxLength(f.description, 500, { message: 'Description cannot exceed 500 characters' });

  // For nested objects
  required(f.nestedObject.field, { message: 'Field is required' });

  // For arrays
  applyEach(f.arrayField, (item) => {
    required(item.property, { message: 'Property is required' });
  });
});
```

#### Component Structure
```typescript
@Component({
  selector: 'app-[entity-name]-form',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    Control,
    JsonPipe
  ],
  templateUrl: './[entity-name]-form.component.html',
  styleUrls: ['./[entity-name]-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [EntityName]FormComponent {
  // Signal for form data
  [entityName] = signal<[EntityType]>({
    // Initialize with default values based on entity structure
  });

  // Signal form with validation
  readonly [entityName]Form = form(this.[entityName], [entityName]Schema);

  // Effect for error tracking (optional)
  private readonly errors = effect(() => {
    const formErrors = this.[entityName]Form().errors();
    if (formErrors.length > 0) {
      console.log('Form validation errors:', formErrors);
    }
  });

  // Dynamic field management methods
  // Form submission handler
  // Utility methods
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
  <input matInput [control]="[entityName]Form.[fieldName]" placeholder="[Placeholder]">
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
  <mat-select [control]="[entityName]Form.[fieldName]">
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
    // Handle form submission (emit event, call service, etc.)
    console.log('Form submitted:', formData);
  } else {
    // Mark all fields as touched to show validation errors
    this.markAllFieldsTouched();
  }
}

private markAllFieldsTouched(): void {
  // Implementation to mark all fields as touched for validation display
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
export class ParentComponent {
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
│   │   ├── [entity-name]-form.component.ts
│   │   ├── [entity-name]-form.component.html
│   │   └── [entity-name]-form.component.scss
└── data/
    └── models/
        └── [entity-name].model.ts               # Entity model reference
```

## Best Practices

1. **Modern Angular Patterns**: Use standalone components, function-based DI with `inject()`, and modern control flow (`@if`, `@for`)
2. **Signal-First Approach**: Leverage signals for all reactive state management
3. **Material Design**: Use Angular Material components for consistent UI and built-in accessibility
4. **Type Safety**: Maintain strict TypeScript typing throughout the form
5. **Validation Schema**: Use schema-based validation for maintainable and reusable validation rules
6. **Responsive Design**: Ensure forms work well on all device sizes
7. **Error Handling**: Provide clear, user-friendly error messages
8. **Performance**: Use OnPush change detection and efficient signal updates

## References

- [Angular Instructions](../instructions/angular.instructions.md) - Core Angular patterns and best practices
- [Angular Material Instructions](../instructions/angular-material.instructions.md) - Material Design component usage
- [TypeScript Instructions](../instructions/typescript.instructions.md) - TypeScript conventions and typing