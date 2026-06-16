# Installing BDD for Vitest — 2026 Setup Guide

Zero-to-running setup for **`@amiceli/vitest-cucumber@6.x`** on **Vitest ≥ 2.0** (verified on 4.1.x). Follow these steps in order — the project goes from empty directory to green tests in under two minutes.

Once installed, see `references/vitest.md` for the actual writing-tests guide; this file is purely the install workflow.

## 1. Prerequisites

| Tool        | Version    |
|-------------|------------|
| Node.js     | ≥ 18 LTS (Node 20 or 24 recommended) |
| Package mgr | npm 10+, pnpm 9+, or yarn 4+ |
| TypeScript  | ≥ 5.4 (only if your code is TS) |

Check what you have:

```bash
node --version && npm --version
```

If Node is older than 18, upgrade first — Vitest 4 + ESM don't work cleanly below.

## 2. Install

In an existing or freshly-`npm init -y`'d project:

```bash
# npm
npm install -D vitest @amiceli/vitest-cucumber

# pnpm
pnpm add -D vitest @amiceli/vitest-cucumber

# yarn
yarn add -D vitest @amiceli/vitest-cucumber
```

If your project is TypeScript and you want strict types:

```bash
npm install -D typescript @types/node
```

That's all the BDD-specific install. No browser binaries, no peer-dependency dance.

## 3. `package.json` — minimum required

```json
{
  "name": "your-project",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

The **`"type": "module"`** matters: `@amiceli/vitest-cucumber` is shipped as ESM and `loadFeature(...)` is awaited at module top level — that only works in an ESM context.

## 4. `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.steps.ts'],              // run step files; NEVER include *.feature
    exclude: ['**/*.feature', '**/node_modules/**', '**/dist/**'],
    reporters: process.env.CI
      ? ['default', 'junit', 'github-actions']
      : ['default'],
    outputFile: { junit: './reports/junit.xml' },
  },
})
```

The two critical bits:

- **`include`** must target `*.steps.ts`. If you point it at `*.feature`, Vitest will try to *execute* the Gherkin file as a test and fail.
- **`exclude`** must explicitly exclude `**/*.feature` so it doesn't get picked up by any other glob.

## 5. `tsconfig.json` (TypeScript projects)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Watch-outs:

- **`module: "ESNext"`** + **`moduleResolution: "Bundler"`** — needed for top-level `await loadFeature(...)`.
- **`isolatedModules: true`** — Vitest's transformer expects each file to be independently compilable.
- **`types: ["node"]`** so `process.env`, `import.meta`, etc. resolve.

## 6. Folder layout

The convention that scales:

```
project/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    └── <feature-area>/
        ├── <module>.ts            # production code
        ├── <module>.feature       # human-readable spec (Gherkin)
        └── <module>.steps.ts      # binds the .feature to Vitest
```

Co-locating `.ts` + `.feature` + `.steps.ts` is recommended — the spec sits next to the code it describes.

## 7. `.gitignore`

```
node_modules
dist
coverage
reports
*.log
```

`.feature` files are committed (they are the spec). `*.steps.ts` files are committed (they are the bindings).

## 8. Hello-world verification — should take 60 seconds

Use this minimal example to confirm the install actually runs. Files:

`src/greeter/greeter.ts`

```ts
export function greet(name: string): string {
  if (!name) throw new Error('name required')
  return `Hello, ${name}!`
}
```

`src/greeter/greeter.feature`

```gherkin
Feature: Greeter

  Scenario: Greets a named person
    When the greeter greets "Ada"
    Then the greeting is "Hello, Ada!"
```

`src/greeter/greeter.steps.ts`

```ts
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import type { FeatureDescriibeCallbackParams } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { greet } from './greeter'

type Ctx = { greeting: string }

const feature = await loadFeature('src/greeter/greeter.feature')

describeFeature(feature, ({ Scenario }: FeatureDescriibeCallbackParams<Ctx>) => {
  Scenario('Greets a named person', ({ When, Then, context }) => {
    When('the greeter greets {string}', (_ctx, name: string) => {
      context.greeting = greet(name)
    })
    Then('the greeting is {string}', (_ctx, expected: string) => {
      expect(context.greeting).toBe(expected)
    })
  })
})
```

Run:

```bash
npm test
```

Expected output:

```
✓ src/greeter/greeter.steps.ts (2 tests)
Test Files  1 passed (1)
     Tests  2 passed (2)
```

If you see this, the install is good — proceed to `references/vitest.md` for writing real BDD.

## 9. CI — GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
```

The JUnit reporter you configured in §4 writes to `./reports/junit.xml` — pick it up with whatever test-result viewer your CI has.

## 10. Troubleshooting — install-time errors

| Symptom                                                              | Cause / fix                                                                                  |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `SyntaxError: Cannot use import statement outside a module`          | `package.json` missing `"type": "module"`.                                                  |
| `Top-level await is not available...`                                 | `tsconfig.json` `module` is `"CommonJS"` — change to `"ESNext"` and `moduleResolution: "Bundler"`. |
| Tests pass but reporter shows `0 tests found`                         | `include` glob doesn't match your step files. Verify `src/**/*.steps.ts` resolves under the project root. |
| Vitest tries to run a `.feature` file                                 | `.feature` is in `include` or not in `exclude`. Add `'**/*.feature'` to `exclude`.           |
| `FeatureUknowScenarioError: Scenario X does not exist`               | The scenario is nested under `Rule:` in the feature. Wrap the binding in `Rule(...)` + `RuleScenario(...)`. See `references/vitest.md` §4.2. |
| Cannot find module `'@amiceli/vitest-cucumber'`                      | Did you install it with `-D` in the *correct* package.json (e.g. inside a monorepo workspace)? |
| `Cannot find name 'process'`                                         | `tsconfig.json` `types` is missing `"node"` (and `@types/node` is uninstalled).             |

## 11. Choosing a package manager — does it matter?

No — the install works identically on npm, pnpm, yarn, and bun. Use whichever your team standardizes on. In CI prefer `npm ci` / `pnpm install --frozen-lockfile` for reproducibility.

## 12. What you do NOT need

- A separate Cucumber CLI (`cucumber-js`, `@cucumber/cucumber`) — `@amiceli/vitest-cucumber` runs through Vitest's runner.
- Babel, ts-node, ts-jest — Vitest has its own transformer.
- A separate reporter for Gherkin — `vitest --ui` already renders the scenario tree because `Scenario`/`Then`/etc. are real `describe`/`test` nodes.
- A Gherkin parser — bundled.

## 13. Upgrading

When updating across major versions of `@amiceli/vitest-cucumber`, check the [CHANGELOG](https://github.com/amiceli/vitest-cucumber/releases). v6 introduced `defineStep` with parameter expressions and the typed `FeatureDescriibeCallbackParams<T>` shape this guide uses; older v3-v5 patterns (untyped `context`, no `Rule` keyword support) will not work as written here.

## References

- [`@amiceli/vitest-cucumber` repository](https://github.com/amiceli/vitest-cucumber)
- [`@amiceli/vitest-cucumber` on npm](https://www.npmjs.com/package/@amiceli/vitest-cucumber)
- [Official docs site](https://vitest-cucumber.miceli.click/)
- [Vitest config reference](https://vitest.dev/config/)
- Skill internal: `references/vitest.md` — writing scenarios, hooks, Scenario Outline, common pitfalls.
