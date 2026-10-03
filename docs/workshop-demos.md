# Workshop Demos

Five live demos for the AI coding workshop. Run each from a clean tree (`git status` empty) on
`chore/workshop-2026-10` unless a demo says otherwise. Start a **new** agent session per run — rules,
skills and hooks load at session start.

General reset after any demo:

```bash
git restore . && git clean -fd src tests && git switch chore/workshop-2026-10
```

## D1 — Same model, different harness

**Prep:** two terminals (or VS Code windows), same model in both. `demo/bare` is the workshop branch
with every agent file removed (`.claude/`, `.apm/`, `apm.yml`, `AGENTS.md`, `.mcp.json`,
`.vscode/mcp.json`, `.github/lsp.json`). App code is identical. Your user-level config (`~/.claude`,
`~/.copilot`) still applies; for a clean run use `claude --setting-sources project,local`.

1. `git switch demo/bare`, new session, prompt below.
2. `git stash -u && git switch chore/workshop-2026-10`, new session, same prompt.

**Prompt:**

```text
Add a Notes page at /notes: a form to add a note (title required, max 80 characters; body optional) and a list of notes with a delete button. Persist via json-server at http://localhost:3000/notes. Include unit tests for the new state/logic. Do not run npm install, builds, tests or the dev server; just write the code.
```

**Expected:** both runs copy the DDD folder layout and a Signal Store (the model reads the existing
code), so the difference is in conventions that only the rules know. Headless run on 2026-10-03,
Claude Code + Sonnet, one run each:

|               | bare (`demo/bare`)                           | harness (`chore/workshop-2026-10`)              |
| ------------- | -------------------------------------------- | ----------------------------------------------- |
| Form API      | Reactive Forms (`FormBuilder`, `Validators`) | Signal Forms (`form()` + schema) — project rule |
| Code comments | yes (`// Newest first`)                      | none — project rule                             |
| Specs         | store only                                   | store + `note-api.spec.ts`                      |

Point at the form API and the comments; the folder tree looks the same. Results vary per run — if
the difference is weak live, use the fallback.

**Reset:** `git stash drop` (bare result) and the general reset.

**Fallback:** the recorded runs are on `demo/d1-result-bare` and `demo/d1-result-harness`:
`git diff demo/d1-result-bare demo/d1-result-harness -- src/app/features/notes`.

## D2 — `/context`

**Prep:** Claude Code in the repo root, folder trusted, MCP servers approved.

**Prompt:** `/context` (Copilot CLI: `/context` as well; VS Code: hover the context indicator in Chat).

**Expected:** four project MCP servers from `.mcp.json`, ~101 tools in total:

| Server            | Tools | Note                                                         |
| ----------------- | ----: | ------------------------------------------------------------ |
| `playwright-test` |    89 | the context hog; point at it                                 |
| `angular-cli`     |     9 | docs, best practices, devserver, `onpush_zoneless_migration` |
| `context7`        |     2 | `resolve-library-id`, `query-docs` (remote HTTP)             |
| `codegraph`       |     1 | `codegraph_explore`                                          |

Talking point: disable `playwright-test` (`/mcp` → disable, or remove it from
`enabledMcpjsonServers` in `.claude/settings.local.json`) and run `/context` again.

**Reset:** re-enable the server. **Fallback:** this table.

## D3 — Graph engineering

**Prep:** `codegraph status` must show an index; otherwise `apm run codegraph-setup` (then `codegraph index`).

**Prompt:**

```text
What breaks if I change TaskStore? And what breaks if I change the priority field of the Task model to a number?
```

**Expected:** the agent calls `codegraph_explore` once and lists the blast radius: `TaskStore`
(`src/app/features/tasks/data/state/task-store.ts`) is injected in
`feature/task-dashboard/task-dashboard.ts` and tested in `data/state/task-store.spec.ts`; `Task`
(`data/models/task.model.ts`) has ~27 references across `task-api.ts`, `task-store.ts`,
`task-dashboard.ts`, `ui/task-board`, `ui/task-card`, `util/task-helpers` and their specs.

**Fallback:** `codegraph explore "What breaks if I change TaskStore?"` in the terminal.
Caveat: template usages (`task-dashboard.html`) are not in the graph; mention it as the limit of the tool.

## D4 — A prompt is a request, a hook is a rule

**Prep:** hook `.apm/hooks/scripts/protect-tests.sh` (PreToolUse, deployed to `.claude/settings.json`).
It only acts while the gitignored marker file exists:

```bash
touch .protect-tests   # on
rm .protect-tests      # off
```

**Prompt** (first without the marker, then with it):

```text
Add a comment line "// demo" at the top of src/app/features/tasks/util/task-helpers/task-helpers.spec.ts.
```

**Expected:** without the marker the edit happens. With it, the edit is denied:
`Test files are protected (.protect-tests is set): refusing to edit …task-helpers.spec.ts …`.
Claude Code and VS Code get exit 2 + stderr; the Copilot CLI gets a `permissionDecision: deny` JSON
(exit 2 there blocks too, but drops the message). Verified headless in Claude Code 2.1.288 and
Copilot CLI 1.0.91. Blocks `*.spec.ts` and `*.feature` via edit/write/create/patch tools — not shell
commands like `sed -i`; say so if someone asks.

**Reset:** `rm .protect-tests`, general reset.
**Fallback:** `echo '{"tool_name":"Edit","tool_input":{"file_path":"a.spec.ts"}}' | .apm/hooks/scripts/protect-tests.sh; echo $?`
(with the marker present: prints the reason, exit 2).

## D5 — Skill does not fire because of its description

**Prep:** `git switch demo/bad-skill-description`. It adds the model-invocable skill
`.apm/skills/entity-crud/` (a copy of `ngrx-signals-store-crud`) with the description
`"Helper for some code things."`.

**Prompt:**

```text
Scaffold the CRUD data layer for a new Note entity (id, title, body) in src/app/features/notes. Plan only — list the files you would create, don't write them.
```

**Expected:** no `Skill(entity-crud)` call. Then rewrite the description live in
`.apm/skills/entity-crud/SKILL.md`:

```yaml
description: "Scaffold the CRUD data layer for a new entity: model, *-api.ts HTTP service, NgRx Signal Store with withEntities and rxMethod, and specs. Use when the user asks to add, create or scaffold an entity, resource, CRUD, API service or store for a feature."
```

run `apm install`, start a new session, same prompt: `Skill(entity-crud)` fires. Verified headless with
Claude Code (Sonnet): 0 of 2 runs fired with the bad description, 1 of 1 with the good one.

**Reset:** `git restore . && git switch chore/workshop-2026-10`.
**Fallback:** show both descriptions side by side and the skill listing in `/context` (only name +
description are in context until the skill is invoked).
