# Landing Page Phase 2 — Proof-First Spec

**Status:** BUILT ✅ (A `08a48d1`, B `a19ad43`, C `16b1bcf`, D `ce0143a`, D-fix `270d874`) on branch feat/landing-redesign · design-review passed (7.5→8.6 after 3 fixes) · preview-verified · awaiting Dilip eyeball → prod merge. 7-day keep/kill gate on Beat 5 starts at prod ship.
**Date:** 2026-07-12
**Baseline:** prod `397c422` (hero chip-shift fix, ProofSection retired, HowItWorks leaf arrows)
**Trigger:** Comparative review vs getmedesign.com — their page *shows* product artifacts at every step; ours *tells*. This phase embeds proof without importing their scroll-jack cinematics.

---

## CEO review (logged)

- **Mode:** Selective Expansion — smallest slice proving "proof on the page increases tool starts."
- **Rejected:** Expansion (inline mini-assessment — build after Beat 5B proves engagement), Hold (known proof gap, cheap remedy), Reduction (drops only — proves nothing).
- **Wedge:** only DPDPA property showing a real scored sector verdict before asking for email.
- **Riskiest assumption:** proof increases /assessment + /discovery clicks, not scroll weight. Test: GA4 events on new surfaces, 7-day CTR vs baseline, kill/keep on Beat 5B.
- **Unit economics @10×:** flat — all static/client-side, zero Appwrite reads on landing.

---

## Scope

### In
- **A. Reductions/moves** — FounderProof → /about; ConsultationCTA off landing.
- **B. Hero polish** — dial draw-in animation, verdict-band reveal delay, copy emphasis.
- **C. HowItWorks step artifacts** — one mini product artifact + caps micro-outcome caption per step.
- **D. Beat 5 reborn: "See a real verdict"** — slim light band, 3 sector tabs flipping one compact report-style card (Option B, chosen by Dilip).
- **E. Analytics** — GA4 events for every new interactive surface.

### Out (explicitly)
- Sector wall (AudienceCards), Briefings, DPDPA Guide, FAQ, Newsletter, Footer, Header — **untouched** (Dilip directive).
- WhereRiskHides artifact upgrade — backlog.
- Inline 3-question mini-assessment — deferred until Beat 5B engagement data (1-week gate).
- Any engine/pack/sectors.ts change — none needed, none allowed.
- Scroll-jacking, pinned sections, GSAP-style libraries — rejected; conflicts with 3–5-min plain-English positioning and AEO (static crawlable text is a hard requirement).

---

## Workstream A — Reductions & moves

### A1. FounderProof → About page
- **Landing:** remove import + `<FounderProof />` from `webapp/app/page.tsx`; comment Beat 6 as retired-to-About.
- **About:** insert `<FounderProof />` in `webapp/app/about/page.tsx` immediately after the green answer box (trust question answered early). Component used as-is (cloud-50 section works on the slate-50 page). File stays at `components/home/FounderProof.tsx` this phase (move to `components/about/` only if a second About-only component ever appears).
- **Rationale:** About page currently has zero named-founder content — genuine gap; landing sheds a beat.

### A2. Drop ConsultationCTA from landing
- Remove import + usage from `page.tsx` only. **Pre-check:** grep for other usages; component file survives if referenced elsewhere (it likely is — verify before any delete).
- Consultation remains reachable: Header, Footer, /contact, FAQ "reach out" line.

### A3. Page rhythm check (acceptance criterion)
- Post-drop sequence: Hero(dark) → WhereRiskHides(dark) → Trust/Answer(light) → HowItWorks(dark) → **Beat 5B(light)** → AudienceCards → Briefings → …
- Beat 5B intentionally restores the light breather lost with FounderProof. Verify no two adjacent same-bg seams look like one endless section (screenshot check in preview).

---

## Workstream B — Hero polish

**Untouched:** headline, subcopy, badge, 12 chips + `heroSectorSelect` analytics, both CTAs + `landingCtaClick`, friction row items, verdict logic, `lg:min-h-[340px]`, chip no-bold fix.

### B1. Sample dial draw-in
- Replace the static `conic-gradient` donut in the sample card with an inline SVG arc (`stroke-dasharray` animation) + JS count-up 0→41 (~900ms, ease-out), triggered once via IntersectionObserver.
- `prefers-reduced-motion: reduce` → render final state, no animation (match existing `motion-reduce` idiom in HowItWorks).
- SSR renders the **final** state (41 + full arc); animation is a client enhancement — zero CLS, zero hydration divergence (no random values).

