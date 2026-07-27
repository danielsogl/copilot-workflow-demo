# AGENTS.md

Shared agent conventions for this repo. GitHub Copilot additionally reads
`.github/`, Claude Code additionally reads `.claude/`.

## Agent skills

### Issue tracker

Issues and PRDs live as local markdown under `.scratch/<feature-slug>/` — no GitHub Issues, no `gh`. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles are used verbatim (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
