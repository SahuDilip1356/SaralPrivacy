# Spec — Readable checklist, findable from the law pages, and a clear free-assessment offer

**Status:** draft (revised after EGM review, 2026-10-27)
**Intent:** ./intent.md
**Date:** 2026-10-27

## Summary of intent

- G1 every checklist control is readable without interaction · G2 the checklist is findable from the sitemap and the law and industry pages · G3 the assessment states its offer in the first screen · G4 common assessment questions are answered visibly and in machine-readable form · G5 the assessment flow itself does not change.
- Not this cycle: new checklist content (NG1), questionnaire/scoring/consent changes (NG2), hreflang or Hindi sitemap entries (NG3), off-site outreach (NG4), new Rules guide content (NG5).

## Terms

- **Part:** the checklist has two parts. Part 1 is "Statutory and rule-based" (sections 1–15, 49 controls). Part 2 is "Operational evidence" (sections O1–O12, 41 controls). A part has sections, a section has controls, and each control has an id such as `1.1` or `O12.3`.
- **Page markup:** the HTML of a response with every `<script>` element and every element with class `sr-only` removed. Today all 90 controls already appear in the page's script data, but only 6 appear in its markup: `1.1`–`1.3` and `O1.1`–`O1.3`, the controls in the two sections open by default.
- **Normalised text:** decode HTML entities, strip tags, collapse runs of whitespace to one space, and trim.
- **Core question:** a questionnaire entry not marked optional. There are 10 today; Q11 and Q12 are optional. A visitor who answers "no" to Q3 skips Q4 and Q5 and sees 8.
- **Offer line:** one line at the top of the assessment page that states the offer.
- **Industry assessments:** the 12 sector versions of the assessment. All 12 are linked from the industries page, `/industries`.

## Behavior

Anyone who fetches the compliance checklist page, in English or Hindi, gets all
90 controls in the page markup. In a browser the page looks and works as it does
today. The first section of each part is open and the rest are closed. Clicking
a section header opens or closes it, and the three filter buttons work as
before. Closed sections are not visible and screen readers skip them. Nothing on
the page animates today, and that does not change.

The sitemap lists the checklist page. The Act page, the Rules guide and each of
the 12 industry pages carry one line of prose, marked as the checklist
cross-link, with a plain link to the checklist. It is the same line on every
page and every locale. The Rules guide's sidebar already links to the checklist;
that link stays, and the new line is added in the guide's body.

The assessment page opens with the offer line, above everything else on the
page, at every step. The line says the assessment is free, has up to 10 core
questions, needs no account and no email to see the score, and gives an instant
0–100 score. It also links to the industry assessments. The page title, the
trust row and the FAQ agree on how long it takes: 3–5 minutes. The visually
hidden text block the page ships today is removed. Its claims move into visible
text.

Below the assessment, the page shows six questions and answers taken from the
site's existing assessment FAQ. The same text is published as FAQ structured
data. The assessment component itself, meaning the authorization card, its
consent wording, every step, the scoring and the analytics events, is unchanged.

## Contracts

The only boundary contracts are what crawlers read.

Sitemap (`/sitemap.xml`), one new entry (at least these elements):
```xml
<url>
  <loc>https://saralprivacy.com/compliance-checklist</loc>
  <lastmod>ISO 8601 date, the learn pages' freshness date</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

Checklist page markup (`/compliance-checklist`, `/hi/compliance-checklist`):

- Each control renders as one element with `data-control-id="<id>"`.
- All 90 ids appear exactly once, and each control's requirement text appears inside its own element.
- A closed section's content element carries `data-state="closed"` and a class that resolves to `display: none` when closed.

Checklist cross-link (Act page, Rules guide, 12 industry pages, each also under `/hi/`):
```html
<aside data-crosslink="compliance-checklist"> … <a href="/compliance-checklist">…compliance checklist…</a> … </aside>
```
- Exactly one per page, present in the page markup.
- The anchor-text match is case-insensitive.
- The copy is English on every locale, and the href is the English URL on purpose (see Alternatives).

Assessment offer line (`/assessment`, `/hi/assessment`): one element with `data-offer="assessment"` in the page markup, before the first cross-link banner. It contains a link to `/industries`.

Assessment FAQ (`/assessment`, `/hi/assessment`):
- **Visible:** a `<section data-faq="assessment">` with one `<h2>`, then per item an `<h3 data-faq-q>` and a `<p data-faq-a>`. Every answer is visible without interaction.
- **Structured data:** exactly one FAQPage block. Its question names and answer texts equal the visible ones in order, after normalisation. Answers are plain text with no links. Minimum keys:
```json
{ "@context": "https://schema.org", "@type": "FAQPage",
  "inLanguage": "en-IN | hi-IN",
  "url": "https://saralprivacy.com/assessment",
  "mainEntity": [ { "@type": "Question", "name": "…",
                    "acceptedAnswer": { "@type": "Answer", "text": "…" } } ] }
