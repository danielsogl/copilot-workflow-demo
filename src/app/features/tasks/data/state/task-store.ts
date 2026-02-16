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
import { EMPTY, forkJoin, pipe, switchMap, tap } from "rxjs";
import { TaskApi } from "../infrastructure/task-api";
import {
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
} from "../models/task.model";
import { isOverdue } from "../../util/task-helpers/task-helpers";

export interface TaskState {
  searchQuery: string;
  priorityFilter: TaskPriority | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  searchQuery: "",
  priorityFilter: null,
  loading: false,
  error: null,
};

const taskEntityConfig = entityConfig({
  entity: type<Task>(),
  collection: "tasks",
  selectId: (task: Task) => task.id,
});

const byOrder = (a: Task, b: Task) => a.order - b.order;

export const TaskStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(taskEntityConfig),
  withComputed(({ tasksEntities, searchQuery, priorityFilter }) => {
    const filteredTasks = computed(() => {
      let tasks = tasksEntities();
      const query = searchQuery().toLowerCase().trim();
      const priority = priorityFilter();

      if (query) {
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description.toLowerCase().includes(query),
        );
      }

      if (priority) {
        tasks = tasks.filter((task) => task.priority === priority);
      }

      return tasks;
    });

    return {
      filteredTasks,

      todoTasks: computed(() =>
        filteredTasks()
          .filter((t) => t.status === "todo")
          .sort(byOrder),
      ),
      inProgressTasks: computed(() =>
        filteredTasks()
          .filter((t) => t.status === "in_progress")
          .sort(byOrder),
      ),
      completedTasks: computed(() =>
        filteredTasks()
          .filter((t) => t.status === "completed")
          .sort(byOrder),
      ),

      // Stats
      totalCount: computed(() => tasksEntities().length),
      todoCount: computed(
        () => tasksEntities().filter((t) => t.status === "todo").length,
      ),
      inProgressCount: computed(
        () => tasksEntities().filter((t) => t.status === "in_progress").length,
      ),
      completedCount: computed(
        () => tasksEntities().filter((t) => t.status === "completed").length,
      ),
      overdueCount: computed(
        () => tasksEntities().filter((t) => isOverdue(t)).length,
      ),
      completionRate: computed(() => {
        const total = tasksEntities().length;
        if (total === 0) return 0;
        const completed = tasksEntities().filter(
          (t) => t.status === "completed",
        ).length;
        return Math.round((completed / total) * 100);
      }),
    };
  }),
  withMethods((store, taskApi = inject(TaskApi)) => ({
    // Load all tasks
    loadTasks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          taskApi.getTasks().pipe(
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

    // Create task
    createTask: rxMethod<TaskFormData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((taskData) => {
          // New tasks get order = max order in their column + 1
          const maxOrder = store
            .tasksEntities()
            .filter((t) => t.status === "todo")
            .reduce((max, t) => Math.max(max, t.order), -1);
          return taskApi.createTask(taskData, maxOrder + 1).pipe(
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
          );
        }),
      ),
    ),

    // Update task
    updateTask: rxMethod<{ id: string; updates: Partial<Task> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          taskApi.updateTask(id, updates).pipe(
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

    // Move task to another column (optimistic update)
    moveTask: rxMethod<{
      taskId: string;
      newStatus: TaskStatus;
      targetIndex: number;
    }>(
      pipe(
        tap(({ taskId, newStatus, targetIndex }) => {
          // Get tasks in the target column, sorted by order
          const targetTasks = store
            .tasksEntities()
            .filter((t) => t.status === newStatus && t.id !== taskId)
            .sort(byOrder);

          // Recalculate order for all tasks in target column
          const updates: { id: string; changes: Partial<Task> }[] = [];

          // Insert moved task at targetIndex
          const reordered = [...targetTasks];
          const movedTask = store.tasksEntities().find((t) => t.id === taskId);
          if (!movedTask) return;

          reordered.splice(targetIndex, 0, movedTask);

          reordered.forEach((t, i) => {
            const changes: Partial<Task> = { order: i };
            if (t.id === taskId) {
              changes.status = newStatus;
              if (newStatus === "completed") {
                changes.completedAt = new Date().toISOString().split("T")[0];
              }
            }
            updates.push({ id: t.id, changes });
          });

          // Optimistic: apply all updates at once
          for (const u of updates) {
            patchState(
              store,
              updateEntity({ id: u.id, changes: u.changes }, taskEntityConfig),
            );
          }
        }),
        switchMap(({ taskId, newStatus }) => {
          const targetTasks = store
            .tasksEntities()
            .filter((t) => t.status === newStatus)
            .sort(byOrder);

          // Persist all order changes
          const apiCalls = targetTasks.map((t) => {
            const updates: Partial<Task> = { order: t.order };
            if (t.id === taskId) {
              updates.status = newStatus;
              if (newStatus === "completed") {
                updates.completedAt = new Date().toISOString().split("T")[0];
              }
            }
            return taskApi.updateTask(t.id, updates);
          });

          if (apiCalls.length === 0) return EMPTY;

          return forkJoin(apiCalls).pipe(
            tapResponse({
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              next: () => {},
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to move task: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Reorder task within same column (optimistic update)
    reorderTask: rxMethod<{
      status: TaskStatus;
      previousIndex: number;
      currentIndex: number;
    }>(
      pipe(
        tap(({ status, previousIndex, currentIndex }) => {
          const columnTasks = store
            .tasksEntities()
            .filter((t) => t.status === status)
            .sort(byOrder);

          // Move item in array
          const reordered = [...columnTasks];
          const [moved] = reordered.splice(previousIndex, 1);
          reordered.splice(currentIndex, 0, moved);

          // Update order for all tasks in column
          for (let i = 0; i < reordered.length; i++) {
            patchState(
              store,
              updateEntity(
                { id: reordered[i].id, changes: { order: i } },
                taskEntityConfig,
              ),
            );
          }
        }),
        switchMap(({ status }) => {
          // Persist new order
          const columnTasks = store
            .tasksEntities()
            .filter((t) => t.status === status)
            .sort(byOrder);

          const apiCalls = columnTasks.map((t) =>
            taskApi.updateTask(t.id, { order: t.order }),
          );

          if (apiCalls.length === 0) return EMPTY;

          return forkJoin(apiCalls).pipe(
            tapResponse({
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              next: () => {},
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to reorder tasks: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Delete task
    deleteTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          taskApi.deleteTask(id).pipe(
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

    // Synchronous methods
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },

    setPriorityFilter(priority: TaskPriority | null): void {
      patchState(store, { priorityFilter: priority });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
