# EGM review of the CA pilot chain — consolidated

Date: 2026-11-03. Run from Claude Code, following the spec-chain skill's step 5b and the EGM `egm_review` skill in uninterrupted mode. Every reviewer was a fresh-context Goldfish subagent.

| Pass | Stage | Reviewers | Report | 🔴 | 🟡 | 🟢 |
|---|---|---|---|---|---|---|
| 1 (spec.md) | 5 Initial zoom out | egm-zoom-out | zoom_out_report.md | 1 | 6 | 3 |
| 1 | 6 Comprehension | egm-comprehension | comprehension_report.md | 5 | 13 | 6 |
| 1 | 7 Critic | egm-design, egm-structural, egm-style | critic_report.md | 2 | 39 | 31 |
| 1 | 8 Intermediate zoom out | egm-zoom-out | intermediate_zoom_out_report.md | 1 | 6 | 6 |
| 2 (plan.md) | 9 Implementation readiness | egm-implementation-readiness, egm-codebase-details, egm-style | implementation_readiness_report.md, stage9_style_report.md | 4 (2 duplicated across reviewers) | 34 | 27 |

All 🔴 blockers were checked against the code or the documents before acting, and all are fixed. Majors were fixed, or recorded as open questions or accepted risks with a reason, as each report's Disposition column shows.

**Accepted or open after review**
- **Accepted:** K11 (duplicate sends only via the person's own retry).
- **Open, site-wide (not pilot gates):** OQ9 (server-side safety of the report endpoint), OQ10 (request ID), OQ11 (strip `?pre=` from page views), OQ12 (superseded records).
- **Dilip's scope calls:** OQ1–OQ8, including OQ7 (timings in ACs) and OQ8 (AC6, AC9, AC18 and AC33 scope).

**Main changes the review drove**
1. Motion has its own setting, separate from the scan switch.
2. One CA-only measurement rule with an inconclusive outcome. The analytics events count the same way before and after.
3. The question pack and engine stay byte-identical. CA scan data lives beside the scan, guarded by a drift test.
4. The switch lives in the server page, which stays static in production. Today's client is untouched.
5. Saved answers survive the result page until the report is saved.
6. Sends retry only when the server clearly didn't save.
7. The plan gained Shared names (message keys, helpers, props), verify helper scripts and copied design sources. Two oversized tasks were split, for 23 tasks in total.

The validator passes after the final fixes.
