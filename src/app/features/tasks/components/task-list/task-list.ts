import { Component, OnInit, inject, effect } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DatePipe, TitleCasePipe } from "@angular/common";
import { TaskStore } from "../../services/task-store";
import { TaskCreateModal } from "../task-create-modal/task-create-modal";
import { TaskEditModal } from "../task-edit-modal/task-edit-modal";
import { Task } from "../../../../shared/models/task.model";

@Component({
  selector: "app-task-list",
  templateUrl: "./task-list.html",
  styleUrl: "./task-list.scss",
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe,
    TitleCasePipe,
  ],
})
export class TaskList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly taskStore = inject(TaskStore);
  private readonly dialog = inject(MatDialog);

  readonly routeParams = toSignal(this.route.params);

  readonly displayedColumns = [
    "title",
    "status",
    "priority",
    "dueDate",
    "actions",
  ];

  readonly statusLabels: Record<string, string> = {
    all: "All Tasks",
    pending: "Pending Tasks",
    completed: "Completed Tasks",
    overdue: "Overdue Tasks",
  };

  readonly priorityColors: Record<string, string> = {
    low: "accent",
    medium: "primary",
    high: "warn",
  };

  readonly statusColors: Record<string, string> = {
    pending: "primary",
    completed: "accent",
    overdue: "warn",
  };

  constructor() {
    // React to route param changes and load tasks accordingly
    effect(() => {
      const params = this.routeParams();
      const status = params?.["status"] || "all";

      // Update store filter and load tasks
      this.taskStore.setStatusFilter(
        status as "all" | "pending" | "completed" | "overdue",
      );
      this.taskStore.loadTasksByStatus(status);
    });
  }

  ngOnInit(): void {
    // Initial load if no route params
    if (!this.routeParams()?.["status"]) {
      this.taskStore.loadTasks();
    }
  }

  openCreateTaskModal(): void {
    const dialogRef = this.dialog.open(TaskCreateModal, {
      width: "500px",
      maxWidth: "90vw",
      disableClose: false,
      autoFocus: true,
      panelClass: "task-modal",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Task is created in the modal via store, no need to refresh
        // The store automatically updates with the new task
      }
    });
  }

  openEditTaskModal(task: Task): void {
    const dialogRef = this.dialog.open(TaskEditModal, {
      width: "500px",
      maxWidth: "90vw",
      disableClose: false,
      autoFocus: true,
      panelClass: "task-modal",
      data: task,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Task is updated in the modal via store, no need to refresh
        // The store automatically updates with the changes
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    if (task.status === "completed") {
      this.taskStore.markTaskPending(task.id);
    } else {
      this.taskStore.markTaskComplete(task.id);
    }
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskStore.deleteTask(task.id);
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: "schedule",
      completed: "check_circle",
      overdue: "warning",
    };
    return icons[status] || "help";
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      low: "keyboard_arrow_down",
      medium: "remove",
      high: "keyboard_arrow_up",
    };
    return icons[priority] || "remove";
  }

  isOverdue(task: Task): boolean {
    const today = new Date().toISOString().split("T")[0];
    return task.status !== "completed" && task.dueDate < today;
  }

  goToDashboard(): void {
    this.router.navigate(["/dashboard"]);
  }
}
