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
2. **Where DPDPA risk hides** [Problem] — *"Why should I care?"* The **Scatter** signature visual — personal data fans from the business to ~8 everyday tools, each carrying its own gold gap. Proves the hero's "hidden data you missed" claim. **Dark-navy continuation of the hero.** Detail: §3d.
3. **Trust ribbon** [Support] — *"Can I trust them?"* ANI · Business Standard · The Tribune · Lokmat Times · Latestly.
4. **How it works = do it now** [Core] — *"So what do I actually do?"* The 4-step ladder Discover → Assess → Fix → Get help, where **each step is a live card into the real tool** (Personal Data Discovery / assessment / Notice Pack / gap review). The merge: orientation + action in one section.
5. **Proof — sample + sector finder** [Core] — *"Does it fit MY business?"* One sample result (e.g. Clinic 41/100, illustrative) beside a compact pick-your-sector finder (**all 12**). Sectors are a finder here, NOT an early 12-card wall.
6. **Founder proof** [Support] — *"Who's behind this?"* Dilip Sahu · CA · IIM Bangalore · 22+ yrs enterprise.
7. **Get help** [Core] — *"I need a person."* Request a free gap review. Placed at the **trust peak** (right after the founder block), before the engagement catch.
8. **Stay current** [Support] — *"Not ready — keep me sharp."* ONE block consolidating Daily Briefings + DPDPA learning + blog + newsletter/FAQ. The engagement/SEO engine, kept below the conversion beats.
9. **Footer** — sectors · sitemap · legal.

**Why 9 beats (was 8):** added **Beat 2 (Scatter)** as the single problem/thesis visual immediately after the hero, above Trust — agreed 2026-06-25. Still de-duped: merged Journey + Discovery + Assessment + Fix into beat 4; folded the 12-card wall into beat 5's finder; consolidated Briefings + Newsletter + FAQ into beat 8. **Get help (7) sits before Stay current (8)** — ask for the human at the trust peak, then catch the rest. The **Lifecycle** visual is deliberately NOT on the landing → it lives on the Discovery tool (see `docs/visual-system/`).

## 3a. Beat 4 detail — "How it works = do it now" (animated flow)
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

**Relationship to the beats:** this branch previews the *ongoing* layer; it does NOT replace beat 7 (Get help / free gap review) or beat 8 (Stay current) — those remain. Daily Brief appears here as a teaser and again in the consolidated Stay-current block.

**Motion:**
- **Boxes slide up + fade in, staggered** top→bottom (Discover → … → branches) so the eye is led down the path.
- **Active flow line** — each dashed connector fades in right after its source box lands, then keeps a continuous "marching" flow (animated `stroke-dashoffset`). The Coming-soon branch connector is **static + muted**.
- **`prefers-reduced-motion`**: render the final composed state instantly, no movement. Non-negotiable.

