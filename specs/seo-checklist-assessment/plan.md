# Plan — Readable checklist, findable from the law pages, and a clear free-assessment offer

**Status:** draft
**Spec:** ./spec.md
**Date:** 2026-10-27

All file paths and commands below are relative to `webapp/` (the Next.js app),
unless they start with `specs/`.

## Architecture

```
lib/data/compliance-checklist.ts ──► app/[locale]/compliance-checklist/ChecklistContent.tsx
                                       (Radix Accordion: closed items must stay mounted)
app/sitemap.ts ──► + static /compliance-checklist entry (learn block)
components/ChecklistCrossLink.tsx (new, prose line)
   ├─► app/[locale]/learn/dpdp-act-2023/page.tsx
   ├─► app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx
   └─► components/industries/DataFlowPreview.tsx  (rendered by all 12 industry pages)
lib/data/assessment-offer.ts (new: core question count from QUESTIONS, FAQ list per locale)
   ├─► app/[locale]/assessment/SurveyClient.tsx  (step-0 hero only) + messages/{en,hi}.json
   └─► app/[locale]/assessment/page.tsx  (visible FAQ + faqPageSchema from lib/schema.tsx)
lib/seo/acceptance.ts (new, pure HTML checks) ──► scripts/seo-acceptance.mjs (runs them against BASE)
```

## Decisions

- Keep closed sections in the DOM with Radix `forceMount` plus `hidden` on closed content, rather than switching to native `<details>`: smaller diff, same Radix animation and filter code.
- Render the industry link from `DataFlowPreview`, the one component all 12 industry pages share, rather than editing 12 page files.
- Derive the core question count as `QUESTIONS.filter(q => !q.isOptional).length` (today 10), rather than a number in the message catalog.
- FAQ text lives in one typed list per locale in `lib/data/assessment-offer.ts`; the visible FAQ and `faqPageSchema` both read it, rather than duplicating text in JSX and JSON-LD.
- Acceptance checks are pure functions over HTML strings (unit-tested with fixtures), wrapped by a script that fetches a running build, rather than a Playwright suite (Playwright is not a dependency; see scripts/nav-acceptance.mjs).
- Typecheck gate uses a baseline error count, as in specs/consent-flags-withdrawal: record `npx tsc --noEmit 2>&1 | grep -c "error TS" > /tmp/seo-tsc-baseline.txt` once before T1.

## Setup (once, before any task)

- Copy the gitignored env file into this worktree: `cp "../../../../webapp/.env.local" .env.local` (from `webapp/` inside the worktree). Without it `npm run build` fails on missing Appwrite/Supabase keys.
- `npm ci`, then record the tsc baseline above.
- Running build for HTML checks: `npm run build && (npm run start -- -p 3100 &) && sleep 8`, then `BASE=http://localhost:3100 node scripts/seo-acceptance.mjs --only <group>`. Stop the server after each task (`lsof -ti:3100 | xargs kill`) so the next task's verify serves its own build.

## Tasks

