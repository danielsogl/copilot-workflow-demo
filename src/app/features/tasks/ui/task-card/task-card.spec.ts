import { describe, expect, it, beforeEach, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection, ComponentRef } from "@angular/core";
import { TaskCard } from "./task-card";
import { Task } from "../../data/models/task.model";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

describe("TaskCard", () => {
  let component: TaskCard;
  let componentRef: ComponentRef<TaskCard>;
  let fixture: ComponentFixture<TaskCard>;

  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    status: "todo",
    priority: "high",
    dueDate: "2026-03-01",
    createdAt: "2026-02-01",
    order: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
      providers: [provideZonelessChangeDetection(), provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput("task", mockTask);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display the task title", () => {
    const title = fixture.nativeElement.querySelector(".task-title");
    expect(title.textContent.trim()).toBe("Test Task");
  });

  it("should display the task description", () => {
    const desc = fixture.nativeElement.querySelector(".task-description");
    expect(desc.textContent.trim()).toBe("Test Description");
  });

  it("should emit edit event", () => {
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);
    component.edit.emit(mockTask);
    expect(editSpy).toHaveBeenCalledWith(mockTask);
  });

  it("should emit delete event", () => {
    const deleteSpy = vi.fn();
    component.delete.subscribe(deleteSpy);
    component.delete.emit(mockTask);
    expect(deleteSpy).toHaveBeenCalledWith(mockTask);
  });
});
