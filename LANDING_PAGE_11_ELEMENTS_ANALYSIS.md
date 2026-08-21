# Landing page — the 11-element brief, assessed against the code

_Analysis only. No component changed. Branch `claude/landing-page-11-elements-htz97i`, cut from `claude/landing-page-improvement-htz97i` (the current dev head, 161 files ahead of `main`)._

---

## 1. The headline finding

**The audit is right about the direction and roughly half-stale about the facts.**

It was run against `saralprivacy.com` — which serves `main`, last commit `ddeaf4b` (W1.5). The dev head this branch sits on carries W2–W9 plus the nav collapse (`bb97567`), and those waves already landed four of the audit's six "first release" items. Building the brief as written would mean **re-doing work that exists and re-opening two decisions that were closed deliberately**, with reasons recorded in the code.

So the useful question is not "should we do the 11 elements" — mostly yes — but "which of them are actually missing from the head, and which of the audit's findings survive contact with it."

| Audit's "first release" | State at dev head | Evidence |
|---|---|---|
| 1. Header + hero primary action → `Take free assessment` | **Done** | `lib/data/navigation.ts:200`; `components/home/HeroSection.tsx:105-113` |
| 2. Reduce the hero's 12 industry buttons | **Not done** — still 12 chips | `HeroSection.tsx:73-93` |
| 3. Press proof directly below the hero | **Deliberately reversed** — moved *down* in W-wave | `app/page.tsx:97-100` |
| 4. Enlarge the report preview | **Partial** — exists, but `max-w-3xl`, 3 sectors, 5 bars + 1 gap | `components/home/VerdictPreview.tsx:21-22` |
| 5. Assessment CTAs after report + at end | **Half** — after report yes (`VerdictPreview.tsx:127`); at end no |
| 6. Replace the final newsletter band | **Not done** — newsletter still closes the page | `app/page.tsx:104` |

And three of the audit's stated findings do not hold against the head:

- **"No client-side analytics detected."** False negative. Vercel Web Analytics is mounted at `app/layout.tsx:82`, and `lib/analytics.ts` defines **37 custom events**, including `hero_sector_select`, `landing_cta_click`, `assessment_start`, `survey_complete`, `report_requested`. A raw HTML fetch can't see it because it is cookieless and client-injected. Conversion improvement is measurable today; the gap is dashboards and a baseline, not instrumentation.
- **"~8,700px of consecutive Cloud 50."** True of `main`. At head this is a *stated design position*, not drift — W1.3 put every beat on one canvas on purpose and moved rhythm to silhouette (py-32 / py-24 / py-20 / py-16 / py-16), with the reasoning written into `app/page.tsx:36-50`: white-vs-cloud-50 measures 1.05:1 and reads as banding rather than structure. The audit's alternating-surface table is a direct contradiction of that. It needs to be argued, not assumed.
- **"The hero promises a verdict but makes Discovery the dominant CTA."** Fixed in `b0d4fab`. Discovery is now one muted underlined line (`HeroSection.tsx:119-129`).

What *is* unambiguously true and unfixed: **12 chips in the hero, a 12-card sector wall (~2,100px), a report preview that is a card rather than a section, no objection-led FAQ, and a newsletter closing the page.** Those five are the real work.

---

## 2. Element-by-element: what exists, what's missing

