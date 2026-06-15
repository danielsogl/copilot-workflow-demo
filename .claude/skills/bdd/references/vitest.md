# BDD with Vitest — 2026 Reference

This reference covers Gherkin-style BDD on top of [Vitest](https://vitest.dev),
the Vite-native test runner. In 2026 the de-facto library is
**[`@amiceli/vitest-cucumber`](https://github.com/amiceli/vitest-cucumber)**
(`v6.x`). It requires **Vitest ≥ 2.0** (works through Vitest 4.x).

> **Verified runnable:** the patterns below are taken from a real `npm test`
> run against `@amiceli/vitest-cucumber@6.5.0` + `vitest@4.1.7`. The
> APIs ARE picky; following them literally is the difference between 21/21
> green and zero-tests-found.

## 1. When to use Vitest BDD

Vitest is a **unit / component** runner. Reach for BDD on top of it when:

- Domain logic lives in framework-agnostic TypeScript (calculators, validators,
  reducers, NgRx Signal Stores, Zustand stores, pure services).
- Component behavior is testable via `@testing-library/*` (React, Vue, Svelte,
  Angular) and you want behavior-first assertions instead of DOM-first ones.
- Stakeholders or QA want to read or co-author the scenarios.

**Do not** use Vitest BDD for full end-to-end browser flows — that's
[Playwright BDD](./playwright.md) territory.

## 2. Setup

For a zero-to-running install (package.json, tsconfig, gitignore, CI),
see **`references/install-vitest.md`**. The short version:

```bash
npm i -D vitest @amiceli/vitest-cucumber
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.steps.ts'],   // step files only — NEVER include *.feature
    exclude: ['**/*.feature', '**/node_modules/**', '**/dist/**'],
  },
})
```

Recommended layout: co-locate `<module>.ts`, `<module>.feature`, and
`<module>.steps.ts` under `src/<feature-area>/`.

## 3. Writing a Feature file

```gherkin
@cart
Feature: Shopping cart pricing and coupons

  Background:
    Given an empty cart
    And shipping costs 5 EUR by default

  Rule: A cart totals its lines and adds shipping

    @smoke
    Scenario: A shopper sees the correct total for a single item
      When she adds a "Bluetooth Speaker" priced at 40 EUR
      Then the subtotal is 40 EUR
      And the total is 45 EUR

  Rule: Coupons must be recognised by the catalogue

    Scenario: An unknown coupon code is rejected
      Given the cart contains a "Bluetooth Speaker" priced at 40 EUR
      When she applies the coupon "BOGUS"
      Then the coupon is rejected as invalid
      And the total is still 45 EUR

  Rule: A recognised coupon adjusts the total

    Scenario Outline: Applying <coupon> yields a total of <total> EUR
      Given the cart contains a "Bluetooth Speaker" priced at 40 EUR
      When she applies the coupon "<coupon>"
      Then the total is <total> EUR

      Examples:
        | coupon   | total |
        | SAVE10   | 41    |
        | FREESHIP | 40    |
```

## 4. The five things this library forces you to get right

These five conventions are not optional — get any of them wrong and tests
either fail to load, silently pass with garbage assertions, or report
"step does not exist".

### 4.1 Step callbacks always start with `_ctx`

Every step callback is called as `fn(testCtx, ...cucumberArgs)`. The first
positional arg is the Vitest test context (commonly named `_ctx`), and the
Cucumber Expression captures come AFTER it.

```ts
//                                                ↓ vitest ctx (NEVER omit)
Then('the subtotal is {int} EUR', (_ctx, expected: number) => {
  expect(context.cart.subtotal).toBe(expected)
})
```

Omit `_ctx` and your `expected: number` will actually receive the vitest
context object, and the assertion will silently fail with a useless message.

### 4.2 `Rule:` in the feature → `Rule(...)` in the bindings

Scenarios nested under a `Rule:` block in the feature MUST be wrapped in a
`Rule(...)` binding with `RuleScenario` / `RuleScenarioOutline` /
`RuleBackground`. Plain `Scenario(...)` won't see them.

```ts
describeFeature(feature, ({ Background, Rule, BeforeEachScenario, context }: FeatureDescriibeCallbackParams<CartCtx>) => {
  // ...

  Rule('A cart totals its lines and adds shipping', ({ RuleScenario }) => {
    RuleScenario('A shopper sees the correct total for a single item', ({ When, Then, And }) => {
      When('she adds a {string} priced at {int} EUR', (_ctx, name: string, price: number) => {
        context.cart.add({ id: name, name, price })
      })
      Then('the subtotal is {int} EUR', (_ctx, expected: number) => {
        expect(context.cart.subtotal).toBe(expected)
      })
      And('the total is {int} EUR', (_ctx, expected: number) => {
        expect(context.cart.total).toBe(expected)
      })
    })
  })
})
```

For top-level scenarios with no `Rule:` parent, use `Scenario` /
`ScenarioOutline` instead.

### 4.3 Shared state lives in the **feature-level** context, not the scenario's

Each Background and each Scenario gets its OWN scenario-scoped context bag
that is NOT shared between them. To share state across Background + Scenario
steps (the normal World pattern), declare the type on `describeFeature<T>(...)`
and use the feature-level `context: T` that's destructured from the feature
callback. Reset it in `BeforeEachScenario` so scenarios stay independent.

```ts
type CartCtx = { cart: Cart; lastError?: unknown }

const feature = await loadFeature('src/cart/cart.feature')

describeFeature(feature, ({ Background, Rule, BeforeEachScenario, context }: FeatureDescriibeCallbackParams<CartCtx>) => {
  // BeforeEachScenario takes NO arguments — close over the feature `context`.
  BeforeEachScenario(() => {
    context.cart = new Cart()
    context.lastError = undefined
  })

  Background(({ Given, And }) => {
    Given('an empty cart', () => {
      context.cart = new Cart()
    })
    And('shipping costs {int} EUR by default', (_ctx, amount: number) => {
      expect(context.cart.total - context.cart.subtotal).toBe(amount)
    })
  })

  // ...
})
```

Common mistake: trying to use `s.context` like a typed StepTest argument.
The library used to expose that pattern; in v6 it doesn't — `BeforeEachScenario`
receives no args, and each Background/Scenario block has its own fresh
`context: {}` that doesn't bridge.

### 4.4 Match the feature's actual keyword: `And` ↔ `And`, `But` ↔ `But`

If the feature step starts with `And` (a continuation of `Then`, for example),
the binding must ALSO be `And(...)`. The library does not collapse `And` into
the previous keyword — it's a separate registry.

```gherkin
Then the subtotal is 40 EUR
And the total is 45 EUR
```

```ts
Then('the subtotal is {int} EUR', (_ctx, expected) => { ... })
And('the total is {int} EUR',     (_ctx, expected) => { ... })   // <-- And, not Then
```

### 4.5 Scenario Outline placeholders stay as `<var>` in the binding

`@amiceli/vitest-cucumber` does NOT substitute `<placeholder>` into Cucumber
Expressions like `{int}` before matching. The binding must keep the literal
placeholder, and you read the value from the `variables` object that arrives
as the second arg of the scenario callback.

```gherkin
Scenario Outline: Applying <coupon> yields a total of <total> EUR
  Given the cart contains a "Bluetooth Speaker" priced at 40 EUR
  When she applies the coupon "<coupon>"
  Then the total is <total> EUR
```

```ts
RuleScenarioOutline('Applying <coupon> yields a total of <total> EUR',
  ({ Given, When, Then }, variables) => {
    Given('the cart contains a {string} priced at {int} EUR',
      (_ctx, name: string, price: number) => {
        context.cart.add({ id: name, name, price })
      })

    When('she applies the coupon "<coupon>"', () => {              // <-- literal <coupon>
      context.cart.applyCoupon(variables.coupon as string)
    })

    Then('the total is <total> EUR', () => {                       // <-- literal <total>
      expect(context.cart.total).toBe(Number(variables.total))
    })
  })
```

Note the quotes around `"<coupon>"`: the feature has `"<coupon>"` (placeholder
inside quotes), so the binding must mirror that exactly. Mixed forms — e.g. a
non-quoted Outline arg that needs `{string}` — would require dropping the
placeholder syntax entirely; just match the literal feature text in the binding.

## 5. The canonical, verified-to-run scaffold

Drop this in as `cart.steps.ts` against the feature in §3 and `npm test` goes
green (assuming a `Cart` implementation that matches the prompt):

```ts
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import type { FeatureDescriibeCallbackParams } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { Cart, InvalidCouponError } from './cart'

type CartCtx = {
  cart: Cart
  lastError?: unknown
}

const feature = await loadFeature('src/cart/cart.feature')

describeFeature(feature, ({
  Background,
  Rule,
  BeforeEachScenario,
  context,
}: FeatureDescriibeCallbackParams<CartCtx>) => {
  BeforeEachScenario(() => {
    context.cart = new Cart()
    context.lastError = undefined
  })

  Background(({ Given, And }) => {
    Given('an empty cart', () => {
      context.cart = new Cart()
    })
    And('shipping costs {int} EUR by default', (_ctx, amount: number) => {
      expect(context.cart.total - context.cart.subtotal).toBe(amount)
    })
  })

  Rule('A cart totals its lines and adds shipping', ({ RuleScenario }) => {
    RuleScenario('A shopper sees the correct total for a single item',
      ({ When, Then, And }) => {
        When('she adds a {string} priced at {int} EUR',
          (_ctx, name: string, price: number) => {
            context.cart.add({ id: name, name, price })
          })
        Then('the subtotal is {int} EUR', (_ctx, expected: number) => {
          expect(context.cart.subtotal).toBe(expected)
        })
        And('the total is {int} EUR', (_ctx, expected: number) => {
          expect(context.cart.total).toBe(expected)
        })
      })
  })

  Rule('Coupons must be recognised by the catalogue', ({ RuleScenario }) => {
    RuleScenario('An unknown coupon code is rejected',
      ({ Given, When, Then, And }) => {
        Given('the cart contains a {string} priced at {int} EUR',
          (_ctx, name: string, price: number) => {
            context.cart.add({ id: name, name, price })
          })
        When('she applies the coupon {string}', (_ctx, code: string) => {
          try {
            context.cart.applyCoupon(code)
          } catch (err) {
            context.lastError = err
          }
        })
        Then('the coupon is rejected as invalid', () => {
          expect(context.lastError).toBeInstanceOf(InvalidCouponError)
        })
        And('the total is still {int} EUR', (_ctx, expected: number) => {
          expect(context.cart.total).toBe(expected)
        })
      })
  })

  Rule('A recognised coupon adjusts the total', ({ RuleScenarioOutline }) => {
    RuleScenarioOutline('Applying <coupon> yields a total of <total> EUR',
      ({ Given, When, Then }, variables) => {
        Given('the cart contains a {string} priced at {int} EUR',
          (_ctx, name: string, price: number) => {
            context.cart.add({ id: name, name, price })
          })
        When('she applies the coupon "<coupon>"', () => {
          context.cart.applyCoupon(variables.coupon as string)
        })
        Then('the total is <total> EUR', () => {
          expect(context.cart.total).toBe(Number(variables.total))
        })
      })
  })
})
```

## 6. Cucumber Expressions

The library uses Cucumber Expressions (not regex by default):

| Placeholder | Captures              | Step arg type      |
|-------------|-----------------------|--------------------|
| `{string}`  | Quoted string `"..."` | `string`           |
| `{int}`     | Integer               | `number`           |
| `{float}`   | Floating-point        | `number`           |
| `{word}`    | Unquoted single word  | `string`           |
| `{list}`    | Comma-separated list  | `string[]`         |

Custom parameter types are registered via the library's
`defineParameterExpression` helper — see the official docs site if you need
domain-specific captures like `{customer}` or `{money}`.

## 7. Mocking and DI inside steps

Use Vitest's `vi.*` API as in plain tests. Place mock setup in `Given` or
`BeforeEachScenario` so the "arrange" phase stays visible.

```ts
import { vi } from 'vitest'

BeforeEachScenario(() => {
  vi.useFakeTimers()
})

// In a scenario:
Given('a user named {string} exists', (_ctx, name: string) => {
  vi.spyOn(repo, 'findById').mockResolvedValue({ id: 1, name })
})
```

## 8. Component testing with BDD

Pair `@amiceli/vitest-cucumber` with `@testing-library/*` for *behavioral*
component tests. Same callback signature applies — `(_ctx, ...args)`.

```ts
RuleScenario('Submit empty form', ({ Given, When, Then }) => {
  Given('the login form is rendered', () => {
    context.screen = render(<LoginForm />)
  })
  When('I click {string}', async (_ctx, label: string) => {
    await userEvent.click(screen.getByRole('button', { name: label }))
  })
  Then('I see {string}', (_ctx, text: string) => {
    expect(screen.getByText(text)).toBeVisible()
  })
})
```

## 9. Common pitfalls — symptom → fix

| Symptom                                                             | Fix                                                                                              |
|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `FeatureUknowScenarioError: Scenario X does not exist`             | Scenario is under a `Rule:` block — wrap binding in `Rule(...)` + `RuleScenario(...)`.           |
| `StepAbleUnknowStepError: Then X does not exist`                    | Feature uses `And`/`But` but binding uses `Then`/`Given` — match the actual keyword.            |
| `StepAbleStepExpressionError: No step match` in an Outline          | `{int}`/`{string}` does not substitute `<var>`. Use `<var>` literally in the binding.            |
| Assertion fails with `expected NaN to be 40`                         | Step callback missing `_ctx` first arg — your Cucumber captures are shifted by one.              |
| `Cannot read properties of undefined (reading 'context')`            | `BeforeEachScenario(s => ...)` — hook takes NO args. Close over the feature-level `context`.    |
| Test passes but assertion clearly wrong                              | Same as above — `_ctx` missing makes assertions silently compare wrong types.                    |
| `.feature` files get executed as tests                               | `include: ['**/*.feature']` in `vitest.config.ts`. Use `['src/**/*.steps.ts']` instead.          |

For Vitest reporters (`junit`, `github-actions`, etc.) and the Vitest UI
(`vitest --ui` shows the Gherkin tree because scenarios/steps are real
`describe`/`test` nodes), see the [Vitest config docs](https://vitest.dev/config/).
No special BDD configuration is needed.

## References

- [`@amiceli/vitest-cucumber` GitHub](https://github.com/amiceli/vitest-cucumber)
- [`@amiceli/vitest-cucumber` on npm](https://www.npmjs.com/package/@amiceli/vitest-cucumber)
- [Official docs](https://vitest-cucumber.miceli.click/)
- [Cucumber Expressions reference](https://github.com/cucumber/cucumber-expressions)
- [Vitest config](https://vitest.dev/config/)
