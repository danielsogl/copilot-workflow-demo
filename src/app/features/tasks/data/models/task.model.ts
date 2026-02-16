export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface TaskMoveEvent {
  taskId: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  previousIndex: number;
  currentIndex: number;
}
