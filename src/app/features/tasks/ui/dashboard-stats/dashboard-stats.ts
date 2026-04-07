import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-dashboard-stats",
  templateUrl: "./dashboard-stats.html",
  styleUrl: "./dashboard-stats.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatIcon],
})
export class DashboardStats {
  readonly total = input.required<number>();
  readonly todo = input.required<number>();
  readonly inProgress = input.required<number>();
  readonly completed = input.required<number>();
  readonly overdue = input.required<number>();
  readonly completionRate = input.required<number>();
}
