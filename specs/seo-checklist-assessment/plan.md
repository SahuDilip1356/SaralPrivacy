# Plan — Readable checklist, findable from the law pages, and a clear free-assessment offer

**Status:** draft (revised after EGM review, 2026-10-27)
**Spec:** ./spec.md
**Date:** 2026-10-27

All file paths and commands below are relative to `webapp/` (the Next.js app),
unless they start with `specs/`.

## Target scope

New files:
- `lib/seo/acceptance.ts`
- `lib/seo/acceptance.test.ts`
- `lib/seo/__fixtures__/checklist-prod-2026-10-27.html`
- `scripts/seo-acceptance.mts`
- `scripts/serve-and-check.sh`
- `components/ChecklistCrossLink.tsx`
- `lib/data/assessment-offer.ts`
- `lib/data/assessment-offer.test.ts`

Modified files:
- `app/[locale]/compliance-checklist/ChecklistContent.tsx`
- `app/sitemap.ts`
- `app/[locale]/learn/dpdp-act-2023/page.tsx`
- `app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx`
- `components/industries/DataFlowPreview.tsx`
- `app/[locale]/assessment/page.tsx`

Not modified, by design (AC19): `app/[locale]/assessment/SurveyClient.tsx` and `messages/*.json`.

## Architecture

```
Phase A — checks
  lib/data/compliance-checklist.ts ┐
  lib/data/sectors.ts (slug, assessmentSlug) ┼─► scripts/seo-acceptance.mts ──► lib/seo/acceptance.ts (pure)
  scripts/serve-and-check.sh (kill → build → start → poll → run → kill)      └─ acceptance.test.ts + fixture
Phase B — checklist
  ChecklistContent.tsx: Accordion.Content forceMount + closed:hidden, data-control-id on each card
  app/sitemap.ts: + static /compliance-checklist (learn block)
  components/ChecklistCrossLink.tsx ─► Act page · Rules guide body · DataFlowPreview (after the navy card → 12 industry pages)
Phase C — assessment
  lib/data/dpdpa-assessment.ts (QUESTIONS) ┐
  lib/data/faqs.ts + lib/data/i18n/faqs.hi.ts ┼─► lib/data/assessment-offer.ts ─► app/[locale]/assessment/page.tsx
                                                (offer line · title · FAQ section · faqPageSchema; sr-only block removed)
Phase D — preview verification (T7)
```

## Decisions

- **Closed checklist sections:** Radix `forceMount` on `Accordion.Content` plus the Tailwind class `data-[state=closed]:hidden`. Under `forceMount`, Radix does not set the `hidden` attribute, so the class alone does the hiding. The checks look for `data-state="closed"` plus that class. Native `<details>` was rejected as a larger diff.
- **Control markers:** each control card gets `data-control-id={item.id}`, so checks match ids exactly. Substring matching would count `1.1` inside `O1.1` and `11.1`.
- **Industry pages:** the cross-link renders from `DataFlowPreview` after the navy card, inside its `<section>`. Editing 12 page files was rejected.
- **Assessment changes:** all in `app/[locale]/assessment/page.tsx`. `SurveyClient.tsx` is not edited, so AC19 is checked by a byte-identical diff.
- **Offer copy:** lives in `lib/data/assessment-offer.ts` per locale, not in `messages/*.json`. That keeps the consent message keys untouched.
- **FAQ:** reuses items f016, f017, f018, f020, f021 and f022 from `lib/data/faqs.ts`, with the Hindi overlay through the existing localisation helper. f019 is excluded (spec OQ3).
- **Core question count:** `QUESTIONS.filter(q => !q.isOptional).length`. The test asserts this equality, not the literal 10.
- **Control count in the cross-link copy:** derived from the checklist data (part 1 plus part 2 items), not typed as "90".
- **TypeScript imports:** every new `.ts` and `.mts` file imports other repo files with relative paths, not `@/`, because `scripts/ts-resolve-hooks.mjs` resolves relative specifiers only. Run with `node --import ./scripts/ts-resolve.mjs --experimental-strip-types`.
- **Typecheck gate:** a baseline error count, as in `.claude/worktrees/consent-flags-withdrawal/specs/consent-flags-withdrawal/plan.md:43`.

## Setup (once, before any task)

