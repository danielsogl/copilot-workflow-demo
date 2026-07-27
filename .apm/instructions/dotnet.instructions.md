---
description: Conventions for the .NET 10 backend under backend/.
applyTo: "backend/**/*.cs,backend/**/*.csproj,backend/**/*.slnx"
---

## Backend stack

- **.NET 10**, ASP.NET Core Minimal APIs. No controllers, no MVC.
- **xUnit v3** on the Microsoft Testing Platform (`UseMicrosoftTestingPlatformRunner`). That is the prerequisite for Stryker.NET's `mtp` test runner — do not downgrade to xUnit v2.
- `TaskApi` serves the Angular app on `http://localhost:3000/tasks` and replaces the former json-server. Keep the JSON shape compatible with `src/app/features/tasks/data/models/task.model.ts` — the Angular client is the contract.

## Rules

- `record` types for models, `sealed` unless inheritance is needed.
- Nullable reference types are on. No `!` to silence the compiler.
- No `DateTime.Now` in logic that a test needs to control — inject `TimeProvider`.
- State lives in `TaskStore`; endpoints in `Program.cs` stay thin enough to read in one screen.
- Tests target `TaskStore` directly. An endpoint test that only proves ASP.NET routes correctly tests the framework, not us.

## Commands

| Task           | Command                              |
| -------------- | ------------------------------------ |
| Run the API    | `npm run start:api`                  |
| Build          | `npm run build:api`                  |
| Tests          | `npm run test:api`                   |
| Mutation score | `dotnet stryker --test-runner mtp`   |

There is deliberately **no** bundled gate command yet — wiring `build`, `test` and `format` into one exit code is a workshop exercise, not something to pre-solve.
