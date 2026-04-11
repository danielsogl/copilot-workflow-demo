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
  {
    path: "assistant",
    loadComponent: () =>
      import("./features/ai-assistant/feature/assistant-page/assistant-page").then(
        (m) => m.AssistantPage,
      ),
  },
  { path: "**", redirectTo: "/board" },
];
