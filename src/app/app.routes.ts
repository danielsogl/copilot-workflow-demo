import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "/board", pathMatch: "full" },
  {
    path: "board",
    loadComponent: () =>
      import("./features/tasks/feature/task-dashboard/task-dashboard").then(
        (m) => m.TaskDashboard,
      ),
  },
  { path: "**", redirectTo: "/board" },
];
