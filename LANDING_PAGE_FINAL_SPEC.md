# Homepage — final spec

_Normative. Branch `claude/landing-page-11-elements-htz97i`. Written against the dev head (`bb97567`), not the live site._

**Supersedes for the homepage only:** the 10-beat structure in `LANDING_PAGE_MASTER.md §4`. Everything else in that file — brand tokens, the conversion ladder, the "carried over / must keep" list — still stands. `LANDING_PAGE_STRUCTURE.md §3c` (brand tokens) remains canonical.

**Inputs merged here:** the 11-element brief · `LANDING_PAGE_11_ELEMENTS_ANALYSIS.md` (what already exists) · `LANDING_PAGE_RHYTHM_FIX.md` (why it reads flat) · `saralprivacy-brand` voice rules.

---

## 1. The locked decisions

1. **The homepage has one job: start the assessment.** Every other action is subordinate — Discovery is an escape hatch, the guide is for education-intent, the newsletter leaves the page body entirely.
2. **Twelve sections become ten, with three navy bands instead of two.** On this palette the best light tint separates at 1.26:1 and navy at 17.3:1 — dark is the only mechanism with range, so the count of dark bands *is* the rhythm budget.
3. **The one-canvas position holds.** No alternating white/cloud/teal fills. Rhythm comes from navy bands + an enforced padding ladder + section hairlines.
4. **Press proof appears twice** — a thin rail under the hero (anxiety) and inside the recognition band (authority). This is a deliberate amendment to the brief, which moved it; the W-wave moved it down for a stated reason and both jobs are real.
5. **The sector wall collapses to three tabs, but keeps a compressed 12-name link row** — the wall carries 24–36 internal links governed by `INTERNAL_LINKING_SPEC.md`, and three tabs alone would drop them.
6. **No invented proof.** No customer names, percentages, or testimonials until permissioned evidence exists. Founder credentials and real press URLs are the substitutes.

---

## 2. The page

| # | Section | Component | Fill | Type / padding | Width | Eyebrow | Primary action |
|---|---|---|---|---|---|---|---|
| S1 | Hero | `HeroSection` | **navy-700** | own layout | 7xl | `Free DPDPA readiness check · 3–5 minutes` | **Take free assessment** (green) |
| S2 | Proof rail | `PressProofStrip variant="rail"` | **deep** | RAIL `py-10` | 6xl | — | none |
| S3 | Where risk hides | `WhereRiskHides` | white | STATEMENT `py-32` | 7xl | `The everyday data ecosystem` | — |
| S4 | Report preview | `ReportPreview` | white | DEMO `py-24` | 6xl | `Your report` | **Get my real score** (green) |
| S5 | Recognition band | `RecognitionBand` | **navy-700** | DECISION `py-16` | 6xl | `Who's behind this` | **Take free assessment** (green) |
| S6 | How it works | `HowItWorks` | white | UTILITY `py-20` | 3xl | `How it works` | text link |
| S7 | Sector examples | `AudienceCards` | white | EVIDENCE `py-16` | 6xl | `Your sector` | tab-scoped teal link |
| S8 | Resources | `ResourcesSection` | **deep** | UTILITY `py-20` | 6xl | `Learn more` | none |
| S9 | FAQ | `FAQPreview` | **deep** | EVIDENCE `py-16` | 3xl | `Before you start` | none |
| S10 | Final CTA | `FinalAssessmentBand` | **navy-700** | DECISION `py-16` | 3xl | — | **Take free assessment** (green) |

### The three light-fill decision

`cloud-50` is retired from this page. Measured against white: cloud-50 **1.05:1**, cloud-100 **1.12:1**, cloud-200 **1.28:1**, cloud-300 **1.59:1**, navy-700 **17.31:1**. W1.3 was right that cloud-50 cannot separate sections and wrong to generalise that to the whole ramp — 1.28:1 is exactly the ratio `Surface` already trusts as a card hairline, and area discrimination is an easier perceptual task than the small-text legibility WCAG ratios are calibrated for.

So: **white ↔ cloud-200 ("deep")**, and three jobs get three mechanisms.

| Mechanism | Marks | |
|---|---|---|
| Fill | the group | navy = chapter · white ↔ deep = sub-group |
| Padding | the beat | the type ladder |
| Hairline | the boundary | between two beats that share a fill |

