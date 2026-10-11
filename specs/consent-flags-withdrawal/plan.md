# Plan — Honour assessment consent choices and record withdrawals

**Status:** accepted for execution (spec draft pending Dilip's sign-off on A4)
**Spec:** ./spec.md
**Date:** 2026-10-11
**Branch:** `fix/consent-flags-withdrawal`, cut from origin/main @ 2bb9cf5
**Worktree:** `webapp/.claude/worktrees/consent-flags-withdrawal`

## Architecture

```
Assessment page (SurveyClient) ──POST /api/assessment──▶ route (unchanged)
   one consent state per purpose; last screen binds to it

Unsubscribe page / preferences form / one-click
   ──POST /api/subscribers/unsubscribe──▶ route
        ├─ findOneByEmail("subscribers")      (existing)
        ├─ skip if already "unsubscribed"     (new)
        ├─ updateDocumentById(status, unsubscribed_at=T)
        └─ await insertDocument("consent_log", buildWithdrawalRecord(...T))   (new)

Admin /admin/consent ── GET /api/admin/data?collection=consent_log ──▶ summariseConsent(records)   (new, pure)
```

New pure modules live in `webapp/lib/consent/`. They have no `next/*` imports and no DB imports, so they run under the repo's existing node:test runner.

## Decisions

- **Bug 1: unify state; don't merge flags.**
  - The last-screen boxes bind to the existing `consentReport` / `consentNewsletter` / `consentFollowup` state, and the duplicate `consentDelivery` / `consentNL` / `consentFU` state is deleted.
  - Rejected alternative: OR-ing the two sets in the payload. With OR, unticking at the last screen can't withdraw a first-screen tick, which breaks AC3.
- **No server change for bug 1.** The route already reads the three flags. The payload shape stays identical, so all 12 industry clients are untouched (AC7).
- **Withdrawal records are append-only.** Earlier grant records are never mutated. The registry derives each pair's state from its latest record.
  - Rejected alternative: stamping `withdrawn_at` on old grants. That mutates audit rows, and the current registry formula would count the withdrawal twice.
- **The withdrawal write is awaited, but failures are swallowed** and logged without PII. A withdrawal must never be blocked (AC12), and a fire-and-forget write can be dropped when the serverless function exits.
- **Write the record only on a real transition** (status ≠ "unsubscribed"), and preserve the original `unsubscribed_at` (AC9).
- **Request metadata** (ip / ua / geo headers) follows the existing writers in `webapp/app/api/assessment/route.ts` lines 60-74: `x-forwarded-for` first hop, `x-vercel-ip-city` (URI-decoded), `x-vercel-ip-country`, `x-vercel-ip-country-region`, and `user-agent`.

## Setup (before T1, not a task)

```bash
cd "webapp/.claude/worktrees/consent-flags-withdrawal/webapp" && npm ci
npx tsc --noEmit 2>&1 | grep -c "error TS" > /tmp/consent-tsc-baseline.txt   # baseline count; verify commands below must not raise it
```

All `verify` commands run from the `webapp/` app directory inside the worktree.

## Tasks

### T1 — Bind last-screen consent boxes to the single consent state
- implements: AC1, AC2, AC3, AC4, AC5
- depends_on: none
- files: webapp/app/[locale]/assessment/SurveyClient.tsx
- risk: tier1
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/consent-tsc-baseline.txt)" -ge && npx eslint "app/[locale]/assessment/SurveyClient.tsx" && ! grep -nE "consentDelivery|consentNL|consentFU|setConsentDelivery|setConsentNL|setConsentFU" "app/[locale]/assessment/SurveyClient.tsx" && grep -q "setConsentFollowup" "app/[locale]/assessment/SurveyClient.tsx"
- notes: |
    At baseline:
    - State is declared at lines 562-565 and duplicated at 580-582.
    - The last-screen boxes are at about lines 1265-1278 (`checked={consentDelivery}` etc.).
    - The submit `disabled` is at about line 1283.
    - The payload is built at 651-662.

    Changes:
    - Last-screen boxes: delivery → `consentReport` / `setConsentReport`; updates → `consentNewsletter` / `setConsentNewsletter`; consult → `consentFollowup` / `setConsentFollowup`.
    - Submit disabled becomes `!contactEmail || !consentReport || submitting`.
    - Delete the three duplicate `useState` lines.
    - Do NOT touch the payload keys, the step-0 UI, the Skip button, or the 12 industry `*AssessmentClient.tsx` files.
    - No checkbox may default to true.

