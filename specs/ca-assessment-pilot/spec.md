# Spec — CA firm risk scan that people finish

**Status:** draft
**Intent:** ./intent.md
**Date:** 2026-11-03

## Behavior

A CA firm opens the scan and sees where they are at all times: a progress rail split into three named sections (Practice, Documents, Controls), a "Question 4 of 10" label, a percentage, and an estimate of the time left. Each answer is confirmed at once with a small tick, and each question slides in from the direction the person is moving. Finishing a section briefly shows a stamp and leaves a tick on the rail. Answers are saved in the person's own browser as they go. Coming back within 7 days offers to continue where they stopped. The last button shows a short "Scoring your answers" state.

The result opens with the readiness score drawn as a ring and a rolling number that land together. A band label follows, then one priority fix chosen from the firm's highest-risk area, shown in full without any form. Then the top risks, two summary bars, and a risk map that shows the two highest areas, with the rest one tap away. A plain line says when most duties apply and that the score isn't a certificate or legal advice. A report form follows. It explains every mistake beside the field, never loses what was typed, says clearly when the server or the network fails, and on success shows the other fixes on the page.

Everything works by keyboard and screen reader, honours reduced motion, and fits a 360 px phone. Each funnel step is counted per sector without sending any personal data.

## Contracts

### Saved progress (browser storage only, never sent)

```
key:   "sp-assessment-v1:ca-firms"
value: {
  v: 1,
  answers: { [questionId: string]: string | string[] },  // option ids only
  qi: number,            // index of the question being shown, 0-based
  stamped: string[],     // section keys already stamped
  at: number             // ms since epoch of the last save
}
```

- Readers accept a value only if it parses, `v === 1`, `answers` is an object and `qi` is a number.
- Option IDs not in the current question set are dropped.
- `qi` is clamped to the question range.
- A value whose `at` is more than 7 × 24 hours old is deleted and reported as expired.
- The value never contains a name, firm name, email or phone number.

### Report request (existing endpoint, unchanged shape)

`POST /api/assessment`, request JSON, with the fields the scan sets:

```
{ email: string, name: string, business: string, mobile: string,   // mobile "" when not given
  industry: "ca-firms", report_type: "ca-firm", answers: object,
  result: { finalScore, rawScore, verdictBand, verdictDescription, dataExposure,
            controlMaturity, operationalReadiness: 0, categoryScores,
            redFlagsTriggered: string[],
            immediateActions: string[],      // ranked fixes, same order as shown on the page
            thirtyDayActions: [] },
  consentReport: true, consentNewsletter: false, consentFollowup: false, hp_url: string }
```

| Status | Meaning |
|---|---|
| 200 | Saved; the email is queued |
| 400 `{ error: "Email is required." }` | Rejected input |
| 429 + `Retry-After` header (seconds) | Rate limited |
| 500 `{ error: "Failed to save assessment." }` | Server failure |

### Analytics events (cookieless, aggregate)

Each event carries `sector: "ca-firms"`. No event ever carries answers, free text, names, emails, phone numbers or report tokens.

| Event | Extra properties |
|---|---|
| `assessment_start` | `prefilled: boolean`, `src: "hero" \| ""`, `resumed: boolean` |
| `assessment_question_view` | `q: string` (question id), `n: number` (position) |
| `assessment_section_complete` | `section: string` |
| `assessment_resume_shown` | `answered: number` |
| `assessment_resume_continue` | `from_q: string` |
| `assessment_complete` | `score: number`, `risk_band: string` |
| `free_fix_viewed` | `bucket: string` |
| `report_form_error` | `fields: string` (comma-joined field names only) |
| `report_submit_failed` | `reason: "server" \| "offline"` |
| `report_requested` | `risk_band: string` |

### Release switch

A build-time setting, on or off. Off means today's scan. On means the new scan. A preview-only URL parameter can force it on for review.

## System context

**Parts by role:**
- **The scan page** runs entirely in the browser: questions, scoring, the result and the form.
- **The browser's local storage** keeps saved progress for that person on that device.
- **The report endpoint** stores the submission and sends the email.
- **The email sender** builds the report email from the submission.
- **The analytics service** receives aggregate, cookieless events.
- **The chat assistant** is a floating launcher that appears on public pages.

**Data flow:**
- Answers stay in the browser until the person submits the report form.
- Scoring happens in the browser.
- On submit, the contact details, answers and computed result go to the report endpoint. The endpoint stores them, and the email sender puts parts of them into the email.
- Analytics events go from the browser to the analytics service.

