# Intent — Honour assessment consent choices and record withdrawals

**Status:** draft
**Owner:** Dilip Sahu
**Date:** 2026-10-11

## Problem

SaralPrivacy sells DPDPA compliance, so its own consent handling has to hold up to a look by a client or the Data Protection Board. It doesn't today, in two places.

First, the last screen of the general assessment asks the visitor three things: send my report (required to continue), send me updates, and contact me for a consultation. None of these answers reaches the server. The server acts on the optional boxes from the first screen instead. A visitor who ticks only the required "deliver my report" box gets no report email, and nothing tells us. The consultation answer is never recorded at all. We tell people we'll act on their choice, and we don't.

Second, when someone withdraws email consent, their subscription is switched off but nothing is added to the consent record. The admin Consent Registry, which cites the right to withdraw under Section 6(4), can never show a withdrawal. Its "active" count keeps counting people who have left. If asked to prove that a withdrawal was honoured and when, we can't do it from the consent record.

## Goals

### G1 — What a visitor chooses on the last screen is what we act on
The report, briefings and consultation choices made just before submitting are the ones stored with the assessment and acted on. A visitor who ticks the required report box gets the report email.

### G2 — Every email-consent withdrawal leaves a permanent, auditable record
Each withdrawal produces one consent record showing who withdrew, which purpose, when, and from where, written at the moment the withdrawal is honoured.

### G3 — The Consent Registry tells the truth
An admin reading the registry sees withdrawn consents as withdrawn, and the active count excludes them.

### G4 — Nothing that works today breaks
The 12 industry assessments, the unsubscribe page, the consent-preferences form and mail-client one-click unsubscribe behave exactly as before, apart from the new record.

## Non-goals

### NG1 — Separate consent records for report delivery and consultation
Today only "data processing" and "email marketing" get consent records. Adding per-purpose records for report delivery and follow-up is a real gap, but it's a separate change with its own registry design. Not this cycle (see spec Open questions).

### NG2 — Treating spam complaints and bounces as withdrawals
The mail provider's complaint and bounce events change subscriber status without a consent record. Whether a complaint counts as a legal withdrawal is a policy call. Not this cycle.

### NG3 — Backfilling historic withdrawals
Subscribers who unsubscribed before this ships have a withdrawal time but no consent record. A one-off backfill is cheap but is a data migration. Track it separately.

### NG4 — Re-consent after withdrawal
A past unsubscriber who opts in again is not re-subscribed today. That stays as is.

### NG5 — Cold-outreach unsubscribes
Outreach contacts are a different list with a different legal basis and their own unsubscribe path. Untouched.

### NG6 — Server-side enforcement of the required processing consent
The server records processing consent without checking for a flag from the browser. Hardening that changes the contract for all 13 assessment pages. Not this cycle.

## Assumptions

### A1 — Visitors who tick the required report box at the last step expect the report by email
- validate_by: 14 days after deploy, compare report-email attempts with last-step submissions; expect at least 95% of submissions with the box ticked to have an attempt
- if_wrong: the required box's wording promises something other than an email, and the copy needs rework before the behaviour does

### A2 — Nothing else switches a subscriber to "unsubscribed"
- validate_by: at branch time, re-search the codebase for writers of the unsubscribed status and timestamp (at 2bb9cf5 there is exactly one)
- if_wrong: each extra path needs the same withdrawal record, and the plan gains a task per path

### A3 — The registry's 500-record window covers every consent and withdrawal it needs to pair
- validate_by: count consent records in production before deploy
- if_wrong: if there are more than about 400, pairing in the browser undercounts withdrawals, and the summary has to be computed server-side

### A4 — Renaming the last-step "occasional updates" box to say "daily DPDPA briefings" needs no privacy-notice version bump
- validate_by: Dilip confirms before merge; the new wording describes what already happens on subscribe
- if_wrong: bump the privacy notice version in the same PR and record the new version on new consents

### A5 — Withdrawal records and subscriber records live in the same data backend
- validate_by: confirm the data-backend flag shared by subscribers and consent records in the deployed environment before release
- if_wrong: the two writes can't be reasoned about together, and the failure handling in the spec needs revisiting

## Success criterion

Within 14 days of deploy:
1. 100% of general assessments submitted from the last step have report consent recorded as given and a report-email attempt.
2. Matching subscribers unsubscribed after deploy against withdrawal records gives 0 mismatches: each has exactly one withdrawal record with the same timestamp.

## Rollback

Revert the PR. There is no schema change: every field written already exists, and the new source value is free text. Withdrawal records written while the change was live stay in the log. They're append-only, accurate, and harmless to the reverted code, so no data cleanup is needed.
