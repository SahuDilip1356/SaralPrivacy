# Readiness assessment revamp: final Subframe motion and engagement spec

Version 1.0, 3 November 2026. For the engineer or agent building the revamp in `DPDPA Daily Brief/webapp/webapp`, and for Dilip's sign-off. Read with `HANDOFF.md` in this folder, which covers the funnel evidence, the open PR and the order of work.

Reference build: the clickable prototype (v5) at https://claude.ai/artifact/4FCLVShM8FvrAV7KNLJZuF, source in `prototype/ca-scan-v5.html`. Where the prototype and this spec differ, this spec wins. The differences are listed in section 14.

---

## 1. Goal and what success looks like

**Problem.** About 1 in 114 visitors who reach `/assessment` finish it (October 2026). People start and leave.

**Goal.** More people finish the scan, and more of those who finish leave their email for the full plan.

**How motion helps.** Motion here has three jobs. It never decorates.
1. **Show progress.** Each answer visibly moves the person forward, so stopping feels like losing something.
2. **Reward milestones.** Finishing a section and seeing the score are rare moments, so they get a small, clear flourish.
3. **Make the result worth reading.** The score lands, the risks arrange themselves highest first, and one useful fix appears before any form.

**Targets** (compare the same sector, 2 weeks before and 2 weeks after launch; baseline from the sector-tagged analytics PR):

| Metric | Definition | Target |
|---|---|---|
| Completion rate | `assessment_complete` ÷ `assessment_start` | at least double the baseline |
| Mid-scan drop | starts that never reach the second section | down by a third |
| Lead rate | `report_requested` ÷ `assessment_complete` | at least 25% |
| Resume use | `assessment_resume_continue` ÷ `assessment_resume_shown` | tracked, no target yet |

If completion doesn't move after 2 weeks, keep the legal and mobile fixes and stop the rollout (section 12).

## 2. Scope

**In scope**
- The 12 sector scans under `app/[locale]/assessment/<sector>/` (pilot: CA firms, `CAAssessmentClient.tsx`).
- The generic survey on `/assessment` (`SurveyClient.tsx`, 6 steps) and the page around it (`app/[locale]/assessment/page.tsx`).

**Out of scope**
- Scoring logic (`calculateIndustryResult` in `lib/data/industry-assessment/core.ts`). The revamp only changes how results are shown.
- Server routes, except the new analytics events and the form error states.
- Dark mode. The site is light only.

## 3. Motion rules (apply to every moment)

From Subframe's guidance, applied to this product:

1. **Animate only to answer a question:** did my answer count, where am I, what changed, what next. If a motion answers none of these, cut it.
2. **Budget by frequency.**
   - Selecting an answer happens about 25 times per scan, so its motion is tiny (a 200 ms tick).
   - Moving between questions happens 11 times, so it gets a short slide (240 ms).
   - Finishing a section happens 3 times, and the score once. Those can be expressive.
3. **Never block input.** Every animation can be interrupted. Keyboard actions apply instantly, with no slide.
4. **Respect reduced motion.** Read `prefers-reduced-motion` and listen for changes at runtime. Movement becomes an instant change. Progress, ticks and states stay.
5. **One motion language.** All durations, curves and springs come from one tokens file (section 4). No raw numbers in components.
6. **Nothing carries meaning by motion alone.** Every animated state is also readable as text and announced to screen readers once.

## 4. Motion tokens

Create `lib/motion/tokens.ts`. Values come from the Subframe examples named in section 5.

