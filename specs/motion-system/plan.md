# Plan — SaralPrivacy motion system

**Status:** draft
**Spec:** ./spec.md
**Date:** 2026-10-25

## Architecture

```
webapp/                         ← Next.js app (paths below are from the repo root)
  components/motion/            ← NEW shared kit: one file per component + motion.css + useInViewOnce.ts
  scripts/motion-lint.mjs       ← NEW static check (loops, per-char splits, framer imports, rupee counters)
  scripts/motion-audit.mjs      ← NEW route check against server HTML (markers, still zones, hidden-at-rest)
  motion-manifest.json          ← NEW route → allowed components + minimum still zones
  app/globals.css               ← existing sp-* keyframes (tuned in Phase 1)
  app/[locale]/…                ← pages; each page task swaps local motion for kit components
  components/{home,data-flow,…} ← page components touched by page tasks
  public/guides/*.html          ← static 7-language guide (Phase 4)
```

- **Components:** kit components are client components that render their final state on the server.
  - On mount they read reduced motion and the kill switch, then play once when 30% in view.
  - Each one marks its root with `data-sp-motion`.
- **Still zones:** pages mark them with `data-sp-still`.
- **Audit setup:** the audit needs the production build running locally: `cd webapp && npm run build && npm start` (port 3000).
- **Lint:** reads source only, with no server needed.
- **Ratchet:** a baseline file lists today's known violations. Each page task removes its own entries. When the list is empty, the kit is fully adopted.

## Decisions

- **Recipes.** Build from the `sd-web-design` recipes and component names. Where this spec differs (OPERATE rail instead of Radial Orbital, myths strike-through instead of hover reveal, press wall stays a grid), the spec wins. Alternative rejected: a new design per page.
- **Animation code.** The kit uses CSS keyframes, transitions and a tiny in-view hook. `framer-motion` (already installed) is used only where a recipe needs layout animation (SoftSwap FLIP, StackCards scale) or where it already exists (`MotionJourney`). Rejected: adding GSAP or `motion` as new packages.
- **Server HTML first.** Server HTML always holds final values and visible content; animation moves between visible states (opacity ≥ 0.6). Rejected: starting from opacity 0.
- **Ratchet baseline.** One `motion-lint-baseline.json` that only shrinks. Rejected: fixing every loop in one big PR.
- **Sector scans.** The 12 scan clients are edited 3 per task with identical changes. Rejected: merging them first (NG3).
- **Guide diagrams.** Ship English and Hindi first; the other 5 languages keep images until labels exist (A5).
- **One PR per page task.** Each PR updates `motion-manifest.json` for its routes and ticks `status: done` here.

## How to run one page

1. Pick the next page in the README's page picker whose `depends_on` tasks are all done.
2. Read that task, its ACs in spec.md, and the recipe named in its notes.
3. Branch from `main`, for example `motion/T15-discovery-stepper`.
4. Build, run the task's `verify`, then check by hand:
   - desktop, and a 375 px phone width;
   - reduced motion on;
   - keyboard only;
   - the `/hi` route.
5. Set `- status: done` on the task and open the PR.

## Tasks

### Phase 0 — Guardrails and trust fixes

### T1 — Add the static motion lint with a ratchet baseline
- implements: AC4, AC7, AC8, AC13
- depends_on: none
- files: webapp/scripts/motion-lint.mjs, webapp/scripts/motion-lint-baseline.json, webapp/package.json
- risk: tier2
- size: M
- verify: cd webapp && node scripts/motion-lint.mjs --self-test && npm run motion:lint
- notes:
  - **Rules:**
    - M-LOOP: `infinite`, `animate-pulse` or `animate-spin` in .css/.tsx outside `**/loading.tsx`.
    - M-CHAR: `.split("")`, `Array.from(<string>)` or `[...str]` feeding mapped `<span>`s.
    - M-RUPEE: `CountUp` or `count-up` within 3 lines of ₹, crore or lakh.
    - M-FRAMER: a new `framer-motion` import outside `components/motion/` and `components/data-flow/MotionJourney.tsx`.
  - Write the current violations to the baseline so the lint passes today.
  - `--self-test` runs the rules against inline sample strings.
  - Add the npm script `motion:lint`.

