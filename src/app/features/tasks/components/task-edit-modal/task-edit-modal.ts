import { Component, inject, signal, effect, computed } from "@angular/core";
import {
  form,
  schema,
  Field,
  required,
  minLength,
  maxLength,
  min,
  max,
} from "@angular/forms/signals";
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
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  estimatedMinutes: number;
}

const taskEditSchema = schema<TaskEditForm>((f) => {
  required(f.title, { message: "Title is required" });
  minLength(f.title, 3, { message: "Title must be at least 3 characters" });
  maxLength(f.title, 100, {
    message: "Title must not exceed 100 characters",
  });
  maxLength(f.description, 500, {
    message: "Description must not exceed 500 characters",
  });
  required(f.priority, { message: "Priority is required" });
  required(f.dueDate, { message: "Due Date is required" });
  min(f.estimatedMinutes, 0, {
    message: "Estimated Time must be at least 0",
  });
  max(f.estimatedMinutes, 9999, {
    message: "Estimated Time cannot exceed 9999",
  });
});

@Component({
  selector: "app-task-edit-modal",
  templateUrl: "./task-edit-modal.html",
  styleUrl: "./task-edit-modal.scss",
  imports: [
    Field,
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
  private readonly dialogRef = inject(MatDialogRef<TaskEditModal>);
  readonly taskStore = inject(TaskStore);

  readonly task: Task = inject(MAT_DIALOG_DATA);

  readonly isSubmitting = signal(false);
  private readonly initialTaskVersion = signal(JSON.stringify(this.task));

  readonly taskData = signal<TaskEditForm>({
    title: this.task.title,
    description: this.task.description,
    priority: this.task.priority,
    dueDate: this.task.dueDate,
    estimatedMinutes: this.task.estimatedMinutes || 0,
  });

  readonly taskForm = form(this.taskData, taskEditSchema);

  readonly priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ] as const;

  readonly minDate = new Date();

  readonly titleLength = computed(() => this.taskData().title?.length || 0);
  readonly descriptionLength = computed(
    () => this.taskData().description?.length || 0,
  );

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

  onSubmit(): void {
    if (this.taskForm().valid()) {
      this.isSubmitting.set(true);
      this.initialTaskVersion.set(JSON.stringify(this.task));
      this.taskStore.clearError();

      const formValue = this.taskData();
      const updates: Partial<Task> = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: formValue.dueDate,
        estimatedMinutes: formValue.estimatedMinutes || undefined,
      };

      this.taskStore.updateTask({ id: this.task.id, updates });
    } else {
      this.markFormAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormAsTouched(): void {
    this.taskForm.title().markAsTouched();
    this.taskForm.description().markAsTouched();
    this.taskForm.priority().markAsTouched();
    this.taskForm.dueDate().markAsTouched();
    this.taskForm.estimatedMinutes().markAsTouched();
  }

  getFieldError(fieldName: keyof TaskEditForm): string {
    const field = this.taskForm[fieldName]();
    if ((field.touched() || field.dirty()) && field.errors().length > 0) {
      const firstError = field.errors()[0];
      return firstError?.message || "";
    }
    return "";
  }
}