| # | Element | Verdict | What's there now | What's actually missing |
|---|---|---|---|---|
| 1 | Outcome-led hero | **Mostly there** | Eyebrow with 3–5 min, one green CTA, friction-killer row, Discovery escape hatch, right-hand card | H1 is `See exactly where your business stands on DPDPA` — a *position* promise, not the readiness-**score** promise the brief wants. Right card is a teaser (score dial + band), not a report preview. |
| 2 | Compact industry selector | **Missing** | 12 chips, all equal weight (`HeroSection.tsx:73-93`) | Recruitment / CA firm / D2C + `Other business`. Note: the 12 chips also make the hero the page's tallest mobile block. |
| 3 | Proof rail | **Present but misplaced** | `PressProofStrip` renders at `app/page.tsx:100`, ~2 sections from the footer; stats live in `TrustStrip` at position 2 | A single compact band under the hero carrying press + the three anxiety-reducing facts. `TrustStrip` currently leads with briefing count and `17 templates` — activity metrics, not anxiety-reducers (`TrustStrip.tsx:47-54`). |
| 4 | Workflow-risk accordion | **Missing** | `WhereRiskHides` is a static scatter fan — good visual, zero interaction | Six accordion items driving a sector evidence card (workflow → likely gap → first fix). This is the single biggest "product preview" gap on the page. |
| 5 | Everyday data ecosystem | **Effectively there** | The scatter *is* this: WhatsApp, Drive, Sheets, CRM, email, CCTV, archives, vendors, each with a gold gap (`WhereRiskHides.tsx:28-37`) | Only payment tools and website forms are absent. Do **not** rebuild this as a separate rail — it would duplicate an existing beat. Merge #4 into it instead. |
| 6 | Large report preview | **Undersized** | `VerdictPreview` — 3 sector tabs, 5 category bars, band, one top gap, sector-scoped green CTA | Score 0–100, top **three** gaps, first three actions, checklist preview, email-report option — and full-width instead of `max-w-3xl`. **All six already exist in the real report** (`app/assessment/SurveyClient.tsx:731-738`), so this can be built from product truth, not invention. |
| 7 | Assessment-check tabs | **Missing** | — | Five dimensions × (question, finding, fix). Real question text can be lifted from the assessment packs rather than written fresh. |
| 8 | Three-step process | **Missing / contradicted** | `HowItWorks` teaches a **four-product** spine: Discover → Map → Assess → Fix, 417 lines, each step a live link (`HowItWorks.tsx:42-95`) | The audit's core point stands: a visitor reading this concludes the 3-minute assessment is step 3 of 4. Demote the four-product spine to "after your score". |
| 9 | Three sector examples | **Missing** | The 12-card wall (`AudienceCards.tsx`, ~2,100px, 12 accent palettes, 24–36 links) | Three tabs + `Explore all 12 industries →`. **Caveat below** — this wall is doing internal-linking work. |
| 10 | Recognition / operator proof | **Partial** | Press marks exist and are real (5 outlets, live URLs, `PressProofStrip.tsx:6-29`). `FounderProof.tsx` exists but is **not rendered on the homepage** | A navy attention-reset band mid-page. No customer quote is available — the brief's own "do not invent testimonials" rule applies. Founder proof (CA · IIM · 22 yrs) is the honest substitute and is already built. |
| 11 | Objection-led FAQ + final CTA | **Missing on both counts** | FAQ shows `faqs.slice(0,5)` — general DPDPA definitions, not conversion objections (`FAQPreview.tsx:12`, `lib/data/faqs.ts`). Page closes on the newsletter (`NewsletterSection.tsx`) | A homepage-specific objection set, and a navy assessment band as the last thing before the footer. |

---

## 3. Where I'd push back

**a) Press directly under the hero re-opens a closed decision.** W-wave moved it down on the reasoning that "three trust sections stacked before the reader had seen the problem or the product" (`app/page.tsx:97-99`). Both positions are defensible and the honest answer is that nobody knows which converts better here. **Recommendation: split it.** A one-line compact press mark under the hero (name-drops only, ~40px, no cards) *plus* the existing strip staying where it is near the capture zone. That satisfies the audit's anxiety-reduction job without rebuilding the third trust block the W-wave deleted.

**b) The alternating-colour table fights a measured decision.** The audit prescribes Navy/White/Cloud/pale-teal alternation. The code rejects that explicitly with a contrast measurement. I'd keep the one-canvas position and get the rhythm the audit wants from the **two navy bands** it also asks for — recognition band (mid) and final CTA (end). That is the same visual reset, achieved with the mechanism the codebase already trusts, and it costs two sections instead of eleven.

**c) Collapsing the 12-card wall has an SEO cost nobody priced.** Those 12 cards carry 24–36 internal links into `/industries/*` and `/assessment/*`, and there is an `INTERNAL_LINKING_SPEC.md` in the repo governing exactly this. Three tabs plus one directory link cuts homepage → industry link equity substantially. **Recommendation: three tabs above the fold of that section, and keep a compressed 12-name link row underneath** (plain text links, ~80px instead of 2,100px). Nearly all the length saving, none of the link loss.

**d) `Other business` needs a real destination.** The brief lists it as a fourth chip. `/assessment` (the generic route) exists and works, so this is cheap — but the chip must not imply a sector-specific report the generic pack doesn't produce.

