# Goldfish Review Report — Pass 2: Implementation plan

**Target:** `specs/seo-checklist-assessment/plan.md` (lines 1–114, whole file treated as the Implementation Plan), with `spec.md` as context
**Date:** 2026-10-27
**Reviewers:** egm-implementation-readiness, egm-codebase-details, egm-structural (one instance each)
**Code checked:** `webapp/` in the `seo-checklist-assessment` worktree

**Totals:** 🔴 2 Blocker · 🟠 10 Major · 🟡 18 Minor

**Verdict: NOT READY.** Task order (T1 → T2/T3/T4, T5 → T6/T7, then T8) is sound. Two problems block it:
- AC9 has no build task.
- The checklist check passes on today's build.

Several verify commands can also give false results.

Already known, so not raised again: no test runner in package.json, Playwright not a dependency, all 12 industry pages import DataFlowPreview, `isOptional`, the `faqPageSchema` export, and Radix Content unmounting closed items.

**Confirmed against code:**
- `ChecklistContent.tsx:202` classes, `defaultValue` at 521/559, filter state at 380.
- `forceMount` + `data-[state=closed]:hidden` works under Tailwind v4.
- `sitemap.ts` has `BASE` (line 9), `LEARN_UPDATED` (line 16) and the static learn block (132–134).
- `InBodyToolLink.tsx` and the Act page `<InBodyToolLink className="mt-6" />` at line 276.
- DataFlowPreview is a server component with `{ pack, href }`.
- 12 SECTORS.
- `localePrefix: "as-needed"`.
- The assessment `page.tsx` has no params today.
- SurveyClient anchors: `landing.badge` (711), trust row (719–736), `trackEvent`, `gate.skipBasic` (1294).
- All six consent keys exist (en.json:581–588).
- `faqPageSchema(faqs, { url?, inLanguage?, dateModified? })`.
- `scripts/nav-acceptance.mjs` and `scripts/ts-resolve.mjs` exist.
- The env path resolves to `.../webapp/webapp/.env.local`, which exists.
- ICU `{count}` is already used in the catalog.
- The `xargs test BASE -ge` tsc gate is logically correct.

---

## 🔴 Blockers

### B1 — No task builds AC9; T4's verify cannot pass
- **Lenses:** implementation-readiness, codebase-details, structural
- **Lines:** 19, 29, 72–73, 76
  - L19: "└─► components/industries/DataFlowPreview.tsx  (rendered by all 12 industry pages)"
  - L73: "- files: components/ChecklistCrossLink.tsx, app/[locale]/learn/dpdp-act-2023/page.tsx, app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx"
  - L76: "... node scripts/seo-acceptance.mjs --only links"
- **Problem:**
  - Only T1 (checks) and T8 (preview) list AC9. No task edits `DataFlowPreview.tsx`.
  - T1 (L50) says the script fetches the 12 `/industries/<slug>` pages, so T4's `--only links` fails. If they are excluded from `links`, AC9 goes unchecked until T8.
  - Most of DataFlowPreview is a `bg-navy-700` panel (line 40), where the green-700 link recipe fails contrast.
  - `scripts/design-lint.baseline.d/muted-text-on-light` already lists the component.
- **Fix:**
  - Add `components/industries/DataFlowPreview.tsx` and AC9 to T4, or create a new task T4b.
  - Give the insertion point: after the navy panel's closing `</div>` (line 72), inside the `<section>`: `<ChecklistCrossLink className="mt-4" />`.
  - Define the URL set for each `--only` group in T1.

### B2 — `countChecklistControls` passes on today's HTML and on substring collisions
- **Lenses:** design (Pass 1 F1, applied here), implementation-readiness, codebase-details
- **Line:** 50
  - "Export `countChecklistControls(html, ids)`, … Control ids come from lib/data/compliance-checklist.ts (90 ids: "1.1"…, "O1.1"…)."
- **Problem:**
  - `ChecklistContent` is `"use client"`, and `page.tsx:75` passes it all controls as props. Every id and requirement is already in the `self.__next_f.push` flight scripts, so a search over the whole response passes before T2.
  - Substring matching is also unsafe: "1.1" is inside "O1.1", "11.1" and "1.10".
  - The requirement text goes through `linkifyText` (`ChecklistContent.tsx:114`) and React entity escaping, so a raw contiguous match may never occur.
  - `countChecklistControls` checks ids only, but AC1 and AC4 also need the requirement text.
