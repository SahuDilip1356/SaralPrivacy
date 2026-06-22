# Briefings Discovery — Go-Live Runbook

Three steps to ship the redesign + start the day 91–240 pipeline. **Recommended
order: Step 1 (push/merge) → Step 2 (backfill) → Step 3 (Sheet).** This way the
new faceted page is live *before* the data changes under it, so there's no
cosmetic mismatch window.

All commands run from the repo root:
`cd "/Users/sahudilip/Desktop/Product Dev/DPDPA Daily Brief/webapp"`

---

## Step 1 — Push, preview, merge the redesign

```bash
git push -u origin briefings-discovery
```

- Vercel auto-builds a **preview** for the branch. Get the URL from the Vercel
  dashboard → Deployments (or open a PR: `gh pr create --fill`).
- Open the preview `/briefings` and verify (the live render I couldn't do locally):
  - [ ] Search "school" → list narrows; type clears with the ×.
  - [ ] Toggle Stage (Learn/Assess/Fix/Sustain) and Format chips → counts update.
  - [ ] Sector dropdown filters; selected shows as an applied chip with ×.
  - [ ] "Clear all" resets; "Start here" rail shows only when nothing is filtered.
  - [ ] Pick an empty combo (e.g. a sector + a format with 0) → no-results panel.
  - [ ] Keyboard: Tab to a chip, Enter toggles it (aria-pressed).
- Check the Vercel build log **route count grew** (per the deploy rule).
- Merge to main → prod:
  ```bash
  git checkout main && git merge briefings-discovery && git push
  ```
- Restore your stashed notice-pack WIP whenever you go back to it:
  ```bash
  git checkout notice-pack-builder && git stash pop   # stash@{0}
  ```

---

## Step 2 — Backfill the 88 live briefings

Needs `.env` (with `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`,
`APPWRITE_DATABASE_ID`, `GOOGLE_SHEET_ID`) and `credentials.json` in the repo root —
same as the daily pipeline.

```bash
# 1. Dry-run — prints the plan, writes nothing
python3 tools/backfill_briefing_taxonomy.py

# 2. Review: total, "will reclassify", stage distribution, sample rows.
#    Confirm the stage/sector/format mapping looks right.

# 3. Apply — writes a reversible backup to .tmp/, then patches Appwrite
python3 tools/backfill_briefing_taxonomy.py --apply

# 4. (only if needed) Roll back from the backup it printed
python3 tools/backfill_briefing_taxonomy.py --revert .tmp/backfill_backup_<ts>.json
```

- Idempotent — safe to re-run; a second run is a no-op.
- Writes to **production Appwrite** (live site), independent of git. That's why
  Step 1 goes first — so the new page is already live to render the facets.

---

## Step 3 — Load days 91–240 into the Google Sheet

Source: `roadmap/day_91_240_enriched.csv` (delivered in chat).

1. Open the Google Sheet (the one in `GOOGLE_SHEET_ID`). It already has days 1–90.
2. Append 150 rows for days 91–240. Paste **column-by-column matching the headers**
   (the Sheet's column order may differ from the CSV — match by name, don't block-paste):
   `day, week, week_theme, topic, concept, clarification, save_worthy_takeaway,
   publish_channels, infographic_type, research_query`
3. Fill the **`Plan Published Date`** column from the CSV's `plan_published_date`
   (`23-Jun-26` … `19-Nov-26`). Match the existing `d-Mon-yy` format exactly.
4. Leave **`Published` blank** (not "Yes") for all new rows — that's how the
   pipeline knows they're pending.
5. **Do not** add stage/sector/content_type columns — the pipeline derives them
   automatically from `week_theme` / topic / `infographic_type`. (Those 3 columns
   in the CSV are preview-only.)

The daily GitHub Action runs at **09:00 IST**; on 23-Jun-26 it picks up day 91,
classifies it, and publishes it live with full taxonomy.

To backfill a missed day manually: `./run_pipeline.sh 2026-06-23`
