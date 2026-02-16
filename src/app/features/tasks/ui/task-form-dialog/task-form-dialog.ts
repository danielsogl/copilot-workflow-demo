import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { Task, TaskFormData, TaskPriority } from "../../data/models/task.model";

export interface TaskFormDialogData {
  task?: Task;
}

@Component({
  selector: "app-task-form-dialog",
  templateUrl: "./task-form-dialog.html",
  styleUrls: ["./task-form-dialog.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    TitleCasePipe,
  ],
})
export class TaskFormDialog {
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog>);
  private readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.task;
  readonly dialogTitle = this.isEdit ? "Edit Task" : "Create Task";

  title = signal(this.data.task?.title ?? "");
  description = signal(this.data.task?.description ?? "");
  priority = signal<TaskPriority>(this.data.task?.priority ?? "medium");
  dueDate = signal<Date | null>(
    this.data.task ? new Date(this.data.task.dueDate + "T00:00:00") : null,
  );

  readonly priorities: TaskPriority[] = ["low", "medium", "high"];

  get isValid(): boolean {
    return (
      this.title().trim().length > 0 &&
      this.description().trim().length > 0 &&
      this.dueDate() !== null
    );
  }

  save(): void {
    if (!this.isValid) return;

    const formData: TaskFormData = {
      title: this.title().trim(),
      description: this.description().trim(),
      priority: this.priority(),
      dueDate: this.formatDate(this.dueDate()!),
    };

    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
