import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-stats-card',
  templateUrl: './dashboard-stats-card.component.html',
  styleUrl: './dashboard-stats-card.component.scss',
  imports: [MatCardModule, MatIconModule]
})
export class DashboardStatsCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<string>();
  readonly color = input<string>('primary');
  readonly suffix = input<string>('');
}
