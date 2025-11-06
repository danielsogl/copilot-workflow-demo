import { Component, Input, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDividerModule } from "@angular/material/divider";
import { TodoItemComponent } from "../todo-item/todo-item.component";
import { TodoCreateFormComponent } from "../todo-create-form/todo-create-form.component";
import { TaskStore } from "../../services/task.store";
import { Todo } from "../../../../shared/models/todo.model";

@Component({
  selector: "app-todo-list",
  templateUrl: "./todo-list.component.html",
  styleUrl: "./todo-list.component.scss",
  imports: [
    MatCardModule,
    MatProgressBarModule,
    MatDividerModule,
    TodoItemComponent,
    TodoCreateFormComponent,
  ],
})
export class TodoListComponent {
  private readonly taskStore = inject(TaskStore);

  @Input({ required: true }) taskId!: string;

  // Get task and its todos
  readonly task = computed(() => this.taskStore.tasksEntityMap()[this.taskId]);
  readonly todos = computed(() => {
    const task = this.task();
    return task?.todos?.sort((a, b) => a.order - b.order) || [];
  });

  // Todo statistics
  readonly totalTodos = computed(() => this.todos().length);
  readonly completedTodos = computed(
    () => this.todos().filter((todo) => todo.completed).length,
  );
  readonly completionPercentage = computed(() => {
    const total = this.totalTodos();
    if (total === 0) return 0;
    return Math.round((this.completedTodos() / total) * 100);
  });

  // State
  readonly hasTodos = computed(() => this.totalTodos() > 0);
  readonly allComplete = computed(
    () => this.totalTodos() > 0 && this.completedTodos() === this.totalTodos(),
  );

  // Actions
  onCreateTodo(title: string): void {
    this.taskStore.addTodo({ taskId: this.taskId, title });
  }

  onToggleTodo(todo: Todo): void {
    this.taskStore.toggleTodo({
      taskId: this.taskId,
      todoId: todo.id,
      completed: !todo.completed,
    });
  }

  onDeleteTodo(todo: Todo): void {
    if (confirm(`Delete "${todo.title}"?`)) {
      this.taskStore.deleteTodo({ taskId: this.taskId, todoId: todo.id });
    }
  }
}
