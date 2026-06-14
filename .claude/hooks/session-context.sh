#!/usr/bin/env bash
# SessionStart hook: inject a one-line project context banner into the agent's session.
# Output on stdout under hookSpecificOutput.additionalContext is appended to Claude's context.
set -u

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
BRANCH="$(git -C "$ROOT" branch --show-current 2>/dev/null || echo unknown)"
NODE_V="$(node --version 2>/dev/null || echo unknown)"
NG_V="$(node -p "require('$ROOT/package.json').dependencies['@angular/core']" 2>/dev/null || echo unknown)"

CONTEXT="Project: copilot-workflow-demo | Branch: ${BRANCH} | Node: ${NODE_V} | Angular: ${NG_V}. Baseline conventions live in AGENTS.md; Claude-specific guidance in CLAUDE.md and .claude/rules/; deep guidance in skills under .claude/skills/ and .github/skills/."

# Escape for JSON.
ESCAPED="$(printf '%s' "$CONTEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || printf '"%s"' "$CONTEXT")"

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": ${ESCAPED}
  }
}
EOF
