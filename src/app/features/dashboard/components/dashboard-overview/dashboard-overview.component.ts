import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStatsCardComponent } from '../dashboard-stats-card/dashboard-stats-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardStats } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
  imports: [DashboardStatsCardComponent, MatProgressSpinnerModule]
})
export class DashboardOverviewComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly stats = toSignal(this.dashboardService.getDashboardStats(), {
    initialValue: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 0
    } as DashboardStats
  });

  readonly hasData = computed(() => this.stats().totalTasks > 0);

  ngOnInit(): void {
    // Simulate loading state
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }
}
