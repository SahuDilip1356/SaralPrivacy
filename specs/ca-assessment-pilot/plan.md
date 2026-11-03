# Plan — CA firm risk scan that people finish

**Status:** draft
**Spec:** ./spec.md
**Date:** 2026-11-03
**Branch:** `spec/ca-assessment-pilot`, cut from origin/main @ 27a955e
**Worktree:** `webapp/.claude/worktrees/ca-assessment-pilot-spec`
**Design source:** `SaralPrivacyHub/Strategy/assessment-lead-magnet/SUBFRAME-MOTION-SPEC.md` (motion values, moments M1–M13); reference build `SaralPrivacyHub/Strategy/assessment-lead-magnet/prototype/ca-scan-v5.html`

## Architecture

```
app/[locale]/assessment/ca-firms/page.tsx
  └─ CAAssessmentClient.tsx ── isCaScanV2(searchParams) ?─▶ components/assessment/v2/CAScanV2.tsx   (new)
                               │                            ├─ ProgressRail, QuestionPanel(AnswerOption), SectionStamp
                               │                            ├─ ResumeCard, StateBanner, ScoreButton
                               │                            └─ CAResultV2 ─ ScoreReveal, FreeFix, RiskMap, ReportForm
                               └─ (switch off) today's client, untouched
Pure logic (no next/*, no React; runs under node --test):
  lib/motion/{tokens,can-animate}.ts
  lib/assessment/{scan-progress,resume,report-form,scan-events}.ts
  lib/data/industry-assessment/core.ts  + optional pack fields `sections`, `rankedFixes`
Server: app/api/assessment/route.ts (unchanged) → lib/email-templates.ts (escape client text)
Analytics: lib/analytics.ts (Vercel Web Analytics, cookieless) gets sector-tagged helpers
```

All new interface strings live in `messages/en.json` and `messages/hi.json` under `assessment.scanV2`.

## Decisions

- **framer-motion 12, not the `motion` package.** The Subframe examples import `motion/react`, but the repo already ships `framer-motion` ^12.38, the same engine. Rejected alternative: adding `motion`, which would duplicate the engine.
- **A new v2 client behind a switch, not edits to today's client.** The old scan stays byte-identical for rollback (AC38). Rejected alternative: editing `CAAssessmentClient.tsx` in place, which has no clean way back.
- **The switch:** `NEXT_PUBLIC_CA_SCAN_V2=1` at build time. `?scanV2=1` forces it on only when `VERCEL_ENV !== "production"`. Rejected alternative: a runtime flag service, a new dependency for one switch.
- **The Indian mobile check is a small regex normaliser**, not `libphonenumber-js` (already a dependency). The rule is narrow (AC26), and pulling the library's metadata into this client would break the 15 KB budget.
- **Ranked fixes are a new optional pack function, `rankedFixes(result)`,** which returns `{ text, bucket | null }[]`. The CA pack implements it from its existing `FOUR_CONTROLS` and 34-point threshold, sorted by bucket score with ties kept in pack order. `recommend()` stays for the other 11 packs. Rejected alternative: changing `recommend()`'s return type, which would touch all 12 packs.
- **The request's `immediateActions` carries the ranked order,** so the emailed plan matches the page (AC30). The server and payload shape are unchanged.
- **Score ring and number share one `MotionValue`, animated with `animate()` in `useEffect`.** That also fixes today's first-render case, where the ring has no starting offset to transition from. Rejected alternative: a separate per-digit spring (as in `sliding-number`), which lands apart from the ring.
- **Bars use `clip-path: inset()` driven by a spring (`poll-results`), not `width`.** Reason: performance (spec Non-functional).
- **Pure logic in `lib/`, tested with the repo's `node --test` runner; UI behaviour tested end to end.** The repo has no component-test library. Rejected alternative: adding one now. Its cost is better spent on the end-to-end suite that covers AC34–AC36.
- **End-to-end tests:** add `@playwright/test` and `@axe-core/playwright` as devDependencies, so nothing ships to the browser. Rejected alternative: the global playwright-cli, which isn't reproducible in CI.
- **Hide the chat launcher on `/assessment*`,** matching how it is already hidden on `/admin` and `/report`. Rejected alternative: repositioning it, which can still overlap content on small phones (AC34).
- **Escape client-supplied text in the survey result email builder** (`lib/email-templates.ts`) with the existing `escapeHtml`. This fixes all sectors at once. Rejected alternative: escaping in the CA client, which a forged request skips.

