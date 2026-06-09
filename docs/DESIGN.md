# SaralPrivacy — Industry Assessment · DESIGN.md

**Scope:** the design contract for the Industry Assessment surface — the marketing pages
(`/industries/[pack]`), the risk-scan flow + result (`/assessment/[pack]`), and the Starter
Checklist PDFs. One reusable engine, many industry packs; **a new pack should reuse this contract,
not reinvent it.**

**Status:** Living doc · created 2026-06-09 · derived from the shipped reference packs (CA, Recruitment, Training, D2C).
**Sources of truth in code:** `tailwind.config.ts` (tokens) · `lib/data/industry-assessment/bands.ts` (risk bands) ·
the reference client `app/assessment/recruitment/RecruitmentAssessmentClient.tsx` · `tools/build-*-checklist.mjs` (PDF).

> Companion docs: `docs/SaralPrivacy_Industry_Assessment_Portfolio_Spec.md` (engine + scoring),
> per-pack `*_Assessment_v2_Spec.md`. Voice/brand rules live in the `saralprivacy-brand` skill.

---

## 1. North star & principles

Trust is conveyed through **precision, clarity and stability**, not decoration. Editorial authority over
SaaS-flat. Concretely:

1. **Calm by default, colour with meaning.** Navy/slate/cloud carry the page; green/teal/gold/red only appear to signal something (CTA, accent, risk).
2. **Readiness, not shame.** The engine computes *risk*; the UI always shows **readiness = 100 − risk** on a green gauge, plus a risk-band label. Never lead with a scary number alone.
3. **One question per screen.** The scan is a guided sequence, not a wall of fields.
4. **Plain English, native to the industry.** Every pack speaks its audience's language ("client documents", "candidate CVs", "student data", "customer data").
5. **Evidence over assertion.** Show the actual responses, the bucket map, the red flags — then gate the fixes.

---

## 2. Colour tokens

From `tailwind.config.ts` (Design Token System v3.0). **Usage ratio 45 / 20 / 10 / 5:**

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Trust Navy (45%) | `navy-700` (alias `brand-700`) | `#121A2E` | hero/result backgrounds, headings, dark CTA, footer |
| Verification Green (20%) | `green-500` | `#07B981` | primary CTAs, active/selected states, gauge fill (Controlled), progress bar |
| Assurance Teal (10%) | `teal-500` | `#35B6AE` | secondary accent, badges/eyebrows, marketing-page icon chips |
| Signal Gold (5%) | `gold-400` | `#E8AB42` | selective emphasis only — flag icons, exposure bar, micro-note panels, PDF checkboxes |
| Body copy | `slate-700` | `#334155` | primary text on light surfaces |
| Light field | `cloud-50` / `pearl-50` | `#F7F9FC` | page background, reading panels |
| Hairline | `slate-200` | `#E2E8F0` | card borders, dividers |

Full 50–950 scales exist for each. **Gold is fill/border/icon only — never body text.** Don't introduce new
hues; the only non-token colours allowed are the four risk-band colours below.

---

## 3. Typography, spacing, elevation, motion

- **Font:** Inter (`font-sans` / `font-heading`), system fallbacks. Headings and body share the family — hierarchy comes from weight + size.
- **Type scale** (tailwind `fontSize`): result/section headings `text-xl`/`text-2xl` bold navy; questions `text-lg sm:text-xl`; body `text-sm` slate-600/700; helper/micro `text-xs`. Large display sizes carry negative tracking (built into the scale).
- **Radius:** cards `rounded-xl` (12px), feature panels `rounded-2xl`, chips/badges `rounded-full`, inputs `rounded-lg`.
- **Shadow:** prefer flat with `border border-slate-200`; use `shadow-card` / `shadow-card-hover` sparingly. The result headline card uses a 2px coloured border (the band colour), not a shadow.
- **Spacing rhythm:** section gap `space-y-10` (marketing) / `mt-5` between result blocks; card padding `p-5`–`p-7`; max width `max-w-2xl` (scan) / `max-w-7xl` (marketing).
- **Motion:** `motion-safe:` only; durations 300–700ms; `fade-up`/`fade-in`/`slide-down` keyframes exist. Gauge ring and bars animate their fill; respect reduced-motion.

---

## 4. Risk band system (the core semantic)

One band system for every pack, from `bands.ts`. Engine returns risk (0–100); bands are on the **risk** scale.

| Band | Risk range | Colour | Token-ish |
|------|-----------|--------|-----------|
| Controlled | 0–24 | `#07B981` green | calm / good |
| Moderate Risk | 25–49 | `#E8AB42` gold | caution |
| High Risk | 50–74 | `#F97316` orange | warning |
| Critical Risk | 75–100 | `#DC2626` red | severe only |

- The **gauge, band pill, and bucket chips** all derive their colour from this single mapping (`getBandByScore`).
- Overrides may only **raise** a band, never lower it. Red (`Critical`) is reserved for genuine severity.
- The 4-tier bucket chip reuses the same four labels/colours at the per-bucket level.

---

## 5. Shared component kit (`/assessment/[pack]`)

These live inside each pack's client (reference: `RecruitmentAssessmentClient.tsx`). New packs **copy these verbatim** and only change pack data + copy.

**ReadinessGauge** — 144px SVG ring, track `#EEF2F7`, progress stroke = band colour, `strokeLinecap=round`, animated `stroke-dashoffset`. Centre shows `readiness / 100`. `role="img"` + descriptive `aria-label`.

**Two-lens MiniBars** — two horizontal bars: **Data exposure** (polarity `bad-high` → gold fill when ≥50) and **Control maturity** (polarity `good-high` → green fill when ≥50). Always shown as a pair in a 2-col card.

