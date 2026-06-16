---
name: bdd
description: Write disciplined Behavior-Driven Development specs and tests with Gherkin / Cucumber. Use whenever the user mentions BDD, Gherkin, Cucumber, .feature files, Given/When/Then, scenarios, Scenario Outline, Background, step definitions, acceptance criteria, executable specifications, living documentation, the Three Amigos, or Example Mapping. Also trigger when the user asks to "write tests in plain English", convert acceptance criteria into tests, design step definitions, refactor an imperative or UI-coupled feature file, or wire up BDD with Vitest (unit/component) or Playwright (end-to-end). Do NOT use for pure unit tests with no business-readable contract, pure performance/load tests, or generic test-framework questions unrelated to behavior specs.
---

# Behavior-Driven Development (BDD)

Produces feature files that read like behavior, step definitions that don't leak implementation, and an honest call on when BDD pays for itself. The body is tool-agnostic — load the relevant reference for Vitest or Playwright.

## When to use this skill

- The user names a BDD concept: **BDD**, **Gherkin**, **Cucumber**, **`.feature`**, **Given/When/Then**, **Scenario Outline**, **Background**, **Rule**, **step definitions**, **executable specifications**, **living documentation**, **Three Amigos**, **Example Mapping**.
- The user wants to turn acceptance criteria into tests, write tests in plain English, or refactor a `.feature` file.
- **Vitest + BDD** → also load `references/vitest.md`. **Playwright + BDD** → also load `references/playwright.md`.
- **Setting up either from zero** → load `references/install-vitest.md` or `references/install-playwright.md`.

Skip for: unit tests with no business audience, performance/load tests, internal refactors, or generic test-framework questions.

## Gherkin cheat sheet

```gherkin
@checkout                             # tag (selection + tagged hooks)
Feature: Guest checkout
  As a visitor                         # free-form preamble (not executable)
  ...
  Background:                          # Given steps run before every Scenario in this file
    Given the storefront is online

  Rule: Tax is applied per region      # Gherkin 6 — groups scenarios by business rule
    @smoke
    Scenario Outline: Tax for <region>
      When  Patty adds a "Bluetooth Speaker" to her cart
      And   she checks out shipping to "<region>"
      Then  the displayed tax rate is "<rate>"

      Examples:
        | region          | rate |
        | California, US  | 8.5% |
        | Berlin, DE      | 19%  |
```

| Keyword                          | Use for                                                                    | Don't use for                                                |
|----------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------|
| `Rule:` (Gherkin 6+)             | Group scenarios that illustrate **one business rule**.                     | A feature with only one rule.                                |
| `Background:`                    | `Given` steps shared by every scenario in the file/Rule.                  | Anything containing a `When`.                                |
| `Scenario:` / `Example:`         | **One behavior.** `Example:` preferred in Gherkin 6+.                      | Multiple outcomes glued by `And`.                            |
| `Scenario Outline:` + `Examples:`| Same steps, varied by **business-meaningful** data with **domain-named columns**. | Exhaustive boundary testing; rows with technical column names like `pw`/`result`. |
| `Given` / `When` / `Then`        | Context / action / observable outcome.                                     | More than one `When` per scenario.                           |
| `@tag`                           | Selective execution, tagged hooks.                                         | Control flow / `if` on tags inside steps.                    |

## The three rules that move output quality

These are the patterns that distinguish disciplined BDD from "Gherkin-shaped" output. Each is what the model gets wrong by default if you don't insist.

### 1. Declarative + third-person voice

Steps describe **what** the system does, not **how** the user clicks. Voice is third-person/persona (`she`, `Patty`, `a shopper`) — never first-person `I`. Litmus test: *would this wording change if the implementation changed?* If yes, rewrite.

