# Quiet Authority — the premium elevation spec

_Normative for aesthetics. Sits on top of `LANDING_PAGE_FINAL_SPEC.md` (structure) — it changes how the eleven sections look, not what they contain. **Nothing is removed. One section gets content back.**_

_Inputs: the two external assessments (the Brand-Bible-corrected one and the 30-point "Quiet Authority" direction) · the `saralprivacy-brand` skill (the in-repo brand authority — the Brand Bible HTML itself is not in the repo) · the measured contrast work from the rhythm rebuild. Where the assessments disagree with each other or with measurement, this spec says which wins and why._

---

## 1. Verdict on the two assessments

**Directionally right, and roughly a third already built.** Both were written against the live site (`main`), not this branch — the same staleness as the first audit. Before adopting their P0 stack, here is where each item actually stands:

| Their recommendation | Status at head | Action |
|---|---|---|
| Navbar → premium 4-item command bar | **Done** — `bb97567` collapsed 7 items to 4 | none |
| Borders instead of shadows, ~flat cards | **Done** — the Surface ladder's founding argument | none |
| Radius discipline (8/12/pill, no 24px bubbles) | **Done** — vocabulary + `card-radius` lint (3 legacy hits remain) | burn down the 3 |
| One primary CTA, green rationed | **Done** — W6 + one green per chapter | none |
| Press understated, not a logo wall | **Done** — rail + compact variants | none |
| Motion restraint, reduced-motion safe | **Done** throughout | none |
| Strategic dark authority sections | **Half** — three navy bands exist, but not where the assessments put them | §3 |
| Inter-only, no serif | **Keep** — assessment #1 correctly retracts assessment #2's serif proposal | none |
| Drop the forest-green palette | **Correctly retracted** by assessment #1 — existing tokens stand | none |
| Editorial type scale (64–72px hero) | **Not done** — the genuine P0 | §4 |
| Light hero, product-snapshot card | **Not done** — the big move | §3, §5 |
| Privacy Thread signature motif | **Half-exists** — `sp-dash-flow` teal dashed lines are already the de-facto motif; unformalised | §7 |
| 12-sector matrix, nothing dropped | **Conflicts with head** (3 tabs + name row) — adopt theirs | §8 |
| "Compliance" → readiness language audit | **Partially valid** — SEO carve-out required | §11 |

**Rejected outright** (with the reason): forest/ivory palette (retracted by its own author; brand tokens are canonical) · serif display (retracted; brand locks Inter) · the light-alternation rhythm table with Cloud/Ivory bands (white ↔ cloud-50 is a **measured 1.05:1** — invisible; the deep fill at 1.28:1 stays) · muted red `#C2413A` for critical (brand rule: **no red**, risk = gold; introducing red orphans that system) · announcement bar (deliberately removed in W1.1) · 18px hero-frame radius (vocabulary caps cards at 12) · full report UI in the hero (the S4 dedupe rule stands — hero gets a *snapshot*, §5) · glassmorphism, gradients, glow, mascots on the corporate page (both assessments agree).

---

## 2. What "premium" means here, made falsifiable

The assessments' best line: **rich = depth of information; sophisticated = hierarchy; premium = restraint.** Concretely, on this page:

1. Every text/surface pairing at AA or better, on every fill — already the house discipline; this spec adds the navy-surface pairings pre-measured (§13).
2. Three visual amplitudes: **L1 narrative moments** (huge type, air, one visual) / **L2 product surfaces** (contained UI, chrome, tabular numbers) / **L3 evidence** (quiet, editorial, hairlines). Every section below is assigned one.
3. One typographic system (Inter), one motif (the teal thread), one interaction grammar (§9). No section invents its own.
4. The page looks almost white at first glance; authority arrives as three navy moments, not a dark theme.

---

## 3. The big move — flip the hero light, spend navy on authority moments

**Current:** navy hero + navy recognition + navy close. **New:** light editorial hero; navy moves to the two sections that *demonstrate* authority, plus the existing recognition and close.

This restores the original master-spec intent that the W-waves lost — `LANDING_PAGE_MASTER.md §6` defined the dark zones as **"Hero+Scatter"**, and the scatter's dark treatment never shipped. It also resolves a standing brand conflict for free: the brand locks CTAs to *green background + white label*, which is impossible on a navy hero (white on green-500 is 2.54:1) — on a light hero the CTA becomes `bg-green-700 text-white` at **5.48:1**, brand-compliant with no amendment needed.

### The new surface map (all 11 sections, nothing dropped)

