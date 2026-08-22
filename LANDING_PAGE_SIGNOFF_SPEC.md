# The Landing Spec — consolidated for sign-off

_The one canonical spec, 2026-08-22. Supersedes the homepage sections of `LANDING_PAGE_FINAL_SPEC.md` (structure) and `LANDING_PAGE_QUIET_AUTHORITY_SPEC.md` (aesthetics) wherever they differ — both predate the founder decisions below. Everything marked **BUILT** is on `claude/landing-page-11-elements-htz97i` and verified; everything marked **ON CONFIRMATION** starts when Dilip confirms._

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
| earlier | Briefings deck stays on the homepage (S8) | Founder call after my deletion — reversed |
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
| S3 | Where risk hides | navy-700 | 1,269 | **BUILT** · click-to-reveal evidence cards ON CONFIRMATION |
| S4 | Report preview | white | 1,072 | **BUILT** · chrome header + bars-animate-once ON CONFIRMATION |
| S5 | Recognition band | navy-700 | 536 | **BUILT** |
| S6 | How it works | white | 939 | **BUILT** |
| S7 | Sector ring deck | white | ~950 | **BUILT** |
| S8 | Briefings deck | deep | 471* | **BUILT** · navy "intelligence desk" restyle ON CONFIRMATION |
| S9 | Resources | deep | 561 | **BUILT** · Field Guide publication treatment ON CONFIRMATION |
| S10 | FAQ | deep | 1,080 | **BUILT** · hairline-row restyle ON CONFIRMATION |
| S11 | Final CTA | navy-700 | 354 | **BUILT** — flows into the navy footer as one close |

\* S8 measured in its Appwrite-blocked empty state; ~1,100px with seven live briefings.

**Chapters:** understand (S1–S4, opens with a 2,100px continuous dark run) · trust and fit (S5–S7) · resolve and close (S8–S11+footer). Rhythm rule: two adjacent same-fill sections may never share a padding type — enforced by `scripts/section-rhythm.mjs`, wired into `design-lint` at baseline zero.

---

## 3. Section specifications

**S1 — Hero (navy).** H1 `Get your DPDPA readiness score in 3–5 minutes` at display-1 (clamp 40→68px). Four chips — Recruitment, CA firm, D2C, Other business — with check-marked active state; all 12 sectors one anchor away. One green CTA (dark register). Friction row, Discovery escape hatch. Right: the **Privacy Readiness Snapshot** — navy-950 chrome bar, white body, sample by default, live verdict + real first fix on select, anchor into S4. Faint node-geometry backdrop (white @5%) replaces the old radial glows. Deliberately short: the seam and risk-map top peek above a 900px fold.

