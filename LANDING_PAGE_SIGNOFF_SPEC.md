# The Landing Spec — consolidated for sign-off

_The one canonical spec, 2026-08-22 (revised after founder confirmation — see §8). Supersedes the homepage sections of `LANDING_PAGE_FINAL_SPEC.md` (structure) and `LANDING_PAGE_QUIET_AUTHORITY_SPEC.md` (aesthetics) wherever they differ — both predate the founder decisions below. Everything marked **BUILT** is on `claude/landing-page-11-elements-htz97i` and verified; everything marked **ON CONFIRMATION** starts when Dilip confirms._

---

## 1. Locked decisions (the log)

| Date | Decision | How it was made |
|---|---|---|
| 2026-08-22 | **Hero stays NAVY (Option A)** | Rendered side-by-side of both heroes; founder call |
| 2026-08-22 | **CTA convention**: dark surfaces = green-400 fill + navy-950 label (9.72:1) · light surfaces = green-700 fill + white label (5.48:1) | Settled with founder; literal brand-book green+white measures 2.54:1 and fails everywhere |
| 2026-08-22 | **Opening = one continuous dark chapter**: hero (navy-700) → proof seam (navy-800) → risk map (navy-700) | Founder's "fades below the hero" finding + the master spec's original "dark zones = Hero+Scatter" |
| 2026-08-22 | **Ladder compressed one notch**: statement 96 · demo 80 · utility 64 · evidence/decision 56 · rail 24 (px) | Founder's whitespace finding; ladder ratios survive, `section-rhythm` lint enforces |
| 2026-08-22 | **Sector section = the ring deck**: founder's cover-flow sketch + a rail of all 12 chips; spines on side cards; one auto-revolution | Founder sketch, refined against the 12-layer "crash" |
| 2026-08-22 | **`cloud-50` retired from the homepage**; three fills only — white, deep (`cloud-200`, 1.28:1 vs white), navy (17.31:1) | Measured; 1.05:1 tints rejected |
| 2026-08-22 | **Recognition band leaves the homepage** → /about; briefings deck takes navy in its place | Founder call at sign-off |
| earlier | Briefings deck stays on the homepage | Founder call after my deletion — reversed |
| earlier | Newsletter leaves the page body → footer link + /subscribe | One primary action per page |
| standing | **No invented proof** — no customer quotes, percentages, or scores that don't exist | Brand rule; nine sectors show real typical bands, never fake numbers |
| standing | Homepage `<title>` keeps "DPDPA Compliance" until GSC confirms what ranks | SEO carve-out; body copy uses readiness language |
| interim | **Signal Gold** = exposure/risk on product surfaces; ceremonial gold only on navy | Brand doc says certification, codebase says risk — Dilip reconciles in Brand Bible v3.1 |

---

## 2. The page — eleven sections, three chapters

Fills and heights as measured at 1440px on the built branch (S7 re-measured after the ring deck; total ≈ 9,200px, from ~11,500 on the old page).

| # | Section | Fill | ≈px | Status |
|---|---|---|---|---|
| S1 | Hero | navy-700 | 758 | **BUILT** |
| S2 | Proof seam | navy-800 | 98 | **BUILT** |
| S3 | Where risk hides | navy-700 | 1,594 | **BUILT** · evidence panel shipped |
| S4 | Report preview | white | 1,114 | **BUILT** · chrome + animated bars shipped |
| S5 | How it works | white | 940 | **BUILT** |
| S6 | Sector ring deck | white | 952 | **BUILT** |
| S7 | Briefings deck | **navy-700** | 467* | **BUILT** · intelligence desk shipped |
| S8 | Resources | deep | 780 | **BUILT** · Field Guide treatment shipped |
| S9 | FAQ | deep | 913 | **BUILT** · hairline rows shipped |
| S10 | Final CTA | navy-700 | 354 | **BUILT** — flows into the navy footer as one close |

