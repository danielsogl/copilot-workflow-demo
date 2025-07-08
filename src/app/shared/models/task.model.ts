export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}
