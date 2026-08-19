# Design Uplift — Comprehensive Execution Plan

> Branch: `design/linear-aesthetic-uplift` · Companions: `DESIGN_LINEAR_UPLIFT_SPEC.md`
> (audit + 7 laws), `DESIGN_SYSTEM_CORE_SPEC.md` (Token v4.0 + enforcement).
> Format per project law: sequence + tentative hours + monitorable steps. No dates —
> Dilip owns scheduling. Nothing merges without preview verification. Never self-merge.

## Ground truth that shapes this plan (verified in source, 2026-08-19)

- Primitives already exist: `components/ui/Button.tsx` (6 variants), `Card.tsx`, `Badge.tsx`.
  We harden them in place — no parallel `ui/core/` (supersedes core-spec §3 on location).
- `Button` primary = `bg-green-500 text-white` — the 2.54:1 WCAG failure is codified in the
  shared primitive AND only 5 files import Button → most CTAs are hand-rolled. The real
  work is **hardening + adoption**, not new components.
- Announcement bar lives inside `components/layout/Header.tsx` (~line 108).
- Homepage sections: `components/home/*` (HeroSection, TrustStrip, WhereRiskHides,
  VerdictPreview, HowItWorks, AudienceCards, BriefingsSection, WhitePaperSection,
  FAQPreview, NewsletterSection) + `components/seo/AnswerBlock`, `components/ui/PressProofStrip`.
- CTA recipes computed: light = green-700 fill + white (5.48:1) · navy = green-400 fill +
  navy-950 text (9.72:1) · white-on-green-500 banned (2.54:1).

## Phase P — Pre-flight (blocking gates before any code)

**P1. Design review gate** · ~1 h
Run `/plan-design-review` over both specs + this plan. Ship gate: avg ≥ 8.
*Monitor:* review scores recorded at top of this file in a `## Review` block.

**P2. Analytics baseline capture** · ~1–2 h
Freeze a baseline BEFORE any visual change: weekly counts for assessment starts,
`discovery_handoff_click`, guide downloads, newsletter subscribes, homepage sessions
(Vercel Analytics, Pro). Two weekly windows minimum before W1 merges.
*Monitor:* `BASELINE.md` table added to branch with the raw numbers + window boundaries.

**P3. Branch & environment hygiene** · ~0.5 h
Confirm no concurrent session is writing (`git status` drift + `list_sessions`); rebase
branch on latest `origin/main`; confirm disk ≥ 10 GiB free (iCloud tree is slow — heavy
work from a `/private/tmp` clone if tsc/build hang).
*Monitor:* `git log --oneline origin/main..design/linear-aesthetic-uplift` shows only spec/plan commits.

**Sequencing constraint:** P0 security criticals (forgeable admin cookie, unauth import
endpoint) outrank this program. If unshipped when W0 would start, ship them first.

## Wave 0 — Theme foundation (~6–8 h total)

**W0.1 Font on** · ~1.5 h
- `globals.css @theme`: add `--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;`
- `layout.tsx`: add Noto Sans Devanagari (next/font, `devanagari` subset, own variable);
  append to the sans stack.
- Remove bare-`Inter` from `globals.css:153`; add `font-feature-settings: "cv01","ss03"` to body.
- Delete `tailwind.config.ts` (dead under v4; root cause of the bare-name bug).
*Monitor:* build green with `$?` checked (never `| tail`) · DevTools computed `font-family`
on body starts with Inter's hashed family · HI + EN screenshot diff on `/white-paper` and
one briefing (Devanagari must not fall to a mismatched face) · `npx tsc --noEmit` green.

**W0.2 Token v4.0 deltas** · ~1 h
- Delete `--shadow-green`; grep-sweep its usages to none.
- Base-layer heading weights: h1/h2/h3 → 600; tracking ladder (−0.025em ≥40px, −0.015em 24–32px).
*Monitor:* `grep -rn "shadow-green" app components` returns 0 · h1 computed weight 600 on preview.

**W0.3 Button hardening** · ~1.5 h
- `primary` → context-safe: default `bg-green-700 text-white`; add `primaryOnDark`
  (`bg-green-400 text-navy-950`); `ghost` → 1px pearl-300 border + navy text; keep focus
  rings; delete `accent` variant if it carries green fills.