### T2 — Add the route audit and manifest
- implements: AC1, AC2, AC6, AC7
- depends_on: none
- files: webapp/scripts/motion-audit.mjs, webapp/scripts/fixtures/audit-pass.html, webapp/scripts/fixtures/audit-fail.html, webapp/motion-manifest.json, webapp/package.json
- risk: tier2
- size: M
- verify: cd webapp && node scripts/motion-audit.mjs --self-test
- notes:
  - **Usage:** `--route /x [--base http://localhost:3000]`; with no `--route`, audit every manifest route.
  - **Rules:**
    - M-UNLISTED: a marker value not in the route's `allowed` list.
    - M-HIDDEN: inline opacity < 0.6, `visibility:hidden` or an off-screen translate on an element with text.
    - M-STILL: a marker or `animate-`/`sp-` class inside `[data-sp-still]`, or fewer still zones than the manifest's minimum.
    - M-RUPEE: ₹ inside a count-up.
  - Exit codes per the spec Contracts.
  - Start the manifest with every public route, `allowed: []`, `still_zones: 0`. Page tasks fill it in.
  - Add the npm script `motion:audit`.

### T3 — Record the performance and device baseline
- implements: AC11
- depends_on: none
- files: specs/motion-system/baseline.md
- risk: tier2
- size: S
- verify: test -s specs/motion-system/baseline.md && grep -q "LCP" specs/motion-system/baseline.md
- notes:
  - Run mobile Lighthouse (`npx lighthouse <url> --preset=perf --form-factor=mobile --throttling-method=simulate`) on production for 5 routes: /, /discovery, /assessment, /industries/clinics-diagnostic-labs/data-flow, /learn/consent.
  - Record score, LCP, CLS and TBT per route.
  - Add the 30-day device split from Vercel Analytics (A1) and the current scroll-depth and assessment-start numbers (A2).

### T4 — Fix the privacy-notice location and media figures
- implements: AC15, AC97, AC98
- depends_on: none
- files: webapp/app/[locale]/privacy/page.tsx, webapp/lib/data/privacy-vendors.ts, webapp/lib/mediaData.ts, webapp/app/[locale]/media/press-wall/page.tsx, webapp/app/[locale]/media/page.tsx
- risk: tier1
- size: S
- verify: cd webapp && npx tsc --noEmit && ! grep -rn "56M+" app/[locale]/media && npm run lint
- notes:
  - **Blocked by** open questions Q3 and Q4 (Dilip).
  - Both media pages must read reach from `lib/mediaData.ts`. Storage wording must come from one constant in `privacy-vendors.ts`.
  - The Privacy Notice is legal text: Dilip reviews the wording.

### T5 — Fix learn content and mismatched counts
- implements: AC16, AC99, AC100
- depends_on: none
- files: webapp/lib/data/learn-content.ts, webapp/lib/data/i18n/learn-content.hi.ts, webapp/app/[locale]/learn/[topic]/page.tsx, webapp/app/[locale]/blog/[slug]/page.tsx, webapp/messages/en.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && ! grep -n "| Aspect | DPDPA" lib/data/learn-content.ts && ! grep -rn "learn/glossary" lib/data/learn-content.ts
- notes:
  - Pipe tables: either render with `remark-gfm` (already installed) or convert the content to the existing list/table structure the page renders.
  - Myths related link → `/glossary`.
  - "7-question" → match the industry pages (10).
  - Home template count → match /resources. Find the string with `rg -n "17" messages/en.json components/home`.
  - The consent checklist becomes real checkboxes in T31, not here.

### Phase 1 — Calm the loops

### T6 — Stop site-wide loops: chat button, hero dot, briefings dot
- implements: AC19, AC24, AC89, AC4
- depends_on: T1
- files: webapp/components/chat/SetuStage.tsx, webapp/components/home/HeroSection.tsx, webapp/app/[locale]/briefings/page.tsx, webapp/app/globals.css, webapp/scripts/motion-lint-baseline.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - Setu `sp-breathe`: set `animation-iteration-count: 3`, and none under reduced motion.
  - Remove `animate-pulse` from the hero eyebrow and the briefings badge (static dot).
  - Delete their baseline entries.

