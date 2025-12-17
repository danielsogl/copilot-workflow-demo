import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "tasks",
    loadComponent: () =>
      import("./features/tasks/components/task-list/task-list").then(
        (m) => m.TaskListComponent,
      ),
  },
  {
    path: "tasks/:status",
    loadComponent: () =>
      import("./features/tasks/components/task-list/task-list").then(
        (m) => m.TaskListComponent,
      ),
  },
];
