#!/usr/bin/env bash
# Core Theme v4.0 drift gate. Run from webapp/: bash scripts/design-lint.sh
#
# A ratchet, not a pass/fail wall. Two of these rules describe debt that
# predates the theme (roughly a hundred hand-rolled green-500 CTAs, a handful
# of oversized card radii); Waves 1-3 burn them down surface by surface. So the
# gate records the count it inherited and fails only when a count goes UP —
# new drift is blocked from day one, and the baseline drops as waves land.
#
#   bash scripts/design-lint.sh            check against the baseline
#   bash scripts/design-lint.sh --update   re-record after a wave lands
#
# Written for bash 3.2 (macOS default): no associative arrays.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 2
BASELINE_FILE="scripts/design-lint.baseline"
BASELINE_DIR="scripts/design-lint.baseline.d"
WORK=$(mktemp -d) || exit 2
trap 'rm -rf "$WORK"' EXIT

UPDATE=0
[ "${1:-}" = "--update" ] && UPDATE=1
fail=0
: > "$WORK/keys"

check() { # key, explanation, matches
  key="$1"; why="$2"; matches="$3"
  count=0
  [ -n "$matches" ] && count=$(printf '%s\n' "$matches" | wc -l | tr -d ' ')
  echo "$key" >> "$WORK/keys"
  echo "$count" > "$WORK/$key.count"
  echo "$why"   > "$WORK/$key.why"
  printf '%s' "$matches" > "$WORK/$key.matches"
}

check "cta-glow" \
  "--shadow-green was deleted; elevation is a hairline, not a halo." \
  "$(grep -rn "shadow-green" app components --include="*.tsx" --include="*.css" 2>/dev/null)"

check "heading-weight" \
  "Headings cap at font-semibold; emphasis comes from size and tracking." \
  "$(grep -rEn '<h[1-6][^>]*font-(bold|extrabold|black)' app components --include="*.tsx" 2>/dev/null)"

check "unreadable-green" \
  "white on green-500 is 2.54:1. Use Button variant=primary (5.48:1) or primaryOnDark (9.72:1)." \
  "$(grep -rEn 'bg-green-500[^\"]*text-white|text-white[^\"]*bg-green-500' app components --include="*.tsx" 2>/dev/null)"

check "card-radius" \
  "rounded-2xl exceeds the card cap; the radius vocabulary is 8 / 12 / pill." \
  "$(grep -rn "rounded-2xl" components/home app/page.tsx 2>/dev/null)"

check "chrome-badges" \
  "Site chrome carries one action and no badges; 'free' is said once, in the hero." \
  "$(grep -rn "Badge" components/layout/ --include="*.tsx" 2>/dev/null)"

# The three shades below measured under 4.5:1 on this palette's light surfaces
# (teal-600 3.24, teal-700 4.48-4.67, green-600 3.47-3.77). They are legal on a
# NAVY surface, so this is a ratchet, not a ban — the baseline holds the dark-
# surface uses and only new ones have to justify themselves.
check "low-contrast-teal" \
  "teal-600/700 text measures 3.2-4.7:1 on light surfaces. Use teal-800 (7.05:1) unless the surface is navy." \
  "$(grep -rEn 'text-teal-(600|700)' app components --include="*.tsx" 2>/dev/null)"

check "low-contrast-green-text" \
  "green-600 text measures 3.4-3.8:1 on light surfaces. Use green-700 (5.48:1) or green-800." \
  "$(grep -rEn 'text-green-600' app components --include="*.tsx" 2>/dev/null)"

# green-700 is the right ink on WHITE (5.48:1) but not on the green-100 chip
# fill, where it drops to 4.48:1 — under the bar by a hair, which is why it
# survived every earlier sweep. Matched per line rather than inside one
# className, so the { bg: "...", text: "..." } style maps are caught too.
check "green-on-green" \
  "text-green-700 on a green-100 fill is 4.48:1. Use text-green-800 (6.28:1)." \
  "$(grep -rn 'bg-green-100' app components --include="*.tsx" 2>/dev/null | grep 'text-green-700')"

# slate-400 is CORRECT on navy (6.75:1) and wrong on light (2.4-2.6:1), so the
# baseline carries the legitimate dark-surface uses. A rise means someone added
# muted text to a light surface.
check "muted-text-on-light" \
  "slate-400 is 2.4-2.6:1 on light surfaces (it is correct on navy). Use slate-600 on light." \
  "$(grep -rEn 'text-slate-400' app components --include="*.tsx" 2>/dev/null)"

if [ "$UPDATE" -eq 1 ]; then
  : > "$BASELINE_FILE"
  rm -rf "$BASELINE_DIR"; mkdir -p "$BASELINE_DIR"
  while read -r key; do
    echo "$key=$(cat "$WORK/$key.count")" >> "$BASELINE_FILE"
    # Snapshot the matching lines too, so a later run can name exactly which
    # occurrence is new rather than guessing from a count.
    cp "$WORK/$key.matches" "$BASELINE_DIR/$key"
  done < "$WORK/keys"
  echo "Baseline recorded in $BASELINE_FILE:"
  cat "$BASELINE_FILE"
  exit 0
fi

while read -r key; do
  now=$(cat "$WORK/$key.count")
  was=$(grep "^$key=" "$BASELINE_FILE" 2>/dev/null | cut -d= -f2)
  [ -z "$was" ] && was=0
  if [ "$now" -gt "$was" ]; then
    echo "✗ $key — $now occurrences, baseline $was (+$((now - was)) new)"
    echo "  $(cat "$WORK/$key.why")"
    if [ -f "$BASELINE_DIR/$key" ]; then
      grep -Fxv -f "$BASELINE_DIR/$key" "$WORK/$key.matches" | sed 's/^/    /'
    else
      sed 's/^/    /' "$WORK/$key.matches"
    fi
    echo
    fail=1
  elif [ "$now" -lt "$was" ]; then
    echo "✓ $key — $now, down from $was. Run --update to lock the gain in."
  elif [ "$now" -gt 0 ]; then
    echo "· $key — $now known, scheduled for a later wave."
  else
    echo "✓ $key — clean."
  fi
done < "$WORK/keys"

echo
if [ "$fail" -eq 0 ]; then
  echo "Core Theme v4.0: no new drift."
else
  echo "Core Theme v4.0: new drift — see above."
fi
exit "$fail"
