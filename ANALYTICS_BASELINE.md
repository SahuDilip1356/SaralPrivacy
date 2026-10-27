# Analytics Baseline — captured 2026-09-06

**Source:** the Supabase ledger itself (every funnel event carries a timestamp; queried post-migration). Vercel Web Analytics API is not accessible on the current plan (dashboard-only) — pageview-side numbers can be added by hand from the dashboard, but the ledger counts below are the ones the gates actually use.

## The 10-week funnel baseline (weeks of 2026-06-29 → 2026-08-31)

| Week of | Assessments | Template DLs | Guide DLs | Notice starts | Notice leads | New subs | Contact leads |
|---|---|---|---|---|---|---|---|
| Jun 29 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| Jul 06 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| Jul 13 | 0 | 0 | 0 | 10 | 0 | 0 | 0 |
| Jul 20 | 1 | 4 | 1 | 3 | 0 | 0 | 0 |
| Jul 27 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| Aug 03 | 0 | 1 | 1 | 2 | 0 | 0 | 0 |
| Aug 10 | 0 | 0 | 0 | 8 | 0 | 0 | 0 |
| Aug 17 | 0 | 0 | 0 | 4 | 0 | 0 | 0 |
| Aug 24 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| Aug 31 | 0 | 0 | 1 | 3 | 0 | 0 | 0 |
| **10-wk total** | **1** | **5** | **3** | **35** | **0** | **0** | **0** |

Reference stock (all-time, post-migration verified): 52 assessments · 9 template leads · 20 guide leads · 11 subscribers (mostly test/bounced — briefing sends currently reach ~0 real readers) · 3 leads · 3 notice captures.

## What this baseline decides

1. **The 7-day keep/kill gate is formally retired.** At these volumes a week of data contains no signal. Any feature-judgment rule now uses a **denominator gate**: evaluate per-N qualifying events (e.g. per-25 notice starts, per-100 sessions from the GSC/dashboard side), however long N takes to accumulate.
2. **The notice generator is the only organically alive tool** (~3.5 starts/week) — but converts to 0 leads. If any conversion slice gets built first, its strongest candidate surface is the notice funnel, not the assessment funnel.
3. **Gate 3 arithmetic reality:** ≥2 conversions per 100 assessments is unmeasurable at ~0.1 assessments/week. Gate 3 therefore depends on *traffic and distribution work*, not on product polish — this baseline is the quantitative case behind "spine before reach, then reach hard."
4. **Before/after discipline:** every future ship (Hindi entry, flow teaser, hero verdict…) is compared against THIS table, not against impressions.

Refresh cadence: re-run the ledger query at each phase exit (the SQL lives in the session log / is one `generate_series` query over the funnel tables).
