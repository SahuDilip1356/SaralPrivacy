# Spec — Honour assessment consent choices and record withdrawals

**Status:** draft
**Intent:** ./intent.md
**Date:** 2026-10-11
**Baseline:** origin/main @ 2bb9cf5 (all "today" statements below were verified at this commit)

## Behavior

**Assessment consent (G1).**
- The general assessment asks for consent twice:
  - on the first screen: one required processing box and two optional boxes (report, briefings);
  - on the last screen, before submit: report delivery (required to submit), briefings, consultation.
- After this change, each purpose has one answer, the visitor's latest.
  - If they tick an optional purpose on the first screen, that box shows as already ticked on the last screen. They can untick it there.
  - If they never ticked it, it is never shown ticked.
- The answers present at submit are what the server receives, stores on the assessment, and acts on: report email, briefing subscription, consultation flag.
- The last-screen briefings box describes what ticking it actually does: daily DPDPA briefings.

**Withdrawal (G2, G3).**
- When an email-consent withdrawal is honoured, one withdrawal record is appended to the consent log, with the same moment as the subscriber's withdrawal time. This happens however the withdrawal arrives:
  - the unsubscribe page;
  - the consent-preferences form;
  - a mail client's one-click button.
- Repeating a withdrawal adds nothing and does not move the original withdrawal time.
- The Consent Registry shows a person's email-marketing consent as withdrawn once a later withdrawal record exists, and excludes it from the active count.

**Unchanged (G4).** The 12 industry assessments and every response the unsubscribe endpoint returns stay exactly as they are.

## Contracts

### POST /api/assessment — unchanged

The request fields and response shapes don't change. What changes is which values the general assessment sends.

```
request (JSON):
  email: string                      required
  name, business, mobile: string     optional
  report_type: string                optional
  answers: object, result: object    optional
  consentReport: boolean             — report-delivery consent
  consentNewsletter: boolean         — daily-briefing consent
  consentFollowup: boolean           — consultation-contact consent
  hp_url: string                     — honeypot, empty for real users
200: { success: true, reportToken: string }
200: { success: true }               — honeypot tripped, nothing stored
400: { error: "Email is required." }
429: { error: string }  + Retry-After header
500: { error: string }
```

### POST /api/subscribers/unsubscribe — unchanged on the wire

```
request: JSON { email: string, sig?: string }
     or: form body "List-Unsubscribe=One-Click", with email + sig in the query string
200: { success: true }                         — withdrawal honoured, or already withdrawn
200: { success: true, already_removed: true }  — no subscriber with that email
400: { error: "email required" }
429: { error: "Too many requests. Try again later or email privacy@saralprivacy.com." } + Retry-After  — unsigned requests only
500: { error: string }                         — subscriber lookup or update failed
GET  → 303 redirect to /unsubscribe with email + sig carried over; never changes state
```

### Storage — new withdrawal record in the consent log

| field | value |
|---|---|
| email | lower-cased, trimmed email (required) |
| name | the subscriber's stored name, or "" |
| source | `"unsubscribe"` (≤ 50 chars, required) |
| consent_type | `"email_marketing"` (required) |
| consent_value | `false` (required) |
| privacy_version | the current privacy-notice version, `"1.0.0"` at baseline (required) |
| timestamp | ISO-8601, identical to the subscriber's new withdrawal time (required) |
| withdrawn_at | the same ISO-8601 value as `timestamp` |
| ip_address, user_agent, city, country, region | taken from the request, in the same way existing consent writers take them; "" when absent |

All fields already exist in the live schema. No migration.

### Storage — subscriber on withdrawal (unchanged)

- `status` becomes `"unsubscribed"`.
- `unsubscribed_at` is set to the withdrawal time, **only when the status was not already `"unsubscribed"`**. This part is new; today the time is overwritten on every request.

### Registry derivation (admin, read-only)

Records are grouped into **consent pairs** by (lower-cased email, consent_type). A pair's **state** comes from its latest record by `timestamp`:

