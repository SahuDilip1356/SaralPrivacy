# AEO Citation Panel — Setup & Operations

Weekly automated measurement of whether ChatGPT, Claude, Perplexity, and Gemini cite saralprivacy.com for 5 locked DPDPA queries. Routes via OpenRouter (single API key, single bill) and writes results to Appwrite.

## Architecture

```
Vercel Cron (Mon 03:30 UTC = 09:00 IST)
  │
  ▼
/api/cron/aeo-panel/route.ts
  │  • Auth: Bearer ${CRON_SECRET}
  │
  ▼
lib/aeo/runner.ts → runAeoPanel()
  │  Iterates 5 prompts × 4 engines = 20 calls
  │
  ▼
lib/aeo/openrouter-client.ts → callOpenRouter()
  │  POST https://openrouter.ai/api/v1/chat/completions
  │  Auth: Bearer ${OPENROUTER_API_KEY}
  │  Returns: { content, citations[], raw }
  │
  ▼
lib/aeo/citation-detector.ts → detectCitation()
  │  Match URLs vs saralprivacy.com → Yes / No / Mentioned-no-link
  │  Capture position, page, competitors
  │
  ▼
Appwrite Collection: ai_citations
  │
  ▼
/admin/citations  ← live dashboard
```

## One-time setup

### 1. Environment variables (Vercel → Settings → Environment Variables)

Required, Production + Preview:

| Var | What | How to get |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key | https://openrouter.ai/keys — already set ✓ |
| `CRON_SECRET` | Random string used to authenticate cron calls | `openssl rand -hex 32` |

Already configured for the project: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`.

### 2. Create the Appwrite collection `ai_citations`

Open Appwrite Console → your DPDPA project → Databases → your DB → **Create Collection**:

- **Collection ID:** `ai_citations`
- **Name:** AI Citations

**Permissions:** Server-side only — leave at default (Any: none). Reads happen server-side via the API key.

**Attributes** (add in this order):

| Key | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `run_id` | String | 64 | ✓ | — | |
| `date` | String | 10 | ✓ | — | |
| `week_num` | Integer | — | ✓ | — | |
| `engine` | String | 32 | ✓ | — | |
| `engine_label` | String | 64 | ✓ | — | |
| `query_id` | String | 8 | ✓ | — | |
| `query_text` | String | 500 | ✓ | — | |
| `cited` | String | 32 | ✓ | — | |
| `position` | Integer | — | ✗ | — | |
| `cited_page` | String | 500 | ✗ | — | |
| `quote_type` | String | 32 | ✗ | — | |
| `competitors` | String | 4000 | ✗ | — | (JSON string) |
| `raw_citations` | String | 50000 | ✗ | — | (JSON string) |
| `content_snippet` | String | 1000 | ✗ | — | |
| `duration_ms` | Integer | — | ✗ | — | |
| `error_message` | String | 1000 | ✗ | — | |

**Indexes:**
- `run_id` — Key, ASC
- `date` — Key, DESC
- `engine` — Key, ASC

### 3. Set `CRON_SECRET` in Vercel

```bash
# generate
openssl rand -hex 32

# add to Vercel
vercel env add CRON_SECRET production preview
# paste the value when prompted
```

Important: Vercel auto-includes this as `Authorization: Bearer ${CRON_SECRET}` on cron-triggered requests. Without this env var set, the cron endpoint returns 500.

### 4. Deploy

```bash
git add webapp/lib/aeo webapp/app/api/cron/aeo-panel webapp/app/admin/citations webapp/lib/appwrite.ts webapp/vercel.json webapp/docs/aeo-panel-setup.md
git commit -m "Add AEO citation panel cron"
git push   # Vercel auto-deploys
```

**Hobby plan note:** Vercel Hobby allows 2 cron jobs per project. We're adding a 3rd. If deployment fails with a cron-limit error, two options:
- **Upgrade to Pro** ($20/mo) — unlimited crons, faster builds, larger team
- **Plan B (consolidate):** fold AEO panel into `/api/cron/briefing-send`, gated by `if (new Date().getUTCDay() === 1) { ... }`. Tell me if needed and I'll refactor.

## Verification

### Step 1 — Confirm collection exists
```bash
# from your machine, with APPWRITE_API_KEY in env
curl -s "${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections/ai_citations" \
  -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
  -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" | jq .name
