#!/usr/bin/env bash
# PreToolUse hook: deny obviously destructive shell commands unless the agent invokes them explicitly with the user's say-so.
# Pattern matches:
#   rm -rf /        force delete from root
#   git push --force / git push -f against main/master
#   git reset --hard
#   npm publish      (publishing should be a release-time human action)
set -u

INPUT="$(cat)"
TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')"

# Only Bash/Shell tools.
case "$TOOL" in
  Bash|bash|run|runCommands|runInTerminal|shell|executeCommand) ;;
  *) printf '{"continue":true}\n'; exit 0 ;;
esac

CMD="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // .tool_input.cmd // empty')"
[ -z "$CMD" ] && { printf '{"continue":true}\n'; exit 0; }

deny() {
  REASON="$1"
  jq -n --arg r "$REASON" '{
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
