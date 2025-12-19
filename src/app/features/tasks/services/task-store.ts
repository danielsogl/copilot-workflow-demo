import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  type,
} from "@ngrx/signals";
import {
  withEntities,
  entityConfig,
  setAllEntities,
  addEntity,
  updateEntity,
  removeEntity,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { computed, inject } from "@angular/core";
import { pipe, switchMap, tap } from "rxjs";
import { TaskApi } from "./task";
import { Task } from "../../../shared/models/task.model";

export interface TaskState {
  selectedTaskId: string | null;
  statusFilter: "all" | "pending" | "completed" | "overdue";
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  selectedTaskId: null,
  statusFilter: "all",
  loading: false,
  error: null,
};

const taskEntityConfig = entityConfig({
  entity: type<Task>(),
  collection: "tasks",
  selectId: (task: Task) => task.id,
});

export const TaskStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(taskEntityConfig),
  withComputed(
    ({ tasksEntities, tasksEntityMap, selectedTaskId, statusFilter }) => ({
      // Selected task
      selectedTask: computed(() => {
        const id = selectedTaskId();
        return id ? tasksEntityMap()[id] : undefined;
      }),

      // Total count
      totalTaskCount: computed(() => tasksEntities().length),

      // Filtered tasks by status
      filteredTasks: computed(() => {
        const tasks = tasksEntities();
        const filter = statusFilter();

        if (filter === "all") {
          return tasks;
        }

        return tasks.filter((task) => task.status === filter);
      }),

      // Statistics
      completedTasksCount: computed(
        () =>
          tasksEntities().filter((task) => task.status === "completed").length,
      ),

      pendingTasksCount: computed(
        () =>
          tasksEntities().filter((task) => task.status === "pending").length,
      ),

      overdueTasksCount: computed(
        () =>
          tasksEntities().filter((task) => task.status === "overdue").length,
      ),

      completionRate: computed(() => {
        const total = tasksEntities().length;
        if (total === 0) return 0;
        const completed = tasksEntities().filter(
          (task) => task.status === "completed",
        ).length;
        return Math.round((completed / total) * 100);
      }),
    }),
  ),
  withMethods((store, taskService = inject(TaskApi)) => ({
    // Load all tasks
    loadTasks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          taskService.getTasks().pipe(
            tapResponse({
              next: (tasks) =>
                patchState(store, setAllEntities(tasks, taskEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load tasks: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Load tasks by status
    loadTasksByStatus: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((status) =>
          taskService.getTasksByStatus(status).pipe(
            tapResponse({
              next: (tasks) =>
                patchState(store, setAllEntities(tasks, taskEntityConfig), {
                  loading: false,
                  statusFilter: status as TaskState["statusFilter"],
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load tasks: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Load single task by ID
    loadTaskById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          taskService.getTaskById(id).pipe(
            tapResponse({
              next: (task) => {
                if (task) {
                  patchState(store, addEntity(task, taskEntityConfig), {
                    loading: false,
                    selectedTaskId: task.id,
                  });
                } else {
                  patchState(store, {
                    loading: false,
                    error: "Task not found",
                  });
                }
              },
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load task: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Create task
    createTask: rxMethod<
      Omit<Task, "id" | "createdAt" | "completedAt" | "status">
    >(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((taskData) =>
          taskService.createTask(taskData).pipe(
            tapResponse({
              next: (task) =>
                patchState(store, addEntity(task, taskEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to create task: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Update task
    updateTask: rxMethod<{ id: string; updates: Partial<Task> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          taskService.updateTask(id, updates).pipe(
            tapResponse({
              next: (task) =>
                patchState(
                  store,
                  updateEntity({ id, changes: task }, taskEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update task: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Delete task
    deleteTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          taskService.deleteTask(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, removeEntity(id, taskEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to delete task: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Mark task as complete
    markTaskComplete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          taskService.markTaskComplete(id).pipe(
            tapResponse({
              next: (task) =>
                patchState(
                  store,
                  updateEntity({ id, changes: task }, taskEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to complete task: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Mark task as pending
    markTaskPending: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          taskService.markTaskPending(id).pipe(
            tapResponse({
              next: (task) =>
                patchState(
                  store,
                  updateEntity({ id, changes: task }, taskEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update task: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Update overdue tasks
    updateOverdueTasks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          taskService.updateOverdueTasks().pipe(
            tapResponse({
              next: (overdueTasks) => {
                // Update each overdue task in the store
                overdueTasks.forEach((task) => {
                  patchState(
                    store,
                    updateEntity(
                      { id: task.id, changes: { status: "overdue" } },
                      taskEntityConfig,
                    ),
                  );
                });
                patchState(store, { loading: false });
              },
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update overdue tasks: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Select task
    selectTask(taskId: string | null): void {
      patchState(store, { selectedTaskId: taskId });
    },

    // Set status filter
    setStatusFilter(status: TaskState["statusFilter"]): void {
      patchState(store, { statusFilter: status });
    },

    // Clear error
    clearError(): void {
      patchState(store, { error: null });
    },

    // Timer Methods

    // Start timer
    startTimer: rxMethod<string>(
      pipe(
        switchMap((id) => {
          const task = store.tasksEntityMap()[id];
          if (!task) return [];

          const now = new Date().toISOString();
          const updates: Partial<Task> = {
            timerStatus: "running",
            timerStartedAt: now,
          };

          return taskService.updateTask(id, updates).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity({ id, changes: updatedTask }, taskEntityConfig),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to start timer: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Pause timer
    pauseTimer: rxMethod<string>(
      pipe(
        switchMap((id) => {
          const task = store.tasksEntityMap()[id];
          if (!task || task.timerStatus !== "running") return [];

          // Calculate elapsed time since start
          const startTime = task.timerStartedAt
            ? new Date(task.timerStartedAt).getTime()
            : Date.now();
          const now = Date.now();
          const additionalMinutes = (now - startTime) / (1000 * 60);
          const totalElapsed = (task.elapsedMinutes || 0) + additionalMinutes;

          const updates: Partial<Task> = {
            timerStatus: "paused",
            elapsedMinutes: Math.floor(totalElapsed),
            timerStartedAt: undefined,
          };

          return taskService.updateTask(id, updates).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity({ id, changes: updatedTask }, taskEntityConfig),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to pause timer: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Stop timer (mark as completed)
    stopTimer: rxMethod<string>(
      pipe(
        switchMap((id) => {
          const task = store.tasksEntityMap()[id];
          if (!task) return [];

          // Calculate final elapsed time if running
          let finalElapsed = task.elapsedMinutes || 0;
          if (task.timerStatus === "running" && task.timerStartedAt) {
            const startTime = new Date(task.timerStartedAt).getTime();
            const now = Date.now();
            const additionalMinutes = (now - startTime) / (1000 * 60);
            finalElapsed += additionalMinutes;
          }

          const updates: Partial<Task> = {
            timerStatus: "completed",
            elapsedMinutes: Math.floor(finalElapsed),
            timerStartedAt: undefined,
          };

          // If elapsed time exceeds estimated time, mark task as overdue
          if (task.estimatedMinutes && finalElapsed > task.estimatedMinutes) {
            updates.status = "overdue";
          }

          return taskService.updateTask(id, updates).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity({ id, changes: updatedTask }, taskEntityConfig),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to stop timer: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Reset timer
    resetTimer: rxMethod<string>(
      pipe(
        switchMap((id) => {
          const updates: Partial<Task> = {
            timerStatus: "idle",
            elapsedMinutes: 0,
            timerStartedAt: undefined,
          };

          return taskService.updateTask(id, updates).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity({ id, changes: updatedTask }, taskEntityConfig),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to reset timer: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Todo Methods

    // Add todo
    addTodo: rxMethod<{ taskId: string; title: string }>(
      pipe(
        switchMap(({ taskId, title }) => {
          const task = store.tasksEntityMap()[taskId];
          if (!task) return [];

          const newTodo = {
            id: `todo-${Date.now()}`,
            taskId,
            title,
            completed: false,
            order: task.todos?.length || 0,
            createdAt: new Date().toISOString(),
          };

          const updatedTodos = [...(task.todos || []), newTodo];

          return taskService.updateTask(taskId, { todos: updatedTodos }).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity(
                    { id: taskId, changes: updatedTask },
                    taskEntityConfig,
                  ),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to add todo: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Toggle todo completion
    toggleTodo: rxMethod<{
      taskId: string;
      todoId: string;
      completed: boolean;
    }>(
      pipe(
        switchMap(({ taskId, todoId, completed }) => {
          const task = store.tasksEntityMap()[taskId];
          if (!task || !task.todos) return [];

          const updatedTodos = task.todos.map((todo) =>
            todo.id === todoId ? { ...todo, completed } : todo,
          );

          // Check if all todos are completed
          const allComplete =
            updatedTodos.length > 0 && updatedTodos.every((t) => t.completed);

          // Auto-complete task if all todos are done
          const updates: Partial<Task> = {
            todos: updatedTodos,
          };

          if (allComplete && task.status !== "completed") {
            updates.status = "completed";
            updates.completedAt = new Date().toISOString();
          }

          return taskService.updateTask(taskId, updates).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity(
                    { id: taskId, changes: updatedTask },
                    taskEntityConfig,
                  ),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to toggle todo: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Delete todo
    deleteTodo: rxMethod<{ taskId: string; todoId: string }>(
      pipe(
        switchMap(({ taskId, todoId }) => {
          const task = store.tasksEntityMap()[taskId];
          if (!task || !task.todos) return [];

          const updatedTodos = task.todos
            .filter((todo) => todo.id !== todoId)
            .map((todo, index) => ({ ...todo, order: index })); // Reorder remaining todos

          return taskService.updateTask(taskId, { todos: updatedTodos }).pipe(
            tapResponse({
              next: (updatedTask) =>
                patchState(
                  store,
                  updateEntity(
                    { id: taskId, changes: updatedTask },
                    taskEntityConfig,
                  ),
                ),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to delete todo: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),
  })),
);