## Setup (before T1, not a task)

```bash
cd "webapp/.claude/worktrees/ca-assessment-pilot-spec/webapp" && npm ci
./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c "error TS" > /tmp/ca-pilot-tsc-baseline.txt   # baseline; verify must not raise it
```

- Use `./node_modules/.bin/tsc`, not `npx tsc`, because `npx` can stall on an install prompt.
- All `verify` commands run from the `webapp/` app directory inside the worktree.
- `TSC_OK` below is shorthand for:
  ```
  test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)"
  ```
  Paste it in full when running.
- `UNIT` is shorthand for `node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test`.

## Tasks

### T1 — Add motion tokens and the can-animate rule
- implements: AC4, AC8, AC36
- depends_on: none
- files: lib/motion/tokens.ts, lib/motion/can-animate.ts, lib/motion/can-animate.test.ts, components/assessment/v2/useMotionOk.ts
- risk: tier2
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/motion/can-animate.test.ts && test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)"
- notes:
  - Copy the token values exactly from SUBFRAME-MOTION-SPEC §4 (`DUR`, `EASE_OUT`, `EASE_PANEL`, `POP`, `CELL`, `FILL`, `CROSSFADE`, `STILL`, `PANEL_SHIFT`, `RISE`, `STAGGER`).
  - `canAnimate({ reducedMotion, fromKeyboard })` returns false if either is true. Test all 4 combinations.
  - `useMotionOk()` subscribes to `matchMedia('(prefers-reduced-motion: reduce)')` change events (as the Subframe examples do), and exposes `markKeyboard(e)` that reads `e.detail === 0`.

### T2 — Progress, time-left and navigation-lock logic
- implements: AC1, AC2, AC3, AC7
- depends_on: none
- files: lib/assessment/scan-progress.ts, lib/assessment/scan-progress.test.ts
- risk: tier2
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/scan-progress.test.ts
- notes:
  - Export these:
    - `timeLeft(questions, answers, qi)` → `{ text, last }`, following the AC3 rule. Test R=0, 1, 3 and 4, plus the last-question cases.
    - `railLabel(...)`, which gives the AC2 text.
    - `progressPct(...)`.
    - `createNavLock(ms = 350)`, which returns `tryEnter(now)`. Test a second call at +100 ms (false) and at +400 ms (true).
  - No React imports.

### T3 — Saved-progress store
- implements: AC10, AC12, AC13, AC14, AC15, AC16
- depends_on: none
- files: lib/assessment/resume.ts, lib/assessment/resume.test.ts
- risk: tier1
- size: M
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/resume.test.ts
- notes:
  - Signature: `createResumeStore(storage: Pick<Storage,"getItem"|"setItem"|"removeItem"> | null, sector, questions, now = Date.now)`, with `probe()`, `save({answers, qi, stamped}, at?)`, `load()` and `clear()`.
  - `load()` returns `{ kind: "none" | "expired" | "ok", ... }`.
  - Key: `sp-assessment-v1:<sector>`. Shape exactly as in spec Contracts.
  - Tests must cover:
    - a parse failure, the wrong `v`, an unknown option ID, a `qi` out of range;
    - exactly 7 days old against 7 days + 1 ms;
    - storage that throws on `setItem` (`probe()` false);
    - an assertion that the saved JSON never has the keys name, firm, email or phone, even if they're passed in.
  - tier1 because it stores a person's answers on their device (A4).

### T4 — Ranked fixes and section metadata in the pack
- implements: AC1, AC21, AC22, AC30
- depends_on: none
- files: lib/data/industry-assessment/core.ts, lib/data/industry-assessment/packs/ca-firms.ts, lib/data/industry-assessment/ranked-fixes.test.ts
- risk: tier2
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/data/industry-assessment/ranked-fixes.test.ts lib/data/industry-assessment/prefill.test.ts
- notes:
  - Add these optional fields to `IndustryPack`:
    - `sections?: { key: string; label: string; stamp: string; questionIds: string[] }[]`
    - `rankedFixes?: (r: IAResult) => { text: string; bucket: string | null }[]`
  - CA sections:
    - practice → q1, q2
    - documents → q3, q4, q5
    - controls → q6–q10
    - q0 stays as "Start"
  - CA `rankedFixes` selects the same fixes as `recommend()`: all 4 when High or Critical, otherwise those whose bucket is ≥34, else the fallback with `bucket: null`.
    - The fix order is intake, storage_access, retention, vendor_incident.
    - Results are sorted by bucket score, descending; the sort is stable.
  - Tests:
    - a High band with intake 83 and retention 90 puts retention first;
    - a tie keeps the pack order;
    - a Controlled result with every bucket under 34 returns the fallback.
  - Scoring itself is untouched (NG2).