**e) One dead file to delete while we're here.** `components/assessment/AssessmentWizard.tsx` (291 lines) is referenced by nothing. Its email capture sets `emailSaved` and prints "Results saved! Check your inbox" **with no network call at all**. Harmless today because it is unreachable; a live trust defect the moment someone wires it up. The real flow is `app/assessment/SurveyClient.tsx` and it posts correctly to `/api/assessment:659`.

---

## 4. Recommended sequence

Scoped to what's genuinely missing at head. Estimates are component-count, not calendar.

### R1 — the conversion spine (highest value, lowest risk)

| Change | Files | Note |
|---|---|---|
| Hero: 12 chips → 3 + `Other business` | `HeroSection.tsx:73-93` | Keep all 12 reachable via the sector wall. Preserve `heroSectorSelect` tracking. |
| Hero H1 → the score promise | `HeroSection.tsx:55-58` | `Get your DPDPA readiness score in 3–5 minutes` |
| Compact press line under hero | `app/page.tsx`, new `variant` on `PressProofStrip` | Name-drops + `12 sector assessments · 3–5 minutes · No email to start`. Keep the deep strip too (§3a). |
| Report preview → full-width section | `VerdictPreview.tsx` | Add score/100, top-3 gaps, first-3 actions, checklist teaser, email-report line. Source from `SurveyClient.tsx:731-738` — every item is real. |
| Three-step process replaces the four-product spine | `HowItWorks.tsx` | Choose industry → answer workflow questions → get score/gaps/fixes. Move Discover→Map→Fix into a `Continue after your assessment` block below. |
| Final navy assessment band; newsletter → footer | `app/page.tsx:104`, `NewsletterSection.tsx`, `Footer.tsx` | `Know your gaps. Fix what matters. Signal trust.` |
| Trust stats: drop briefing/template counts | `TrustStrip.tsx:47-54` | Replace with the three anxiety-reducers. Counts stay on Resources. |

Expected: roughly 2,500–3,000px off the page, and the promise/action/proof sequence the audit is actually asking for.

### R2 — the product demonstration

| Change | Files |
|---|---|
| Merge the workflow-risk accordion **into** `WhereRiskHides` (don't add a rail) | `WhereRiskHides.tsx` + new `lib/data/workflow-risks.ts` |
| Sector wall → 3 tabs + compressed 12-name link row | `AudienceCards.tsx` (§3c) |
| Mid-page navy recognition band, using `FounderProof` + press, no invented quotes | `app/page.tsx`, `FounderProof.tsx` |
| Objection-led homepage FAQ set | `FAQPreview.tsx` + a `homepageFaqs` slice in `lib/data/faqs.ts` |
| Add payment tools + website forms to the ecosystem | `WhereRiskHides.tsx:28-37` |
| Delete dead `AssessmentWizard.tsx` | — |

### R3 — depth, once R1 has a baseline

Five assessment-dimension tabs (element 7) · permissioned operator stories · sector landing pages · hero-copy test · restrained motion after mobile CWV is verified.

---

## 5. Measure it — but the instrumentation is already there

Do not build "add analytics" as a task. `lib/analytics.ts` already fires everything R1 needs:

`hero_sector_select` · `landing_cta_click` (carries `cta` + `sector`) · `beat5_cta_click` · `assessment_start` · `survey_complete` · `report_requested` · `nav_item_click`

The two real gaps: **(a) a 5–7 day pre-change baseline** — the CEO review in `LANDING_PAGE_MASTER.md §12` already named this as the prerequisite and it still hasn't been taken; **(b) no scroll-depth event**, so "how far down does the page get read" is unanswerable, which is exactly the question a length reduction needs to prove.

Ship R1 behind a baseline, not ahead of one.

---

## 6. Bottom line

Adopt the brief, with four amendments: keep press in **both** positions rather than moving it, keep the one-canvas surface system and get the reset from the two navy bands instead of eleven alternating fills, keep a compressed 12-sector link row under the three tabs, and skip the separate ecosystem rail because the scatter already is one.

The five things that will actually move the number are in R1: **three chips instead of twelve, a score-promise H1, a report preview that occupies a section, a three-step process instead of a four-product one, and an assessment band where the newsletter currently sits.**