**BucketChip (4-tier)** — pill per risk bucket: `CheckCircle2` for Controlled, else `AlertTriangle`; colour classes per band (`green/gold/orange/red`-50 bg + -200 border). Sits beside each bucket label in the risk map, above a thin `bg-navy-400` fill bar.

**Option badges** — small uppercase pills on answer options, three severities only:
`badgeColor:"red"` → `bg-red-50 text-red-700` (HIGH RISK / SENSITIVE) · `"amber"` → `bg-gold-50 text-gold-700` (RISK) · `"green"` → `bg-green-50 text-green-700` (GOOD). Set in pack data, not the client.

**Question card** — `rounded-xl border border-slate-200 bg-white`; teal pill badge (`q.badge`) → bold navy `<legend>` question → slate helper → options. Options are full-card radio/checkbox labels (`peer-checked:border-green-400 peer-checked:bg-green-50`), custom box/dot indicator, optional severity badge. A collapsible **"Why this matters"** `<details>` sits below.

**Micro-notes** — when a high-signal option is selected, a gold info panel (`bg-gold-50 text-gold-800`, `Info` icon) appears under it. Keyed `"q{n}:{optId}"` in a `MICRO_NOTES` map in the client.

**Progress** — "Question X of N" + "% complete", green fill bar; counts answered required questions.

**Gated lead form** — green-tinted card, `Lock` icon, 5 fields (Name · {Entity} · Email · Phone/WhatsApp · City), consent checkbox linking `/privacy`, hidden honeypot `hp_url`. On submit → POST `/api/assessment` with retry; then reveals the priority fixes (+ `leadMagnet` download button when the pack defines one).

**Result page order (fixed):** band-coloured headline card (gauge + readiness + band pill + band copy) → two-lens → top-3 red flags → bucket risk map → gated fixes (+ checklist) → navy primary-CTA card ("Book a … Gap Review") → retake link → confidentiality microcopy.

---

## 6. Marketing page anatomy (`/industries/[pack]`)

Reference: `app/industries/recruitment-agencies/page.tsx`. Fixed structure:

1. **Hero** — navy band, teal eyebrow ("Industry Guide · {Pack}"), `pack.positioning.hero` as `<h1>`, a `.answer-block` sub-panel with `pack.positioning.sub` + the one-line thesis (`data-speakable`), green CTA + microline, chip row from `pack.positioning.chips`.
2. **Risk map** — one card per bucket: teal icon tile, bucket label, a concrete `example`, and a teal "First move" action. Driven by `pack.buckets` + a local `BUCKET_DETAIL` map.
3. **How it works** — 3 numbered steps; step 3 names the priority fixes + the Starter Checklist (if the pack has one).
4. **What the scan checks** — 8 plain-English checklist lines.
5. **FAQ** — `<details>` list inside `.answer-block`; wired to `faqPageSchema` + `breadcrumbSchema` + `speakableSchema`.
6. **Sidebar** — teal "Take the free scan" CTA card, White Paper, Related Briefings, Request Consultation.
7. **Footer note** — `data-nosnippet` freshness + legal-baseline + "educational, not legal advice".

SEO scaffolding (`breadcrumbSchema`, `faqPageSchema`, `speakableSchema`, `Byline`, `FRESHNESS`) is **mandatory** and must be preserved on every pack page.

---

## 7. Starter Checklist PDF template

One template, generated per pack via `tools/build-{pack}-checklist.mjs` (Playwright → `public/templates/{pack}-dpdpa-starter-checklist.pdf`). **Contract:**

- **A4**, 14/16mm margins, Inter/system font, `#334155` body.
- **Navy cover** (`#121A2E`, `rounded:14px`): green dot + "SaralPrivacy" in teal, `h1` title, one thesis paragraph, white-outline chip row.
- **Lead panel:** pearl bg, green left-border, "How to use this" + the highest-leverage starting areas.
- **10 sections** (parity across all packs), each a bordered card: teal numbered tile (`1`–`10`) + title + 5 checklist items with gold square checkboxes (`box`).
- **Footer:** brand line + date + "Educational, not legal advice".

When adding a pack, copy the nearest generator, swap the 10 sections + cover copy + chips, regenerate, and keep section count at **10**.

---

## 8. Accessibility

- Gauge is `role="img"` with a sentence `aria-label` (score + band).
- Options use real radio/checkbox inputs (`peer sr-only`) inside `<label>`; the question is a `<fieldset>` + `<legend>`.
- Visible focus everywhere: `focus-visible:ring-2` (green on light, navy on dark).
- Colour is never the only signal — bands also carry an icon + text label; badges carry text.
- Tap targets are full-width option cards; honeypot is `aria-hidden` + visually hidden.
- All motion guarded by `motion-safe:`.

---

## 9. Adding a new industry pack — design checklist

1. Author `lib/data/industry-assessment/packs/{slug}.ts` — 5 buckets, 10 questions, badges (red/amber/green), overrides, soft flags, `recommend`, `bandCopy`, `positioning`, optional `leadMagnet`. (Caps sum to 110; see portfolio spec.)
2. Client = copy the reference client; change only the pack import, the lead-form entity field, `MICRO_NOTES`, and result/CTA copy.
3. Marketing page = copy the reference; swap `BUCKET_DETAIL`, steps, scan-checks, FAQs; **keep all SEO schema**.
4. PDF = copy a generator; 10 sections; regenerate.
5. Wire `cta-copy.ts` href + the `/api/assessment` email guard (`report_type` ≤10 chars, in the `categoryScores`/`checklist` maps).
6. Do **not** add new colours, new component variants, or a second band system. Reuse the contract above.

---

*This is a design contract, not a styleguide site. The runtime source of truth remains `tailwind.config.ts`,
`bands.ts`, and the reference pack — keep this doc in sync when those change.*
