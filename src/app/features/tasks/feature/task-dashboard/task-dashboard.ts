import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { TaskStore } from "../../data/state/task-store";
import {
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
} from "../../data/models/task.model";
import { DashboardStats } from "../../ui/dashboard-stats/dashboard-stats";
import { TaskFilters } from "../../ui/task-filters/task-filters";
import { TaskBoard } from "../../ui/task-board/task-board";
import {
  TaskFormDialog,
  TaskFormDialogData,
} from "../../ui/task-form-dialog/task-form-dialog";
import {
  ConfirmDialog,
  ConfirmDialogData,
} from "../../ui/confirm-dialog/confirm-dialog";

@Component({
  selector: "app-task-dashboard",
  templateUrl: "./task-dashboard.html",
  styleUrls: ["./task-dashboard.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DashboardStats,
    TaskFilters,
    TaskBoard,
  ],
})
export class TaskDashboard {
  readonly store = inject(TaskStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.store.loadTasks();

    effect(() => {
      const error = this.store.error();
      if (error) {
        this.snackBar.open(error, "Dismiss", { duration: 5000 });
        this.store.clearError();
      }
    });
  }

  onSearchChange(query: string): void {
    this.store.setSearchQuery(query);
  }

  onPriorityFilter(priority: TaskPriority | null): void {
    this.store.setPriorityFilter(priority);
  }

  onMoveTask(event: {
    taskId: string;
    newStatus: TaskStatus;
    targetIndex: number;
  }): void {
    this.store.moveTask(event);
  }

  onReorderTask(event: {
    status: TaskStatus;
    previousIndex: number;
    currentIndex: number;
  }): void {
    this.store.reorderTask(event);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskFormDialog, {
      data: {} as TaskFormDialogData,
      width: "500px",
      panelClass: "task-dialog",
    });

    dialogRef.afterClosed().subscribe((result: TaskFormData | undefined) => {
      if (result) {
        this.store.createTask(result);
        this.snackBar.open("Task created", "Dismiss", { duration: 3000 });
      }
    });
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskFormDialog, {
      data: { task } as TaskFormDialogData,
      width: "500px",
      panelClass: "task-dialog",
    });

    dialogRef.afterClosed().subscribe((result: TaskFormData | undefined) => {
      if (result) {
        this.store.updateTask({ id: task.id, updates: result });
        this.snackBar.open("Task updated", "Dismiss", { duration: 3000 });
      }
    });
  }

  confirmDelete(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: "Delete Task",
        message: `Are you sure you want to delete "${task.title}"?`,
        confirmLabel: "Delete",
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.store.deleteTask(task.id);
        this.snackBar.open("Task deleted", "Dismiss", { duration: 3000 });
      }
    });
  }
}