### T5 — Report-form validation and phone normaliser
- implements: AC25, AC26, AC31
- depends_on: none
- files: lib/assessment/report-form.ts, lib/assessment/report-form.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/report-form.test.ts
- notes:
  - `validateReportForm({name, firm, email, phone, consent})` returns `{ errors: Partial<Record<"name"|"firm"|"email"|"phone"|"consent", MessageKey>>, phone10: string }`.
  - `normalizeIndianMobile(v)` returns 10 digits or null.
  - Test these inputs:
    - "98765 43210", "+91-98765-43210", "919876543210" and "09876543210" are valid;
    - "12345", "5876543210" and "98765" are invalid;
    - blank is valid with `phone10 ""`.
  - Email rule: one `@`, a non-empty local part, and a domain with a dot and a 2+ character ending. Test "dilip@", "a@b" and "a@firm.in".
  - Return message keys, not English text, so T7 owns the copy.
  - tier1 because it gates consent and personal data.

### T6 — Sector-tagged analytics helpers
- implements: AC37
- depends_on: none
- files: lib/analytics.ts, lib/assessment/scan-events.ts, lib/assessment/scan-events.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/scan-events.test.ts && test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)"
- notes:
  - `scanEventProps(event, input)` builds the property object for each event in spec Contracts and drops any key not on that event's allow-list.
  - Test that a stray `email`, `name` or free-text key passed in never appears in the output.
  - In `lib/analytics.ts`:
    - add `sector` and `resumed` to `assessmentStart`;
    - add `sector` to `assessmentStep`;
    - add the new helpers, each going through `scanEventProps`;
    - keep the existing call signatures working, since today's client still calls them.
  - **Ship this task to production first**, on its own, to start the 2-week baseline (see Rollout).

### T7 — New interface strings
- implements: AC9, AC11, AC13, AC15, AC18, AC22, AC24, AC25, AC28, AC29, AC30, AC33
- depends_on: none
- files: messages/en.json, messages/hi.json
- risk: tier2
- size: S
- verify: node -e "const e=require('./messages/en.json').assessment.scanV2,h=require('./messages/hi.json').assessment.scanV2;const k=o=>Object.keys(o).sort().join();if(!e||!h||k(e)!==k(h))process.exit(1);if(!/apply from 13 May 2027\. This score is an educational check, not a compliance certificate or legal advice\./.test(e.legalLine))process.exit(1)"
- notes:
  - Add an `assessment.scanV2` block, copying the text exactly from the spec ACs.
  - In `hi.json`, use the English values for now (Q6). `legalLine` and the consent sentence stay English by design.
  - Run `python3 ~/.claude/skills/sd-no-ai-slop/scripts/slop_lint.py --strict` on the new English values before committing.

### T8 — Escape client-supplied text in the survey result email
- implements: AC32
- depends_on: none
- files: lib/email-templates.ts, lib/email-templates.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/email-templates.test.ts
- notes:
  - In the survey result template (about lines 520–600 at 27a955e), wrap these values in the existing `escapeHtml`:
    - `${rec}` (recommendations), `data.summary`, `data.band` (escape before `.toUpperCase()`);
    - red flags, and the answer-summary rows.
  - Test that a payload with `<img src=x onerror=alert(1)>` in each field renders as `&lt;img`, and that "Sahu & Co" renders as "Sahu &amp; Co".
  - This affects every sector's email, which is intended.
  - Closes security audit run-1 finding 1 for this template.

