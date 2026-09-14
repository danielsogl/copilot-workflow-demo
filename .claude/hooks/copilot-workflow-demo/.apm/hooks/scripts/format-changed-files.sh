#!/usr/bin/env bash
# PostToolUse hook: format & lint files an agent just wrote/edited.
set -u

INPUT="$(cat)"

# Args arrive as tool_input (Claude, VS Code, CLI PascalCase events) or as the JSON string
# toolArgs (CLI camelCase events). Four path spellings because the harnesses disagree:
# Copilot's editFiles passes files[], Claude's Edit/Write pass file_path, others path or filePath.
FILES="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input // (.toolArgs | if type == "string" then (fromjson? // {}) else . end) // {}) as $a
  | ($a.files // [])[]?, ($a.file_path // empty), ($a.path // empty), ($a.filePath // empty)
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