Adjacent sections may share a fill when they are one thought — the demo pair (S3+S4), the process/sector pair (S6+S7), the reference pair (S8+S9). Flipping every section is the zebra W1.3 killed, just louder.

Two ink rules follow from the deeper fill: **`green-700` drops to 4.29:1 on it and must step to `green-800`** (6.01:1), and `slate-400` is 2.00:1 and is banned there as on any light fill. Cards on a deep section take `onDeep` on `Surface`, which steps their border to cloud-300 (1.24:1, where it sat on white).

Chapters: **S1–S4** (understand), **S5–S7** (trust + fit), **S8–S10** (resolve + convert).

**Measured after build:** 8,624 desktop px, down from ~11,500 — a 25% reduction, short of the 6,500–7,500 target. The three longest sections are S3 (1,177px), S4 (1,088px) and S9 (1,079px), and all three are earning their height. Closing the rest of the gap means cutting content, not padding; that is a separate decision.

---

## 3. Section specs

### S1 — Hero

**Job:** explain the value in five seconds and offer one action.

- Eyebrow: `Free DPDPA readiness check · 3–5 minutes` — the DPDP-Rules alert line is retired from the hero (it competes with the promise; it belongs in Briefings).
- H1: **`Get your DPDPA readiness score in 3–5 minutes`** — replaces `See exactly where your business stands on DPDPA`. Sentence case. One hard promise.
- Subhead: `See your top gaps, first fixes, and a sector-specific action plan for your Indian business — in plain English.`
- **Selector: four chips, not twelve.** `Recruitment agency` · `CA firm` · `D2C brand` · `Other business`. The first three map to `HERO_VERDICTS` entries `recruitment`, `ca-firms`, `d2c-brands`. `Other business` sets no slug and routes to `/assessment` (the generic pack, which exists and works) — it must **not** render a sector verdict card, because the generic pack doesn't produce one. Show the sample card instead.
- Primary CTA: `Take free assessment` → `/assessment/{slug}` or `/assessment`.
- Friction row (unchanged): `Free · 3–5 minutes · No email to start · Plain English · Not legal advice`.
- Escape hatch (unchanged): `Not sure what personal data you hold? Map it first →`.
- Right panel: keep the sample-verdict card. It stays a **teaser**, not the report — S4 owns the full report and duplicating it makes S4 read as déjà vu. That dedupe rule from `VerdictPreview.tsx:10-13` still governs.

**Verified:** "No email to start" is accurate — `SurveyClient.tsx` asks for email only after the score, and it is optional.

**Acceptance:** all 12 sectors remain reachable from S7 · `hero_sector_select` still fires · `Other business` reaches a working report.

### S2 — Proof rail

**Job:** kill trust anxiety immediately, in one band, without a third trust section.

New `variant="rail"` on `PressProofStrip` — one row, ~90px total, no cards:

```
Featured in: ANI · Business Standard · The Tribune · Lokmat Times · Latestly
12 sector-specific assessments · 3–5 minutes · No email to start · Built for Indian workflows
```

All five press URLs already exist and are real (`PressProofStrip.tsx:6-29`).

**Removed from this position:** briefing count and `17 templates`. Those measure our publishing activity, not the visitor's risk of starting. They move to S8. This retires `TrustStrip`'s stats block; the four "why us" pillars from `TrustStrip.tsx:15-40` move into S5.

### S3 — Where risk hides *(and the interactive upgrade)*

**Job:** help the visitor recognise their own problem. This is the page's product demonstration.

Keep the existing scatter — it already *is* the brief's "everyday data ecosystem" (WhatsApp, Drive, Sheets, CRM, email, CCTV, archives, vendors). **Do not build a separate ecosystem rail; it would duplicate this beat.** Add `Payment tools` and `Website forms` to `WhereRiskHides.tsx:28-37`.

Heading stays: `Follow the data. The risk becomes visible.`

**The upgrade (R2):** make it clickable. Six selectable risk areas — `Collection and notice` · `Consent` · `Sharing and vendors` · `Access and security` · `Retention and deletion` · `Breach readiness` — driving an adjacent evidence card:

```
CA firm
Workflow      Client PAN and Aadhaar files shared through email and Drive
Likely gap    Former staff may retain access
First fix     Review shared-folder access and remove inactive accounts
```

