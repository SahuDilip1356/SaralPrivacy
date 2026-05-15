# SaralPrivacy AEO Citation Tracker — Setup Guide

Manual weekly tracker for measuring whether ChatGPT, Claude, Perplexity, and Gemini cite saralprivacy.com for core DPDPA queries. Retires when `tools/aeo-panel.ts` cron ships (Sprint 5).

## Files in this template

| File | Becomes Google Sheets tab |
|------|---------------------------|
| `aeo-tracker-log.csv` | `Log` — raw entries (one row per query × engine) |
| `aeo-tracker-queries.csv` | `Queries` — locked Q1–Q5 prompts (do not edit weekly) |
| `aeo-tracker-summary.csv` | `Summary` — formulas + KPIs |

## One-time setup (20 minutes)

### Step 1 — Create the Sheet
1. Go to https://sheets.new
2. Rename: **SaralPrivacy AEO Citation Tracker**
3. Create 3 tabs (bottom-left **+** button): `Log`, `Queries`, `Summary`. Delete the default Sheet1.

### Step 2 — Import each CSV into its tab
For each CSV file:
1. Click the target tab.
2. **File → Import → Upload** → drag the CSV.
3. Import location: **Replace current sheet**. Separator: **Comma**. Convert text to numbers/dates: **Yes**.
4. Click **Import data**.

### Step 3 — Convert Summary formulas (one-time)
The `Summary` tab imports formulas as plain text. Convert them:
1. Select column B in `Summary` (the formula column).
2. **Edit → Find and replace** → Find `^=` → Replace `=` → Tick **Search using regular expressions** + **Also search within formulas** → **Replace all**.
3. Alternatively: click each cell, press F2, press Enter — Sheets re-evaluates.

### Step 4 — Add data validation (dropdowns)
Makes weekly logging fast and consistent.

In the `Log` tab, select a column and use **Data → Data validation → Add rule → Dropdown**:

| Column | Dropdown options |
|--------|-------------------|
| C (Engine) | `ChatGPT`, `Claude`, `Perplexity`, `Gemini` |
| D (Query ID) | `Q1`, `Q2`, `Q3`, `Q4`, `Q5` |
| F (Cited?) | `Yes`, `No`, `Mentioned-no-link` |
| I (Quote Type) | `Verbatim`, `Paraphrase`, `Just-link` |

Apply to the entire column (rows 2:1000) so future rows inherit.

### Step 5 — Auto-fill Query text from Query ID (optional but recommended)
In `Log!E2`, paste:
```
=IFERROR(VLOOKUP(D2,Queries!$A$2:$C$6,3,FALSE),"")
```
Drag down to row 1000. Column E now auto-fills the full query text whenever you pick Q1–Q5 in column D.

### Step 6 — Auto-fill Week # from Date
In `Log!B2`, paste:
```
=IFERROR(WEEKNUM(A2),"")
```
Drag down to row 1000.

### Step 7 — Build the trend chart
In `Summary` tab:
1. **Insert → Chart**.
2. Chart type: **Line chart**.
3. Data range: build a small pivot below the KPIs, or use `Log` data grouped by Week + Engine.
4. Save the chart pinned to the Summary tab.

(For week 1 there's no trend yet — chart starts looking useful after week 3.)

### Step 8 — Delete example rows
The `Log` CSV ships with 20 example rows dated 2026-05-18 (the first Monday after this template lands). Either:
- Keep them as your **week 1 entries** — just update the date to your actual run date and fill in F–K, OR
- Delete rows 2:21 and start fresh on your first Monday.

---

## Weekly run (15 minutes, every Monday 9:00 AM)

1. Open 4 browser tabs: ChatGPT (chat.openai.com), Claude (claude.ai), Perplexity (perplexity.ai), Gemini (gemini.google.com). Use a **clean browser profile** (Incognito or a dedicated profile) — no personalisation skew.
2. Confirm each is in **web-search / browse mode**:
   - ChatGPT: globe icon enabled in composer
   - Claude: Settings → Features → Web search ON
   - Perplexity: default
   - Gemini: default
3. Add 20 new rows to the `Log` tab (5 queries × 4 engines).
4. Paste `=TODAY()` into A2:A21, then **Edit → Paste special → Values only** to freeze the date.
5. Pick Query ID in column D (`Q1`...`Q5`) — query text auto-fills in E.
6. Run **one query at a time**, all 4 engines, before moving to next query. Don't multitask — read the answer fully.
7. Fill columns F–K per the scoring rubric below.
8. Open `Summary` tab — confirm new week's numbers updated. Done.

---

## Scoring rubric — be strict, be consistent

| Situation | Column F | Column G (Position) |
|---|---|---|
| saralprivacy.com URL clickable in citation footer/sidebar | `Yes` | Position number (1 = top) |
| saralprivacy link inline in answer | `Yes` | Inline position, or 1 if only inline |
| "SaralPrivacy" mentioned but no link | `Mentioned-no-link` | (blank) |
| Brand/URL nowhere in response | `No` | (blank) |
| saralprivacy is the only citation | `Yes` | 1 |

**Column I (Quote Type):**
- `Verbatim` — engine quoted our text word-for-word (best signal: AnswerBlock + schema working)
- `Paraphrase` — engine reworded our content
- `Just-link` — link in sidebar, no visible use of our content

**Column J (Competitor Cited):**
List the other sites in the citation panel. Comma-separated. Examples: `Lawctopus, Lexology, govt.in`. This is gold — you learn who you're actually competing with.

**If two saralprivacy pages cited in same response:** duplicate the row, change column H. F still = `Yes` once for the trendline.

---

## Reading the trendline (after 4 weeks = 80 data points)

| Signal | Action |
|---|---|
| Cite rate ≥ 30% | Tier 1 worked. Start Tier 2 (per-URL glossary, HowTo schemas). |
| Cite rate 10–30% | Working but slow. Investigate weak Q's, audit those pages. |
| Cite rate < 10% after 6 weeks | Something broken — re-run AI-bot UA curl test, check robots.ts. |
| Avg position improves (4 → 2) | Authority lifting. Keep going. |
| Same page cited repeatedly (col H) | That's your flagship — invest more there. |
| Same competitor every week (col J) | That's your real benchmark — study their schema. |

**Red flags — act immediately:**
- Cite rate drops 2 weeks in a row → recent deploy may have broken schema. Run `tools/verify-aeo.sh`.
- One engine 0% while others >20% → that engine's user-agent is blocked. Re-check `app/robots.ts`.

---

## Calendar discipline

- **Every Monday 9:00 AM** → 20-minute calendar block. Link to Sheet in event description.
- **End of every month** → screenshot Summary tab → paste into `memory/learnings.md` under "AEO trendline".
- **When `tools/aeo-panel.ts` cron lands** → manual run retires. Cron writes same columns to Appwrite; Sheet stays as the dashboard view.

---

## Don't change

- **The 5 queries.** Locked Q1–Q5. Changing them mid-stream invalidates the trendline.
- **The engines.** Same 4, same order. If you add Grok or Copilot later, add as `Engine` dropdown options — don't replace existing.
- **The browser profile.** Same profile every Monday. Login state, history, and personalisation all affect citations.
