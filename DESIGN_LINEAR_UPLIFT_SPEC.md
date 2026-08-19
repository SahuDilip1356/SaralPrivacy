# Design Uplift Spec — Linear-Grade Discipline, SaralPrivacy Palette

> Branch: `design/linear-aesthetic-uplift` · Status: SPEC — awaiting `/plan-design-review` gate before any code
> Source of critique: Linear design-system reference (styles.refero.design, "midnight precision instrument")
> vs saralprivacy.com live audit 2026-08-19 (computed styles + DOM + source).

## 0. What this is (and is not)

Linear's landing page reads as a **precision instrument**: one canvas, one accent used once
per view, weights capped at 510, hairline borders instead of shadows, one focal point per
screen. SaralPrivacy reads as a **bazaar**: 9 background flips, green fills competing on
every band, 3 gold "FREE" badges in the nav alone, weight-800 headings, and a hero with
~24 competing elements.

We are NOT copying Linear's dark theme, acid-lime, or 72px display type. SaralPrivacy
educates Indian SMB founders — legibility and trust beat midnight cool. What we take is the
**discipline**: the rules that make Linear feel engineered. Palette stays Trust Navy /
Verification Green / Cloud (Token System v3.0 in `webapp/app/globals.css`).

Audience note: primary goal of the site is **DPDPA education** — the page must feel like a
calm reference document, not a SaaS conversion funnel. Every fix below is scored against
"does this make the page feel more like an authoritative instrument".

## 1. Measured audit — saralprivacy.com today

