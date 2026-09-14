#!/usr/bin/env bash
# Type-checks every .ts file an eval run produced against @ngrx/signals 22 / Angular 22.
# Usage: tsc.sh <outputs-dir>   (exit 0 = clean; errors printed as tsc reports them)
# Relative imports the run never wrote (e.g. './book.model' the prompt says already exists)
# are stubbed as `any`, so every remaining error is a real one.
set -euo pipefail
OUT=$(cd "$1" && pwd)
DEPS=${CHECK_DEPS:-${TMPDIR:-/tmp}/ngrx-signals-check-deps}

if [ ! -d "$DEPS/node_modules/@ngrx/signals" ]; then
  mkdir -p "$DEPS"
  (cd "$DEPS" && npm init -y >/dev/null && npm i --silent \
    @ngrx/signals@22 @ngrx/operators@22 @angular/core@22 @angular/common@22 \
    @angular/platform-browser@22 rxjs typescript@~6.0 vitest@5 @types/jest)
fi

# Work dir lives inside DEPS so imports resolve from its node_modules.
WORK=$(mktemp -d "$DEPS/run-XXXXXX")
rsync -a --include='*/' --include='*.ts' --exclude='*' "$OUT/" "$WORK/"
cd "$WORK"

# ponytail: jest-vs-vitest globals picked by grep; a spec mixing both still fails, which is correct.
TYPES='"vitest/globals"'
grep -rqE '\bjest\.' . && TYPES='"jest"'

cat > tsconfig.json <<EOF
{ "compilerOptions": { "strict": true, "noEmit": true, "target": "es2022", "module": "esnext",
  "moduleResolution": "bundler", "lib": ["es2022", "dom"], "skipLibCheck": true, "types": [$TYPES] },
  "include": ["**/*.ts"] }
EOF

echo "tsc work dir: $WORK"
TSC="$DEPS/node_modules/.bin/tsc"
if "$TSC" -p . > first.log; then echo "tsc: clean"; exit 0; fi

# Stub each missing relative module with the names its importers use, then re-check.
python3 - <<'EOF'
import re
from pathlib import Path
missing = re.findall(r"^(.+?)\(\d+,\d+\): error TS2307: Cannot find module '(\.[^']+)'", Path("first.log").read_text(), re.M)
for src, spec in sorted(set(missing)):
    target = Path(f"{Path(src).parent / spec}.ts")  # "./book.model" -> book.model.ts
    names, default = set(), False
    for m in re.finditer(r"import\s+(?:type\s+)?(\w+)?\s*,?\s*(?:\{([^}]*)\})?\s*from\s*['\"]" + re.escape(spec) + r"['\"]", Path(src).read_text()):
        default |= bool(m.group(1)) and m.group(1) != "type"
        names |= {n.strip().removeprefix("type ").split(" as ")[0].strip() for n in (m.group(2) or "").split(",") if n.strip()}
    target.parent.mkdir(parents=True, exist_ok=True)
    # ponytail: every name is `any` as a type and an any-returning constructor as a value (inject() token, `new`); a stub can't catch misuse of the missing module itself.
    lines = [f"export type {n} = any;\nexport const {n}: new (...args: any[]) => any = undefined as any;" for n in sorted(names)]
    if default: lines.append("export default undefined as any;")
    target.write_text("\n".join(lines) + "\n")
    print(f"stubbed missing module {target} ({', '.join(sorted(names)) or 'default'})")
EOF

"$TSC" -p .
echo "tsc: clean"
