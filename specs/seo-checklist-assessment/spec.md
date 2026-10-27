# Spec — Readable checklist, findable from the law pages, and a clear free-assessment offer

**Status:** draft
**Intent:** ./intent.md
**Date:** 2026-10-27

## Behavior

Anyone who fetches the compliance checklist page, in English or Hindi, gets all
90 controls in the first response. On screen the page looks as it does today:
the first section of each part is open, the rest are closed, and clicking a
section opens or closes it. Closed sections are hidden from view and from
screen readers but are present in the page.

The sitemap lists the checklist page. The Act page, the Rules guide and each of
the 12 industry pages carry one short line of prose with a plain link to the
checklist.

The top of the assessment page states the offer in the first screen: free, the
number of core questions, no account and no email needed to see the score, an
instant 0–100 score, and that industry-specific versions exist. Below the
existing content the page shows a short FAQ, and the same questions and
answers are published as FAQ structured data. Everything from the
authorization card onwards, and every step of the assessment, is unchanged.

## Contracts

The only boundary contracts are what crawlers read.

Sitemap (`/sitemap.xml`), one new entry:
```
<url>
  <loc>https://saralprivacy.com/compliance-checklist</loc>
  <lastmod>ISO 8601 date, the same freshness date the learn pages use</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

Checklist page HTML (`/compliance-checklist`, `/hi/compliance-checklist`):
every control's id (1.1 … and O1.1 … as stored) and requirement text appear in
the response body before any script runs. Closed sections carry the `hidden`
attribute (or equivalent that removes them from the accessibility tree).

Cross-link (Act page, Rules guide, 12 industry pages):
`<a href="/compliance-checklist">` with anchor text containing
"compliance checklist", present in the server HTML.

Assessment page (`/assessment`), FAQ structured data, exactly one block:
```
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "FAQPage",
  "inLanguage": "en-IN" | "hi-IN",
  "url": "https://saralprivacy.com/assessment",
  "mainEntity": [ { "@type": "Question", "name": string,
                    "acceptedAnswer": { "@type": "Answer", "text": string } } ] }
</script>
```
4 to 6 questions. Each `name` and `text` equals the visible question and answer
on the page, character for character after whitespace normalisation.

## System context

Parts by role:

- **The page renderer** turns the checklist data, the assessment copy and the
  FAQ list into HTML on the server, per locale.
- **The browser layer** adds interaction after load: opening and closing
  sections, the part filter, the assessment flow.
- **The sitemap generator** builds the sitemap on request from static entries
  plus live briefing and blog lists from the content store.
- **Crawlers** (Google, Bing, AI crawlers) read the HTML and sitemap. They do
  not click.

| Data | Kept where | Leaves the machine? |
|---|---|---|
| Checklist controls | Static content in the repository | Yes, as public page HTML |
| Assessment offer copy and FAQ | Static copy in the repository, per locale | Yes, as public page HTML and structured data |
| Sitemap entries | Generated per request; the new entry is static | Yes, public |
| Assessment answers and consent | Unchanged by this work | Unchanged |

Trust boundaries: none new. All new content is first-party static copy; no
user, agent or third-party input reaches any changed surface.

## Alternatives considered

| Choice | Chosen | Rejected, and why |
|---|---|---|
| How crawlers get all controls | Present in the page, sections stay collapsible | Show every section open by default: changes the layout and makes a 90-control page a long scroll for people |
| How crawlers get all controls | Real page content | A hidden text summary of all controls: duplicates the content in two copies that can drift, and hidden summaries read as cloaking |
| Where the checklist link sits on industry pages | One shared line rendered by the block every industry page already shows | A separate edit on each of 12 pages: 12 places to drift |
| Link style | One line of prose in the article flow | A card or button: these pages already end in calls to action; another reads as an ad |
| FAQ placement | Visible on the page, after the existing content, with matching structured data | Structured data only: search engines require the answers to be visible, and a mismatch can lose the rich result |
| Question count in the copy | Derived from the questionnaire itself | Typed into the copy: goes stale the first time a question is added |

## Risks & mitigations

| # | Risk | Type | Mitigation | Status | Tested by |
|---|---|---|---|---|---|
| K1 | The offer copy claims something the flow does not do (e.g. "no email" when one becomes required) | failure (trust, brand) | Count derived from the questionnaire; claims checked against the flow before writing; human review of copy | mitigated | AC11, AC12 |
| K2 | Rendering all controls breaks the open/close or filter behaviour | failure | Behaviour kept as today; explicit criteria for both | mitigated | AC2, AC3 |
| K3 | Closed sections become visible to screen readers as a wall of text | accessibility | Closed content removed from the accessibility tree | mitigated | AC2 |
| K4 | The assessment's authorization or consent wording changes by accident while editing the top block | privacy | Criterion pins the card and flow as unchanged; human review | mitigated | AC16 |
| K5 | FAQ structured data and visible text drift apart later | failure (search) | Both rendered from one list | mitigated | AC13 |
| K6 | Hindi pages break on missing copy | failure | Hindi copy shipped with English; render check on Hindi | mitigated | AC17 |
| K7 | Larger checklist HTML slows the page | latency | HTML size limit below | open | Non-functional |
| K8 | Google ignores content in collapsed sections | search | Assumption A1 with a two-week check | accepted | intent A1 |

## Acceptance criteria

### AC1 — All controls are in the English page HTML
- traces: G1
- given: the deployed English checklist page
- when: it is fetched without running scripts
- then: the response body contains all 90 control ids and each control's requirement text

### AC2 — Sections still open and close, and closed ones stay hidden
- traces: G1, G5
- given: the checklist page loaded in a browser
- when: it first renders, and when a visitor clicks a section header
- then: only the first section of each part is open on load; a click toggles that section; closed sections are not visible and are absent from the accessibility tree

### AC3 — The part filter still works
- traces: G1
- given: the checklist page in a browser
- when: a visitor picks "Part 1" or "Part 2" in the filter
- then: only that part's sections are shown, exactly as before this change, and "All" restores both

### AC4 — All controls are in the Hindi page HTML
- traces: G1
- given: the deployed Hindi checklist page
- when: it is fetched without running scripts
- then: the response body contains all 90 control ids with their localized requirement text, or the English text where no translation exists, as today

### AC5 — The sitemap lists the checklist once
- traces: G2
- given: the deployed site
- when: /sitemap.xml is fetched
- then: it contains exactly one `<loc>https://saralprivacy.com/compliance-checklist</loc>` with a lastmod date