```
The `url` is the English URL on both locales, because `/hi/assessment` declares the English canonical (NG3).

## System context

Parts by role:

- **The page renderer** turns the checklist data, the cross-link line, the offer line and the FAQ set into HTML on the server, per locale. The assessment's step-0 screen is a client component; it is in the server HTML only because the first step renders on the server. The offer line and FAQ do not depend on that.
- **The browser layer** adds interaction after load: opening and closing sections, the filter, and the assessment flow.
- **The sitemap generator** builds the sitemap at build or revalidation. It combines static entries with briefing and blog lists from the content store.
- **The analytics provider** (Google Analytics) receives the assessment's existing events. This work does not change them.
- **Crawlers** (Google, Bing, AI crawlers) read the HTML and the sitemap. They do not click.

| Data | Kept where | Leaves the machine? |
|---|---|---|
| Checklist controls | Static content in the repository | Yes, as public page HTML |
| Offer line copy | Static copy in the repository, per locale | Yes, public |
| Assessment FAQ | The existing FAQ set in the repository, with its Hindi overlay (one source for /faq, the homepage and /assessment) | Yes, public, as HTML and structured data |
| Sitemap entries | Generated; the new entry is static | Yes, public |
| Assessment answers, score events, consent | Unchanged by this work | Unchanged (score, band, role and sector go to analytics today) |

Trust boundaries: none new. All new content is first-party static copy. No user, agent or third-party input reaches any changed surface.

## Alternatives considered

| Choice | Chosen | Rejected, and why |
|---|---|---|
| How crawlers get all controls | Controls present in the page markup; sections stay collapsible | Every section open by default: changes the layout and turns 90 controls into a long scroll. A hidden text summary: a second copy that drifts, and hidden summaries read as cloaking |
| How closed controls stay out of view | A CSS rule on the closed state | The `hidden="until-found"` attribute, so find-in-page reaches closed controls: the accordion library does not support it. Revisit separately |
| Header menus (their closed panels are also missing from the HTML) | Out of scope this cycle | Render closed header panels hidden: a site-wide navigation change with its own accessibility review. Deferred |
| Cross-link URL on Hindi pages | The English URL, English copy | A locale-aware URL: no locale-aware link helper exists, and Hindi pages canonicalise to English (NG3), so this cycle brings no Hindi indexing gain either way |
| Where the industry cross-link sits | Its own line after the navy data-flow card, from the block every industry page shares | Inside the navy card: that is the card style rejected below, and the link colour fails contrast there. A separate edit in each of 12 page files: 12 places to drift |
| Link style | One line of prose in the content flow | A card or button: these pages already end in calls to action |
| Where the offer line sits | First element on the assessment page, above the banners, at every step | Under the hero heading: on a 390×844 phone, two banners push it to about 850–900 px, below the fold. Moving the banners: changes another tool's funnel |
| Where the FAQ shows | Below the assessment at every step | Step 0 only: means editing the assessment component, which G5 keeps untouched. The answers (email, legal advice) are useful mid-flow too |
| FAQ source | Reuse the existing assessment FAQ items and their Hindi overlay | A new FAQ list: a second copy of the same answers that drifts, and new Hindi copy for text that already has a translation |
| Which FAQ items | f016, f017, f018, f020, f021, f022 | f019 ("Does SaralPrivacy store my answers?"): its answer says nothing is sent before the report is requested, but score, band, role and sector go to analytics on completion (OQ3) |
| Why publish FAQ structured data | Machine readability for AI answers, Bing and other parsers (intent A3) | Expecting a Google FAQ rich result: since 2023 Google shows these only for well-known government and health sites (K9) |
| Question count in the copy | Derived from the questionnaire | Typed into the copy: goes stale the first time a question is added |

## Risks & mitigations

| # | Risk | Type | Mitigation | Status | Tested by |
|---|---|---|---|---|---|
| K1 | The offer copy claims something the flow does not do, or claims on /assessment disagree (duration, count, no email) | trust | Count derived from the questionnaire. One duration everywhere. The no-email claim tested on the real flow. Copy reviewed by Dilip. The step-to-question mapping in the flow is positional, so a new question needs a flow change as well as a data change | partial: AC14 and AC15 automated, AC21 manual | AC13, AC14, AC15, AC21; intent A4 |
| K2 | Rendering all controls breaks open/close or the filter | failure | Behaviour kept; explicit criteria | mitigated | AC2, AC3, AC4 |
| K3 | Closed sections reach screen readers as a wall of text | accessibility | Closed content is display:none | mitigated | AC2, AC3 |
| K4 | The authorization card or consent wording changes by accident | privacy | The assessment component file is not edited at all | mitigated | AC19 |
| K5 | FAQ structured data and visible text drift apart | failure | Both render from the one existing FAQ set | mitigated | AC16 |
| K6 | Hindi pages show English or break | failure | Offer line and FAQ have Hindi values that differ from English | mitigated | AC20 |
| K7 | Larger checklist HTML slows the page | latency | Size and performance limits | open | NF1, NF2, NF3 |
| K8 | Google ignores content in collapsed sections | search | Intent A1, with a two-week check | accepted | intent A1 |
| K9 | FAQ markup brings no Google rich result | search | Not the goal; published for machine readability | accepted | — |
| K10 | Hindi pages gain nothing in search this cycle (English canonical) | search | Out of scope (NG3) | accepted | — |
| K11 | The live f019 FAQ answer overstates what is not sent | trust, privacy | Excluded from /assessment; wording fix tracked separately | open | OQ3 |

## Acceptance criteria

### AC1 — All controls are in the English page markup
- traces: G1
- given: the deployed English checklist page
- when: it is fetched and reduced to page markup
- then: all 90 control ids appear exactly once as `data-control-id`, and each control's normalised requirement text is inside its element. The same check fails on the production HTML captured on 2026-10-27

### AC2 — Initial state: first section of each part open, the rest marked closed
- traces: G1
- given: the checklist page markup
- when: it is inspected
- then: the content of sections `1-1` and `2-O1` carries `data-state="open"`, every other section's content carries `data-state="closed"`, and each closed element carries the closed-state hiding class

### AC3 — Toggling works and closed content stays hidden (browser)
- traces: G1
- given: the checklist page in a browser
- when: a visitor clicks a closed section header, then clicks it again
- then: the section opens, then closes. While closed its controls are not visible, and a screen reader's element list does not include them

### AC4 — The filter behaves as before (browser)
- traces: G1
- given: the checklist page in a browser
- when: a visitor picks "Statutory & Rules", then "Operational Evidence", then "All Controls"
- then: "Statutory & Rules" shows only Part 1 sections and the mid-page call to action. "Operational Evidence" shows only Part 2 sections. "All Controls" shows both parts, the mid-page call to action and the key guardrails block. All of this matches production

### AC5 — All controls are in the Hindi page markup
- traces: G1
- given: the deployed Hindi checklist page
- when: it is fetched and reduced to page markup
- then: all 90 control ids appear exactly once, with localized requirement text, or English where no translation exists, as today

### AC6 — The sitemap lists the checklist once, with a date
- traces: G2
- given: the deployed site
- when: /sitemap.xml is fetched
- then: it contains exactly one `<loc>https://saralprivacy.com/compliance-checklist</loc>`, and that `<url>` has a `<lastmod>`

