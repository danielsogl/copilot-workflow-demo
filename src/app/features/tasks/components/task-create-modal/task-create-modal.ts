import { Component, inject, signal, effect, computed } from "@angular/core";
import {
  form,
  schema,
  Field,
  required,
  minLength,
  maxLength,
} from "@angular/forms/signals";
import { MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TaskStore } from "../../services/task-store";
import { Task } from "../../../../shared/models/task.model";

interface TaskForm {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

const taskSchema = schema<TaskForm>((f) => {
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
});

@Component({
  selector: "app-task-create-modal",
  templateUrl: "./task-create-modal.html",
  styleUrl: "./task-create-modal.scss",
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
export class TaskCreateModal {
  private readonly dialogRef = inject(MatDialogRef<TaskCreateModal>);
  readonly taskStore = inject(TaskStore);

  readonly isSubmitting = signal(false);
  private readonly previousTaskCount = signal(this.taskStore.totalTaskCount());

  readonly taskData = signal<TaskForm>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  readonly taskForm = form(this.taskData, taskSchema);

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
    // Watch for task count changes to detect successful creation
    effect(() => {
      if (this.isSubmitting() && !this.taskStore.loading()) {
        const newCount = this.taskStore.totalTaskCount();
        const prevCount = this.previousTaskCount();

        // If task count increased and no error, close dialog
        if (newCount > prevCount && !this.taskStore.error()) {
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
      this.previousTaskCount.set(this.taskStore.totalTaskCount());
      this.taskStore.clearError();

      const formValue = this.taskData();
      const taskData: Omit<
        Task,
        "id" | "createdAt" | "completedAt" | "status"
      > = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: formValue.dueDate,
      };

      this.taskStore.createTask(taskData);
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
  }

  getFieldError(fieldName: keyof TaskForm): string {
    const field = this.taskForm[fieldName]();
    if ((field.touched() || field.dirty()) && field.errors().length > 0) {
      const firstError = field.errors()[0];
      return firstError?.message || "";
    }
    return "";
  }
}