### T2 — Make the last-screen briefings label say "daily DPDPA briefings"
- implements: AC6
- depends_on: none
- files: webapp/messages/en.json, webapp/messages/hi.json
- risk: tier1
- size: S
- verify: node -e 'for (const l of ["en","hi"]) { const m = require("./messages/"+l+".json"); const f = (o) => o && typeof o === "object" ? ("consentUpdates" in o ? o.consentUpdates : Object.values(o).map(f).find(Boolean)) : undefined; const v = f(m); if (!v || /occasional updates/i.test(v)) { console.error(l, v); process.exit(1) } } console.log("ok")'
- notes: |
    - Key: `gate.consentUpdates` (en.json line 658 at baseline; hi.json line 800 is still the untranslated English string).
    - Suggested en: "Send me free daily DPDPA briefings (2-min reads, unsubscribe anytime)." This matches `landing.optNewsletter`.
    - For hi, reuse the substance of hi `landing.optNewsletter` (line 730).
    - Leave `consentDelivery`, `consentConsult` and `dataUseNote` unchanged.
    - A4: Dilip confirms that no privacy-notice version bump is needed before merge.

### T3 — Pure withdrawal-record builder with tests
- implements: AC8, AC9, AC10
- depends_on: none
- files: webapp/lib/consent/withdrawal.ts, webapp/lib/consent/withdrawal.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/withdrawal.test.ts
- notes: |
    Export:
    - `shouldRecordWithdrawal(prevStatus: unknown): boolean`. True for any status other than "unsubscribed", including "active", "bounced", "complained", undefined and "".
    - `buildWithdrawalRecord({ email, name, at, privacyVersion, ip, userAgent, city, country, region })`. Returns exactly the Contracts-table shape:
      - `source: "unsubscribe"`, `consent_type: "email_marketing"`, `consent_value: false`;
      - `timestamp` = `withdrawn_at` = `at`;
      - email trimmed and lower-cased;
      - missing strings become "";
      - truncation per the spec's Non-functional limits.

    Keep it free of imports (pass `privacyVersion` in) so node:test runs it without Next or DB.
    Tests: shape snapshot, email normalisation, truncation at 50/100/500, `shouldRecordWithdrawal` truth table.
    Follow the style of `lib/db/db.test.ts` (node:test + assert/strict).

### T4 — Record withdrawals in the unsubscribe route
- implements: AC8, AC9, AC10, AC11, AC12, AC13
- depends_on: T3
- files: webapp/app/api/subscribers/unsubscribe/route.ts
- risk: tier1
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/consent-tsc-baseline.txt)" -ge && npx eslint app/api/subscribers/unsubscribe/route.ts && node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/withdrawal.test.ts && grep -q 'insertDocument("consent_log"' app/api/subscribers/unsubscribe/route.ts && grep -q "shouldRecordWithdrawal" app/api/subscribers/unsubscribe/route.ts
- notes: |
    After the existing `findOneByEmail("subscribers", …)` (line 44 at baseline):
    - If `!shouldRecordWithdrawal(existing.status)`, return `{ success: true }` without updating. This preserves `unsubscribed_at`.
    - Otherwise, compute `T = new Date().toISOString()` once and use it for both `unsubscribed_at` and the record. Update the subscriber first. Then `await insertDocument("consent_log", buildWithdrawalRecord({...}))` inside its own try/catch that logs `console.error("[subscribers/unsubscribe] consent_log write failed:", msg)`. Never log the email.

    Also:
    - Import `PRIVACY_NOTICE_VERSION` from `@/lib/utils`.
    - Take `name` from `existing.name`.
    - Leave `readTarget`, the sig/rate-limit block, the not-found branch, the 500 catch and `GET` exactly as they are.
    - Consent records and subscribers share the "subscribers" backend module (`lib/db/flags.ts` line 15), so no flag work is needed.

