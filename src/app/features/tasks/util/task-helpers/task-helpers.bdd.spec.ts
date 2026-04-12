import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { isOverdue, formatDueDate, getPriorityOrder } from "./task-helpers";
import { Task, TaskPriority, TaskStatus } from "../../data/models/task.model";

const feature = await loadFeature("./task-helpers.feature");

function buildTask(dueDate: string, status: TaskStatus): Task {
  return {
    id: "1",
    title: "Test Task",
    description: "Test description",
    status,
    priority: "medium",
    dueDate,
    createdAt: "2025-01-01",
    order: 0,
  };
}

describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
  let task: Task;
  let overdueResult: boolean;
  let formattedDate: string;
  let priorityOrder: number;
  let currentPriority: TaskPriority;
  let currentDueDate: string;

  Scenario("A past-due todo task is overdue", ({ Given, When, Then }) => {
    Given('a task with due date "2020-01-01" and status "todo"', () => {
      task = buildTask("2020-01-01", "todo");
    });

    When("I check if the task is overdue", () => {
      overdueResult = isOverdue(task);
    });

    Then("the task should be overdue", () => {
      expect(overdueResult).toBe(true);
    });
  });

  Scenario(
    "A completed task is never overdue regardless of its due date",
    ({ Given, When, Then }) => {
      Given('a task with due date "2020-01-01" and status "completed"', () => {
        task = buildTask("2020-01-01", "completed");
      });

      When("I check if the task is overdue", () => {
        overdueResult = isOverdue(task);
      });

      Then("the task should not be overdue", () => {
        expect(overdueResult).toBe(false);
      });
    },
  );

  Scenario("A future task is not overdue", ({ Given, When, Then }) => {
    Given('a task with due date "2099-12-31" and status "todo"', () => {
      task = buildTask("2099-12-31", "todo");
    });

    When("I check if the task is overdue", () => {
      overdueResult = isOverdue(task);
    });

    Then("the task should not be overdue", () => {
      expect(overdueResult).toBe(false);
    });
  });

  Scenario("Format a due date for display", ({ Given, When, Then }) => {
    Given('a due date of "2025-03-15"', () => {
      currentDueDate = "2025-03-15";
    });

    When("I format the due date", () => {
      formattedDate = formatDueDate(currentDueDate);
    });

    Then('the result should be "Mar 15, 2025"', () => {
      expect(formattedDate).toBe("Mar 15, 2025");
    });
  });

  ScenarioOutline(
    "Priority sort order determines task ranking",
    ({ Given, When, Then }, variables) => {
      Given('a priority of "<priority>"', () => {
        currentPriority = variables["priority"] as TaskPriority;
      });

      When("I get the priority sort order", () => {
        priorityOrder = getPriorityOrder(currentPriority);
      });

      Then('the sort order should be "<order>"', () => {
        expect(priorityOrder).toBe(Number(variables["order"]));
      });
    },
  );
});