1. `cp "../../../../webapp/.env.local" .env.local` (from `webapp/` in this worktree). It is gitignored, and the build needs its Appwrite and Supabase keys.
2. `npm ci && npm run build`. Build first, because `tsconfig.json` includes `.next/types/**` and that changes the count.
3. `npx tsc --noEmit 2>&1 | grep -c "error TS" > /tmp/seo-tsc-baseline.txt`.
4. Define the gate used below: `TSC_OK='test "$(npx tsc --noEmit 2>&1 | grep -c "error TS")" -le "$(cat /tmp/seo-tsc-baseline.txt)"'`.

## Tasks

### T1 — Add pure acceptance checks, a production fixture, the runner and the serve script
- implements: AC1, AC5, AC6, AC8, AC9, AC10, AC11, AC13, AC16, AC17
- depends_on: none
- files: lib/seo/acceptance.ts, lib/seo/acceptance.test.ts, lib/seo/__fixtures__/checklist-prod-2026-10-27.html, scripts/seo-acceptance.mts, scripts/serve-and-check.sh
- risk: tier2
- size: M
- status: todo
- verify: eval "$TSC_OK" && node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/seo/acceptance.test.ts
- notes:
  - Capture the fixture first: `curl -s https://saralprivacy.com/compliance-checklist > lib/seo/__fixtures__/checklist-prod-2026-10-27.html`.
  - `acceptance.ts` exports pure functions. All of them work on page markup (`toMarkup(html)` removes `<script>…</script>` and elements with class `sr-only`) and compare normalised text (`norm(s)`: decode entities, strip tags, collapse whitespace, trim):
    - `checklistControls(html, controls)` checks each `data-control-id` once, with its requirement text inside.
    - `closedStateOk(html, openIds)`.
    - `sitemapEntryOnce(xml, url)` checks the loc once and requires a lastmod.
    - `crossLinkCount(html)` counts `<aside data-crosslink="compliance-checklist">` blocks that contain `href="/compliance-checklist"` and /compliance checklist/i.
    - `offerLine(html)` returns the text and checks it sits before the first cross-link banner.
    - `faqBlocks(html)` parses every ld+json block and returns the FAQPage ones.
    - `faqMatchesVisible(html)` reads `[data-faq-q]` and `[data-faq-a]` in order.
  - Tests: the prod fixture must fail `checklistControls`. A fragment with only `data-control-id="O1.1"` must not count `1.1`. A Rules-guide-sidebar-only fragment must give `crossLinkCount` 0. A mismatched FAQ fragment must fail. One passing fragment per function.
  - `seo-acceptance.mts`:
    - Uses relative imports: `../lib/data/compliance-checklist.ts` for controls and `../lib/data/sectors.ts` for `slug` and `assessmentSlug`.
    - Takes `--only checklist|sitemap|links|assessment` and reads BASE (default `http://localhost:3100`).
    - Sends `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` when that variable is set.
    - Fails on any non-200.
  - URL sets per group:
    - **checklist:** /compliance-checklist, /hi/compliance-checklist.
    - **sitemap:** /sitemap.xml.
    - **links:** /learn/dpdp-act-2023, /learn/dpdp-rules-2025-plain-english-guide, /industries/<slug> ×12, plus the /hi/ variant of all 14.
    - **assessment:** /assessment, /hi/assessment, /assessment/<assessmentSlug> ×12. Note that recruitment-agencies uses `recruitment`.
  - `serve-and-check.sh <group>` runs `lsof -ti:3100 | xargs kill 2>/dev/null; npm run build && { npm run start -- -p 3100 & PID=$!; until curl -sf localhost:3100 >/dev/null; do sleep 1; done; node --import ./scripts/ts-resolve.mjs --experimental-strip-types scripts/seo-acceptance.mts --only "$1"; RC=$?; kill $PID; exit $RC; }`.

### T2 — Keep every checklist control in the page markup
- implements: AC1, AC2, AC3, AC4, AC5
- depends_on: T1
- files: app/[locale]/compliance-checklist/ChecklistContent.tsx
- risk: tier2
- size: S
- status: todo
- verify: eval "$TSC_OK" && npx eslint "app/[locale]/compliance-checklist/ChecklistContent.tsx" && bash scripts/serve-and-check.sh checklist
- notes:
  - At line 202, add `forceMount` to `Accordion.Content` and add `data-[state=closed]:hidden` to its className.
  - Leave the two `animate-[...]` classes alone. The keyframes do not exist, so nothing animates today.
  - On the outer div of `ChecklistItemCard` (line 82), add `data-control-id={item.id}`.
  - Keep `defaultValue` (lines 521, 559) and the `filter` state (line 380) unchanged.
  - In the PR, record the page byte size (`curl -s localhost:3100/compliance-checklist | wc -c`, NF1) and the "First Load JS" row for /compliance-checklist from the build output, before and after.