| Data | Kept where | Leaves the device? |
|---|---|---|
| Answers (option IDs) | browser storage for up to 7 days | only inside a report request the person submits |
| Position, stamped sections, save time | browser storage | no |
| Name, firm, email, phone | page memory until submit | only inside the report request |
| Score, band, fixes, red flags | computed in the browser | only inside the report request |
| Funnel events | not stored locally | yes, to the analytics service, with no personal data |

**Trust boundaries:**
1. **Browser → report endpoint.** Every field, including the computed result, can be forged by anyone who posts directly. The endpoint and the email sender must treat it all as untrusted text.
2. **Browser storage → scan.** A saved value may be old, edited or corrupt, so it's validated before use.
3. **Browser → analytics service.** Only the listed properties may cross.

## Alternatives considered

| Choice | Chosen | Rejected and why |
|---|---|---|
| Where progress is saved | in the person's own browser, for 7 days | On the server: that sends answers before the person has agreed to anything, and needs consent and retention rules |
| What the free part of the result includes | score, band, top risks, map and one ranked fix | Score only: there's no reason to trust the report. Everything free: there's no reason to give an email |
| Which fix is free | the fix for the highest-risk area that has one | The first fix in a fixed list: often not the most relevant to this firm |
| Phone on the report form | optional (pending D6) | Required: adds friction, and the endpoint already accepts it empty |
| Moment of the score animation | one shared clock for ring and number | Separate timings: the number and ring finish apart |
| What happens on a server failure | the scan keeps everything typed and offers "Try again" | Silent retries only: the person can't tell whether it worked |
| How the new scan is released | a switch, off by default | Replacing the old scan outright: no quick way back |

## Risks & mitigations

| # | Risk | Type | Mitigation | Status | Tested by |
|---|---|---|---|---|---|
| K1 | Forged report requests inject markup into the email through the result text, name or firm | security | Every client-supplied value is escaped before it's placed in the email | open | AC32 |
| K2 | Saved progress on a shared computer shows a previous person's answers | privacy | Answers only (no contact details); 7-day expiry; "Start again" clears; cleared when the result shows | mitigated | AC12, AC13, AC16 |
| K3 | An edited or corrupt saved value breaks the scan or ticks an option that no longer exists | failure | Validation on read; unknown option IDs dropped | mitigated | AC14 |
| K4 | Private browsing or blocked storage throws errors | failure | Storage access guarded; the scan runs without saving and says so | mitigated | AC15 |
| K5 | Analytics carries personal data | privacy | Fixed property list; no free text | mitigated | AC37 |
| K6 | Motion delays or blocks people, or makes them unwell | latency | Nothing waits on animation; reduced motion and keyboard skip movement | mitigated | AC8, AC36 |
| K7 | The success criterion can't be read because traffic is too low | scale | Minimum-starts check before reading results (A2) | open | Non-functional, measurement |
| K8 | A legal line is wrong after a commencement change | failure | Date checked before launch (A6); single source for the legal line | open | AC24 |
| K9 | The new scan breaks in production | failure | Release switch off by default; one-step rollback | mitigated | AC38 |

## Acceptance criteria

### AC1 — The rail shows sections and fills as answers come in
- traces: G1
- given: the scan is on question 4, with questions 1–3 answered
- when: the person selects an answer to question 4
- then: the rail shows a Start mark and three sections (Practice, Documents, Controls), with one segment per question in each; the segment for question 4 fills within one frame; the label reads "Question 4 of 10" and the percentage reads "40% complete"

### AC2 — Progress is announced to screen readers
- traces: G4
- given: a screen reader is running
- when: an answer changes the number of answered questions
- then: the rail exposes its value as "N of 10 answered, <Section> section"; the decorative parts aren't announced

### AC3 — Time left follows the 18-seconds-a-question rule
- traces: G1
- given: R required questions remain unanswered at or after the current one
- when: the label is drawn
- then:
  - it shows "About M min left", where M = round(R × 18 / 60), when R × 18 ≥ 60;
  - otherwise "Under a minute left";
  - on the last question with it unanswered, "Last question";
  - on the last question with everything answered, "Ready for your result";
  - going back never raises the figure above what it showed before for the same set of answers

### AC4 — Questions move in the direction of travel, and focus follows
- traces: G1, G4
- given: any question
- when: the person activates Next or Back with a pointer
- then:
  - the next question enters from the side they're moving towards within 0.24 s;
  - focus moves to the new question's heading, which the screen reader reads;
  - with a keyboard, or with reduced motion on, the question changes instantly

