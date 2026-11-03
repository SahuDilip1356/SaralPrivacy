# Plan — CA firm risk scan that people finish

**Status:** draft, revised after EGM review (see `egm-review/`)
**Spec:** ./spec.md
**Date:** 2026-11-03
**Branch:** `spec/ca-assessment-pilot`, cut from origin/main @ 27a955e
**Worktree:** `webapp/.claude/worktrees/ca-assessment-pilot-spec`
**Design source (copied into this folder):**
- `reference/SUBFRAME-MOTION-SPEC.md` (motion values, moments M1–M13)
- `reference/ca-scan-v5.html` (working prototype)
- `reference/check-states.js` (Playwright script that drives every prototype state)

## How to use this plan

- **What each task agent gets:** the task block, plus `spec.md` and the `reference/` folder from this directory. "AC" and "Contracts" point into `spec.md`. A task needs nothing else.
- **Paths:** all `files:` paths are relative to `<worktree>/webapp/`. The exceptions are paths starting `../specs/`, which point into this folder.
- **Shared names:** the "Shared names" section below fixes every name that crosses tasks: message keys, analytics helpers, hooks and component props. Use those names exactly.
- **The external names** `task-steps`, `transition-panel`, `activity-stamp`, `loading-button`, `sliding-number` and `poll-results` are examples from the Subframe Motion library. Their motion values are in `reference/SUBFRAME-MOTION-SPEC.md` §4–§5. When adapting their code, keep the MIT header:
  - `transition-panel` and `sliding-number`: Motion Primitives (ibelick);
  - `task-steps`, `loading-button` and `poll-results`: Interior (ozzy);
  - `activity-stamp`: Subframe.

## Architecture

```
app/[locale]/assessment/ca-firms/page.tsx  (server; edited)
  ├─ isScanV2Enabled(searchParams) false ─▶ CAAssessmentClient.tsx   (today's scan; NOT edited)
  └─ true ─▶ next/dynamic ─▶ components/assessment/v2/ScanV2.tsx  (pack-driven; new)
                               ├─ ProgressRail · QuestionPanel(AnswerOption) · SectionStamp
                               ├─ ResumeCard · StateBanner · ScoreButton
                               └─ ScanResultV2 ─ ScoreReveal · FreeFix · RiskMap · ReportForm
Pure logic, no React, no next/*:
  lib/motion/{tokens,can-animate}.ts
  lib/assessment/{scan-progress,answers,resume,ranked-fixes,report-form,submit-report,scan-events,scan-switch}.ts
  lib/assessment/meta/ca-firms.ts    (CA sections, fix→area map, fallback, micro-notes, bucket focus)
Server: lib/email-templates.ts  (escape client text; affects every sector's email)
Analytics: lib/analytics.ts      (sector from the page path when a caller doesn't pass one)
```

**Rules for pure modules.** They must load under `node --test --experimental-strip-types`.
- Use relative imports with the `.ts` extension. No `@/` imports.
- Import every type with `import type`.
- Don't import values from `lib/data/industry-assessment/core.ts` or any pack, because those use value imports for types and crash under strip-types.
- Don't import `lib/analytics.ts` (it pulls in `@vercel/analytics`).

Test files are excluded from `tsc`, so keep their logic simple.

**Repository isolation rule.** `core.ts`, `bands.ts` and the pack files stay byte-identical; tests in `lib/data/hero-verdicts.test.ts` read their source. This plan doesn't edit them. CA-specific scan data lives in `lib/assessment/meta/ca-firms.ts`.

## Decisions

- **framer-motion 12, not the `motion` package.** The Subframe examples import `motion/react`; the repo ships `framer-motion` ^12.38, the same engine.
  - Load it with `LazyMotion` + `m` + `domAnimation`, and only for the question slide, the score value and spring fills.
  - Use plain CSS for the tick, the segment fill, fades and the stamp keyframes.
  - Rejected alternative: adding `motion`, which would duplicate the engine.
- **The switch lives in `page.tsx`, a server component, not in the client.**
  - `page.tsx` reads `searchParams` and the env, then renders either `CAAssessmentClient` (unchanged) or `ScanV2` through `next/dynamic`. So with the switch off, no v2 script is sent, and today's client never mounts alongside the new one (no double `assessment_start`).
  - Rejected alternative: an early return in `CAAssessmentClient`. Before the hooks it breaks the hooks lint rule; after them, the old start event still fires.
- **Env names:**
  - `NEXT_PUBLIC_CA_SCAN_V2` ("1" = on).
  - `NEXT_PUBLIC_SCAN_MOTION` ("0" = off).
  - The `?scanV2=1` override uses an allow-list copied from `lib/i18n/switcher-gate.ts`: `NEXT_PUBLIC_VERCEL_ENV` is "preview" or "development", or `NODE_ENV` is "development". Unset means off.
- **The scan is pack-driven.** `ScanV2` takes `{ pack, meta }`, so other sectors reuse it at rollout. Rejected alternative: CA-named components, which would invite a 13th copy.
- **CA scan data sits beside the scan,** in `lib/assessment/meta/ca-firms.ts`, because of the isolation rule. A test checks that its fix texts appear in the pack source, so the two can't drift.
- **The Indian mobile check is a small normaliser,** not `libphonenumber-js` (which is installed). Its metadata would exceed the 15 KB budget, and the rule is narrow (AC26).
- **Email check:** the regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, copied from `lib/chat/handoff.ts:147`, where it is module-private.
- **The retry loop is extracted, not imported.** `lib/assessment/submit-report.ts` copies today's behaviour from `CAAssessmentClient.tsx` lines 265–286, with injected `fetch` and `sleep` so it can be tested.
  - It keeps 3 attempts, `Retry-After` capped at 5 s (default 2 s), and 0.8 s × attempt backoff.
  - It drops the sleep after the final attempt.
- **Baseline analytics are split by sector without touching the 12 clients.** When a caller passes no `sector`, `lib/analytics.ts` derives it from the page path (`/assessment/<slug>` → `<slug>`; `/assessment` → `general`).
- **Score ring and number share one `MotionValue`,** animated with `animate()` in `useEffect`, which also fixes today's first-render case.
- **Bars use `clip-path: inset()`, not `width`.** Animating `width` triggers layout on every frame.
- **End-to-end tests:** add `@playwright/test` and `@axe-core/playwright` as exact-version devDependencies, with a `test:e2e` script. The repo has no test CI yet, so this suite is run by hand and at sign-off.
- **The chat launcher is hidden on `/assessment/*`,** not on the `/assessment` hub, matching the "never interrupt an active quiz" list in `lib/chat/triggers.ts:24`.
- **Hindi:** new keys go in `messages/en.json` only. `i18n/request.ts` already falls back to English for each missing key, so untranslated keys stay visible as English.

## Shared names

### Hook