Data: new `lib/data/workflow-risks.ts` — 6 risk areas × 3 sectors = 18 entries. Illustrative, labelled as such.

Fold the `AnswerBlock` ("What is DPDPA?") into the foot of this section rather than leaving it as its own strip. `speakableSchema` targets `.answer-block` by class, not position, so it moves freely — verify the schema still resolves after the move.

**Acceptance:** selection updates the card with no layout shift · keyboard operable · `prefers-reduced-motion` renders the composed state · the section still renders server-side for SEO.

### S4 — Report preview

**Job:** demonstrate the product before asking for anything. This is the most visually substantial section on the page.

Promote `VerdictPreview` from `max-w-3xl` card to a `max-w-6xl` section. Three sector tabs (Clinic · CA firm · D2C — from `VERDICT_PREVIEWS`). Show all six deliverables, because **all six are real** and already listed in the product at `SurveyClient.tsx:731-738`:

- Readiness score `0–100` (reuse `ScoreDial`)
- Risk category / band
- Five dimension scores (the existing category bars)
- Top three gaps — *currently only one; extend `verdict-previews.ts` to three per sector*
- First three recommended actions — *new field*
- Checklist preview + `Option to email your full report`

Keep the `Sample · illustrative` pill on every variant. CTA: `Get my real score` → `/assessment/{slug}`.

**Acceptance:** nothing claimed here that the real report doesn't produce · tab swap causes no CLS · sample labelling visible in every state.

### S5 — Recognition band *(new)*

**Job:** the mid-page attention reset, and the authority beat.

Navy-700. Contains:

- The four "why us" pillars, relocated from `TrustStrip` (educational not alarmist · practical and actionable · built for Indian businesses · not legal advice).
- Founder proof: `Dilip Sahu · Chartered Accountant · IIM Bangalore alumnus · 22+ years in enterprise systems`, with the existing quote from `FounderProof.tsx:31-36`.
- Press marks, repeated compactly (`PressProofStrip variant="compact"` already renders on navy).
- One green CTA: `Take free assessment`.

**Build note — correcting an earlier claim of mine:** `FounderProof` is *not* unrendered. It was deliberately moved to `/about` in Phase 2 and restyled as a light **card** (`app/about/page.tsx:59`). It cannot be dropped onto navy as-is — `bg-white rounded-xl border-slate-200` on navy is wrong, and slate-on-navy is a forbidden pairing. Either add a `variant="navy"` or compose a new `RecognitionBand` that reuses the credential data. Do not regress the About page.

**Not permitted here:** invented customer quotes, made-up percentages, anonymous praise, or a logo wall we lack permission for. When a permissioned operator story exists, it slots in as a fourth element (R3).

### S6 — How it works

**Job:** reduce perceived effort. Three steps, not four products.

```
1. Choose your industry
2. Answer practical workflow questions
3. Get your score, top gaps and first fixes
```

The existing `Discover → Map → Assess → Fix` spine (`HowItWorks.tsx:42-95`, 417 lines) drops below the three steps under the heading **`Continue after your assessment`**, rendered as a quiet row of links, not a numbered journey. The current build makes the 3-minute assessment look like step 3 of 4 — that is the specific misread this section exists to remove.

Keep all four destinations live and keep `hiw_step_click`.

### S7 — Sector examples

**Job:** prove sector relevance without a 2,100px wall.

Three tabs: `Recruitment agencies` · `CA firms` · `D2C brands`. Each updates: common personal data held · a recognisable workflow · the highest-priority gap · a sample score · the assessment link.

Then, **kept deliberately**: a compressed plain-text row of all 12 sector names linking to `/industries/*`, ~80px, plus `Explore all 12 industries →`. This preserves the internal linking the 12-card wall was carrying. The per-sector colour system and the 12 detailed cards move to the Industries hub.

**Acceptance:** homepage → `/industries/*` link count does not fall · flow-map links (`FLOW_HREFS`) survive for live sectors · section height ≤ 700px.

### S8 — Resources

**Job:** serve education-intent visitors without competing with the assessment.

Exactly three cards, one short description and a quiet text link each:

- **Complete DPDPA guide** → `/white-paper`
- **Latest practical briefing** → newest from Appwrite
- **Template library** → `/resources`

