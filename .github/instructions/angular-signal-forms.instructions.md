---
description: "Type-safe form validation using Angular Signal Forms with built-in schema validation for reactive, declarative form management"
applyTo: "**/*.ts, **/*.html"
---

# Angular Signal Forms with Schema Validation

This is the **primary and recommended approach** for form validation in this Angular application. Use Angular's built-in schema validation for type-safe, declarative form management with Signal Forms.

## Why Signal Forms with Built-in Schema Validation?

- **Type Safety:** Full TypeScript type inference with Angular's schema system and explicit interfaces
- **Declarative:** Define validation rules in a clear, functional style using the `schema()` function
- **Composable:** Build complex validation schemas from built-in validators
- **Better DX:** Native Angular integration with excellent IDE support and debugging
- **No External Dependencies:** Uses Angular's built-in validation system without third-party libraries
- **Consistent API:** Follows Angular's established patterns and conventions
- **Performance:** Efficient validation with signals-based reactivity

## Core Pattern: Schema-Based Validation

Angular Signal Forms provides a built-in `schema()` function for declarative validation that works seamlessly with signals. Define your validation rules once and apply them to your forms.

### Built-in Validators

Angular Signal Forms provides comprehensive built-in validators:

```typescript
import { 
  schema, 
  required, 
  email, 
  minLength, 
  maxLength, 
  min, 
  max, 
  pattern,
  applyEach,
  validate,
  customError
} from '@angular/forms/signals';

// Available validators:
// - required(field, options?) - Field must have a value
// - email(field, options?) - Valid email format
// - minLength(field, length, options?) - Minimum string length
// - maxLength(field, length, options?) - Maximum string length
// - min(field, value, options?) - Minimum numeric value
// - max(field, value, options?) - Maximum numeric value
// - pattern(field, regex, options?) - Match a regular expression
// - applyEach(arrayField, validatorFn) - Validate each array item
// - customError(options) - Custom validation logic
```

## 1. Basic Form with Schema Validation

### Schema Definition

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, email, minLength } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

// Define TypeScript interface
interface User {
  name: string;
  email: string;
}