### T7 — Make the how-it-works connectors draw once
- implements: AC22, AC4
- depends_on: T1
- files: webapp/components/home/HowItWorks.tsx, webapp/app/globals.css, webapp/scripts/motion-lint-baseline.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - Replace the infinite `sp-dash-flow`/`sp-line-flow` with a one-shot stroke draw. Check whether `WhereRiskHides.tsx` also uses `.sp-dash-flow` (`rg sp-dash-flow`); if so, include it.
  - T14 later swaps this for the kit JourneyLine. This task is the quick calm-down.

### T8 — Calm discovery and notice-generator pulses
- implements: AC30, AC43, AC4
- depends_on: T1
- files: webapp/app/[locale]/discovery/discovery.css, webapp/app/[locale]/tools/dpdpa-privacy-notice-generator/notice-pack.css, webapp/app/[locale]/tools/dpdpa-privacy-notice-generator/NoticePackClient.tsx, webapp/scripts/motion-lint-baseline.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - `hc-pulse` → 2 iterations.
  - `npbpulse`: remove `infinite`. Re-trigger one pulse by toggling a class (or key) when the preview content hash changes.

### Phase 2 — Shared kit

### T9 — Kit foundation: tokens, in-view hook, kill switch, CountUp, DrawStroke
- implements: AC3, AC5, AC12, AC17, AC18, AC7
- depends_on: T1
- files: webapp/components/motion/motion.css, webapp/components/motion/useInViewOnce.ts, webapp/components/motion/CountUp.tsx, webapp/components/motion/DrawStroke.tsx, webapp/app/layout.tsx
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - **Tokens:** CSS variables matching the timing tokens in spec Contracts.
  - **useInViewOnce:**
    - returns `played`;
    - true immediately when IntersectionObserver is missing, reduced motion is on, or `NEXT_PUBLIC_MOTION === "off"`.
  - **CountUp:**
    - server-renders the final value and animates 0 → value on play, in tabular numbers;
    - `aria-live` is only on a visually hidden final value;
    - must refuse (dev warning) a string containing ₹.
  - **DrawStroke:** variants `underline`, `tick`, `strike`, using stroke-dashoffset.
  - Recipes: `scroll/dynamic-data-display`, `text/hand-drawn-underline-headline`.
  - Import `motion.css` once in the root layout.

### T10 — Kit: JourneyLine and RoadmapRail
- implements: AC12, AC13, AC22, AC49
- depends_on: T9
- files: webapp/components/motion/JourneyLine.tsx, webapp/components/motion/RoadmapRail.tsx, webapp/components/motion/motion.css
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - **JourneyLine:** horizontal or vertical. Either `steps` (draw once) or `progress` (follows scroll, for data-flow and reading progress).
  - **RoadmapRail:** `items` and `reachedIndex`; fills once and marks "You are here"; vertical below 760 px.
  - Recipes: `scroll/scroll-journey-line`, `timelines/timeline-horizontal-roadmap`.

### T11 — Kit: StatusTracker and ScoreReveal
- implements: AC12, AC13, AC25, AC35, AC40
- depends_on: T9
- files: webapp/components/motion/StatusTracker.tsx, webapp/components/motion/ScoreReveal.tsx, webapp/components/motion/motion.css
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - **StatusTracker:** forms `steps`, `bar` and `static`; states done (DrawStroke tick), current, pending; connector fill ≤ 500 ms.
  - **ScoreReveal:** props score, band label, optional dimensions[]. Order: ring sweep, then count, then bars, then band label. It re-plays when `score` changes (AC23).
  - Absorb the visuals of `components/home/ScoreDial.tsx` and `discovery/components/Gauge.tsx`; pages switch over in their own tasks.
  - Recipe: `timelines/timeline-status-tracker`.

### T12 — Kit: SoftSwap and StackCards
- implements: AC9, AC10, AC12, AC13
- depends_on: T9
- files: webapp/components/motion/SoftSwap.tsx, webapp/components/motion/StackCards.tsx, webapp/components/motion/motion.css
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - **SoftSwap:**
    - crossfade, height, and FLIP reorder (`framer-motion` `layout` is allowed here);
    - announces the new count through a polite live region.
  - **StackCards:** CSS sticky; a plain list below 640 px.
  - Recipes: `scroll/the-stacking-cards-effect`, `text/text-fading-animation`.

