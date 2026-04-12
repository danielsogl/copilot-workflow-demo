Feature: Task Management
  As a user
  I want to manage my tasks on the Kanban board
  So that I can track my work effectively

  Background:
    Given the task board is loaded with seed data

  Scenario: View tasks in all three columns
    Then I should see tasks in the "To Do" column
    And I should see tasks in the "In Progress" column
    And I should see tasks in the "Done" column

  Scenario: Create a new task
    When I open the create task dialog
    And I fill in the title "BDD E2E Test Task"
    And I fill in the description "Created via a BDD scenario"
    And I select "High" as the priority
    And I set the due date to "03/15/2026"
    And I submit the form
    Then I should see "BDD E2E Test Task" in the "To Do" column

  Scenario: Filter tasks by priority
    When I filter tasks by "high" priority
    Then I should only see high priority tasks
    And I should not see low priority tasks