- Badge: remove any nav-usable export path; gold variants marked ceremonial in JSDoc.
- Card: hairline default (border pearl-200, radius 12px, shadow none); shadow prop only for overlays.
*Monitor:* 5 existing Button import sites render correctly on preview · computed contrast
of both primaries re-verified in DevTools · no visual regression on `/tools/dpdpa-privacy-notice-generator`
(imports shared ui).

**W0.4 New primitives: Section + Eyebrow** · ~1.5 h
- `Section`: `tone="light"|"navy"`, py-24, max-w container, hairline top border on light;
  dev-mode `console.warn` when a page mounts a 3rd navy section.
- `Eyebrow`: uppercase 12px, +0.08em, muted; replaces the per-section hand-rolled labels.
*Monitor:* Storybook-less check = a scratch route rendering all primitives, screenshotted
375/768/1280, then deleted before merge.

**W0.5 Enforcement wiring** · ~1 h
- CLAUDE.md: PR checklist (computed ratio for new pairs; Section for new sections; nav =
  1 fill, 0 badges; weight cap 600).
- Grep gate script `scripts/design-lint.sh`: fails on `shadow-green`, `font-bold|font-extrabold|font-black`
  in app code, `bg-green-500` with text children (heuristic), `rounded-2xl` in components/home.
*Monitor:* script exits non-zero on current `main` (proves it detects), zero on W0 branch tip.

**Wave 0 exit gate:** Dilip verifies typography on preview URL (the whole site subtly
changes — this is the highest-blast-radius wave). Explicit go before W1.

## Wave 1 — Landing recomposition (~14–18 h total; one commit per task, each preview-verified)

**W1.1 Header + announcement bar** · ~2 h
Delete the bar block in `Header.tsx`; strip all 5 badges; nav → text links + ONE primary
(“Take the assessment”); Templates & DPDPA Guide → text links.
*Monitor:* preview screenshot; nav height unchanged or reduced; keyboard tab order intact;
mobile hamburger (1024–1279 uses it) re-checked.

**W1.2 Hero slim-down** · ~3 h
`HeroSection.tsx`: eyebrow absorbs the deleted bar’s message (said once) · h1 weight 600 ·
sector picker stays focal · ONE primary CTA (`primaryOnDark`), second CTA → link · 5 trust
ticks → one muted line · sample verdict card slims to teaser (full demo lives in
VerdictPreview only).
*Monitor:* element count in hero ≤ 8 groups · exactly 1 green fill in first viewport ·
assessment-start event still fires from hero CTA (analytics law) · LCP not regressed
(Vercel speed insights).

**W1.3 Trust re-stack** · ~2 h
`TrustStrip`: stats fold into hero bottom edge as muted hairline row; 4 value props become
a single quiet light section. `PressProofStrip` MOVES down the page to pre-capture zone
(before WhitePaperSection), uniform muted-grey text logos.
*Monitor:* section order in `app/page.tsx` diff reviewed; no band exceeds the two-navy budget.

**W1.4 AnswerBlock re-seat** · ~1 h
Move to immediately before WhereRiskHides; restyle as reference card (white, hairline,
2px green-700 left rule). Content untouched (SEO/AEO block — copy is load-bearing).
*Monitor:* rendered HTML still contains the block server-side (view-source, not DevTools) —
it must stay in indexed HTML; no `useSearchParams` style regressions.

**W1.5 Middle bands to light** · ~3 h
WhereRiskHides + HowItWorks + VerdictPreview → cloud-50 via `Section tone="light"`;
diagram nodes/steps become hairline cards; per-section CTAs demoted to links except
VerdictPreview’s “Get your real score” (that viewport’s single primary, green-700).
*Monitor:* per-section screenshots; gap chips use semantic colors not accent; ScoreDial
still animates (respects prefers-reduced-motion).