```gherkin
# ❌ Wrong — imperative, UI-coupled, first-person; breaks on a CSS rename
Scenario: User registers
  Given I navigate to "/signup"
  When  I enter "jane@acme.com" in the "#email" field
  And   I click the "Create account" button
  Then  the URL should be "/welcome"

# ✅ Right — declarative, third-person, survives UI rewrite
Scenario: A new visitor completes registration
  Given Jane is a new visitor
  When  she registers with a valid email and password
  Then  she is signed in
```

### 2. One behavior per scenario; `Rule:` to group

Multiple `When`s usually mean two scenarios pretending to be one. Split them; use `Rule:` to make the policy structure explicit. The first-line test: if you'd write a scenario title containing "and", split it.

```gherkin
# ❌ Wrong — three orthogonal outcomes; one failure can't tell you which rule broke
Scenario: Checkout
  Given Patty has a cart with a $40 item
  When  she applies the coupon "SAVE10"
  And   she pays with her saved Visa
  Then  the order total is $36
  And   a confirmation email is sent
  And   the inventory count drops by 1

# ✅ Right — each rule gets its own scenario under a Rule: block
Rule: Coupons apply before payment
  Example: A valid coupon reduces the order total
    Given Patty has a cart with a $40 item
    When  she applies the coupon "SAVE10"
    Then  her order total is $36

Rule: Successful checkout notifies customer and warehouse
  Example: Confirmation email is sent on successful payment
    Given Patty has a paid order
    Then  she receives a confirmation email
```

### 3. `Scenario Outline` columns are domain-named, not technical

Use Outline when **the steps are identical** and **each row is a business-meaningful variation**. Column headers are **domain concepts** (`missing requirement`, `region`), not literal values dressed up (`pw`, `result`). When the table starts looking like fuzz-test input, push it to a unit test.

```gherkin
# ❌ Wrong — Outline as unit-test substitute; columns are technical
Scenario Outline: Password validation
  When I submit the password "<pw>"
  Then the result is "<result>"

  Examples:
    | pw         | result  |
    | a          | invalid |
    | Aaaaaaa1!  | valid   |
    | ...20 rows | ...     |

# ✅ Right — domain-named column; exhaustive cases go to a unit test
Rule: Passwords must satisfy the corporate strength policy
  Scenario Outline: Sign-up rejects a password that is <missing requirement>
    Given Jane is signing up
    When  she submits a password that is <missing requirement>
    Then  sign-up is rejected with a message about <missing requirement>

    Examples: Strength policy violations
      | missing requirement   |
      | too short             |
      | missing an uppercase  |
      | missing a digit       |
      | missing a symbol      |
```

## Output contract

When generating BDD code:

- **Feature files**: declarative, domain-language, third-person voice. No CSS selectors, no URLs, no UI verbs.
- **One behavior per scenario.** `Rule:` to group; `Example:` preferred over `Scenario:` in Gherkin 6+.
- **`Scenario Outline` columns are domain-named.** No `pw`/`result`-style technical columns.
- **State** lives in the World / context / fixtures (per scenario), never module globals or file-level `let`.
- **Assertions only in `Then`.** Setup in `Given`; the single state change in `When`.
- **Tags for selection** (`@smoke`, `@regression`, `@wip`), not for control flow.
- **No external data files** (CSV/Excel). Examples live in the feature file.

## Reference quick map

| Task                                                          | Read                              |
|---------------------------------------------------------------|-----------------------------------|
| BDD/Gherkin principles, refactoring scenarios                 | this SKILL.md                     |
| **Install Vitest BDD** in a project from zero                 | `references/install-vitest.md`    |
| Vitest + Gherkin (`@amiceli/vitest-cucumber`) — writing tests | `references/vitest.md`            |
| **Install Playwright BDD** in a project from zero             | `references/install-playwright.md` |
| Playwright + Gherkin (`playwright-bdd`) — writing tests        | `references/playwright.md`        |

If the user names a different runner (Cucumber-JVM, Cucumber.js, behave, SpecFlow), the principles in this file still apply — only the binding API differs. Translate the patterns rather than refusing.
