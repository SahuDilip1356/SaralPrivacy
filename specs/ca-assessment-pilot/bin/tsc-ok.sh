#!/usr/bin/env bash
# Passes when the app's TypeScript error count is no higher than the baseline
# recorded at Setup. Run from the app folder (<worktree>/webapp).
set -euo pipefail
base_file="$(git rev-parse --git-common-dir)/ca-pilot-tsc-baseline"
if [ ! -x ./node_modules/.bin/tsc ]; then echo "tsc missing: run npm ci" >&2; exit 2; fi
if [ ! -f "$base_file" ]; then echo "no baseline: run the Setup baseline command first" >&2; exit 2; fi
now="$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS' || true)"
base="$(cat "$base_file")"
echo "tsc errors: $now (baseline $base)"
[ "$now" -le "$base" ]
