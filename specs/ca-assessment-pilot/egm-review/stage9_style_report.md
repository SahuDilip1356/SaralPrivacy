# Stage 9: Implementation Readiness — style reviewer, plan.md

Reviewer: egm-style (fresh context). Date: 2026-11-03. Target: plan.md lines 1–404, with spec.md as context.

**Reviewer verdict.** The task structure and verify commands are mostly concrete. However:
- the plan assumes every agent has spec.md open;
- the names that join tasks are never pinned down: message keys, analytics helper names, the `canAnimate`/`ok` value, `#rhead`, component props, and what "risk map" means.

Tasks run in parallel will produce pieces that don't fit together.

| # | Sev | Location | Finding (short) | Disposition |
|---|---|---|---|---|
| 1 | 🔴 | T2, T3, T4, T6, T7, T14, T19, T20 | Notes depend on spec.md or intent.md, but agents only get the task block | **Fixed:** Setup rule says every agent gets spec.md; intent IDs (A2, A4, NG2, Q6) are inlined |
| 2 | 🔴 | T5, T7, T11–T15 | Message keys aren't named; T5 and T7 run in parallel and will invent different keys | **Fixed:** T7 has a key table; T5 and the component tasks reference it |
| 3 | 🟡 | T1 vs T10, T13, T17 | `canAnimate` is a function in T1 but used as a boolean later | **Fixed:** `useMotionOk()` returns `{ ok, markKeyboard }`; later tasks use `ok` |
| 4 | 🟡 | Decisions vs T16 | `VERCEL_ENV` vs `NEXT_PUBLIC_VERCEL_ENV` | **Fixed** |
| 5 | 🟡 | Decisions vs T16 | "Byte-identical" contradicts the 12-line edit; the early return breaks the hooks rules | **Fixed:** the switch moves to `page.tsx`, so `CAAssessmentClient.tsx` is untouched |
| 6 | 🟡 | T13 vs T17 | `#rhead` is never given to the heading | **Fixed** |
| 7 | 🟡 | T14 vs T17 | "Risk map" means two different things | **Fixed:** T17's order names RiskMap's contents |
| 8 | 🟡 | T9–T15 | No props or callbacks | **Fixed:** a `props:` line added to each component task |
| 9 | 🟡 | T6 | Helper names unspecified | **Fixed:** helpers listed by name |
| 10 | 🟡 | T16 | The `assessment_start` timing contradicts itself | **Fixed:** follows spec Metric continuity (once on first render) |
| 11 | 🟡 | T4, T2 | Whether q0 counts toward "N of 10" is unstated | **Fixed** |
| 12 | 🟡 | T3 | Return shapes and the boundary outcome are elided | **Fixed** |
| 13 | 🟡 | T2 | Signatures, the never-rises rule and the lock timing are elided | **Fixed** |
| 14 | 🟡 | T8 vs AC32 | Field list incomplete | **Fixed** |
| 15 | 🟡 | T9–T14 | Example names are unexplained | **Fixed:** a Setup line explains the Subframe names and where the source lives |
| 16 | 🟡 | T12 | The pause token and owner are missing; "faces" is undefined | **Fixed** (`DUR.scoringPause`) |
| 17 | 🟡 | T15 | "Reuse" invites an import from the old client | **Fixed:** copy the logic into `lib/assessment/send-report.ts` |
| 18 | 🟡 | T10 vs AC5 | The "or optional" case is missing | **Fixed** |
| 19 | 🟡 | T14 | The summary bars aren't named | **Fixed:** `dataExposure` and `controlMaturity` |
| 20 | 🟡 | T7, T13 | The PR #92 dependency isn't in the task blocks | **Fixed** |
| 21 | 🟡 | Setup, T20 | Path bases are mixed | **Fixed:** path rule stated |
| 22–34 | 🟢 | various | Unused shorthands, a missing baseline file, npx, AC37 missing from T19, the Q/q ID clash, consent key, email expectations, delay vs duration, truncated string, a human step inside T6, the T18 grep text, new/existing file markers, vague wording | **Fixed**, except 22, where the shorthands were removed |
