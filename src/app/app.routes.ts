import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "tasks",
    loadComponent: () =>
      import("./features/tasks/components/task-list/task-list.component").then(
        (m) => m.TaskListComponent,
      ),
  },
  {
    path: "tasks/:status",
    loadComponent: () =>
      import("./features/tasks/components/task-list/task-list.component").then(
        (m) => m.TaskListComponent,
      ),
  },
];