- **Fix:**
  - Strip `<script>` and `sr-only` blocks first.
  - Match each id as the exact rendered span (`>${escapeRe(id)}</span>` on the `font-mono` span, `ChecklistContent.tsx:88–90`), or add a `data-control-id` attribute.
  - Compare requirement text after stripping tags, decoding entities and normalising whitespace.
  - Add fixtures: one of today's production HTML (must fail), and one with only "O1.1" (must not count "1.1").

---

## 🟠 Major

### M1 — The verify commands never stop the server, so a later task can test a stale build
- **Lenses:** implementation-readiness, codebase-details, structural
- **Lines:** 39, 58, 67, 76, 103
  - L39: "Stop the server after each task (`lsof -ti:3100 | xargs kill`) so the next task's verify serves its own build."
  - L58: "npm run build && (npm run start -- -p 3100 & sleep 8) && BASE=http://localhost:3100 node scripts/seo-acceptance.mjs --only checklist"
- **Problem:**
  - The kill appears only in prose. If an earlier server still holds port 3100, the new `next start` fails with EADDRINUSE in the background, silently.
  - `next build` also rewrites `.next` under the running server.
  - The checks then run against the old or half-replaced build.
  - Setup (L39) and the tasks use different launch forms.
- **Fix:** use one form in every verify: `lsof -ti:3100 | xargs kill 2>/dev/null; npm run build && { npm run start -- -p 3100 & PID=$!; until curl -sf localhost:3100 >/dev/null; do sleep 1; done; BASE=… node … --only X; RC=$?; kill $PID; exit $RC; }`.

### M2 — The runner script imports .ts but is invoked with plain `node`
- **Lenses:** implementation-readiness, codebase-details
- **Lines:** 50, 58, 67, 76, 103, 112
  - L50: "Control ids come from lib/data/compliance-checklist.ts … (slugs from lib/data/sectors.ts)"
  - L112: "verify: BASE="$PREVIEW_URL" node scripts/seo-acceptance.mjs"
- **Problem:**
  - Plain `node` loads .ts only on Node ≥ 22.18/23.6, and then only with explicit `.ts` extensions. No engines field or .nvmrc pins a version (CI uses Node 24).
  - `scripts/ts-resolve-hooks.mjs:8` resolves relative specifiers only, not `@/`. So T5's `assessment-offer.ts` fails its own verify if it imports `@/lib/...`.
  - `lib/data/dpdpa-assessment.ts`, where `QUESTIONS` lives, is never named.
- **Fix:**
  - Invoke as `node --import ./scripts/ts-resolve.mjs --experimental-strip-types scripts/seo-acceptance.mjs …` everywhere, or state a minimum Node version.
  - Require relative imports in `acceptance.ts` and `assessment-offer.ts`, e.g. `import { QUESTIONS } from "./dpdpa-assessment"`.

### M3 — `hasChecklistLink` passes on the Rules guide today
- **Lenses:** codebase-details
- **Lines:** 50, 77
  - L50: "`hasChecklistLink(html)` (anchor href="/compliance-checklist" with text matching /compliance checklist/i)"
- **Problem:** the Rules guide sidebar already renders `<a href="/compliance-checklist">Compliance Checklist (90 Controls)</a>` on the server (`dpdp-rules-2025-plain-english-guide/page.tsx:205–217`, `lib/learnNav.ts:18`). T4's verify therefore proves nothing for AC8.
- **Fix:**
  - Give ChecklistCrossLink a marker (`<aside data-crosslink="compliance-checklist">`) and match only inside it.
  - Assert exactly one per page.
  - Add a fixture where a sidebar-only link fails.

### M4 — Assessment URLs use the wrong slug field
- **Lenses:** implementation-readiness, codebase-details
- **Line:** 50
  - "the 12 /industries/<slug> pages (slugs from lib/data/sectors.ts), /assessment, /hi/assessment and the 12 /assessment/<slug> pages"
- **Problem:** `slug: "recruitment-agencies"` has `assessmentSlug: "recruitment"` (`sectors.ts:36`), and the route is `app/[locale]/assessment/recruitment/`. A 404 makes AC14's "no FAQPage" check pass falsely.
- **Fix:**
  - Use `/industries/${s.slug}` and `/assessment/${s.assessmentSlug}`. `sectorSlugs` and `sectorAssessmentLinks` are already exported.
  - Treat any non-200 response as a failure.

### M5 — The visible FAQ markup is undecided, but T1 must parse it first
- **Lenses:** implementation-readiness, codebase-details, structural
- **Lines:** 50, 104
  - L104: "plain `<h2>` + `<dl>` or `<details>` items, matching the site's existing FAQ styling in app/[locale]/faq"