```ts
// Durations (seconds)
export const DUR = {
  tick: 0.2,        // answer tick draw
  panel: 0.24,      // question slide (transition-panel)
  fade: 0.25,       // banners, free-fix entry
  stamp: 0.18,      // section stamp press (activity-stamp)
  stampHold: 1.1,   // stamp visible before it settles into the rail
  score: 1.0,       // ring and number, shared clock
  scoringPause: 0.9,// deliberate "Scoring your answers" beat (decision D2)
  slowNotice: 2.0,  // after this, say "Still working on your score"
} as const

// Curves
export const EASE_OUT = [0.22, 1, 0.36, 1] as const   // general ease-out
export const EASE_PANEL = [0.25, 1, 0.5, 1] as const  // transition-panel

// Springs (motion / framer-motion)
export const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const      // ticks, chip, check (task-steps, poll-results)
export const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const    // small state swaps (task-steps)
export const FILL = { type: "spring", stiffness: 210, damping: 34, mass: 0.9 } as const     // result bars (poll-results)
export const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const// button faces (loading-button)
export const STILL = { duration: 0 } as const

// Distances and stagger
export const PANEL_SHIFT = 18   // px, question slide
export const RISE = 8           // px, fade-up entries
export const STAGGER = 0.06     // s per item; whole sequence under 0.5 s
```

**Library.** The Subframe examples import from `motion/react` (motion 12). The webapp already ships `framer-motion` 12, the same engine. Import from `framer-motion` and don't add the `motion` package.

**Reduced motion.** Add one hook, `lib/motion/useMotionOk.ts`:
- It returns `false` when the user prefers reduced motion (subscribe to `matchMedia` changes, as every Subframe example does), or when the last navigation came from the keyboard (`event.detail === 0`).
- Every component uses it in place of its own copy.

**Licences.** `transition-panel` and `sliding-number` are adapted from Motion Primitives (MIT, ibelick). `task-steps`, `poll-results` and `loading-button` are adapted from Interior (MIT, ozzy). `activity-stamp` is Subframe's own (MIT). Keep each MIT header in the file that adapts it.

## 5. Moment catalogue

Each moment lists: the question it answers, the trigger, the Subframe source and what to keep from it, the values, the reduced-motion behaviour, accessibility, analytics, and acceptance criteria.

### M1. Progress rail (replaces the single bar)

