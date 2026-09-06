# SEO observability agent — Search Console watcher

`inspect.ts` answers one question every week: **is Google crawling the pages that convert?**
Context: the 2026-07-31 GSC baseline found 17 core commercial URLs never crawled (crawl-budget
starvation, not a defect). Indexing was requested 31 Jul / 1 Aug; this tool is the follow-up
that was owed since 7 Aug, made permanent.

## Boundary (settled)

| Automated | Human |
|---|---|
| URL Inspection API (crawl date, coverage, canonical) | the **Request Indexing** button — no API for ordinary pages, never puppeted |
| Search Analytics (28-day clicks/impressions per URL) | acting on the shortlist (≤10/day quota) |
| Sitemaps API (list, resubmit) | adding a pressed URL to the ledger in `watchlist.ts` |

## One-time setup (Dilip, ≈10 min)

1. Google Cloud console → project of the daily-briefing service account (or new) → enable **Google Search Console API**.
2. Service account: reuse the Sheets one or create `gsc-reader` → **Keys → add JSON key**.
3. Search Console → property **`https://saralprivacy.com/`** (URL-prefix, not the domain property — it has no history) → Settings → Users and permissions → add the service-account email as **Full**.
4. Save the key as `webapp/.gsc-service-account.json` (gitignored). For the weekly Action, the existing `GOOGLE_CREDENTIALS_JSON` secret is picked up automatically, or add `GSC_SERVICE_ACCOUNT_JSON`.
5. Apply `supabase/migrations/0005_ops_seo_inspections.sql` (optional — without it the tool diffs against the newest local report).

## Run

```bash
cd webapp
node --experimental-strip-types tools/seo/inspect.ts --dry-run          # fixture, no key
node --experimental-strip-types tools/seo/inspect.ts                    # watchlist + sitemap newcomers
node --experimental-strip-types tools/seo/inspect.ts --scope full       # every sitemap URL (≈240 of the 2,000/day quota)
node --experimental-strip-types --test tools/seo/verdict.test.ts        # unit tests
```

Flags: `--scope watchlist|newcomers|full` · `--budget N` · `--no-db` · `--no-analytics` · `--submit-sitemap` · `--site URL` · `--out DIR` · `--offline` (dry-run only).
Reports land in `tools/seo/reports/<timestamp>.json` (gitignored); the weekly Action uploads them as artifacts and writes `ops.seo_runs` + `ops.seo_inspections`.

## The decision tree (pre-agreed — fire it, don't re-debate)

| Verdict | Trigger | Next |
|---|---|---|
| `QUEUE_MOVED` | ≥50% of the watchlist has a real crawl date, or the discovered bucket shrank ≥30% vs last run | Resume Cycle 2: A2/A4/A6 → CA-firms pillar (B3) → B2 rationalisation |
| `STARVED` | ≥5 weeks since the request and still under 50% crawled | Skip hygiene; escalate to decision D-D (briefing cadence) |
| `TOO_EARLY` | under 5 weeks | re-run next week |
| `INSUFFICIENT_DATA` | over half the watchlist inspections failed (exit code 2) | fix access, re-run |

Every run also exports the **Crawled – currently not indexed** set and tests the hypothesis that it is the briefings (confirmed at ≥70%).

## Quota rule

A URL in `REQUESTED_INDEXING` (the ledger) is never shortlisted again — re-requesting doesn't jump the queue and burns the button quota. Press the button → add one ledger line.
