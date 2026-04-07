import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { TaskPriority } from "../../data/models/task.model";

@Component({
  selector: "app-priority-badge",
  template: `
    <span class="badge badge--{{ priority() }}">
      {{ priority() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: var(--mat-sys-corner-large);
      font: var(--mat-sys-label-small);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge--high {
      background-color: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    .badge--medium {
      background-color: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
    }

    .badge--low {
      background-color: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }
  `,
})
export class PriorityBadge {
  readonly priority = input.required<TaskPriority>();
}
