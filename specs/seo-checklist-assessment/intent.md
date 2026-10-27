# Intent — Readable checklist, findable from the law pages, and a clear free-assessment offer

**Status:** draft
**Owner:** Dilip Sahu
**Date:** 2026-10-27

## Problem

The 90-control DPDPA compliance checklist is the page closest to what an SMB
operator searches for when they want to check themselves ("dpdp compliance
checklist", about 300 estimated India searches a month). Today the page's
visible markup carries 6 of the 90 controls; the other 84 sit only inside the
page's script data and reach the screen after a visitor clicks a section open. The page is not in the sitemap, and Google
records only two pages linking to it, so it ranks between 15th and 42nd and
drew 1 click in three months.

The free readiness assessment has the opposite problem. When people ask
ChatGPT or Google's AI answers for a "free DPDPA readiness assessment tool",
both list eight other free tools and never SaralPrivacy. The cited tools all
say near the top what they are: free, how many questions, no sign-up, instant
score. Ours says "3–5 minutes" and leaves the rest for the visitor to find.

Source: SEO Audit and AI Visibility Audit, Oct 27, 2026 (OpenSEO project
"SahuDilip"; local copies in SaralPrivacyHub/SEO/openseo-2026-10-27/).

## Goals

### G1 — Every checklist control is readable without interaction
A search engine or AI crawler that fetches the checklist page receives all 90
controls in the first response, without running scripts or clicking.

### G2 — The checklist can be found from the places that discuss the law
The checklist is listed for search engines and is reachable in one click from
the Act page, the Rules guide and each of the 12 industry pages.

### G3 — The assessment states its offer in the first screen
A visitor, a search engine or an AI system reading the top of the assessment
page learns that it is free, how many questions it has, that no account or
email is needed to see the score, what they get, and that industry versions
exist.

### G4 — Common assessment questions are answered in a machine-readable form
The questions people ask before starting are answered on the page, and the
same answers are published in a form search engines read, matching word for
word.

### G5 — The assessment itself does not change
How the assessment asks for authorization, which questions it asks, and how it
scores are exactly as before.

## Non-goals

### NG1 — No new checklist content
The 90 controls, their wording and citations stay as they are. This cycle only
changes how they are delivered.

### NG2 — No change to the questionnaire, scoring or consent gate
Different problem (assessment completion), tracked separately.

### NG3 — No language-alternate tags and no Hindi sitemap entries
Lighting hreflang is a separate SEO decision already deferred in the code.

### NG4 — No outreach, listings or off-site work
The roundup outreach from the AI audit is a separate, non-code workstream.

### NG5 — No new content on the Rules guide
The dated "which Rules apply when" table is a later content task; this cycle
adds only the link.

## Assumptions

### A1 — Search engines index content that is present in the page but visually collapsed
- validate_by: two weeks after deploy, Search Console URL inspection of /compliance-checklist shows the rendered HTML containing a control from the last section (e.g. 2.O-series), and a site: search for one control's exact wording returns the page
- if_wrong: controls must render expanded by default, which changes the page layout and needs a design pass

### A2 — Missing HTML, sitemap and internal links are what hold the checklist back, not only authority
- validate_by: Search Console average position for "dpdp compliance checklist" six weeks after deploy (baseline: 42.5 average, Jul 24–Oct 24 2026)
- if_wrong: the page needs authority (links from other sites); hand off to link-prospecting and stop on-page work

### A3 — AI engines favour free-tool pages that state the offer in plain text near the top
- validate_by: rerun the 12-prompt AI visibility check in late January 2027 (baseline 0 of 24 answers)
- if_wrong: the gap is authority and listings, not page copy; the roundup outreach becomes the priority

### A4 — The offer claims are true today: 10 core questions, score visible without email, no account
- validate_by: read the assessment flow end to end before writing the copy (plan task T5), and check the claim is derived from the questionnaire, not typed by hand
- if_wrong: the copy changes to match what the flow actually does; nothing ships that the flow does not do

### A5 — Showing all controls in the page does not slow it noticeably
- validate_by: compare the page's HTML size and Lighthouse performance score on the preview deploy against production
- if_wrong: render later sections' controls into the HTML without their decorative markup

## Success criterion

By 2027-01-27, /compliance-checklist receives at least 10 Search Console clicks
in a 28-day window (baseline: 1 click in the 3 months to 2026-10-24).

## Rollback

No data or schema changes. Back out with Vercel's instant rollback to the
previous production deployment, then revert the PR on main. The sitemap entry
and links disappear with the revert; search engines drop the extra content on
their next crawl.