- **Problem:**
  - `app/[locale]/faq/page.tsx:71–76` uses neither `<dl>` nor `<details>`. It uses cards: a `div` with `rounded-xl p-5`, then `h2` and `p`.
  - `faqMatchesVisible` is written in T1, before T7 picks the markup.
  - React escapes `'` and `&`, while JSON-LD keeps them raw.
- **Fix:**
  - Fix the markup in the plan, e.g. `<section data-faq="assessment">` with the faq/page.tsx card pattern, `<h3 data-faq-q>` and `<p data-faq-a>`.
  - Specify that `faqMatchesVisible` reads those attributes, decodes entities, normalises whitespace and compares in order.

### M6 — Public-claim copy (tier1) is left to the implementer
- **Lenses:** implementation-readiness, codebase-details, structural
- **Lines:** 77, 86, 95
  - L86: "5 questions: Is it free? How long does it take? Do I need to give my email? What do I get? Is this legal advice?"
  - L95: "e.g. "Free · {count} core questions · no account, and no email needed to see your score · instant 0–100 score""
  - L77: "Suggested line: …"
- **Problem:**
  - The plan gives no answer text in either locale, no final `offerLine`, and no Hindi for `offerLine` or `industryLink`.
  - The duration is already inconsistent: the metadata says "3 Minutes" (`assessment/page.tsx:8`); the trust row and sr-only copy say "3–5 minutes".
  - L77 also hard-codes "90 controls".
- **Fix:**
  - Write the exact en strings for the 5 Q&As, `offerLine`, `industryLink` and the cross-link line. Mark hi as a draft pending O1.
  - Pin "How long" to `trust.takesMinutes` and the legal-advice answer to the existing disclaimer.
  - Derive the control count from the data, not "90".

### M7 — The offer line under the H1 likely falls below the fold on a 390×844 phone
- **Lenses:** codebase-details
- **Line:** 95
  - "Only the step-0 left column … changes. Add one offer line under the H1"
- **Problem:**
  - `DiscoveryCrossLink` and `NoticeCrossLink` stack above SurveyClient (`assessment/page.tsx:47–50`), about 250 px each on mobile.
  - After them come `py-12`, the badge and a `text-4xl` H1, which put the line at about 850–900 px.
  - The plan forbids touching anything else, so AC11 could fail with no permitted fix.
- **Fix:** decide now. Options:
  - put the offer line under the badge, above the H1;
  - allow moving or shrinking the banners on mobile in `assessment/page.tsx`;
  - state a measured pixel budget.

### M8 — The FAQ after `<SurveyClient />` shows under every assessment step
- **Lenses:** codebase-details
- **Line:** 104
  - "Render a visible FAQ section after `<SurveyClient />`"
- **Problem:** the step is client state inside SurveyClient (`SurveyClient.tsx:703, 847, 1168`). A sibling FAQ appears below the wizard, the gate and the report, which conflicts with AC16 ("every assessment step … unchanged").
- **Fix:** record the decision: either accept the FAQ below all steps and narrow AC16 to cover the step components only, or render it only at step 0 while keeping it in the server HTML.

### M9 — The T1 checks do not cover everything their ACs require
- **Lenses:** structural, implementation-readiness, codebase-details
- **Line:** 50
  - "Export `countChecklistControls(html, ids)`, `sitemapHasOnce(xml, url)`, `hasChecklistLink(html)` … `faqBlocks(html)` … and `faqMatchesVisible(html)`"
- **Problem:**
  - AC5 needs `<lastmod>`, but `sitemapHasOnce` checks only the url.
  - AC17 needs `inLanguage: hi-IN`, and nothing checks it.
  - AC10 covers Hindi, but the fetch list has no `/hi/learn/...` or `/hi/industries/...` pages.
- **Fix:**
  - Make `sitemapHasOnce` also assert `<lastmod>`.
  - Add an `inLanguage` check for each locale.
  - Add the `/hi` variants of the 2 learn pages and the 12 industry pages to the `links` group.

### M10 — T8's preview verify will likely get a 401
- **Lenses:** implementation-readiness, codebase-details
- **Line:** 112
  - "verify: BASE="$PREVIEW_URL" node scripts/seo-acceptance.mjs"
- **Problem:** Vercel Deployment Protection usually blocks preview fetches. The command also needs the TS-loading flags from M2.
- **Fix:** state whether protection is off for this project, or have the script send `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` when that variable is set.

---

## 🟡 Minor

