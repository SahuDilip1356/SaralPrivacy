# Intent — CA firm risk scan that people finish

**Status:** draft
**Owner:** Dilip Sahu
**Date:** 2026-11-03
**Source:** `SaralPrivacyHub/Strategy/assessment-lead-magnet/SUBFRAME-MOTION-SPEC.md` v1.0 and `HANDOFF.md`; prototype v5 at https://claude.ai/artifact/4FCLVShM8FvrAV7KNLJZuF

## Problem

People start the free DPDPA readiness scan and leave before the end. In the three months to October 2026, 114 visitors reached the assessment and about one finished. A CA firm partner who opens the scan sees a single progress bar, ten questions with nothing to show for each answer, and a score that only becomes useful after they hand over a name, email and phone number. If they're interrupted, everything they answered is gone. On a phone, the form zooms in, the chat bubble covers answers, and several buttons are too small to tap reliably. The result also states a few legal points more firmly than the Act supports.

## Goals

### G1 — More people who start the CA scan finish it
The share of CA scan starts that reach a result rises clearly above the pre-launch baseline.

### G2 — Finishers get something useful before any form, and more of them ask for the full report
A finisher sees their score, their top risks and one priority fix tied to their own highest-risk area without entering any details; the share who then request the report rises.

### G3 — Nobody loses progress or a lead to an interruption
A reload, a closed tab, going offline, a slow or failed server, private browsing or a double click never costs the person their answers or what they typed into the form.

### G4 — The scan works for everyone
It can be completed by keyboard alone, with a screen reader, with reduced motion turned on, and on a 360 px phone, without losing any information.

### G5 — The change can be measured per sector without collecting personal data
Every funnel step is recorded with its sector, and no answer, name, email or phone number leaves the device for analytics.

### G6 — The result never claims more than the law says
Every legal statement shown names its section and when it applies, and the result says plainly that the score is an educational check, not a certificate or legal advice.

## Non-goals

### NG1 — The other 11 sector scans and the generic survey
The pilot proves the pattern on CA firms first. Rollout is a separate chain, and only if the success criterion is met.

### NG2 — Scoring changes
How the score, bands, buckets and red flags are calculated stays exactly as it is.

### NG3 — Merging the 12 duplicated sector scans into one
Worth doing at rollout, not during a pilot whose outcome is unknown.

### NG4 — Redesigning the report email or the report page
Only the order of the fixes and the safety of what gets inserted into the email change.

### NG5 — Dark mode
The site is light only.

### NG6 — Moving consent off the first screen
That issue belongs to the generic survey. The CA scan already asks for consent on the report form.

## Assumptions

### A1 — Visible progress and value before the form raise completion
- validate_by: completion ratio for the 2 weeks after launch against the 2 weeks before, same sector (week 4 after the analytics change ships)
- if_wrong: keep the accessibility, mobile, legal and resilience fixes, switch the motion layer off with the flag, and test a shorter question set instead

### A2 — The CA scan gets enough starts to read a change in 2 weeks
- validate_by: count of CA scan starts in the 2-week baseline window
- if_wrong: below 50 starts, extend both windows to 4 weeks, or run the pilot on the highest-traffic sector instead

### A3 — Showing one fix for free doesn't reduce report requests
- validate_by: report requests ÷ completions after launch against before
- if_wrong: keep the free fix, but trim its detail line and test a stronger reason to ask for the full plan

### A4 — Keeping answers on the person's own device for 7 days is acceptable without asking first
- validate_by: Dilip's legal review before launch; nothing is sent until the report form is submitted
- if_wrong: offer resume only after the person ticks "Save my progress on this device"

### A5 — The analytics backend accepts the extra event properties on the current plan
- validate_by: send one test event with all properties from a preview build in week 1 and read it in the dashboard
- if_wrong: drop the per-question event first, then any property the plan can't hold

### A6 — Most DPDP Act duties apply from 13 May 2027
- validate_by: check the MeitY commencement notification before launch
- if_wrong: correct the date in every legal line before the flag is turned on

## Success criterion

In the 2 weeks after the new scan is switched on, the CA completion ratio (results shown ÷ scans started) is at least double the ratio in the 2 weeks before, and at least 25% of people who finish request the report.

## Rollback

A build-time flag selects the new scan. Turning the flag off in the hosting environment and redeploying restores today's scan with no data changes. Saved progress sits only in each person's browser under a new, separate key, so the old scan ignores it and it expires on its own after 7 days.
