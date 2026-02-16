import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-dashboard-stats",
  templateUrl: "./dashboard-stats.html",
  styleUrls: ["./dashboard-stats.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
})
export class DashboardStats {
  total = input.required<number>();
  todo = input.required<number>();
  inProgress = input.required<number>();
  completed = input.required<number>();
  overdue = input.required<number>();
  completionRate = input.required<number>();
}
