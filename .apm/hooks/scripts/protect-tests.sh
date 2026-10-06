#!/usr/bin/env bash
# PreToolUse hook: block agent edits to test files (*.spec.ts, *.feature) while the repo root holds a
# `.protect-tests` marker file (gitignored). A file, not an env var, so it toggles live in all three
# harnesses without restarting VS Code: `touch .protect-tests` / `rm .protect-tests`.
set -u

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
[ -f "$ROOT/.protect-tests" ] || { printf '{"continue":true}\n'; exit 0; }

INPUT="$(cat)"

# Fail closed while the marker is set: VS Code treats any exit code other than 2 as a warning and runs the tool.
deny() {
  if [ -n "${COPILOT_CLI:-}" ] || printf '%s' "$INPUT" | jq -e 'has("toolName")' >/dev/null 2>&1; then
    jq -n --arg r "$1" '{permissionDecision: "deny", permissionDecisionReason: $r}' 2>/dev/null && exit 0
  fi
  printf '%s\n' "$1" >&2
  exit 2
}
command -v jq >/dev/null || deny "protect-tests.sh needs jq while .protect-tests is set."

# Same two payload shapes as guard-destructive-bash.sh. Only edit tools count — reading a test is fine.
TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // .toolName // empty')" || deny "protect-tests.sh could not parse the hook payload."
case "$(printf '%s' "$TOOL" | tr '[:upper:]' '[:lower:]')" in
  *edit*|*write*|*create*|*replace*|*patch*|*insert*) ;;
  *) printf '{"continue":true}\n'; exit 0 ;;
esac

# Path spellings as in format-changed-files.sh, plus multi_replace_string_in_file's replacements and the
# file headers of an apply_patch input.
FILES="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input // (.toolArgs | if type == "string" then (fromjson? // {}) else . end) // {}) as $a
  | ($a.files // [])[]?, ($a.replacements // [])[]?.filePath?, ($a.file_path // empty), ($a.path // empty), ($a.filePath // empty),
    (($a.input // "") | scan("\\*\\*\\* (?:(?:Add|Update|Delete) File|Move to): (.+)") | .[0])
' 2>/dev/null)"

# Only committed, unchanged tests are frozen: new tests and uncommitted test edits stay writable,
# so the agent can still write RED tests. Committing them is the human sign-off that freezes them.
BLOCKED=""
while IFS= read -r f; do
  [ -z "$f" ] && continue
  git -C "$ROOT" ls-files --error-unmatch -- "$f" >/dev/null 2>&1 || continue
  git -C "$ROOT" diff --quiet HEAD -- "$f" 2>/dev/null || continue
  BLOCKED="$f"; break
done <<EOF_FILES
$(printf '%s\n' "$FILES" | grep -E '\.(spec\.ts|feature)$')
EOF_FILES
[ -z "$BLOCKED" ] && { printf '{"continue":true}\n'; exit 0; }

REASON="Committed tests are frozen (.protect-tests is set): refusing to edit $BLOCKED. Fix the implementation so the existing tests pass; do not change the tests. New test files are fine."

# camelCase payloads (Copilot CLI): exit 2 blocks but drops the reason, so deny() answers with the
# permissionDecision JSON. Claude Code and VS Code: exit 2, reason on stderr.
deny "$REASON"
