// Proposed update to src/app/app.routes.ts — adds the /shop route.
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
    path: "shop",
    loadComponent: () =>
      import("./features/shop/feature/shop-list/shop-list").then(
        (m) => m.ShopList,
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