### T51 — Kit: FolderReveal and Spotlight
- implements: AC9, AC10, AC12, AC13
- depends_on: T9
- files: webapp/components/motion/FolderReveal.tsx, webapp/components/motion/Spotlight.tsx, webapp/components/motion/motion.css
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - **FolderReveal:** a button with `aria-expanded`/`aria-controls`; tap or Enter; no pointer following.
  - **Spotlight:** context provider with `activeId` and `isBreak`; siblings dim to 0.35.
  - Recipes: `components/interactive-folder`, `scroll/spotlight-mask`.

### T13 — Kit gallery route for review and audit
- implements: AC1, AC2, AC3, AC11
- depends_on: T10, T11, T12, T51
- files: webapp/app/[locale]/motion-kit/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /motion-kit
- notes:
  - Calls `notFound()` when `NODE_ENV === "production"` and `NEXT_PUBLIC_MOTION_KIT !== "on"`; add `robots: noindex`.
  - Renders every component in both themes, with a Replay button for each.
  - Measure the kit's gzip size with `npx next build` output and record it in baseline.md (≤ 15 KB).

### Phase 3 — Tool pages (one page per task)

### T14 — Home: hero rise, underline, journey line, sample report
- implements: AC14, AC20, AC21, AC22, AC23, AC24
- depends_on: T7, T10, T11
- files: webapp/components/home/HeroSection.tsx, webapp/components/home/HowItWorks.tsx, webapp/components/home/ReportPreview.tsx, webapp/components/home/ScoreDial.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route / && npm run motion:audit -- --route /hi
- notes:
  - Headline rise: CSS-only, words wrapped by splitting on spaces (Hindi safe); the server HTML is fully legible.
  - The underline goes on the "3–5 minutes" phrase only (one Signal Gold emphasis).
  - Leave `WhereRiskHides.tsx` (ecosystem) as is.
  - Manifest `/`: headline-rise, draw-stroke, journey-line, score-reveal; still_zones 0.

### T15 — Discovery part 1: step tracker and data review
- implements: AC25, AC26, AC31
- depends_on: T8, T11, T12
- files: webapp/app/[locale]/discovery/DiscoveryClient.tsx, webapp/app/[locale]/discovery/components/DataReview.tsx, webapp/app/[locale]/discovery/discovery.css, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /discovery
- notes:
  - Replace `.step-dot` styling with StatusTracker `steps`.
  - Mark the email gate and validation messages `data-sp-still` (still_zones ≥ 1).

### T16 — Discovery part 2: snapshot, pack folder, action rail
- implements: AC27, AC28, AC29
- depends_on: T15, T51
- files: webapp/app/[locale]/discovery/components/ResultPanel.tsx, webapp/app/[locale]/discovery/components/Gauge.tsx, webapp/app/[locale]/discovery/components/pack/DiscoveryPack.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - The result is client-only after step 3, so the route audit cannot see it. Check by hand: complete the flow at 375 px with reduced motion on and off.
  - `Gauge.tsx` becomes a thin wrapper over ScoreReveal, or is removed.

### T17 — Assessment hub and question flow
- implements: AC32, AC33, AC34, AC35, AC36
- depends_on: T10, T11, T12
- files: webapp/app/[locale]/assessment/page.tsx, webapp/app/[locale]/assessment/SurveyClient.tsx, webapp/motion-manifest.json
- risk: tier1
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /assessment && npm run motion:audit -- --route /hi/assessment
- notes:
  - **tier1** because it touches the consent start card. That card gets `data-sp-still` and no motion. Q5 may change its copy; that is not in this task.
  - Question change: line-level slide (`text/text-slidedown-animation`, line form), 200 ms. Move focus to the question `h2` after the change.

### T18 — Sector scans A: CA firms, recruitment, D2C
- implements: AC37, AC38, AC39, AC40, AC41
- depends_on: T11, T17
- files: webapp/app/[locale]/assessment/ca-firms/CAAssessmentClient.tsx, webapp/app/[locale]/assessment/recruitment/RecruitmentAssessmentClient.tsx, webapp/app/[locale]/assessment/d2c-brands/D2CAssessmentClient.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /assessment/ca-firms
- notes:
  - Apply identical changes in each client: option tick, static badges, explainer moving with the card, result → ScoreReveal, gate → still.
  - Keep the diff mechanical. T19–T21 copy this pattern.