| # | Section | Fill | Amplitude | Change |
|---|---|---|---|---|
| S1 | Hero | **white** | L1 | flipped light, editorial scale, snapshot card (§5) |
| S2 | Proof rail | deep | L3 | unchanged |
| S3 | Where risk hides | **navy** — Authority Moment 1 | L1 | the centrepiece (§6) |
| S4 | Report preview | white | L2 | product chrome (§10) |
| S5 | Recognition band | navy | L1 | unchanged |
| S6 | How it works | white | L3 | type upscale only |
| S7 | Sector matrix | white | L2 | **12 cards restored** (§8) |
| S8 | Intelligence desk | **navy** — Authority Moment 2 | L2 | deck on navy (§10) |
| S9 | Resources / Field Guide | deep | L3 | guide gets the publication treatment (§10) |
| S10 | FAQ | deep | L3 | publication style, cards → hairline rows (§10) |
| S11 | Final CTA | navy | L1 | unchanged; flows into the navy footer as one close |

Navy area ≈ S3 (~1,200) + S5 (552) + S8 (~1,100) + S11+footer (~1,050) ≈ **~38% of the page — landing at the brand's stated 45/20/10/5 proportion for the first time.** Today navy is ~16%.

Rhythm check: `white · deep · NAVY · white · NAVY · white · white · NAVY · deep · deep · NAVY`. The two same-fill light pairs (S6+S7, S9+S10) differ in padding type, so `section-rhythm` passes unchanged. Navy at S3 and S5 is separated by 1,088px of white demo — punctuation, not zebra.

---

## 4. Typography — the single largest perceived upgrade

All Inter. The change is scale and composition, not family. (Brand doc says "H1 48px Bold"; the codebase already caps weight at semibold with a lint rule and measured reasoning — this extends that precedent to size. Flag both for Brand Bible v3.1.)

| Role | Current | New | Notes |
|---|---|---|---|
| Hero H1 | 36/48px semibold | `clamp(40px, 5.5vw, 68px)` · 600 · `tracking -0.02em` · `leading 1.05` | two deliberate lines, `text-wrap: balance` |
| L1 section H2 | 30/36px | `clamp(34px, 4vw, 52px)` · 600 · `-0.015em` · `1.1` | S3, S5, S11 |
| L2/L3 section H2 | 30/36px | `clamp(30px, 3.5vw, 44px)` · 600 | |
| Section intro copy | 16px slate | **17–18px / 1.65**, `max-w-[62ch]` | the "editorial" feel is mostly this line-height |
| Eyebrow | 12px / +0.08em | unchanged — already right | |
| Data/labels | mixed | `tabular-nums` everywhere numbers align (mostly done); 11px uppercase +0.06em for product-chrome labels | |

Implementation: extend `globals.css` `@theme` with `--text-display-1/2/3` sizes, or utility classes `type-display-1..3` — one definition, no per-component clamps. The repo already ships `@fontsource-variable/inter`; enable `font-optical-sizing: auto` on headings so large sizes render the display cut.

---

## 5. S1 — the light editorial hero

**Layout:** unchanged 55/45 split. **Everything that was fought for stays:** the score-promise H1, four chips, one green CTA, friction row, Discovery escape hatch, "see all 12 sectors" link. The assessments' alternative H1 ("Know where your privacy gaps are…") goes into the R3 copy-test backlog — approved copy doesn't churn for taste.

- **Ground:** `cloud-25` with a faint data-governance geometry layer — a fixed SVG of nodes and connecting paths in navy at **2.5–3% opacity** (measures ~1.06:1: felt, not seen). This replaces the current two radial-gradient glows, which are exactly the cliché both assessments name. `aria-hidden`, no motion.
- **Ink:** navy-700 H1 (17.31:1), slate-700 body, slate-600 support.
- **CTA:** `Button variant="primary"` — green-700 fill, white label, 5.48:1. Brand-lock compliant.
- **Chips:** light segmented control — white fill, cloud-200 border; active = green-700 border + `green-50` tint + small check (green-700 on green-50 = 5.05:1 ✓). Hover per the one grammar (§9).
- **Right — the Privacy Readiness Snapshot.** The teaser card grows product chrome without violating the S4 dedupe rule. *Snapshot* ≠ *report*: a navy title bar (`PRIVACY READINESS SNAPSHOT · {sector}` in 11px caps), then score dial + band + **top exposure** + **first fix** + `View the full report ↓` anchor to S4. Data: `riskLine` from `hero-verdicts.ts`; first fix from `VERDICT_PREVIEWS[].firstActions[0]` for the three priority sectors; the sample state stays for `Other business`. This card carries the page's **one** noticeable shadow (`shadow-card-hover` depth) — the "product frame" exception both assessments allow.