\* S7 measured in its Appwrite-blocked empty state; ~1,100px with seven live briefings. Page total **9,103px** desktop at 1440 (from ~11,500 on the old page), 13,421px at 390.

**Chapters:** understand (S1–S4, opens with a 2,450px continuous dark run) · the product and whether it fits (S4–S6, three white beats held apart by hairlines) · resolve and close (S7 navy turn → S8–S9 quiet → S10 dark close + footer). The page now reads dark-open · light-middle · dark-turn · dark-close, which is symmetric where the old arrangement had a single mid-page interruption. Rhythm rule: two adjacent same-fill sections may never share a padding type — enforced by `scripts/section-rhythm.mjs`, wired into `design-lint` at baseline zero.

---

## 3. Section specifications

**S1 — Hero (navy).** H1 `Get your DPDPA readiness score in 3–5 minutes` at display-1 (clamp 40→68px). Four chips — Recruitment, CA firm, D2C, Other business — with check-marked active state; all 12 sectors one anchor away. One green CTA (dark register). Friction row, Discovery escape hatch. Right: the **Privacy Readiness Snapshot** — navy-950 chrome bar, white body, sample by default, live verdict + real first fix on select, anchor into S4. Faint node-geometry backdrop (white @5%) replaces the old radial glows. Deliberately short: the seam and risk-map top peek above a 900px fold.