### T19 — Sector scans B: training, clinics, schools
- implements: AC37, AC38, AC39, AC40, AC41
- depends_on: T18
- files: webapp/app/[locale]/assessment/training-institutes/TrainingAssessmentClient.tsx, webapp/app/[locale]/assessment/clinics-diagnostic-labs/ClinicAssessmentClient.tsx, webapp/app/[locale]/assessment/schools-colleges/SchoolAssessmentClient.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /assessment/clinics-diagnostic-labs

### T20 — Sector scans C: law, real estate, hotels
- implements: AC37, AC38, AC39, AC40, AC41
- depends_on: T18
- files: webapp/app/[locale]/assessment/law-firms/LawFirmAssessmentClient.tsx, webapp/app/[locale]/assessment/real-estate/RealEstateAssessmentClient.tsx, webapp/app/[locale]/assessment/hotels-travel/HotelsTravelAssessmentClient.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /assessment/law-firms

### T21 — Sector scans D: pharmacies, fintech, gyms
- implements: AC37, AC38, AC39, AC40, AC41
- depends_on: T18
- files: webapp/app/[locale]/assessment/pharmacies/PharmaciesAssessmentClient.tsx, webapp/app/[locale]/assessment/fintech-nbfc/FintechNbfcAssessmentClient.tsx, webapp/app/[locale]/assessment/gyms-salons-spas/GymsSalonsSpasAssessmentClient.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /assessment/fintech-nbfc

### T22 — Notice generator part 1: live preview feedback
- implements: AC42, AC43, AC44, AC45, AC48
- depends_on: T8, T9, T11
- files: webapp/app/[locale]/tools/dpdpa-privacy-notice-generator/NoticePackClient.tsx, webapp/app/[locale]/tools/dpdpa-privacy-notice-generator/notice-pack.css, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /tools/dpdpa-privacy-notice-generator
- notes:
  - Clause wash: map each form step to the clause ids it affects; debounce 300 ms; call `scrollIntoView({block:"nearest"})` on the preview container only.
  - The generated notice and the email modal get `data-sp-still`.

### T23 — Notice generator part 2: pack assembly and language swap
- implements: AC46, AC47
- depends_on: T22, T12
- files: webapp/app/[locale]/tools/dpdpa-privacy-notice-generator/NoticePackClient.tsx, webapp/components/motion/AssembleOnce.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint
- notes:
  - Store "played" in `sessionStorage`, wrapped in try/catch.
  - Recipe: `scroll/exploded-view-assembly` (limit), using CSS transforms on four layers.

### T24 — Data mapping hub
- implements: AC49, AC50, AC51
- depends_on: T10, T9
- files: webapp/app/[locale]/data-mapping/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /data-mapping
- notes: The tile preview (AC51) uses the `components/hover-reveal-effect` recipe, with tap and focus parity.

### Phase 3 — Data-flow maps (shared template; pilot on clinics)

### T25 — Data-flow: legible at rest
- implements: AC52, AC2
- depends_on: T2
- files: webapp/components/data-flow/MotionJourney.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /industries/clinics-diagnostic-labs/data-flow && npm run motion:audit -- --route /industries/ca-firms/data-flow
- notes:
  - Today, unreached items render at opacity 0.15 and 0 (lines ~416 and ~462) and the counters start at 0. Make the rendered rest state "reached = all": full opacity and totals.
  - After hydration and the first scroll, switch to progress mode, never below 0.6 opacity.
  - Dilip checks A6 on clinics.

### T26 — Data-flow: journey spine and spotlight
- implements: AC53, AC54
- depends_on: T25, T10, T51
- files: webapp/components/data-flow/MotionJourney.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /industries/clinics-diagnostic-labs/data-flow
- notes:
  - Reuse the existing `reached` logic to drive JourneyLine `progress`. Wrap the stages in a Spotlight provider; break stages come from the stage data's control-break flag.

### T27 — Data-flow: boundary panel, model switch, stage navigator
- implements: AC55, AC56, AC62
- depends_on: T26
- files: webapp/components/data-flow/MotionJourney.tsx, webapp/components/data-flow/BoundaryLaneMap.tsx, webapp/app/[locale]/industries/[sector]/data-flow/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /industries/clinics-diagnostic-labs/data-flow
- notes:
  - StickySwitch recipe: `scroll/sticky-content-switch`, simplified (CSS sticky).
  - Navigator recipe: `timelines/timeline-chapter-scrubber`, without magnify.