---

## 6. S3 — Authority Moment 1: the risk map on navy

The centrepiece. Both assessments independently converge on it, and the master spec always wanted the scatter dark.

- **Surface:** navy-700. H2 at L1 scale in white; intro slate-300 (11.66:1).
- **The fan, re-inked for navy** (all measured): flow lines `teal-400` **7.41:1** (currently teal-700, which manages only 3.52:1 on navy — must step up) · tool chips become `navy-600` fills, white text, `border-white/10` · gap labels stay `gold-400` — **8.52:1** on navy, and this is where Signal Gold belongs · the hub inverts to a white chip so "your business" is the one light object in the dark frame.
- **The Privacy Thread, formalised (§7):** a horizontal lifecycle rail under the fan — `Collect → Use → Share → Store → Retain → Delete` — six nodes on a teal-400 dashed line, one node green-400 (a controlled stage) as the quiet promise that control is possible. This is the brand's signature device, introduced at its centrepiece.
- **The engagement upgrade rides along** (this is the same work item as the deferred R2 interactivity): tool chips become buttons; selecting one fills an adjacent evidence card — *data typically found · common exposure · recommended control* — from a new `lib/data/workflow-risks.ts`. Keyboard operable, `aria-live` on the card, no layout shift, reduced-motion = composed state.
- `AnswerBlock` already ships an `on-dark` variant — the "What is DPDPA?" block at the section's foot switches to it. Zero new work, speakable target unaffected.

---

## 7. The Privacy Thread — one motif, everywhere

The teal dashed flow line (`sp-dash-flow`) is already the site's accidental signature — the scatter and the HowItWorks connectors both use it. Formalise it:

- **Base line** teal (400 on navy, 700 on light) · **controlled/verified node** green · **exposure marker** gold · **unresolved** slate outline. Never red.
- Appears in: hero background geometry (faint) · S3 lifecycle rail + fan (hero of the motif) · S6 step connectors (exists) · S4 report card as a 2px top border in teal (the thread "enters" the report).
- Rule: the thread demonstrates data moving; it never decorates. If a use can't say what data is flowing, it doesn't get the thread.

---

## 8. S7 — the Sector Intelligence Matrix (content restored)

The one place this spec *adds* content back, per the no-drop instruction. The 3-tabs-plus-name-row compromise is replaced by **twelve equal compact cards** — every sector a first-class object again, without the old 2,100px wall:

- Grid `lg:grid-cols-4` (3 rows) / `md:grid-cols-3` / `grid-cols-2` mobile. Each card ~120px: icon · sector name · one-line primary exposure (the `risk` labels from the old wall — all 12 exist in git history) · quiet arrow.
- Selecting a card fills a detail panel below the grid: data types held (`painPoints`, all 12 recoverable from the old `AudienceCards`) · a recognisable workflow · typical band (**from `hero-verdicts.ts` — real data for all 12; sample *scores* exist only for the three priority sectors, and the other nine show the band, never an invented number**) · links to industry guide, assessment, and flow map where live.
- Internal-linking count goes *up* versus the name row (12 cards × guide+assessment links, panel adds flow links). `INTERNAL_LINKING_SPEC.md` satisfied.
- Estimated height ~800px — roughly par with today's 868px, versus the old wall's 2,100px.
- New `lib/data/sector-matrix.ts` consolidates this (single-sourced with `sectors.ts` order).

---

## 9. One interaction grammar

Every interactive element on the page responds identically. Hover: border steps one shade darker · arrow translates 3px · background shifts ≤2%. Selected: green-700 1px border · green-50 tint (navy surfaces: green-400 border · `white/5` tint) · check indicator. Focus: the existing 2px ring. Radius: pill for chips, 8 for buttons, 12 for cards — and burn down the three `rounded-2xl` legacy hits while here. CTA tiers: **primary** green fill (4 on the page + 1 chrome, unchanged) · **secondary** teal-800 semibold link · **tertiary** slate-600 quiet link.

---

## 10. The remaining sections, briefly