Replaces `BriefingsSection` (7-card deck) + `WhitePaperSection` (9-row table of contents) — roughly 2,500px doing 400px of work. The briefing feed and the guide's contents live on their own pages. The counts removed from S2 (`{n} briefings`, `17 templates`) belong here, as card subtext.

**No green CTA in this section.** Green stays rationed for the assessment.

### S9 — FAQ

**Job:** resolve the last hesitation before the close.

Replace `faqs.slice(0, 5)` — which returns general DPDPA definitions — with a homepage-specific objection set in `lib/data/faqs.ts` (new `homepageFaqIds` array, so `/faq` keeps the full library):

1. Does DPDPA apply to a small business?
2. What information do I need to enter?
3. Do I need to give an email?
4. What will my report contain?
5. Does SaralPrivacy store my answers?
6. How accurate is the result?
7. What happens after the assessment?
8. Is this legal advice?

Answers must be operationally true — Q3 and Q5 in particular are checkable against `SurveyClient.tsx` and `/api/assessment`. Verify before writing them.

Keep `Browse all {n} FAQs →` as a quiet link, not a green button.

### S10 — Final assessment band

**Job:** close.

Navy-700, centred, nothing else in it:

```
Know your gaps. Fix what matters. Signal trust.

        [ Take free assessment ]

     Free · 3–5 minutes · No email to start
```

The headline is an approved brand line. **The newsletter leaves the page body** — move `NewsletterSection` into the footer as a compact single-field form, and keep the full consent-correct version on `/briefings` and `/subscribe`. Consent handling must not regress: the checkbox stays un-prechecked, the Privacy Notice link stays, `/api/subscribe` is unchanged.

---

## 4. Design system rules

**Surfaces.** Only two page-level fills: `navy-700` and `cloud-50`. Card depth continues to come from `Surface` rungs. Add `border-t border-pearl-100` to every light section — a 1.28:1 hairline is weak as a fill and strong as an edge, which is the argument `Surface.tsx` already makes at card scale.

**Eyebrows.** Every section except S1, S2 and S10 opens with `text-xs font-medium uppercase tracking-[0.08em] text-slate-600`. Four sections currently start cold (TrustStrip, Briefings, WhitePaper, FAQ) — that is a chapter marker missing, and it's one line each.

**Green rationing.** Exactly four filled green CTAs on the page: S1, S4, S5, S10 — one per chapter plus the hero. Everything else is a text link or a teal-800 quiet link. This continues W6.

**Motion.** Scroll-triggered, play once, `prefers-reduced-motion` → composed state. Engagement comes from the reader steering (S3, S4, S7), not from things sliding in. No new motion until mobile CWV is measured against LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.

**New lint rule — `section-rhythm`.** Add to `scripts/design-lint.sh` (ratchet style, matching the existing baselines in `scripts/design-lint.baseline.d/`): fail when two adjacent homepage sections share a padding value. The padding ladder was specified in W1.3 and never enforced, which is exactly how it drifted to `16/16/32/24/16/16/20/10/20/20`. A primitive nothing enforces gets zero adoption — the script's own comment at line 84 makes this point.

**Two brand reconciliations to confirm with Dilip:**
- The brand doc locks CTAs to *Verification Green background + white label*. On navy the hero uses `green-400` + `navy-950` (9.72:1) because white-on-green-500 fails contrast there. The measured accessibility choice should win; the brand doc should be amended to say "white label on light surfaces, navy label on dark."
- The brand CTA table shows `Take Free Assessment` (title case); the shipped nav uses `Take free assessment` (`navigation.ts:201`) per the sentence-case rule. Sentence case is the more recent decision and is consistent across 77 pages — recommend the brand doc follow the code.

---

## 5. Files

**Create**
- `components/home/RecognitionBand.tsx` — S5
- `components/home/ResourcesSection.tsx` — S8
- `components/home/FinalAssessmentBand.tsx` — S10
- `lib/data/workflow-risks.ts` — S3 accordion data (R2)