### AC7 — The checklist entry survives a content-store outage (inspection)
- traces: G2
- given: the briefing and blog lists cannot be fetched
- when: the sitemap is generated
- then: the checklist entry is still emitted, because it is a static entry outside the guarded fetches. Verified by reading the fetch guards, not by a test

### AC8 — The Act page carries the checklist cross-link
- traces: G2
- given: the Act full-text page
- when: it is fetched and reduced to page markup
- then: it contains exactly one checklist cross-link, as in Contracts

### AC9 — The Rules guide carries the checklist cross-link in its body
- traces: G2
- given: the Rules guide
- when: it is fetched and reduced to page markup
- then: it contains exactly one checklist cross-link. The existing sidebar link does not count toward this

### AC10 — Every industry page carries the cross-link from shared code
- traces: G2
- given: each of the 12 industry pages
- when: each is fetched and reduced to page markup
- then: each returns 200 and contains exactly one checklist cross-link. The line is rendered by the shared data-flow block, and no industry page file has its own copy

### AC11 — Cross-links are plain links on Hindi pages too
- traces: G2
- given: the Hindi versions of the 14 pages in AC8–AC10
- when: each is fetched and reduced to page markup
- then: each returns 200 and contains exactly one checklist cross-link with `href="/compliance-checklist"` and English copy

### AC12 — Cross-links are keyboard-reachable with a visible focus ring (browser)
- traces: G2
- given: /hi/learn/dpdp-act-2023 and one /hi/industries page in a browser
- when: a visitor tabs to the cross-link
- then: the link receives focus and shows a visible focus ring

