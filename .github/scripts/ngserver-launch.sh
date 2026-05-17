#!/usr/bin/env bash
# Launch the Angular Language Server with absolute probe locations
# pointing at the project's node_modules.
set -eu

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BIN="$ROOT/node_modules/.bin/ngserver"

if [ ! -x "$BIN" ]; then
  echo "ngserver binary not found at $BIN. Run: npm install" >&2
  exit 127
fi

exec "$BIN" \
  --stdio \
  --tsProbeLocations "$ROOT/node_modules" \
  --ngProbeLocations "$ROOT/node_modules" \
  "$@"
