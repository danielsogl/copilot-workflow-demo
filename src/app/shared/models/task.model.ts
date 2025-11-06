import { Todo } from "./todo.model";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  completedAt?: string;

  // Timer fields
  estimatedMinutes?: number;
  elapsedMinutes?: number;
  timerStatus?: "idle" | "running" | "paused" | "completed";
  timerStartedAt?: string;

  // Todo list
  todos?: Todo[];
}
