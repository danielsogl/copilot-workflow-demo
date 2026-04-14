Feature: Theme Switcher
  As a user
  I want to choose the application theme mode
  So that I can use light, dark, or system preference

  Background:
    Given the task board is loaded with seed data

  Scenario: Switch to dark mode
    When I switch the theme mode to "dark"
    Then the color scheme should be "dark"

  Scenario: Switch to light mode
    When I switch the theme mode to "light"
    Then the color scheme should be "light"

  Scenario: Switch to system mode
    When I switch the theme mode to "system"
    Then the color scheme should be "light dark"

  Scenario: Persist selected mode after reload
    When I switch the theme mode to "dark"
    And I reload the page
    Then the selected theme mode should be "dark"