`useMotionOk(): { ok: boolean; markKeyboard(e: { detail: number }): void }`, in `components/assessment/v2/useMotionOk.ts`.
- `ok = canAnimate({ reducedMotion, fromKeyboard, motionSetting })`.
- `reducedMotion` comes from framer-motion's `useReducedMotion()`, which tracks changes at runtime.
- `motionSetting` is `process.env.NEXT_PUBLIC_SCAN_MOTION !== "0"`.
- `markKeyboard` sets `fromKeyboard = e.detail === 0` and is called on every Next, Back and Enter activation. It stays until the next activation.

### Message keys

Namespace `assessment.scanV2` in `messages/en.json`. Placeholders are ICU.

| Key | English | AC |
|---|---|---|
| `rail.start` | Start | AC1 |
| `rail.aria` | {answered} of {total} answered, {section} section | AC2 |
| `rail.ariaQuick` | {answered} of {total} answered, quick start | AC2 |
| `sections.practice` / `sections.documents` / `sections.controls` | Practice / Documents / Controls | AC1 |
| `stamps.practice` / `stamps.documents` / `stamps.controls` | Practice recorded ✓ / Documents recorded ✓ / Controls recorded ✓ | AC9 |
| `sr.sectionDone` | {section} section done. | AC9 |
| `time.ready` / `time.last` / `time.underMinute` / `time.aboutMin` | Ready for your result / Last question / Under a minute left / About {m} min left | AC3 |
| `resume.heading` | Welcome back. Pick up where you left off. | AC11 |
| `resume.answered` | You've answered {a} of {n} questions. | AC11 |
| `resume.restMin` / `resume.restUnder` | The rest takes about {m} min. / The rest takes under a minute. | AC11 |
| `resume.continue` / `resume.continueQuick` | Continue from Question {k} → / Continue from the quick start → | AC11 |
| `resume.startAgain` | Start again | AC12 |
| `resume.note` | Your answers stay on this device only, and aren't sent until you ask for your report. We clear them when you see your result, or when you come back after 7 days. | AC11 |
| `banner.offlineQuiz` | You're offline. Keep answering: the scan and your result work without internet. Sending the report needs a connection. | AC33 |
| `banner.offlineResult` | You're offline. Your result is all here. Sending the report needs a connection. | AC33 |
| `banner.noStorage` / `banner.noStorageUnder` | This browser isn't saving progress (private browsing does this). Finish in one sitting: about {m} min. / … Finish in one sitting: under a minute. | AC15 |
| `banner.expired` | Your saved answers were more than 7 days old, so we cleared them. This is a fresh start. | AC13 |
| `sr.offline` / `sr.online` | You're offline. / You're back online. | AC33 |
| `score.pending` / `score.slow` / `score.done` | Scoring your answers… / Still working on your score… / Done ✓ | AC17, AC18 |
| `sr.scoring` / `sr.slow` | Scoring your answers. / Still working on your score. | AC17, AC18 |
| `result.eyebrow` | Your result | AC19 |
| `result.bandSr` | . Risk band: {band}. | AC19 |
| `legalLine` | Most DPDP Act duties, including notice, security safeguards and breach intimation, apply from 13 May 2027. This score is an educational check, not a compliance certificate or legal advice. | AC24 |
| `freeFix.heading` / `freeFix.linked` / `freeFix.none` | Your top priority fix · free / Linked to your highest-risk area with a fix: {area} ({score}/100). / No area scored high enough to need a specific fix. | AC21 |
| `flags.one` / `flags.many` | Your top risk / Your top {count} risks | AC22 |
| `flags.noneHeading` / `flags.noneBody` | No red flags found / None of your answers matched a red-flag pattern. Keep the evidence that shows it: written policies, access reviews and vendor terms. | AC22 |
| `map.heading` / `map.showAll` / `map.showFewer` / `map.statusSr` | Your risk map · highest risk first / Show all {count} areas / Show fewer / {status}, {score} of 100 | AC23 |
| `form.headingMore` | {n, plural, one {Get your other priority fix and the {checklist}} other {Get your other # priority fixes and the {checklist}}} | AC30 |
| `form.headingNone` | Get the {checklist} | AC30 |
| `form.checklistDefault` | DPDPA Starter Checklist | AC30 |
| `form.sendTo` | We'll email it to {email} | AC27 |
| `form.name` / `form.firm` / `form.email` / `form.phone` / `form.optional` | Your name / Firm name / Email / Phone or WhatsApp / (optional) | AC25 |
| `form.send` / `form.sending` / `form.retry` | Send my report / Sending… / Try again | AC27, AC28 |
| `errors.nameRequired` / `errors.firmRequired` / `errors.emailRequired` / `errors.emailInvalid` / `errors.phoneInvalid` | the five messages in AC25 | AC25 |
| `form.serverError` / `form.offlineError` | We couldn't send your report just now. Your details are still here. Try again in a minute. / the AC29 text | AC28, AC29 |
| `sent.heading` / `sent.checklist` / `sent.change` | Your report is on its way to {email}. / The {checklist} comes in the same email. If it isn't in your inbox in 5 minutes, check spam. / Wrong email? Change it | AC30 |

**Reuse these existing keys; don't duplicate them.**
- From `assessment.shared`: `readinessScore`, `questionOf`, `pctComplete`, `quickStartOptional`, `back`, `next`, `seeMyResults`, `skip`, `whyThisMatters`, `selectAll`, `retakeScan`, `dataExposure`, `controlMaturity`, `consentSentence`, `privacyNoticeLink`, `errNeedConsent`, `prefillNote`, `checkingFocus`.
- The consent error is `errNeedConsent`.

### Analytics helpers (in `lib/analytics.ts`, on `trackEvent`)

`sector` is optional on all helpers. When it's omitted, it is derived from the path by `sectorFromPath`.

| Helper | Event | Args |
|---|---|---|
| `assessmentStart` (existing) | `assessment_start` | `{ prefilled?, src?, sector? }` |
| `assessmentStep` (existing) | `assessment_step_N` | `(step, sector?)` |
| `assessmentComplete` (existing) | `assessment_complete` | `{ score, band, industry?, sector? }` |
| `scanQuestionView` | `assessment_question_view` | `{ q, n, sector? }` |
| `scanSectionComplete` | `assessment_section_complete` | `{ section, sector? }` |
| `scanResumeShown` | `assessment_resume_shown` | `{ answered, sector? }` |
| `scanResumeContinue` | `assessment_resume_continue` | `{ from_q, sector? }` |
| `freeFixViewed` | `free_fix_viewed` | `{ bucket, sector? }` (`"none"` for the fallback) |
| `reportFormError` | `report_form_error` | `{ fields, sector? }` |
| `reportSubmitFailed` | `report_submit_failed` | `{ reason: "server" \| "network" \| "offline", sector? }` |
| `reportRequested` (existing) | `report_requested` | `{ band, sector? }` |
| `reportSaved` | `report_saved` | `{ band, sector? }` |
| `assessmentRerun` | `assessment_rerun` | `{ score, band, sector? }` |

### Component props

Components read text with `useTranslations("assessment.scanV2")`.

```ts
ProgressRail({ questions: IAQuestion[]; answers: IAAnswers; qi: number; sections: ScanSection[]; stamped: string[] })
AnswerOption({ question: IAQuestion; option: IAOption; checked: boolean; onToggle(): void; note?: string })
QuestionPanel({ question: IAQuestion; answers: IAAnswers; direction: 1 | -1 | 0; ok: boolean;
                onPick(optionId: string): void; onNext(): void; onBack(): void;
                canAdvance: boolean; isLast: boolean; isOptional: boolean; children?: ReactNode })  // children = ScoreButton on the last question
SectionStamp({ sectionKey: string; ok: boolean; onDone(): void })   // renders the stamp only when ok
ResumeCard({ saved: { answers: IAAnswers; qi: number }; questions: IAQuestion[]; onContinue(): void; onStartAgain(): void })
StateBanner({ kind: "offline-quiz" | "offline-result" | "no-storage" | "expired"; minutes?: number })
useAsyncAction({ action: () => Promise<unknown>; resetAfter?: number }): { status: "idle"|"pending"|"success"|"error"; run(): void; reset(): void }
ScoreButton({ onScore(): Promise<void>; ok: boolean; testDelayMs?: number })  // owns the pause and the slow notice
ScoreReveal({ result: IAResult; bandText: string; ok: boolean })            // heading has id="rhead"
FreeFix({ fix: RankedFix; areaLabel?: string; areaScore?: number; ok: boolean; onViewed(): void })
RiskMap({ result: IAResult; buckets: IABucket[]; ok: boolean })             // red flags or none-panel, then the 2 bars, then the area list
ReportForm({ sector: string; reportType: string; answers: IAAnswers; result: IAResult;
             rankedTexts: string[]; checklistTitle: string; serviceLabels: string[] })
ScanV2({ pack: IndustryPack; meta: ScanMeta })
ScanResultV2({ pack: IndustryPack; meta: ScanMeta; answers: IAAnswers; result: IAResult; onRetake(): void })
```

`ScanSection`, `RankedFix` and `ScanMeta` are exported from `lib/assessment/meta/types.ts` (see T4). `IAQuestion`, `IAOption`, `IAAnswers`, `IAResult`, `IABucket` and `IndustryPack` come from `core.ts` with `import type`.

## Setup (before T1, not a task)

```bash
cd "<repo>/webapp/.claude/worktrees/ca-assessment-pilot-spec/webapp"
node --version          # must be 22.6 or later (strip-types); 26.x is known good
npm ci
bash ../specs/ca-assessment-pilot/bin/tsc-baseline.sh   # once, on the untouched base commit
```

- `bin/tsc-ok.sh` fails if `tsc` is missing, if the baseline file is missing, or if the error count rose above the baseline. The baseline is stored in the git directory, so it survives reboots and is never committed. Don't re-run `tsc-baseline.sh` after tasks have landed.
- **PR #92 (legal wording):** once it merges, rebase this branch onto `origin/main` before starting T7 or T13.

## Tasks

### T1 — Add motion tokens, the can-animate rule and the motion hook
- implements: AC4, AC8, AC36, AC39
- depends_on: none
- files: lib/motion/tokens.ts, lib/motion/can-animate.ts, lib/motion/can-animate.test.ts, components/assessment/v2/useMotionOk.ts
- risk: tier2
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/motion/can-animate.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/useMotionOk.ts lib/motion
- notes:
  - `tokens.ts` holds exactly these values:
    ```ts
    export const DUR = { tick: 0.2, panel: 0.24, fade: 0.25, stamp: 0.18, stampHold: 1.1, score: 1.0,
      scoringPause: 0.9, scoringPauseReduced: 0.3, done: 0.28, slowNotice: 2.0 } as const
    export const EASE_OUT = [0.22, 1, 0.36, 1] as const
    export const EASE_PANEL = [0.25, 1, 0.5, 1] as const
    export const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const
    export const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const
    export const FILL = { type: "spring", stiffness: 210, damping: 34, mass: 0.9 } as const
    export const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const
    export const STILL = { duration: 0 } as const
    export const PANEL_SHIFT = 18; export const RISE = 8; export const STAGGER = 0.06
    ```
  - `canAnimate({ reducedMotion, fromKeyboard, motionSetting })` returns `motionSetting && !reducedMotion && !fromKeyboard`. Test all 8 combinations.
  - `useMotionOk` is as described in Shared names.

### T2 — Progress, time-left, answer-toggle and navigation-lock logic
- implements: AC1, AC2, AC3, AC7
- depends_on: none
- files: lib/assessment/scan-progress.ts, lib/assessment/answers.ts, lib/assessment/scan-progress.test.ts
- risk: tier2
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/scan-progress.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh
- notes:
  - In `scan-progress.ts`:
    - `requiredIds(questions) → string[]`, the non-optional ids.
    - `progressPct(questions, answers) → integer 0–100`, `Math.round(answered required / required × 100)`.
    - `timeLeft(questions, answers, qi) → { key: "time.ready"|"time.last"|"time.underMinute"|"time.aboutMin"; values?: { m: number } }`, following the AC3 rule and precedence exactly. R counts unanswered required questions anywhere.
    - `railAria(questions, answers, qi, sections) → { key: "rail.aria"|"rail.ariaQuick"; values }`.
    - `createNavLock(ms = 350) → { tryEnter(now: number): boolean }`.
  - In `answers.ts`: `pickAnswer(question, current: IAAnswerValue, optionId) → IAAnswerValue`. Copy the rule from `CAAssessmentClient.tsx` lines 187–202: single replaces; for multi, a `mutuallyExclusive` option toggles alone and clears the others, and picking any other option clears the exclusive ones.
  - Tests:
    - R = 0, 1, 3 and 4 on and off the last question, including the precedence case (last question unanswered → "time.last");
    - Back doesn't change the result;
    - `tryEnter(0)` is true, `tryEnter(100)` false and `tryEnter(400)` true, measured from the last accepted call;
    - `pickAnswer`, including the exclusive cases.
  - "Question N of 10" counts only required questions, and q0 is never counted. `qi` indexes the full list, including q0.

### T3 — Saved-progress store
- implements: AC10, AC11, AC12, AC13, AC14, AC15, AC16
- depends_on: none
- files: lib/assessment/resume.ts, lib/assessment/resume.test.ts
- risk: tier1
- size: M
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/resume.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh
- notes:
  - API: `createResumeStore({ storage: Pick<Storage,"getItem"|"setItem"|"removeItem"> | null, sector: string, questions: IAQuestion[], sectionKeys: string[], now?: () => number })` returns:
    - `probe(): boolean`, which writes then removes `sp-probe` and returns false on any throw;
    - `save(s: { answers; qi; stamped }, at?: number): void`, which copies only those three fields;
    - `load(): { kind: "none" } | { kind: "expired" } | { kind: "ok"; answers; qi; stamped; at; answered: number }`;
    - `clear(): void`.
  - Key: `sp-assessment-v1:<sector>`. Value shape as in spec Contracts. Apply the field-by-field rules in AC14 exactly.
  - Age: a value whose `at` is exactly 7 days old loads as `ok`; at 7 days + 1 ms, `load()` returns `expired` and deletes the key.
  - `ok` with `answered === 0` must be treated as `none` by callers (AC11). Test that `load()` reports `answered`.
  - Test that a `save` call given an object with extra `name`, `firm`, `email` or `phone` keys stores none of them.
  - Tier 1 because it stores a person's answers on their own device (intent A4: acceptable only because nothing leaves the device).

### T4 — CA scan metadata and fix ranking
- implements: AC1, AC9, AC21, AC22, AC30
- depends_on: none
- files: lib/assessment/meta/types.ts, lib/assessment/meta/ca-firms.ts, lib/assessment/ranked-fixes.ts, lib/assessment/ranked-fixes.test.ts
- risk: tier2
- size: M
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/ranked-fixes.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh
- notes:
  - `types.ts`:
    - `ScanSection = { key: string; questionIds: string[] }`;
    - `RankedFix = { text: string; bucket: string | null }`;
    - `ScanMeta = { sections: ScanSection[]; fixes: { text: string; bucket: string }[]; fallbackFix: string; microNotes: Record<string,string>; bucketFocus: Record<string,string>; backHref: string; serviceQuestionId?: string }`.
  - `ca-firms.ts` exports `caScanMeta: ScanMeta`:
    - sections: practice = q1, q2; documents = q3–q5; controls = q6–q10;
    - fixes: copy the four `FOUR_CONTROLS` texts from `packs/ca-firms.ts` lines 419–424 as they stand on the base commit, mapped in order to `intake`, `storage_access`, `retention`, `vendor_incident`;
    - `fallbackFix`: copy the string at `packs/ca-firms.ts` 440–442;
    - copy `MICRO_NOTES` and `BUCKET_FOCUS` from `CAAssessmentClient.tsx` lines 40–67;
    - `backHref: "/industries/ca-firms"` and `serviceQuestionId: "q1"`.
  - Don't import the pack. Use `import type` only.
  - `rankFixes(result: Pick<IAResult,"band"|"bucketScores">, meta) → RankedFix[]`, following the "Free fix and ranked fixes" table in spec Contracts. Copy before sorting, sort stably, highest bucket score first.
  - Tests:
    - High band with intake 83 and retention 90 puts retention first;
    - High band with every area under 34 still returns all 4, ranked;
    - Moderate band with only storage_access at 40 returns just that one;
    - Controlled with all under 34 returns the fallback with `bucket: null`;
    - a tie keeps meta order.
  - **Drift guard test:** `readFileSync` the pack source and assert that every `fixes[].text` and `fallbackFix` appears in it verbatim, the same approach as `lib/data/hero-verdicts.test.ts`.

### T5 — Report-form validation, phone normaliser and send-with-retry
- implements: AC25, AC26, AC27, AC28, AC31, AC43
- depends_on: none
- files: lib/assessment/report-form.ts, lib/assessment/submit-report.ts, lib/assessment/report-form.test.ts
- risk: tier1
- size: M
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/report-form.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh
- notes:
  - In `report-form.ts`:
    - `normalizeIndianMobile(v: string): string | null` follows the AC26 order exactly. `""` returns `""`.
    - `validateReportForm({ name, firm, email, phone, consent })` returns `{ errors: Partial<Record<"name"|"firm"|"email"|"phone"|"consent", FormErrorKey>>; firstInvalid?: string; phone10: string }`.
    - `FormErrorKey` is `"errors.nameRequired" | "errors.firmRequired" | "errors.emailRequired" | "errors.emailInvalid" | "errors.phoneInvalid" | "errNeedConsent"`.
    - Trim before checking. Use the email regex from Decisions.
  - In `submit-report.ts`: `submitReport(body: string, deps: { fetch: typeof fetch; sleep: (ms: number) => Promise<void>; timeoutMs?: number }) → Promise<{ ok: true } | { ok: false; reason: "server" | "network" }>`, following the send policy table in spec Contracts exactly.
    - Each attempt uses an `AbortController` that aborts after `timeoutMs` (default 15000). A timeout counts as a network error.
    - A 400 fails at once with reason "server".
    - The last failure's kind sets the reason: a network error or timeout gives "network"; any status gives "server".
  - Tests:
    - **Phone:**
      - valid: "98765 43210", "+91-98765-43210", "919876543210", "09876543210" and "9112345678";
      - invalid: "12345", "5876543210" and "98765";
      - blank gives `phone10 ""`.
    - **Email:** "dilip@" is invalid, "a@b" is invalid, "a@firm.in" is valid.
    - **Form:** empty name, empty firm and an unticked box each give their key; `firstInvalid` follows the order name, firm, email, phone, consent.
    - **Submit:**
      - 200 gives `{ ok: true }`;
      - 500 ×3 gives reason "server" after 2 sleeps, with none after the last attempt;
      - 429 with `Retry-After: 9` sleeps 5000 ms;
      - a thrown error is retried, and three give reason "network";
      - a fetch that never resolves times out (use `timeoutMs: 50`) and gives "network";
      - 400 fails at once.
  - Tier 1 because it gates consent and personal data.

### T6 — Sector-tagged analytics
- implements: AC37
- depends_on: none
- files: lib/assessment/scan-events.ts, lib/assessment/scan-events.test.ts, lib/analytics.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/scan-events.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint lib/analytics.ts lib/assessment/scan-events.ts
- notes:
  - `scan-events.ts` is pure:
    - `sectorFromPath(pathname)` strips a leading `/hi`. `/assessment/<slug>…` gives `<slug>`, `/assessment` gives `"general"`, anything else gives `""`.
    - `scanEventProps(event, input)` returns only the allow-listed properties for that event: `event_category`, `sector`, plus that event's properties from spec Contracts, in that order.
  - Tests:
    - `/hi/assessment/ca-firms` gives `ca-firms`;
    - stray `email`, `name`, `phone` or free-text keys never appear in the output;
    - each event gets `sector`.
  - In `lib/analytics.ts`:
    - add the helpers in Shared names;
    - make `sector` optional everywhere and default it with `sectorFromPath(window.location.pathname)`;
    - keep every existing call signature working (12 sector clients and `SurveyClient.tsx` call them);
    - add `sector` to `assessmentComplete` next to `industry`.
  - Human rollout step, not part of this task: T6 ships to production alone first (see Rollout).

### T7 — New interface strings
- implements: AC9, AC11, AC13, AC15, AC17, AC18, AC21, AC22, AC23, AC24, AC25, AC27, AC28, AC29, AC30, AC33
- depends_on: none
- files: messages/en.json
- risk: tier2
- size: S
- verify: node -e "const s=require('./messages/en.json').assessment.scanV2;const need=['rail.start','rail.aria','rail.ariaQuick','sections.practice','sections.documents','sections.controls','stamps.practice','stamps.documents','stamps.controls','sr.sectionDone','time.ready','time.last','time.underMinute','time.aboutMin','resume.heading','resume.answered','resume.restMin','resume.restUnder','resume.continue','resume.continueQuick','resume.startAgain','resume.note','banner.offlineQuiz','banner.offlineResult','banner.noStorage','banner.noStorageUnder','banner.expired','sr.offline','sr.online','score.pending','score.slow','score.done','sr.scoring','sr.slow','result.eyebrow','result.bandSr','legalLine','freeFix.heading','freeFix.linked','freeFix.none','flags.one','flags.many','flags.noneHeading','flags.noneBody','map.heading','map.showAll','map.showFewer','map.statusSr','form.headingMore','form.headingNone','form.checklistDefault','form.sendTo','form.name','form.firm','form.email','form.phone','form.optional','form.send','form.sending','form.retry','errors.nameRequired','errors.firmRequired','errors.emailRequired','errors.emailInvalid','errors.phoneInvalid','form.serverError','form.offlineError','sent.heading','sent.checklist','sent.change'];const get=(o,p)=>p.split('.').reduce((a,k)=>a&&a[k],o);const miss=need.filter(k=>typeof get(s,k)!=='string');if(miss.length){console.error(miss);process.exit(1)}if(s.legalLine!=='Most DPDP Act duties, including notice, security safeguards and breach intimation, apply from 13 May 2027. This score is an educational check, not a compliance certificate or legal advice.')process.exit(1)"
- notes:
  - Add `assessment.scanV2` as nested objects, exactly as in the Shared names key table, with the English text from that table and the spec ACs.
  - Don't add these keys to `hi.json` (English fallback; spec OQ6).
  - Don't add a consent key; reuse `assessment.shared.consentSentence` and `errNeedConsent`.
  - Requires PR #92 on the base branch. If `packs/ca-firms.ts` still contains "highest-impact records under DPDPA", stop and report.

### T8 — Escape client-supplied text in the survey and admin emails
- implements: AC32
- depends_on: none
- files: lib/email-templates.ts, lib/email-templates.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/email-templates.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh
- notes:
  - At base commit 27a955e, apply `escapeHtml` (defined at line 79) to:
    - the survey score at lines 506 and 564 and in the subject at 454: use `Number(data.score) || 0`;
    - red flags at 514;
    - the answer-summary question and answer at 524–525. These are server-built for packs, but escape them anyway;
    - `${rec}` at 539;
    - `data.band` at 568, before `.toUpperCase()`;
    - `data.summary` at 575;
    - `label` inside `badge()` at line 67, which is used by the admin alert at 241 with the client's `risk_level`.
  - `data.name` and `data.businessName` are already escaped at 550–551; leave them.
  - Tests: build each template with `<img src=x onerror=alert(1)>` in every listed field, and assert that no raw `<img` appears (case-insensitive); "Sahu & Co" renders "Sahu &amp; Co"; a forged score string renders as a number.
  - If the file has value imports that crash under strip-types, convert them to `import type` and say so in the PR.

### T9 — Progress rail and answer option
- implements: AC1, AC2, AC8
- depends_on: T1, T2, T4, T7
- files: components/assessment/v2/ProgressRail.tsx, components/assessment/v2/AnswerOption.tsx
- risk: tier2
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/ProgressRail.tsx components/assessment/v2/AnswerOption.tsx && bash scripts/design-lint.sh
- notes:
  - Rail:
    - one element with `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext` from `railAria`; its children are `aria-hidden`;
    - segment fill is CSS `transform: scaleX()` with a 280 ms transition and `EASE_OUT`, plus `transition: none` when not `ok`;
    - the section tick pops with the `POP` spring;
    - port the look from `reference/ca-scan-v5.html` (`progressHTML`).
  - Option:
    - a visually hidden native input;
    - the tick polyline uses `stroke-dashoffset` 16→0 over 200 ms with a 40 ms delay;
    - the empty border is slate-500;
    - hover styles go inside `@media (hover:hover)`;
    - badge text is 12 px;
    - `note` renders the micro-note box.

### T10 — Question panel and section stamp
- implements: AC4, AC5, AC9
- depends_on: T1, T7, T9
- files: components/assessment/v2/QuestionPanel.tsx, components/assessment/v2/SectionStamp.tsx
- risk: tier2
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/QuestionPanel.tsx components/assessment/v2/SectionStamp.tsx && bash scripts/design-lint.sh
- notes:
  - Panel, after `transition-panel`:
    - `AnimatePresence mode="popLayout"` with `custom={direction}`;
    - enter from `x: PANEL_SHIFT × direction`; exit to `-PANEL_SHIFT × direction`;
    - `blur(2px)`, `DUR.panel`, `EASE_PANEL`; duration 0 when not `ok`.
  - Focus: the heading has `tabIndex={-1}` and gets focus after each change.
  - Enter on an option calls `onNext()` when `canAdvance` (answered or optional), and does nothing otherwise.
  - Show the existing Skip button (`assessment.shared.skip`) on the optional question when it's unanswered, and the `whyThisMatters` disclosure.
  - Stamp, after `activity-stamp`:
    - keyframes scale 1.22→1 and opacity 0.6→1 over 180 ms `cubic-bezier(.2,.9,.3,1)`;
    - hold for `DUR.stampHold`, then fade over 200 ms, then call `onDone`;
    - `aria-hidden`; renders nothing when not `ok`.

### T11 — Resume card and state banners
- implements: AC11, AC12, AC13, AC15, AC33
- depends_on: T1, T2, T7
- files: components/assessment/v2/ResumeCard.tsx, components/assessment/v2/StateBanner.tsx
- risk: tier2
- size: S
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/ResumeCard.tsx components/assessment/v2/StateBanner.tsx && bash scripts/design-lint.sh
- notes:
  - ResumeCard:
    - fades up `RISE` px over `DUR.fade` when `ok`, with no fade otherwise; focus goes to the heading on mount;
    - M comes from `timeLeft`;
    - K is the required-question number of `saved.qi`; use `resume.continueQuick` when it's the quick-start question.
  - StateBanner: gold-50 background, gold-700 text, no motion, one key per kind.

### T12 — Async button for scoring
- implements: AC17, AC18
- depends_on: T1, T7
- files: components/assessment/v2/useAsyncAction.ts, components/assessment/v2/ScoreButton.tsx
- risk: tier2
- size: S
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/useAsyncAction.ts components/assessment/v2/ScoreButton.tsx && bash scripts/design-lint.sh
- notes:
  - Port `useAsyncAction` from `loading-button`, keeping the run-id guard so a second activation while pending is ignored.
  - The button has three labelled states (idle, pending, done) stacked in one grid cell and crossfaded with `CROSSFADE` (opacity, 3 px rise, 3 px blur), so its size never changes.
  - Pending lasts at least `DUR.scoringPause`, or `scoringPauseReduced` when not `ok`, plus `testDelayMs`.
  - At `DUR.slowNotice` while still pending, show `score.slow` and announce `sr.slow` once.
  - Done shows for `DUR.done` (0 when not `ok`), then resolves.
  - `aria-busy` while pending.

### T13 — Score reveal and band label
- implements: AC19, AC20, AC24
- depends_on: T1, T7
- files: components/assessment/v2/ScoreReveal.tsx
- risk: tier2
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/ScoreReveal.tsx && bash scripts/design-lint.sh
- notes:
  - One `useMotionValue(0)`. In `useEffect`, call `animate(mv, readinessScore, { duration: DUR.score, ease: EASE_OUT })`, or `mv.jump()` when not `ok`.
  - The ring's `strokeDashoffset` and the digit columns are both `useTransform(mv, …)`. Use the column technique from `sliding-number`, without its per-digit spring.
  - The heading is `<h2 id="rhead" tabIndex={-1}>`, using `assessment.shared.readinessScore` plus a `sr-only` `result.bandSr`.
  - Band chip:
    - navy text on `color-mix(in srgb, <bandColor> 14%, white)`, with a 1.5 px `bandColor` border and dot, via the inline CSS variable `--band`;
    - pops with `POP` after a 0.85 s delay;
    - `aria-hidden`.
  - Render `bandText`, then `legalLine` beneath it (text-xs, slate-600).
  - Requires PR #92 on the base branch.

### T14 — Free fix and risk map
- implements: AC21, AC22, AC23, AC40
- depends_on: T1, T4, T6, T7
- files: components/assessment/v2/FreeFix.tsx, components/assessment/v2/RiskMap.tsx
- risk: tier2
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/FreeFix.tsx components/assessment/v2/RiskMap.tsx && bash scripts/design-lint.sh
- notes:
  - FreeFix:
    - fades up after a 0.95 s delay;
    - calls `onViewed` once, using the existing `lib/hooks/useInView.ts` (fires once, then disconnects), at half visible;
    - the line under the fix uses `freeFix.linked` or `freeFix.none`.
  - RiskMap renders, in order:
    1. red flags (`flags.one` or `flags.many`), fading up 60 ms apart after a 1.15 s delay, or the `flags.none*` panel;
    2. two bars: `dataExposure` ("bad" when ≥50) and `controlMaturity` ("bad" when <50). Each fills with `clipPath: inset(0 X% 0 0)` where X = 100 − value, driven by a `motionValue` and the `FILL` spring, the first after 0.5 s and the next 60 ms later. Show the percentage as text;
    3. the area list, sorted by `bucketScores` descending with ties in pack order. Only the first 2 show, plus a `map.showAll`/`map.showFewer` button with `aria-expanded` and `aria-controls`; hidden rows use `hidden`. Status chips carry `sr-only` `map.statusSr`.

### T15 — Report form
- implements: AC25, AC26, AC27, AC28, AC29, AC30, AC31, AC43
- depends_on: T5, T6, T7
- files: components/assessment/v2/ReportForm.tsx
- risk: tier1
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/ReportForm.tsx && bash scripts/design-lint.sh
- notes:
  - Fields:
    - labelled inputs (`form.*` keys) with `text-base sm:text-sm` and `min-h-11`;
    - `autocomplete` values name, organization, email and tel; `inputMode` email and tel;
    - the email field gets `autoCapitalize="off"` and `spellCheck={false}`.
  - On a blocked submit (`validateReportForm`):
    - set `aria-invalid`, plus `aria-describedby` pointing at the message;
    - focus `firstInvalid`;
    - call `reportFormError`;
    - re-validate on each input from then on.
  - Consent: keep a 24 px checkbox in a 44 px label, with the `assessment.shared.consentSentence` + `privacyNoticeLink` sentence.
  - Keep the honeypot `hp_url`, hidden and always "".
  - Show "Services: …" from `serviceLabels`, as today.
  - Sending:
    1. If `navigator.onLine === false`, show `form.offlineError`, call `reportSubmitFailed({reason:"offline"})`, and stop.
    2. Otherwise call `reportRequested`, set read-only fields and `form.sending` with `aria-busy`, build the body per spec Contracts (`immediateActions` = `rankedTexts`, `mobile` = `phone10`), then call `submitReport(body, { fetch, sleep })`.
    3. On `{ ok: true }`: `reportSaved`, then the success view. On failure: `form.serverError`, `form.retry`, and `reportSubmitFailed({ reason })` with the returned reason.
  - Sent view: `sent.heading` (focused), `rankedTexts.slice(1)` as a list (omitted if empty), `sent.checklist`, and `sent.change`, which returns to the form with its values.
  - Heading: `form.headingMore` with n = `rankedTexts.length − 1`, or `form.headingNone`. The checklist title is the `checklistTitle` prop, or `form.checklistDefault` when it's empty.
  - When the email field passes the email check, show `form.sendTo` beside the button (AC27).

### T16 — Switch, page wiring and the quiz flow
- implements: AC4, AC5, AC7, AC38, AC39, AC44
- depends_on: T2, T9, T10, T12
- files: lib/assessment/scan-switch.ts, lib/assessment/scan-switch.test.ts, app/[locale]/assessment/ca-firms/page.tsx, components/assessment/v2/ScanV2.tsx
- risk: tier1
- size: M
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/assessment/scan-switch.test.ts && bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint lib/assessment/scan-switch.ts "app/[locale]/assessment/ca-firms/page.tsx" components/assessment/v2/ScanV2.tsx && git diff --quiet "$(git merge-base origin/main HEAD)" -- "app/[locale]/assessment/ca-firms/CAAssessmentClient.tsx"
- notes:
  - `isScanV2Enabled({ flag, param, vercelEnv, nodeEnv })` is pure. Test these cases:
    - flag "1" turns it on;
    - a param with vercelEnv "preview" turns it on;
    - a param with vercelEnv "production" leaves it off;
    - a param with vercelEnv undefined and nodeEnv "production" leaves it off;
    - a param with nodeEnv "development" turns it on.
  - `page.tsx`:
    - make the page component `async` and await its `searchParams`;
    - call `isScanV2Enabled` with `process.env.NEXT_PUBLIC_CA_SCAN_V2`, `NEXT_PUBLIC_VERCEL_ENV` and `NODE_ENV`;
    - render either `<CAAssessmentClient />` or `const ScanV2 = dynamic(() => import("@/components/assessment/v2/ScanV2"))` with `pack={caFirmPack} meta={caScanMeta}`, inside the existing `Suspense`;
    - keep the metadata.
  - `CAAssessmentClient.tsx` must not change; the verify enforces it.
  - `ScanV2` quiz state:
    - `answers`, `qi`, `direction`, `phase: "resume"|"quiz"|"result"`;
    - `pickAnswer`;
    - the nav lock from `createNavLock`;
    - `useMotionOk`, calling `markKeyboard` on every Next, Back and Enter;
    - focus on the question heading.
  - Back on q0 goes to `meta.backHref`. Back on the result returns to the last question.
  - `meta` is optional. Without it (AC44): render a single progress bar (label and percentage as AC1/AC3) in place of `ProgressRail`, and no stamps.
  - In `page.tsx`, `?scanTestNoMeta=1` (allowed only where `?scanV2=1` is) passes `meta={undefined}`, so T21 can test AC44.
  - Keep `?pre=` and `?bucket=` behaviour: `parsePrefill` and `entrySource` from `lib/data/industry-assessment/prefill.ts`, `prefillStillHeld` with `components/assessment/PrefillNote.tsx`, and `meta.bucketFocus` for the `checkingFocus` banner.
  - Wrap the motion parts in `LazyMotion features={domAnimation}`.
  - Use lazy `useState` initialisers, or `useSyncExternalStore`, for anything read from the browser, so the effect-setState lint rule doesn't fire.
  - The motion setting (AC39) works because every component takes `ok` from `useMotionOk`, which already reads `NEXT_PUBLIC_SCAN_MOTION`. Check it by building with `NEXT_PUBLIC_SCAN_MOTION=0` in T22.

### T17 — Resume, history, offline and the live region in the flow
- implements: AC6, AC10, AC11, AC12, AC13, AC14, AC15, AC16, AC33, AC42
- depends_on: T3, T11, T16
- files: components/assessment/v2/ScanV2.tsx, components/assessment/v2/useScanHistory.ts, components/assessment/v2/useOnline.ts
- risk: tier1
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/ScanV2.tsx components/assessment/v2/useScanHistory.ts components/assessment/v2/useOnline.ts
- notes:
  - **Resume:** wire `createResumeStore` with `window.localStorage` when `probe()` passes, otherwise `null`.
    - On load: `none`, or `ok` with `answered === 0`, starts the quiz; `expired` shows the expired banner on q0; `ok` shows `ResumeCard`.
    - Save after every pick or move until the result first shows (`resultShown` ref).
    - Clear the store when the result shows, on Start again, and on Retake.
    - With `?pre=` and a usable save (AC42): show `ResumeCard`. Continue keeps the saved answers and ignores `pre`; Start again applies `pre`. Pass `prefilled: true` to `assessmentStart` only when `pre` was applied. `assessmentStart` still fires once on first render, so decide `prefilled` before it fires: false whenever a resume card shows.
  - **History** (`useScanHistory`):
    - `history.replaceState` on mount, then `pushState({ qi })` with `#q<qi>` on each move, and `#result` on the result;
    - a `popstate` handler restores `qi` (direction from the comparison) or the result;
    - don't push on Retake (it replaces).
  - **Online** (`useOnline`): `useSyncExternalStore` over the `online` and `offline` events.
    - Show `StateBanner` `offline-quiz` or `offline-result`.
    - Announce `sr.offline` or `sr.online` through the live region.
    - On the result, add or remove only the banner element.
  - **Live region:** one `sr-only` `aria-live="polite"` element in `ScanV2`, written via `announce(text)`, which clears it and then sets the text after 60 ms.

### T18 — Result composition, analytics wiring and retake
- implements: AC16, AC17, AC19, AC21, AC23, AC24, AC30, AC37, AC40, AC41, AC44
- depends_on: T6, T13, T14, T15, T17
- files: components/assessment/v2/ScanResultV2.tsx, components/assessment/v2/ScanV2.tsx
- risk: tier2
- size: M
- verify: bash ../specs/ca-assessment-pilot/bin/tsc-ok.sh && ./node_modules/.bin/eslint components/assessment/v2/ScanResultV2.tsx components/assessment/v2/ScanV2.tsx && bash scripts/design-lint.sh
- notes:
  - `ScoreButton.onScore` calls `calculateIndustryResult(pack, answers)` (from `@/lib/data/industry-assessment/core`), sets the result and moves to the result phase.
  - Result order:
    1. ScoreReveal (with `bandText = pack.bandCopy?.[band] ?? result.bandDescription`), whose legal line closes the score card;
    2. FreeFix (`rankFixes(result, meta)[0]`, or `{ text: recommendations[0], bucket: null }` without meta, AC44);
    3. RiskMap;
    4. ReportForm (`rankedTexts`, `checklistTitle = pack.leadMagnet?.title ?? ""`, `serviceLabels` from `meta.serviceQuestionId`);
    5. the existing Gap Review call to action, copied from `CAAssessmentClient.tsx` lines 452–464;
    6. `FlowCrossLink` from `@/components/FlowCrossLink`;
    7. retake (`assessment.shared.retakeScan`).
  - Focus `#rhead` after mount. Scroll to the top, smooth only when `ok`.
  - Analytics, in `ScanV2`:
    - `assessmentStart({ prefilled, src })` once on first render, guarded by a ref;
    - `assessmentStep(3)` and `assessmentStep(6)` the first time qi 3 or 6 is shown;
    - `scanQuestionView` on every question shown (not on re-render);
    - `scanSectionComplete` when a section first completes on a forward move, together with the stamp and `announce(sr.sectionDone)`;
    - `scanResumeShown` and `scanResumeContinue`;
    - `assessmentComplete({ score, band, industry: pack.industry })` for the first result in the page load; `assessmentRerun({ score, band })` for every later result (retake, or Back from the result and forward again).
  - Retake clears everything as in AC41 and doesn't call `assessmentStart`.

### T19 — Hide the chat launcher on assessment pages
- implements: AC34
- depends_on: none
- files: components/chat/SetuChat.tsx
- risk: tier2
- size: S
- verify: grep -q 'pathname.startsWith("/assessment/")' components/chat/SetuChat.tsx && ./node_modules/.bin/eslint components/chat/SetuChat.tsx
- notes:
  - Add exactly `|| pathname.startsWith("/assessment/")` to the hide check at line 123 (at 27a955e it covers `/admin` and `/report`).
  - Update the header comment at lines 2–4 to name it.
  - This applies to all 12 sector scans, but not the `/assessment` hub, and doesn't roll back with the switch. That is intended.

### T20 — End-to-end harness and smoke test
- implements: AC38
- depends_on: T16
- files: package.json, package-lock.json, playwright.config.ts, e2e/smoke.spec.ts, e2e/helpers.ts
- risk: tier2
- size: S
- verify: ./node_modules/.bin/playwright test e2e/smoke.spec.ts --reporter=line
- notes:
  - Install the browser:
    - run `npm i -D --save-exact @playwright/test@1.56.1 @axe-core/playwright@4.11.0`;
    - if either version doesn't exist, pick the latest older release of the same major and record it in the PR;
    - run `./node_modules/.bin/playwright install chromium`.
  - Add `"test:e2e": "playwright test"`.
  - Config:
    - project `on`: `webServer` `NEXT_PUBLIC_CA_SCAN_V2=1 next build && next start -p 3100`;
    - project `off`: same, without the flag, on port 3101.
    - Viewports: desktop 1280 × 800, and mobile 360 × 740 with `isMobile` and `hasTouch`.
    - `next build` needs no secrets for this page. If it fails on a missing env var, list it in the PR and set a dummy value in the config's `env`.
  - `helpers.ts`:
    - an `addInitScript` that defines `window.va = (...a) => (window.__events ||= []).push(a)`;
    - a route that serves an empty script for `/_vercel/insights/script.js`;
    - `events(page)`, which returns `window.__events`;
    - mocks for `/api/assessment`: 200; 500 three times; 429 with `Retry-After: 1`; 400; never respond.
  - Smoke test:
    - in project `off`, `/assessment/ca-firms` shows today's scan (no `role="progressbar"` rail);
    - in project `on`, it shows the rail;
    - exactly one `assessment_start` per load in both.

### T21 — End-to-end flow and resilience tests
- implements: AC1, AC3, AC5, AC6, AC7, AC9, AC10, AC11, AC12, AC13, AC14, AC15, AC16, AC17, AC18, AC21, AC22, AC23, AC25, AC27, AC28, AC29, AC30, AC31, AC33, AC37, AC40, AC41, AC42, AC43, AC44
- depends_on: T18, T19, T20
- files: e2e/scan-flow.spec.ts, e2e/scan-resilience.spec.ts
- risk: tier2
- size: M
- verify: ./node_modules/.bin/playwright test e2e/scan-flow.spec.ts e2e/scan-resilience.spec.ts --project=on --reporter=line
- notes:
  - Write one named test per AC listed, titled `AC<n> — <short name>`.
  - **Driving the scan:** fill answers by clicking options. Use `reference/check-states.js` for the sample, best-case and worst-case answer sets.
  - **Storage:**
    - seed `localStorage` for resume, expired (`at` 8 days ago), corrupt (each AC14 row) and stamped cases;
    - use `addInitScript` to make `setItem` throw for AC15.
  - **AC18:** use `?scanTestDelay=2500`, which `ScanV2` passes to `ScoreButton.testDelayMs` outside production only (same allow-list as the switch).
  - **AC37:**
    - assert the event names and order from `events(page)`;
    - assert `sector === "ca-firms"` on every event;
    - assert that no value matches `/@|\d{10}/`.
  - **AC29:** `context.setOffline(true)` before submitting, and assert that no request is made.
  - **AC43:** a route that never responds; set `?scanTestTimeout=200` (outside production only, passed to `submitReport` as `timeoutMs`).
  - **AC44:** open the page with `?scanTestNoMeta=1`. Outside production only (same allow-list as the switch), `page.tsx` then passes no `meta` to `ScanV2`. Assert the plain bar, no stamps, and `recommendations[0]` as the free fix.
  - **AC37:** include a retake (expect `assessment_rerun`) and Back-from-result then forward (expect `assessment_rerun`, not a second `assessment_complete`).

### T22 — Accessibility, mobile, motion-off and page-weight tests
- implements: AC2, AC4, AC8, AC19, AC20, AC34, AC35, AC36, AC39
- depends_on: T20, T21
- files: e2e/scan-a11y.spec.ts, e2e/scan-motion-off.spec.ts, scripts/measure-scan-weight.mjs, next.config.ts
- risk: tier2
- size: M
- verify: ./node_modules/.bin/playwright test e2e/scan-a11y.spec.ts e2e/scan-motion-off.spec.ts --reporter=line && node scripts/measure-scan-weight.mjs
- notes:
  - **axe:** tags `wcag2a`, `wcag2aa`, `wcag21aa` and `wcag22aa`, on the 8 states listed in AC35, at both viewports.
  - **Tap targets:**
    - every `button`, `a`, `summary`, `input` and `label` in `main` has a bounding box of at least 44 × 44;
    - inputs have `font-size` ≥ 16 px at 360 px;
    - badges are ≥ 12 px;
    - there's no horizontal scroll;
    - the chat launcher is absent.
  - **Reduced motion:** use `emulateMedia({ reducedMotion: "reduce" })`, including a mid-run switch. Assert that no element has a running CSS animation or transition (`getAnimations()` is empty after each step).
  - **Motion off:** a third Playwright project, `nomotion`, built with `NEXT_PUBLIC_CA_SCAN_V2=1 NEXT_PUBLIC_SCAN_MOTION=0` on port 3102. It runs the same assertions as reduced motion (AC39).
  - **AC19:** sample the ring offset and the number each frame via `requestAnimationFrame` in the page, and assert that both reach the final value within 50 ms of each other.
  - **Page weight** (`measure-scan-weight.mjs`):
    1. read `.next/app-build-manifest.json` from two builds of the same commit, with the switch off (`.next-off`) and on (`.next-on`);
    2. gzip-sum the JS for `/[locale]/assessment/ca-firms/page`;
    3. exit non-zero if on − off > 15 KB, or if off differs from a build of the base commit by more than 1 KB.
    Build each variant into its own `distDir`: add `distDir: process.env.NEXT_DIST_DIR || ".next"` to `next.config.ts` (no change when the variable is unset).

### T23 — Preview sign-off: VoiceOver, real phone, legal date
- implements: AC2, AC4, AC19, AC24, AC36
- depends_on: T22
- files: ../specs/ca-assessment-pilot/signoff.md
- risk: tier1
- size: S
- verify: manual — on the Vercel preview with `?scanV2=1`, Dilip completes the scan with VoiceOver on an iPhone and on Mac Safari, and records in signoff.md that:
  - the progress text, each question, "<Section> section done.", and score plus band are each read once;
  - the scan completes on a real 360 px Android phone and looks smooth;
  - spec OQ1–OQ8 have answers;
  - the 13 May 2027 date was checked against the MeitY notification.
- notes: The scan switch stays off in production until this file is signed.

## Rollout

1. **Merge PR #92** (legal fixes to the CA pack), then rebase this branch.
2. **Ship T6, T8 and T19 to production.**
   - T6 starts the baseline.
   - T8 and T19 stand alone.
   - Read CA starts after 14 days.
   - If CA has fewer than 50 starts, apply the spec's Measurement rule (4-week windows, or another sector) before starting T9 onwards.
3. **Merge T1–T5, T7 and T9–T22** with `NEXT_PUBLIC_CA_SCAN_V2` unset. Production is unchanged.
4. **Sign T23** on the preview.
5. **Set `NEXT_PUBLIC_CA_SCAN_V2=1`** in Vercel production and redeploy.
6. **After the measurement window,** read the success criterion (intent.md).
   - If it's met, open a new chain for the other 11 sectors and the generic survey.
   - If motion is the doubt, set `NEXT_PUBLIC_SCAN_MOTION=0` and measure again.
   - If the whole scan fails, unset `NEXT_PUBLIC_CA_SCAN_V2`. T6, T8 and T19 remain in production.