- **active**: the latest record has `consent_value = true` and no `withdrawn_at`;
- **withdrawn**: the latest record has `consent_value = false`, or has `withdrawn_at` set.

The summary counts pairs. The table still lists every record.

## Acceptance criteria

### AC1 — Last-screen choices reach the server and are acted on
- traces: G1
- given: a visitor on the general assessment who ticked only the required processing box on the first screen
- when: on the last screen they enter an email, tick report delivery, briefings and consultation, and submit
- then: the request carries consentReport=true, consentNewsletter=true, consentFollowup=true;
  - the stored assessment has consent_report, consent_newsletter and consent_followup all true;
  - a report email is attempted, and email_sent_at is set on success;
  - an active subscriber exists for the email;
  - one email_marketing consent record with source "assessment_form" is written.

### AC2 — Ticking only the required box at the last screen still gets the report
- traces: G1
- given: a visitor who ticked no optional box on the first screen
- when: on the last screen they tick only report delivery and submit
- then: the request carries consentReport=true, consentNewsletter=false, consentFollowup=false;
  - a report email is attempted;
  - no subscriber is created;
  - no email_marketing consent record is written.

### AC3 — First-screen choices carry forward and can be changed
- traces: G1
- given: a visitor who ticked the briefings box on the first screen
- when: they reach the last screen
- then: the briefings box there is shown ticked.
- and when they untick it and submit, the request carries consentNewsletter=false, and no subscriber is created.

### AC4 — Nothing is ticked that the visitor never ticked
- traces: G1
- given: a visitor who ticked neither optional box on the first screen
- when: the last screen renders
- then: briefings and consultation are unticked;
  - report delivery is unticked unless the first-screen report box was ticked.

### AC5 — Submit still requires email and report-delivery consent; Skip still sends nothing
- traces: G1, G4
- given: the last screen
- when: the email is empty, or the report-delivery box is unticked
- then: the submit button is disabled.
- and when the visitor chooses "Skip — show basic results", no request is sent and nothing is stored or emailed, as today.

### AC6 — The briefings box says what it does
- traces: G1
- given: the last screen in English and in Hindi
- when: it renders
- then: the briefings box text says the visitor will receive daily DPDPA briefings, matching the first-screen wording in substance, not "occasional updates regarding Indian privacy laws";
  - the report-delivery and consultation texts are unchanged.

### AC7 — Industry assessments are unaffected
- traces: G4
- given: any of the 12 industry assessments
- when: a visitor submits it
- then: the request carries exactly what it does at baseline (consentReport=true, consentNewsletter=false, consentFollowup=false), and the stored record and emails are identical to baseline.

### AC8 — A withdrawal writes exactly one consent record
- traces: G2
- given: a subscriber whose status is "active"
- when: a valid POST to the unsubscribe endpoint arrives from any of the three callers (unsubscribe page, consent-preferences form, one-click)
- then: the subscriber's status is "unsubscribed" with unsubscribed_at = T;
  - exactly one withdrawal record matching the Contracts table is in the consent log, with timestamp = withdrawn_at = T;
  - the record is written before the response is sent;
  - the response is 200 { success: true }.

### AC9 — Repeated withdrawal is a no-op
- traces: G2
- given: a subscriber whose status is already "unsubscribed" with unsubscribed_at = T0
- when: the endpoint receives another valid POST for that email
- then: the response is 200 { success: true };
  - unsubscribed_at is still T0;
  - no new consent record is written.

### AC10 — Bounced or complained subscribers can still withdraw, and it is recorded
- traces: G2
- given: a subscriber whose status is "bounced" or "complained"
- when: a valid POST arrives
- then: status becomes "unsubscribed", and exactly one withdrawal record is written, as in AC8.

### AC11 — Unknown email writes nothing
- traces: G2, G4
- given: no subscriber with that email
- when: a valid POST arrives
- then: the response is 200 { success: true, already_removed: true }, and no consent record is written.

