# SaralPrivacy Landing Page — Master Spec (front door)

_Created 2026-06-26. The single consolidated overview of the landing re-engineering. Detailed normative specs live in the linked docs (this is the index + summary, kept in sync). Passed `/plan-ceo-review` (Selective Expansion) and `/plan-eng-review` (cleared, zero new deps) on 2026-06-26._

## 1. The decision (locked)
Rebuild the homepage as a **Discovery-first conversion journey** for the Indian SMB — **clear, simple, high-engagement**. A **re-sequence + de-duplicate**, not a visual teardown. Keep the brand system (now formalised as tokens).

## 2. Who it's for
Indian SMB owner/ops lead, 10–50 staff, one of 12 sectors, **phone-first, price-sensitive, skeptical, trusts people/credentials.** Decision order: *does DPDPA apply to me → where do I stand → what do I do.* The page answers in that order.

## 3. The conversion ladder (the spine)
**Discover → Assess → Fix → Get help** — rising commitment: no-email → no-account → email-at-value → human.

## 4. The 10-beat structure
| # | Beat | Surface | Job |
|---|---|---|---|
| 1 | **Hero** — interactive "is-this-me" verdict | dark | is it me? |
| 2 | **Where DPDPA risk hides** — Scatter signature visual | dark (hero continuation) | why care? |
| 3 | **Trust ribbon** — press + stats | light | can I trust them? |
| 4 | **How it works = do it now** — animated flow | dark | what do I do? |
| 5 | **Proof** — slim sample-result card | light | does it fit me? |
| 6 | **Founder proof** — Dilip (CA · IIM · 22 yrs) | light | who's behind this? |
| 7 | **Explore DPDPA by your sector** — 12-card wall | light | what's at stake for my sector? |
| 8 | **Get help** — free gap review (final CTA) | dark | I need a person |
| 9 | **Stay current** — briefings + guide + FAQ + newsletter | light | keep me sharp |
| 10 | **Footer** | dark | nav/SEO/legal |

Rhythm: dark(1–2) → light(3) → dark(4) → light(5–7) → dark(8) → light(9) → dark(10).

## 5. Per-beat specifics
- **Beat 1 Hero** — clarity H1 "See exactly where your business stands on DPDPA"; sector self-pick → instant verdict (applies + hidden data + likely band); primary CTA Discover, secondary Assess; friction-killers row; alert strip (DPDP Rules, softened). Stats moved out to Beat 3. Per-sector verdict data lives in `lib/data/hero-verdicts.ts` (numbers CONFIRM-from-pack). Detail: `LANDING_PAGE_HERO_SPEC.md`.
- **Beat 2 Scatter** — data fans from "Your business" to ~8 mono-icon tools, gold gap adjacent each; scroll-triggered animation (data escapes → gap appears). Detail: `LANDING_PAGE_STRUCTURE.md` §3d.
- **Beat 4 How it works** — vertical flow Discover→Assess→Fix→"DPDPA-ready" milestone→branch (Daily Brief · Sector Deep Dive · Deep Review *coming soon*); each step a live link; staggered slide-in + active flow line; fixed-canvas build. Detail: §3a.
- **Beat 5 Proof** — sample-result card only (Clinic 41/100, gold risk, illustrative); points down to Beat 7; one green CTA. Detail: §3b.
- **Beat 7 Sector wall** — the carried-over `AudienceCards` content; quiet per-card CTAs (not 12 greens); retire the 12 hues; the single sector-selection moment. Detail: §3e.

## 6. Brand tokens (canonical — every beat) — `LANDING_PAGE_STRUCTURE.md` §3c
- **Palette:** Trust Navy `#121A2E` · Verification Green `#07B981` · Assurance Teal `#35B6AE` · Signal Gold `#E8AB42` · Slate `#334155` · Cloud-50 `#F7F9FC`.
- **Rules:** **no red** (risk = gold) · **one green CTA per beat** (green reserved) · forbidden combos (gold-on-white, green-bg+teal-text, navy-bg+slate-text, gradients) · **hairlines not shadows** · dark zones = Hero+Scatter / How-it-works / final CTA, rest light · **Inter** type scale.
- **Copy:** sentence case · active voice · India-first · no fear · never "legal compliance."