**Build notes:**
- **Centering lesson (don't repeat the bug):** never mix a width-stretching SVG (`width:100%` + `preserveAspectRatio="none"`) with fixed-px HTML boxes — the SVG centre drifts off the box centre on wide screens. Pin the whole diagram to one **fixed canvas** (e.g. 660×644, `margin:0 auto`) so SVG and boxes share one coordinate system. Or make both fully percentage-based.
- In production the box links are Next.js `<Link>` (client nav), routes identical to above. Plain CSS `@keyframes` — add an `IntersectionObserver` if you want replay on scroll-into-view.
- This becomes the `HowItWorks` component in Stage 1.

## 3b. Beat 5 detail — "Proof + sector finder" (brand-styled)
The "does it fit MY business?" beat. **Light** section (per the dark-zones rule, §3c). Visual reference: session `beat4_proof_finder_brand` (brand-styled) — supersedes the earlier generic-token mock.

**Layout:** Cloud-50 surface → centered header (eyebrow "Proof" in Assurance Teal · H2 "Does this fit your business?" · sub) → two columns → one centered green CTA.
- **Left — sample result card** (white, hairline border, no shadow). Sector name (navy) + "Sample · illustrative" pill (honest — never fake "your" data). Score ring **41/100 in Signal Gold** (NO red — see tokens) + "High-priority action" pill (gold bg + navy text). **Top gap** (gold alert icon) + **First fix** (green check). Quiet teal link "See the clinic assessment" → `/assessment/clinics-diagnostic-labs`.
- **Right — sector finder.** "Find your sector" + all **12 sector chips** (navy text on white, hairline, Assurance Teal hover) → `/assessment/{assessmentSlug}` from `sectors.ts`. Quiet navigation, NOT 12 green buttons.
- **One primary CTA (green):** "Take your free assessment" → `/assessment`. Subtle teal link below: "Not listed? Start with Discovery" → `/discovery` (no dead ends).

**Optional v1+ enhancement:** the sample card swaps to match the sector the visitor hovers/taps in the finder (small JS) — makes the proof personal.

## 3c. Brand tokens (CANONICAL — governs every beat)
Source: SaralPrivacy brand skill (`anthropic-skills:saralprivacy-brand`). All beats must use these; re-skin the hero + how-it-works flow to match.

**Palette (hex · role · rough share of surface):**
| Name | Hex | Use | Share |
|---|---|---|---|
| Trust Navy | `#121A2E` | Hero/dark bg, headings, badge core | ~45% |
| Verification Green | `#07B981` | The ONE primary CTA, active states, trust affirmations | ~20% |
| Assurance Teal | `#35B6AE` | Hover cues, secondary accent, quiet links | ~10% |
| Signal Gold | `#E8AB42` | Risk/attention + single emphasis only | ~5% |
| Slate 700 | `#334155` | Body copy on light bg | ~10% |
| Cloud 50 | `#F7F9FC` | Light section surfaces, whitespace | ~10% |

**Locked rules:**
- **No red anywhere.** Risk = Signal Gold. This is deliberate — it enforces "explain risk calmly, never raise the pulse." Alarm-red is off-brand.
- **CTA button is locked:** Verification Green bg + white label. Never ghost/outline green. **One primary CTA per beat** — green is reserved for it; everything else (finder chips, nav) is quiet (navy/teal).
- **Forbidden combos:** gold text on white · green bg + teal text · navy bg + slate text · any gradient as a primary background.
- **Hairlines, not shadows** (`1px solid rgba(18,26,46,0.08–0.10)`).
- **Dark zones (updated 2026-06-25):** the **problem opening = Hero + Scatter (Beats 1–2), one continuous Trust-Navy block**, plus the **how-it-works flow (Beat 4)** and the **final CTA**. Every other beat (Trust, Proof, Founder, Get help, Stay current) is light (Cloud-50/white). Supersedes the earlier "two dark moments only" — the agreed dark Scatter continuation makes the opening one continuous dark moment. Brand mocks are fixed-palette (NOT theme-adaptive) because the live site is a fixed light/dark system, not claude-adaptive.
- **Typography — Inter:** H1 48/56 bold · H2 32/38 bold · H3 24/30 semibold · Body 16/24 regular · Button 16 semibold · Label/pill 12 medium. Fallback `system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`.

**Copy rules (brand non-negotiables):** sentence case · active voice · India-first (DPDPA, not GDPR) · no fear-mongering · never the phrase "legal compliance" (use "privacy readiness", "trust signal", "data protection practice") · lead with business consequence then the fix · answer the 3 silent questions fast (does this apply to me? what's my risk? what do I do next?).

## 3d. Beat 2 detail — "Where DPDPA risk hides" (Scatter — signature visual)
The single **problem / thesis** beat, placed **immediately after the Hero, above Trust** (agreed 2026-06-25). It proves the hero's "hidden data you missed" claim — claim → proof — then the page pivots to credibility (Trust) and the fix (How it works). It IS the brand **signature visual** (`docs/visual-system/`), reused on Discovery / deck / reports. Visual reference: session `where_risk_hides_adjacent_gaps`.

**Surface:** **dark-navy continuation of the Hero** (Trust Navy) — feels like the hero "opening up" to reveal where the data went; the page then goes light at Trust. (Hero + Scatter = one continuous dark moment — see §3c dark-zones.)

**Design (brand kit):** hub **"Your business"** (navy) → data **fans out** (Assurance Teal dashed connectors) to ~8 everyday tools rendered as **mono navy icons** (NOT brand-colour logos — no logo soup) → each tool carries its **own gold gap adjacent** (consent / access / retention / vendor / evidence). **Gold is the only attention colour** (= risk). Eyebrow "Where DPDPA risk hides" · H2 "Follow the data. The risk becomes visible." · sub = the thesis line. Calm, no red, no fear.

**Animation (agreed):** **scroll-triggered, play once** (`IntersectionObserver`). The teal lines **flow outward** from the hub to each tool *in sequence* (data escaping the building), and each **gold gap snaps in the moment its line lands** — "data escapes → gap appears." `prefers-reduced-motion` → composed state instantly, no movement.

**Build:** use the **fixed-canvas** technique (avoid the SVG-centre-drift bug — see §3a build notes). Becomes a `WhereRiskHides` component. **Lifecycle is NOT on the landing** — it's a Discovery-tool/guide asset (`docs/visual-system/`).

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
