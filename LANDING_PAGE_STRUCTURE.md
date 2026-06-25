# Landing Page — Conversion Structure (Indian SMB)

_Created 2026-06-25. Committed immediately (durability rule — see `LANDING_PAGE_HANDOFF.md` §0). This is the IA + conversion rationale for the homepage rebuild. Companion: `LANDING_PAGE_HANDOFF.md` (scope/decisions), `LANDING_PAGE_BACKLOG.md` (bug register), `docs/landing/mockup-v2.html` (visual)._

---

## 0. The audience we're designing for
Indian SMB owner / ops lead, 10–50 staff, one of the 12 live sectors. Phone-first. Price-sensitive. Skeptical of "compliance" vendors and fatigued by fear-mongering. Trusts **people and credentials** over badges. Decides in this order:
1. **Does DPDPA even apply to me?**
2. **Where do I actually stand?**
3. **What do I do next — concretely?**

The page must answer those three in that order. Today it inverts them.

## 1. The conversion ladder (the spine)
Each rung asks for slightly more commitment. Lead with the lowest-friction rung.

| Rung | Tool | Commitment | Phase colour |
|------|------|-----------|--------------|
| **Discover** | Personal Data Discovery | none — **no email** | teal |
| **Assess** | Readiness assessment | low — **no account** | green |
| **Fix** | Notice generator + Guide + templates | medium — email gate at value | amber |
| **Get help** | Free gap review (consultation) | high — human contact | blue |

Trust + proof wraps the ladder (press strip, founder block). Briefings/newsletter are **return-visit engagement**, not the entry point.

## 2. Current problem (verified in live code, 2026-06-25)
- `app/page.tsx` order: Hero → AnswerBlock → TrustStrip → PressProofStrip → **AudienceCards (12-card wall)** → **BriefingsSection** → DiscoveryCTA → AssessmentCTA → NoticeCTA → WhitePaper → FAQ → Newsletter → Consultation.
- **Discovery (no-email entry) sits 6th**, below a 12-card wall and Briefings. The lowest-friction rung is buried.
- `HeroSection.tsx`: H1 = "Privacy made practical for Indian businesses" (brand-led, doesn't answer "does this apply / where do I stand"); primary CTA = **Take Free Assessment** → `/assessment`; secondary = Download the Guide. **Discovery is not in the hero at all.**
- Discovery and Assessment CTAs sit adjacent, **both green, undifferentiated** → competing CTAs.
- `AssessmentCTA.tsx:31-40` picker hardcodes **only 8 of 12 sectors** (missing hotels-travel, pharmacies, fintech-nbfc, gyms-salons-spas) — credibility leak. `AudienceCards` already has all 12.

## 3. Target structure (build to this)
Annotated wireframe rendered in session `saralprivacy_landing_conversion_structure`. Order top→bottom:

1. **Alert bar** — DPDP Rules, 2025 window. _Factual deadline, not fear._
2. **Hero** — H1 "See exactly where your business stands on DPDPA". Primary CTA = **Discover**, secondary = Assess. Nav button aligned to the same first action.
3. **Press + trust strip** — ANI · Business Standard · The Tribune · Lokmat Times · Latestly.
4. **Journey strip** — Discover → Assess → Fix → Get help (fold the "Where to start?" chooser in).
5. **Discover** — Personal Data Discovery. _Map your data · no email · instant snapshot._ (teal)
6. **Assess** — Readiness assessment **+ sample-result card** (e.g. Clinic 41/100, High-priority, top gap, first fix — labelled "illustrative"). Picker = **all 12 sectors**. _No account._ (green)
7. **Audience cards** — grouped (not a wall). A sector *finder*, not choice-overload. (support)
8. **Fix** — Notice generator + Guide + templates. _Do the next thing, not just read._ (amber)
9. **Founder proof** — Dilip Sahu: CA · IIM Bangalore · 22+ yrs enterprise (ERP, finance, governance, controls). _People-trust anchor._
10. **Get help** — rename consultation → **"Request free gap review."** (blue)
11. **Briefings** — moved DOWN. Return-visit engagement.
12. **Newsletter + FAQ** — capture + objection handling.
13. **Footer.**

## 4. Indian-SMB design principles (non-negotiable)
- **Clarity over fear.** Calm converts this audience; fear bounces them. No "penalties will ruin you."
- **Show the outcome before asking for anything.** Ungated preview (Discovery no-email, Assessment no-account) is the biggest conversion asset — surface it.
- **One clear next action per viewport.** Never two identical green CTAs competing.
- **Specificity sells.** Real sector names, real snapshot numbers (61/High), "276 business types mapped" beat abstract claims.
- **People trust people.** Founder credentials > badges. (Trust badge stays DEFERRED — credibility own-goal.)
- **Free + no-friction, stated loudly** at each rung: "Free · No email · No account."
- **Mobile-first.** Short hero, thumb-reachable primary CTA, plain English.

## 5. Copy / positioning shifts
- Hero H1 → "See exactly where your business stands on DPDPA" (Option A; NOT the fear-leaning variant, NOT current brand-led line).
- Hero primary CTA → Discover; nav button aligned to it.
- Add sample-result card in Assessment section.
- Add founder-proof block before consultation.
- Rename consultation CTA → "Request free gap review."
- Ride-along copy fixes (from handoff §5): 3–5 min everywhere (kill "10 minutes"); Guide "45-page"→"59-page" + "4-sector"→"12 sector"; "90-day"→"30–90 days"; add Lokmat Times to press.

## 6. Execution order (lowest-risk first)
1. **Tier 0 — 8→12 picker fix.** Wire `AssessmentCTA.tsx` picker to `lib/data/sectors.ts`. Ships alone, no design/metric dependency. (Needs a `questionCount` field on sectors.ts, or drop the count.)
2. **Instrument current homepage** (Discovery click, Assessment click, scroll-depth) — 5–7 day baseline before reorder (CEO-flagged prereq).
3. **Tier 1 restructure** — reorder per §3, build JourneyStrip, add sample-result + founder proof, hero H1/CTA swap. Run `/plan-eng-review` on the JourneyStrip + reorder slice first.

## 7. Open decisions (still need Dilip — see handoff §7)
Design gate (Path 1 vs 2) · multilingual scope · hero-snapshot placement (hero vs assessment vs both) · confirm metrics-first.