### T3 — List the checklist in the sitemap
- implements: AC6, AC7
- depends_on: T1
- files: app/sitemap.ts
- risk: tier2
- size: S
- status: todo
- verify: eval "$TSC_OK" && bash scripts/serve-and-check.sh sitemap
- notes:
  - Add `{ url: \`${BASE}/compliance-checklist\`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.8 }` in the static learn block, after `/learn/dpdp-rules-2025-plain-english-guide`.
  - AC7 is verified by inspection. The briefing fetch is guarded in `lib/data/briefings-source.ts:29–56`, and the blog fetch in the `getBlogSlugs` try/catch in `app/sitemap.ts`. The new entry sits outside both. Quote both locations in the PR.

### T4 — Add the checklist cross-link and place it on the Act page, the Rules guide and the shared industry block
- implements: AC8, AC9, AC10, AC11, AC12
- depends_on: T1
- files: components/ChecklistCrossLink.tsx, app/[locale]/learn/dpdp-act-2023/page.tsx, app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx, components/industries/DataFlowPreview.tsx
- risk: tier2
- size: S
- status: todo
- verify: eval "$TSC_OK" && npx eslint components/ChecklistCrossLink.tsx components/industries/DataFlowPreview.tsx "app/[locale]/learn/dpdp-act-2023/page.tsx" "app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx" && bash scripts/serve-and-check.sh links
- notes:
  - **Component:** a server component, no "use client". Render `<aside data-crosslink="compliance-checklist" className="border-l-2 border-green-700 pl-4 py-1 text-sm text-slate-700 leading-relaxed …">`. Use the link recipe from `components/briefings/InBodyToolLink.tsx`: green-700, underline, focus ring.
  - **Exact copy:** "Turning this into a to-do list? The <Link href="/compliance-checklist">DPDPA compliance checklist</Link> breaks the Act and Rules into {N} controls, each with its section reference." N is the item count across both parts of the checklist data.
  - **Act page:** directly after `<InBodyToolLink className="mt-6" />` (line 276), as `<ChecklistCrossLink className="mt-4" />`.
  - **Rules guide:** directly after the `</div>` that closes `#what-this-page-covers` (opens at line 257), immediately before `<RuleSection id="rule-1">` (line 271). The sidebar `topicNav` link stays.
  - **DataFlowPreview:** after the navy panel's closing `</div>` (line 72), inside the `<section>`, as `<ChecklistCrossLink className="mt-4" />`. It sits on a light background, never inside the navy panel.

### T5 — Build the assessment offer module: derived count, offer copy and the FAQ selection
- implements: AC14, AC16, AC18, AC20
- depends_on: none
- files: lib/data/assessment-offer.ts, lib/data/assessment-offer.test.ts
- risk: tier1
- size: S
- status: todo
- verify: eval "$TSC_OK" && node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/data/assessment-offer.test.ts
- notes:
  - Relative imports only: `./dpdpa-assessment.ts`, `./faqs.ts`, `./i18n/faqs.hi.ts`.
  - **Exports:**
    - `CORE_QUESTION_COUNT = QUESTIONS.filter(q => !q.isOptional).length`.
    - `ASSESSMENT_FAQ_IDS = ["f016","f017","f018","f020","f021","f022"]`.
    - `assessmentFaq(locale: "en" | "hi")`, returning `{ question, answer }[]` in that order. For hi, apply the overlay the same way `getFaqContent` in `lib/i18n/content.ts:95` does. Reuse its merge logic if it can be imported without `@/`; otherwise apply the overlay keys directly.
    - `offerCopy(locale)`, returning `{ text: string; industryLink: string }`.
  - **Exact offer copy, en:** text "Free · Up to {CORE_QUESTION_COUNT} questions · No account, and no email needed to see your score · Instant 0–100 score ·", industryLink "Pick your industry".
  - **Draft offer copy, hi (OQ1):** text "निःशुल्क · अधिकतम {CORE_QUESTION_COUNT} प्रश्न · स्कोर देखने के लिए न खाता, न ईमेल · तुरंत 0–100 स्कोर ·", industryLink "अपना उद्योग चुनें".
  - **Before merging,** walk the flow in `app/[locale]/assessment/SurveyClient.tsx` and confirm each claim (intent A4):
    - no account is created;
    - the score shows on the skip-email path (`gate.skipBasic`, line 1294);
    - Q3 "no" skips Q4 and Q5 (lines 618–639), which is why the copy says "Up to".
  - **Tests:**
    - `CORE_QUESTION_COUNT` equals the non-optional length (AC14).
    - The FAQ has the six ids in order for both locales.
    - f022 is present in both locales (AC18).
    - Every hi question, hi answer and hi offer string is non-empty and differs from its en counterpart (AC20).
    - No answer contains "<" (answers must be plain text).

