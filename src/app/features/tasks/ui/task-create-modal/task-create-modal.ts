import { Component, inject, signal, effect } from "@angular/core";
import {
  form,
  schema,
  FormField,
  required,
  minLength,
  maxLength,
  submit,
} from "@angular/forms/signals";
import { MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TaskStore } from "../../data/state/task-store";
import { Task } from "../../../../shared/models/task.model";

interface TaskCreateFormModel {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

const taskCreateSchema = schema<TaskCreateFormModel>((f) => {
  required(f.title, { message: "Title is required" });
  minLength(f.title, 3, { message: "Title must be at least 3 characters" });
  maxLength(f.title, 100, { message: "Title must not exceed 100 characters" });
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
export class TaskCreateModal {
  private readonly dialogRef = inject(MatDialogRef<TaskCreateModal>);
  readonly taskStore = inject(TaskStore);

  readonly isSubmitting = signal(false);
  private readonly previousTaskCount = signal(this.taskStore.totalTaskCount());

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

  readonly taskModel = signal<TaskCreateFormModel>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  readonly taskForm = form(this.taskModel, taskCreateSchema);

  readonly priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ] as const;

  readonly minDate = new Date();

  onSubmit(): void {
    submit(this.taskForm, async () => {
      this.isSubmitting.set(true);
      this.previousTaskCount.set(this.taskStore.totalTaskCount());
      this.taskStore.clearError();

      const formValue = this.taskModel();
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
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
