import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { CdkDropList, CdkDrag, CdkDragDrop } from "@angular/cdk/drag-drop";
import { Task, TaskStatus } from "../../data/models/task.model";
import { TaskCard } from "../task-card/task-card";

@Component({
  selector: "app-task-column",
  templateUrl: "./task-column.html",
  styleUrls: ["./task-column.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, TaskCard],
})
export class TaskColumn {
  title = input.required<string>();
  status = input.required<TaskStatus>();
  tasks = input.required<Task[]>();
  connectedTo = input<string[]>([]);

  editTask = output<Task>();
  deleteTask = output<Task>();
  taskDropped = output<CdkDragDrop<Task[]>>();

  get dropListId(): string {
    return `column-${this.status()}`;
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    this.taskDropped.emit(event);
  }
}