### T6 — Put the offer line, consistent duration and the visible FAQ with structured data on the assessment page
- implements: AC13, AC15, AC16, AC17, AC19, AC20
- depends_on: T1, T5
- files: app/[locale]/assessment/page.tsx
- risk: tier1
- size: S
- status: todo
- verify: eval "$TSC_OK" && npx eslint "app/[locale]/assessment/page.tsx" && git diff --quiet "$(git merge-base HEAD origin/main)" -- "app/[locale]/assessment/SurveyClient.tsx" messages/en.json messages/hi.json && bash scripts/serve-and-check.sh assessment
- notes:
  - **Params:** convert to `export default async function AssessmentPage({ params }: { params: Promise<{ locale: string }> })` with `setRequestLocale(locale)`, as `compliance-checklist/page.tsx` does. Pick `const l = locale === "hi" ? "hi" : "en"`.
  - **Metadata:** title becomes "Free DPDPA Readiness Assessment — 3–5 Minutes". The description becomes "Free DPDPA readiness check for Indian businesses: up to {CORE_QUESTION_COUNT} questions, no account, and no email needed to see your 0–100 score and top gaps." Keep the canonical.
  - **Offer line:** the first child, before the banner wrapper: `<p data-offer="assessment" className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 text-sm font-medium text-navy-900">{text} <Link href="/industries" className="…green-700 link recipe…">{industryLink}</Link></p>`.
  - **Remove** the `sr-only` block (lines 22–45). Its claims are covered by the offer line and FAQ items f016, f018 and f022. The legal-baseline sentence moves under the FAQ as a visible `<p>`.
  - **FAQ:** after `<SurveyClient />`, add `<section data-faq="assessment" className="max-w-3xl mx-auto px-4 sm:px-6 py-12">`. Inside it, `<h2>` "Questions before you start" ("शुरू करने से पहले सवाल" for hi). Then each item as a card in the `app/[locale]/faq/page.tsx` pattern: `rounded-xl` border, `p-5`, with `<h3 data-faq-q>` and `<p data-faq-a>`.
  - **Structured data:** call `faqPageSchema(items, { url: "https://saralprivacy.com/assessment", inLanguage: l === "hi" ? "hi-IN" : "en-IN" })` once, with the same `items`.
  - **Do not touch** the 12 `app/[locale]/assessment/<sector>/` pages.
  - **Manual, in the PR:** screenshots at 1366×768 and 390×844 showing the offer line before any scroll (AC13).

### T7 — Verify on the Vercel preview and record results
- implements: AC1, AC3, AC4, AC12, AC13, AC19, AC21
- depends_on: T2, T3, T4, T6
- files: specs/seo-checklist-assessment/plan.md
- risk: tier1
- size: S
- status: todo
- verify: BASE="$PREVIEW_URL" node --import ./scripts/ts-resolve.mjs --experimental-strip-types scripts/seo-acceptance.mts
- notes:
  - Set PREVIEW_URL to the PR's Vercel preview, and VERCEL_AUTOMATION_BYPASS_SECRET if Deployment Protection is on.
  - Record the manual results in the PR description. In this file, tick each task's `status: done` and nothing else.
  - **Browser checks:**
    - AC3: open and close a section, and use the rotor or elements list.
    - AC4: the three filter buttons against production.
    - AC12: tab to the cross-link on /hi/learn/dpdp-act-2023 and on /hi/industries/ca-firms.
    - AC13: both viewports.
    - AC21: complete the core questions on a fresh profile, skip email, and see the score.
    - AC19: GA DebugView or the network tab shows `assessment_start`, the step events at 3 and 6, `survey_complete` and `report_requested` at the same steps as production, and one fixed answer set gives the same score on both.
  - **Performance:** NF1 checklist bytes. NF2 and NF3: the median of 3 mobile Lighthouse runs on /compliance-checklist and /assessment, preview against production.
  - **Merge gate:** OQ1 Hindi offer-line sign-off is recorded in the PR.
