# Goldfish Review Report — Pass 1: Feature spec

**Target:** `specs/seo-checklist-assessment/spec.md` (lines 1–229), with `intent.md` and `plan.md` as context
**Date:** 2026-10-27
**Reviewers:** egm-structural, egm-comprehension, egm-design, egm-zoom-out, egm-style, egm-codebase-details (one instance each)
**Code checked:** `webapp/` in the `seo-checklist-assessment` worktree

**Totals:** 🔴 1 Blocker · 🟠 13 Major · 🟡 22 Minor

Verdict: revise before planning continues. The spec's structure is sound: all 17 ACs use given/when/then, and every goal G1–G5 has at least one AC. The gaps are in verification. AC1/AC4 already pass today. Several criteria name observables that do not exist or cannot be decided. Some existing code (hidden SEO blocks, an existing assessment FAQ set, the Rules guide sidebar link, the banners above the hero) is not accounted for.

Known items, not raised again: no test runner in package.json, Playwright not a dependency, all 12 industry pages import DataFlowPreview, `isOptional`, `faqPageSchema` export, Radix Content unmounting closed items.

Code facts the reviewers confirmed: 90 controls (49 Part 1, 41 Part 2); `defaultValue` `["1-1"]` / `["2-O1"]`; the sitemap's static entries survive a content-store outage; the score shows before email (`gate.skipBasic`); 12 questions with Q11/Q12 optional, so 10 are core; no assessment or industry-assessment page emits FAQPage today; `faqPageSchema(faqs, { url, inLanguage })` matches.

---

## 🔴 Blocker

### B1 — AC1 and AC4 pass on today's build, so they cannot detect the fix
- **Lenses:** design, codebase-details
- **Lines:** 41–42, 115, 133
  - L42: "the response body before any script runs. Closed sections carry the `hidden`"
  - L115: "then: the response body contains all 90 control ids and each control's requirement text"
- **Problem:** `ChecklistContent.tsx` is `"use client"` (line 1). `page.tsx:75` passes it the full localized checklist as props (`<ChecklistContent {...checklist} />`), so every control id and requirement string is already in today's HTML, inside the `self.__next_f.push(...)` flight-data scripts.
  - "The response body contains" is true today. The criterion cannot tell "fixed" from "not fixed".
  - This also explains why the 217 KB baseline (L215) is large with only a few controls rendered.