# Expected: "AI Citations"
```

### Step 2 — Trigger manual run (don't wait until Monday)
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
     https://saralprivacy.com/api/cron/aeo-panel
```
Expected (takes ~60–120 seconds):
```json
{
  "ok": true,
  "totalDurationMs": 87000,
  "summary": {
    "total": 20,
    "cited": 3,
    "mentioned": 2,
    "errored": 0,
    "citeRate": 0.15,
    "byEngine": {
      "Perplexity": { "total": 5, "cited": 2 },
      "Claude":     { "total": 5, "cited": 1 },
      "ChatGPT":    { "total": 5, "cited": 0 },
      "Gemini":     { "total": 5, "cited": 0 }
    }
  },
  "persisted": 20,
  "dbErrors": []
}
```
First-run cite rate of 10–25% is expected — this is your **baseline before Tier 1 ships**.

### Step 3 — View dashboard
Visit https://saralprivacy.com/admin/citations
- Headline cite rate card
- Per-engine breakdown
- Per-query breakdown
- Trend (last 12 runs)
- Detail table for the most recent run

### Step 4 — Verify cron schedule
Vercel Dashboard → Project → Settings → Cron Jobs. You should see:
- `/api/cron/outreach-send` — `0 4 * * *`
- `/api/cron/briefing-send` — `30 4 * * *`
- `/api/cron/aeo-panel` — `30 3 * * 1` (Monday 03:30 UTC)

## Cost

5 prompts × 4 engines × 1 run/week ≈ 20 OpenRouter calls/week.
At ~$0.05–$0.10 per call (Sonar Pro and `:online` premium): **₹50–₹150 per month**.

Monitor at https://openrouter.ai/activity.

## Cadence guidance

- **Baseline run:** today, before Tier 1 ships.
- **Post-Tier-1 run:** within 24h of Tier 1 ship.
- **Then weekly:** Monday cron handles it.
- **Don't run more than ~2x per week.** LLM responses cache by query; you'll see noise not signal at daily granularity.

## Engine model identifiers (in `lib/aeo/engines.ts`)

| Engine | OpenRouter model | Search source |
|---|---|---|
| Perplexity | `perplexity/sonar-pro` | Native Perplexity search ✓ |
| Claude | `anthropic/claude-sonnet-4.5:online` | OpenRouter web wrapper (Exa) |
| ChatGPT | `openai/gpt-5:online` | OpenRouter web wrapper (Exa) |
| Gemini | `google/gemini-2.5-pro:online` | OpenRouter web wrapper (Exa) |

**Caveat:** For non-Perplexity engines, OpenRouter's `:online` plugin uses Exa for web search, not the engine's native search. So technically you're measuring "model + generic web search citation behavior" — not "ChatGPT.com's actual search behavior." Directionally correct for v1; future sprint can add native OpenAI Responses API and Anthropic Messages API web_search clients for calibration.

## Locked prompts (in `lib/aeo/prompts.ts`)

Do **not** change these once measurement begins. Trendlines depend on prompt constancy.

| ID | Topic | Target Page |
|---|---|---|
| Q1 | Recruitment | `/industries/recruitment-agencies` |
| Q2 | Penalty | `/penalty-calculator` |
| Q3 | Consent | `/learn/consent` |
| Q4 | DPDP Rules 2025 | `/learn/dpdp-rules-2025-plain-english-guide` |
| Q5 | Significant Data Fiduciary | `/glossary` |

## What success looks like

After 4 Monday runs (~1 month):

- **≥30% overall cite rate** → Tier 1 worked, start Tier 2 (per-URL glossary, HowTo schemas)
- **10–30%** → working but slow; investigate weak queries, audit those pages
- **<10% after 6 weeks** → schema regression or robots block — re-check robots.ts, run AI-bot UA curl test
- **One engine 0% while others 20%+** → that engine's user-agent or model identifier is wrong
- **Same page cited every week** → flagship — invest more
- **Same competitor weekly in `competitors` JSON** → real benchmark — study their schema

## Files added

- `webapp/lib/aeo/types.ts` — shared types
- `webapp/lib/aeo/prompts.ts` — 5 locked prompts
- `webapp/lib/aeo/engines.ts` — 4 engine configs
- `webapp/lib/aeo/openrouter-client.ts` — OpenRouter call wrapper + citation extraction
- `webapp/lib/aeo/citation-detector.ts` — saralprivacy match logic
- `webapp/lib/aeo/runner.ts` — orchestrator
- `webapp/app/api/cron/aeo-panel/route.ts` — cron handler (auth-gated)
- `webapp/app/admin/citations/page.tsx` — dashboard
- `webapp/lib/appwrite.ts` — added `AI_CITATIONS` to COLLECTIONS
- `webapp/vercel.json` — added cron entry
- `webapp/docs/aeo-panel-setup.md` — this file
