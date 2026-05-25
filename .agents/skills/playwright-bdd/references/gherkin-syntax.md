# Gherkin syntax reference

Complete reference for the Gherkin dialect that `playwright-bdd` parses. When in doubt, the rule is: the file should still make sense to a non-engineer.

## File anatomy

```gherkin
# Free-form comments start with #
@feature-tag                          # tags apply to everything below
Feature: <short capability name>
  As a <persona>                      # the "narrative" block is optional but
  I want <goal>                       # makes the file's purpose obvious to
  So that <value>                     # anyone skimming the repo

  Background:                         # runs before every scenario in the file
    Given <shared precondition>

  @scenario-tag
  Scenario: <one observable behavior>
    Given <starting state>
    When <single action under test>
    Then <observable outcome>
    And <additional outcome>
    But <negative outcome>            # And/But are aliases for the previous step kind
```

## Keywords

| Keyword             | Purpose                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Feature:`          | Top-level capability. One per file.                                                                         |
| `Background:`       | Steps that run before every scenario. Shared setup only.                                                    |
| `Scenario:`         | A single behavior with a single action. Aliases: `Example:`.                                                |
| `Scenario Outline:` | A scenario template parameterized by an `Examples:` table. Aliases: `Scenario Template:`.                   |
| `Examples:`         | Table of input rows that drive a Scenario Outline. Alias: `Scenarios:`.                                     |
| `Given`             | Precondition / starting state.                                                                              |
| `When`              | The action under test. **One per scenario.**                                                                |
| `Then`              | Observable outcome.                                                                                         |
| `And`, `But`        | Continuation of the previous Given/When/Then. Don't change category — `And` after `Given` is still a Given. |
| `Rule:`             | Groups related scenarios under a shared business rule. Used sparingly.                                      |

## Scenario Outline

Same scenario shape, different data:

```gherkin
Scenario Outline: Reject invalid passwords
  Given I am on the login page
  When I sign in with password "<password>"
  Then I see the error "<message>"

  Examples:
    | password   | message                        |
    | abc        | Password must be 8+ characters |
    | password   | Password is too common         |
    |            | Password is required           |
```

You can include placeholders in the scenario name itself so each generated test has a unique title:

```gherkin
Scenario Outline: Reject password "<password>"
  ...
```

Use Scenario Outline only when the **same flow** repeats with different data. If two scenarios look similar but test different behaviors, keep them separate — a shared template hides the divergence.

## Data Tables

Pass a small structured payload to a single step:

```gherkin
Given the following users exist:
  | name   | role    | active |
  | Alice  | admin   | true   |
  | Bob    | viewer  | false  |
```

In the step definition, the table arrives as a `DataTable` object — typically accessed via `.hashes()` to get an array of row objects.

```ts
Given("the following users exist:", async ({ usersApi }, table: DataTable) => {
  for (const row of table.hashes()) {
    await usersApi.create({
      name: row.name,
      role: row.role,
      active: row.active === "true",
    });
  }
});
```

## Doc Strings

Pass multi-line content (JSON, SQL, markdown) to a step:

```gherkin
When I send the request:
  """
  {
    "title": "New task",
    "priority": "high"
  }
  """
```

The string is delivered as the last argument to the step function.

## Parameter types

Cucumber expressions in step patterns:

| Pattern    | Matches                                         | Typed as |
| ---------- | ----------------------------------------------- | -------- |
| `{string}` | `"quoted text"` or `'quoted text'`              | `string` |
| `{int}`    | Integer like `42`                               | `number` |
| `{float}`  | Decimal like `3.14`                             | `number` |
| `{word}`   | Single word, no spaces                          | `string` |
| `{}`       | Anything up to the next pattern (use sparingly) | `string` |

Custom parameter types can be registered if needed — but prefer to keep parameters simple and do conversion inside the step.

```gherkin
When I select "High" as the priority
And I set the order to 3
```

```ts
When('I select {string} as the priority', async ({ page }, priority: string) => { ... });
When('I set the order to {int}', async ({ page }, order: number) => { ... });
```

## Tags

Tags are `@`-prefixed words on the line above a `Feature:` or `Scenario:`. They cascade — a feature-level tag applies to every scenario in the file.

```gherkin
@desktop @smoke
Feature: Task management

  @critical
  Scenario: Create task
    ...
```

This scenario carries `@desktop`, `@smoke`, and `@critical`.

Tag expressions for filtering (`--tags`):

| Expression              | Runs scenarios that...        |
| ----------------------- | ----------------------------- |
| `@smoke`                | have `@smoke`                 |
| `not @slow`             | don't have `@slow`            |
| `@smoke and @desktop`   | have both                     |
| `@smoke or @regression` | have either                   |
| `@smoke and not @slow`  | have `@smoke` but not `@slow` |

```bash
npx bddgen --tags "@smoke and not @slow" && npx playwright test
```

Special tags (built into playwright-bdd):

| Tag                                                 | Effect                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `@skip`                                             | Skip this scenario.                                                                |
| `@fixme`                                            | Mark as known-broken; doesn't fail the suite.                                      |
| `@fail`                                             | Expected to fail; passing the assertion is the failure.                            |
| `@slow`                                             | Triples the default timeout.                                                       |
| `@only`                                             | Run only tagged scenarios (use locally; lefthook/CI should reject `@only` in PRs). |
| `@retries:N`                                        | Retry this scenario N times before failing.                                        |
| `@mode:serial` / `@mode:parallel` / `@mode:default` | Override file-level parallelism.                                                   |

## Escaping

Inside a `{string}` parameter, embed a literal double-quote by switching to single quotes around the value, and vice versa. Pipes (`|`) inside table cells need to be backslash-escaped: `\|`.

## File layout conventions

- One `Feature:` per file. The filename mirrors the feature: `task-management.feature`.
- Group scenarios by what they test, not by setup steps.
- Keep scenarios short — five to eight steps is a healthy ceiling. Long scenarios usually mean the `When` is doing too much.
- The narrative block (`As a / I want / So that`) is optional but recommended for non-trivial features. It's the docstring of the file.
