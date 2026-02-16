import {
  ChangeDetectionStrategy,
  Component,
  model,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { TaskPriority } from "../../data/models/task.model";

@Component({
  selector: "app-task-filters",
  templateUrl: "./task-filters.html",
  styleUrls: ["./task-filters.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
  ],
})
export class TaskFilters {
  searchQuery = model("");
  priorityChange = output<TaskPriority | null>();

  selectedPriority: TaskPriority | null = null;

  readonly priorities: TaskPriority[] = ["high", "medium", "low"];

  togglePriority(priority: TaskPriority): void {
    this.selectedPriority =
      this.selectedPriority === priority ? null : priority;
    this.priorityChange.emit(this.selectedPriority);
  }
}
