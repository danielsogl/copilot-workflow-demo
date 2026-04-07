import {
  ChangeDetectionStrategy,
  Component,
  model,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatChip, MatChipSet } from "@angular/material/chips";
import { TaskPriority } from "../../data/models/task.model";

@Component({
  selector: "app-task-filters",
  templateUrl: "./task-filters.html",
  styleUrl: "./task-filters.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatIcon,
    MatIconButton,
    MatChipSet,
    MatChip,
  ],
})
export class TaskFilters {
  readonly searchQuery = model("");
  readonly priorityChange = output<TaskPriority | null>();

  protected readonly selectedPriority = signal<TaskPriority | null>(null);
  protected readonly priorities: readonly TaskPriority[] = [
    "high",
    "medium",
    "low",
  ];

  protected togglePriority(priority: TaskPriority): void {
    const next = this.selectedPriority() === priority ? null : priority;
    this.selectedPriority.set(next);
    this.priorityChange.emit(next);
  }
}
