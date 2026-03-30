#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# DPDPA Daily Brief — Pipeline Runner
# Triggered by macOS launchd at 9:00 AM IST (03:30 UTC) every day
#
# Flow:
#   read_roadmap    → research → generate_content → generate_infographic
#   → publish_to_webapp (live on saralprivacy.com immediately, Published=Yes in Sheet)
#
# Logs to: .tmp/pipeline_YYYY-MM-DD.log
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT="/Users/sahudilip/Desktop/Product Dev/DPDPA Daily Brief"
PYTHON="$PROJECT/.venv/bin/python3"
DATE=$(TZ="Asia/Kolkata" date +%F)
LOG_DIR="$PROJECT/.tmp"
LOG="$LOG_DIR/pipeline_$DATE.log"

mkdir -p "$LOG_DIR"

# Tee all output to log file + stdout
exec > >(tee -a "$LOG") 2>&1

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DPDPA PIPELINE START"
echo "  $(TZ='Asia/Kolkata' date '+%Y-%m-%d %H:%M:%S IST')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT"

# ── Step 1: Read Roadmap ──────────────────────────────────────────────────────
echo ""
echo "[1/5] Reading roadmap for $DATE ..."
$PYTHON tools/read_roadmap.py --date "$DATE"

# Check if today has a planned topic
ROADMAP_FILE=".tmp/roadmap_$DATE.json"
if [ ! -f "$ROADMAP_FILE" ]; then
    echo "ERROR: Roadmap file not created. Aborting."
    exit 1
fi

SKIP=$($PYTHON -c "import json; d=json.load(open('$ROADMAP_FILE')); print(str(d.get('skip', False)).lower())")
if [ "$SKIP" = "true" ]; then
    REASON=$($PYTHON -c "import json; d=json.load(open('$ROADMAP_FILE')); print(d.get('reason','unknown'))")
    echo ""
    echo "No topic planned for $DATE (reason: $REASON) — pipeline skipped cleanly."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
fi

TOPIC=$($PYTHON -c "import json; d=json.load(open('$ROADMAP_FILE')); print(d.get('topic','?'))")
DAY=$($PYTHON -c "import json; d=json.load(open('$ROADMAP_FILE')); print(d.get('day','?'))")
echo "  → Day $DAY: $TOPIC"

# ── Step 2: Research ──────────────────────────────────────────────────────────
echo ""
echo "[2/5] Researching topic (SerpAPI) ..."
$PYTHON tools/research.py --input ".tmp/roadmap_$DATE.json"

# ── Step 3: Generate Content ──────────────────────────────────────────────────
echo ""
echo "[3/5] Generating content (Claude) ..."
$PYTHON tools/generate_content.py --input ".tmp/research_$DATE.json"

# ── Step 4: Generate Infographic ──────────────────────────────────────────────
echo ""
echo "[4/5] Generating infographic (KIE.ai) ..."
$PYTHON tools/generate_infographic.py --input ".tmp/content_$DATE.json"

# ── Step 5: Publish ───────────────────────────────────────────────────────────
echo ""
echo "[5/5] Publishing to saralprivacy.com ..."
$PYTHON tools/publish_to_webapp.py --date "$DATE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DPDPA PIPELINE COMPLETE"
echo "  $(TZ='Asia/Kolkata' date '+%Y-%m-%d %H:%M:%S IST')"
echo "  Briefing live on saralprivacy.com"
echo "  n8n will send emails at 9:30 AM IST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