### AC13 — The offer line is the first thing on the assessment page
- traces: G3
- given: /assessment
- when: it is fetched and reduced to page markup, and when it is loaded at 1366×768 and at 390×844 before any scroll
- then: the markup has exactly one `data-offer="assessment"` element before the first cross-link banner. Its normalised text states: free; up to the core question count; no account and no email needed to see the score; an instant 0–100 score. It links to `/industries`. At both viewports the line is fully visible without scrolling

### AC14 — The question count cannot drift
- traces: G3
- given: the questionnaire gains or loses a core question
- when: the unit tests run
- then: the count in the offer line equals the number of non-optional questionnaire entries, checked by a test that reads the questionnaire, not a fixed number

### AC15 — Duration claims on the assessment page agree
- traces: G3
- given: /assessment
- when: its `<title>`, meta description, trust row and FAQ are read
- then: every duration mentioned is "3–5 minutes", the text "3 Minutes" no longer appears, and the page has no element with class `sr-only` carrying offer or FAQ text

### AC16 — The FAQ is visible and matches its structured data
- traces: G4
- given: /assessment
- when: it is fetched
- then: it shows the six items f016, f017, f018, f020, f021, f022 in that order, with one `<h2>` and one `<h3>` per question. Their normalised question and answer texts equal the FAQPage block's, in order

### AC17 — Exactly one FAQPage block on the assessment page, none on the industry assessments
- traces: G4
- given: /assessment, /hi/assessment and the 12 industry assessment pages
- when: each is fetched
- then: each returns 200. The two assessment pages each have exactly one FAQPage block that parses as JSON. The 12 industry assessment pages have none

### AC18 — The FAQ answers the legal-advice question
- traces: G4, G3
- given: /assessment
- when: it is fetched
- then: the FAQ includes f022 ("Is this formal legal advice?"), whose answer says SaralPrivacy is an education and readiness platform and not a law firm. That has the same meaning as the visible trust-row chip "Educational, not legal advice"

### AC19 — The assessment component, consent and analytics are unchanged
- traces: G5
- given: the branch and origin/main
- when: the assessment component file and its consent message keys are compared
- then: the component file is byte-identical. The authorization card text, its options, the steps and the scoring for a fixed answer set are unchanged. The events `assessmentStart`, `assessmentStep(3)`, `assessmentStep(6)`, `surveyComplete`, `reportRequested` and `callBookingClicked` fire at the same steps as on production

### AC20 — The Hindi assessment page shows Hindi copy
- traces: G3, G4
- given: /hi/assessment
- when: it is fetched
- then: the offer line and every FAQ question and answer have Hindi values that differ from the English ones, and the FAQPage block declares `inLanguage` `hi-IN`

### AC21 — The no-email claim is true on the real flow (browser)
- traces: G3
- given: a fresh browser with no account
- when: a visitor completes the core questions and skips the email step
- then: the next screen shows the 0–100 score and risk category, with no account created and no email entered

## Non-functional

- **NF1:** the English checklist page HTML is at most 400 KB uncompressed. It is 217 KB today, measured on production on 2026-10-27, and already includes all controls once as script data.
- **NF2:** the Lighthouse mobile performance score, as the median of 3 runs on the preview deploy, is no more than 5 points below production on both /compliance-checklist and /assessment.
- **NF3:** the median Total Blocking Time on /compliance-checklist is no more than 100 ms above production, measured in the same 3 runs.

## Out of scope

- Everything in intent non-goals NG1–NG5.
- The checklist's own hidden `<h1>` summary (`sr-only`), which stays this cycle.
- The "score yourself" bridge from the checklist to the assessment: it already exists as the mid-page call to action.
- The dead cross-border blog URL and the other maintenance items in the SEO audit.
- Header menu panels missing from the server HTML (see Alternatives).

## Open questions

- **OQ1 — Hindi offer line sign-off.** Owner: Dilip. Due: before the assessment-page task merges. Blocks AC20's wording, not its check. The FAQ already has reviewed Hindi.
- **OQ2 — Where "industry assessments" links.** Resolved 2026-10-27: `/industries`, which links all 12 industry assessments (checked on production).
- **OQ3 — f019 overstates what is not sent.** Its answer says "nothing is sent to us unless you … request the full report". The `survey_complete` analytics event sends score, band, role and sector on completion. Owner: Dilip. Due: 2026-11-03, as a separate fix to the FAQ data (en and hi). It does not block this chain; f019 is excluded here.
