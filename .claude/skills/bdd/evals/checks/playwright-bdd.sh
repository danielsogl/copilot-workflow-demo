#!/usr/bin/env bash
# Runs an eval run's playwright-bdd output for real.
# Usage: playwright-bdd.sh <outputs-dir>
#   - outputs contain package.json (install-from-zero eval): clean copy, npm install, bddgen, chromium test run.
#   - otherwise (POM eval, no app to test against): shared deps, bddgen + tsc only.
set -euo pipefail
OUT=$(cd "$1" && pwd)

if [ -f "$OUT/package.json" ]; then
  WORK=$(mktemp -d "${TMPDIR:-/tmp}/pwbdd-install-XXXXXX")
  cp -R "$OUT/." "$WORK/"
  cd "$WORK" && echo "work dir: $WORK"
  npm install --no-audit --no-fund
  npx playwright install chromium
  npx bddgen
  npx playwright test --project=chromium
  exit
fi

DEPS=${CHECK_DEPS:-${TMPDIR:-/tmp}/playwright-bdd-check-deps}
if [ ! -d "$DEPS/node_modules/playwright-bdd" ]; then
  mkdir -p "$DEPS"
  (cd "$DEPS" && npm init -y >/dev/null && npm i --silent playwright-bdd@9 @playwright/test typescript @types/node)
fi
WORK=$(mktemp -d "$DEPS/run-XXXXXX")
cp -R "$OUT/." "$WORK/"
cd "$WORK" && echo "work dir: $WORK"

npx bddgen
[ -f tsconfig.json ] || cat > tsconfig.json <<'EOF'
{ "compilerOptions": { "strict": true, "noEmit": true, "target": "es2022", "module": "esnext",
  "moduleResolution": "bundler", "skipLibCheck": true, "types": ["node"] },
  "include": ["**/*.ts"], "exclude": [".features-gen", "node_modules"] }
EOF
npx tsc --noEmit -p .
echo "bddgen + tsc: clean"
