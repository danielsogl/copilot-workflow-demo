import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { TaskPriority } from "../../data/models/task.model";

@Component({
  selector: "app-priority-badge",
  template: `
    <span class="badge" [class]="'badge--' + priority()">
      {{ priority() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge--high {
      background-color: #fde8e8;
      color: #e53935;
    }

    .badge--medium {
      background-color: #fff8e1;
      color: #f57f17;
    }

    .badge--low {
      background-color: #e8f5e9;
      color: #43a047;
    }
  `,
})
export class PriorityBadge {
  priority = input.required<TaskPriority>();
}
