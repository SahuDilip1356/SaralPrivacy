# Stage 7: Critic Review — spec.md

Reviewers (fresh context, run in parallel): egm-design, egm-structural, egm-style. Date: 2026-11-03. Standard: feature-spec-standard.md (design, structural). Target: spec.md after the Stage 5 and 6 fixes, with intent.md as context.

**Verdicts in short.**
- **Design:** the client-side design is careful, but two blind spots remain: the server boundary trusts client text, and the measurement can't produce a readable result from a near-zero baseline.
- **Structural:** the spec follows the template, and every goal has ACs. There are a few cross-section conflicts, and some traces don't match their goals.
- **Style:** mostly precise. One blocker: the completion ratio had two definitions. Many majors are naming issues.

Each blocker was checked before it was fixed. The design blocker's claim that assessment events were once silent no-ops is confirmed by the header comment of `lib/analytics.ts`.

## Blockers

| # | Source | Finding | Disposition |
|---|---|---|---|
| D1 | design | The pass mark can't be read: baseline completions are about 0–2, so "double" is noise; there's no completion floor; and the "1 in 114" may be a measurement fault, because events were no-ops before July 2026 | **Fixed:** Measurement now needs ≥50 starts and ≥10 completions over 14 days, extends to 28 days, and falls back to an absolute target (≥30% completion with ≥15 completions). A concurrent split is recorded in Alternatives (rejected for the pilot). Intent's Problem and Success criterion are updated |
| S1 | style | The completion ratio had two definitions: one excluded retakes, the formula included them | **Fixed:** `assessment_complete` fires once per page load; later results fire the new `assessment_rerun`; ratio = `assessment_complete` ÷ `assessment_start`; the old scan's retake counting makes the baseline conservative |

## Majors and nits

| # | Source | Finding (short) | Disposition |
|---|---|---|---|
| D2 | design | Back from the result and forward again re-fired `assessment_complete` | **Fixed** (S1) |
| D3 | design | Plain-text phishing through forged client text, emailed from the site's domain | **Recorded:** K10 open, OQ9 (recompute on the server, cap lengths, reject links). It changes the endpoint, outside this pilot |
| D4 | design | 200 means saved, not sent; the email failure is swallowed | **Fixed:** contract corrected; event renamed `report_saved`; success copy "on its way" |
| D5 | design | Retries aren't idempotent; no client timeout | **Fixed in part:** 15 s timeout per attempt (AC43). Duplicates recorded as K11 accepted, OQ10 |
| D6 | design | The "7 days" promise is false if the person never returns; future `at` never expires | **Fixed:** promise reworded to when clearing happens; a future `at` is rewritten to now |
| D7 | design | `?pre=` in page-view URLs; derived values sent; "Nothing is sent" untrue | **Fixed in part:** G5 and copy made accurate; derived values listed. URL stripping recorded as K12, OQ11 (site-wide) |
| D8 | design | Prefill vs saved progress undefined | **Fixed:** new AC42 |
| D9 | design | A wrong email leaks the report | **Fixed in part:** the "We'll email it to <email>" line (AC27); superseded records recorded as K13, OQ12 |
| D10–D13 | design | Answers size check, captive portals, multiple tabs, the scoring pause | D11 **fixed** (`network` reason); D10 folded into OQ9; D12 accepted (last write wins); D13 added to OQ1 |
| T1 | structural | Heading copy sat in AC30's "given" | **Fixed:** heading rule moved to plan T15; AC30's "given" simplified |
| T2 | structural | Behavior placed the legal line after the map | **Fixed:** Behavior reordered |
| T3 | structural | No AC for a pack without scan metadata | **Fixed:** new AC44 |
| T4 | structural | 400 handling missing from AC28 | **Fixed:** a send policy table drives AC28 |
| T5 | structural | Traces that don't match the goals | **Fixed:** new G7 (consent and send safety) for AC31 and AC32; G5 widened for AC16. AC38 stays on G1 (the switch exists to measure G1 safely) |
| T6 | structural | Retake ratio conflict | **Fixed** (S1) |
| T7–T16 | structural | AC order, AC12/AC41 overlap, extra content in given/then, K6 wording, status vocabulary, motion-off wording, empty states, hard-coded "10", Out of scope NG3, blank lines | **Fixed:** AC39 placed after AC38; Retake moved out of AC12; status vocabulary defined (planned, open, accepted); "still mode" defined; storage-throws-on-read added to AC15; checklist default title; NG3 listed |
| S2–S40 | style | N overloaded; AC4 trigger; "ignored"; retry wording; switch naming; red flags vs areas; Moderate status vs band; band-text names; AC24 language; AC3 rounding; M for under a minute; "Question the quick start"; first vs quick-start question; AC17 wording; "about" timings; Forward button; the 50 boundary; contact field names; AC32 field names; no-meta fallback; AC25 wording; unit and term consistency | **Fixed:** Terms define N, A, S, F, still mode, band explanation and ranked fixes; settings renamed "Release settings"; red-flag headings no longer say "areas"; timings in ms with ±50 ms; all listed rewrites applied |
