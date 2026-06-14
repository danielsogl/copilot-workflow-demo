#!/usr/bin/env bash
# PreToolUse hook: deny destructive shell commands from the agent.
# Read-only git (status/diff/log) is allowed; only destructive operations are blocked:
#   rm -rf /            force delete from root
#   git push            pushing to a remote is a human-driven action
#   git reset --hard    discards work — confirm with the user first
#   git push --force    never from an agent
#   npm publish         releases are human-driven
#   --no-verify         bypassing git/lefthook hooks is forbidden
set -u

INPUT="$(cat)"
TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')"

# Only guard Bash/shell tools.
case "$TOOL" in
  Bash|bash|run|runCommands|runInTerminal|shell|executeCommand) ;;
  *) printf '{"continue":true}\n'; exit 0 ;;
esac

CMD="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // .tool_input.cmd // empty')"
[ -z "$CMD" ] && { printf '{"continue":true}\n'; exit 0; }

deny() {
  jq -n --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

case "$CMD" in
  *"rm -rf /"*|*"rm -rf /*"*)   deny "Refusing destructive rm -rf on root." ;;
  *"git push"*)                 deny "Refusing git push from an agent — pushing to a remote is a human-driven action." ;;
  *"git reset --hard"*)         deny "Refusing git reset --hard from an agent — confirm with the user first." ;;
  *"npm publish"*)              deny "Refusing npm publish from an agent — releases are human-driven." ;;
  *"--no-verify"*)              deny "Refusing to bypass git/lefthook hooks (--no-verify). Fix the failure instead." ;;
esac

printf '{"continue":true}\n'
