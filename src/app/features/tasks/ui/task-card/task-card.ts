import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatTooltip } from "@angular/material/tooltip";
import { Task } from "../../data/models/task.model";
import { PriorityBadge } from "../priority-badge/priority-badge";
import { formatDueDate, isOverdue } from "../../util/task-helpers/task-helpers";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.html",
  styleUrl: "./task-card.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    PriorityBadge,
  ],
})
export class TaskCard {
  readonly task = input.required<Task>();
  readonly edit = output<Task>();
  readonly delete = output<Task>();

  protected readonly overdue = computed(() => isOverdue(this.task()));
  protected readonly formattedDueDate = computed(() =>
    formatDueDate(this.task().dueDate),
  );
}
