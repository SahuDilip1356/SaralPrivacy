#!/usr/bin/env bash
# Records the app's TypeScript error count once, on the untouched base commit.
# Run from the app folder (<worktree>/webapp) right after npm ci, before T1.
set -euo pipefail
base_file="$(git rev-parse --git-common-dir)/ca-pilot-tsc-baseline"
[ -x ./node_modules/.bin/tsc ] || { echo "tsc missing: run npm ci" >&2; exit 2; }
./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS' > "$base_file" || true
echo "baseline $(cat "$base_file") written to $base_file"
