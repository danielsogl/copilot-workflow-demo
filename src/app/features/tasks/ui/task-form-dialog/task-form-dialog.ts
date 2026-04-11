import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import {
  FormField,
  form,
  maxLength,
  minLength,
  required,
  schema,
} from "@angular/forms/signals";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from "@angular/material/datepicker";
import { Task, TaskFormData, TaskPriority } from "../../data/models/task.model";

export interface TaskFormDialogData {
  task?: Task;
}

interface TaskFormModel {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date | null;
}

const taskFormSchema = schema<TaskFormModel>((f) => {
  required(f.title, { message: "Title is required" });
  minLength(f.title, 3, { message: "Title must be at least 3 characters" });
  maxLength(f.title, 100, { message: "Title cannot exceed 100 characters" });
  required(f.description, { message: "Description is required" });
  maxLength(f.description, 500, {
    message: "Description cannot exceed 500 characters",
  });
  required(f.dueDate, { message: "Due date is required" });
});

@Component({
  selector: "app-task-form-dialog",
  templateUrl: "./task-form-dialog.html",
  styleUrl: "./task-form-dialog.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    TitleCasePipe,
  ],
})
export class TaskFormDialog {
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog>);
  private readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEdit = !!this.data.task;
  protected readonly dialogTitle = this.isEdit ? "Edit Task" : "Create Task";
  protected readonly priorities: readonly TaskPriority[] = [
    "low",
    "medium",
    "high",
  ];

  protected readonly model = signal<TaskFormModel>({
    title: this.data.task?.title ?? "",
    description: this.data.task?.description ?? "",
    priority: this.data.task?.priority ?? "medium",
    dueDate: this.data.task
      ? new Date(`${this.data.task.dueDate}T00:00:00`)
      : null,
  });

  protected readonly taskForm = form(this.model, taskFormSchema);

  protected readonly canSubmit = computed(() => this.taskForm().valid());

  protected save(): void {
    if (!this.canSubmit()) return;

    const value = this.model();
    const formData: TaskFormData = {
      title: value.title.trim(),
      description: value.description.trim(),
      priority: value.priority,
      dueDate: formatDate(value.dueDate!),
    };

    this.dialogRef.close(formData);
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
