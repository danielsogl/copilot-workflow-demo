---
description: Scaffold an Angular Signal Form component with schema validation, Material 3 fields, and dynamic array management for a given entity.
argument-hint: <entity-name> [form-purpose]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm:*)
---

Generate a complete Angular Signal Form for the entity **$1** (purpose: $2) following the project's architecture and the latest Signal Forms API. Refer to @CLAUDE.md for conventions.

## Prerequisites

Before generating, verify:

1. The entity model exists at `src/app/features/<domain>/data/models/$1.model.ts` — read it first.
2. The form's purpose is clear (create / edit / multi-purpose).
3. Field requirements and validation rules are known — ask the user for any unclear ones before generating.

## Steps

### 1. Entity analysis

- Analyze the model to understand structure, types, and relationships.
- Decide which fields belong in the form (some may be auto-generated/readonly).
- Pick appropriate input types (text, email, number, date, select, checkbox, etc.).
- Identify nested objects and array fields needing dynamic management.

### 2. Component generation

Create the form component with these patterns:

```typescript
import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
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
} from "@angular/forms/signals";
import { JsonPipe } from "@angular/common";

import { MatButton } from "@angular/material/button";
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from "@angular/material/card";
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatCheckbox } from "@angular/material/checkbox";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from "@angular/material/datepicker";

interface EntityModel {
  name: string;
  email: string;
  description?: string;
  address: { street: string; city: string };
  tags: string[];
}

const EMPTY_ENTITY: EntityModel = {
  name: "",
  email: "",
  description: "",
  address: { street: "", city: "" },
  tags: [],
};

// Schema at module level for memoization
const entitySchema = schema<EntityModel>((f) => {
  required(f.name, { message: "Name is required" });
  minLength(f.name, 2, { message: "Name must be at least 2 characters" });

  required(f.email, { message: "Email is required" });
  email(f.email, { message: "Enter a valid email address" });

  maxLength(f.description, 500, {
    message: "Description cannot exceed 500 characters",
  });

  required(f.address.street, { message: "Street is required" });
  required(f.address.city, { message: "City is required" });

  applyEach(f.tags, (tag) => {
    minLength(tag, 1, { message: "Tag cannot be empty" });
  });
});

@Component({
  selector: "app-$1-form",
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    FormField,
    JsonPipe,
  ],
  templateUrl: "./$1-form.html",
  styleUrl: "./$1-form.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class $1Form {
  protected readonly model = signal<EntityModel>(EMPTY_ENTITY);
  protected readonly form = form(this.model, entitySchema);

  protected readonly canSubmit = computed(
    () =>
      this.form().valid() &&
      (this.form.name().dirty() || this.form.email().dirty()),
  );

  protected onSubmit(): void {
    if (!this.canSubmit()) return;
    const value = this.model();
    // call store / API
  }
}
```

### 3. Template

```html
<mat-card>
  <mat-card-header><mat-card-title>$2</mat-card-title></mat-card-header>
  <mat-card-content>
    <form (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput [formField]="form.name" />
        @if (form.name().touched() || form.name().dirty()) { @for (error of
        form.name().errors(); track error.kind) {
        <mat-error>{{ error.message }}</mat-error>
        } }
      </mat-form-field>
      <!-- ... other fields -->
      <button mat-flat-button type="submit" [disabled]="!canSubmit()">
        Save
      </button>
    </form>
  </mat-card-content>
</mat-card>
```

### 4. Dynamic arrays

```typescript
addItem(): void {
  this.model.update((s) => ({ ...s, tags: [...s.tags, ''] }));
}
removeItem(i: number): void {
  this.model.update((s) => ({ ...s, tags: s.tags.filter((_, idx) => idx !== i) }));
}
```

### 5. Integration

```typescript
readonly initialData = input<Partial<EntityModel>>();
readonly mode = input<'create' | 'edit'>('create');
readonly formSubmit = output<EntityModel>();
readonly formCancel = output<void>();
```

## File structure

```
src/app/features/<domain>/feature/$1-form/
  $1-form.ts
  $1-form.html
  $1-form.scss
```

## Best practices

1. Define schema at module level (memoization, reuse).
2. Standalone, OnPush, signal-first, modern control flow.
3. Material 3 components only — no `*Module` umbrellas.
4. Strict TypeScript with proper interfaces.
5. Dirty check at field level (`field().dirty()`), not form level (`form()` only exposes `valid()`).
6. Responsive design with sensible breakpoints.
7. Clear, user-friendly error messages via custom `message:` in validators.
8. Built-in validators only (`required`, `email`, `minLength`, ...).

When unclear about API specifics, query `mcp__context7__query-docs` for `/angular/angular` with `Signal Forms`.
