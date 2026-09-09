# The Four Conversion Slices — plain-language explainer

**What this is.** A roadmap note (from the 2026-09-08 engineering-blocks session) describing four
small, independent pieces of landing-page and sharing work. Each one is meant to move a visitor
one step closer to *starting an assessment* or *telling someone else about SaralPrivacy*. They are
called "slices" because each is thin enough to ship on its own between the bigger P5 steps.

**Why they exist.** Operation Pounce needs a fit signal at Gate 3: at least 25 paying customers and
at least 2 conversions per 100 assessments. The site already has the content and tools. What it
lacks is a tighter path from "I landed here" to "I ran the assessment" and "I forwarded it". These
four slices are the cheapest ways to shorten that path without building anything new underneath.

**Status.** None of the four has started. None is greenfield either — every slice is a thin layer on
something that already exists in the codebase:

| Existing surface | Where it lives | Which slice builds on it |
|---|---|---|
| Hero sector chips + 12 illustrative verdicts | `webapp/components/home/HeroSection.tsx`, `webapp/lib/data/hero-verdicts.ts` | C1 |
| Risk beat with sector chips + lifecycle-stage panel | `webapp/components/home/WhereRiskHides.tsx` | C4 |
| WhatsApp share links (blog + briefings only today) | blog/briefing pages | C3 |
| Our own DPO + 7 sub-processors, public privacy + rights pages | `webapp/lib/data/privacy-vendors.ts`, `/privacy`, `/rights` | C2 |

---

## C1 — Hero two-tap verdict (8–12 h)

**Today.** The hero has four sector chips. Tap one and you get a one-line "typical risk" sentence
from `hero-verdicts.ts`. That is tap one.

**The slice.** Add a second tap: one yes/no applicability question, e.g. *"Do you collect personal
data of people in India digitally?"* Answering it turns the chip into a small **verdict card**:

- DPDPA applies (or not)
- the typical risk band for that sector
- one concrete first action
- a CTA into that sector's assessment, with the sector pre-selected

**How we know it worked.** The gate is *assessment starts per 100 sessions*. That number has never
been captured, so the first task is to record the baseline **before** shipping. Without a baseline
the after-number is unreadable.

## C2 — "Inspect us" beat (6–10 h)

**Today.** We already publish our own privacy notice, our DPO, our 7 sub-processors and a rights
route. They live on separate pages that a landing-page visitor never sees.

**The slice.** One new landing-page section that surfaces those four things in one place, framed as
*"we run what we sell"*. Work is one component, a handful of links, and copy. No new data, no
analytics dependency.

**Why it is first.** Cheapest slice, zero risk, and it seeds the dog-food story the paid app (P5)
will need: the product's own compliance is on display.

## C3 — WhatsApp share cards (10–16 h)

**Today.** WhatsApp share links exist only on blog and briefing pages. Assessment reports and
flow-map results, the things people actually want to forward, have none.

**The slice.**

- a pre-filled WhatsApp share link on assessment reports and data-flow-map results
- a server-rendered preview image so the score travels with the link (the card people see in chat)
- a new **PII-free public summary route** that the link points to

**Hard rules.**

- Share the public summary route, **never** the token-bearing report URL.
- A `share` analytics event carrying `channel` and `surface` must be seen firing on **preview**
  before the PR merges. (Analytics law: verify new events fire before merge.)

## C4 — Data-travel teaser (4–6 h spec, then 10–16 h build)

**Today.** The risk beat on the landing page shows sector chips and a lifecycle-stage panel. It is
static.

**The slice.** Evolve that beat into a small animated teaser of how data travels:

- one lane of 4–5 stages
- one red hotspot
- 2–3 sector tabs
- CSS-animated, server-rendered from the packs' union spines (the shared stage sequence the 12
  data-flow maps already derive)

**Standing constraints that still hold.** No full lane board on the homepage. No mega-menu. No rename
of the `/data-mapping` route. The full simulator stays a paid-tier feature after Gate 3.

**Sequencing note.** Write the C4 spec early, during the P5 spec pass, so its design review can
happen offline while other work proceeds.

---

## The interleave rule

P5 is the paid app plus Razorpay, and step 5.1 is the monorepo / subdomain move that the R1–R7
refactors ride on. The slices slot in between P5 steps:

1. **One slice at a time.** Never two in flight.
2. **Each slice ships wholly before 5.1 or wholly after it.** Never straddle the move; a half-built
   slice across a tree move is a merge nightmare.
3. **Recommended order: C2 → C1 → C3 → C4.** Cheapest and safest first; the two analytics-dependent
   slices later; C4 last because it needs a spec and review first.
4. **Every slice passes design review** (`/plan-design-review`, avg ≥ 8) **and the contrast law**
   (compute contrast before shipping any new CTA; this palette has pairs that look fine and fail).
5. **Preview-before-prod applies**, as always.

## One-line summary per slice

| Slice | In one sentence | Hours | Depends on |
|---|---|---|---|
| C1 | Second tap on the hero turns a sector chip into a verdict card with a pre-selected assessment CTA | 8–12 | Baseline for assessment starts / 100 sessions |
| C2 | Landing beat that shows our own notice, sub-processors, DPO and rights route | 6–10 | Nothing |
| C3 | WhatsApp share on reports + flow maps, via a PII-free summary route with a preview image | 10–16 | `share` event verified on preview |
| C4 | Animated one-lane data-travel teaser replacing the static risk beat | 4–6 spec + 10–16 build | Spec + design review first |
