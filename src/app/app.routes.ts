import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard").then((m) => m.Dashboard),
  },
  {
    path: "tasks",
    loadComponent: () =>
      import("./features/tasks/ui/task-list/task-list").then((m) => m.TaskList),
  },
  {
    path: "tasks/:status",
    loadComponent: () =>
      import("./features/tasks/ui/task-list/task-list").then((m) => m.TaskList),
  },
  {
    path: "persons",
    loadComponent: () =>
      import("./features/person/components/person-list/person-list").then(
        (m) => m.PersonList,
      ),
  },
];
