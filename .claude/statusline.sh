#!/usr/bin/env bash
# Custom statusline: model · directory · branch · session cost.
# Claude Code pipes a JSON status payload on stdin; print one line to stdout.
set -u

INPUT="$(cat)"

MODEL="$(printf '%s' "$INPUT" | jq -r '.model.display_name // "Claude"')"
DIR="$(printf '%s' "$INPUT" | jq -r '.workspace.current_dir // .cwd // "."')"
DIRNAME="$(basename "$DIR")"
BRANCH="$(git -C "$DIR" branch --show-current 2>/dev/null || true)"
COST="$(printf '%s' "$INPUT" | jq -r '.cost.total_cost_usd // empty')"

OUT="🅐 ${MODEL} · 📁 ${DIRNAME}"
[ -n "$BRANCH" ] && OUT="${OUT} · ⎇ ${BRANCH}"
if [ -n "$COST" ]; then
  PRETTY="$(printf '%.2f' "$COST" 2>/dev/null || printf '%s' "$COST")"
  OUT="${OUT} · \$${PRETTY}"
fi

printf '%s' "$OUT"
