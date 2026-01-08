import { Component, inject, signal, effect } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { PersonStore } from "../../services/person-store";
import { Person } from "../../../../shared/models/person.model";

interface PersonForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  dateOfBirth: FormControl<string>;
  address: FormControl<string>;
  city: FormControl<string>;
  country: FormControl<string>;
}

@Component({
  selector: "app-person-create-modal",
  templateUrl: "./person-create-modal.html",
  styleUrl: "./person-create-modal.scss",
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class PersonCreateModal {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PersonCreateModal>);
  readonly personStore = inject(PersonStore);

  readonly isSubmitting = signal(false);
  private readonly previousPersonCount = signal(
    this.personStore.totalPersonCount(),
  );

  constructor() {
    // Watch for person count changes to detect successful creation
    effect(() => {
      if (this.isSubmitting() && !this.personStore.loading()) {
        const newCount = this.personStore.totalPersonCount();
        const prevCount = this.previousPersonCount();

        // If person count increased and no error, close dialog
        if (newCount > prevCount && !this.personStore.error()) {
          this.dialogRef.close(true);
        } else if (this.personStore.error()) {
          // Error occurred, stop submitting
          this.isSubmitting.set(false);
        }
      }
    });
  }

  readonly personForm: FormGroup<PersonForm> =
    this.formBuilder.group<PersonForm>({
      firstName: this.formBuilder.control("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      }),
      lastName: this.formBuilder.control("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      }),
      email: this.formBuilder.control("", {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: this.formBuilder.control("", {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[+\d\s()-]+$/)],
      }),
      dateOfBirth: this.formBuilder.control("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      address: this.formBuilder.control("", {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      city: this.formBuilder.control("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      }),
      country: this.formBuilder.control("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      }),
    });

  readonly maxDate = new Date();

  onSubmit(): void {
    if (this.personForm.valid) {
      this.isSubmitting.set(true);
      this.previousPersonCount.set(this.personStore.totalPersonCount());
      this.personStore.clearError();

      const formValue = this.personForm.getRawValue();
      const personData: Omit<Person, "id" | "createdAt" | "updatedAt"> = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        dateOfBirth: formValue.dateOfBirth,
        address: formValue.address,
        city: formValue.city,
        country: formValue.country,
      };

      this.personStore.createPerson(personData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.personForm.controls).forEach((key) => {
      const control = this.personForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: keyof PersonForm): string {
    const control = this.personForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors["required"]) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors["minlength"]) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors["minlength"].requiredLength} characters`;
      }
      if (control.errors["maxlength"]) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors["maxlength"].requiredLength} characters`;
      }
      if (control.errors["email"]) {
        return "Please enter a valid email address";
      }
      if (control.errors["pattern"]) {
        return "Please enter a valid phone number";
      }
    }
    return "";
  }

  private getFieldLabel(fieldName: keyof PersonForm): string {
    const labels: Record<keyof PersonForm, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      dateOfBirth: "Date of Birth",
      address: "Address",
      city: "City",
      country: "Country",
    };
    return labels[fieldName];
  }
}