### T28 — Data-flow: hotspots, rights folder, incident order
- implements: AC57, AC58, AC59
- depends_on: T12, T51, T25
- files: webapp/components/data-flow/HotspotRail.tsx, webapp/components/data-flow/RightsSimulator.tsx, webapp/components/data-flow/IncidentSimulator.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:lint && npm run motion:audit -- --route /industries/clinics-diagnostic-labs/data-flow
- notes: The incident and breach content is calm: no alarm red, no shake (guardrails §3).

### T29 — Data-flow: leaving the boundary, full map on demand
- implements: AC60, AC61
- depends_on: T25
- files: webapp/components/data-flow/FlowSystemTable.tsx, webapp/components/data-flow/DetailSheet.tsx, webapp/app/[locale]/industries/[sector]/data-flow/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /industries/ca-firms/data-flow
- notes:
  - Gradual Blur recipe, simplified to one static layer.
  - Before marking done, spot-check all 12 sectors: `for s in recruitment-agencies ca-firms training-institutes d2c-brands clinics-diagnostic-labs schools-colleges law-firms real-estate hotels-travel pharmacies fintech-nbfc gyms-salons-spas; do npm run motion:audit -- --route /industries/$s/data-flow || break; done`

### Phase 3 — Other tool pages

### T30 — Penalties guide
- implements: AC63, AC64, AC7
- depends_on: T10
- files: webapp/app/[locale]/penalty-calculator/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /penalty-calculator
- notes:
  - Check `components/penalty-calculator/` for the table components. Wrap every table in `data-sp-still` (still_zones ≥ 4).

### T31 — Templates, white paper, compliance checklist
- implements: AC65, AC66, AC67
- depends_on: T9, T12, T51
- files: webapp/app/[locale]/resources/page.tsx, webapp/app/[locale]/white-paper/page.tsx, webapp/app/[locale]/compliance-checklist/page.tsx, webapp/motion-manifest.json
- risk: tier1
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /resources && npm run motion:audit -- --route /white-paper && npm run motion:audit -- --route /compliance-checklist
- notes:
  - **tier1:** these pages have lead forms with consent checkboxes; they must end up still and unchanged in behaviour.
  - The download tick appears only on a confirmed download response.

### Phase 4 — Learn, guides, glossary, FAQ

### T32 — Reading progress (learn, statute, articles)
- implements: AC69
- depends_on: T10
- files: webapp/components/motion/ReadingProgress.tsx, webapp/app/[locale]/learn/[topic]/page.tsx, webapp/app/[locale]/briefings/[slug]/page.tsx, webapp/app/[locale]/blog/[slug]/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /learn/consent
- notes: Use CSS `animation-timeline: scroll()` where supported, with a passive scroll-listener fallback. Mark it `aria-hidden`.

### T33 — Learn hub path and statute navigation
- implements: AC68, AC79
- depends_on: T10, T32
- files: webapp/app/[locale]/learn/page.tsx, webapp/app/[locale]/learn/dpdp-act-2023/page.tsx, webapp/app/[locale]/learn/dpdp-rules-2025-plain-english-guide/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /learn && npm run motion:audit -- --route /learn/dpdp-act-2023
- notes: Statute bodies and the schedule table are `data-sp-still`.

### T34 — Learn topics: myths, consent split, consent checklist
- implements: AC71, AC72, AC76
- depends_on: T9, T12, T5
- files: webapp/lib/data/learn-content.ts, webapp/app/[locale]/learn/[topic]/page.tsx, webapp/components/motion/ConsentSplit.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /learn/myths && npm run motion:audit -- --route /learn/consent
- notes:
  - Add an optional `visual` field to topic sections so the page can render a kit component in place of a paragraph. Keep the text in the content for search and the Hindi version.
  - ConsentSplit follows `components/card-swap` (limit): click only.

### T35 — Learn topics: timelines and process steps
- implements: AC70, AC73, AC74, AC75, AC78
- depends_on: T34, T10
- files: webapp/lib/data/learn-content.ts, webapp/lib/data/i18n/learn-content.hi.ts, webapp/app/[locale]/learn/[topic]/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /learn/what-is-dpdpa && npm run motion:audit -- --route /learn/retention && npm run motion:audit -- --route /hi/learn/retention
- notes:
  - Uses the `visual` field from T34. Compute the "today" marker on the server at render time.
  - Quiet topics (AC78) only get their manifest entries.