### T9 — Progress rail and answer option
- implements: AC1, AC2, AC8
- depends_on: T1, T2, T4
- files: components/assessment/v2/ProgressRail.tsx, components/assessment/v2/AnswerOption.tsx
- risk: tier2
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/ProgressRail.tsx components/assessment/v2/AnswerOption.tsx
- notes:
  - Rail:
    - one element with `role="progressbar"` and `aria-valuetext` from `railLabel`, its children `aria-hidden`;
    - segment fill is `scaleX` over 280 ms with `EASE_OUT`;
    - the section tick uses the `POP` spring (task-steps).
  - Option:
    - a visually hidden native input;
    - the tick polyline uses `stroke-dashoffset` 16→0, 200 ms, 40 ms delay;
    - the empty border is slate-500;
    - hover styles sit inside `@media (hover:hover)`;
    - badge text is 12 px.
  - Port from prototype v5 (`progressHTML`, `questionHTML`).

### T10 — Question panel and section stamp
- implements: AC4, AC5, AC9
- depends_on: T1, T9
- files: components/assessment/v2/QuestionPanel.tsx, components/assessment/v2/SectionStamp.tsx
- risk: tier2
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/QuestionPanel.tsx components/assessment/v2/SectionStamp.tsx
- notes:
  - Panel:
    - follow transition-panel: `AnimatePresence mode="popLayout"`, `custom` direction, 18 px, `blur(2px)`, 0.24 s, `EASE_PANEL`, with duration 0 when `!canAnimate`;
    - the heading gets focus after each change (`tabIndex=-1`);
    - Enter on an option calls `onNext` only when answered (AC5).
  - Stamp:
    - activity-stamp press keyframes (scale 1.22→1, 180 ms, `cubic-bezier(.2,.9,.3,1)`), held `DUR.stampHold`, then a 200 ms fade;
    - `aria-hidden`; the parent announces through the live region;
    - renders nothing under reduced motion.
  - Keep the MIT headers from Motion Primitives (transition-panel) and Subframe (activity-stamp).

### T11 — Resume card and state banners
- implements: AC11, AC13, AC15, AC33
- depends_on: T3, T7
- files: components/assessment/v2/ResumeCard.tsx, components/assessment/v2/StateBanner.tsx
- risk: tier2
- size: S
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/ResumeCard.tsx components/assessment/v2/StateBanner.tsx
- notes:
  - ResumeCard:
    - fades up 8 px over 250 ms; focus goes to the heading on mount;
    - shows a mini rail of answered questions;
    - the buttons are "Continue from …" and "Start again".
  - StateBanner:
    - `kind: "offline-quiz" | "offline-result" | "no-storage" | "expired"`;
    - gold-50 background with gold-700 text, and no motion.

### T12 — Async button for scoring and sending
- implements: AC17, AC18, AC27
- depends_on: T1, T7
- files: components/assessment/v2/useAsyncAction.ts, components/assessment/v2/ScoreButton.tsx
- risk: tier2
- size: S
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/useAsyncAction.ts components/assessment/v2/ScoreButton.tsx
- notes:
  - Port `useAsyncAction` from loading-button, keeping the run-id guard so a second activation while pending is ignored.
  - Faces crossfade with `CROSSFADE` (opacity, 3 px rise, 3 px blur) in one grid cell, so the size never changes.
  - Use `aria-busy` while pending.
  - The slow-notice timer fires at `DUR.slowNotice`.
  - Keep the Interior MIT header.

### T13 — Score reveal and band label
- implements: AC19, AC20, AC24
- depends_on: T1, T7
- files: components/assessment/v2/ScoreReveal.tsx
- risk: tier2
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/ScoreReveal.tsx
- notes:
  - One `useMotionValue(0)`, animated in `useEffect` with `animate(mv, score, { duration: DUR.score, ease: EASE_OUT })`.
  - The ring's `strokeDashoffset` and the digit columns are both `useTransform(mv, ...)`. Use the digit-column technique from sliding-number, but not its per-digit spring.
  - With `!canAnimate`, call `mv.jump(score)`.
  - The ring and digits are `aria-hidden`. The `<h2 tabIndex=-1>` heading includes the band in an `sr-only` span.
  - The band chip is navy text on `color-mix(in srgb, var(--band) 14%, white)` with a band-coloured border and dot, and pops in with `POP` at 0.85 s.
  - Render `legalLine` under the band copy.
  - Keep the Motion Primitives MIT header.

