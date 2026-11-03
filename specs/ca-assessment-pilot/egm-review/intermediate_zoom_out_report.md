# Stage 8: Intermediate Zoom Out — spec.md

Reviewer: egm-zoom-out (fresh context). Date: 2026-11-03. Standard: zoom-out-standard.md. Target: spec.md after the Stage 5–7 fixes, with intent.md, plan.md and the earlier reports as context.

The reviewer checked two things in code: `page.tsx` is static today, and the header of `lib/analytics.ts` confirms that events were silent no-ops before July 2026.

**Reviewer verdict.** The fixes made each part precise, but they added complexity without making the pilot better able to answer its question. The measurement ladder contradicted itself and, at the cited traffic, would most likely end in a sector switch that couldn't be carried out.

Fix the measurement rule and the result-page data loss, then use the simpler rule to remove AC44, the no-metadata test hook and the OQ9 launch gate.

| # | Sev | Finding (short) | Disposition |
|---|---|---|---|
| 1 | 🔴 | The measurement fallbacks contradict each other, and "run the pilot on another sector" can't be done: the switch, wiring and metadata exist only for CA, and it contradicts NG1 | **Fixed:** one CA-only "Measurement" section in spec Contracts (28-day baseline before switch-on, 28-day after-window extending to 56, an outcome table with pass, fail and inconclusive, and next steps); the sector switch removed; AC44 and `scanTestNoMeta` removed; intent and plan refer to it |
| 2 | 🟡 | The three documents defined the windows differently | **Fixed:** single source; intent A1, A2 and the Success criterion, and plan Rollout step 2, point to it |
| 3 | 🟡 | Lead rate inflated by retries, resubmits and post-retake submits | **Fixed:** `report_requested` gets `first: boolean`; the lead rate counts page loads with a first request |
| 4 | 🟡 | G3 vs AC10/AC16: a reload on the result page lost everything | **Fixed:** saved answers are kept through the result until the first `report_saved`, Start again, Retake or expiry; the resume card offers "See your result again"; K2 and Retention updated |
| 5 | 🟡 | The 15 s timeout causes the duplicates K11 accepts | **Fixed:** no automatic retry after a timeout or network error; retry only on 429 and 5xx |
| 6 | 🟡 | Awaiting `searchParams` made today's page dynamic for everyone | **Fixed:** production decides from env alone and stays prerendered; T22 asserts it from the prerender manifest |
| 7 | 🟡 | The OQ9 gate didn't match the sign-off, and is a site-wide issue | **Fixed:** OQ9 reworded as a separate site-wide change, not a pilot gate |
| 8 | 🟢 | Three test-only URL parameters in production code | **Fixed:** one `testOverrides()` under the switch allow-list; `scanTestNoMeta` removed |
| 9 | 🟢 | Page weight "same size" vs 1 KB | **Fixed:** the spec allows 1 KB |
| 10 | 🟢 | Out of scope hid the shared changes | **Fixed:** T6, T8 and T19's shared changes listed |
| 11 | 🟢 | The "1 in 114" premise vs the July date | **Fixed:** source recorded as unknown; not used as a baseline |
| 12 | 🟢 | A5 fallback disagreed with the spec | **Fixed:** the intent now uses the spec's property-order rule |
| 13 | 🟢 | Two numbering schemes (`n` vs step labels) | **Fixed:** `n` dropped from `assessment_question_view` |
