# Stage 9: Implementation Readiness — plan.md

Reviewers (fresh context, run in parallel): egm-implementation-readiness, egm-codebase-details, egm-style (detail in `stage9_style_report.md`). Date: 2026-11-03. Standard: implementation-readiness-standard.md. Target: plan.md, with spec.md as context and the app code read-only.

**Combined verdict.** Not ready as written. Two tasks fail for reasons the plan didn't foresee:
- **T4's test can't load the pack.** Under `--experimental-strip-types`, Node keeps imports of types as runtime imports, and the pack and core import their types that way. The repo already says so in `lib/data/hero-verdicts.test.ts`.
- **T16's early return breaks either way.** Before the hooks it breaks the hooks lint rule. After them, the old client still fires `assessment_start` next to the new one, double-counting the success metric's denominator.

Beyond those, message keys, helper names and props were left to each implementer.

The plan was rewritten after this review. Both blockers were confirmed in code before the fix.

| # | Sev | Source | Finding (short) | Disposition |
|---|---|---|---|---|
| R1 / C1 | 🔴 | readiness + codebase | T4 can't import the pack under strip-types | **Fixed:** ranking moves to the pure `lib/assessment/ranked-fixes.ts`; CA data to `lib/assessment/meta/ca-firms.ts`; a drift guard reads the pack source; pure-module rules in Architecture |
| R2 / C2 | 🔴 | readiness + codebase | T16 early return: hooks lint or a double `assessment_start` | **Fixed:** the switch moves to the server `page.tsx`, with a dynamic import; verify requires an empty diff on `CAAssessmentClient.tsx` |
| C3 | 🟡 | codebase | Editing `core.ts` breaks the documented isolation rule | **Fixed:** no edits to core, bands or packs; rule stated in Architecture |
| R4 / C4 | 🟡 | both | Preview override fails open; two env names | **Fixed:** allow-list copied from `lib/i18n/switcher-gate.ts`; pure `isScanV2Enabled` with tests |
| R3 / C6 | 🟡 | both | Baseline can't be split by sector; `assessmentComplete` lacks sector | **Fixed:** sector derived from the path when the caller omits it; sector added to complete |
| R5, R6, R7 | 🟡 | readiness | No message keys; English in lib; open signatures and props | **Fixed:** "Shared names" (key table, helpers, hook, props); lib returns keys |
| R8 | 🟡 | readiness | Missing dependencies (T10→T7, T14→T6) | **Fixed** |
| R9, C10 | 🟡 | both | E2E: lockfile, browser install, env, CI rationale | **Fixed:** T20 test-setup task |
| R10 | 🟡 | readiness | Analytics capture can't see events locally | **Fixed:** `window.va` stub plus an empty insights script |
| R11 | 🟡 | readiness | Many ACs unchecked by tests | **Fixed:** T21 names a test per AC; the switch-off project covers AC38 |
| R12 | 🟡 | readiness | T16 and T19 oversized | **Fixed:** split into T16, T17, T18 and T20, T21, T22 |
| R13 | 🟡 | readiness | Fragile tsc baseline; diff against a moving main | **Fixed:** `bin/tsc-ok.sh` with the baseline in the git dir; diff against the merge base; rebase step after PR #92 |
| R14 | 🟡 | readiness | No tsc on T4 and T8 | **Fixed:** every logic task runs `tsc-ok.sh` |
| R15 / C5 | 🟡 | both | T8 misses score and the admin badge; band assertion; line refs | **Fixed:** exact lines; `Number()` for score; `badge()` label; case-insensitive assertion |
| R16 | 🟡 | readiness | 15 KB budget unchecked | **Fixed:** `scripts/measure-scan-weight.mjs` in T22 |
| R17, C11 | 🟡 | both | Design sources outside the worktree | **Fixed:** copied into `reference/`; tokens inlined in T1 |
| C7 | 🟡 | codebase | Retry loop isn't reusable | **Fixed:** extracted `submit-report.ts` with injected fetch/sleep and tests |
| C8 | 🟡 | codebase | Old quiz logic not carried over (pick, micro-notes, bucket focus, prefill note, services, back href, skip) | **Fixed:** listed in T2, T4 and T16 |
| C9 | 🟡 | codebase | Pure-module loading rules unwritten | **Fixed:** Architecture rules |
| C10b | 🟡 | codebase | Chat hide matches the hub too | **Fixed:** `/assessment/` with the trailing slash |
| C12 | 🟡 | codebase | `scripts/design-lint.sh` never run | **Fixed:** added to every component verify |
| Nits | 🟢 | both | probe spec, more T5 cases, T7 parity, T18 scope note, signoff path, T19 dependency, useMotionOk lint, existing EMAIL_RE, useInView, framer `useReducedMotion`, hi.json fallback, reuse of `assessment.shared` keys, fallback constant and copy-before-sort, Node version, effect-setState rule, server-built answer rows | **Fixed** |

**One cross-check outside the plan.** PR #92 edits pack text, which the isolation rule otherwise forbids. On PR #92's branch, `lib/data/hero-verdicts.test.ts` (the pack-source drift guard) passes 11/11. `lib/data-flow/data-flow.test.ts` fails on both branches only because `zod` isn't installed in these worktrees. Dilip should knowingly accept the legal edit as an exception to the rule.
