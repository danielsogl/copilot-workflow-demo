import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Task } from "../../data/models/task.model";
import { PriorityBadge } from "../priority-badge/priority-badge";
import { isOverdue, formatDueDate } from "../../util/task-helpers/task-helpers";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.html",
  styleUrls: ["./task-card.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    PriorityBadge,
  ],
})
export class TaskCard {
  task = input.required<Task>();
  edit = output<Task>();
  delete = output<Task>();

  overdue = computed(() => isOverdue(this.task()));
  formattedDueDate = computed(() => formatDueDate(this.task().dueDate));
}