### T5 — Pure registry summary with tests
- implements: AC14, AC15, AC16
- depends_on: none
- files: webapp/lib/consent/registry.ts, webapp/lib/consent/registry.test.ts
- risk: tier1
- size: S
- verify: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/registry.test.ts
- notes: |
    Export `summariseConsent(records, types)`, returning `{ active, withdrawn, totalRecords, byType: [{ type, pairs, active }] }`, using the spec's "Registry derivation" rule:
    - pair key is (email.trim().toLowerCase(), consent_type);
    - latest by `timestamp` (ISO strings compare lexically);
    - withdrawn if the latest has `consent_value === false` or a truthy `withdrawn_at`.

    Tests:
    - grant then withdrawal → withdrawn;
    - withdrawal then a newer grant → active;
    - mixed-case duplicates (AC15);
    - lone grant → active (AC16);
    - a legacy row with `withdrawn_at` → withdrawn.

### T6 — Use the summary in the Consent Registry; add the source filter, badge and CSV column
- implements: AC14, AC17
- depends_on: T5
- files: webapp/app/(backoffice)/admin/consent/page.tsx
- risk: tier1
- size: S
- verify: npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs test "$(cat /tmp/consent-tsc-baseline.txt)" -ge && npx eslint "app/(backoffice)/admin/consent/page.tsx" && grep -q "summariseConsent" "app/(backoffice)/admin/consent/page.tsx" && grep -q '"unsubscribe"' "app/(backoffice)/admin/consent/page.tsx" && grep -q "Withdrawn At" "app/(backoffice)/admin/consent/page.tsx"
- notes: |
    At baseline:
    - The `active` / `withdrawn` / `byType` computations are at lines 63-72. Replace them with `summariseConsent(filtered, CONSENT_TYPES.slice(1))`.
    - "Total" stays the record count.
    - Add "unsubscribe" to `SOURCES` (line 8) and a distinct `SourceBadge` colour.
    - Append "Withdrawn At" to the CSV headers and rows (lines 74-79).

    The table rows stay as they are. Fetch limit stays 500 (A3).

### T7 — End-to-end verification on the Vercel preview
- implements: AC1, AC2, AC3, AC4, AC5, AC7, AC8, AC9, AC11, AC13, AC14
- depends_on: T1, T2, T4, T6
- files: specs/consent-flags-withdrawal/plan.md
- risk: tier1
- size: S
- verify: manual — on the PR's Vercel preview, using a test inbox:
  - (a) General assessment, last screen, required box only → report email arrives, and the admin Assessments row shows consent_report=true, consent_newsletter=false (AC2).
  - (b) Tick briefings on the first screen → it shows ticked on the last screen; untick and submit → no subscriber (AC3, AC4).
  - (c) All three boxes → subscriber is active, and the registry shows email_marketing/assessment_form (AC1).
  - (d) One industry assessment (CA firms) behaves as on production (AC7).
  - (e) Withdraw (c)'s email on /consent-preferences → the registry shows Withdrawn +1 and Active −1 for email_marketing, and the source filter "unsubscribe" shows exactly one row with withdrawn_at = the subscriber's unsubscribed_at (AC8, AC14).
  - (f) Withdraw again → no new row, and unsubscribed_at is unchanged (AC9).
  - (g) Unknown email → "already removed", no row (AC11).
  - (h) `curl -i "<preview>/api/subscribers/unsubscribe?email=<x>"` (a GET) → 303, no change (AC13).

  Record the results under "Verification log" below and tick the tasks.
- notes: |
    - Run against the preview's data backend: Appwrite unless `DATA_BACKEND_SUBSCRIBERS` is set.
    - Delete the test subscriber and consent rows afterwards only through the admin tools; keep the screenshots.
    - AC6, AC10, AC12 and AC15–AC17 are covered by T2, T3, T4 and T5/T6 checks rather than this pass.

## Verification log

_(filled in during T7)_