**S2 — Proof seam (navy-800, border-y white/5).** One tight band: five real press links + `12 sector-specific assessments · 3–5 minutes · No email to start · Built for Indian workflows`. Publishing counts deliberately absent (they measure our activity, not the visitor's risk in clicking).

**S3 — Where risk hides (navy).** The centrepiece. Ten tools (Website forms and Payment tools added) fanning from a **white** hub on derived geometry; teal-400 flow lines (7.41:1), gold-400 gap labels (8.52:1). Beneath: the **Privacy Thread** — Collect→Use→Share→Store→Retain→Delete on the same teal dash, one green controlled node. Foot: "What is DPDPA?" answer block, on-dark variant, speakable target intact. *On confirmation:* tool chips become buttons revealing a sector evidence card (data found · common exposure · recommended control) from a new `lib/data/workflow-risks.ts`.

**S4 — Report preview (white, `#report`).** All six real deliverables, sourced from the assessment's own "What you'll get": score dial /100, risk category, five dimension bars, top-3 gaps, first-3 actions, checklist + optional email. Three sector tabs matching the hero's priority set. Sample-labelled in every state. *On confirmation:* navy chrome header + bars animate once on first view.

**S5 — Recognition band (navy).** Founder (Dilip Sahu — CA · IIM-B · 22+ yrs) with quote, the four "why us" pillars, compact press, one green CTA. No invented customer proof — a permissioned operator story slots in when one exists.

**S6 — How it works (white).** Three steps, all the assessment: choose industry → answer workflow questions → score, gaps, first fixes. The four-product spine demoted to a "Continue after your assessment" menu — every destination live.

**S7 — The sector ring deck (white, `#sectors`).** Founder's cover-flow sketch: centre card full, ±1 solid behind, ±2 fading — plus a rail of all 12 chips for one-glance findability. The 12 cards form a **ring** (wrap-around, symmetric at every position, arrows never dead-end). Side cards wear **spines** (icon + name at the exposed edge; click deals forward). **One auto-revolution** on first view — 4s per card, chips tracking — pausing on hover, ending on first interaction, never starting under reduced motion; auto-advances fire no analytics. All 12 cards server-rendered: 36 sector hrefs in the DOM (guide + assessment + flow map each), off-centre cards `inert`. Interactive mechanism demo: the Sector Ring artifact.

**S8 — Briefings deck (deep).** The seven-card fan, untouched in behaviour; re-inked for the deep fill (eyebrow, cloud-300 card borders, green-800 link). *On confirmation:* moves to navy as the "intelligence desk" — Authority Moment 2, with a `LATEST · date` stamp.

**S9 — Resources (deep).** Three cards: complete DPDPA guide (7 languages), compliance checklist, template library (17). No briefings card — the deck sits directly above. Quiet links only; green stays rationed. *On confirmation:* the guide card becomes a **Field Guide publication treatment** — CSS-drawn cover + the real language row.

**S10 — FAQ (deep).** Eight objection questions (applies to small business? · what do I enter? · email needed? · report contents? · do you store answers? · accuracy? · what next? · legal advice?) — every answer checkable against the code, including "your score is calculated in your browser; nothing reaches us unless you request the report." All eight answers server-rendered (hidden, not conditional) for AI crawlers. *On confirmation:* cards become hairline rows, publication style.

**S11 — Final CTA (navy) + footer.** `Know your gaps. Fix what matters. Signal trust.` — one green action, friction line, flowing into the institutional footer: four columns (Product · Industries with "· map" suffixes · Knowledge · Company/Legal), the **Privacy Office band** (general contact + DPO + disclaimer), briefings-signup row (link, consent-correct form stays on /subscribe), press row, bottom bar. 24 sector hrefs, nothing dropped.

---

## 4. Design system (as enforced)

- **Fills:** white `cloud-25` · deep `cloud-200` (1.28:1 — the card-hairline ratio at section scale) · navy-700 (17.31:1). Fill marks the group, padding the beat, hairline the boundary between same-fill neighbours.
- **Type:** Inter only. `type-display-1/2/3` (68/52/44px caps, weight 600, optical sizing) + `type-intro` (17px/1.65). Weight caps at semibold (lint).
- **Ladder:** 96/80/64/56/24px by section type; `section-rhythm.mjs` fails same-fill+same-type neighbours; ratchet baseline 0.
- **CTA:** exactly 4 filled greens on the page + 1 in chrome; dark/light registers per the locked convention. Secondary = teal-800 semibold; tertiary = slate-600 quiet.
- **Ink rules (measured):** green-700 → green-800 on deep (4.29→6.01); slate-400 banned on light, correct on navy (6.75); teal-700 banned on navy (3.52) — teal-400 lines (7.41); `Surface onDeep` steps card borders to cloud-300.
- **Motion inventory (all transform/opacity, all reduced-motion-safe):** hero snapshot fade-swap · S3 fan staggered reveal (play once) · S7 deal-in + one auto-revolution + 500ms recentre · S6 step reveal · score dial count-up. Nothing loops indefinitely; nothing moves on scroll position.
- **Radius:** pill/8/12 — `card-radius` lint at **zero**. No red anywhere; risk = gold.

---

## 5. SEO / AI-crawler posture (verified against served no-JS HTML)

One h1 · title/canonical/OG unchanged (keyword carve-out) · 6 JSON-LD blocks · speakable `.answer-block` present on navy · all 8 FAQ answers in HTML · 12 industry + 12 flow-map + 12 assessment-adjacent hrefs server-rendered · ring-deck content crawlable behind `inert` · 0px overflow at 360/390px · no sub-44px coarse-pointer targets · Vercel Analytics + 37 events live.

---

## 6. What confirmation triggers

**Phase A — the four section refinements** (each small, each already specified above): S3 clickable evidence cards · S4 chrome + bar animation · S8 navy intelligence desk · S9 Field Guide treatment · S10 FAQ rows. Plus a mobile refinement pass.

**Phase B — measure and ship:** add `scroll_depth` (25/50/75/100) + `sector_ring_select` events · verify the briefings deck on the deep fill in the Vercel preview (Appwrite is blocked in the build sandbox — the one thing never seen rendering with live data) · mobile CWV check (LCP ≤2.5s / INP ≤200ms / CLS ≤0.1) · then the PR to `main`. The CEO-review baseline rule stands: instrument first, compare after.

**Still yours, not blocking:** Signal Gold reconciliation (Brand Bible v3.1) · GSC keyword check before any "compliance" metadata rename · multilingual scope · "Prove / Verified Digital Trust" enters the journey only when a real product ships behind it.

---

## 7. Paper trail

Branch `claude/landing-page-11-elements-htz97i`, commits `89da49d → 5e9d5b4` (rebuild → P0 → Option A → ring deck). Analysis docs: `LANDING_PAGE_11_ELEMENTS_ANALYSIS.md` · `LANDING_PAGE_RHYTHM_FIX.md` · `LANDING_PAGE_FINAL_SPEC.md` · `LANDING_PAGE_QUIET_AUTHORITY_SPEC.md` (both now historical where they conflict with §1). Artifacts: Landing Page Rebuild · Quiet Authority · The Hero Flip · The Sector Ring.