### T1 — Add pure acceptance checks and the runner script
- implements: AC1, AC4, AC5, AC7, AC8, AC9, AC13, AC14
- depends_on: none
- files: lib/seo/acceptance.ts, lib/seo/acceptance.test.ts, scripts/seo-acceptance.mjs
- risk: tier2
- size: M
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/seo/acceptance.test.ts
- notes: Export `countChecklistControls(html, ids)`, `sitemapHasOnce(xml, url)`, `hasChecklistLink(html)` (anchor href="/compliance-checklist" with text matching /compliance checklist/i), `faqBlocks(html)` (parse every ld+json, return FAQPage ones) and `faqMatchesVisible(html)`. Control ids come from lib/data/compliance-checklist.ts (90 ids: "1.1"…, "O1.1"…). Tests use small inline HTML fixtures, including a failing case for each function. The script takes `--only checklist|sitemap|links|assessment`, reads BASE (default http://localhost:3000), fetches /compliance-checklist, /hi/compliance-checklist, /sitemap.xml, /learn/dpdp-act-2023, /learn/dpdp-rules-2025-plain-english-guide, the 12 /industries/<slug> pages (slugs from lib/data/sectors.ts), /assessment, /hi/assessment and the 12 /assessment/<slug> pages, and exits 1 on any failure.

### T2 — Keep every checklist control in the server HTML
- implements: AC1, AC2, AC3, AC4
- depends_on: T1
- files: app/[locale]/compliance-checklist/ChecklistContent.tsx
- risk: tier2
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/seo-tsc-baseline.txt)" -ge && npx eslint "app/[locale]/compliance-checklist/ChecklistContent.tsx" && npm run build && (npm run start -- -p 3100 & sleep 8) && BASE=http://localhost:3100 node scripts/seo-acceptance.mjs --only checklist
- notes: Root cause: `Accordion.Content` unmounts closed items, so only the `defaultValue` sections ("1-1", "2-O1") reach the HTML. Add `forceMount` to `Accordion.Content` and hide closed content with `data-[state=closed]:hidden` (Tailwind) so it is display:none and out of the accessibility tree (AC2). Keep `defaultValue`, the animation classes and the `filter` state exactly as they are (AC3). Manual check on `npm run dev`: open/close a section, switch the filter, tab through with a screen reader rotor showing only open content. Record the page byte size (`curl -s localhost:3100/compliance-checklist | wc -c`) in the PR against the 400 KB limit.

### T3 — List the checklist in the sitemap
- implements: AC5, AC6
- depends_on: T1
- files: app/sitemap.ts
- risk: tier2
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/seo-tsc-baseline.txt)" -ge && npm run build && (npm run start -- -p 3100 & sleep 8) && BASE=http://localhost:3100 node scripts/seo-acceptance.mjs --only sitemap
- notes: Add `{ url: \`${BASE}/compliance-checklist\`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.8 }` in the static learn block next to /learn/dpdp-rules-2025-plain-english-guide. It is a static entry, so AC6 holds by construction: the existing try/catch around blog and briefing fetches already lets static entries render; confirm by reading that code, do not add new error handling.

### T4 — Add the checklist cross-link and place it on the Act and Rules pages
- implements: AC7, AC8, AC10
- depends_on: T1
- files: components/ChecklistCrossLink.tsx, app/[locale]/learn/dpdp-act-2023/page.tsx, app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx
- risk: tier2
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/seo-tsc-baseline.txt)" -ge && npx eslint components/ChecklistCrossLink.tsx "app/[locale]/learn/dpdp-act-2023/page.tsx" "app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx" && npm run build && (npm run start -- -p 3100 & sleep 8) && BASE=http://localhost:3100 node scripts/seo-acceptance.mjs --only links
- notes: Server component, no "use client". Copy the prose-line style of components/briefings/InBodyToolLink.tsx (border-l-2 aside, the green-700 link recipe with focus ring). Suggested line: "Turning this into a to-do list? The DPDPA compliance checklist breaks the Act and Rules into 90 controls, each with its section reference." Link text must include "compliance checklist". On the Act page, place it directly after the existing `<InBodyToolLink className="mt-6" />`; on the Rules guide, in the article body after the introduction. English-only copy is acceptable on these two pages (both render English body text on every locale today).

### T5 — Create the assessment offer data: derived question count and the FAQ list
- implements: AC12, AC13, AC15
- depends_on: none
- files: lib/data/assessment-offer.ts, lib/data/assessment-offer.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/data/assessment-offer.test.ts
- notes: Before writing copy, walk the flow in app/[locale]/assessment/SurveyClient.tsx and confirm each claim (A4): no account is created; the score shows before any email (the `gate.skipBasic` path); the 2 optional questions are Q11 and Q12 (`isOptional`). Export `CORE_QUESTION_COUNT = QUESTIONS.filter(q => !q.isOptional).length` and `assessmentFaq(locale: "en" | "hi"): { question: string; answer: string }[]` built with that count. 5 questions: Is it free? How long does it take? Do I need to give my email? What do I get? Is this legal advice? The legal-advice answer must say educational, not legal advice (AC15). Tests: count equals 10 today and equals the non-optional length (drift guard, AC12); 4–6 items per locale; every answer non-empty; the legal-advice item exists in both locales. Hindi strings are a draft pending O1. tier1 because these are public claims about a consent-gated flow.

