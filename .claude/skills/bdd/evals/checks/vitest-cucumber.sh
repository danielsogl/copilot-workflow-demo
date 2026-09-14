#!/usr/bin/env bash
# Runs an eval run's vitest-cucumber output for real.
# Usage: vitest-cucumber.sh <outputs-dir>
#   - outputs contain package.json (install-from-zero eval): clean copy, npm install, npm test.
#   - otherwise (domain-store eval): shared deps + stub Cart if src/cart/cart.ts is missing.
set -euo pipefail
OUT=$(cd "$1" && pwd)

if [ -f "$OUT/package.json" ]; then
  WORK=$(mktemp -d "${TMPDIR:-/tmp}/vc-install-XXXXXX")
  cp -R "$OUT/." "$WORK/"
  cd "$WORK" && echo "work dir: $WORK"
  npm install --no-audit --no-fund
  npm test
  exit
fi

DEPS=${CHECK_DEPS:-${TMPDIR:-/tmp}/vitest-cucumber-check-deps}
if [ ! -d "$DEPS/node_modules/@amiceli/vitest-cucumber" ]; then
  mkdir -p "$DEPS"
  (cd "$DEPS" && npm init -y >/dev/null && npm pkg set type=module && npm i --silent vitest@5 @amiceli/vitest-cucumber@8 typescript @types/node)
fi
WORK=$(mktemp -d "$DEPS/run-XXXXXX")
cp -R "$OUT/." "$WORK/"
cd "$WORK" && echo "work dir: $WORK"

if [ ! -f src/cart/cart.ts ]; then
  mkdir -p src/cart
  # ponytail: permissive stub — only load/step-match errors are meaningful; pricing mismatches are not.
  cat > src/cart/cart.ts <<'EOF'
export class InvalidCouponError extends Error {}
type Item = Record<string, any>
export class Cart {
  private items: Item[] = []
  private coupon?: string
  add(item: Item) { this.items.push(item) }
  remove(id: unknown) { this.items = this.items.filter((i) => (i.id ?? i.sku ?? i.name) !== id) }
  applyCoupon(code: string) {
    if (code !== 'SAVE10' && code !== 'FREESHIP') throw new InvalidCouponError(`Invalid coupon: ${code}`)
    this.coupon = code
  }
  get lines() { return this.items }
  get subtotal() { return this.items.reduce((s, i) => s + Number(i.price ?? i.unitPrice ?? 0) * Number(i.quantity ?? i.qty ?? 1), 0) }
  get total() { return (this.coupon === 'SAVE10' ? this.subtotal * 0.9 : this.subtotal) + (this.coupon === 'FREESHIP' ? 0 : 5) }
}
EOF
fi

"$DEPS/node_modules/.bin/vitest" run --root "$WORK" ${VITEST_ARGS:-}