### AC5 — Enter moves on only when the question has an answer
- traces: G4
- given: focus is on an answer option
- when: the person presses Enter
- then: the scan moves to the next question if the current one is answered (or optional), and does nothing otherwise; arrow keys move between options and Space selects

### AC6 — The browser's Back and Forward move between questions
- traces: G3
- given: the person has moved from question 3 to question 5
- when: they press the browser's Back button twice, then Forward once
- then: they see question 4, then 3, then 4, with every earlier answer still selected; from the result, Back returns to the last question with all answers intact

### AC7 — A double activation never skips a question
- traces: G3
- given: question 5 is answered
- when: Next is activated twice within 350 ms
- then: the scan shows question 6, not 7

### AC8 — Selecting an answer is confirmed at once
- traces: G1, G4
- given: any option
- when: it's selected
- then:
  - the option's indicator fills and its tick finishes drawing within 240 ms, with no layout shift;
  - with reduced motion, the tick appears at once;
  - the empty indicator's border has at least 3:1 contrast against its background

### AC9 — Each finished section is marked once
- traces: G1, G4
- given: the person is on the last question of a section and moves forward with Next
- when: the section is complete for the first time in this scan
- then:
  - a stamp reading "<Section> recorded ✓" shows over the section label for about 1.3 s, then a tick stays beside the label;
  - a screen reader hears "<Section> section done." once;
  - the stamp never shows on Back, never twice for the same section, and doesn't block input;
  - with reduced motion, only the tick appears

### AC10 — Progress is saved after every change
- traces: G3
- given: browser storage is available
- when: the person selects or clears an answer, or moves to another question
- then: the saved value matches the contract, with the current answers, position and time

### AC11 — A returning person can continue
- traces: G3
- given: a saved value under 7 days old with at least one answer
- when: the person opens the scan again
- then:
  - a card shows "Welcome back. Pick up where you left off.", "You've answered N of 10 questions. The rest takes about M min." and a mini rail of answered questions;
  - focus goes to the card's heading;
  - "Continue from Question K →" restores every answer, the position and the stamped sections

### AC12 — Starting again clears saved progress
- traces: G3
- given: the resume card, or the retake button on the result
- when: the person chooses "Start again" or "Retake the scan"
- then: the saved value is deleted and the scan opens on its first question with nothing selected

### AC13 — Old saves expire
- traces: G3
- given: a saved value older than 7 days
- when: the person opens the scan
- then: the value is deleted, the scan opens on its first question, and a note reads "Your saved answers were more than 7 days old, so we cleared them. This is a fresh start."

### AC14 — Corrupt or edited saves are handled safely
- traces: G3
- given: a saved value that doesn't parse, has the wrong version, or lists an option ID that doesn't exist
- when: the person opens the scan
- then: an unusable value is ignored as if nothing was saved; a usable value loads without the unknown option IDs; nothing throws, and no option outside the question set is ever selected

### AC15 — The scan works when the browser won't save
- traces: G3
- given: browser storage throws on write (private browsing or blocked site data)
- when: the person uses the scan
- then: it works fully, no resume is offered, and a note reads "This browser isn't saving progress (private browsing does this). Finish in one sitting: about M min."

### AC16 — Saved progress holds no contact details and ends at the result
- traces: G5
- given: the person has typed into the report form
- when: storage is inspected at any point
- then: the saved value never contains a name, firm name, email or phone number; once the result shows, the saved value is deleted

### AC17 — Scoring shows its state and runs once
- traces: G1, G3
- given: the last question is answered
- when: the person activates "See my results →" (once or several times)
- then:
  - the button shows a spinner and "Scoring your answers…" within 100 ms;
  - scoring runs exactly once;
  - after the pause, the button shows "Done ✓" and the result opens;
  - the button keeps the same size throughout;
  - a screen reader hears "Scoring your answers." once

### AC18 — Slow scoring says it's still working
- traces: G3
- given: the result hasn't opened 2 s after the button was activated
- when: the 2 s mark passes
- then: the button reads "Still working on your score…" and a screen reader hears it once

### AC19 — The score lands as one moment and is read once
- traces: G1, G4
- given: the result opens
- when: it first appears
- then:
  - the ring and the number both reach the readiness score within one frame of each other, about 1 s after opening;
  - focus is on the heading "DPDPA Readiness: N / 100", which also reads ". Risk band: <band>." to screen readers;
  - the rolling number isn't announced;
  - with reduced motion, the ring and number show their final values on first paint

