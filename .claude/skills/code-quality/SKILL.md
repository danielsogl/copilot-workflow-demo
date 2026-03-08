---
name: code-quality
description: Project-specific code quality standards and review checklist. Activates when reviewing code, discussing quality, refactoring, or checking for anti-patterns in this Angular 21 DDD project.
---

# Code Quality Standards

This skill provides the quality checklist specific to this Angular 21 DDD project.

## Critical Violations (Must Fix)

### Architecture
- [ ] **No barrel files** — `index.ts` re-exports are strictly prohibited
- [ ] **Components in subfolders** — every component in its own named subfolder
- [ ] **DDD boundaries** — domains don't import from other domains
- [ ] **Correct layer placement** — smart in `feature/`, dumb in `ui/`, data in `data/`

### Angular Patterns
- [ ] **`standalone: true`** on every component, directive, pipe
- [ ] **`ChangeDetectionStrategy.OnPush`** on every component
- [ ] **Signal inputs** — `input()` / `input.required()`, not `@Input()`
- [ ] **Signal outputs** — `output()`, not `@Output()` + `EventEmitter`
- [ ] **Modern control flow** — `@if`/`@for`/`@switch`, never `*ngIf`/`*ngFor`
- [ ] **`inject()` function** — not constructor injection
- [ ] **No NgModules** — standalone components with direct imports

### TypeScript
- [ ] **No `any` types** — strict mode enforced
- [ ] **Null safety** — proper null checks, no non-null assertions unless justified
- [ ] **Interfaces over classes** for data models
- [ ] **`readonly` on injected dependencies** and signals

### Naming
- [ ] **kebab-case** file names: `task-card.ts`
- [ ] **PascalCase** class names without suffixes: `TaskCard`, not `TaskCardComponent`
- [ ] **No `.component.ts`** suffix in file names
- [ ] **`.model.ts`** suffix only for model files

## Warnings (Should Fix)

### Performance
- [ ] `@for` has `track` expression (by `item.id` or `$index`)
- [ ] Heavy computations in `computed()`, not in templates
- [ ] No unnecessary subscriptions — prefer signals

### Testing
- [ ] Every new file has a `.spec.ts` companion
- [ ] `provideZonelessChangeDetection()` in all test setups
- [ ] Signal inputs set via `componentRef.setInput()`

### State Management
- [ ] Store uses `rxMethod` for async, not raw subscribes
- [ ] `tapResponse` for error handling in async methods
- [ ] Loading and error states managed consistently
- [ ] Entity operations use atomic ops (`addEntity`, not manual array manipulation)

## Lint & Format

```bash
npm run lint     # ESLint with Angular rules + auto-fix
npx prettier --check .  # Check formatting
```

ESLint config: `eslint.config.js` (flat config with Angular, TypeScript, NgRx plugins)
Prettier config: `.prettierrc` (80 chars, 2 spaces, trailing commas)