### B2. Verdict-band reveal
- On chip select, the verdict card animates in as today; the "Typical risk → Moderate/High" band chip fades/slides in after a ~200ms delay (CSS `animation-delay`, no JS timer). One beat of "computing" = feels like a read, not a lookup.

### B3. Copy emphasis
- Friction row: "No email to start" → `font-semibold text-slate-300` (one class change). No other copy edits.

### B4. Hero chip tap targets (mobile) — added 2026-07-12 after Tilda principles review (Fitts's Law)
- The 12 sector chips at `py-1.5` are precise-tap targets on a phone. Below `sm`: bump to `min-h-[44px]` equivalent (e.g., `py-2.5 px-4`), keeping desktop exactly as-is (`sm:py-1.5 sm:px-3.5`).
- Acceptance: no chip-row wrap change on desktop (re-run the zero-shift DOM check); every chip ≥44px tall at 375px viewport.

---

## Workstream C — HowItWorks step artifacts

**Untouched:** spine structure, milestone, 3-leaf branch + arrows, all copy/links, stagger reveal, Deep Review inert.

### C1. Per-step artifact (desktop ≥sm only; `hidden sm:block`)
Right-aligned inside each step card, replacing dead space before the arrow. All CSS/SVG — **no images, no new deps**.

| Step | Artifact (≈120×64px) | Content |
|---|---|---|
| 1 Discover | data-map chip cluster | 4 mini chips: Customers · Staff · CCTV · Vendors (teal tints) |
| 2 Assess | mini score dial | 41/100 — same dial GEOMETRY as hero, but **quiet**: thin outline/tint arc, NO filled gold (see C5) |
| 3 Fix | notice-PDF corner mock | doc corner, rule lines, "Privacy Notice · English + हिन्दी", muted fold |

