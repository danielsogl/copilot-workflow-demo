import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { CdkDragDrop, CdkDropListGroup } from "@angular/cdk/drag-drop";
import { Task, TaskStatus } from "../../data/models/task.model";
import { TaskColumn } from "../task-column/task-column";

@Component({
  selector: "app-task-board",
  templateUrl: "./task-board.html",
  styleUrl: "./task-board.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropListGroup, TaskColumn],
})
export class TaskBoard {
  readonly todoTasks = input.required<Task[]>();
  readonly inProgressTasks = input.required<Task[]>();
  readonly completedTasks = input.required<Task[]>();

  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();
  readonly moveTask = output<{
    taskId: string;
    newStatus: TaskStatus;
    targetIndex: number;
  }>();
  readonly reorderTask = output<{
    status: TaskStatus;
    previousIndex: number;
    currentIndex: number;
  }>();

  protected readonly connectedLists: string[] = [
    "column-todo",
    "column-in_progress",
    "column-completed",
  ];

  protected onTaskDropped(
    event: CdkDragDrop<Task[]>,
    targetStatus: TaskStatus,
  ): void {
    const task = event.item.data as Task;

    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      this.reorderTask.emit({
        status: targetStatus,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
      });
      return;
    }

    this.moveTask.emit({
      taskId: task.id,
      newStatus: targetStatus,
      targetIndex: event.currentIndex,
    });
  }
}