### T14 — Free fix and risk map
- implements: AC21, AC22, AC23
- depends_on: T1, T4, T7
- files: components/assessment/v2/FreeFix.tsx, components/assessment/v2/RiskMap.tsx
- risk: tier2
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/FreeFix.tsx components/assessment/v2/RiskMap.tsx
- notes:
  - FreeFix:
    - takes `rankedFixes(result)[0]` and fades up at 0.95 s;
    - fires `free_fix_viewed` once, via IntersectionObserver.
  - RiskMap:
    - red flags with the singular heading rule, fading up 60 ms apart from 1.15 s;
    - the two summary bars;
    - the bucket list sorted descending, first two shown, plus a "Show all 5 areas" button (`aria-expanded`, `aria-controls`, hidden rows via the `hidden` attribute);
    - the no-flags panel.
  - Bars use poll-results: a `motionValue` animated with the `FILL` spring into `clipPath: inset(0 X% 0 0)`, 60 ms apart from 0.5 s.
  - Status chips carry `sr-only` text: "<Status> risk, N of 100".
  - Keep the Interior MIT header.

### T15 — Report form
- implements: AC25, AC26, AC27, AC28, AC29, AC30, AC31
- depends_on: T5, T6, T7, T12
- files: components/assessment/v2/ReportForm.tsx
- risk: tier1
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/ReportForm.tsx
- notes:
  - Labelled inputs with 16 px text on phones (`text-base sm:text-sm`) and a minimum height of 44 px.
    - Use `autocomplete` values name, organization, email and tel.
    - Use `inputmode` email and tel.
    - The email field also gets `autocapitalize="off"` and `spellcheck={false}`.
  - Errors are linked with `aria-describedby` and `aria-invalid`; focus goes to the first invalid field.
  - Keep the existing consent checkbox and its English consent sentence. Make the box 24 px inside a 44 px label.
  - Keep the existing honeypot `hp_url`.
  - Sending:
    - reuse today's 3-attempt retry loop with `Retry-After` handling from `CAAssessmentClient.tsx` (`unlockReport`);
    - check `navigator.onLine === false` before any request (AC29);
    - send `immediateActions` as the ranked texts (AC30) and `mobile` as `phone10`.
  - Fire `report_requested` only on a 200. Today it fires before sending, so this changes the metric's meaning; note it in the PR.

### T16 — The new scan flow (quiz side) and the release switch
- implements: AC4, AC6, AC7, AC10, AC11, AC12, AC13, AC15, AC33, AC37, AC38
- depends_on: T2, T3, T6, T9, T10, T11, T12
- files: components/assessment/v2/CAScanV2.tsx, lib/flags.ts, app/[locale]/assessment/ca-firms/CAAssessmentClient.tsx
- risk: tier1
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/CAScanV2.tsx lib/flags.ts "app/[locale]/assessment/ca-firms/CAAssessmentClient.tsx" && test "$(git diff origin/main -- "app/[locale]/assessment/ca-firms/CAAssessmentClient.tsx" | grep -c '^[+-][^+-]')" -le 12
- notes:
  - `isCaScanV2(searchParams)` reads `NEXT_PUBLIC_CA_SCAN_V2==="1"`, or `?scanV2=1` when `process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"`.
  - `CAAssessmentClient` changes only by an early `return <CAScanV2 />` when the switch is on (the diff limit in verify enforces this).
  - CAScanV2 owns the state:
    - answers, qi, stamped, phase;
    - the resume store (T3) and the nav lock (T2);
    - history (`pushState` per question with `#qN`, `#result`; a `popstate` handler restores qi);
    - online and offline listeners;
    - the single `sr-only` live region;
    - analytics calls (T6).
  - Keep the existing `?pre=` prefill and `?bucket=` focus banner behaviour; reuse `parsePrefill` and `entrySource`.
  - `assessment_start` fires once on mount, with `resumed` set after "Continue".

### T17 — The new scan flow (result side)
- implements: AC16, AC17, AC19, AC21, AC23, AC24, AC30
- depends_on: T13, T14, T15, T16
- files: components/assessment/v2/CAResultV2.tsx, components/assessment/v2/CAScanV2.tsx
- risk: tier2
- size: M
- verify: test "$(./node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -c 'error TS')" -le "$(cat /tmp/ca-pilot-tsc-baseline.txt)" && ./node_modules/.bin/eslint components/assessment/v2/CAResultV2.tsx components/assessment/v2/CAScanV2.tsx
- notes:
  - Result order: score card (with the legal line), free fix, red flags or the no-flags panel, summary bars, risk map, form, the Gap Review call to action (unchanged), FlowCrossLink, retake.
  - Clear saved progress when the result opens (AC16).
  - Fire `assessment_complete` with sector, score and band.
  - Focus `#rhead` after mount, then scroll to top (smooth only when `canAnimate`).

