# Stage 6: Comprehension Test — spec.md

Reviewer: egm-comprehension (fresh context). Date: 2026-11-03. Standard: re-implementation-standard.md. Target: spec.md (after the Stage 5 fixes), with intent.md as context.

**Reviewer verdict.** The spec failed the re-implementation test. A new engineer couldn't build it from the spec alone:
- the question-pack data model, the request's result schema and the quick-start/required question model were undefined;
- the time-left rule and the free-fix fallback contradicted themselves.

Every blocker was checked against `core.ts`, `bands.ts`, `packs/ca-firms.ts` and `CAAssessmentClient.tsx` before it was fixed.

| # | Sev | Location | Finding (short) | Disposition |
|---|---|---|---|---|
| 1 | 🔴 | System context, AC1, AC21–AC23 | Question pack undefined (sections, areas, fixes, fallback) | **Fixed:** "Terms", "Question pack contract" and "Scan metadata" sections; the pack stays unchanged (isolation rule) |
| 2 | 🔴 | AC1–AC5, analytics | "Start mark" undefined, N unclear, percentage formula missing, step index ambiguous | **Fixed:** quick-start, required and N defined; percentage formula; step events mapped to labels |
| 3 | 🔴 | AC3 | Formula contradicts "never rises on Back"; precedence unstated | **Fixed:** R counts unanswered required questions anywhere; numbered precedence |
| 4 | 🔴 | AC21 vs AC22 | Fallback conflict for High band with no area ≥34; score direction undefined | **Fixed:** one decision table in Contracts, matching `recommend()` exactly; directions defined in Terms |
| 5 | 🔴 | Contracts | Report result fields untyped and unsourced | **Fixed:** scoring-output table and field-source table; `hp_url` defined |
| 6 | 🟡 | AC28, Contracts | 400, network errors and the retry policy undefined | **Fixed:** retry policy stated; 400 is treated as a server failure |
| 7 | 🟡 | AC11, AC14 | Field-by-field validation and K undefined | **Fixed:** AC14 rewritten field by field; K defined |
| 8 | 🟡 | AC6, AC10, AC16 | Saving after the result conflicts with Back | **Fixed:** saving stops once the result shows, until Retake |
| 9 | 🟡 | Analytics | No firing moments; property meanings undefined | **Fixed:** "When it fires" column and property meanings |
| 10 | 🟡 | AC12 | Retake skews the ratio | **Fixed:** new AC41; continuity note on retakes |
| 11 | 🟡 | AC17, AC18 | Pause and done timings missing; slow state untestable | **Fixed:** timings in the AC; test-only delay |
| 12 | 🟡 | Release switch | No env names, defaults or environment check | **Fixed:** `NEXT_PUBLIC_CA_SCAN_V2` and `NEXT_PUBLIC_SCAN_MOTION`, with an allow-list |
| 13 | 🟡 | Measurement | Sector fallback conflicts with CA-hard-coded text | **Fixed:** title, checklist and report type come from the pack; generic risk-map heading |
| 14 | 🟡 | AC25, AC26 | Email regex, trimming, phone parse order and focus order unstated | **Fixed** |
| 15 | 🟡 | AC30 | Zero remaining fixes, resubmit, heading copy | **Fixed** |
| 16 | 🟡 | AC24, OQ6 | Language mechanism undefined | **Fixed:** URL prefix, message files, per-key English fallback |
| 17 | 🟡 | AC19, Behavior | Result timings missing; summary bars have no AC | **Fixed:** timings in AC19; new AC40 |
| 18 | 🟡 | AC4, AC9 | Keyboard detection, direction, and the stamp on Enter | **Fixed** |
| 19–24 | 🟢 | various | Visual source, chat-launcher rule, unexplained references, page-weight baseline, conflict with the motion spec, resume note | **Fixed:** visual source of record named; launcher hidden; links added; comparison builds defined; override stated; note included |
