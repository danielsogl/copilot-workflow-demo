import { Component, inject, signal, effect } from "@angular/core";
import {
  form,
  schema,
  FormField,
  required,
  minLength,
  maxLength,
  min,
  max,
  submit,
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
import { TaskStore } from "../../data/state/task-store";
import { Task } from "../../../../shared/models/task.model";

interface TaskEditFormModel {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  estimatedMinutes: number;
}

const taskEditSchema = schema<TaskEditFormModel>((f) => {
  required(f.title, { message: "Title is required" });
  minLength(f.title, 3, { message: "Title must be at least 3 characters" });
  maxLength(f.title, 100, { message: "Title must not exceed 100 characters" });
  maxLength(f.description, 500, {
    message: "Description must not exceed 500 characters",
  });
  required(f.priority, { message: "Priority is required" });
  required(f.dueDate, { message: "Due Date is required" });
  min(f.estimatedMinutes, 0, {
    message: "Estimated time must be at least 0",
  });
  max(f.estimatedMinutes, 9999, {
    message: "Estimated time cannot exceed 9999",
  });
});

@Component({
  selector: "app-task-edit-modal",
  templateUrl: "./task-edit-modal.html",
  styleUrl: "./task-edit-modal.scss",
  imports: [
    FormField,
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

  readonly taskModel = signal<TaskEditFormModel>({
    title: this.task.title,
    description: this.task.description,
    priority: this.task.priority,
    dueDate: this.task.dueDate,
    estimatedMinutes: this.task.estimatedMinutes || 0,
  });

  readonly taskForm = form(this.taskModel, taskEditSchema);

  readonly priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ] as const;

  readonly minDate = new Date();

  onSubmit(): void {
    submit(this.taskForm, async () => {
      this.isSubmitting.set(true);
      this.initialTaskVersion.set(JSON.stringify(this.task));
      this.taskStore.clearError();

      const formValue = this.taskModel();
      const updates: Partial<Task> = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: formValue.dueDate,
        estimatedMinutes: formValue.estimatedMinutes || undefined,
      };

      this.taskStore.updateTask({ id: this.task.id, updates });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
