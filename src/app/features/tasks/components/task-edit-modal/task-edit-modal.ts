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
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TaskStore } from "../../services/task-store";
import { Task } from "../../../../shared/models/task.model";

interface TaskEditForm {
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<"low" | "medium" | "high">;
  dueDate: FormControl<string>;
  estimatedMinutes: FormControl<number>;
}

@Component({
  selector: "app-task-edit-modal",
  templateUrl: "./task-edit-modal.html",
  styleUrl: "./task-edit-modal.scss",
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TaskEditModal {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskEditModal>);
  readonly taskStore = inject(TaskStore);

  readonly task: Task = inject(MAT_DIALOG_DATA);

  readonly isSubmitting = signal(false);
  private readonly initialTaskVersion = signal(JSON.stringify(this.task));

  constructor() {
    // Watch for task updates to detect successful edit
    effect(() => {
      if (this.isSubmitting() && !this.taskStore.loading()) {
        const currentTask = this.taskStore.tasksEntityMap()[this.task.id];
        const currentVersion = JSON.stringify(currentTask);

        // If task was updated and no error, close dialog
        if (
          currentVersion !== this.initialTaskVersion() &&
          !this.taskStore.error()
        ) {
          this.dialogRef.close(true);
        } else if (this.taskStore.error()) {
          // Error occurred, stop submitting
          this.isSubmitting.set(false);
        }
      }
    });
  }

  readonly taskForm: FormGroup<TaskEditForm> =
    this.formBuilder.group<TaskEditForm>({
      title: this.formBuilder.control(this.task.title, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      }),
      description: this.formBuilder.control(this.task.description, {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      }),
      priority: this.formBuilder.control(this.task.priority, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      dueDate: this.formBuilder.control(this.task.dueDate, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      estimatedMinutes: this.formBuilder.control(
        this.task.estimatedMinutes || 0,
        {
          nonNullable: true,
          validators: [Validators.min(0), Validators.max(9999)],
        },
      ),
    });

  readonly priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ] as const;

  readonly minDate = new Date();

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isSubmitting.set(true);
      this.initialTaskVersion.set(JSON.stringify(this.task));
      this.taskStore.clearError();

      const formValue = this.taskForm.getRawValue();
      const updates: Partial<Task> = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: formValue.dueDate,
        estimatedMinutes: formValue.estimatedMinutes || undefined,
      };

      this.taskStore.updateTask({ id: this.task.id, updates });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach((key) => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: keyof TaskEditForm): string {
    const control = this.taskForm.get(fieldName);
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
      if (control.errors["min"]) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors["min"].min}`;
      }
      if (control.errors["max"]) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${control.errors["max"].max}`;
      }
    }
    return "";
  }

  private getFieldLabel(fieldName: keyof TaskEditForm): string {
    const labels: Record<keyof TaskEditForm, string> = {
      title: "Title",
      description: "Description",
      priority: "Priority",
      dueDate: "Due Date",
      estimatedMinutes: "Estimated Time",
    };
    return labels[fieldName];
  }
}
