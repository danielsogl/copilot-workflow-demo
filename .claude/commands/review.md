Review all code changes on the current branch compared to the base branch (main/master).

**Steps:**

1. Run `git diff main...HEAD --stat` to identify all changed files
2. Run `git diff main...HEAD` to get the full diff
3. For each changed file, analyze against these project standards:
   - **Architecture**: DDD structure, no barrel files, components in subfolders
   - **Angular 21+**: Standalone, OnPush, signal inputs/outputs, @if/@for/@switch
   - **NgRx Signals**: Proper store patterns, rxMethod, tapResponse, patchState
   - **TypeScript**: Strict mode, no `any`, proper null safety
   - **Testing**: spec.ts companion files, provideZonelessChangeDetection()
   - **Naming**: kebab-case files, PascalCase classes without type suffixes

4. Provide structured feedback:

   **Strengths** — what was done well
   **Issues** — problems that must be fixed (with code examples)
   **Suggestions** — optional improvements

5. End with an overall assessment: Ready to commit / Needs revisions / Major refactoring required

Reference standards:
- `.github/instructions/angular.instructions.md`
- `.github/instructions/architecture.instructions.md`
- `.github/instructions/ngrx-signals.instructions.md`
- `.github/instructions/angular-testing.instructions.md`
- `.github/instructions/typescript.instructions.md`
