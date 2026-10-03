#!/usr/bin/env bash
# PreToolUse hook: block agent edits to test files (*.spec.ts, *.feature) while the repo root holds a
# `.protect-tests` marker file (gitignored). A file, not an env var, so it toggles live in all three
# harnesses without restarting VS Code: `touch .protect-tests` / `rm .protect-tests`.
set -u

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
[ -f "$ROOT/.protect-tests" ] || { printf '{"continue":true}\n'; exit 0; }

INPUT="$(cat)"

# Same two payload shapes as guard-destructive-bash.sh. Only edit tools count — reading a test is fine.
TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // .toolName // empty' 2>/dev/null)"
case "$(printf '%s' "$TOOL" | tr '[:upper:]' '[:lower:]')" in
  *edit*|*write*|*create*|*replace*|*patch*|*insert*) ;;
  *) printf '{"continue":true}\n'; exit 0 ;;
esac

# Path spellings as in format-changed-files.sh, plus the file headers of an apply_patch input.
FILES="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input // (.toolArgs | if type == "string" then (fromjson? // {}) else . end) // {}) as $a
  | ($a.files // [])[]?, ($a.file_path // empty), ($a.path // empty), ($a.filePath // empty),
    (($a.input // "") | scan("\\*\\*\\* (?:Add|Update|Delete) File: (.+)") | .[0])
' 2>/dev/null)"

BLOCKED="$(printf '%s\n' "$FILES" | grep -E '\.(spec\.ts|feature)$' | head -1)"
[ -z "$BLOCKED" ] && { printf '{"continue":true}\n'; exit 0; }

REASON="Test files are protected (.protect-tests is set): refusing to edit $BLOCKED. Fix the implementation so the existing tests pass; do not change the tests."

# Copilot CLI: exit 2 blocks but drops the reason, so answer with the permissionDecision JSON
# (same contract as guard-destructive-bash.sh). Claude Code and VS Code: exit 2, reason on stderr.
if [ -n "${COPILOT_CLI:-}" ]; then
  jq -n --arg r "$REASON" '{permissionDecision: "deny", permissionDecisionReason: $r}'
  exit 0
fi
printf '%s\n' "$REASON" >&2
exit 2