**Modify**
- `app/page.tsx` — the ten-section order
- `components/home/HeroSection.tsx` — 4 chips, new H1/subhead, `Other business` routing
- `components/ui/PressProofStrip.tsx` — add `variant="rail"`
- `components/home/WhereRiskHides.tsx` — +2 tools; interactive selection (R2); absorb `AnswerBlock`
- `components/home/VerdictPreview.tsx` → `ReportPreview.tsx` — full-width, six deliverables
- `lib/data/verdict-previews.ts` — top-3 gaps + first-3 actions per sector
- `components/home/HowItWorks.tsx` — three steps; four-product spine demoted
- `components/home/AudienceCards.tsx` — 3 tabs + compressed 12-name row
- `components/home/FAQPreview.tsx` + `lib/data/faqs.ts` — homepage objection set
- `components/home/FounderProof.tsx` — navy variant (without regressing `/about`)
- `components/layout/Footer.tsx` — compact newsletter
- `scripts/design-lint.sh` — `section-rhythm` rule

**Delete**
- `components/home/TrustStrip.tsx` — stats → S2, pillars → S5
- `components/home/BriefingsSection.tsx`, `WhitePaperSection.tsx` — → S8 *(check other usages first)*
- `components/home/NewsletterSection.tsx` — homepage usage only; keep for `/briefings`
- `components/assessment/AssessmentWizard.tsx` — 291 lines, referenced by nothing, and its email capture prints "Results saved! Check your inbox" with **no network call**. Unreachable today, a trust defect the day anyone wires it up.

---

## 6. Analytics

**Do not build "add analytics" as a task.** `lib/analytics.ts` already defines 37 events through Vercel Web Analytics (mounted `app/layout.tsx:82`) and covers everything R1 needs: `hero_sector_select` · `landing_cta_click` · `beat5_cta_click` · `assessment_start` · `survey_complete` · `report_requested` · `nav_item_click`.

**Add three:**
- `scroll_depth` — fire at 25/50/75/100%. Every claim in this spec is about how far down the page gets read, and it is the one thing the current 37 events cannot answer.
- `risk_area_select` — S3 accordion (R2)
- `sector_tab_select` — S7 tabs (R2)

**Gate:** take a 5–7 day baseline on the current page *before* R1 ships. The CEO review in `LANDING_PAGE_MASTER.md §12` named this as the prerequisite and it still hasn't been taken. Ship R1 behind a baseline, not ahead of one.

**Success criteria for R1:** assessment-start rate from the homepage up · scroll-to-S4 rate up · page height down ≥ 30% · no regression in `/industries/*` entrances from the homepage.

---

## 7. Release plan

**R0 — measure.** `scroll_depth` event, then 5–7 days of baseline. Nothing else ships.

**R1 — the conversion spine.** S1 (4 chips + new H1) · S2 proof rail · S4 full-width report preview · S6 three steps · S10 final band + newsletter to footer · retire `TrustStrip`. Plus the whole-page rhythm pass: three navy bands, padding ladder, section hairlines, eyebrows on the bare sections, `section-rhythm` lint rule.

**R2 — the demonstration.** S3 interactive risk areas · S7 tabs + compressed link row · S5 recognition band · S8 resources condensed · S9 objection FAQ · delete dead code.

**R3 — depth.** Five assessment-dimension tabs (element 7 of the brief — deferred because it needs real question text from the packs) · permissioned operator stories · sector landing pages · hero-copy test · restrained motion once mobile CWV is verified.

**Definition of done, every release:** `npm run build` clean · `bash scripts/design-lint.sh` at or below baseline · contrast unchanged at AA · `prefers-reduced-motion` verified · mobile 360px with no horizontal scroll · Vercel preview checked before merge.

---

## 8. Open — needs Dilip's call

1. **Does the 12-name link row satisfy `INTERNAL_LINKING_SPEC.md`,** or does the homepage owe `/industries/*` more than one link each?
2. **Element 7 (five assessment-dimension tabs) — in or out?** It overlaps S3 and S4. Currently deferred to R3; the alternative is dropping it and letting S3 carry the "what does it examine" job.
3. **The two brand reconciliations** in §4 — green CTA label on dark, and sentence vs title case.
4. **Multilingual scope** — the guide has 7 languages; the homepage has one. Still unresolved from `LANDING_PAGE_MASTER.md §13`.

---

## 9. Explicitly not doing

Alternating white/cloud/teal section fills (1.05–1.26:1 — it will read as a rendering artefact) · a separate data-ecosystem rail (duplicates S3) · gradients or a second accent colour · enterprise demo-booking funnel · video backgrounds · carousels hiding essential information · an unpermissioned logo wall · a chatbot covering the CTA · multiple equally prominent actions · a long footer taxonomy · any invented customer name, quote, or percentage.