### AC20 — The band label is readable
- traces: G4
- given: any of the four bands
- when: the band label shows
- then: it reads only the band name (for example "High Risk"), and its text has at least 4.5:1 contrast against its own background for all four bands

### AC21 — One priority fix is shown free, ranked by the firm's own risk
- traces: G2
- given: a result where at least one area with a fix scores 34 or more, or the band is High or Critical
- when: the result opens
- then:
  - directly under the score card, a panel headed "Your top priority fix · free" shows the fix for the highest-scoring area that has one, without any form;
  - it also shows "Linked to your highest-risk area with a fix: <Area> (<score>/100).";
  - ties keep the pack's own order

### AC22 — Red flags show highest first, and their absence is said plainly
- traces: G2
- given: a result
- when: it shows
- then:
  - with one red flag, the heading reads "Your top risk area"; with two or three, "Top N risk areas";
  - with none, a panel reads "No red flags found" with "None of your answers matched a red-flag pattern. Keep the evidence that shows it: written policies, access reviews and vendor terms.";
  - when no area scores 34 or more, the fix panel shows the pack's fallback fix and "No area scored high enough to need a specific fix."

### AC23 — The risk map leads with the two highest areas
- traces: G2, G4
- given: a result
- when: it shows
- then:
  - areas are listed highest risk first, under "Your CA practice risk map · highest risk first", and only the first two show;
  - a "Show all 5 areas" control, which reports whether it is expanded, reveals the rest and becomes "Show fewer";
  - each area's status is read as "<Status> risk, N of 100"

### AC24 — The legal line is always on the result
- traces: G6
- given: any result
- when: it shows, in any language
- then: under the band text, in English, it reads exactly: "Most DPDP Act duties, including notice, security safeguards and breach intimation, apply from 13 May 2027. This score is an educational check, not a compliance certificate or legal advice."

### AC25 — Form mistakes are explained beside the field
- traces: G2, G4
- given: the report form
- when: the person submits with any of these: no name, no firm name, no email, an email without an @ and a dotted domain, or a phone number that isn't a valid Indian mobile number
- then:
  - each affected field shows its message beneath it:

    | Mistake | Message |
    |---|---|
    | No name | "Enter your name." |
    | No firm name | "Enter your firm's name." |
    | No email | "Enter your email. The report goes there." |
    | Bad email | "Check the email. It needs an @ and a domain, like name@firm.in." |
    | Bad phone | "Enter a 10-digit mobile number, like 98765 43210, or leave it blank." |

  - each affected field is marked invalid and linked to its message for screen readers;
  - focus moves to the first invalid field;
  - nothing is sent;
  - a message disappears as soon as its field becomes valid

### AC26 — Phone is optional and Indian formats are accepted
- traces: G2
- given: the phone field
- when: it holds nothing, or 10 digits starting 6–9 with an optional "+91", "91" or "0" in front, plus spaces, dashes, dots or brackets
- then: it's valid; the request carries the bare 10 digits, or "" when blank

### AC27 — Sending shows its state and sends once
- traces: G3
- given: a valid form
- when: the person submits, once or several times quickly
- then: fields become read-only, the button shows "Sending…" and reports itself busy, and exactly one request is made

### AC28 — A server failure keeps everything and offers a retry
- traces: G3
- given: the endpoint returns 500, or fails after the existing automatic retries (429 included)
- when: the attempt ends
- then:
  - an alert reads "We couldn't send your report. Your details are still here. Try again in a minute.";
  - every field keeps its value and the button reads "Try again";
  - a `report_submit_failed` event with reason "server" is sent

### AC29 — Offline sending is refused clearly
- traces: G3
- given: the browser reports it is offline
- when: the person submits a valid form
- then:
  - no request is attempted;
  - an alert reads "You're offline, so the report didn't send. Your details are still here. Try again once you're connected.";
  - fields keep their values;
  - a `report_submit_failed` event with reason "offline" is sent

### AC30 — Success shows the other fixes, in the same order as the email
- traces: G2
- given: the endpoint returns 200
- when: the response arrives
- then:
  - the form is replaced by "Report sent to <email>", which receives focus;
  - below it, the remaining ranked fixes appear in the order of the request's `immediateActions`, whose first item is the free fix;
  - then "The CA Firm DPDPA Starter Checklist is in the same email. If it isn't in your inbox in 5 minutes, check spam.";
  - a "Wrong email? Change it" control returns to the form with every value kept

