import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { CdkDropListGroup, CdkDragDrop } from "@angular/cdk/drag-drop";
import { Task, TaskStatus } from "../../data/models/task.model";
import { TaskColumn } from "../task-column/task-column";

@Component({
  selector: "app-task-board",
  templateUrl: "./task-board.html",
  styleUrls: ["./task-board.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropListGroup, TaskColumn],
})
export class TaskBoard {
  todoTasks = input.required<Task[]>();
  inProgressTasks = input.required<Task[]>();
  completedTasks = input.required<Task[]>();

  editTask = output<Task>();
  deleteTask = output<Task>();
  moveTask = output<{
    taskId: string;
    newStatus: TaskStatus;
    targetIndex: number;
  }>();
  reorderTask = output<{
    status: TaskStatus;
    previousIndex: number;
    currentIndex: number;
  }>();

  readonly connectedLists = [
    "column-todo",
    "column-in_progress",
    "column-completed",
  ];

  onTaskDropped(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    const task = event.item.data as Task;

    if (event.previousContainer === event.container) {
      // Same column reorder
      if (event.previousIndex !== event.currentIndex) {
        this.reorderTask.emit({
          status: targetStatus,
          previousIndex: event.previousIndex,
          currentIndex: event.currentIndex,
        });
      }
    } else {
      // Cross-column move
      this.moveTask.emit({
        taskId: task.id,
        newStatus: targetStatus,
        targetIndex: event.currentIndex,
      });
    }
  }
}
