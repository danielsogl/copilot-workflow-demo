import { Component, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { UserService } from "../../services/user.service";
import { User } from "../../../../shared/models/user.model";

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<"admin" | "developer" | "manager" | "viewer">;
}

@Component({
  selector: "app-user-profile-form",
  templateUrl: "./user-profile-form.component.html",
  styleUrl: "./user-profile-form.component.scss",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
})
export class UserProfileFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly userForm: FormGroup<UserForm> = this.formBuilder.group<UserForm>({
    name: this.formBuilder.control("", {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    }),
    email: this.formBuilder.control("", {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(255),
      ],
    }),
    role: this.formBuilder.control("developer" as const, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly roles = [
    { value: "admin", label: "Admin" },
    { value: "developer", label: "Developer" },
    { value: "manager", label: "Manager" },
    { value: "viewer", label: "Viewer" },
  ] as const;

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);

      const formValue = this.userForm.getRawValue();
      const userData: Omit<User, "id" | "createdAt"> = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
      };

      this.userService.createUser(userData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.snackBar.open("User profile created successfully!", "Close", {
            duration: 3000,
            horizontalPosition: "end",
            verticalPosition: "top",
          });
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set("Failed to create user profile. Please try again.");
          console.error("Error creating user:", error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(["/dashboard"]);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach((key) => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: keyof UserForm): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors["required"]) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors["email"]) {
        return "Please enter a valid email address";
      }
      if (control.errors["minlength"]) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors["minlength"].requiredLength} characters`;
      }
      if (control.errors["maxlength"]) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors["maxlength"].requiredLength} characters`;
      }
    }
    return "";
  }

  private getFieldLabel(fieldName: keyof UserForm): string {
    const labels: Record<keyof UserForm, string> = {
      name: "Name",
      email: "Email",
      role: "Role",
    };
    return labels[fieldName];
  }
}
