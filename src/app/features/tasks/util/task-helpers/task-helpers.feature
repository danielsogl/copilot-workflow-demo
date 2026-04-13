Feature: Task Helper Utilities
  As a developer
  I want helper functions for task management
  So that tasks are correctly identified as overdue, dates are properly formatted, and priorities are correctly sorted

  Scenario: A past-due todo task is overdue
    Given a task with due date "2020-01-01" and status "todo"
    When I check if the task is overdue
    Then the task should be overdue

  Scenario: A completed task is never overdue regardless of its due date
    Given a task with due date "2020-01-01" and status "completed"
    When I check if the task is overdue
    Then the task should not be overdue

  Scenario: A future task is not overdue
    Given a task with due date "2099-12-31" and status "todo"
    When I check if the task is overdue
    Then the task should not be overdue

  Scenario: Format a due date for display
    Given a due date of "2025-03-15"
    When I format the due date
    Then the result should be "Mar 15, 2025"

  Scenario Outline: Priority sort order determines task ranking
    Given a priority of "<priority>"
    When I get the priority sort order
    Then the sort order should be "<order>"

    Examples:
      | priority | order |
      | high     |     0 |
      | medium   |     1 |
      | low      |     2 |
