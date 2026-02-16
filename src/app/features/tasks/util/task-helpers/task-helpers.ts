import { Task, TaskPriority } from "../../data/models/task.model";

export function isOverdue(task: Task): boolean {
  if (task.status === "completed") return false;
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today;
}

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getPriorityOrder(priority: TaskPriority): number {
  switch (priority) {
    case "high":
      return 0;
    case "medium":
      return 1;
    case "low":
      return 2;
  }
}
