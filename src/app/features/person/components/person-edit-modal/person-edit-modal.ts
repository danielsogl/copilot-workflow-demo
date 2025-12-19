import { Component, inject, signal, effect } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
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
  selector: "app-person-edit-modal",
  templateUrl: "./person-edit-modal.html",
  styleUrl: "./person-edit-modal.scss",
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
export class PersonEditModal {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PersonEditModal>);
  readonly personStore = inject(PersonStore);
  readonly person = inject<Person>(MAT_DIALOG_DATA);

  readonly isSubmitting = signal(false);
  private readonly initialFormValue: string;

  constructor() {
    // Store initial form value to detect changes
    this.initialFormValue = JSON.stringify(this.personForm.getRawValue());

    // Watch for successful update
    effect(() => {
      if (this.isSubmitting() && !this.personStore.loading()) {
        // If no error, close dialog
        if (!this.personStore.error()) {
          this.dialogRef.close(true);
        } else {
          // Error occurred, stop submitting
          this.isSubmitting.set(false);
        }
      }
    });
  }

  readonly personForm: FormGroup<PersonForm> =
    this.formBuilder.group<PersonForm>({
      firstName: this.formBuilder.control(this.person.firstName, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      }),
      lastName: this.formBuilder.control(this.person.lastName, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      }),
      email: this.formBuilder.control(this.person.email, {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: this.formBuilder.control(this.person.phone, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[+\d\s()-]+$/)],
      }),
      dateOfBirth: this.formBuilder.control(this.person.dateOfBirth, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      address: this.formBuilder.control(this.person.address, {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      city: this.formBuilder.control(this.person.city, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      }),
      country: this.formBuilder.control(this.person.country, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      }),
    });

  readonly maxDate = new Date();

  hasChanges(): boolean {
    const currentValue = JSON.stringify(this.personForm.getRawValue());
    return currentValue !== this.initialFormValue;
  }

  onSubmit(): void {
    if (this.personForm.valid && this.hasChanges()) {
      this.isSubmitting.set(true);
      this.personStore.clearError();

      const formValue = this.personForm.getRawValue();
      const updates: Partial<Person> = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        dateOfBirth: formValue.dateOfBirth,
        address: formValue.address,
        city: formValue.city,
        country: formValue.country,
      };

      this.personStore.updatePerson({ id: this.person.id, updates });
    } else if (!this.hasChanges()) {
      // No changes, just close
      this.dialogRef.close(false);
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