## 7. Animation (agreed)
Scroll-triggered, **play once**, `prefers-reduced-motion` → composed state. Hero verdict reveals on select; Scatter = lines flow out then gold gaps snap in; How-it-works = staggered slide-in + marching flow line.

## 8. Carried over from the live page (must keep)
Alert bar · hero friction-killers (incl. "not legal advice") · scale stats (→ Beat 3) · press "As seen in" · Discovery & Notice sample cards (proof) · assessment outcome bands + "no account required" · per-sector content (→ Beat 7 + /industries) · consultation "what the call covers" · 7-lang Guide · FAQ · consent-correct newsletter · rich footer (data-rights contact + disclaimer) · "What is DPDPA?" answer block.

## 9. New (absent today)
Interactive hero verdict · Scatter thesis visual · **Founder-proof block** · the merged how-it-works flow.

## 10. Deferred / off-landing
Full visual redesign · interactive checklist · penalty calculator · trust badge · **Data Lifecycle flow → Discovery page** · readiness stack/continuum → assessment result · risk-matrix/spectra → industries/Readiness Index · OPERATE loop → methodology page · 12 carousels → LinkedIn. (See `docs/visual-system/`.)

## 11. Build sequencing
- **Stage 1** — reorder `app/page.tsx` to the 10 beats; fix the 8→12 picker (Tier 0); build `HowItWorks`.
- **Stage 2** — interactive Hero (Beat 1) + `WhereRiskHides` Scatter (Beat 2) — the two dark Core beats.
- **Stage 3** — Proof (slim), Founder, sector-wall re-skin, Get help, Stay current, copy + a11y pass.
- Deploy flow: branch off `main` → preview → Vercel-MCP verify → ff-merge → prod; confirm build route count grew.

## 12. Reviews (2026-06-26)
- **CEO → Selective Expansion.** Wedge = no-email sector-specific risk verdict in <1 min on the landing. Riskiest assumption = "Discovery-first order + interactive hero raises tool-start rate" → test by instrumenting the CURRENT page for a 5–7 day baseline BEFORE building. Unit economics hold at 10× (static Next.js; verdict = client lookup).
- **Eng → cleared, zero new deps.** Static-first + client-enhanced (SEO-safe); CSS @keyframes + IntersectionObserver (no Framer Motion); fixed-canvas to avoid SVG-drift. Two decisions surfaced: (a) add `questionCount` to `sectors.ts` *(lean: yes)*; (b) retire `AssessmentCTA` from the homepage since Beat 7 covers sector selection — kills the picker bug at source *(lean: yes, verify other usages)*.

## 13. Still open (need Dilip's call)
Design gate (pre-build design pass vs eng-DoD) · multilingual scope · metrics-first instrumentation (CEO-recommended prereq) · who does the legal copy review · the two eng decisions in §12. *(Resolved: hero snapshot → in hero; signature visual → scatter; 12-wall → late Beat 7; lifecycle → Discovery page.)*

## 14. Where it all lives (committed)
- **This file** — front-door overview.
- `LANDING_PAGE_STRUCTURE.md` — the 10-beat spec + §3a–e beat details + §3c brand tokens (normative).
- `LANDING_PAGE_HERO_SPEC.md` — Beat 1 hero detail + `hero-verdicts.ts` model + all-12 copy.
- `LANDING_PAGE_BACKLOG.md` — bug/improvement register.
- `LANDING_PAGE_HANDOFF.md` — session handoff + repo/deploy gotchas.
- `docs/landing/` — mockups. `docs/visual-system/` — brand-wide visual system + later-phase backlog.
