# Copilot Instructions

Workshop demo for **GitHub Copilot** workflows on a modern Angular application.

## Project

- **Stack**: Angular 21 (standalone, signals, control flow), NgRx Signal Store 21, Angular Material 21, Vitest, Playwright
- **Architecture**: Domain-Driven Design — `feature/`, `ui/`, `data/`, `util/` per domain under `src/app/features/`
- **Repo slug**: `danielsogl/copilot-workflow-demo`

Detailed guidance lives in `.github/instructions/` (auto-applied via `applyTo` globs):

- `architecture.instructions.md` — DDD layout, naming, module boundaries
- `angular.instructions.md` — Angular 21 patterns
- `angular-material.instructions.md` — Material 3 components & theming
- `angular-signal-forms.instructions.md` — Signal Forms API
- `angular-testing.instructions.md` — Vitest + TestBed
- `ngrx-signals.instructions.md` — Signal Store patterns
- `ngrx-signals-testing.instructions.md` — Store testing
- `typescript.instructions.md` — Strict TypeScript conventions
- `techstack.instructions.md` — Full tech stack reference

## General rules

- Be concise; show code over prose.
- Match existing patterns in `src/app/`. Reuse before creating.
- Strong typing always. No `any`.
- No code comments unless explicitly requested.
- Ask when requirements are ambiguous.