| Dimension | Linear | SaralPrivacy (measured live) | Verdict |
|---|---|---|---|
| Canvas | 1 substrate (#08090a), 0 flips | 11 sections: navy→white→navy→cloud→navy→white→slate→navy→slate→slate — ~9 theme flips | Zebra striping destroys any sense of substrate |
| Accent | #e4f222 on exactly ONE action per view | green-500 fills on announcement bar, nav button, hero CTA, 12 sector-card CTAs, guide CTA, subscribe | Accent is a floodlight, not a flashlight |
| Heading weight | caps at 510 | h1 = 700 (globals base says 800), h2–h3 = 700 | Shouting; heavy weights read as retail, not authority |
| Typeface | Inter Variable + cv01/ss03/zero features | **Inter loaded via next/font but NEVER applied** — body computes to `ui-sans-serif, system-ui`. `--font-inter` variable defined in `layout.tsx:15` and consumed by nothing; dead `tailwind.config.ts:124` and `globals.css:153` reference bare `"Inter"` which next/font does not register | Paying Inter's bytes, rendering system font. Zero typographic identity |
| Elevation | 0.5–1px hairline borders, surface ladder, ~no shadows | navy-tinted drop shadows (`--shadow-card/-hover/-elevated`) + a green glow (`--shadow-green: 0 4px 14px rgb(7 185 129/.3)`) | Glow shadows on CTAs are the opposite of precision |
| Radii | 3 values total (6 / 12 / 9999), 12px cap | 4 documented tiers (lg/xl/2xl/full) = up to 16px, plus measured drift (8px nav buttons) | Documented in globals but cap exceeds instrument range |
| Density | 1 focal point/screen; hero = headline + link + screenshot | Hero = announcement bar + eyebrow pill + h1 + sub + "I run a…" + 12 chips + 2 CTAs + 5 trust ticks + verdict card | ~24 elements compete before first scroll |
| Nav | logo + 5 text links + 1 white pill | logo+tagline, 6 items with 3 gold FREE badges + DAILY badge, dark filled button, green filled button, 7-LANGUAGES badge | 6 competing emphasis devices in 64px of chrome |
| Section rhythm | uniform 96px gaps | py-20 (80px) mostly, but py-8 / py-14 / py-10 interleaved | No consistent breathing rhythm |
| Page | short, single-message | 11,027px tall, 11 sections, each with its own eyebrow+36px/700 heading | Every section is its own hero; none wins |
| Contrast | AAA-ish text ladder | white-on-green-500 = 2.54:1 (measured, sitewide primary CTA); cross-links missing focus rings | Known WCAG failure, see memory `cta-contrast-fails-wcag` |

## 2. The seven laws to adopt (transferable Linear principles)

1. **One substrate.** Light `cloud-50` is the canvas. Navy appears exactly twice: hero band
   and final CTA/newsletter band. Everything between sits on cloud-50/white with hairline
   separation — no more alternating.
2. **One accent, one use.** Green = the single primary action visible per viewport. All
   other buttons are quiet: ghost (1px pearl-300 border, navy text) or text links. The nav
   carries at most ONE filled button.
3. **Weight cap 600.** h1 700→600, h2 700→600, h3 600, body 400/500. Compensate with size
   and tracking, not weight. Tracking ladder: −0.025em ≥40px, −0.015em 24–32px, −0.01em body-lg.
4. **Hairlines over shadows.** Cards separate via 1px `pearl-200` border + white surface on
   cloud canvas. `--shadow-card` allowed only on true overlays (dropdowns, chatbot). Delete
   `--shadow-green` entirely.
5. **Radius vocabulary: 3 values.** 8px (inputs/buttons), 12px (cards), 9999px (pills).
   Retire `rounded-2xl` (16px) from cards. This tightens the existing 4-tier rule in
   globals.css and respects the eyebrow-radius-lock work.
6. **Badge diet.** Zero badges in nav. "Free" is stated once, in the hero trust line.
   Gold reserved for genuinely ceremonial moments (as Token System v3.0 already intends).
7. **One focal point per screen.** Hero keeps: eyebrow, h1, sub, sector picker, ONE primary
   CTA, verdict card. Trust ticks collapse to one muted line. Announcement bar merges into
   the eyebrow (they currently say the same thing twice within 90px).

## 3. Work packages (sequence, no dates — Dilip owns scheduling)

### WP1 — Typography foundation (smallest change, biggest win) · ~2–3 h
- Wire the font actually on: in `@theme`, set `--font-sans: var(--font-inter), ui-sans-serif, system-ui, …`
  (Tailwind v4 reads `--font-sans` for `font-sans`). Remove bare-`"Inter"` references.
- Add `font-feature-settings: "cv01","ss03"` on body (Linear's alternate glyphs; test first).
- **Devanagari/Indic fallback**: site serves 7 Indian languages — extend the stack with
  `"Noto Sans Devanagari"` (next/font, subset) before shipping, and verify हिन्दी strings on
  /white-paper and briefings don't fall to a mismatched system face.
- Weight/tracking pass in `globals.css` base layer per Law 3.
- Verify: computed `font-family` on body starts with Inter's hashed family; screenshot diff EN + HI.

### WP2 — Accent & button discipline · ~3–4 h
- Introduce `btn-primary` (green fill — but on **green-700/800 or navy** fill, measured ≥4.5:1
  per `cta-contrast-fails-wcag`; compute BEFORE choosing) / `btn-ghost` / `btn-link` and sweep
  the homepage: every section keeps at most one primary.
- 12 AudienceCards: "Take the assessment" becomes text-link row, not 12 green buttons.
- Delete `--shadow-green`. Add visible focus rings to all interactive cross-links.

### WP3 — Canvas & rhythm · ~4–6 h
- Re-sequence homepage backgrounds: navy hero → cloud-50 body (all middle sections) → navy
  close (newsletter). TrustStrip/VerdictPreview/BriefingsSection lose their navy bands;
  separation via hairlines + 96px gaps (`py-24` uniformly).
- Merge announcement bar into hero eyebrow (one message, one place).
- Nav de-badging per Law 6; nav keeps one filled button (DPDPA Guide → ghost or the single fill — decide in design review).

### WP4 — Card & hero density · ~4–6 h
- Card system: white surface, 1px pearl-200, 12px radius, 24px padding, no drop shadow.
- Hero simplification per Law 7.
- Section headings: one shared eyebrow style (build on `fix/eyebrow-radius-lock`), h2 at a
  single size (clamp to 36px/600), sub-copy at slate-600.

### Explicitly out of scope
- Dark theme, acid-lime, any palette change (Token System v3.0 stays).
- Industry pages / data-flow maps (presentation-unified law: touching the 12-sector view
  framework requires shipping to all 12 — separate program).
- The `/discovery` `.spd` CSS island (see memory: shared components break inside it).
- Copy changes beyond deleting duplicated messages.

## 4. Gates

- This spec goes through `/plan-design-review` (avg ≥8) before WP1 code.
- Every WP: contrast computed for any new fg/bg pair before commit (palette has
  look-fine-measure-fail pairs).
- Preview-before-prod law: nothing merges to main without Dilip verifying the Vercel
  preview. Never self-merge.

## 5. Verification checklist (per WP)

- [ ] `npm run build` green from repo root pattern (`build | tail` masks exit codes — check `$?` directly)
- [ ] Computed body font = Inter (WP1)
- [ ] Axe/contrast pass on hero + one middle section + footer
- [ ] Screenshot set: 375px / 768px / 1280px, EN + one Indic locale
- [ ] No `rounded-2xl`, no `shadow-green`, ≤1 green fill per viewport (grep + visual)
