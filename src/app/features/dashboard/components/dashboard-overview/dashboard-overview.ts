import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { TaskStore } from "../../../tasks/services/task-store";
import { DashboardStatsCardComponent } from "../dashboard-stats-card/dashboard-stats-card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-dashboard-overview",
  templateUrl: "./dashboard-overview.html",
  styleUrl: "./dashboard-overview.scss",
  imports: [DashboardStatsCardComponent, MatProgressSpinnerModule],
})
export class DashboardOverviewComponent implements OnInit {
  readonly taskStore = inject(TaskStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Load tasks from store
    this.taskStore.loadTasks();
  }

  onCardClick(filterType: string): void {
    this.router.navigate(["/tasks", filterType]);
  }
}