1. **The hiding method is described three ways** (L28: "Radix `forceMount` plus `hidden` on closed content"; L59: "`data-[state=closed]:hidden` (Tailwind)").
   - Under `forceMount`, Radix never sets the `hidden` attribute (`react-collapsible` index.mjs:82–136), so hiding rests on the CSS class alone.
   - The animation concern is moot: the `accordion-up` / `accordion-down` keyframes are defined nowhere in the repo.
   - Fix: write one method in both places, and state which form the T1 check accepts.
   - Note: the readiness reviewer's claim that "Radix already sets `hidden` on force-mounted content" was contradicted by the source and is not adopted.
   - *(structural, codebase-details, readiness; reconciled)*
2. **Tasks have no `status` field** (L113: "Tick each task's `status: done` here as it lands."). Also, L109 names plan.md as T8's output while L113 says "recorded in the PR". Add `status: todo` to every task and say once where each kind of evidence goes. *(structural, readiness, codebase-details)*
3. **The client-JS limit has no measurement** (spec L216). If the limit is kept, add a before/after "First Load JS" reading for `/compliance-checklist` from `next build` to T2. *(structural, readiness)*
4. **The T6 consent guard has gaps** (L94: `grep -E 'authTitle|consentRequired|beforeYouBegin|optReport|optNewsletter|takeFreeAssessment|trackEvent'`).
   - It misses `viewPrivacyNotice` and `freeNoPayment` (`SurveyClient.tsx:794, 816`).
   - It fails falsely if the new keys are appended after `optNewsletter`, because that line gains a comma. Insert them after `"intro"` instead.
   - `git diff HEAD` is empty once T6 is committed. Diff against `$(git merge-base HEAD origin/main)`.
   - *(readiness, codebase-details)*
5. **The tsc baseline is taken before any build** (L33). `tsconfig.json` includes `.next/types/**`, so counts after a build can differ. Run `npm run build` in Setup before recording the baseline. *(readiness)*
6. **T1 and T5 skip the tsc gate** (L49, L85) even though they add .ts files. *(structural)*
7. **AC6 is checked by reading only** (L68: "confirm by reading that code, do not add new error handling."). The briefing try/catch is in `lib/data/briefings-source.ts:29–56`, not in sitemap.ts. Name both locations. Either mark AC6 as verified by inspection, or simulate the outage by blanking the Appwrite env. *(readiness, codebase-details, structural)*
8. **Rules guide placement is vague** (L77: "on the Rules guide, in the article body after the introduction."). Say: immediately after the `</div>` closing `#what-this-page-covers` (line 267), before `<RuleSection id="rule-1">`. *(readiness, codebase-details)*
9. **The MISSING_MESSAGE check cannot fail** (L95: "confirm no MISSING_MESSAGE in the terminal (AC17)"). Missing hi keys fall back to English silently (`i18n/request.ts:17–32, 46–49`). Compare the hi values against en instead. *(codebase-details)*
10. **AC12 is missing from T6** (L92: "- implements: AC11, AC16, AC17") even though T6 feeds `CORE_QUESTION_COUNT` into the offer line. *(structural)*
11. **"Count equals 10 today" is a snapshot** (L86). It forces a test edit whenever a question is added. Keep only the non-optional-length equality, or say the snapshot is intentional. *(codebase-details)*
12. **The skip path** (L95: "{count} core questions"). Answering Q3 "no" means 8 questions. Consider "up to {count}". *(readiness, codebase-details)*
13. **AC16 analytics are only checked indirectly** (L113). Add a GA DebugView or network-tab confirmation of `assessmentStart`, `assessmentStep(3)`, `assessmentStep(6)`, `surveyComplete` and `reportRequested` to T8. *(readiness)*
14. **AC10 focus ring has no manual step** (L77). Add: Tab to the link on `/hi/learn/dpdp-act-2023` and on one `/hi/industries` page, and confirm the ring. *(readiness, structural)*
15. **No O1 merge gate** (L86: "Hindi strings are a draft pending O1."). Add "O1 sign-off recorded in the PR" to T6 or T8. *(structural)*
16. **The precedent path is not in this worktree** (L33: "as in specs/consent-flags-withdrawal"). Cite `.claude/worktrees/consent-flags-withdrawal/specs/consent-flags-withdrawal/plan.md:43`. *(codebase-details)*
17. **T8 uses "implements" for checks, and the list is incomplete** (L107). Rename the field "verifies" and add AC7, AC8 and AC14. *(structural)*
18. **Structure.**
    - Add a "Target scope" list of every file created or modified (it would have exposed B1).
    - Group tasks into phases.
    - The architecture diagram (L13–24) omits the test files and the sectors.ts → script link.
    - Optional: move `CORE_QUESTION_COUNT` into its own module so the FAQ strings for both locales are not bundled into SurveyClient.
    - *(structural, codebase-details)*
