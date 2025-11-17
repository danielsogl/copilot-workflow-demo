# Code Review Checklist

## 📊 Review Statistics

```
Total Files Reviewed:    15
Critical Issues:         6 🚫
Warnings:                3 ⚠️
Suggestions:             3 💡
Passed Checks:           8 ✅
```

## ✅ What's Working Well

- [x] No barrel files (index.ts) found
- [x] Modern control flow (@if, @for, @switch) used consistently
- [x] Excellent NgRx Signals Store implementation
- [x] Strong TypeScript typing (no 'any' types)
- [x] Components properly organized in subfolders
- [x] Proper async error handling with tapResponse
- [x] Function-based DI (inject()) in most places
- [x] No CommonModule/RouterModule in standalone components

## 🚫 Critical Issues (Must Fix Before Merge)

### 1. Missing OnPush Change Detection

**Files to Fix:**

- [ ] `src/app/features/tasks/components/task-list/task-list.component.ts`
- [ ] `src/app/features/dashboard/components/dashboard-overview/dashboard-overview.component.ts`
- [ ] `src/app/features/tasks/components/todo-create-form/todo-create-form.component.ts`
- [ ] `src/app/features/tasks/components/task-create-modal/task-create-modal.component.ts`

**Action**: Add `changeDetection: ChangeDetectionStrategy.OnPush`

---

### 2. Legacy Decorator-Based Inputs/Outputs

**Files to Fix:**

- [ ] `src/app/features/tasks/components/todo-item/todo-item.component.ts`
  - Replace `@Input()` with `input()` or `input.required()`
  - Replace `@Output()` with `output()`
- [ ] `src/app/features/tasks/components/todo-create-form/todo-create-form.component.ts`
  - Replace `@Output()` with `output()`

---

### 3. DDD Folder Structure Violations

**Domains to Restructure:**

#### Tasks Domain

- [ ] Rename `components/` → split into `feature/` and `ui/`
- [ ] Rename `services/` → `data/infrastructure/`
- [ ] Move store to `data/state/`

#### Dashboard Domain

- [ ] Rename `components/` → split into `feature/` and `ui/`
- [ ] Rename `services/` → `data/infrastructure/`

#### Posts Domain

- [ ] Move `model/` → `data/models/`
- [ ] Rename `utils/` → `util/` (singular)

---

### 4. File Size Violation

- [ ] Refactor `src/app/features/tasks/services/task.store.ts` (600 lines → max 400)
  - Extract timer methods into `withTaskTimer()` feature
  - Extract todo methods into `withTaskTodos()` feature
  - Keep core CRUD in main store

## ⚠️ Medium Priority Issues

### 1. Legacy Forms Migration

- [ ] `src/app/features/tasks/components/todo-create-form/todo-create-form.component.ts`
  - Migrate from ReactiveFormsModule to Signal Forms
- [ ] `src/app/features/tasks/components/task-create-modal/task-create-modal.component.ts`
  - Migrate from ReactiveFormsModule to Signal Forms

### 2. Constructor Pattern

- [ ] `src/app/features/tasks/components/task-list/task-list.component.ts`
  - Move effect from constructor to class-level property

### 3. Test Failures

- [ ] `src/app/features/posts/data/post.service.spec.ts`
  - Fix assertion error at line 142

## 💡 Nice to Have Improvements

- [ ] Replace hardcoded colors with Material theme variables in:
  - `post-list.component.ts` (lines 124-127, 169-170)
- [ ] Update `navbar.component.ts` to use `styleUrl` instead of `styleUrls`
- [ ] Consider extracting inline styles to external SCSS files for larger components

## 📋 Testing Checklist

After fixes, verify:

- [ ] `npm run lint` passes
- [ ] `npm test` passes (all tests green)
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] All routes load correctly
- [ ] CRUD operations work as expected

## 📚 Reference Documentation

- **Angular v20+**: `.github/instructions/angular.instructions.md`
- **NgRx Signals**: `.github/instructions/ngrx-signals.instructions.md`
- **DDD Architecture**: `.github/instructions/architecture.instructions.md`
- **Signal Forms**: `.github/instructions/angular-signal-forms.instructions.md`
- **Testing**: `.github/instructions/angular-testing.instructions.md`
- **TypeScript**: `.github/instructions/typescript.instructions.md`
- **Material Design**: `.github/instructions/angular-material.instructions.md`

## 📈 Progress Tracking

### Sprint 1 (Critical Fixes)

**Estimated Effort**: 4-6 hours

- [ ] OnPush fixes (1-2 hours)
- [ ] Input/Output refactoring (2-3 hours)
- [ ] TaskStore splitting (2-3 hours)

### Sprint 2 (Structure & Forms)

**Estimated Effort**: 8-12 hours

- [ ] Folder restructuring (4-6 hours)
- [ ] Signal Forms migration (4-6 hours)
- [ ] Test fixes (1 hour)

### Sprint 3 (Polish)

**Estimated Effort**: 2-4 hours

- [ ] Material theming (1-2 hours)
- [ ] Code style cleanup (1-2 hours)

---

**Total Estimated Effort**: 14-22 hours

## ✍️ Sign-off

- [ ] All critical issues resolved
- [ ] All warnings addressed
- [ ] Tests passing
- [ ] Linting clean
- [ ] Code review approved
- [ ] Ready for merge

---

**Last Updated**: 2025-11-17  
**Reviewer**: Angular Code Review Agent