### C5. Artifact restraint (design-review fix #1 — Hierarchy)
- On a **step** card the eye must land on the **title/action first** (it's a navigational choice), artifact is supporting proof. A full-color gold dial out-shouts "Assess" → wrong emphasis.
- Rule: step artifacts render at ~85% opacity, dials use a thin outline/tint arc (no filled gold), chips use low-saturation teal tints. Full-saturation dials are reserved for the hero and Beat 5, where the score IS the subject. Same geometry across all three (consistency criterion), only the fill changes.
- Single unified hover: whole card lifts + arrow tints; nothing inside the card (caption/artifact) reads as independently clickable.

### C2. Caps micro-outcome caption
- Under each step's sub-line: `text-[10px] font-semibold tracking-wide uppercase text-slate-400` (slate-400 not slate-500 — contrast on navy, design-review fix #3).
- Copy: Step 1 "KNOW WHERE YOUR DATA SITS" · Step 2 "YOUR SCORE IN 3 MINUTES" · Step 3 "NOTICE PACK AS A BRANDED PDF".

### C3. Layout
- Step cards widen `max-w-md` → `max-w-lg`; milestone card matches. Branch row stays `max-w-md`-aligned grid (unchanged).
- Mobile: artifacts hidden; captions stay (they're the cheap 80%).

### C4. Analytics
- `trackEvent.hiwStepClick({ step: 'discover'|'assess'|'fix' })` on step-card click (new event in `lib/analytics.ts`).

---

## Workstream D — Beat 5B: "See a real verdict"

New component `components/home/VerdictPreview.tsx`, inserted in `page.tsx` where ProofSection lived (after HowItWorks, before AudienceCards).

### D1. Job & dedupe rule
- **Job:** preview the *report output* (what you get), NOT sector applicability (hero's job). Hard rule: no reuse of hero verdict copy, no "DPDPA applies to…" phrasing, no 41/100-with-top-gap duplicate of the old ProofSection. This beat looks like a slice of `/report/[token]`.
- **Eyebrow:** "THE REPORT" · **H2:** "See what your verdict looks like" · sub: "Every assessment ends in a scored, sector-specific report — here's a live preview." (final copy through saralprivacy-brand voice at build.)

### D2. Layout (light section, `bg-cloud-50 py-20`, `max-w-3xl`)
- 3 tab chips: **Clinic · CA firm · Gym** (spread of bands + familiar personas; pill style matches hero chips, teal active state — not green, to avoid "sector selection" confusion with hero).
- One compact report card below (white, rounded-2xl, shadow-card):
  - header: sector name + band chip. **Band chip = dark text on gold fill** (like the hero), OR gold text using `#B07A1E` — never `#E8AB42` as text on white (fails 4.5:1). Design-review fix #3.
  - **category breakdown: 5 horizontal bars** (labels from that pack's real buckets, static widths) — this is the "real report" signal
  - one "Top gap" line (sector-specific, from pack question copy, paraphrased)
  - footer CTA: "Get your real score →" → `/assessment/{slug}` (sector-scoped!)
- "Sample · illustrative" chip kept (honesty rule — never fake "your" data).

### D3. Data
- `lib/data/verdict-previews.ts` — static const, 3 entries `{ slug, label, band, categories: [{label, pct}], topGap }`. Hand-authored from the packs' bucket names; **no import from pack files** (isolation rule: packs stay byte-identical) and **no Appwrite**.

### D4. Behavior
- Client component; `useState` tab; card content swaps with a 150ms fade (CSS); fixed `min-h` on card region so tab switches never shift layout (lesson from the hero fix, applied at birth).
- Tabs are `button[aria-pressed]`, keyboard reachable; card region `aria-live="polite"`.
- Reduced motion: no fade, instant swap.
- **Full interaction states (design-review fix #2 — the tabs are the beat's primary interaction):** rest (border + slate text), hover (border tint toward teal), focus-visible (teal ring), active/pressed (teal fill + white). Three of these were undefined in the first draft.

### D5. Analytics + kill/keep gate
- `beat5_tab_select {sector}` · `beat5_cta_click {sector}`.
- **Gate:** after 7 days of prod traffic, if tab engagement < ~2% of landing sessions AND CTA CTR adds nothing over baseline hero→assessment flow, remove the beat (one-line revert) and fall back to Option A only. Logged here so the decision is pre-committed.

---

## Workstream E — Analytics summary (new events)

| Event | Params | Surface |
|---|---|---|
| `hiw_step_click` | step | HowItWorks step cards |
| `beat5_tab_select` | sector | VerdictPreview tabs |
| `beat5_cta_click` | sector | VerdictPreview CTA |

Existing `heroSectorSelect` / `landingCtaClick` unchanged — they are the baseline.

---

## Non-functional requirements

- **Perf:** no images, no new dependencies, no layout shift (CLS 0 on all new/changed surfaces — SSR final states, fixed min-heights). Lighthouse perf must not drop vs baseline.
- **SEO/AEO:** all copy in static HTML at SSR; no content behind interaction except the 2 non-default report tabs (acceptable — default tab content is crawlable); AnswerBlock/speakable untouched.
- **A11y:** aria-pressed tabs, aria-live card, focus-visible states, reduced-motion parity everywhere.
- **Isolation:** zero edits to `lib/data/industry-assessment/**`, `sectors.ts`, Header/Footer, or any Out-of-scope section.

---

## Build order (one commit each, preview-verified before next)

1. **A1+A2** moves/drops (+ rhythm screenshot check)
2. **B** hero polish
3. **C** HowItWorks artifacts + captions + event
4. **D+E** VerdictPreview + events
5. Tracker update + ship: preview → screenshots → Dilip eyeball → ff-merge main → prod → curl verification

**Gate before any code: `/plan-design-review` on C artifacts + D card (target avg ≥8), scored against the named criteria below.**

### Design-review criteria (named — added 2026-07-12 after Tilda principles review)
1. **One standout per card (Emphasis).** Each surface names its winner before scoring: step card → the artifact wins, caption stays quiet; Beat 5 card → the CTA wins, band chip is secondary. If two elements fight for the eye, one loses weight or goes.
2. **Visual-family consistency.** Dial style (stroke width, gold arc, label placement), corner radii, and pill shapes must be identical across hero dial, step-artifact dial, and Beat 5 card. Three dials drawn three ways = automatic fail on the consistency dimension.
3. **1024px laptop check** for step-card crowding (artifact + caption + arrow in one row).
4. **375px mobile pass** — captions present, artifacts hidden, chips ≥44px tall (B4).

## Verification (per commit)

- `next build` clean · preview deploy renders · zero-shift checks via DOM measurement (as done for the chip fix) · GA4 events visible in debug view · reduced-motion pass · mobile (375px) pass.

## Risks

| Risk | Mitigation |
|---|---|
| Beat 5B re-creates the "duplicate proof" smell | D1 dedupe rule: report-slice look, bars not dial, sector-scoped CTA |
| Artifacts clutter step cards on small laptops | hidden <sm; design review checks 1024px specifically |
| Animation jank on cheap Android | CSS-only transitions, IO-triggered once, reduced-motion off-switch |
| Beat flops silently | pre-committed 7-day kill/keep gate with named thresholds |