- **Answers:** where am I, and how much is left?
- **Source:** `task-steps` (https://www.subframe.com/motion/task-steps). Keep its status model (`pending | active | done | error`) and the `POP` spring when a step becomes done. Drop the spinner; nothing here is loading.
- **Layout:**
  - A "Start" dot for the optional quick-start question, then 3 named sections.
  - Each section has one segment per question.
  - Pilot sections for CA firms are Practice (Q1–2), Documents (Q3–5) and Controls (Q6–10), pending decision D1.
  - The generic survey uses its existing step groups in `SurveyClient.tsx`.
- **Behaviour:**
  - A segment fills left to right (`scaleX` 0→1, 280 ms, `EASE_OUT`) when its question has an answer.
  - The current segment is taller (12 px against 8 px), with a 2 px navy outline.
  - The section label turns navy while active. When the section finishes, a tick pops in beside it (`POP`).
- **Text above the rail:** "Question 4 of 10" on the left. On the right, the time left (M5) and "40% complete". All digits are fixed-width (`tabular-nums`).
- **Reduced motion:** segments and ticks switch state instantly.
- **Accessibility:**
  - The rail is one element with `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax=<required count>` and `aria-valuenow=<answered>`.
  - Its `aria-valuetext` reads, for example, "3 of 10 answered, Documents section".
  - The visual parts underneath are `aria-hidden`.
- **Data:** add an optional `sections: { key; label; stamp; questionIds }[]` to the pack type in `core.ts`. Packs without it fall back to a plain bar.
- **Accept when:**
  - The rail updates within one frame of an answer.
  - The rail fits with no sideways scroll at 360 px.
  - VoiceOver reads the value text once per change.

### M2. Answer selection tick

- **Answers:** did my choice register?
- **Source:** Subframe feedback guidance ("animate the indicator in under 200 ms"), plus the tick shape from `task-steps`. No library: this is a CSS transition.
- **Values:**
  - The tick is an SVG polyline drawn with `stroke-dashoffset` 16→0 over 200 ms `EASE_OUT`, starting 40 ms after the box fills.
  - The box fills green-600 with a 150 ms colour transition.
  - The row border goes green-500 on a green-50 background.
  - On press, the row scales to 0.99 for 120 ms.
- **Hover:** a border and background change only, inside `@media (hover: hover)`, so phones don't get stuck states.
- **Reduced motion:** the tick appears at once and the row doesn't scale on press.
- **Accessibility:**
  - Real `<input type="radio|checkbox">` elements, visually hidden, so the browser's arrow keys and Space work.
  - The focus ring is a 2 px outline at `--focus` (navy-500, about 8:1 on white).
  - The empty radio or box border is slate-500 (4.8:1). Today's slate-300 is 1.5:1 and fails.
- **Accept when:** the tick finishes within 240 ms of the click, and there is no layout shift.

### M3. Moving between questions

- **Answers:** which way am I going?
- **Source:** `transition-panel` (https://www.subframe.com/motion/transition-panel). Keep `AnimatePresence mode="popLayout"`, the `custom` direction, and the `canAnimate` gate.
- **Values:**
  - The new question enters from 18 px on the side you're heading towards, from opacity 0 and `blur(2px)`, over 240 ms on `EASE_PANEL`.
  - The old question leaves 18 px the other way. The exit is the same 240 ms, as in Subframe's example, because the two panels cross.
- **Keyboard:** Enter on a selected answer goes to the next question. Back and Forward also work. All keyboard moves are instant, with no slide.
- **Focus:** after each move, focus goes to the question heading (`tabIndex=-1`, no visible ring), so screen readers read the new question.
- **Browser history:**
  - Each question pushes a history entry (`#q4`), so the browser's Back button goes to the previous question with answers kept.
  - The result page pushes `#result`.
- **Double-click guard:** ignore Next and Back for 350 ms after a move, so a double-click can't skip a question.
- **Reduced motion:** questions swap instantly.
- **Accept when:**
  - Back and Forward walk through the questions.
  - A double-click on Next moves exactly one question.
  - Focus lands on the new heading every time.

### M4. Section stamp

- **Answers:** I finished a chunk. How far through am I?
- **Source:** `activity-stamp` (https://www.subframe.com/motion/activity-stamp). Keep the `sf-as-press` keyframes (scale 1.22→1, opacity 0.6→1, 180 ms, `cubic-bezier(.2,.9,.3,1)`).
- **Behaviour** (on leaving the last question of a section with Next):
  1. A stamp reading "Documents recorded ✓" presses onto the section label: an ink-green 2.5 px border, a slight −7° tilt and a faint ink texture.
  2. It holds for 1.1 s, then fades over 200 ms.
  3. The section tick (M1) pops in as the stamp fades.
- **Frequency:** 3 times per scan. Never on Back, and never twice for the same section.
- **Reduced motion:** no stamp; the section tick appears at once.
- **Accessibility:**
  - The stamp is `aria-hidden`.
  - A polite live region says "Documents section done." once.
- **Copy:** pending decision D3.
- **Accept when:**
  - The stamp shows exactly 3 times in a full run and never blocks input.
  - With Next pressed during the hold, the next question works normally.

### M5. Time left

- **Answers:** how long until I'm done?
- **Rule:**
  - Remaining required questions × 18 s. The 18 s comes from the page's promise of 3 minutes for 10 questions.
  - Round to whole minutes.
  - Under 60 s, show "Under a minute left". On the last question, "Last question". When everything is answered, "Ready for your result".
- **Motion:** none. Changing text is enough here.
- **Accept when:**
  - The figure falls as answers are added, never rises on Back, and always agrees with the page's time promise (fix the 3-versus-5-minute mismatch on `/assessment`).

### M6. Resume

- **Answers:** can I stop now and come back?
- **Storage:**
  - `localStorage` key `sp-assessment-v1:<sector>`, holding `{ answers, qi, stamped, at }`.
  - Save on every answer and move.
  - Clear when the result shows, on "Start again", and after 7 days (decision D5).
  - When reading, drop any answer ID that no longer exists in the pack, so an old or edited save can't tick a missing option.
- **What is stored:** answers only. No name, email or phone is ever stored here.
- **Screen:**
  - A card titled "Welcome back. Pick up where you left off.", with "You've answered 4 of 10 questions. The rest takes about 2 min."
  - A mini rail showing what's answered.
  - "Continue from Question 5 →" as the primary button, "Start again" as a quiet one.
  - The note "Your answers are saved on this device only, for 7 days. Nothing is sent until you ask for your report."
- **Motion:** the card fades up 8 px over 250 ms. Focus goes to its heading.
- **States:**
  - **Saving blocked** (private browsing, or storage throws): hide resume and show "This browser isn't saving progress (private browsing does this). Finish in one sitting: about N min."
  - **Expired:** show "Your saved answers were more than 7 days old, so we cleared them. This is a fresh start." above the first question.
- **Accept when:**
  - Reload mid-scan offers resume.
  - A save edited to an unknown option loads without that option.
  - In private mode nothing breaks and the note shows.

### M7. "Scoring your answers" button

- **Answers:** did my last click work, and what happens now?
- **Source:** `loading-button` (https://www.subframe.com/motion/loading-button). Keep `useAsyncAction` (one run at a time, run IDs) and the overlapping faces, which crossfade with the `CROSSFADE` spring: opacity, 3 px rise, 3 px blur.
- **Faces on the last question's button:**
  1. "See my results →"
  2. On click, a spinner and "Scoring your answers…", held for 0.9 s (decision D2: scoring is instant, so this pause exists only for feel).
  3. If anything takes longer than 2 s, "Still working on your score…".
  4. "Done ✓" for 280 ms, then the result page.
- **Size:** the button keeps the same footprint in every face.
- **Reduced motion:** the faces swap without the rise or blur; the spinner stays still; the pause is 0.3 s.
- **Accessibility:** `aria-busy` while pending. A polite live region says "Scoring your answers." and, at 2 s, "Still working on your score."
- **Accept when:** a double-click scores once, and the slow notice shows if scoring is delayed past 2 s.

### M8. Score reveal: ring and number

- **Answers:** what's my score?
- **Sources:**
  - `sliding-number` (https://www.subframe.com/motion/sliding-number) for rolling digit columns with fixed-width digits.
  - The score ring is project code: an SVG circle with `stroke-dasharray` equal to its circumference.
- **One clock:**
  - Animate a single `MotionValue` from 0 to the readiness score with `animate(mv, score, { duration: DUR.score, ease: EASE_OUT })`.
  - Derive the ring's `stroke-dashoffset` and the digit columns from that same value with `useTransform`, so they land together.
  - Don't give each digit its own spring (as `sliding-number` does), or the number and ring finish at different times.
- **Start:** run in `useEffect` after mount, never during render. This fixes the current `ReadinessGauge` first-render bug, where the ring may not animate.
- **Colour:** the ring uses the band colour token. The track is `--ring-track`.
- **Reduced motion:** the ring and number show their final values on first paint.
- **Accessibility:**
  - The ring and digits are `aria-hidden`.
  - The heading next to them carries the meaning: "DPDPA Readiness: 62 / 100", plus a visually hidden ". Risk band: High Risk."
  - Focus moves to that heading when the result page opens, so it is read once.
  - The count-up is never announced.
- **Accept when:**
  - The ring and number finish within the same frame (±16 ms).
  - With reduced motion, the final values show at first paint.

### M9. Band chip

- **Source:** `poll-results` and `task-steps` (the `POP` spring check).
- **Values:** the chip pops in from scale 0.8 and opacity 0 with `POP`, starting at 850 ms (as the score settles).
- **Look:**
  - Navy text on a 14% tint of the band colour, with a 1.5 px band-coloured border and an 8 px band-coloured dot. Contrast is 14:1 to 15.7:1 for all four bands.
  - This replaces today's white-on-colour chip, which fails contrast for 3 of 4 bands (2.0–2.8:1).
- **Text:** the band only ("High Risk"), not "Risk Band: High Risk".
- **Accessibility:** `aria-hidden`, because the heading already announces the band.

### M10. Free priority fix

- **Answers:** what do I do first? This is the lead magnet's proof of value.
- **Content:** the first item from `recommend()`, ranked by the firm's own risk (the highest-risk area that has a fix), per decision D4. Show the area and its score: "Linked to your highest-risk area with a fix: Document intake risk (83/100)."
- **Placement:** directly under the score card, before everything else.
- **Look:** a white card with a 2 px green-500 border. A small heading, "Your top priority fix · free". The fix itself at 20 px, weight 600.
- **Motion:** fades up 8 px over 250 ms `EASE_OUT`, starting at 950 ms.
- **When nothing is high risk:** show the pack's fallback fix and "No area scored high enough to need a specific fix."
- **Accept when:** a firm sees its fix without filling in any form, and the fix matches the first item of the emailed plan.

### M11. Top risk areas and risk map

- **Source:** `poll-results` (https://www.subframe.com/motion/poll-results). Keep the `clip-path: inset()` fill driven by a `MotionValue` with the `FILL` spring, and the percentage readout that writes from the same value.
- **Order on the page:** red flags first, then the two summary bars ("Data exposure", "Control maturity"), then the risk map, highest risk first.
- **Stagger:**
  - Red flags fade up 8 px, 60 ms apart, starting at 1,150 ms.
  - Bars fill 60 ms apart, starting at 500 ms.
  - Each list's whole sequence stays under 500 ms. This replaces the prototype's 120 ms stagger, which broke Subframe's rule.
- **Risk map:** show the top 2 areas. A "Show all 5 areas" button (`aria-expanded`, `aria-controls`) reveals the rest. Hidden rows use the `hidden` attribute.
- **Headings:** "Your top risk area" when there's one, "Top 3 risk areas" otherwise. "Your CA practice risk map · highest risk first".
- **No red flags:** show a green-bordered panel, "No red flags found", with "None of your answers matched a red-flag pattern. Keep the evidence that shows it: written policies, access reviews and vendor terms."
- **Accessibility:** bars are `aria-hidden`. Each status chip carries visually hidden text: "High risk, 83 of 100".
- **Reduced motion:** all fills and lists show final values at first paint.

### M12. Report form

- **Answers:** what do I get for my email, and did it work?
- **Source:** `loading-button` again, for the submit button faces: "Send my report" → "Sending…" → success or error.
- **Title:** "Get your other 3 priority fixes and the CA Firm DPDPA Starter Checklist". The count of remaining fixes is dynamic. This drops "Unlock", per the writing rules.
- **Fields:** all labels are visible, never placeholders only. Inputs use 16 px text, so iPhone Safari doesn't zoom in. All are at least 44 px tall.
  - Your name: required, `autocomplete="name"`.
  - Firm name: required, `autocomplete="organization"`.
  - Email: required, `type="email"`, `autocomplete="email"`, `autocapitalize="off"`, `spellcheck="false"`.
  - Phone or WhatsApp: optional (decision D6). `type="tel"`, `inputmode="tel"`. Accepts +91, 91 or 0 in front, plus spaces and dashes, then 10 digits starting 6–9.
- **Validation** (on submit, then live once a field has shown an error):

| Field | Message |
|---|---|
| Name empty | Enter your name. |
| Firm empty | Enter your firm's name. |
| Email empty | Enter your email. The report goes there. |
| Email invalid | Check the email. It needs an @ and a domain, like name@firm.in. |
| Phone invalid | Enter a 10-digit mobile number, like 98765 43210, or leave it blank. |

  - Errors show under their field, linked by `aria-describedby`, with `aria-invalid="true"` and a 2 px red border.
  - Focus moves to the first invalid field.
  - The optional 300 ms shake is allowed only together with the text message.
- **States:**
  - **Sending:** fields read-only, button `aria-busy` with "Sending…".
  - **Server error:** an alert (`role="alert"`) says "We couldn't send your report. Your details are still here. Try again in a minute." The button reads "Try again". Everything typed is kept.
  - **Offline:** "You're offline, so the report didn't send. Your details are still here. Try again once you're connected."
  - **Sent:**
    - Heading "Report sent to <email>", which receives focus.
    - The remaining fixes, shown on the page.
    - "The CA Firm DPDPA Starter Checklist is in the same email. If it isn't in your inbox in 5 minutes, check spam."
    - "Wrong email? Change it", which returns to the form with values kept.
- **Consent:** the existing consent checkbox and its English-only sentence stay on this form. Make the box 24 px with a 44 px tap area. See decision D7 on moving consent off step 0.
- **Security:** the server must escape every field before it goes into the email (open audit finding on `/api/assessment`).
- **Accept when:** every state above can be reached in Playwright with the network mocked, and nothing typed is ever lost.

### M13. Offline and other banners

- **Offline:** listen to the `online` and `offline` events.
  - During the quiz: "You're offline. Keep answering: the scan and your result work without internet. Sending the report needs a connection."
  - On the result page: "You're offline. Your result is all here. Sending the report needs a connection." Add or remove only the banner, so the form keeps focus and values.
- **Look:** a gold-50 background with gold-700 text, and no motion.
- **Accessibility:** a polite announcement, "You're offline." / "You're back online."

## 6. Result page choreography (proposed, full motion)

| Time | What happens | Token |
|---|---|---|
| 0 ms | Page swaps in; focus on the score heading; scroll to top | |
| 0–1,000 ms | Ring draws and number rolls from 0, one clock | `DUR.score`, `EASE_OUT` |
| 500–740 ms | Summary bars start filling, 60 ms apart | `FILL`, `STAGGER` |
| 850 ms | Band chip pops | `POP` |
| 950 ms | Free fix fades up | `DUR.fade`, `RISE` |
| 1,150–1,330 ms | Red flags fade up, 60 ms apart | `STAGGER` |

Everything below the fold is final on arrival. Nothing waits for the user to scroll.

## 7. Screens and states inventory

Every one of these must exist in the build and be reachable in tests:

1. Quiz, first visit.
2. Quiz with saving blocked.
3. Quiz offline.
4. Resume card.
5. Resume expired.
6. Section stamp.
7. Scoring, normal.
8. Scoring, slow (over 2 s).
9. Result, normal.
10. Result, no red flags.
11. Result, worst case (score 0, 5 high areas).
12. Result offline.
13. Form idle.
14. Form field errors.
15. Form sending.
16. Form server error.
17. Form offline.
18. Form sent.
19. Form "change email".
20. Reduced motion for each of the above.

Not covered by the prototype, so design at build time: the server's own error messages, and the page with JavaScript turned off. At minimum, show the questions and a message that the scan needs JavaScript.

## 8. Copy deck (legal-gated)

New interface strings are in sections 5 and 7. Question-pack strings were checked against the DPDP Act on 3 November 2026 and are in PR #92. Rules for any new copy:

- Every legal claim names its section and says it applies from 13 May 2027 (confirm against the MeitY commencement notification before launch).
- No "Unlock", no "highest-impact under DPDPA", no unsourced "most common".
- **Result-page line** (already in PR #92 for CA):
  > Most DPDP Act duties, including notice, security safeguards and breach intimation, apply from 13 May 2027. This score is an educational check, not a compliance certificate or legal advice.

  Use it on all 12 scans and the generic survey.
- **Legal-tier text stays English in every locale:** the consent sentence and the result-page line.
- **Before shipping:** run `saralprivacy-legal-gate` on the other 11 packs and on the `/assessment` page copy. That page says the Rules were notified on 14 November 2025, while other sources say 13 November.
- **Writing check:** run `sd-no-ai-slop` (linter `--strict`) on every new string.

## 9. Accessibility checklist

- Automated accessibility scan (axe) with zero violations on: the quiz, the result page, the form with errors and the sent state.
- A full VoiceOver pass on iPhone Safari and on Mac Safari:
  - The progress value is read on change.
  - Each question is read on arrival.
  - The section is announced once.
  - The score and band are read once.
  - Form errors are read with their field.
- Keyboard only, start to finish:
  - Arrow keys within answers, Space to select, Enter to go on.
  - Back and Forward work.
  - No focus traps.
- Contrast:
  - Body and helper text at least 4.5:1 (slate-600 on pearl is 7.18:1; slate-500 on white is 4.76:1).
  - Control borders and focus rings at least 3:1.
- 200% zoom: nothing lost, no sideways scroll.
- No movement for users who prefer reduced motion beyond instant state changes. Nothing flashes.

## 10. Mobile specification

Measured on the live CA scan on 3 November at 360 and 390 px; each item is a fix.

| Item | Today | Spec |
|---|---|---|
| Form text | 14 px (iPhone zooms in) | 16 px on phones (`text-base sm:text-sm`) |
| Next and Back | 40 px tall | at least 44 px |
| Skip | 29 × 20 | at least 44 × 44 (padding) |
| "Why this matters" | 20 px tall | 44 px summary row |
| Consent box | 13 × 13 | 24 px box in a 44 px label |
| Privacy Notice link, Retake | 15–20 px tall | at least 44 px tap area |
| Answer badges | 10 px | 12 px |
| Header line | title and "3 minutes · 10 questions" squeezed side by side | stack them on phones |
| Chatbot bubble | covers an answer badge, the score bars and the `/assessment` headline | hide it on assessment routes, or move it so it never covers content (bottom-right, with page padding equal to its size) |
| Main `/assessment` first screen | two other tools fill it; the assessment headline is below the fold | the assessment hook and start button on the first screen; Discovery and the Notice Generator after the result or lower on the page |

## 11. Analytics

Add `sector` to every event (today `assessment_start` and `assessment_step_N` have none). Ship this first and collect at least 2 weeks of baseline before shipping the motion.

| Event | When | Parameters |
|---|---|---|
| `assessment_start` | first answer or Skip on the quick start | sector, resumed (bool) |
| `assessment_question_view` | each question shown | sector, q (id), n (position) |
| `assessment_section_complete` | stamp moment | sector, section |
| `assessment_resume_shown` | resume card shown | sector, answered |
| `assessment_resume_continue` | Continue clicked | sector, from_q |
| `assessment_complete` | result shown | sector, band, score |
| `free_fix_viewed` | free fix enters the viewport | sector, bucket |
| `report_form_error` | validation fails | sector, fields (names only, never values) |
| `report_submit_failed` | server or offline failure | sector, reason (`server`, `offline`) |
| `report_requested` | send succeeds (existing) | sector, band |

Never send answers, names, emails or phone numbers to analytics. Block analytics in local and preview testing so tests don't pollute the baseline.

## 12. Engineering plan

**Files** (new, under `components/assessment/`):

| File | Holds | Adapted from |
|---|---|---|
| `ProgressRail.tsx` | M1 | task-steps |
| `AnswerOption.tsx` | M2 | CSS only |
| `QuestionPanel.tsx` | M3 | transition-panel |
| `SectionStamp.tsx` | M4 | activity-stamp |
| `ResumeCard.tsx` and `useResume.ts` | M6 | project code |
| `ScoreButton.tsx` and `useAsyncAction.ts` | M7 and M12 | loading-button |
| `ScoreReveal.tsx` | M8 and M9; replaces `ReadinessGauge` | sliding-number |
| `RiskBars.tsx` | M11 | poll-results |
| `FreeFix.tsx` | M10 | project code |
| `ReportForm.tsx` | M12 | project code |
| `lib/motion/tokens.ts`, `lib/motion/useMotionOk.ts` | section 4 | |

**Pack type:** add optional `sections` (M1) to `IndustryPack` in `core.ts`. Scoring is unchanged.

**PR sequence:**
1. PR #92: legal fixes for the CA pack (open, awaiting sign-off).
2. **Sector analytics.** Add `sector` to start and step events and add the new events. Then wait 2 weeks.
3. **Mobile fixes on the CA client** (section 10). Small Tailwind changes.
4. **`/assessment` page.** The hook on the first screen, one time promise, and the legal gate on its copy.
5. **CA pilot.** The shared components above, used by `CAAssessmentClient.tsx` only. Fix the score ring first.
6. **Measure for 2 weeks** against the baseline (section 1).
7. **Roll out** to the generic survey and the other 11 sectors only if the pilot hits the targets. Merging the 12 duplicated clients into one shared client belongs in this step, not before.

**Tests:**
- **Unit** (`node --test`, as the repo already does):
  - time left;
  - the resume reader (expiry, unknown IDs, a corrupt save, storage that throws);
  - fix ranking by risk;
  - the phone normaliser;
  - email validation.
- **Component:** reduced motion gives final values on first paint; the double-click guard; keyboard moves skip animation.
- **End to end** (Playwright):
  - every state in section 7, with the network mocked for form outcomes;
  - Back and Forward;
  - 360 px and 200% zoom with no sideways scroll;
  - axe at zero.
  - The prototype's `prototype/check-states.js` is a working starting point.

**Performance:**
- Animate only `transform`, `opacity` and `clip-path`. Never animate `width` or `height`; the prototype's bar `width` transition becomes `clip-path` from `poll-results`.
- No layout shift as answers are selected.
- The motion code should stay small, since framer-motion is already in the bundle.

## 13. Definition of done (per sector)

- [ ] All moments M1–M13 built with tokens only, with no raw durations in components.
- [ ] Every state in section 7 reachable and covered by an end-to-end test.
- [ ] Accessibility checklist (section 9) passed, including a VoiceOver run on a real iPhone.
- [ ] Mobile items (section 10) fixed; no tap target under 44 px in the scan.
- [ ] Copy passes `saralprivacy-legal-gate` and `sd-no-ai-slop`; the result-page line is present.
- [ ] Analytics events fire with `sector`, and no personal data is sent.
- [ ] Dilip signs off on a preview build.

## 14. Where this spec changes the prototype

| Item | Prototype v5 | Final spec | Why |
|---|---|---|---|
| Result stagger | 120 ms per item (bars), 110 ms (flags) | 60 ms, each list under 500 ms | Subframe stagger rule |
| Bars | animate `width` | `clip-path` with the `FILL` spring | Performance; matches poll-results |
| Ring and number | hand-rolled rAF clock | one `MotionValue` driving both | Same result, framer-motion idiom, fixes the first-render bug |
| Question slide | 28 px, 280 ms, no blur | 18 px, 240 ms, 2 px blur | transition-panel values |
| Section stamp | scale 1.9→1 over 1.5 s keyframes | 1.22→1 press in 180 ms, then 1.1 s hold | activity-stamp values; a gentler entry for a repeated moment |
| Form inputs | 14 px | 16 px on phones | iPhone zoom |

## 15. Decisions waiting on Dilip

| ID | Decision | Default in this spec |
|---|---|---|
| D1 | Section names (CA: Practice, Documents, Controls) | as shown |
| D2 | Keep the 0.9 s "Scoring your answers" pause | keep; drop if completion data says so |
| D3 | Stamp wording ("Documents recorded") | as shown |
| D4 | Rank fixes by the firm's risk instead of a fixed order | rank by risk |
| D5 | Saved answers expire after 7 days | 7 days |
| D6 | Phone optional on the form | optional |
| D7 | Move consent from step 0 (before Q1) to the report form | move it, after legal review; answers stay on the device until the form is sent |

## 16. References

**Subframe examples** (all MIT; keep headers):
- task-steps: https://www.subframe.com/motion/task-steps
- transition-panel: https://www.subframe.com/motion/transition-panel
- activity-stamp: https://www.subframe.com/motion/activity-stamp
- loading-button: https://www.subframe.com/motion/loading-button
- sliding-number: https://www.subframe.com/motion/sliding-number
- poll-results: https://www.subframe.com/motion/poll-results

**Subframe guidance used:** principles, timing, feedback, text and numbers, accessibility, adapting (via the Subframe Motion MCP, 3 November 2026).

**Other material:**
- Prototype: `prototype/ca-scan-v5.html`, live at https://claude.ai/artifact/4FCLVShM8FvrAV7KNLJZuF (private until shared).
- Legal fixes: https://github.com/SahuDilip1356/SaralPrivacy/pull/92
- Handoff and order of work: `HANDOFF.md` in this folder.
