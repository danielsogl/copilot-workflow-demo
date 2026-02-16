import { describe, expect, it, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TaskApi } from "./task-api";
import { Task } from "../models/task.model";

describe("TaskApi", () => {
  let service: TaskApi;
  let httpTesting: HttpTestingController;

  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Test Task",
      description: "Description",
      status: "todo",
      priority: "high",
      dueDate: "2026-03-01",
      createdAt: "2026-02-01",
      order: 0,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TaskApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it("should fetch all tasks", () => {
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpTesting.expectOne("http://localhost:3000/tasks");
    expect(req.request.method).toBe("GET");
    req.flush(mockTasks);
  });

  it("should create a task", () => {
    const formData = {
      title: "New Task",
      description: "New Desc",
      priority: "medium" as const,
      dueDate: "2026-03-15",
    };

    service.createTask(formData, 0).subscribe((task) => {
      expect(task.title).toBe("New Task");
    });

    const req = httpTesting.expectOne("http://localhost:3000/tasks");
    expect(req.request.method).toBe("POST");
    expect(req.request.body.status).toBe("todo");
    req.flush({
      ...formData,
      id: "2",
      status: "todo",
      order: 0,
      createdAt: "2026-02-16",
    });
  });

  it("should update a task", () => {
    service.updateTask("1", { title: "Updated" }).subscribe((task) => {
      expect(task.title).toBe("Updated");
    });

    const req = httpTesting.expectOne("http://localhost:3000/tasks/1");
    expect(req.request.method).toBe("PATCH");
    req.flush({ ...mockTasks[0], title: "Updated" });
  });

  it("should delete a task", () => {
    service.deleteTask("1").subscribe();

    const req = httpTesting.expectOne("http://localhost:3000/tasks/1");
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });
});
