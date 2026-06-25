# Hero Spec — Interactive "Is this me?" Hero

_Created 2026-06-25. Committed immediately (durability rule). Parent context: `LANDING_PAGE_STRUCTURE.md` (§3 row 2) + `LANDING_PAGE_HANDOFF.md`. Visual reference: session `saralprivacy_interactive_hero_concept`._

---

## 1. The job
The hero IS the first rung of the conversion ladder, not a billboard. It answers the Indian SMB owner's first question — **"does DPDPA even apply to me?"** — by letting them self-identify and get an instant, sector-specific taste, then opens a loop that pulls them down the page.

**Mechanism (3 beats):**
1. **Self-identify** — tap your business type (micro-yes; endowment).
2. **Instant taste** — inline verdict: applies + 1–2 sector risk facts + likely band. Value before any ask.
3. **Deliberate incompleteness** — name what's hidden but don't reveal it; point down ("full map below ↓"). Zeigarnik loop = compulsory scroll.

## 2. Component shape
- `HeroSection.tsx` becomes (or wraps) a **client component** — needs `useState` for selected sector.
- New data module: `lib/data/hero-verdicts.ts` — keyed by `assessmentSlug` (from `sectors.ts`, the 12 live sectors), so it can never drift from the canonical list.
- On select → render the verdict card (no navigation, no fetch — pure client lookup).
- Primary CTA href = `/discovery?sector={slug}` (pre-fill Discovery with the chosen sector → next step even lower friction). If Discovery can't accept the param yet, fall back to `/discovery` and treat the pre-fill as a fast-follow.
- Secondary CTA = `/assessment/{assessmentSlug}` (their sector's assessment) — or `/assessment` hub if none selected.

### Data model
```ts
// lib/data/hero-verdicts.ts
export interface HeroVerdict {
  slug: string;          // === Sector.assessmentSlug
  chipLabel: string;     // short, fits a pill: "Diagnostic lab"
  applies: true;         // all 12 are in-scope; copy still says "applies"
  band: "Low" | "Moderate" | "High";   // typical band — CONFIRM from pack
  riskLine: string;      // ONE sector-true sentence (the taste)
  hiddenHook: string;    // "and N most owners miss" — N CONFIRM from pack/Discovery
}
```
**Source-of-truth rule:** `band`, the risk facts, and any count (N) must be lifted from each sector's **pack content / Discovery data-map** — do NOT invent numbers. The `riskLine` drafts below are credible starters; verify against the pack before ship.

## 3. Copy — all 12 sectors
Chip order = `sectors.ts` order. `riskLine` = the one-sentence taste. `band`/N = CONFIRM.

| assessmentSlug | chipLabel | riskLine (draft — verify vs pack) | band* |
|---|---|---|---|
| recruitment | Recruitment agency | You hold candidate IDs, CVs and references far longer than you need to. | Mod–High |
| ca-firms | CA firm | Client PAN, financials and KYC sit across email, drives and WhatsApp. | High |
| training-institutes | Training institute | Student records, fee data and parent contacts often have no retention limit. | Moderate |
| d2c-brands | D2C brand | Customer addresses, order history and ad-pixel data flow to many vendors. | Mod–High |
| clinics-diagnostic-labs | Diagnostic lab | You hold high-impact health data — and share reports over WhatsApp. | High |
| schools-colleges | School / college | Children's data carries the strictest consent and verifiable-parent rules. | High |
| law-firms | Law firm | Privileged client matters and IDs sit in inboxes and shared drives. | High |
| real-estate | Real estate firm | KYC, income proofs and Aadhaar copies pile up across deals and brokers. | Mod–High |
| hotels-travel | Hotel / travel | Guest IDs, card details and CCTV/Wi-Fi logs are retained too long. | Moderate |
| pharmacies | Pharmacy | Prescriptions reveal high-impact health data tied to identity. | High |
| fintech-nbfc | Fintech / NBFC | High-impact financial data and KYC flow through many third parties. | High |
| gyms-salons-spas | Gym / salon / spa | Member health notes, photos and biometric check-ins are personal data. | Moderate |

*band = typical/illustrative; the live verdict should phrase it as "labs typically land in **High**" — clearly an estimate, with the real score coming from Discovery/Assessment.

**Verdict card copy pattern:**
> ✓ DPDPA applies to {chipLabel}s. {riskLine} Most {chipLabel}s land around **{band}** — see your real score and the {hiddenHook} in your full map.

## 4. States (the design-review gap was state coverage — cover all)
- **Default (no sector picked):** H1 + subhead + chips + a neutral placeholder where the verdict will appear ("Pick your business type to see if DPDPA applies to you"). Primary CTA = "Discover my data" → `/discovery`; secondary = "Take the assessment" → `/assessment`. Never a dead/empty CTA.
- **Selected:** verdict card renders; CTAs gain `?sector=`/sector slug; chip shows selected (green, check). Smooth height transition, **no layout jump** (reserve min-height for the verdict slot).
- **"+ N more" / not-listed:** expands the full 12, plus a "Not listed? Start with Discovery" link → `/discovery` (general). No owner is dead-ended.
- **Mobile (<640px):** chips become a full-width native `<select>` ("I run a…") OR a horizontally scrollable chip row; verdict card stacks below; CTAs full-width stacked; press line wraps. Thumb-reachable primary.
- **Keyboard / a11y:** chips are real `<button>`s in a labelled group (`role="group"` + `aria-label="Select your business type"`); selected = `aria-pressed`; verdict slot is `aria-live="polite"` so the result is announced; focus-visible rings on every chip + CTA; `prefers-reduced-motion` disables the reveal animation. Contrast ≥4.5:1 (the navy/slate hero text must pass — the design review flagged a11y at 5/10).

## 5. Analytics (instrument from day one — this is the metric the CEO review wants)
Fire events: `hero_sector_select` (with sector), `hero_cta_discover_click`, `hero_cta_assess_click`. The sector-select tap is a clean top-of-funnel engagement signal AND segments the lead before any form. Reuse `lib/analytics.ts`.

## 6. What to remove from the current hero
Drop the 4-stat bar (200+/12/50+) — vanity proof competing with the one action. Move those into the trust strip. Hero does exactly one job.

## 7. Build order / dependencies
1. `lib/data/hero-verdicts.ts` (data) — verify band + N per pack.
2. Client `HeroSection` with sector state + verdict slot + states above.
3. `/discovery?sector=` pre-fill (or fast-follow).
4. Analytics events.
5. `/plan-design-review` the hero (clear ≥8 — first expression of the new design language) before merge.

**Gated by handoff §7:** design gate (Path 1 vs 2) and metrics-first. This hero is the ideal surface to instrument and to test the snapshot-in-hero question (decision #4 — this spec puts the snapshot IN the hero as a live verdict, which resolves #4 toward "hero").
