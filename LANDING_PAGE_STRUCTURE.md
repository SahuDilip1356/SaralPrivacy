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

## 3. Target structure — refined 8-beat flow (build to this)
Organized by the **visitor's question at each scroll**, not by section type. This supersedes the
earlier 13-section inventory (de-duplicated). Visuals: session `saralprivacy_landing_flow_v2` (this flow)
+ `saralprivacy_landing_conversion_structure` (the inventory it came from).

Order top→bottom. **Core** = carries conversion; **Support** = secondary.

1. **Hero** [Core] — *"Is DPDPA even for me?"* Is-this-me sector pick → instant verdict. The alert bar (DPDP Rules window) is a thin strip in this region. Primary CTA = Discover, secondary = Assess. Detail: `LANDING_PAGE_HERO_SPEC.md`.
2. **Trust ribbon** [Support] — *"Can I trust them?"* ANI · Business Standard · The Tribune · Lokmat Times · Latestly.
3. **How it works = do it now** [Core] — *"So what do I actually do?"* The 4-step ladder Discover → Assess → Fix → Get help, where **each step is a live card into the real tool** (Personal Data Discovery / assessment / Notice Pack / gap review). The merge: orientation + action in one section.
4. **Proof — sample + sector finder** [Core] — *"Does it fit MY business?"* One sample result (e.g. Clinic 41/100, illustrative) beside a compact pick-your-sector finder (**all 12**). Sectors are a finder here, NOT an early 12-card wall.
5. **Founder proof** [Support] — *"Who's behind this?"* Dilip Sahu · CA · IIM Bangalore · 22+ yrs enterprise.
6. **Get help** [Core] — *"I need a person."* Request a free gap review. Placed at the **trust peak** (right after the founder block), before the engagement catch.
7. **Stay current** [Support] — *"Not ready — keep me sharp."* ONE block consolidating Daily Briefings + DPDPA learning + blog + newsletter/FAQ. The engagement/SEO engine, kept below the conversion beats.
8. **Footer** — sectors · sitemap · legal.

**Why 8 not 13:** merged Journey + Discovery + Assessment + Fix into beat 3; folded the 12-card wall into beat 4's finder; consolidated Briefings + Newsletter + FAQ into beat 7. De-dupes repeated orientation/action and gives explicit Core/Support hierarchy. Order refinement vs the v2 diagram: **Get help (6) sits before Stay current (7)** — ask for the human at the trust peak, then catch the rest.

## 3a. Beat 3 detail — "How it works = do it now" (animated flow)
The Core converting beat. A single **centered vertical flow**: a 3-step spine → a milestone → a 3-way "keep it living" branch. Orientation (the numbered path) and action (each box is a live link) in one section. Visual reference: session `how_it_works_centered_fixed`.

**Structure (top → bottom, all centered on one axis):**
1. **Discover** — _Data Discovery · map your data_ → `/discovery` (teal, badge 1)
2. **Assess** — _Generic Assessment · score your risk_ → `/assessment` (green, badge 2)
3. **Fix what matters** — _Notice Pack · generate your notices_ → `/tools/dpdpa-privacy-notice-generator` (amber, badge 3)
4. **Milestone: "You're DPDPA-ready"** — _the basics are done — now keep it living._ Emerald shield, brighter border. Status marker, **not** a link (unless we later point it at `/assessment`).
5. **Branch into 3 "keep it living" leaves** (fan from the milestone):
   - **Daily Brief** — _5-min updates + actions_ → `/briefings`
   - **Sector Deep Dive** — _go deeper on your sector_ → `/industries`
   - **Deep Review** — **Coming soon** (dashed border, muted, `not-allowed` cursor, static connector, no link until it ships)

**Relationship to the 8 beats:** this branch previews the *ongoing* layer; it does NOT replace beat 6 (Get help / free gap review) or beat 7 (Stay current) — those remain. Daily Brief appears here as a teaser and again in the consolidated Stay-current block.

**Motion:**
- **Boxes slide up + fade in, staggered** top→bottom (Discover → … → branches) so the eye is led down the path.
- **Active flow line** — each dashed connector fades in right after its source box lands, then keeps a continuous "marching" flow (animated `stroke-dashoffset`). The Coming-soon branch connector is **static + muted**.
- **`prefers-reduced-motion`**: render the final composed state instantly, no movement. Non-negotiable.

**Build notes:**
- **Centering lesson (don't repeat the bug):** never mix a width-stretching SVG (`width:100%` + `preserveAspectRatio="none"`) with fixed-px HTML boxes — the SVG centre drifts off the box centre on wide screens. Pin the whole diagram to one **fixed canvas** (e.g. 660×644, `margin:0 auto`) so SVG and boxes share one coordinate system. Or make both fully percentage-based.
- In production the box links are Next.js `<Link>` (client nav), routes identical to above. Plain CSS `@keyframes` — add an `IntersectionObserver` if you want replay on scroll-into-view.
- This becomes the `HowItWorks` component in Stage 1.

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
