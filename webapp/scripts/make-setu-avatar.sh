#!/bin/bash
# Build the Setu avatar assets from a source portrait.
#   ./scripts/make-setu-avatar.sh ~/Downloads/setu-portrait.png
#
# Produces public/setu-avatar.png — a square, head-and-shoulders crop sized for
# the launcher (56px) and the message rail (32px). Small sizes are what matter:
# the face must stay readable at 32px, so we crop tight rather than shrink the
# whole figure.
set -euo pipefail

SRC="${1:?usage: make-setu-avatar.sh <source-image>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/setu-avatar.png"

# Source is portrait-ish; take a square from the upper portion (face + bow tie)
# rather than the centre, which would cut across the desk.
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SRC")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$SRC")
SIDE=$(( W < H ? W : H ))
# Bias the crop upward: face sits in the top ~60% of these renders.
Y=$(( (H - SIDE) / 4 ))
X=$(( (W - SIDE) / 2 ))

ffmpeg -v error -y -i "$SRC" -vf "crop=${SIDE}:${SIDE}:${X}:${Y},scale=512:512:flags=lanczos" "$OUT"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
echo "check it renders at 32px before shipping."