// Define validation schema
const userSchema = schema<User>((f) => {
  required(f.name, { message: 'Name is required' });
  minLength(f.name, 3, { message: 'Name must be at least 3 characters' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Enter a valid email address' });
});

@Component({
  selector: 'app-user-form',
  imports: [Control, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <div>
        <input type="text" placeholder="Name" [control]="userForm.name" />
        @if(userForm.name().touched() || userForm.name().dirty()) {
          @for (error of userForm.name().errors(); track error.kind) {
            <p class="error">{{ error.message }}</p>
          }
        }
      </div>

      <div>
        <input type="email" placeholder="Email" [control]="userForm.email" />
        @if(userForm.email().touched() || userForm.email().dirty()) {
          @for (error of userForm.email().errors(); track error.kind) {
            <p class="error">{{ error.message }}</p>
          }
        }
      </div>

      <button type="submit" [disabled]="!userForm().valid()">Submit</button>
      
      <pre>{{ user() | json }}</pre>
    </form>
  `,
})
export class UserFormComponent {
  // Initialize form state with signal
  user = signal<User>({ name: '', email: '' });

  // Create Signal Form with validation schema
  userForm = form(this.user, userSchema);

  onSubmit() {
    if (this.userForm().valid()) {
      const formData = this.user();
      console.log('Valid data:', formData);
      // Submit to API
    }
  }
}
```

## 2. Custom Validation Logic

For custom validation beyond built-in validators, use `validate()` and `customError()`:

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, validate, customError } from '@angular/forms/signals';

interface User {
  username: string;
  age: number;
}

const userSchema = schema<User>((f) => {
  required(f.username, { message: 'Username is required' });
  
  // Custom validation: username must start with a letter
  validate(f.username, (field) => {
    const value = field.value();
    if (value && !/^[a-zA-Z]/.test(value)) {
      return customError({
        kind: 'pattern',
        message: 'Username must start with a letter'
      });
    }
    return null;
  });
  
  // Custom validation: age must be between 18 and 120
  validate(f.age, (field) => {
    const value = field.value();
    if (value < 18) {
      return customError({
        kind: 'min',
        message: 'Must be at least 18 years old'
      });
    }
    if (value > 120) {
      return customError({
        kind: 'max',
        message: 'Age must be 120 or less'
      });
    }
    return null;
  });
});

@Component({
  selector: 'app-custom-validation-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [control]="userForm.username" placeholder="Username" />
      @if(userForm.username().touched() || userForm.username().dirty()) {
        @for (error of userForm.username().errors(); track error.kind) {
          <p class="error">{{ error.message }}</p>
        }
      }
      
      <input [control]="userForm.age" type="number" placeholder="Age" />
      @if(userForm.age().touched() || userForm.age().dirty()) {
        @for (error of userForm.age().errors(); track error.kind) {
          <p class="error">{{ error.message }}</p>
        }
      }
      
      <button type="submit" [disabled]="!userForm().valid()">Submit</button>
    </form>
  `
})
export class CustomValidationFormComponent {
  user = signal<User>({ username: '', age: 0 });
  userForm = form(this.user, userSchema);

  onSubmit() {
    if (this.userForm().valid()) {
      console.log('Valid data:', this.user());
    }
  }
}
```

## 3. Nested Objects

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, email, min, max, pattern } from '@angular/forms/signals';

interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

interface User {
  name: string;
  age: number;
  email: string;
  address: Address;
}

const userSchema = schema<User>((f) => {
  required(f.name, { message: 'Name is required' });
  min(f.age, 0, { message: 'Age must be positive' });
  max(f.age, 120, { message: 'Age must be 120 or less' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
  
  // Nested address validation
  required(f.address.street, { message: 'Street is required' });
  required(f.address.city, { message: 'City is required' });
  required(f.address.zip, { message: 'ZIP code is required' });
  pattern(f.address.zip, /^\d{5}$/, { message: 'ZIP must be 5 digits' });
  required(f.address.country, { message: 'Country is required' });
});

@Component({
  selector: 'app-nested-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <!-- User fields -->
      <input [control]="userForm.name" placeholder="Name" />
      <input [control]="userForm.age" type="number" placeholder="Age" />
      <input [control]="userForm.email" placeholder="Email" />

      <!-- Address fields -->
      <h3>Address</h3>
      <input [control]="userForm.address.street" placeholder="Street" />
      @if(userForm.address.street().touched()) {
        @for (error of userForm.address.street().errors(); track error.kind) {
          <p class="error">{{ error.message }}</p>
        }
      }
      
      <input [control]="userForm.address.city" placeholder="City" />
      <input [control]="userForm.address.zip" placeholder="ZIP" />
      <input [control]="userForm.address.country" placeholder="Country" />

      <button type="submit" [disabled]="!userForm().valid()">Submit</button>
    </form>
  `,
})
export class NestedFormComponent {
  user = signal<User>({
    name: '',
    age: 0,
    email: '',
    address: {
      street: '',
      city: '',
      zip: '',
      country: '',
    },
  });

  userForm = form(this.user, userSchema);

  onSubmit() {
    if (this.userForm().valid()) {
      console.log('Valid user:', this.user());
    }
  }
}
```

## 4. Dynamic Arrays

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, email, applyEach, min } from '@angular/forms/signals';

interface Hobby {
  name: string;
  yearsOfExperience?: number;
}

interface User {
  name: string;
  email: string;
  hobbies: Hobby[];
}

const userSchema = schema<User>((f) => {
  required(f.name, { message: 'Name is required' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
  
  // Validate each array item
  applyEach(f.hobbies, (hobby) => {
    required(hobby.name, { message: 'Hobby name is required' });
    if (hobby.yearsOfExperience) {
      min(hobby.yearsOfExperience, 0, { message: 'Years must be positive' });
    }
  });
});

@Component({
  selector: 'app-array-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [control]="userForm.name" placeholder="Name" />
      <input [control]="userForm.email" placeholder="Email" />

      <h3>Hobbies</h3>
      @for (hobby of userForm.hobbies; track hobby; let i = $index) {
        <div class="hobby-item">
          <input [control]="hobby.name" placeholder="Hobby name" />
          @if(hobby.name().touched() || hobby.name().dirty()) {
            @for (error of hobby.name().errors(); track error.kind) {
              <p class="error">{{ error.message }}</p>
            }
          }
          
          <input [control]="hobby.yearsOfExperience" type="number" placeholder="Years" />
          <button type="button" (click)="removeHobby(i)">Remove</button>
        </div>
      }
      @empty {
        <p>No hobbies added yet.</p>
      }

      <button type="button" (click)="addHobby()">Add Hobby</button>
      <button type="submit" [disabled]="!userForm().valid()">Submit</button>
    </form>
  `,
})
export class ArrayFormComponent {
  user = signal<User>({
    name: '',
    email: '',
    hobbies: [],
  });

  userForm = form(this.user, userSchema);

  addHobby() {
    this.user.update((u) => ({
      ...u,
      hobbies: [...u.hobbies, { name: '', yearsOfExperience: 0 }],
    }));
  }

  removeHobby(index: number) {
    this.user.update((u) => ({
      ...u,
      hobbies: u.hobbies.filter((_, i) => i !== index),
    }));
  }

  onSubmit() {
    if (this.userForm().valid()) {
      console.log('Valid data:', this.user());
    }
  }
}
```

## 5. Password Matching Validation

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, email, minLength, validate, customError } from '@angular/forms/signals';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const signupSchema = schema<SignupForm>((f) => {
  required(f.name, { message: 'Name is required' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
  required(f.password, { message: 'Password is required' });
  minLength(f.password, 6, { message: 'Password must be at least 6 characters' });
  required(f.confirmPassword, { message: 'Please confirm your password' });
  
  // Password matching validation
  validate(f.confirmPassword, (field) => {
    const password = f.password.value();
    const confirmPassword = field.value();
    
    if (confirmPassword && password !== confirmPassword) {
      return customError({
        kind: 'passwordMismatch',
        message: 'Passwords do not match'
      });
    }
    return null;
  });
});

@Component({
  selector: 'app-signup-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [control]="signupForm.name" placeholder="Name" />
      <input [control]="signupForm.email" type="email" placeholder="Email" />
      <input [control]="signupForm.password" type="password" placeholder="Password" />
      <input [control]="signupForm.confirmPassword" type="password" placeholder="Confirm Password" />

      @if(signupForm.confirmPassword().touched() || signupForm.confirmPassword().dirty()) {
        @for (error of signupForm.confirmPassword().errors(); track error.kind) {
          <p class="error">{{ error.message }}</p>
        }
      }

      <button type="submit" [disabled]="!signupForm().valid()">Sign Up</button>
    </form>
  `,
})
export class SignupFormComponent {
  formData = signal<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  signupForm = form(this.formData, signupSchema);

  onSubmit() {
    if (this.signupForm().valid()) {
      console.log('Signup data:', this.formData());
    }
  }
}
```

## 6. Async Validation

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, email, minLength, validate, customError } from '@angular/forms/signals';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface UserForm {
  username: string;
  email: string;
}

@Component({
  selector: 'app-async-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [control]="userForm.username" placeholder="Username" />
      @if(userForm.username().touched() || userForm.username().dirty()) {
        @for (error of userForm.username().errors(); track error.kind) {
          <p class="error">{{ error.message }}</p>
        }
      }
      
      <input [control]="userForm.email" type="email" placeholder="Email" />
      
      <button type="submit" [disabled]="!userForm().valid() || isCheckingUsername()">
        {{ isCheckingUsername() ? 'Checking...' : 'Submit' }}
      </button>
    </form>
  `
})
export class AsyncFormComponent {
  private readonly http = inject(HttpClient);
  
  readonly isCheckingUsername = signal(false);
  
  formData = signal<UserForm>({ username: '', email: '' });

  private readonly userSchema = schema<UserForm>((f) => {
    required(f.username, { message: 'Username is required' });
    minLength(f.username, 3, { message: 'Username must be at least 3 characters' });
    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Invalid email' });
  });

  userForm = form(this.formData, this.userSchema);

  private async checkUsernameAvailable(username: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ available: boolean }>(`/api/check-username/${username}`)
      );
      return response.available;
    } catch {
      return false;
    }
  }

  async onSubmit() {
    if (!this.userForm().valid()) {
      return;
    }

    // Perform async validation on submit
    this.isCheckingUsername.set(true);
    const username = this.formData().username;
    const isAvailable = await this.checkUsernameAvailable(username);
    this.isCheckingUsername.set(false);

    if (!isAvailable) {
      console.error('Username is already taken');
      return;
    }

    console.log('Valid data:', this.formData());
  }
}
```

## 7. Complex Nested Structure: Projects with Tasks

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, minLength, applyEach, validate, customError } from '@angular/forms/signals';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'Not Started' | 'In Progress' | 'Completed';

interface Task {
  title: string;
  done: boolean;
  priority: Priority;
  dueDate: string;
}

interface Project {
  name: string;
  deadline: string;
  status: Status;
  tasks: Task[];
}

interface UserProjects {
  username: string;
  projects: Project[];
}

const userProjectsSchema = schema<UserProjects>((f) => {
  required(f.username, { message: 'Username is required' });
  
  applyEach(f.projects, (project) => {
    required(project.name, { message: 'Project name is required' });
    minLength(project.name, 3, { message: 'Project name must be at least 3 characters' });
    required(project.deadline, { message: 'Deadline is required' });
    
    // Validate deadline is in future
    validate(project.deadline, (field) => {
      const deadline = new Date(field.value());
      if (deadline <= new Date()) {
        return customError({
          kind: 'futureDate',
          message: 'Deadline must be in the future'
        });
      }
      return null;
    });
    
    applyEach(project.tasks, (task) => {
      required(task.title, { message: 'Task title is required' });
      minLength(task.title, 2, { message: 'Task title must be at least 2 characters' });
      required(task.dueDate, { message: 'Due date is required' });
      
      // Validate due date is in future
      validate(task.dueDate, (field) => {
        const dueDate = new Date(field.value());
        if (dueDate <= new Date()) {
          return customError({
            kind: 'futureDate',
            message: 'Due date must be in the future'
          });
        }
        return null;
      });
    });
  });
});

@Component({
  selector: 'app-projects-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [control]="projectsForm.username" placeholder="Username" />

      <h3>Projects</h3>
      @for (project of projectsForm.projects; track project; let i = $index) {
        <div class="project-card">
          <input [control]="project.name" placeholder="Project name" />
          <input [control]="project.deadline" type="date" />
          <select [control]="project.status">
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button type="button" (click)="removeProject(i)">Remove Project</button>

          <h4>Tasks</h4>
          @for (task of project.tasks; track task; let j = $index) {
            <div class="task-item">
              <input [control]="task.title" placeholder="Task title" />
              <select [control]="task.priority">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <input [control]="task.dueDate" type="date" />
              <input [control]="task.done" type="checkbox" />
              <button type="button" (click)="removeTask(i, j)">Remove</button>
            </div>
          }
          <button type="button" (click)="addTask(i)">Add Task</button>
        </div>
      }

      <button type="button" (click)="addProject()">Add Project</button>
      <button type="submit" [disabled]="!projectsForm().valid()">Submit</button>
    </form>
  `,
})
export class ProjectsFormComponent {
  userProjects = signal<UserProjects>({
    username: '',
    projects: [],
  });

  projectsForm = form(this.userProjects, userProjectsSchema);

  addProject() {
    this.userProjects.update((state) => ({
      ...state,
      projects: [
        ...state.projects,
        {
          name: '',
          deadline: '',
          status: 'Not Started' as const,
          tasks: [],
        },
      ],
    }));
  }

  removeProject(index: number) {
    this.userProjects.update((state) => ({
      ...state,
      projects: state.projects.filter((_, i) => i !== index),
    }));
  }

  addTask(projectIndex: number) {
    this.userProjects.update((state) => {
      const projects = [...state.projects];
      projects[projectIndex] = {
        ...projects[projectIndex],
        tasks: [
          ...projects[projectIndex].tasks,
          {
            title: '',
            done: false,
            priority: 'Medium' as const,
            dueDate: '',
          },
        ],
      };
      return { ...state, projects };
    });
  }

  removeTask(projectIndex: number, taskIndex: number) {
    this.userProjects.update((state) => {
      const projects = [...state.projects];
      projects[projectIndex] = {
        ...projects[projectIndex],
        tasks: projects[projectIndex].tasks.filter((_, j) => j !== taskIndex),
      };
      return { ...state, projects };
    });
  }

  onSubmit() {
    if (this.projectsForm().valid()) {
      console.log('Valid projects data:', this.userProjects());
      // Submit to API
    }
  }
}
```

## Best Practices

### 1. Schema Organization

```typescript
// Store validation schemas in dedicated files
// src/app/domain/user/data/models/user.validation.ts

import { schema, required, email, min, max, pattern } from '@angular/forms/signals';

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
  address: Address;
}

export const addressValidation = schema<Address>((f) => {
  required(f.street, { message: 'Street is required' });
  required(f.city, { message: 'City is required' });
  required(f.zip, { message: 'ZIP code is required' });
  pattern(f.zip, /^\d{5}$/, { message: 'ZIP must be 5 digits' });
  required(f.country, { message: 'Country is required' });
});

export const userValidation = schema<User>((f) => {
  required(f.name, { message: 'Name is required' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
  min(f.age, 0, { message: 'Age must be positive' });
  max(f.age, 120, { message: 'Age must be 120 or less' });
  
  // Apply nested address validation
  addressValidation(f.address);
});
```

### 2. Reusable Validator Functions

```typescript
// src/app/shared/util/validators.ts

import { FieldPath, validate, customError } from '@angular/forms/signals';

export function passwordValidator<T>(field: FieldPath<T>) {
  validate(field, (f) => {
    const value = f.value() as string;
    
    if (!value || value.length < 8) {
      return customError({
        kind: 'minLength',
        message: 'Password must be at least 8 characters'
      });
    }
    
    if (!/[A-Z]/.test(value)) {
      return customError({
        kind: 'pattern',
        message: 'Password must contain at least one uppercase letter'
      });
    }
    
    if (!/[a-z]/.test(value)) {
      return customError({
        kind: 'pattern',
        message: 'Password must contain at least one lowercase letter'
      });
    }
    
    if (!/[0-9]/.test(value)) {
      return customError({
        kind: 'pattern',
        message: 'Password must contain at least one number'
      });
    }
    
    return null;
  });
}

export function phoneValidator<T>(field: FieldPath<T>) {
  validate(field, (f) => {
    const value = f.value() as string;
    if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
      return customError({
        kind: 'pattern',
        message: 'Invalid phone number'
      });
    }
    return null;
  });
}

export function futureDateValidator<T>(field: FieldPath<T>) {
  validate(field, (f) => {
    const value = f.value() as string;
    if (value && new Date(value) <= new Date()) {
      return customError({
        kind: 'futureDate',
        message: 'Date must be in the future'
      });
    }
    return null;
  });
}

// Usage in schemas
const signupSchema = schema<SignupForm>((f) => {
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
  passwordValidator(f.password);
  phoneValidator(f.phone);
});
```

### 3. Form State Management with Computed Signals

```typescript
import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { form, schema, Control, required, email } from '@angular/forms/signals';

interface User {
  name: string;
  email: string;
}

const userSchema = schema<User>((f) => {
  required(f.name, { message: 'Name is required' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
});

@Component({
  selector: 'app-stateful-form',
  imports: [Control],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [control]="userForm.name" placeholder="Name" />
      <input [control]="userForm.email" placeholder="Email" />
      
      <button type="submit" [disabled]="!canSubmit()">Submit</button>
      
      <div>
        <p>Valid: {{ isValid() }}</p>
        <p>Dirty: {{ isDirty() }}</p>
        <p>Touched: {{ isTouched() }}</p>
      </div>
    </form>
  `,
})
export class StatefulFormComponent {
  user = signal<User>({ name: '', email: '' });
  userForm = form(this.user, userSchema);

  // Computed signals for form state
  readonly isValid = computed(() => this.userForm().valid());
  readonly isDirty = computed(() =>
    this.userForm.name().dirty() || this.userForm.email().dirty()
  );
  readonly isTouched = computed(() =>
    this.userForm.name().touched() || this.userForm.email().touched()
  );
  readonly canSubmit = computed(() => this.isValid() && this.isDirty());

  onSubmit() {
    if (this.isValid()) {
      console.log('Submit:', this.user());
    }
  }
}
```

## Performance Considerations

### 1. Memoize Complex Schemas

```typescript
// Create schema once at module level, reuse across components
export const userSchema = schema<User>((f) => {
  required(f.name, { message: 'Name is required' });
  required(f.email, { message: 'Email is required' });
  email(f.email, { message: 'Invalid email' });
});

// Don't recreate schemas inside components or effects
```

### 2. Use OnPush Change Detection

```typescript
@Component({
  selector: 'app-my-form',
  changeDetection: ChangeDetectionStrategy.OnPush, // Always use OnPush
  // ...
})
```

### 3. Lazy Validation for Large Forms

```typescript
// Only validate on blur or submit, not on every keystroke
@if(userForm.name().touched()) {
  @for (error of userForm.name().errors(); track error.kind) {
    <p class="error">{{ error.message }}</p>
  }
}
```

### 4. Efficient Signal Updates

```typescript
// Use update() for transformations, set() for replacements
addItem() {
  this.formData.update(state => ({
    ...state,
    items: [...state.items, newItem]
  }));
}

resetForm() {
  this.formData.set(initialState);
}
```

## Common Validators Reference
```

### 3. Lazy Validation for Large Forms

```typescript
// Only validate on blur or submit, not on every keystroke
@if(userForm.name().touched()) {
  @for (error of userForm.name().errors(); track error.kind) {
    <p class="error">{{ error.message }}</p>
  }
}
```

## Common Validators Reference

```typescript
import { 
  required, 
  email, 
  minLength, 
  maxLength, 
  min, 
  max, 
  pattern,
  validate,
  customError,
  applyEach
} from '@angular/forms/signals';

// Required field
required(f.name, { message: 'Name is required' });

// Email validation
email(f.email, { message: 'Invalid email format' });

// String length validators
minLength(f.name, 3, { message: 'Name must be at least 3 characters' });
maxLength(f.description, 500, { message: 'Description cannot exceed 500 characters' });

// Number range validators
min(f.age, 18, { message: 'Must be at least 18 years old' });
max(f.age, 120, { message: 'Age must be 120 or less' });

// Pattern/regex validation
pattern(f.phone, /^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number' });
pattern(f.zip, /^\d{5}$/, { message: 'ZIP must be 5 digits' });
pattern(f.url, /^https?:\/\/.+/, { message: 'Invalid URL' });

// Custom validation
validate(f.username, (field) => {
  const value = field.value();
  if (value && !/^[a-zA-Z]/.test(value)) {
    return customError({
      kind: 'pattern',
      message: 'Username must start with a letter'
    });
  }
  return null;
});

// Array validation
applyEach(f.items, (item) => {
  required(item.name, { message: 'Item name is required' });
  minLength(item.name, 2, { message: 'Name must be at least 2 characters' });
});

// Conditional validation
validate(f.phone, (field) => {
  const value = field.value();
  const isRequired = f.parent.requirePhone.value();
  
  if (isRequired && !value) {
    return customError({
      kind: 'required',
      message: 'Phone is required when checkbox is checked'
    });
  }
  return null;
});
```

## Testing Signal Forms

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with initial values', () => {
    expect(component.user()).toEqual({
      name: '',
      email: '',
    });
  });

  it('should validate required fields', () => {
    // Form should be invalid with empty values
    expect(component.userForm().valid()).toBe(false);
    
    // Update form values
    component.user.set({
      name: 'John Doe',
      email: 'john@example.com',
    });
    
    // Form should now be valid
    expect(component.userForm().valid()).toBe(true);
  });

  it('should reject invalid email', () => {
    component.user.set({
      name: 'John Doe',
      email: 'invalid-email',
    });
    
    expect(component.userForm().valid()).toBe(false);
    expect(component.userForm.email().errors().length).toBeGreaterThan(0);
    
    const emailErrors = component.userForm.email().errors();
    expect(emailErrors[0].kind).toBe('email');
  });

  it('should update form signal on input change', () => {
    component.user.set({ name: 'Jane', email: 'jane@example.com' });
    
    expect(component.user()).toEqual({
      name: 'Jane',
      email: 'jane@example.com',
    });
    expect(component.userForm().valid()).toBe(true);
  });

  it('should track touched and dirty state', () => {
    const nameControl = component.userForm.name();
    
    expect(nameControl.touched()).toBe(false);
    expect(nameControl.dirty()).toBe(false);
    
    // Simulate user interaction
    component.user.update(u => ({ ...u, name: 'John' }));
    
    expect(nameControl.dirty()).toBe(true);
  });

  it('should display validation errors', () => {
    // Submit with invalid data
    component.user.set({ name: '', email: 'invalid' });
    
    const nameErrors = component.userForm.name().errors();
    const emailErrors = component.userForm.email().errors();
    
    expect(nameErrors.length).toBeGreaterThan(0);
    expect(emailErrors.length).toBeGreaterThan(0);
    expect(nameErrors[0].message).toContain('required');
    expect(emailErrors[0].message).toContain('email');
  });
});
```