### AC6 — The sitemap still lists the checklist when the content store is down
- traces: G2
- given: the briefing and blog lists cannot be fetched
- when: /sitemap.xml is requested
- then: the sitemap still renders with its static entries, including the checklist, as it does today for the other static pages

### AC7 — The Act page links to the checklist
- traces: G2
- given: the Act full-text page
- when: it is fetched without scripts
- then: its article body contains one prose line with a link to /compliance-checklist whose anchor text includes "compliance checklist"

### AC8 — The Rules guide links to the checklist
- traces: G2
- given: the DPDP Rules 2025 guide
- when: it is fetched without scripts
- then: its article body contains the same line and link as AC7

### AC9 — Every industry page links to the checklist
- traces: G2
- given: each of the 12 industry pages
- when: each is fetched without scripts
- then: each contains a link to /compliance-checklist with anchor text including "compliance checklist"; a 13th industry added later gets it without a separate edit

### AC10 — Cross-links are plain, crawlable links on every locale
- traces: G2
- given: the pages in AC7–AC9, in English and Hindi
- when: fetched without scripts
- then: the link is a plain anchor in the server HTML, not inserted by script, and is keyboard-focusable with a visible focus ring

### AC11 — The assessment states its offer in the first screen
- traces: G3
- given: the assessment page at a 1366×768 desktop viewport and a 390×844 phone viewport
- when: it first loads, before any scroll
- then: the visible text states that it is free, the number of core questions, that no account and no email are needed to see the score, that the score is 0–100 and instant, and links to the industry versions

### AC12 — The question count cannot drift
- traces: G3
- given: the questionnaire gains or loses a core question
- when: the page is rebuilt
- then: the number in the offer copy and in the FAQ changes with it, with no copy edit

### AC13 — The FAQ is visible and matches its structured data
- traces: G4
- given: the assessment page
- when: it is fetched without scripts
- then: it shows 4–6 questions with answers, and contains one FAQPage block whose question names and answer texts equal the visible ones after whitespace normalisation

### AC14 — Exactly one FAQ block, valid, and only on the assessment page
- traces: G4
- given: the assessment page and the 12 industry assessment pages
- when: each is fetched
- then: the assessment page has exactly one FAQPage block that parses as JSON, and the industry assessment pages have no new FAQPage block from this work

### AC15 — The FAQ answers the legal-advice question honestly
- traces: G4, G3
- given: the FAQ
- when: it is read
- then: one question asks whether the result is legal advice, and its answer says the assessment is educational and not legal advice, matching the disclaimer already on the page

### AC16 — The authorization card and the assessment flow are unchanged
- traces: G5
- given: the assessment page before and after this change
- when: the authorization card, its consent wording and options, and every assessment step are compared
- then: they are identical in text, order and behaviour; the same analytics events fire at the same steps

### AC17 — The Hindi assessment page renders the new copy
- traces: G3, G4
- given: /hi/assessment
- when: it is fetched
- then: it renders the offer block and FAQ in Hindi with no missing-message errors in the server log, and the FAQ block declares inLanguage hi-IN

## Non-functional

- The English checklist page HTML is at most 400 KB uncompressed (today 217 KB with 3 controls rendered, measured on production 2026-10-27; re-measured on the preview deploy).
- No new client-side dependencies; the checklist page's client JavaScript grows by no more than 5 KB gzipped.
- The assessment page's Lighthouse performance score on the preview is within 5 points of production.

## Out of scope

- Everything in intent non-goals NG1–NG5.
- The "score yourself" bridge from the checklist to the assessment: it already exists as the mid-page call to action.
- Fixing the dead cross-border blog URL and other audit maintenance items.

## Open questions

- **O1 — Who signs off the Hindi offer copy and FAQ?** Owner: Dilip. Date: before T6 merges. Blocks AC17's wording, not its rendering.
- **O2 — Link to the industry versions: the industries hub or a sector picker on the assessment page?** Owner: Dilip. Date: before T6 starts. Blocks AC11's last clause. Default if unanswered: link to the existing industries hub.
