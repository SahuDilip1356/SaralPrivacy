# Intent — SaralPrivacy motion system

**Status:** draft
**Owner:** Dilip Sahu
**Date:** 2026-10-25

## Problem

SaralPrivacy asks Indian business owners to trust it with a question that worries
them: "am I breaking the new privacy law?". Most arrive on a mid-range Android phone.
Today the site's motion grew page by page. Some of it explains things well (the home
ecosystem diagram, the data-flow journeys). Some of it loops forever for no reason
(the chat button, live dots, flowing connectors). Some of it hides content until a
script runs (data-flow chips render nearly invisible). And the most explanatory
content on the site (sequences, lifecycles, decision flows in the learn pages and the
7-language guide) is completely static. Each new page change re-decides motion from
scratch, so the site drifts further from one calm, consistent voice.

## Goals

### G1 — Every movement explains something
Any animation a visitor sees shows a sequence, a location, a change, or a
confirmation, and is listed for that page in this spec.

### G2 — Every page reads completely at rest
With scripts off, slow, or reduced motion on, every word, number and diagram on the
page is visible and correct.

### G3 — The site is calm
Nothing moves on its own indefinitely, and consent, legal, penalty and personal-data
form areas never move at all.

### G4 — Motion works for every visitor
The same result in all 7 languages, on touch, with a keyboard, and with assistive
technology.

### G5 — Motion never makes the site slower
Pages stay within the loading, layout-shift and responsiveness limits on a mid-range
Android phone over 4G.

### G6 — One pattern behaves the same everywhere
A score, a counter, a step tracker or a journey line looks and moves identically on
every page that uses it.

### G7 — Numbers and claims that motion draws attention to are consistent
Any figure or claim highlighted by motion shows the same value on every page.

## Non-goals

### NG1 — No rendered video or motion-graphic files
"More engaging" for saralprivacy.com means in-page motion. Video is a separate track.

### NG2 — No layout or copy redesign
Pages keep their current structure and copy, except the specific defects listed in spec.md.

### NG3 — No merge of the 12 sector-scan implementations
They get the same motion behaviour, but consolidating them is a separate refactor.

### NG4 — No new animation runtime
Motion is built with what the site already ships. No additional animation or 3D library.

### NG5 — No localisation of English headings on Hindi tool routes
A known defect, but a translation job with its own spec.

### NG6 — No visuals inside generated briefing and blog bodies
Those bodies come from the content pipeline. Only the page around them is in scope.

### NG7 — No admin pages, no Setu mascot redesign

## Assumptions

### A1 — Most visitors are on phones, many of them low-end Android
- validate_by: device and browser split from site analytics for the last 30 days, recorded in baseline.md (task T3)
- if_wrong: the budgets can relax slightly, but the rules (still zones, once-only, word-level) stand unchanged

### A2 — Explanatory motion helps people understand and act, not just look nicer
- validate_by: per page, compare scroll depth and next-step clicks (assessment start, discovery start) for 14 days before and after that page ships
- if_wrong: that page's motion is switched off through the motion kill switch and the page is re-specified

### A3 — The site's existing animation dependency plus CSS covers every pattern
- validate_by: the component gallery (task T13) shows all shared components working within the per-page JS budget
- if_wrong: the failing pattern is simplified to its still version; no new library is added

### A4 — The main branch of the site repo is what is deployed
- validate_by: compare the production deployment's commit with main before the first page task
- if_wrong: rebase this plan's file paths on the deployed branch first

### A5 — Labels in the guide's infographics can be translated into all 7 languages
- validate_by: Dilip confirms who supplies the translated labels before task T37
- if_wrong: live diagrams ship for English and Hindi; the other 5 languages keep their current images

### A6 — Showing data-flow totals before scripts run is acceptable for the "places so far" counter
- validate_by: Dilip reviews the clinics map at rest during task T23
- if_wrong: the counter shows "—" at rest instead of the total

## Success criterion

By 2027-01-31, every page in plan.md is marked done. The motion checks pass on
every listed route. On the 5 benchmark routes (home, discovery, assessment,
clinics data-flow, learn/consent), mobile performance stays within 3 points of the
baseline in baseline.md, with layout shift ≤ 0.05 and loading ≤ 2.5 s.

## Rollback

- **Per page:** each page ships as its own pull request. Revert that pull request.
- **Site-wide:** one environment switch makes every shared motion component render its
  final still state, with no animation. Flip it in the hosting dashboard and redeploy;
  no code change is needed (built in task T9).
- **Content fixes from Phase 0** are plain copy and data edits, reverted the same way.