### T18 — Hide the chat launcher on assessment pages
- implements: AC34
- depends_on: none
- files: components/chat/SetuChat.tsx
- risk: tier2
- size: S
- verify: grep -q 'pathname.startsWith("/assessment")' components/chat/SetuChat.tsx && ./node_modules/.bin/eslint components/chat/SetuChat.tsx
- notes: extend the existing hide check (line ~123 at 27a955e: `/admin` and `/report`) with `/assessment`. The path is already locale-stripped.

### T19 — End-to-end and accessibility suite
- implements: AC3, AC5, AC6, AC7, AC9, AC11, AC13, AC14, AC15, AC19, AC25, AC27, AC28, AC29, AC30, AC33, AC34, AC35, AC36
- depends_on: T8, T17, T18
- files: package.json, playwright.config.ts, e2e/ca-scan.spec.ts, e2e/ca-scan-a11y.spec.ts
- risk: tier2
- size: M
- verify: NEXT_PUBLIC_CA_SCAN_V2=1 npx --no-install playwright test e2e/ca-scan.spec.ts e2e/ca-scan-a11y.spec.ts --reporter=line
- notes:
  - Add devDependencies `@playwright/test` and `@axe-core/playwright` (exact versions).
  - Config: `webServer: next build && next start` with the flag set. Chromium at 1280 px plus 360 × 740 with `isMobile` and `hasTouch`.
  - Block `/_vercel/insights` and the speed-insights URL in every test. Assert analytics calls through a `page.route` capture instead (AC37 check: no property value matches an email or phone regex).
  - Mock `/api/assessment`:
    - 200;
    - 500 three times;
    - 429 with `Retry-After: 1`;
    - offline via `context.setOffline(true)`.
  - Seed `localStorage` for the resume, expired (`at` 8 days ago) and corrupt cases. Use `addInitScript` to make `setItem` throw for the private-browsing case.
  - Reduced motion: `emulateMedia({ reducedMotion: "reduce" })`, and switch it mid-test.
  - axe runs with tags `wcag2a`, `wcag2aa`, `wcag21aa` and `wcag22aa` on the 8 states in AC35.
  - Tap targets: query every `button`, `a`, `summary` and `label` in `main` and assert a bounding box of at least 44 × 44 (AC34).
  - Start from `SaralPrivacyHub/Strategy/assessment-lead-magnet/prototype/check-states.js`; it already drives most of these states.

### T20 — Preview sign-off: VoiceOver, real phone, legal date
- implements: AC2, AC4, AC19, AC24, AC36
- depends_on: T19
- files: specs/ca-assessment-pilot/signoff.md
- risk: tier1
- size: S
- verify: manual — on the Vercel preview with `?scanV2=1`, complete the scan with VoiceOver on an iPhone and on Mac Safari, and record in signoff.md that:
  - the progress text, each question, "<Section> section done.", and score plus band are each read once;
  - the scan completes on a real 360 px Android phone;
  - Q1–Q6 have answers, and the 13 May 2027 date was checked against the MeitY notification.
- notes: Dilip signs this file. The release switch stays off in production until it is signed.

## Rollout

1. **Merge PR #92** (legal fixes to the CA pack), since T7 and T13 assume its wording.
2. **Ship T6 alone to production** and start the baseline. Don't turn the new scan on for at least 14 days, and only once the window has at least 50 CA starts (A2).
3. **Merge T1–T19** with `NEXT_PUBLIC_CA_SCAN_V2` unset; production is unchanged.
4. **Sign T20** on the preview.
5. **Set `NEXT_PUBLIC_CA_SCAN_V2=1`** in Vercel production and redeploy.
6. **After 14 days and at least 50 starts,** read the success criterion (intent.md).
   - If it's met, open a new chain for the other 11 sectors and the generic survey.
   - If it isn't, unset the variable and redeploy (rollback). T6, T8 and T18 stay as independent wins.