### T6 — Rewrite the assessment hero to state the offer in the first screen
- implements: AC11, AC16, AC17
- depends_on: T5
- files: app/[locale]/assessment/SurveyClient.tsx, messages/en.json, messages/hi.json
- risk: tier1
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/seo-tsc-baseline.txt)" -ge && npx eslint "app/[locale]/assessment/SurveyClient.tsx" && node -e 'for (const l of ["en","hi"]) { const s = require("./messages/"+l+".json").survey.landing; for (const k of ["offerLine","industryLink"]) if (!s[k]) { console.error(l, k); process.exit(1) } } console.log("ok")' && ! git diff HEAD -U0 -- "app/[locale]/assessment/SurveyClient.tsx" messages/en.json messages/hi.json | grep -E '^[-+][^-+]' | grep -E 'authTitle|consentRequired|beforeYouBegin|optReport|optNewsletter|takeFreeAssessment|trackEvent'
- notes: Only the step-0 left column (the hero block between `{t("landing.badge")}` and the trust row) changes. Add one offer line under the H1 using a new `survey.landing.offerLine` message with an ICU `{count}` argument fed from `CORE_QUESTION_COUNT`, e.g. "Free · {count} core questions · no account, and no email needed to see your score · instant 0–100 score". Add `survey.landing.industryLink` ("Pick your industry version") linking to /industries (O2 default). Do not touch the right-hand authorization card, its consent copy, `trackEvent` calls, or any step after 0 (AC16). The verify's last clause fails if the diff touches the consent message keys. Manual: screenshot at 1366×768 and 390×844 for the PR showing the line above the fold (AC11). Load /hi/assessment on `npm run dev` and confirm no MISSING_MESSAGE in the terminal (AC17).

### T7 — Show the FAQ and publish matching FAQ structured data on the assessment page
- implements: AC13, AC14, AC17
- depends_on: T5, T1
- files: app/[locale]/assessment/page.tsx
- risk: tier2
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/seo-tsc-baseline.txt)" -ge && npx eslint "app/[locale]/assessment/page.tsx" && npm run build && (npm run start -- -p 3100 & sleep 8) && BASE=http://localhost:3100 node scripts/seo-acceptance.mjs --only assessment
- notes: Page is a server component without params today; add `params: Promise<{ locale: string }>` like compliance-checklist/page.tsx and pick `assessmentFaq(locale === "hi" ? "hi" : "en")`. Render a visible FAQ section after `<SurveyClient />` (plain `<h2>` + `<dl>` or `<details>` items, matching the site's existing FAQ styling in app/[locale]/faq). Emit `faqPageSchema(items, { url: "https://saralprivacy.com/assessment", inLanguage: locale === "hi" ? "hi-IN" : "en-IN" })` once, from the same `items`. Do not add FAQ markup to app/[locale]/assessment/<sector>/ pages (AC14).

### T8 — Verify on the Vercel preview and record results
- implements: AC1, AC2, AC4, AC5, AC9, AC11, AC13, AC16
- depends_on: T2, T3, T4, T6, T7
- files: specs/seo-checklist-assessment/plan.md
- risk: tier1
- size: S
- verify: BASE="$PREVIEW_URL" node scripts/seo-acceptance.mjs
- notes: Set PREVIEW_URL to the PR's Vercel preview. Then manual, recorded in the PR: Google Rich Results Test on preview /assessment shows one valid FAQ item set; Lighthouse performance on preview /assessment within 5 points of production; checklist HTML size under 400 KB; one full assessment run on preview, with the same steps and the authorization card identical to production (AC16). Tick each task's `status: done` here as it lands.