### T36 — Defined-term popovers on learn topics
- implements: AC77
- depends_on: T34
- files: webapp/components/motion/TermPopover.tsx, webapp/app/[locale]/learn/[topic]/page.tsx, webapp/components/glossary/glossaryData.ts, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /learn/applicability
- notes: Recipe `components/hover-reveal-effect`: hover, focus, tap and Escape. Link only the first mention per section.

### T37 — Guide: OPERATE rail and reading progress (English and Hindi)
- implements: AC80, AC82
- depends_on: T10
- files: webapp/public/guides/guide-motion.js, webapp/public/guides/guide-motion.css, webapp/public/guides/dpdpa-guide-en.html, webapp/public/guides/dpdpa-guide-hi.html
- risk: tier2
- size: M
- verify: cd webapp && node scripts/motion-lint.mjs public/guides && grep -q "guide-motion.js" public/guides/dpdpa-guide-hi.html
- notes:
  - Static HTML: vanilla JS and CSS only, ≤ 4 KB, `defer`.
  - Q2 decides the other 5 languages (T39).

### T38 — Guide diagrams 1: 90-day roadmap and breach rail (English and Hindi)
- implements: AC81
- depends_on: T37
- files: webapp/public/guides/guide-motion.js, webapp/public/guides/guide-diagrams.css, webapp/public/guides/dpdpa-guide-en.html, webapp/public/guides/dpdpa-guide-hi.html
- risk: tier2
- size: M
- verify: cd webapp && node scripts/motion-lint.mjs public/guides && grep -q 'data-sp-motion="roadmap-rail"' public/guides/dpdpa-guide-en.html
- notes:
  - Keep each original image as a `<noscript>`/print fallback.
  - The breach rail is fill-once, not a countdown.

### T52 — Guide diagrams 2: consent flow, decision tree, risk heatmap (English and Hindi)
- implements: AC81
- depends_on: T38
- files: webapp/public/guides/guide-motion.js, webapp/public/guides/guide-diagrams.css, webapp/public/guides/dpdpa-guide-en.html, webapp/public/guides/dpdpa-guide-hi.html
- risk: tier2
- size: M
- verify: cd webapp && node scripts/motion-lint.mjs public/guides && grep -q 'data-sp-motion="journey-line"' public/guides/dpdpa-guide-en.html
- notes: The decision tree and consent flow draw once in reading order; heatmap cells fill once by row.

### T39 — Guide: other 5 languages
- implements: AC80, AC81, AC82
- depends_on: T52
- files: webapp/public/guides/dpdpa-guide-gu.html, webapp/public/guides/dpdpa-guide-mr.html, webapp/public/guides/dpdpa-guide-kn.html, webapp/public/guides/dpdpa-guide-ta.html, webapp/public/guides/dpdpa-guide-te.html
- risk: tier2
- size: M
- verify: cd webapp && for l in gu mr kn ta te; do grep -q "guide-motion.js" public/guides/dpdpa-guide-$l.html || exit 1; done
- notes: Blocked by Q2. Without translated labels, add only the rail and reading progress; keep the images.

### T40 — Glossary filter reflow and term arrival
- implements: AC83, AC84
- depends_on: T12
- files: webapp/components/glossary/GlossaryClient.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /glossary

### T41 — FAQ accordions everywhere
- implements: AC85, AC10
- depends_on: T12
- files: webapp/app/[locale]/faq/FAQContent.tsx, webapp/components/home/FAQPreview.tsx, webapp/motion-manifest.json
- risk: tier2
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /faq && curl -s localhost:3000/faq | grep -q "aria-expanded"
- notes: Industry pages use native `<details>`. Their smooth open ships in T42–T44 with the same SoftSwap height behaviour.

### Phase 4 — Industries, briefings, company

### T42 — Industry pages A: shared preview + 4 pages
- implements: AC86, AC87, AC88, AC85
- depends_on: T9, T10, T12
- files: webapp/components/industries/DataFlowPreview.tsx, webapp/app/[locale]/industries/ca-firms/page.tsx, webapp/app/[locale]/industries/clinics-diagnostic-labs/page.tsx, webapp/app/[locale]/industries/d2c-brands/page.tsx, webapp/app/[locale]/industries/recruitment-agencies/page.tsx
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /industries/ca-firms
- notes:
  - DataFlowPreview must read totals from the same data-flow data as the map (AC87).
  - Update the manifest entries for these 4 routes in the same PR (manifest is the 6th file; allowed exception, mechanical).