**W1.6 AudienceCards compression** · ~3 h
Hairline cards, sector-accent dot from `lib/data/sector-accents.ts` (⛔ never derive
Tailwind classes by string manipulation — prod-only failure mode), green buttons → text-link
row. **All 24 crawlable hrefs preserved byte-for-byte** (crawl-budget play, GSC-gated).
*Monitor:* `curl -s https://<preview>/ | grep -c 'href="/industries/…'` (and data-flow hrefs)
count unchanged vs prod · dot colors visible in PROD-mode build (`next build && next start`
locally or preview bundle — dev mode hides the class-derivation bug).

**W1.7 Tail: briefings, guide, FAQ, capture merge** · ~3 h
Briefings + FAQ → cloud-50 hairline treatment · WhitePaperSection → light with one elevated
white card, download = viewport primary · NewsletterSection = the closing navy band;
newsletter subscribe becomes the single exit capture, guide-download follow-up folded in
(consent language unchanged — do not touch the no-pre-checked-consent copy).
*Monitor:* both forms still POST successfully on preview · subscribe + download events fire ·
exactly 2 navy bands on final page · full-page screenshot set 375/768/1280.

**Wave 1 exit gate:** axe pass on hero + one middle section + footer · design-lint green ·
Dilip preview walkthrough + explicit merge approval · post-merge: verify events on prod
within the first day (env/redeploy law: live ≠ listed — check after deploy, not before).

## Wave 2 — Education surfaces (~8–12 h, starts only after W1 has 2 weeks of post-data)

**W2.1** Briefings index + article template to v4.0 (hairlines, tabular-nums dates) · ~3–4 h
**W2.2** `/white-paper` (7 languages — Devanagari/Indic type check per language) · ~2–3 h
**W2.3** FAQ page + **in-body cross-links from content pages to tools** — the known
conversion blocker; every briefing/article gains ≥1 contextual tool link (focus rings
required; compute contrast for the link treatment).
*Monitor per task:* build + tsc + screenshots + events; sitemap unchanged; no `notFound()`
introduced in streaming/generateMetadata paths (soft-404 law).

## Wave 3 — Tools & maps (scoped separately, own mini-specs)

Assessment flow · `/data-mapping` surfaces (⚖ all-12-sectors law: presentation changes ship
to every industry or not at all) · admin last. `.spd` island (`/discovery`) stays exempt —
island idiom only. Each gets a mini-spec referencing Token v4.0 before code.

## Measurement plan (runs across waves)

1. Baseline (P2) → merge W1 → compare weekly windows at +2 and +4 weeks.
2. Metrics: assessment starts / homepage sessions · `discovery_handoff_click` · guide
   downloads · subscribes · scroll-past-hero. Denominators always reported (traffic is low;
   rates without denominators are noise).
3. No A/B (infeasible at current traffic). No lift promised; directional evidence decides
   whether W2 leans further into density reduction or into cross-linking.
4. Decision rule: if assessment-starts/session drops >20% across both windows, W1.2 hero
   changes are the prime suspect — revert the hero commit alone (per-section commits make
   this a single `git revert`).

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Font swap shifts layout metrics sitewide (Inter ≠ system widths) | W0 is its own gated deploy; screenshot-diff key pages; `display=swap` already default in next/font |
| Devanagari fallback mismatch | Explicit next/font subset + per-language screenshots in W0.1/W2.2 |
| Button hardening breaks non-home surfaces | Only 5 import sites — enumerate and screenshot each in W0.3 |
| Sector-dot colors blank in prod only | Static class map from sector-accents registry; verify on preview BUNDLE not dev |
| Concurrent sessions on shared tree | Per-task commits; re-check `git status` drift before each work session; heavy builds from /private/tmp clone if iCloud tree hangs |
| Crawl-budget regression from card compression | Href-count diff in W1.6 monitor; no URL changes anywhere in W1 |
| Two-capture merge hurts guide downloads | Track both events separately from day 1; the fold-in is reversible copy/layout, not a form deletion |

## Definition of done (program)

- All grep gates green in CI/pre-PR · axe pass on landing · exactly 2 navy bands ·
  ≤1 green fill per viewport · Inter (+ Devanagari) computed sitewide · baseline vs
  post-windows reviewed and recorded in `BASELINE.md` · memory + `.agent/CURRENT.md`
  updated at each wave boundary (end-of-thread protocol).
