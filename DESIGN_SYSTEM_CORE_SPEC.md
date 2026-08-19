# SaralPrivacy Core Theme v4.0 — Spec & Rollout Plan

> Branch: `design/linear-aesthetic-uplift` · Supersedes the audit-level laws in
> `DESIGN_LINEAR_UPLIFT_SPEC.md` by codifying them as the DEFAULT theme for all development.
> Status: SPEC — gated on `/plan-design-review` (avg ≥8) before any code.
> Sequencing note: does NOT jump the P0 security queue (investor-audit criticals ship first).

## 1. Intent

Make "Linear-grade discipline, SaralPrivacy palette" the **base theme**, not a landing-page
facelift. Enforcement lives at the token layer (`webapp/app/globals.css` `@theme`) plus a
small set of mandatory UI primitives, so every future page inherits the discipline by
default and drift becomes grep-detectable.

Positioning target: a calm, authoritative **reference instrument** for DPDPA education —
not a SaaS conversion funnel. Conversion improvement is a hypothesis we will measure, not a
claim (see §7).

## 2. Token System v4.0 (delta over v3.0)

Palette hues are UNCHANGED (Trust Navy / Verification Green / Assurance Teal / Signal Gold /
Cloud). v4.0 changes **usage**, adds computed-safe recipes, and deletes toxic tokens.

### 2.1 Color usage contract
| Token | Role (enforced) |
|---|---|
| `cloud-50` | THE canvas. Default page background everywhere |
| `white` | Card surface only (never a section background of its own) |
| `navy-700` | Dark band — max 2 per page (hero + closing act) |
| `green-*` | Action only. Never decoration, never section tint |
| `gold-*` | Ceremonial only. Never nav, never repeated badges |
| `teal-*` | Data-viz/diagram accent only (sector registry stays authoritative for maps) |

