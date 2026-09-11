#!/usr/bin/env bash
# PostToolUse hook: format & lint files an agent just wrote/edited.
set -u

INPUT="$(cat)"

# Four spellings because the harnesses disagree: Copilot's editFiles passes files[],
# Claude's Edit/Write pass file_path, others pass path or filePath.
FILES="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input.files // [])[]?,
  (.tool_input.file_path // empty),
  (.tool_input.path // empty),
  (.tool_input.filePath // empty)
' 2>/dev/null | sort -u)"

if [ -z "$FILES" ]; then
  printf '{"continue":true}\n'
  exit 0
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

while IFS= read -r FILE; do
  [ -z "$FILE" ] && continue
  case "$FILE" in
    /*) ABS="$FILE" ;;
    *)  ABS="$ROOT/$FILE" ;;
  esac
  [ -f "$ABS" ] || continue

  case "$ABS" in
    *.ts|*.tsx)
      npx --no-install eslint --fix "$ABS" >/dev/null 2>&1 || true
      npx --no-install prettier --write "$ABS" >/dev/null 2>&1 || true
      ;;
    *.html|*.scss|*.css|*.json|*.md|*.yml|*.yaml)
      npx --no-install prettier --write "$ABS" >/dev/null 2>&1 || true
      ;;
  esac
done <<< "$FILES"

printf '{"continue":true}\n'