### AC12 — A failed consent-log write never blocks the withdrawal
- traces: G2, G4
- given: the consent log is unavailable while the subscriber update succeeds
- when: a valid POST arrives
- then: the subscriber is still "unsubscribed" and the response is still 200 { success: true };
  - one server error line is logged, tagged `[subscribers/unsubscribe] consent_log`, containing the error message but not the email address.

### AC13 — Rejected and non-POST requests change nothing
- traces: G2, G4
- given: any one of these requests:
  - an unsigned POST over the rate limit (429);
  - a POST with no email (400);
  - any GET.
- when: it arrives
- then: the subscriber is unchanged, no consent record is written, and the response matches the Contracts section exactly.

### AC14 — The registry shows withdrawals as withdrawn
- traces: G3
- given: a grant record for X/email_marketing at T1 and a withdrawal record for X/email_marketing at T2 > T1
- when: an admin opens the Consent Registry
- then: X/email_marketing counts once under Withdrawn and not under Active;
  - the per-type rate for email_marketing excludes it from active;
  - both records still appear in the table.

### AC15 — Registry pairing tolerates duplicates and mixed case
- traces: G3
- given: two grant records for "X@Example.com" and "x@example.com", and one withdrawal for "x@example.com" later than both
- when: the registry computes its summary
- then: a single withdrawn pair is counted, and nothing is counted active for that email and type.

### AC16 — A record with no later withdrawal stays active
- traces: G3, G4
- given: a grant record with consent_value=true, no withdrawn_at, and no later record for its pair
- when: the registry computes its summary
- then: the pair counts as active, exactly as today.

### AC17 — The registry can filter and export withdrawals
- traces: G3
- given: the registry with withdrawal records present
- when: the admin picks source "unsubscribe" in the source filter, or exports CSV
- then: the filter lists only withdrawal records, with a badge style distinct from the other sources;
  - the CSV has a "Withdrawn At" column holding withdrawn_at, or "" if absent.

## Non-functional

- **Latency:** the unsubscribe endpoint gains at most one extra consent-log write (expect under 300 ms at p95). No extra reads beyond the subscriber lookup it already does.
- **Privacy:** no new log line contains an email address, IP address or user agent.
- **Backends:** behaviour is identical whichever data backend the subscriber module is set to (Appwrite by default, Supabase by flag).
- **Field limits:**
  - `source`, `consent_type`, `timestamp` and `withdrawn_at` ≤ 50 characters;
  - `user_agent` ≤ 500;
  - `ip_address`, `city`, `country` and `region` ≤ 100. Truncate if longer, never reject.
- **Concurrency:**
  - Two simultaneous valid POSTs for the same active subscriber may, in a narrow race, write two withdrawal records. That is acceptable: AC15 counts them once.
  - No locking is introduced.

## Out of scope

Mirrors intent NG1–NG6, plus:
- Changing the wording or legal basis of the required processing box on the first screen.
- Any change to report-email content, the briefing schedule, or suppression rules.
- Making the existing fire-and-forget consent writes in the assessment and subscribe paths durable. These can be dropped when a serverless function exits early, and that should be fixed separately (OQ5).

## Open questions

- **OQ1** — The 12 industry assessments send consentReport=true with no checkbox. Is there a visible consent statement on those pages that covers report delivery? Owner: Dilip, by 2026-10-18. Blocks nothing here (AC7 keeps today's behaviour).
- **OQ2** — Should a spam complaint from the mail provider count as a consent withdrawal and write a record? Owner: Dilip, by 2026-10-25. Blocks nothing (NG2).
- **OQ3** — Should report delivery and consultation consent get their own consent-log types, so the registry can show them? Owner: Dilip, by 2026-10-25. Blocks nothing (NG1).
- **OQ4** — Backfill withdrawal records for subscribers unsubscribed before release, using their stored unsubscribed_at? Owner: Dilip, by 2026-10-18. Blocks nothing (NG3), but until it's done the registry under-reports historic withdrawals.
- **OQ5** — Should existing fire-and-forget consent writes be awaited? Owner: engineering, next cycle. Blocks nothing.
