#!/usr/bin/env bash
# PreToolUse hook: deny destructive shell commands outright. The deny list is the case block
# below — keep it there rather than mirrored in a comment that drifts out of date.
set -u

# The Copilot CLI also runs the .claude/settings.json copy of every hook; its .github/hooks copy
# already covers the CLI, so the Claude copy steps aside there.
case "$0" in *.claude/hooks/*) [ -n "${COPILOT_CLI:-}" ] && { printf '{"continue":true}\n'; exit 0; } ;; esac

INPUT="$(cat)"

# Two payload shapes: Claude, VS Code and Copilot CLI PascalCase events send tool_name/tool_input;
# Copilot CLI camelCase events (what APM emits into .github/hooks) send toolName/toolArgs,
# where toolArgs is a JSON string.
TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // .toolName // empty' 2>/dev/null)"

case "$TOOL" in
  Bash|bash|run|runCommands|runInTerminal|run_in_terminal|shell|executeCommand) ;;
  *) printf '{"continue":true}\n'; exit 0 ;;
esac

CMD="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input // (.toolArgs | if type == "string" then (fromjson? // {}) else . end) // {})
  | .command // .cmd // empty
')"
[ -z "$CMD" ] && { printf '{"continue":true}\n'; exit 0; }

deny() {
  REASON="$1"
  jq -n --arg r "$REASON" '{
    permissionDecision: "deny",
    permissionDecisionReason: $r,
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

case "$CMD" in
  *"rm -rf /"*|*"rm -rf /*"*)         deny "Refusing destructive rm -rf on root." ;;
  *"git push"*)                       deny "Refusing git push from an agent — pushing to remote is a human-driven action." ;;
  *"git reset --hard"*)               deny "Refusing git reset --hard from an agent — confirm with the user first." ;;
  *"npm publish"*)                    deny "Refusing npm publish from an agent — releases are human-driven." ;;
  *"--no-verify"*)                    deny "Refusing to bypass git hooks (--no-verify). Fix the failure instead." ;;
esac

printf '{"continue":true}\n'