### T43 — Industry pages B: 4 pages
- implements: AC86, AC88, AC85
- depends_on: T42
- files: webapp/app/[locale]/industries/training-institutes/page.tsx, webapp/app/[locale]/industries/schools-colleges/page.tsx, webapp/app/[locale]/industries/law-firms/page.tsx, webapp/app/[locale]/industries/real-estate/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /industries/law-firms

### T44 — Industry pages C: 4 pages
- implements: AC86, AC88, AC85
- depends_on: T42
- files: webapp/app/[locale]/industries/hotels-travel/page.tsx, webapp/app/[locale]/industries/pharmacies/page.tsx, webapp/app/[locale]/industries/fintech-nbfc/page.tsx, webapp/app/[locale]/industries/gyms-salons-spas/page.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /industries/fintech-nbfc

### T45 — Briefings hub: reorder and the run
- implements: AC90, AC91
- depends_on: T6, T9, T12
- files: webapp/components/briefings/BriefingSentence.tsx, webapp/components/briefings/BriefingsExplorer.tsx, webapp/components/briefings/BriefingAlmanac.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /briefings
- notes: Mark the subscribe card (`BriefingSubscribeCard.tsx`) `data-sp-still`. That one-line change is allowed in this PR.

### T46 — Articles: infographic expand and blog lane reorder
- implements: AC90, AC92
- depends_on: T12, T32
- files: webapp/app/[locale]/briefings/[slug]/page.tsx, webapp/app/[locale]/blog/page.tsx, webapp/app/[locale]/blog/[slug]/page.tsx, webapp/components/motion/ExpandImage.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /blog

### T47 — About and Contact
- implements: AC93
- depends_on: T10, T11
- files: webapp/app/[locale]/about/page.tsx, webapp/app/[locale]/contact/page.tsx, webapp/motion-manifest.json
- risk: tier1
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /about && npm run motion:audit -- --route /contact
- notes: **tier1:** the contact form collects personal data with consent; it must stay still and behave exactly as before.

### T48 — Media pages and the logo marquee rule
- implements: AC95
- depends_on: T4, T9
- files: webapp/app/[locale]/media/page.tsx, webapp/app/[locale]/media/coverage/page.tsx, webapp/components/ui/PressProofStrip.tsx, webapp/components/media/MediaCoverageList.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /media && npm run motion:audit -- --route /media/press-wall
- notes: The marquee shows only when there are 8 or more logos, and needs a visible pause button (recipe `testimonials/testimonial-marquee`).

### T49 — Legal pages: still zones and success ticks
- implements: AC96, AC6
- depends_on: T9
- files: webapp/app/[locale]/privacy/page.tsx, webapp/app/[locale]/terms/page.tsx, webapp/app/[locale]/rights/page.tsx, webapp/app/[locale]/consent-preferences/page.tsx, webapp/app/[locale]/unsubscribe/page.tsx
- risk: tier1
- size: S
- verify: cd webapp && npx tsc --noEmit && npm run lint && for r in /privacy /terms /rights /consent-preferences /unsubscribe; do npm run motion:audit -- --route $r || exit 1; done
- notes:
  - **tier1:** consent and rights surfaces. Only add the `data-sp-still` markers and the post-success tick; no other changes.
  - `rights/access` and `rights/erasure` follow in the same PR if the success state lives there. Update the manifest too.

### Phase 5 — Optional

### T50 — Home hero atmosphere (only if Q1 = yes)
- implements: AC94, AC11
- depends_on: T14, T3
- files: webapp/components/motion/HeroAtmosphere.tsx, webapp/components/home/HeroSection.tsx, webapp/motion-manifest.json
- risk: tier2
- size: M
- verify: cd webapp && npx tsc --noEmit && npm run lint && npm run motion:audit -- --route /
- notes:
  - Recipe `shaders/shader-mesh-drift` (limit), with the pointer reaction disabled. Start after `load`; pause off-screen and when the tab is hidden; cap DPR at 1.5.
  - Re-run the T3 Lighthouse check on `/`. Revert if the score drops more than 3 points.