- **S4 report:** gains the same product-chrome header as the hero snapshot (navy title bar, `READINESS REPORT · SAMPLE`), the thread top-border, and score-bar fills animating once on first view (width transition, reduced-motion = final state). Dimension bars get 1px hairline tracks so the well reads as an instrument.
- **S8 Intelligence desk:** the briefings section moves to navy and reads as a desk, not a blog — eyebrow `SaralPrivacy Intelligence`, a `LATEST · {date}` stamp right-aligned in tabular figures. The deck's white cards sit directly on navy (white separates at 12.65:1 even against navy-600 — no hairline needed, per the Surface notes); "All briefings" becomes teal-300 (8.78:1). The deck itself — recently restored by Dilip's call — is untouched.
- **S9 Field Guide + resources:** the guide card is replaced by a **publication treatment**: a CSS-drawn minimal book cover (navy board, thread rule, `THE DPDPA FIELD GUIDE · 2026 edition`) beside its description and the real language row — `EN · हिंदी · ગુજરાતી · मराठी · ಕನ್ನಡ · தமிழ் · తెలుగు` from `GUIDE_LANGUAGES`. Checklist and templates cards flank it. No new claims, no mock screenshots.
- **S10 FAQ:** publication style — cards become hairline-separated rows (`border-b cloud-300` on the deep fill), 760px measure, question at 16px semibold, generous `py-5`. Decompression before the close.
- **S11 + footer:** already one continuous navy close. Footer adds the brand line under the wordmark (`Privacy made practical for India.`) and groups the Privacy Office / DPO block with a hairline — the "institutional finish" is 10 lines of change.

---

## 11. The Signal Gold conflict, and the language audit

**Gold.** The brand skill and both assessments define gold as *certification/premium, 5%, sparingly*. The codebase defines gold as *the risk colour* — load-bearing, because the brand also says **no red**, and something must mark exposure. Ruling until Dilip reconciles it in Brand Bible v3.1: **gold = attention/exposure on product surfaces** (bands, gap markers — unchanged), **ceremonial gold only on navy** (the press sidebar's "As seen in" eyebrow is the existing precedent). No red enters the system either way.

**"Compliance" → readiness.** Correct for body copy, dangerous for SEO surfaces. The homepage `<title>` is literally "DPDPA Compliance for Indian Businesses", and an Ahrefs keyword pull to verify what ranks was blocked by plan level — so: **check GSC first; until then, metadata, URLs (`/compliance-checklist`) and H1s keep their keywords.** Body-copy audit that is safe now: S8 intro "compliance guidance" → "practical guidance"; S9 checklist card copy leads with "statutory and operational controls" (already does); friction rows and CTAs already say readiness. Never "legal compliance" anywhere — that rule is absolute and currently satisfied.

---

## 12. Build order

**P0 — the perceived-quality jump** (one PR): type scale utilities + section intro sizing · hero flip (ground, geometry, ink, chip control, snapshot chrome) · S3 navy + re-inked fan + thread rail · interaction grammar + radius burn-down. *P0 acceptance:* every §13 pairing verified in the rendered DOM; `section-rhythm` zero; design-lint at/below baseline; no layout shift on chip select; 360px overflow 0; the page screenshot reads white-with-three-navy-moments.

**P1 — product maturity:** S3 clickable evidence cards (`workflow-risks.ts`) · S7 sector matrix (`sector-matrix.ts`) · S4 chrome + bar animation · S8 navy desk.

**P2 — polish:** S9 Field Guide treatment · S10 FAQ rows · footer finish · micro-motion pass · mobile refinement.

The R0 analytics gate from the final spec still stands — `scroll_depth` plus a baseline week before P0 ships, or the before/after is unmeasurable.

---

## 13. Pre-measured pairings (put these in the code comments)

| Pairing | Ratio | Use |
|---|---|---|
| teal-400 on navy-700 | 7.41:1 | S3 flow lines |
| teal-300 on navy-700 | 8.78:1 | links on navy |
| teal-700 on navy-700 | 3.52:1 | **do not use for text** — light-surface ink only |
| gold-400 on navy-700 | 8.52:1 | gap labels, S3 |
| slate-300 on navy-700 | 11.66:1 | body on navy |
| white on navy-600 | 12.65:1 | chip text, S3 |
| white on green-700 | 5.48:1 | the light-hero CTA (brand-lock compliant) |
| green-700 on green-50 | 5.05:1 | selected chip |
| navy-700 on cloud-25 | 17.31:1 | hero H1 |
| navy grid @3% on white | 1.06:1 | hero geometry — felt, not seen |

---

## 14. Open for Dilip

1. **The hero flip is the one reversible-but-visible call** — it retires the navy hero shipped two days ago. The case: both assessments, the Brand Bible's own light hero mock, the CTA lock resolving itself, and navy finally reaching its 45% proportion where it means something. Say the word and P0 builds; say keep-navy and everything else in this spec still applies.
2. Gold reconciliation for Brand Bible v3.1 (§11).
3. GSC keyword check before any metadata rename (§11).
4. The assessments' "Prove / Verified Digital Trust" narrative stage: the Trust Badge module has no live product yet, and the no-fake-doors rule holds — it enters S6's after-menu only when something real ships behind it.