### AC31 — Consent is still required to send
- traces: G6
- given: the consent box is unticked
- when: the person submits an otherwise valid form
- then: nothing is sent, the consent box is marked with its existing message, and focus moves to it; the consent sentence stays in English in every language

### AC32 — Client-supplied text can't inject markup into the report email
- traces: G3, G6
- given: a request whose name, firm, band, summary, red flags, fixes or answers contain `<`, `>`, `&`, `"` or `'`
- when: the report email is built
- then: those characters appear in the email as text, not markup; legitimate text renders unchanged

### AC33 — Offline is shown without losing anything
- traces: G3
- given: the browser goes offline during the quiz or on the result
- when: the change happens
- then:
  - a banner appears: during the quiz, "You're offline. Keep answering: the scan and your result work without internet. Sending the report needs a connection."; on the result, "You're offline. Your result is all here. Sending the report needs a connection.";
  - a screen reader hears "You're offline." once;
  - when the connection returns, the banner disappears and "You're back online." is announced;
  - on the result, the form keeps its focus and values throughout

### AC34 — It fits and works on a small phone
- traces: G4
- given: a 360 × 740 viewport with touch
- when: every screen and state is shown
- then:
  - no page scrolls sideways;
  - every interactive element in the scan has a tap target at least 44 × 44 px;
  - form inputs use text at least 16 px;
  - answer badges use text at least 12 px;
  - the chat launcher never covers scan content

### AC35 — No automatic accessibility violations
- traces: G4
- given: an automated WCAG 2.2 AA accessibility check
- when: it runs on the first question, a section stamp, the resume card, the result, the result with no red flags, the form with errors, the sending state and the sent state
- then: it reports zero violations

### AC36 — Reduced motion keeps every state and removes movement
- traces: G4
- given: reduced motion is on, or is switched on while the scan is open
- when: the person completes the scan
- then:
  - no element slides, scales, blurs or spins;
  - every state, tick, label and value still appears;
  - a change of the preference mid-scan takes effect without a reload

### AC37 — Funnel events are complete, per sector, and carry no personal data
- traces: G5
- given: a full run, a resumed run, a form error, a failed send and a successful send
- when: events are recorded
- then: each event in the contract fires at its moment with `sector: "ca-firms"`, and no event property contains an answer, a name, a firm name, an email, a phone number or a report token

### AC38 — The release switch selects the scan and rolls back cleanly
- traces: G1
- given: the release switch is off
- when: anyone opens the CA scan
- then:
  - they get today's scan, unchanged;
  - with the switch on, they get the new scan;
  - turning it off again needs no data change

## Non-functional

- **Responsiveness:** the indicator on input responds within 100 ms. Question change finishes within 0.24 s. The result is fully settled within 1.4 s of opening.
- **Stability:** no layout shift when selecting answers or when the scoring button changes state.
- **Smoothness:** animation only moves, fades or clips elements, never resizing them, and holds 60 fps on a mid-range phone.
- **Page weight:** the new scan adds at most 15 KB gzipped of script to the CA scan page.
- **Retention:** saved progress lasts at most 7 days on the device. Nothing is kept on the server until the form is sent.
- **Measurement:** the success criterion is read only once each window has at least 50 starts (A2).

## Out of scope

- The other 11 sector scans, the generic survey and the `/assessment` landing page.
- Scoring, bands, buckets and red-flag rules.
- The report page, the email's look, and checklist content.
- Dark mode.
- Moving consent before the first question (generic survey only).
- Translating new interface text into Hindi beyond keys that fall back to English (see open questions).

## Open questions

- **Q1: Section names, stamp wording and the 0.9 s scoring pause (D1–D3).** Owner Dilip, by 2026-11-10. Blocks AC1, AC9 and AC17 wording only; the behaviour stands.
- **Q2: Rank fixes by the firm's own risk (D4).** Owner Dilip, by 2026-11-10. Blocks AC21 and AC30.
- **Q3: 7-day expiry, and whether resume needs an opt-in (D5, A4).** Owner Dilip, legal review before launch. Blocks AC10–AC13.
- **Q4: Phone optional (D6).** Owner Dilip, by 2026-11-10. Blocks AC26.
- **Q5: Commencement date.** Owner Dilip: confirm 13 May 2027 against the MeitY notification before the switch is turned on. Blocks AC24.
- **Q6: Hindi text for the new strings.** Owner Dilip, before Hindi users see the new scan. Until then, Hindi pages show the English text for new keys, except the legal tier, which is English by design.
