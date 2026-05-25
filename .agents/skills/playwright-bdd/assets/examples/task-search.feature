@desktop @search
Feature: Task search
  As a user with many tasks
  I want to search by title and filter by priority
  So that I can find work quickly

  Background:
    Given the task board is loaded with seed data

  Scenario: Find a task by exact title
    When I search for "Complete project proposal"
    Then I should see "Complete project proposal" in the results
    And I should see 1 search result

  Scenario Outline: Filter results by priority
    When I search for "task"
    And I filter results by "<priority>" priority
    Then every visible result should have priority "<priority>"

    Examples:
      | priority |
      | high     |
      | medium   |
      | low      |

  @slow
  Scenario: Searching for an unknown term shows the empty state
    When I search for "nonexistent-task-zzz"
    Then I should see the empty state message "No tasks match your search"
