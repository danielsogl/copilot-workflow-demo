import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
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

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export const TaskStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(taskEntityConfig),
  withComputed(({ tasksEntities, searchQuery, priorityFilter }) => {
    const filteredTasks = computed(() => {
      const query = searchQuery().toLowerCase().trim();
      const priority = priorityFilter();
      return tasksEntities().filter((task) => {
        if (priority && task.priority !== priority) return false;
        if (!query) return true;
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      });
    });

    const tasksByStatus = (status: TaskStatus) =>
      computed(() =>
        filteredTasks()
          .filter((t) => t.status === status)
          .sort(byOrder),
      );

    const countByStatus = (status: TaskStatus) =>
      computed(() => tasksEntities().filter((t) => t.status === status).length);

    return {
      filteredTasks,

      todoTasks: tasksByStatus("todo"),
      inProgressTasks: tasksByStatus("in_progress"),
      completedTasks: tasksByStatus("completed"),

      totalCount: computed(() => tasksEntities().length),
      todoCount: countByStatus("todo"),
      inProgressCount: countByStatus("in_progress"),
      completedCount: countByStatus("completed"),
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

    createTask: rxMethod<TaskFormData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((taskData) => {
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

    // Move task across columns with optimistic update
    moveTask: rxMethod<{
      taskId: string;
      newStatus: TaskStatus;
      targetIndex: number;
    }>(
      pipe(
        tap(({ taskId, newStatus, targetIndex }) => {
          const movedTask = store.tasksEntities().find((t) => t.id === taskId);
          if (!movedTask) return;

          const targetColumn = store
            .tasksEntities()
            .filter((t) => t.status === newStatus && t.id !== taskId)
            .sort(byOrder);

          const reordered = [...targetColumn];
          reordered.splice(targetIndex, 0, movedTask);

          const changesById = new Map<string, Partial<Task>>();
          reordered.forEach((t, index) => {
            const changes: Partial<Task> = { order: index };
            if (t.id === taskId) {
              changes.status = newStatus;
              if (newStatus === "completed") {
                changes.completedAt = today();
              }
            }
            changesById.set(t.id, changes);
          });

          patchState(
            store,
            updateEntities(
              {
                ids: reordered.map((t) => t.id),
                changes: (entity) => changesById.get(entity.id) ?? {},
              },
              taskEntityConfig,
            ),
          );
        }),
        switchMap(({ taskId, newStatus }) => {
          const targetTasks = store
            .tasksEntities()
            .filter((t) => t.status === newStatus)
            .sort(byOrder);

          if (targetTasks.length === 0) return EMPTY;

          const apiCalls = targetTasks.map((t) => {
            const updates: Partial<Task> = { order: t.order };
            if (t.id === taskId) {
              updates.status = newStatus;
              if (newStatus === "completed") {
                updates.completedAt = today();
              }
            }
            return taskApi.updateTask(t.id, updates);
          });

          return forkJoin(apiCalls).pipe(
            tapResponse({
              next: () => undefined,
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to move task: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    // Reorder task within same column with optimistic update
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

          const reordered = [...columnTasks];
          const [moved] = reordered.splice(previousIndex, 1);
          reordered.splice(currentIndex, 0, moved);

          const orderById = new Map(reordered.map((t, index) => [t.id, index]));

          patchState(
            store,
            updateEntities(
              {
                ids: reordered.map((t) => t.id),
                changes: (entity) => ({ order: orderById.get(entity.id) ?? 0 }),
              },
              taskEntityConfig,
            ),
          );
        }),
        switchMap(({ status }) => {
          const columnTasks = store
            .tasksEntities()
            .filter((t) => t.status === status)
            .sort(byOrder);

          if (columnTasks.length === 0) return EMPTY;

          const apiCalls = columnTasks.map((t) =>
            taskApi.updateTask(t.id, { order: t.order }),
          );

          return forkJoin(apiCalls).pipe(
            tapResponse({
              next: () => undefined,
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to reorder tasks: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

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