### 2.2 CTA recipes — computed 2026-08-19, do not substitute shades
| Context | Recipe | Ratio |
|---|---|---|
| Primary on light | `green-700` (#047857) fill + white text | **5.48:1** ✅ |
| Primary on navy | `green-400` (#1FCC8D) fill + `navy-950` (#04060C) text | **9.72:1** ✅ |
| Link on light | `green-700` text | 5.48:1 ✅ |
| Accent text on navy | `green-400` | 8.31:1 ✅ |
| ⛔ banned | white text on `green-500` (#07B981) | 2.54:1 ✗ |

The navy-surface recipe is the direct translation of Linear's acid-lime-with-black-text
primary — the single highest-contrast element on the page.

### 2.3 Deletions
- `--shadow-green` — deleted, no replacement.
- `--shadow-card-hover` / `--shadow-elevated` demoted: overlays only (dropdown, chatbot,
  modal). Cards use hairlines (§2.5).
- `tailwind.config.ts` — deleted (dead under Tailwind v4; its bare-`"Inter"` fontFamily is
  the root of the font bug).

### 2.4 Typography (the font actually turns on)
- `@theme` gains `--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;`
- `layout.tsx` adds Noto Sans Devanagari via next/font (devanagari subset) and appends its
  variable to the stack — 7-language content must not fall to a mismatched system face.
- `body { font-feature-settings: "cv01", "ss03"; }` (verify glyphs, then keep or drop as a pair).
- Weight cap **600** sitewide: h1/h2 600, h3 600, emphasis 500, body 400. No 700/800 anywhere.
- Tracking ladder: −0.025em ≥40px · −0.015em 24–32px · −0.01em 18–20px · default below.
- Type scale (single source, base layer): h1 clamp(34→52px)/1.05 · h2 28px/1.2 ·
  h3 17–21px/1.3 · body 16/1.6 · small 14 · caption 12 uppercase +0.08em.

### 2.5 Elevation, radius, rhythm
- Card = white surface + 1px `pearl-200` hairline + 12px radius + 24px padding. No shadow.
- Radius vocabulary: **8 / 12 / 9999** (inputs+buttons / cards / pills). `rounded-2xl`
  retired from cards; tightens the existing 4-tier rule and the eyebrow-radius-lock work.
- Section rhythm: `py-24` (96px) uniform; hairline `border-t pearl-100` between light
  sections instead of background flips.

## 3. Mandatory primitives — `components/ui/core/`

All NEW development must compose from these; existing surfaces migrate per §6 waves.
1. `Button` — variants `primary | ghost | link` (recipes §2.2 baked in; focus ring included;
   no other button styles permitted).
2. `Card` — hairline card per §2.5; `as` prop for semantics.
3. `Section` — canvas control: `tone="light" | "navy"`, enforces py-24 + max-w + the
   two-navy-bands budget (dev-mode console.warn if a page mounts >2 navy sections).
4. `Eyebrow` — the single section-label style (uppercase 12px, +0.08em, muted).
5. `Badge` — ceremonial only; deliberately NOT exported from the nav's import path.

## 4. Enforcement — how it stays the default

- **Single source of truth:** globals.css `@theme` + the §2 contract comment block.
- **Grep gate** (CI or pre-PR checklist, all must return 0 on app code):
  `shadow-green` · `rounded-2xl` on Card-like surfaces · `bg-green-500` with text children ·
  `font-bold|font-extrabold|font-black` · gold badge components inside `components/layout/`.
- **PR checklist** (append to CLAUDE.md): new fg/bg pair ⇒ computed ratio in the PR
  description; new section ⇒ uses `Section`; nav ⇒ one filled button max, zero badges.
- **Migration rule:** any PR touching an old surface upgrades what it touches to core
  primitives (boy-scout), but never mixes old + new inside one section.
- `.spd` island (`/discovery`) is EXEMPT — write in the island's idiom (standing law).
- Industry/data-flow presentation framework: changes ship to all 12 sectors or not at all
  (standing law) — sector map surfaces migrate as their own wave, never piecemeal.

## 5. Landing page — section-by-section transformation

| # | Today | v4.0 |
|---|---|---|
| Announcement bar | Green pill bar duplicating the eyebrow 90px below | **Deleted.** Message lives once, in the hero eyebrow |
| Nav | 5 gold badges, 2 filled buttons, tagline | Logo, 5 text links, ONE primary (`Take the assessment`); Templates + Guide become text links; badges gone |
| Hero (navy) | ~24 competing elements | Keeps navy. Eyebrow → h1 (600) → one sub-line → **sector picker as the focal point** → ONE primary CTA (green-400/navy-950) → verdict card (our "product screenshot"). Trust ticks collapse to one muted line; second CTA becomes a link |
| TrustStrip stats (white band) | Own white section | Folds into hero bottom edge as a quiet hairline row on navy (muted figures, no cards) |
| Press strip | Own band | Uniform muted-grey text logos on cloud, hairline-framed, no heading escalation |
| AnswerBlock (SEO) | green-bordered callout on slate | Reference-card styling: white card, hairline, green-700 left rule 2px |
| WhereRiskHides (navy) | Navy band mid-page | **Cloud-50.** Flow diagram nodes become hairline cards; gap chips use semantic colors, not accent green |
| VerdictPreview (cloud) | OK | Stays light; ScoreDial + bars adopt green-700/gold/danger semantics; "Get your real score" is this viewport's single primary |
| HowItWorks (navy) | Navy band | **Cloud-50**, numbered steps (real sequence), hairline connectors; step CTAs are links |
| AudienceCards ×12 (white) | 12 green-filled buttons + shadows | Hairline cards, sector-accent dot from `lib/data/sector-accents.ts` (registry finally unified — closes the known AudienceCards divergence), CTAs become a text-link row |
| Briefings (slate) | Own tint | Cloud-50, briefing cards hairline, dates in tabular-nums |
| Guide / WhitePaper (navy) | Navy band | Light section with one elevated white card; language pills quiet; download = viewport primary |
| FAQ | OK | Cloud-50, hairline accordions |
| Newsletter (navy) | One of many navy bands | **The closing navy act** — the page's second and last dark band; subscribe = primary (green-400/navy-950) |

Net: 11 sections / ~9 flips → **navy open, light body, navy close**; one green fill per
viewport; ~17 green fills → ~5 page-wide.

## 6. Plan — sequence + tentative hours (no dates; Dilip owns scheduling)

**Wave 0 — Theme codification** (~3–4 h)
Token v4.0 in globals (font wiring incl. Devanagari, deletions, tracking/weight base layer,
delete tailwind.config.ts) + core primitives (Button/Card/Section/Eyebrow/Badge) + CLAUDE.md
checklist. *Monitorable:* build green with exit code checked; computed body font = Inter;
grep gate returns 0 on new code; HI/EN screenshot diff.

**Wave 1 — Landing page recomposition** (~12–16 h)
§5 table, component by component, one commit per section group (nav+bar · hero+trust ·
middle bands · cards+briefings · guide+FAQ+newsletter). *Monitorable:* per-commit preview
screenshot set 375/768/1280, axe pass, ≤1 green fill per viewport check, analytics events
still firing (standing law).

**Wave 2 — High-traffic education surfaces** (~8–12 h)
/briefings index + article template, /white-paper, FAQ page — the DPDPA-education core.
*Monitorable:* same checks; no content edits.

**Wave 3 — Tools & maps** (scoped separately)
Assessment flow, /data-mapping surfaces (all-12 rule applies), admin later. Each gets its
own mini-spec against this document.

**Gates:** `/plan-design-review` this spec (≥8) before Wave 0 · preview verification by
Dilip before every merge · never self-merge · contrast computed for every new pair.

## 7. Conversion — hypothesis, not promise

Design discipline plausibly raises trust and comprehension for an education audience, but
no lift is claimable in advance (standing law: no unverifiable stats — internal claims held
to the same bar). Constraints we already know:
- Traffic is the binding constraint on measurement (~low daily visitors; /discovery ≈0.4/day).
  A/B testing is NOT feasible; use before/after weekly windows with denominators.
- The known conversion blocker is structural, not aesthetic: content pages dead-end with
  zero in-body links to tools. Wave 1 must not remove cross-links; Wave 2 should add them.

**Metrics to watch (existing custom-event wire, verified live):** assessment starts /
homepage sessions · `discovery_handoff_click` · guide downloads · newsletter subscribes ·
scroll-past-hero rate. Record a 2-week pre-launch baseline per event before Wave 1 merges;
review at +2 and +4 weeks post-launch. Success = directional improvement with honest
denominators; failure teaches which sections to iterate.

## 8. Out of scope (unchanged from audit spec)
Dark theme as a product feature · palette hue changes · `.spd` island · copy rewrites
beyond de-duplication · new features of any kind (Operation Pounce not-do list holds).
