import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { MockProvider } from "ng-mocks";
import { TaskApi } from "../infrastructure/task-api";
import { Task, TaskFormData } from "../models/task.model";
import { TaskStore } from "./task-store";

describe("TaskStore", () => {
  let store: InstanceType<typeof TaskStore>;
  let taskApi: {
    getTasks: ReturnType<typeof vi.fn<() => Observable<Task[]>>>;
    createTask: ReturnType<
      typeof vi.fn<(data: TaskFormData, order: number) => Observable<Task>>
    >;
    updateTask: ReturnType<
      typeof vi.fn<(id: string, updates: Partial<Task>) => Observable<Task>>
    >;
    deleteTask: ReturnType<typeof vi.fn<(id: string) => Observable<void>>>;
  };

  const task = (overrides: Partial<Task> & Pick<Task, "id">): Task => ({
    title: "Task",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "2099-01-01",
    createdAt: "2026-01-01",
    order: 0,
    ...overrides,
  });

  const mockTasks: Task[] = [
    task({ id: "1", title: "Write docs", status: "todo", order: 0 }),
    task({
      id: "2",
      title: "Fix bug",
      description: "urgent",
      status: "todo",
      priority: "high",
      order: 1,
    }),
    task({ id: "3", title: "Ship it", status: "in_progress", order: 0 }),
    task({ id: "4", title: "Old thing", status: "completed", order: 0 }),
  ];

  const load = (tasks: Task[] = mockTasks): void => {
    taskApi.getTasks.mockReturnValue(of(tasks));
    store.loadTasks();
    TestBed.tick();
  };

  beforeEach(() => {
    taskApi = {
      getTasks: vi.fn(() => of(mockTasks)),
      createTask: vi.fn((data, order) =>
        of(task({ id: "99", ...data, order })),
      ),
      updateTask: vi.fn((id, updates) =>
        of({
          ...(mockTasks.find((t) => t.id === id) ?? mockTasks[0]),
          ...updates,
        }),
      ),
      deleteTask: vi.fn(() => of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        provideZonelessChangeDetection(),
        MockProvider(TaskApi, taskApi as Partial<TaskApi>),
      ],
    });

    store = TestBed.inject(TaskStore);
  });

  it("starts empty and idle", () => {
    expect(store.totalCount()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.completionRate()).toBe(0);
  });

  it("loads tasks into the entity collection", () => {
    load();

    expect(store.totalCount()).toBe(4);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("reports a load failure and keeps the collection untouched", () => {
    taskApi.getTasks.mockReturnValue(throwError(() => new Error("offline")));

    store.loadTasks();
    TestBed.tick();

    expect(store.error()).toBe("Failed to load tasks: offline");
    expect(store.loading()).toBe(false);
    expect(store.totalCount()).toBe(0);
  });

  it("clears the error", () => {
    taskApi.getTasks.mockReturnValue(throwError(() => new Error("offline")));
    store.loadTasks();
    TestBed.tick();

    store.clearError();

    expect(store.error()).toBeNull();
  });

  describe("filtering", () => {
    beforeEach(() => load());

    it("matches the search query against title and description", () => {
      store.setSearchQuery("docs");
      expect(store.filteredTasks().map((t) => t.id)).toEqual(["1"]);

      store.setSearchQuery("URGENT");
      expect(store.filteredTasks().map((t) => t.id)).toEqual(["2"]);
    });

    it("filters by priority", () => {
      store.setPriorityFilter("high");

      expect(store.filteredTasks().map((t) => t.id)).toEqual(["2"]);
    });

    it("combines search and priority", () => {
      store.setSearchQuery("fix");
      store.setPriorityFilter("low");

      expect(store.filteredTasks()).toEqual([]);
    });

    it("leaves the counts unfiltered", () => {
      store.setPriorityFilter("high");

      expect(store.todoCount()).toBe(2);
      expect(store.totalCount()).toBe(4);
    });
  });

  describe("derived counts", () => {
    beforeEach(() => load());

    it("counts each column", () => {
      expect(store.todoCount()).toBe(2);
      expect(store.inProgressCount()).toBe(1);
      expect(store.completedCount()).toBe(1);
    });

    it("rounds the completion rate", () => {
      expect(store.completionRate()).toBe(25);
    });

    it("counts overdue tasks, ignoring completed ones", () => {
      load([
        task({ id: "a", dueDate: "2000-01-01" }),
        task({ id: "b", dueDate: "2000-01-01", status: "completed" }),
        task({ id: "c", dueDate: "2099-01-01" }),
      ]);

      expect(store.overdueCount()).toBe(1);
    });
  });

  describe("createTask", () => {
    it("appends after the highest order in the todo column", () => {
      load();

      store.createTask({
        title: "New",
        description: "",
        priority: "low",
        dueDate: "2099-01-01",
      });
      TestBed.tick();

      expect(taskApi.createTask).toHaveBeenCalledWith(expect.anything(), 2);
      expect(store.totalCount()).toBe(5);
    });

    it("starts at order 0 when the todo column is empty", () => {
      load([task({ id: "3", status: "in_progress" })]);

      store.createTask({
        title: "New",
        description: "",
        priority: "low",
        dueDate: "2099-01-01",
      });
      TestBed.tick();

      expect(taskApi.createTask).toHaveBeenCalledWith(expect.anything(), 0);
    });
  });

  it("removes a deleted task", () => {
    load();

    store.deleteTask("1");
    TestBed.tick();

    expect(taskApi.deleteTask).toHaveBeenCalledWith("1");
    expect(store.totalCount()).toBe(3);
  });

  describe("moveTask", () => {
    it("moves the task and renumbers the target column", () => {
      load();

      store.moveTask({ taskId: "1", newStatus: "in_progress", targetIndex: 0 });
      TestBed.tick();

      expect(store.inProgressTasks().map((t) => t.id)).toEqual(["1", "3"]);
      expect(store.inProgressTasks().map((t) => t.order)).toEqual([0, 1]);
      expect(store.todoTasks().map((t) => t.id)).toEqual(["2"]);
    });

    it("appends when the target index is past the end", () => {
      load();

      store.moveTask({ taskId: "1", newStatus: "in_progress", targetIndex: 5 });
      TestBed.tick();

      expect(store.inProgressTasks().map((t) => t.id)).toEqual(["3", "1"]);
    });

    it("stamps completedAt when a task moves to completed", () => {
      load();

      store.moveTask({ taskId: "1", newStatus: "completed", targetIndex: 0 });
      TestBed.tick();

      const moved = store.completedTasks().find((t) => t.id === "1");
      expect(moved?.completedAt).toBe(new Date().toISOString().split("T")[0]);
    });

    it("ignores an unknown task id", () => {
      load();

      store.moveTask({
        taskId: "nope",
        newStatus: "completed",
        targetIndex: 0,
      });
      TestBed.tick();

      expect(store.todoTasks().map((t) => t.id)).toEqual(["1", "2"]);
      expect(store.error()).toBeNull();
    });

    it("surfaces a persistence failure after the optimistic update", () => {
      load();
      taskApi.updateTask.mockReturnValue(throwError(() => new Error("boom")));

      store.moveTask({ taskId: "1", newStatus: "in_progress", targetIndex: 0 });
      TestBed.tick();

      expect(store.error()).toBe("Failed to move task: boom");
      expect(store.inProgressTasks().map((t) => t.id)).toEqual(["1", "3"]);
    });
  });

  describe("reorderTask", () => {
    it("renumbers the column after a move", () => {
      load();

      store.reorderTask({ status: "todo", previousIndex: 0, currentIndex: 1 });
      TestBed.tick();

      expect(store.todoTasks().map((t) => t.id)).toEqual(["2", "1"]);
      expect(store.todoTasks().map((t) => t.order)).toEqual([0, 1]);
    });

    it("persists the new order for every task in the column", () => {
      load();

      store.reorderTask({ status: "todo", previousIndex: 1, currentIndex: 0 });
      TestBed.tick();

      expect(taskApi.updateTask).toHaveBeenCalledWith("2", { order: 0 });
      expect(taskApi.updateTask).toHaveBeenCalledWith("1", { order: 1 });
    });
  });
});