- **Fix:** define AC1/AC4 (and AC13's visible-text side) over rendered markup only. Strip every `<script>` element and the `sr-only` blocks, then match each id inside its rendered control card. State that the check must fail on today's production HTML.

---

## 🟠 Major

### M1 — Hindi href, Hindi FAQ url and English canonicals are not settled
- **Lenses:** structural, comprehension, style, design, codebase-details
- **Lines:** 46, 49, 54, 167, 211
  - L46: "`<a href="/compliance-checklist">` with anchor text containing"
  - L54: `"url": "https://saralprivacy.com/assessment",`
  - L167: "given: the pages in AC7–AC9, in English and Hindi"
- **Problem:** routing is `localePrefix: "as-needed"` (`i18n/routing.ts:23`).
  - A bare `/compliance-checklist` on `/hi/...` pages always sends Hindi readers to the English checklist.
  - The FAQ contract heading lists only `/assessment`, but AC17 expects a hi-IN block on `/hi/assessment` that carries the English url.
  - `/hi/assessment` and `/hi/compliance-checklist` both declare the English canonical (`assessment/page.tsx:11`; `compliance-checklist/page.tsx:11, 24–26`). So the Hindi FAQPage and the Hindi controls (AC4, AC17) are unlikely to be indexed.
  - The spec does not say whether the anchor text stays English on Hindi pages, or whether the match is case-insensitive.
- **Fix:**
  - Pin the href and the FAQ `url` for each locale. Use `absoluteUrl(path, locale)` / the locale-aware Link, or state that the English URL is used on purpose.
  - State that the cross-link copy is English on every locale, and that the match is case-insensitive.
  - Add a risk row: under NG3, `/hi` pages canonicalise to English, so this cycle brings no Hindi indexing gain.

### M2 — "Every step is unchanged" conflicts with the step-0 edit and with a FAQ that shows under every step
- **Lenses:** comprehension, style, design, codebase-details
- **Lines:** 22–24, 204–205
  - L23–24: "Everything from the authorization card onwards, and every step of the assessment, is unchanged."
  - L205: "then: they are identical in text, order and behaviour"
- **Problem:**
  - The hero being rewritten is part of step 0. The card is the right-hand column of that same screen, so "onwards" is not an order.
  - The FAQ is a server-rendered sibling after `<SurveyClient />` (`assessment/page.tsx:47–52`), so it shows below the wizard (steps 1–7), the gate (8) and the report (9–10). Each step's page changes, which contradicts AC16.
- **Fix:**
  - Reword: "Only the left-hand hero of step 0 changes; the authorization card, its consent wording and options, and steps 1+ are unchanged."
  - Decide whether the FAQ shows at step 0 only or below every step, and add an AC for it. If below every step, relax AC16 to "the step components are unchanged".

### M3 — "Core questions" is undefined, and the count is not true for every visitor
- **Lenses:** comprehension, style, design, codebase-details
- **Lines:** 20, 94, 175, 179–181
  - L20: "number of core questions, no account and no email needed to see the score"
  - L94: "Derived from the questionnaire itself"
- **Problem:**
  - Only the plan defines "core" (non-optional, 10 today).
  - Answering Q3 "no" skips Q4 and Q5 (`SurveyClient.tsx:618–621, 637–639`), so some visitors answer 8 core questions.
  - SurveyClient also hard-codes `QUESTIONS[0..11]` by position. Adding a question changes the copy's number but not the flow, so AC12 keeps copy and array in step, not copy and flow.
- **Fix:**
  - Define "core question = a questionnaire entry not marked optional (10 today)".
  - Word the claim so it holds on the skip path ("up to {count}").
  - Note in K1 that the step-to-question mapping is positional. Optionally add a test that the steps cover every non-optional question.

### M4 — The FAQ rationale relies on a Google rich result this site cannot get
- **Lenses:** structural, style, design, zoom-out
- **Line:** 93
  - "Structured data only: search engines require the answers to be visible, and a mismatch can lose the rich result"
- **Problem:** since August 2023, Google shows FAQ rich results only for well-known government and health sites. Plan T8's Rich Results Test proves the markup is valid, not that anything will display.
- **Fix:**
  - Base G4's rationale on machine readability (AI answers, Bing, parsers), tied to A3.
  - Add a K9 risk (search eligibility, accepted).
  - Keep the visible FAQ for honesty.

### M5 — Existing offer surfaces (hidden SEO blocks, page title, trust row) are left out of scope and will conflict
- **Lenses:** zoom-out, design, codebase-details
- **Lines:** 19–21, 90
  - L90: "A hidden text summary of all controls: duplicates the content in two copies that can drift, and hidden summaries read as cloaking"
  - L19: "The top of the assessment page states the offer in the first screen: free, the"
- **Problem:**
  - `assessment/page.tsx:22–45` already ships an `sr-only` "SEO content — hidden visually, fully crawlable" block. It says "a few practical questions" and "Takes 3–5 minutes" and holds the full legal-advice sentence.
  - `compliance-checklist/page.tsx:69–73` ships a second hidden `<h1>`.
  - The `<title>` is "Free DPDPA Readiness Assessment — 3 Minutes", while the H1 and trust row say "3–5 minutes". The title and description are what SERPs and AI snippets read first (G3, A3), and the spec leaves them untouched.
  - The trust row already says "No payment required", "Takes 3–5 minutes".
  - After this change, the duration, legal-advice and "what you get" claims would exist in three or four places with no drift guard. That is the exact pattern line 90 rejects.
- **Fix:**
  - Bring the `sr-only` blocks into scope: fold them into the visible FAQ, or justify keeping them.
  - Add the title and meta description to G3's behaviour and an AC, using the same derived count.
  - Say whether the offer line replaces or edits the trust chips.
  - Add "all duration and question-count claims on /assessment agree" to K1.

### M6 — An existing, localized assessment FAQ set is not considered
- **Lenses:** codebase-details
- **Lines:** 22–23, 78
  - L78: "| Assessment offer copy and FAQ | Static copy in the repository, per locale |"
- **Problem:** `lib/data/faqs.ts:119–166` already holds category "assessment" items f016–f022 ("Do I need to give an email address?", "Is this formal legal advice?" …).
  - They have a Hindi overlay (`lib/data/i18n/faqs.hi.ts`).
  - They are shown on the homepage, and `/faq` publishes them as FAQPage.
  - A new list creates a second copy that can drift, publishes near-duplicate Q&A on two URLs, and needs new Hindi copy (O1) that already exists.
  - f019 also says "nothing is sent to us unless you … request the full report", which the `surveyComplete` analytics event (with score, band, sector) contradicts. That is a K1 concern if f019 is reused.
- **Fix:** add an Alternatives row "Reuse f016–f022 and the hi overlay (inject the derived count)", and choose it or reject it with a reason. Point K5/AC13 at the chosen source.

### M7 — AC8 already passes: the Rules guide links to the checklist from its sidebar, and "article body" has no markup
- **Lenses:** codebase-details, zoom-out
- **Lines:** 15–17, 151, 157
  - L151: "then: its article body contains one prose line with a link to /compliance-checklist whose anchor text includes "compliance checklist""
  - L157: "then: its article body contains the same line and link as AC7"
- **Problem:**
  - The Rules guide renders `topicNav` on the server (`dpdp-rules-2025-plain-english-guide/page.tsx:204–216`). It includes `href: "/compliance-checklist"`, label "Compliance Checklist (90 Controls)" (`lib/learnNav.ts:18`).
  - Neither the Act page nor the Rules guide has an `<article>` element.
  - Meanwhile the site header mounts only the open nav panel (`components/layout/Header.tsx:522–537`), so the header's checklist entry never reaches server HTML on any page. That is the same root cause as the accordion, and it is not listed as an alternative.
- **Fix:**
  - Name the existing sidebar link.
  - Define "article body" as a concrete container, or a marker such as `data-crosslink="compliance-checklist"`, and make AC7/AC8 match that marker so they fail today. Say "exactly one".
  - Add an Alternatives row for rendering closed header panels with `hidden`, and say why it was chosen or deferred.

### M8 — Industry link placement contradicts the chosen link style, and the "13th industry" promise is false
- **Lenses:** comprehension, design, zoom-out, style
- **Lines:** 91–92, 163
  - L91: "One shared line rendered by the block every industry page already shows"
  - L163: "a 13th industry added later gets it without a separate edit"
- **Problem:**
  - `DataFlowPreview` is a dark navy card (`bg-navy-700`) that ends in a button. A line inside it is the "card" style that L92 rejects, and the green-700 link recipe fails contrast there.
  - The component needs a `DataFlowPack`, and `sitemap.ts` keeps `dataMapSlugs` separate from `sectorSlugs`, so a new sector without a map gets no link.
  - The component is English-only.
  - AC9 drops the "prose line" requirement that AC7/AC8 keep.
  - The 13th-industry clause cannot be tested.
- **Fix:**
  - Say the line renders as its own paragraph after the navy card, inside the `<section>`, or from a component that does not depend on a flow pack.
  - Make AC9 require the same prose line as AC7.
  - Replace the 13th-industry clause with "rendered by the shared component; no industry page file has its own copy".

### M9 — AC11's phone viewport ignores two banners above the hero
- **Lenses:** codebase-details, design
- **Lines:** 173–175
  - L173: "given: the assessment page at a 1366×768 desktop viewport and a 390×844 phone viewport"
- **Problem:**
  - `<DiscoveryCrossLink />` and `<NoticeCrossLink />` render above SurveyClient (`assessment/page.tsx:47–50`). On mobile they are stacked `flex-col` cards of about 250 px each.
  - After them come `py-12`, the badge and a `text-4xl` H1. A line under the H1 lands around 850–900 px.
  - The first offer-like text a phone user sees is DiscoveryCrossLink's "Start here · Free · No email", which is about a different tool.
- **Fix:** name the banners and decide whether they may move or shrink on mobile, or whether the offer line goes above the H1. Add them to, or exclude them from, AC16's "unchanged" list.

### M10 — "Industry versions" claim, link and target do not agree
- **Lenses:** comprehension, style, zoom-out
- **Lines:** 21, 175, 228
  - L21: "and that industry-specific versions exist"
  - L175: "and links to the industry versions"
  - L228: "Default if unanswered: link to the existing industries hub."
- **Problem:**
  - The industry versions of the assessment live at `/assessment/<assessmentSlug>`. `/industries` is the guide hub.
  - Behavior asks for a statement, while AC11 asks for a link.
  - The same thing has four names: "industry versions", "industry assessment pages", "industries hub", "sector picker".
- **Fix:** pick one term and one target path that AC11 accepts. Either point the O2 default at a page listing the 12 sector assessments, or reword the claim to "industry guides".

### M11 — K1 is marked mitigated, but no criterion checks the offer claims are true
- **Lenses:** structural, style, comprehension
- **Line:** 100
  - "| K1 | … | Count derived from the questionnaire; claims checked against the flow before writing; human review of copy | mitigated | AC11, AC12 |"
- **Problem:** AC11 checks that the copy shows. AC12 checks the count. Nothing checks "no email / no account / instant" against the flow, and nothing catches drift after launch.
- **Fix:**
  - Add an AC: "completing the core questions with no email and no account shows the 0–100 score on the next screen" (the `gate.skipBasic` path).
  - Add intent A4 to "Tested by".
  - Set the status to planned/partial and name the reviewer.

### M12 — The performance requirements measure the wrong page and are not decidable
- **Lenses:** structural, style, comprehension, design, zoom-out
- **Lines:** 106, 215–217
  - L217: "The assessment page's Lighthouse performance score on the preview is within 5 points of production."
  - L216: "the checklist page's client JavaScript grows by no more than 5 KB gzipped."
- **Problem:**
  - K7 and intent A5 are about the larger checklist page, but only /assessment gets a Lighthouse check.
  - No direction ("no more than 5 lower"), form factor or run count is given. Lighthouse varies about 5 points between runs.
  - The JS limit protects nothing: `forceMount` costs HTML payload and hydration, not bundle size.
  - K7 points at "Non-functional" and stays "open".
- **Fix:**
  - Use the median of 3 mobile runs, no more than 5 points below production, for both `/compliance-checklist` and `/assessment`.
  - Replace the JS limit with a TBT/INP comparison on the checklist.
  - Give the non-functional items IDs (NF1–NF3) and point K7 at them.

### M13 — AC observables are undefined: "hidden", focus ring, whitespace normalisation
- **Lenses:** comprehension, style, structural, design
- **Lines:** 43, 59–60, 121, 168–169, 187
  - L43: "Closed sections carry the `hidden` attribute (or equivalent that removes them from the accessibility tree)."
  - L60: "on the page, character for character after whitespace normalisation."
  - L169: "is keyboard-focusable with a visible focus ring"
- **Problem:**
  - Under `forceMount`, Radix never sets `hidden`; hiding rests entirely on the Tailwind `data-[state=closed]:hidden` class, which a no-script HTML check cannot see.
  - AC10's "when: fetched without scripts" cannot check focus. AC2's accessibility-tree clause needs a browser.
  - "Whitespace normalisation" does not say whether entities are decoded or tags stripped. React writes `&#x27;` and `&amp;`, while JSON-LD holds raw text.
- **Fix:**
  - State the observable: "closed content carries `data-state="closed"` with the class that resolves to display:none, or the `hidden` attribute".
  - Split AC2 and AC10 into an HTML check and a manual browser check.
  - Define normalisation: decode entities, strip tags, collapse whitespace to one space, trim. Answers are plain text with no inline links.

---

## 🟡 Minor

1. **Baseline says 3 controls; 6 are rendered** (L215, "today 217 KB with 3 controls rendered"). `defaultValue` opens 1.1–1.3 and O1.1–O1.3. intent L12 repeats "3 of the 90". Correct the number, and note that the 217 KB already includes all controls once as flight data (B1). *(codebase-details)*
2. **No cheaper rendering alternative and no estimate behind 400 KB** (L89, L215). Consider server-rendered cards passed as children into a thin client accordion, so the text appears once and hydration stays small. Estimate about 1–1.5 KB × 87 cards. *(design)*
3. **Close animation concern is moot** (L11 "On screen the page looks as it does today"). The `accordion-up` / `accordion-down` keyframes are not defined anywhere in the repo (only referenced at `ChecklistContent.tsx:202`), so nothing animates today. Say so, so no one designs around it. Consider `hidden="until-found"` so find-in-page reaches closed controls. *(design, codebase-details; reconciled)*
4. **AC3 filter labels are not on the page** (L126, 'a visitor picks "Part 1" or "Part 2" in the filter'). The buttons are "All Controls", "Statutory & Rules" and "Operational Evidence" (`messages/en.json:826–828`). "Part" is never defined. Define the parts and the part/section/control hierarchy, and use the on-screen labels. *(comprehension, style)*
5. **AC3 baseline open-ended** (L127, "exactly as before this change"). List the observables, including that the mid-page CTA and the guardrails show only for certain filters (`ChecklistContent.tsx:535, 573`). *(structural, comprehension, style)*
6. **AC2 traces to G5 wrongly** (L118, "- traces: G1, G5"). Change it to G1. *(structural)*
7. **G5 "how it scores" has no AC** (L204). Add "score for a fixed answer set is unchanged" to AC16. *(structural)*
8. **AC2 is compound** (L120, "when: it first renders, and when a visitor clicks a section header"). Split it into initial state and toggle. *(structural)*
9. **AC14 baseline and slugs** (L193, "have no new FAQPage block from this work"). None exist today, so say "have no FAQPage block". The routes use `assessmentSlug` (recruitment, not recruitment-agencies, `sectors.ts:36`). Require HTTP 200. *(structural, comprehension, style, codebase-details)*
10. **AC15 reference disclaimer unnamed** (L199, "matching the disclaimer already on the page"). There are two candidates: the visible trust row "Educational, not legal advice" (`survey.landing.trust.educationalOnly`) and the sr-only sentence (`assessment/page.tsx:44`). Name the visible one, and say whether "matching" means the same meaning or the same words. Also retitle "honestly". *(comprehension, style, design, codebase-details)*
11. **AC15 trigger** (L198, "when: it is read"). Change it to "the assessment HTML is fetched". *(structural)*
12. **AC16 analytics events unnamed** (L205, "the same analytics events fire at the same steps"). Name them: `assessmentStart`, `assessmentStep(3)`, `assessmentStep(6)`, `surveyComplete`, `reportRequested`, `callBookingClicked` (`SurveyClient.tsx:595–649, 1423, 1566`). The new industry link has no event, so either accept that or add one. *(comprehension, codebase-details)*
13. **AC17 log check cannot fail** (L211, "with no missing-message errors in the server log"). Missing hi keys fall back to English silently (`i18n/request.ts:17–32, 46–49`). Check that the hi values exist and differ from en instead. *(codebase-details, comprehension)*
14. **AC12 has no test method** (L179, "given: the questionnaire gains or loses a core question"). State that a unit test covers it. *(comprehension)*
15. **AC13 does not say whether collapsed `<details>` count as visible** (L187, "it shows 4–6 questions with answers"). Require answers visible without interaction, with one `<h2>` and an `<h3>` per question. *(comprehension, design)*
16. **Sitemap lastmod vs page dateModified** (L34, "the same freshness date the learn pages use"). The checklist's article markup hard-codes `dateModified` "2026-04-01". Add `FRESHNESS.checklist` and use it in both places, or name `LEARN_UPDATED`. *(design, style, comprehension)*
17. **Hero is client-rendered** (L66, "turns the checklist data, the assessment copy and the FAQ list into HTML on the server"). The offer copy is in server HTML only because `step` starts at 0. Say so, and add an HTML check for the offer line. *(design)*
18. **No problem/goals section in the spec itself** (L4, "**Intent:** ./intent.md"). Add a short summary of G1–G5 and NG1–NG5 so the trace IDs resolve without opening intent.md. *(structural)*
19. **Open-question IDs clash with control IDs, and the deadline is late** (L227, "**O1 — …** Date: before T6 merges."). O1/O2 collide with control ids O1.x. The Hindi FAQ ships in T5/T7, before T6. Rename to OQ1/OQ2 and use a milestone. Also, AC17 has no "wording" for O1 to block. *(structural, style)*
20. **Labels and vocabulary.** L89–90 repeat the label "How crawlers get all controls". The Type column at L100–107 mixes categories. The same area is called "offer block", "top block", "top of the page" and "hero". Use one term each. *(structural, style)*
21. **Vague wording.** "first response" (L10), "present in the page" (L13), "short" (L16, L22), "as stored" (L41), "agent" (L82), "other audit maintenance items" (L223), "within" (L217). Make each specific; see the style notes. *(style)*
22. **Nits.**
    - L71 "builds the sitemap on request": the sitemap is probably built at build time or cached; say "at build or revalidation".
    - L51–57: `faqPageSchema` also emits `mainEntityOfPage`. Mark the contract keys as a minimum.
    - L31 and L50 code fences have no language tag.
    - The intent's success criterion covers only the checklist half (G3/G4 rely on A3).
    
    *(codebase-details, structural, zoom-out)*