**S2 — Proof seam (navy-800, border-y white/5).** One tight band: five real press links + `12 sector-specific assessments · 3–5 minutes · No email to start · Built for Indian workflows`. Publishing counts deliberately absent (they measure our activity, not the visitor's risk in clicking).

**S3 — Where risk hides (navy).** The centrepiece. Ten tools (Website forms and Payment tools added) fanning from a **white** hub on derived geometry; teal-400 flow lines (7.41:1), gold-400 gap labels (8.52:1). Beneath: the **Privacy Thread** — Collect→Use→Share→Store→Retain→Delete on the same teal dash, with the lit node following the selection in gold (risk is only ever gold on this palette). **The chips are now the interface.** Selecting a tool moves three things at once: its flow line brightens (unselected drop to 40%, never off — the fan is still the picture), the evidence panel below changes, and the Privacy Thread lights the lifecycle stage that gap actually sits at. Evidence is three fields per tool — what's in there · how it goes wrong · what closes it — from `lib/data/workflow-risks.ts`, which also owns the tool order and the gap labels (one array, no join to drift). All ten panels are server-rendered, nine carrying `hidden`: thirty pieces of practical guidance that would otherwise sit behind a click no crawler performs. Foot: "What is DPDPA?" answer block, on-dark variant, speakable target intact.

**S4 — Report preview (white, `#report`).** All six real deliverables, sourced from the assessment's own "What you'll get": score dial /100, risk category, five dimension bars, top-3 gaps, first-3 actions, checklist + optional email. Three sector tabs matching the hero's priority set. A **navy-950 chrome bar** — the hero snapshot's title bar at full size — frames it as an instrument reading rather than a marketing card, and carries the "Sample · illustrative" qualifier for the whole panel. The five dimension bars **fill from zero** on first view and again on each tab change (verified: 0 → mid-travel → final over 700ms with a 90ms stagger).

**S5 — How it works (white).** Three steps, all the assessment: choose industry → answer workflow questions → score, gaps, first fixes. The four-product spine demoted to a "Continue after your assessment" menu — every destination live.

**S6 — The sector ring deck (white, `#sectors`).** Founder's cover-flow sketch: centre card full, ±1 solid behind, ±2 fading — plus a rail of all 12 chips for one-glance findability. The 12 cards form a **ring** (wrap-around, symmetric at every position, arrows never dead-end). Side cards wear **spines** (icon + name at the exposed edge; click deals forward). **One auto-revolution** on first view — 4s per card, chips tracking — pausing on hover, ending on first interaction, never starting under reduced motion; auto-advances fire no analytics. All 12 cards server-rendered: 36 sector hrefs in the DOM (guide + assessment + flow map each), off-centre cards `inert`. Interactive mechanism demo: the Sector Ring artifact.

**S7 — Briefings deck (navy) — the intelligence desk.** The seven-card fan, untouched in behaviour, re-inked for navy: white heads, slate-300 body, teal-300 links, the deck's own white cards reading as lit objects on a dark desk (the same figure/ground move the risk map makes with its hub). Carries a **`LATEST · date` dateline** taken from the newest live briefing — rendered only when there is one, because an empty desk does not get to stamp itself. This is Authority Moment 2, and it now also carries the mid-page dark turn the recognition band used to.

**S8 — Resources (deep).** Three cards: complete DPDPA guide (7 languages), compliance checklist, template library (17). No briefings card — the deck sits directly above. Quiet links only; green stays rationed. The guide now gets a **7/5 split and a CSS-drawn cover** (navy board, spine, page block, 2026 edition line — no image asset, nothing to re-export when the edition moves) with the seven languages shown in their own scripts, each `lang`-tagged. Three equal cards said the guide and a template ZIP were the same kind of thing; they are not.

**S9 — FAQ (deep).** Eight objection questions (applies to small business? · what do I enter? · email needed? · report contents? · do you store answers? · accuracy? · what next? · legal advice?) — every answer checkable against the code, including "your score is calculated in your browser; nothing reaches us unless you request the report." All eight answers server-rendered (hidden, not conditional) for AI crawlers. Presented as **hairline rows**, not cards: eight bordered boxes was eight objects for one list, and the deep fill was already doing the separating. Rules between rows, publication style — and ~90px shorter.

**S10 — Final CTA (navy) + footer.** `Know your gaps. Fix what matters. Signal trust.` — one green action, friction line, flowing into the institutional footer: four columns (Product · Industries with "· map" suffixes · Knowledge · Company/Legal), the **Privacy Office band** (general contact + DPO + disclaimer), briefings-signup row (link, consent-correct form stays on /subscribe), press row, bottom bar. 24 sector hrefs, nothing dropped.

---

## 4. Design system (as enforced)

- **Fills:** white `cloud-25` · deep `cloud-200` (1.28:1 — the card-hairline ratio at section scale) · navy-700 (17.31:1). Fill marks the group, padding the beat, hairline the boundary between same-fill neighbours.
- **Type:** Inter only. `type-display-1/2/3` (68/52/44px caps, weight 600, optical sizing) + `type-intro` (17px/1.65). Weight caps at semibold (lint).
- **Ladder:** 96/80/64/56/24px by section type; `section-rhythm.mjs` fails same-fill+same-type neighbours; ratchet baseline 0.
- **CTA:** exactly 4 filled greens on the page + 1 in chrome; dark/light registers per the locked convention. Secondary = teal-800 semibold; tertiary = slate-600 quiet.
- **Ink rules (measured):** green-700 → green-800 on deep (4.29→6.01); slate-400 banned on light, correct on navy (6.75); teal-700 banned on navy (3.52) — teal-400 lines (7.41); `Surface onDeep` steps card borders to cloud-300.
- **Motion inventory (all transform/opacity/width, all reduced-motion-safe):** hero snapshot fade-swap · S3 fan staggered reveal (play once) + line/node response on select · S4 score dial count-up + dimension bars filling from zero · S5 step reveal · S6 deal-in + one auto-revolution + 500ms recentre. Nothing loops indefinitely; nothing moves on scroll position.
- **Radius:** pill/8/12 — `card-radius` lint at **zero**. No red anywhere; risk = gold.

---

## 5. SEO / AI-crawler posture (verified against served no-JS HTML)

Re-verified against the served no-JS HTML after every Phase A change:

- 1 `<h1>` · 6 JSON-LD blocks · speakable `.answer-block` intact on navy
- **All 8 FAQ answers** and **all 10 risk-evidence panels** in the server HTML (`hidden`, never conditional) — 30 fields of practical DPDPA guidance a crawler can read without running JS
- 48 industry hrefs (12 guides + 12 flow maps in the ring, mirrored in the footer), ring content crawlable behind `inert`
- title/canonical/OG unchanged — the "DPDPA Compliance" keyword carve-out still stands pending GSC
- `scrollWidth == viewport` at 360 and 390 (zero page overflow); the only sub-44px targets are inline links inside sentences, which WCAG 2.5.8 exempts
- Production build green (135 static pages); typecheck, `design-lint` and `section-rhythm` all clean

---

## 6. Status — what shipped, what is left

**Phase A — shipped in full.** S3 evidence panels · S4 chrome + animated bars · S7 navy intelligence desk · S8 Field Guide treatment · S9 hairline FAQ rows · the mobile pass (no overflow at 360/390, no new sub-44px targets). Plus the founder's sign-off call: the recognition band moved to /about, and the page rebalanced around its absence.

**Phase B — instrumentation shipped, verification pending.** Three events are live and verified firing with correct payloads: `scroll_depth` (25/50/75/100, one per bucket per view), `sector_ring_select` (sector + via: chip/arrow/spine — auto-advances deliberately excluded), `risk_tool_select` (tool + gap). Two things still need a real deployment, because the sandbox cannot produce them:

1. **The briefings deck with live data** — Appwrite egress is blocked here, so the navy desk has only ever been seen in its empty state. First thing to check on the Vercel preview, along with the `LATEST · date` dateline.
2. **Mobile CWV** — LCP ≤2.5s / INP ≤200ms / CLS ≤0.1, and confirmation that the three new events reach the Vercel dashboard (`POST /_vercel/insights/event`), which is the rule `analytics.ts` sets for every new event.

Then the PR to `main`, on your word.

**Still yours, not blocking:** Signal Gold reconciliation (Brand Bible v3.1) · GSC keyword check before any "compliance" metadata rename · multilingual scope · "Prove / Verified Digital Trust" enters the journey only when a real product ships behind it.

---

## 7. Paper trail

Branch `claude/landing-page-11-elements-htz97i`, commits `89da49d → HEAD` (rebuild → P0 → Option A → ring deck → sign-off spec → Phase A). Analysis docs: `LANDING_PAGE_11_ELEMENTS_ANALYSIS.md` · `LANDING_PAGE_RHYTHM_FIX.md` · `LANDING_PAGE_FINAL_SPEC.md` · `LANDING_PAGE_QUIET_AUTHORITY_SPEC.md` (both now historical where they conflict with §1). Artifacts: Landing Page Rebuild · Quiet Authority · The Hero Flip · The Sector Ring.

---

## 8. Revision — 2026-08-22, post-confirmation

Founder: *"I do not think S5 is needed in Landing page let it live in about page. rest looks good to me. Please proceed."*

The band is gone from the homepage. Its founder card and press strip were already on /about; its four "how we work" pillars moved there with them, and `FounderProof` is now the single source of that CV (the homepage used to import the quote and credentials from it, which made two renderings of one person's biography).

Removing it cost the page its mid-page dark reset, so the architecture rebalanced rather than just closing the gap: **S7 (briefings) takes navy**. The page reads dark-open → light-middle → dark-turn → dark-close, which is more symmetric than what it replaced, and one beat shorter. Eleven sections became ten.

One structural note worth stating plainly: S4–S6 is now a ~3,000px continuous light run, held together by hairlines and the padding ladder rather than a fill flip. That is deliberate — they are one thought (here is the product, here is what it costs you, here is your sector) and the question the band answered (who are you) is not one anyone asks in the middle of it — but it is the longest single-fill stretch on the page, and the first thing to look at if the scroll-depth baseline comes back weaker than expected between 50% and 75%.
