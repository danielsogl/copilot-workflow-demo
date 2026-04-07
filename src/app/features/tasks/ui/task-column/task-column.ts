import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { CdkDrag, CdkDragDrop, CdkDropList } from "@angular/cdk/drag-drop";
import { Task, TaskStatus } from "../../data/models/task.model";
import { TaskCard } from "../task-card/task-card";

@Component({
  selector: "app-task-column",
  templateUrl: "./task-column.html",
  styleUrl: "./task-column.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, TaskCard],
})
export class TaskColumn {
  readonly title = input.required<string>();
  readonly status = input.required<TaskStatus>();
  readonly tasks = input.required<Task[]>();
  readonly connectedTo = input<string[]>([]);

  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();
  readonly taskDropped = output<CdkDragDrop<Task[]>>();

  protected readonly dropListId = computed(() => `column-${this.status()}`);

  protected onDrop(event: CdkDragDrop<Task[]>): void {
    this.taskDropped.emit(event);
  }
}
