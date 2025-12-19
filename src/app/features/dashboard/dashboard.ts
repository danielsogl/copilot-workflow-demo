import { Component } from "@angular/core";
import { DashboardOverview } from "./ui/dashboard-overview/dashboard-overview";

@Component({
  selector: "app-dashboard",
  template: "<app-dashboard-overview></app-dashboard-overview>",
  imports: [DashboardOverview],
})
export class Dashboard {}
