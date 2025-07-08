import { Component } from '@angular/core';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';

@Component({
  selector: 'app-dashboard',
  template: '<app-dashboard-overview></app-dashboard-overview>',
  imports: [DashboardOverviewComponent]
})
export class DashboardComponent {}
