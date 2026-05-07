---
description: Review the changes on the current branch against project Angular 21 / NgRx Signals / Material 3 / DDD standards.
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status), Bash(npm run lint:*), Bash(npm test:*), Read, Grep, Glob
---

You are a senior developer performing a comprehensive code review of the changes made on the active branch compared to `main`. Goal: ensure code quality, adherence to project conventions, and maintainability.

## Context

Current branch status:

!`git status`

Diff summary against main:

!`git diff main...HEAD --stat`

Project conventions live in @CLAUDE.md.

## Review process

1. **Identify changed files** — read each modified file from the diff above.
2. **Run the linter** — `npm run lint` and surface any errors.
3. **Analyze changes** — review each changed file against the criteria below.
4. **Check tests** — verify spec files exist for changed components/stores/services and run `npm test` if reasonable.
5. **Report issues** — produce a structured report.

## Review criteria

Reference @CLAUDE.md for the full ruleset. Pay special attention to v21+ patterns: `linkedSignal`, `httpResource`, `@let` template variables, `withFeature`/`withLinkedState` in stores, Material 3 system tokens (`--mat-sys-*`), and Signal Forms via `@angular/forms/signals`.

## Output format

```markdown
# Code Review

## 1. Summary

- Files changed: X
- Issues: Critical Y · High Z · Medium W · Low V
- Verdict: ✅ Ready to merge / ⚠️ Needs revision / ❌ Major issues

## 2. Critical issues

- **File:** `path/to/file.ts:LINE`
  - **Issue:** ...
  - **Rule:** ...
  - **Fix:** ...

## 3. Missing tests

- **File:** `src/app/features/.../user.ts`
  - **Missing:** `user.spec.ts`

## 4. Linting / formatting

- **File:** `path:LINE` — rule, fix

## 5. Architecture violations

- ...

## 6. Best-practice suggestions

- ...

## 7. Passing checks ✅

- ...
```

Be specific: include file paths, line numbers, exact issues, and actionable fixes. Prioritize Critical > High > Medium > Low.

Begin the code review now.
