# Stage 5: Initial Zoom Out — spec.md

Reviewer: egm-zoom-out (fresh context). Date: 2026-11-03. Standard: zoom-out-standard.md. Target: spec.md lines 1–466, with intent.md and plan.md as context.

Reuse claims the reviewer verified in code:
- the endpoint shape, the 429 response with Retry-After, and the 400 and 500 bodies;
- `escapeHtml` (name and business are already escaped; band, summary, red flags and fixes aren't);
- the `assessment_start` helper with `prefilled`/`src`;
- the retry loop in today's client.

| # | Sev | Location | Finding | Suggested fix | Disposition |
|---|---|---|---|---|---|
| 1 | 🔴 | Release switch, Alternatives, K9, AC38 | One switch can't do what intent A1's fallback promises: keep the non-motion fixes and turn motion off. Turning the switch off drops all of them. | A second setting turns motion off and makes the new scan behave exactly as under reduced motion; add an AC | **Fixed:** "motion setting" in Contracts, new AC39, T1 and T16 updated |
| 2 | 🟡 | K7, Non-functional | About 114 reaches in 3 months across all sectors means CA alone may never reach 50 starts in 2 weeks, so the success criterion may be unreadable | Make the traffic check a gate before most of the build; state the decision rule now | **Fixed:** the decision rule is in Non-functional, and Rollout step 2 gates the build on it |
| 3 | 🟡 | Analytics contract | The before and after windows count differently: `report_requested` changes moment, resumed starts inflate starts, `industry` vs `sector`, and the fate of `assessment_step_N` is unclear | Add a metric-continuity rule | **Fixed:** "Metric continuity" added to Contracts, and T15 and T16 notes updated |
| 4 | 🟡 | Page weight | framer-motion isn't on the CA page today; AnimatePresence and springs exceed 15 KB; a URL-param switch stops tree-shaking | Use CSS for the simple moments, LazyMotion for the rest, and dynamic-import v2 | **Fixed in plan:** a Decisions entry, plus T16 notes |
| 5 | 🟡 | Several ACs | Animation timings ("one frame", "60 fps") sit in behavioural ACs and can't be checked end to end | State user-visible guarantees and leave durations to the tokens | Accepted, partly: the AC timings stay because T19 can measure them at 50 ms tolerance; "60 fps" has moved out of the testable list. See spec Open questions Q7 |
| 6 | 🟡 | AC6, AC33, AC18, AC9 | Resilience and decoration go beyond the stated losses | Trim or defer | Not changed: these are Dilip's scope calls. Recorded as Q8 |
| 7 | 🟡 | Contracts, plan naming | CA-named components invite a 13th copy at rollout | Make the scan pack-driven and the names neutral | **Fixed:** a System context line; plan components renamed `ScanV2` and `ScanResultV2` |
| 8 | 🟢 | Open questions | D1–D6 aren't defined in the chain, and Q2 has no fallback | Link the definitions and state the fallback | **Fixed** |
| 9 | 🟢 | AC24 vs G6 | The legal line names no section | Say that section wording lives in the pack (PR #92) | **Fixed** (note on AC24) |
| 10 | 🟢 | Analytics | The Vercel custom-property cap may be low | Rank properties per event | **Fixed:** property order rule in Contracts |

Reviewer verdict, in brief: the objective is clear and reuse is sound, but the single switch, the analytics continuity and the unproven traffic need fixing before planning.
