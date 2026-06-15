#!/usr/bin/env bash
# SessionStart hook: emit a one-line project context banner into the agent's session.
set -u

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
BRANCH="$(git -C "$ROOT" branch --show-current 2>/dev/null || echo unknown)"
NODE_V="$(node --version 2>/dev/null || echo unknown)"
NG_V="$(node -p "require('$ROOT/package.json').dependencies['@angular/core']" 2>/dev/null || echo unknown)"

CONTEXT="Project: copilot-workflow-demo | Branch: ${BRANCH} | Node: ${NODE_V} | Angular: ${NG_V}. Conventions live in AGENTS.md (generated from .apm/instructions/); deep guidance lives in skills under .agents/skills/. All agent config is managed by APM — edit sources in .apm/, never the generated dirs."

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
