# Spec — SaralPrivacy motion system

**Status:** draft
**Intent:** ./intent.md
**Date:** 2026-10-25

**Sources this spec applies:**
- House rules: the `sd-web-design` skill's `rules/guardrails.md`. Where this spec is stricter, this spec wins for saralprivacy.com.
- Build recipes: the `sd-web-design` skill's `recipes/` and `catalog/components.md`.
- Page-by-page rationale: the published Motion Catalogue (https://claude.ai/artifact/EpWV1arVKDhhWoAAkwySBw).

## Behavior

Motion on saralprivacy.com is quiet and purposeful.
- **When it plays:** an element animates once, when the visitor first reaches it or when they act on it, and then stays still.
- **What may animate:**
  - lines that show a sequence;
  - counters for neutral facts;
  - ticks that confirm an action;
  - a spotlight on where control breaks;
  - folders that open to show what is inside;
  - smooth reflows when content changes.
- **What never moves:** consent controls, personal-data forms, legal pages, statute text, error messages and rupee amounts.
- **At rest:** every page is complete before any script runs. Animations only move content between visible states.
- **Same everywhere:** behaviour is identical across the 7 languages, touch and keyboard.
- **One per pattern:** each pattern has one shared implementation and appears the same way on every page.

## Contracts

### Motion marker

Every animated element carries `data-sp-motion="<component>"` in the server-rendered HTML.

Allowed values: `journey-line`, `count-up`, `score-reveal`, `status-tracker`, `roadmap-rail`, `spotlight`, `sticky-switch`, `folder-reveal`, `draw-stroke`, `soft-swap`, `reading-progress`, `stack-cards`, `assemble-once`, `headline-rise`, `marquee`.

### Still-zone marker

`data-sp-still` marks a still zone. That element and its descendants carry no `data-sp-motion` and no animation classes.

### Route manifest

A file mapping each route to the motion it may use:
```
{ "<route>": { "allowed": ["<component>", ...], "still_zones": <minimum count:int> } }
```
The audit check fails when a route uses a component that is not in its `allowed` list, or has fewer still zones than `still_zones`.

### Kill switch

A public environment flag, `motion=off`. When set, every shared component renders its final state with no transition.

### Timing tokens

| Token | Value |
|---|---|
| micro | 150–250 ms |
| reveal | 400–700 ms |
| count | ≤ 900 ms |
| stagger | ≤ 60 ms per item, ≤ 600 ms total |
| easing | `cubic-bezier(.22,1,.36,1)` |
| in-view trigger | 30% of the element visible |

### Check exit codes

Both motion checks (static lint, route audit) exit:
- `0` when there are no violations;
- `1` on violations, printing `route | selector | rule id | message` per violation;
- `2` when the route cannot be fetched.

## Acceptance criteria

### Site-wide rules

### AC1 — Only catalogued motion
- traces: G1
- given: a route listed in the route manifest
- when: the audit fetches its server-rendered HTML
- then: every `data-sp-motion` value is in that route's `allowed` list; any other value fails with rule id `M-UNLISTED`

### AC2 — Complete at rest
- traces: G2
- given: a page loaded with scripts disabled
- when: it renders
- then: no element containing text or a diagram has inline opacity below 0.6, `visibility:hidden`, or an off-screen transform; every counter shows its final value; the audit reports `M-HIDDEN` for any breach

### AC3 — Reduced motion shows the end state
- traces: G2, G4
- given: the visitor's system asks for reduced motion
- when: any motion component enters view or is triggered
- then: it shows its final state at once, with no movement (opacity fades ≤ 150 ms allowed)

### AC4 — Nothing loops indefinitely
- traces: G3
- given: any public route, 10 seconds after load
- when: the visitor does nothing
- then: no animation is still running; the static lint finds no infinite animation outside the allowlist (loading-state files only) and reports `M-LOOP` otherwise

### AC5 — Plays once
- traces: G3
- given: a component that has already played on this page view
- when: the visitor scrolls away and back
- then: it does not play again; only an explicit visitor action (tab change, toggle, replay) re-runs it

### AC6 — Still zones stay still
- traces: G3
- given: an element that is a consent control, a personal-data form, an email gate, legal or statute text, a rupee amount, or an error message
- when: the page renders and the visitor interacts
- then: the element is marked as a still zone; it has no motion beyond instant state feedback (focus ring, checked state, validation text appearing); errors do not shake or slide

### AC7 — Rupee amounts never animate
- traces: G3
- given: text containing ₹, "crore" or "lakh"
- when: the page renders
- then: that text is not inside a `count-up`, `score-reveal` or `headline-rise` element; the audit reports `M-RUPEE` otherwise

### AC8 — Word-level text only
- traces: G4
- given: any animated text in any of the 7 languages
- when: it animates
- then: the smallest unit moved is a word or a line; no code splits text into single characters; on Hindi routes the animated text is identical in shape to the static text; the lint reports `M-CHAR` for character splitting

### AC9 — Touch and keyboard parity
- traces: G4
- given: a touch-only device, or a keyboard-only visitor
- when: they use any reveal, folder, accordion, highlight or expand
- then: the same content and result are reachable by tap or Enter/Space; nothing is hover-only; nothing follows the cursor

### AC10 — Assistive technology
- traces: G4
- given: a screen-reader user
- when: a counter runs, a folder opens, an accordion toggles or a filtered list reflows
- then: counters announce only the final value; toggles expose expanded/collapsed state; reflows announce the new result count once, politely

### AC11 — Performance budget
- traces: G5
- given: any page after its motion task ships
- when: measured on a mid-range Android profile over 4G
- then:
  - loading ≤ 2.5 s, layout shift ≤ 0.05, interaction ≤ 200 ms;
  - mobile performance score within 3 points of baseline.md;
  - motion code ≤ 60 KB gzip per page, and the shared components together ≤ 15 KB gzip;
  - only transform, opacity, stroke and clip-path animate;
  - no GPU shader surface outside the optional hero (AC94)

### AC12 — Shared timing
- traces: G6
- given: any motion on any page
- when: it plays
- then: its duration, stagger, easing and in-view trigger come from the timing tokens

### AC13 — One implementation per pattern
- traces: G6
- given: a score gauge, counter, step tracker, journey line, roadmap rail, folder or tick anywhere on the site
- when: the page renders
- then: it is the shared component, marked with its `data-sp-motion` value; no page keeps its own copy of a pattern once that page's task is done

### AC14 — Headline visible at first paint
- traces: G2, G5
- given: a page whose main headline animates
- when: the page first paints
- then: the headline is already legible (opacity ≥ 0.6); the rise is CSS-only, by word, finishes ≤ 700 ms, and does not delay the loading metric

### AC15 — Consistent claims
- traces: G7
- given: any of these is shown on more than one page: media reach, publication count, template count, assessment question count, data storage location
- when: any of those pages renders
- then: all show the same value, taken from one source

### AC16 — Content renders as designed
- traces: G7, G2
- given: the learn topic pages
- when: they render
- then: no raw table markup (`| --- |`) or literal `[ ]` text is visible, and every internal link returns 200

### AC17 — Graceful degradation
- traces: G2
- given: a browser without in-view detection, or a component whose script errors
- when: the page renders
- then: the component shows its final state; the page does not break

### AC18 — Kill switch
- traces: G3, G5
- given: the kill-switch environment flag is set to off
- when: any page renders
- then: every shared component renders its final state with no transition, and the audit still passes

### Global chrome

### AC19 — Chat button calms down
- traces: G3
- given: any page
- when: it loads
- then: the Ask Setu button breathes at most 3 times and then rests; under reduced motion it does not breathe

### Home

### AC20 — Headline rise
- traces: G1, G4
- given: the home page, in English or Hindi
- when: it loads
- then: the H1 rises by word once per AC14; the reading order and the words are unchanged

### AC21 — One emphasis underline
- traces: G1
- given: the home hero
- when: the headline rise finishes
- then: a single gold hand-drawn underline is drawn once under the time promise ("3–5 minutes"); under reduced motion it is already drawn

### AC22 — How-it-works path
- traces: G1, G3
- given: the "How it works" section
- when: it is 30% in view
- then: the connectors between steps draw once in step order (reveal timing) and then stay still; there is no marching or flowing dash afterwards

### AC23 — Sample report re-plays per sector
- traces: G1, G6
- given: the sample report section
- when: the visitor picks a different sector tab
- then:
  - the score ring sweeps and the number counts to the new value;
  - the five bars fill to their new values;
  - the risk band label appears only after the count ends;
  - all within the count token

### AC24 — Home stays calm
- traces: G3
- given: the home page
- when: it is idle
- then:
  - the hero eyebrow dot is static;
  - the hero background is static, unless AC94 is approved;
  - the "Featured in" strip is static while it has fewer than 8 logos

### Discovery

### AC25 — Step tracker
- traces: G1, G6
- given: the 4-step discovery tool
- when: the visitor completes a step
- then:
  - completed steps show a tick drawn once;
  - the current step is filled;
  - later steps are outlined;
  - going back keeps earlier ticks;
  - the connector fill is ≤ 500 ms

### AC26 — Data review collapses smoothly
- traces: G1
- given: step 2's data checklist
- when: the visitor unchecks an item
- then: the item collapses within the micro token and controls above it do not move

### AC27 — Snapshot reveal
- traces: G1, G6
- given: the snapshot result
- when: it appears
- then:
  - the score uses the shared score reveal;
  - the four counts count up once;
  - the metric bars fill once;
  - all values are already present at rest

### AC28 — Discovery Pack folder
- traces: G1, G4
- given: the Discovery Pack section
- when: the visitor taps or presses Enter on the folder
- then:
  - it opens to show its three parts (register, retention matrix, risk register);
  - closed, the folder still names the three parts;
  - it can be closed again

### AC29 — Action plan rail
- traces: G1
- given: the prioritised actions
- when: they are 30% in view
- then: a rail fills once to "Immediate", with "Next 30 days" and "Next 90 days" shown but not filled

### AC30 — Hero card settles
- traces: G3
- given: the discovery hero card
- when: it has played
- then: the dimmed-row pulse runs at most 2 cycles and stops

### AC31 — Discovery still zones
- traces: G3
- given: the CSV email gate and validation messages
- when: they appear
- then: they are still zones per AC6

### Assessment (hub and question flow)

### AC32 — Method path
- traces: G1, G6
- given: the "How it works" 1–4 list on the assessment hub
- when: it is in view
- then: it uses the shared journey line, exactly as on home

### AC33 — Consent stays still
- traces: G3
- given: the start card's authorisation, email-report and briefings checkboxes and the privacy-notice expander
- when: the visitor views or toggles them
- then: they are still zones; the expander opens instantly or with the micro-token height change only

### AC34 — Question change
- traces: G1, G4
- given: the question flow
- when: the visitor moves to the next or previous question
- then:
  - the question card changes by line-level slide or fade within 200 ms;
  - keyboard focus moves to the new question's heading;
  - nothing animates per character

### AC35 — Progress
- traces: G1, G6
- given: the question flow
- when: an answer is given or the visitor goes back
- then: the shared status tracker (bar form) moves to the matching position

### AC36 — Result
- traces: G1, G6
- given: the result screen
- when: it appears
- then:
  - the shared score reveal plays and the band label appears after the count;
  - recommendations show as stacked cards, one idea per card, sticky on scroll;
  - on screens under 640 px wide, they show as a plain list

### Sector risk scans (all 12)

### AC37 — Option confirmation
- traces: G1, G4
- given: any option card
- when: it is selected by tap, click or keyboard
- then: a tick draws within the micro token; deselecting removes it at once

### AC38 — Risk badges are static
- traces: G3
- given: option badges such as HIGH IMPACT, NEEDS REVIEW, CROSS-BORDER
- when: shown
- then: they never pulse, flash or shake

### AC39 — "Why this matters"
- traces: G1
- given: a question's explainer box
- when: the question changes
- then: the box changes together with the question card (AC34), not separately

### AC40 — Result risk map
- traces: G6
- given: any of the 12 sector results
- when: it appears
- then: the score ring, number, band and five dimension bars use the shared score reveal, identical across all 12 sectors

### AC41 — Result gate still
- traces: G3
- given: the "unlock your priority fixes" email gate
- when: shown
- then: it is a still zone

### Notice generator

### AC42 — Changed clause highlight
- traces: G1
- given: the live preview
- when: a form field changes, debounced to 300 ms
- then: the affected clause gets one green wash lasting ≤ 600 ms and scrolls into view inside the preview pane only; the page itself does not scroll

### AC43 — Live dot means "changed"
- traces: G1, G3
- given: the live indicator
- when: the preview changes
- then: the dot pulses once; at all other times it is static

### AC44 — Step pips
- traces: G6
- given: the 8-step form
- when: the visitor moves between steps
- then: the pips use the shared status tracker

### AC45 — Score chip
- traces: G1
- given: the readiness score chip
- when: its value changes
- then: it counts from the old to the new value within the count token, announcing only the final value

### AC46 — Pack assembly
- traces: G1
- given: the visitor reaches the completed Notice Pack for the first time in the session
- when: the output section appears
- then:
  - the notice, mini-notices, consent text and evidence record slide together once (reveal timing);
  - under reduced motion, or on any later visit in the session, it is shown already assembled;
  - the generated notice text itself never moves

### AC47 — Language swap
- traces: G4
- given: the English/Hindi output toggle
- when: it is pressed
- then: the output crossfades within the micro token; nothing changes language on its own

### AC48 — Notice still zones
- traces: G3
- given: advisories, the email-gate modal and the generated legal text
- when: they appear
- then:
  - advisories fade in without shaking;
  - the modal opens with an opacity fade ≤ 150 ms;
  - the generated text is a still zone

### Data mapping hub

### AC49 — Where mapping fits
- traces: G1
- given: the Discover · Map · Assess · Publish row
- when: it is 30% in view
- then: the shared roadmap rail fills once to "Map" and marks it "You are here"

### AC50 — Map card numbers
- traces: G1, G2
- given: the 12 sector cards (places, stages, transfers, control breaks)
- when: they enter view
- then: numbers count up once, staggered per the stagger token; final values are in the HTML

### AC51 — Tile preview on demand
- traces: G4
- given: a sector card
- when: the visitor hovers, focuses or taps its preview control
- then: a short preview of that sector's map appears; the card itself never tilts

### Data-flow journey maps (all 12)

### AC52 — Map legible at rest
- traces: G2
- given: any data-flow map with scripts disabled, or before the visitor scrolls
- when: it renders
- then:
  - every stage card, place chip and hotspot flag has opacity ≥ 0.6;
  - the sticky counters show the map totals (for clinics: 48 places, 8 control breaks)

### AC53 — Journey spine
- traces: G1
- given: the stage timeline
- when: the visitor scrolls through stages
- then:
  - a spine fills in step with the stage reached, and each stage's chips arrive once;
  - the counters show places and breaks reached so far;
  - under reduced motion, the spine is full and static and the counters show totals

### AC54 — Spotlight on control breaks
- traces: G1
- given: a stage flagged "control breaks"
- when: it becomes the active stage
- then:
  - other stage cards dim to 35% and the break card gets a calm red ring;
  - leaving that stage restores everything within the micro token;
  - non-break stages never trigger dimming

### AC55 — Inside/outside boundary follows the text
- traces: G1
- given: a wide screen (≥ 1024 px)
- when: the visitor reads a stage's place chips
- then:
  - the sticky boundary panel highlights which places are inside the business and which are outside;
  - below 1024 px, the panel is shown inline, not sticky

### AC56 — Model switch
- traces: G1, G4
- given: a sector with several operating models
- when: the visitor picks another model
- then: the journey crossfades within the micro token, never slides, and the counters show the new model's values

### AC57 — Hotspots
- traces: G1
- given: the top risk hotspots
- when: the visitor scrolls them
- then: one hotspot card at a time stacks over the previous one (sticky), in calm colours

### AC58 — Rights requests folder
- traces: G1, G4
- given: a rights request such as "Show me everything you hold about me"
- when: it is selected
- then:
  - a folder opens; the systems that must be searched come out as a list;
  - the places the business usually cannot reach stay inside, greyed and labelled;
  - all text is readable at rest

### AC59 — Incident order
- traces: G1
- given: an incident such as "A report was sent to the wrong number"
- when: it is selected
- then:
  - the "First, stop it spreading" steps appear before the "Then, correct it and record it" steps, staggered;
  - all steps are present in the HTML

### AC60 — Leaving the boundary
- traces: G1, G5
- given: the "When it leaves you" explainer
- when: shown
- then:
  - data that leaves the business is shown softened at its outer edge with one static blur layer, limited to that panel;
  - nothing in it moves

### AC61 — Full system map on demand
- traces: G4
- given: "See the full system map"
- when: the visitor taps it or presses Enter
- then: it expands to an enlarged view that closes with Escape or the close button; it never expands on scroll

### AC62 — Stage navigator
- traces: G1, G4
- given: a map with 10 or more stages, on a screen ≥ 1024 px wide
- when: the visitor uses the stage navigator
- then:
  - it shows the current stage of the total and jumps to a chosen stage with native anchors;
  - there is no magnify-to-pointer effect

### Penalties guide

### AC63 — Trigger rail
- traces: G1
- given: the statutory trigger sequence (breach, inquiry, significance, hearing, schedule cap)
- when: it is 30% in view
- then: the shared roadmap rail fills once through the five steps

### AC64 — Penalty figures still
- traces: G3
- given: the schedule, factors, ceiling and role tables
- when: rendered
- then: they are still zones; no rupee figure animates

### Templates, white paper, compliance checklist

### AC65 — Templates folder
- traces: G1, G4
- given: the templates page
- when: the visitor opens the folder
- then: every template comes out as a readable list with its format; after a successful download, a tick draws once beside that template

### AC66 — Lead forms still
- traces: G3
- given: the templates gate, the white-paper form and its three unticked consent boxes
- when: shown or used
- then: they are still zones

### AC67 — Checklist panels and filters
- traces: G1
- given: the 90-control checklist
- when: a panel opens or a filter chip changes
- then: panels change height within the micro token and the list reflows smoothly; under reduced motion the change is instant

### Learn

### AC68 — Learning path
- traces: G1, G6
- given: "New to DPDPA? Start here" on the learn hub
- when: it is in view
- then: the six steps are joined by the shared journey line

### AC69 — Reading progress
- traces: G1
- given: a learn topic, the Act or Rules reference, a guide, or a briefing or blog article
- when: the visitor scrolls
- then:
  - a 2 px line at the top shows how far through the article they are;
  - it is hidden from assistive technology;
  - under reduced motion it updates without easing

### AC70 — Implementation timeline
- traces: G1
- given: /learn/what-is-dpdpa
- when: the timeline (14 Nov 2025 to May 2027) is in view
- then: entries reveal once along a vertical spine, with a "today" marker computed from the current date

### AC71 — One purpose, one consent
- traces: G1
- given: /learn/consent
- when: the visitor presses "Show me"
- then:
  - one bundled consent card splits into separate per-purpose cards;
  - this happens only on click, never automatically;
  - the per-purpose result is also present as text at rest

### AC72 — Consent checklist
- traces: G2, G4
- given: /learn/consent's practical checklist
- when: it renders
- then:
  - the items are real checkboxes, not literal "[ ]";
  - ticking draws a tick within the micro token;
  - nothing is stored or sent

### AC73 — Process steps
- traces: G1, G6
- given: request handling on /learn/rights and implementation steps on /learn/notice
- when: in view
- then: the steps are joined by the shared journey line

### AC74 — Breach timing
- traces: G1, G3
- given: /learn/data-breach notification timing
- when: in view
- then: a roadmap rail fills once through the timing points; there is no ticking clock or countdown

### AC75 — Retention lifecycle
- traces: G1
- given: /learn/retention
- when: in view
- then: collect, use, retain and delete reveal once along a vertical spine that visibly ends at "delete"

### AC76 — Myth to fact
- traces: G1, G2
- given: /learn/myths
- when: each myth enters view
- then:
  - a hand-drawn line strikes through the myth, then the fact fades in;
  - both texts are visible at rest and to assistive technology

### AC77 — Defined terms on demand
- traces: G4
- given: a defined term (e.g. Data Fiduciary) in a learn topic
- when: the visitor hovers, focuses or taps it
- then: a short definition appears with a link to the glossary entry, and closes with Escape

### AC78 — Quiet topics
- traces: G3
- given: /learn/key-terms, /learn/duties, /learn/cross-border, /learn/childrens-data
- when: rendered
- then: they have no motion other than reading progress (AC69) and defined terms (AC77)

### AC79 — Statute navigation
- traces: G1
- given: the Act and Rules references
- when: the visitor scrolls
- then:
  - a marker slides to the current chapter in the sticky contents within the micro token;
  - Rules commencement phases use the shared roadmap rail;
  - statute text and the schedule table are still zones

### DPDPA guide (7 languages)

### AC80 — OPERATE rail
- traces: G1, G4
- given: the OPERATE model chapters
- when: the reader moves through them
- then:
  - a sticky O-P-E-R-A-T-E rail highlights the current part;
  - below 1024 px wide it is a static list at the top of the section;
  - it works in every language

### AC81 — Live diagrams
- traces: G1, G2, G4
- given: the 90-Day Action Plan, Breach Response Clock, Consent/Legitimate-Use Flow, Children's Data Decision Tree and Industry Risk Heatmap
- when: in view
- then:
  - each is a diagram with selectable, translatable text that draws or fills once;
  - the clock is a fill-once rail, not a countdown;
  - languages without translated labels keep their current image (assumption A5)

### AC82 — Guide reading aids
- traces: G1
- given: any guide language
- when: the reader scrolls
- then: reading progress (AC69) shows; the 26-item contents stays a plain list of anchors

### Glossary and FAQ

### AC83 — Filter reflow
- traces: G1, G4
- given: the glossary search or category filter
- when: it changes
- then:
  - cards glide to their new positions within the micro token, with no jump;
  - the new count is announced once;
  - under reduced motion the change is instant

### AC84 — Arriving at a term
- traces: G1
- given: a link to a glossary term
- when: the page opens at that term
- then: the term card gets one wash ≤ 600 ms

### AC85 — FAQ accordion
- traces: G1, G4
- given: any FAQ accordion (FAQ page, home preview, industry pages)
- when: a question is toggled
- then:
  - the answer opens or closes within the micro token and the chevron rotates;
  - the control exposes its expanded state

### Industries

### AC86 — Data-type chips
- traces: G1
- given: an industry page hero
- when: it loads
- then: the data-type chips arrive once with the stagger token and are visible at rest

### AC87 — Stats match the map
- traces: G1, G7
- given: the "See where data actually travels" stat row
- when: it enters view
- then: the numbers count up once, and equal that sector's data-flow map totals from the same source

### AC88 — Scan steps and checklist
- traces: G1, G6
- given: "How the 3-minute scan works" and the checklist preview
- when: in view
- then: the steps use the shared journey line, and the checklist ticks draw once in order

### Briefings and blog

### AC89 — Briefings hub calm
- traces: G3
- given: the "Published every morning" badge
- when: shown
- then: its dot is static

### AC90 — Personalised reorder
- traces: G1, G4
- given: the "I work in … and …" sentence filter, or the blog lane filter
- when: the visitor changes a choice
- then: the content glides to its new order and the change is announced once

### AC91 — The run
- traces: G1
- given: the calendar of daily briefings
- when: it enters view
- then:
  - cells fill in date order once and the total of mornings counts up;
  - choosing a topic to highlight crossfades matching cells

### AC92 — Article infographic
- traces: G4
- given: an article with an infographic
- when: the visitor taps it
- then: it opens enlarged and closes with Escape or the close button; the article body has no other motion

### About, contact, media

### AC93 — About and contact
- traces: G1, G3
- given: About's Understand → Discover → Assess → Act, and Contact's "What to expect"
- when: in view
- then:
  - About uses the shared journey line;
  - Contact uses the status tracker in its static style;
  - the founder card, the consultation form and its consent box are still zones;
  - a successful submission shows a tick once

### AC94 — Optional hero atmosphere
- traces: G1, G5
- given: Dilip has approved a hero background (open question Q1)
- when: the home page loads
- then:
  - one calm background (Mesh Drift, Aurora or Pastel Gradient, low intensity, behind a navy scrim) starts after the loading metric;
  - it pauses off-screen and when the tab is hidden, and ignores the pointer;
  - it shows a static gradient under reduced motion or without GPU support

### AC95 — Media figures
- traces: G7, G1
- given: AC15 is satisfied for media reach
- when: the media stats enter view
- then:
  - they count up once;
  - the press wall stays a still grid;
  - the logo strip on home and About becomes a slow marquee only once it has 8 or more logos, with a pause button, pausing on hover and focus, and static under reduced motion

### Legal pages

### AC96 — Legal pages still
- traces: G3
- given: /privacy, /terms, /rights and its sub-pages, /consent-preferences, /unsubscribe
- when: rendered and used
- then:
  - their content is a still zone;
  - the only motion is a tick drawn once after a successful unsubscribe, withdrawal or rights request

### Trust prerequisites (fix before that page's motion)

### AC97 — Storage location stated once
- traces: G7
- given: the Privacy Notice
- when: rendered
- then: the processor list and the storage section name the same storage location, from one source

### AC98 — Media reach reconciled
- traces: G7
- given: /media and /media/press-wall
- when: rendered
- then: reach and publication figures match (AC15), and the coverage list counts only publishers

### AC99 — Learn content fixed
- traces: G7
- given: what-is-dpdpa, applicability, data-breach, consent, myths
- when: rendered
- then:
  - tables render as tables;
  - the checklist is real checkboxes (AC72);
  - the myths related-topic link resolves (AC16)

### AC100 — Counts agree
- traces: G7
- given: the template count on home vs /resources, and the assessment question count in the blog vs the industry pages
- when: rendered
- then: each pair shows the same number

## Non-functional

| Limit | Value |
|---|---|
| Loading (LCP) | ≤ 2.5 s |
| Layout shift (CLS) | ≤ 0.05 |
| Interaction (INP) | ≤ 200 ms |
| Profile | mid-range Android, 4G |
| Motion JavaScript per page | ≤ 60 KB gzip |
| Shared motion components, together | ≤ 15 KB gzip |
| GPU shader surface | none, except AC94 (one, on home) |
| Flashing | never more than 3 times per second |
| Contrast over any moving element | ≥ 4.5:1 at every frame |
| Auto-moving content longer than 5 s | needs a pause control (AC95 marquee only) |

## Out of scope

Mirrors intent.md NG1–NG7. Also out of scope:
- text animated per letter of any kind;
- cursor-following effects;
- auto-cycling carousels or decks beyond the two that already exist on home;
- pinned horizontal scrolling;
- countdowns.

## Open questions

- **Q1 — Hero atmosphere.** Should the home hero get a background (Mesh Drift, Aurora or Pastel Gradient)? Owner: Dilip. Due: 2026-11-30. Blocks AC94 only.
- **Q2 — Guide label translations.** Who supplies translated diagram labels for gu, mr, kn, ta and te? Owner: Dilip. Due: before T37. Narrows AC81.
- **Q3 — Media reach.** Which reach figure is correct (609M+ or 56M+), and how is it defined? Owner: Dilip. Due: before T4. Blocks AC95, AC98.
- **Q4 — Storage location wording.** Mumbai, Singapore, or "migrating"? Owner: Dilip, as DPO. Due: before T4. Blocks AC97.
- **Q5 — Assessment start card.** Does the authorisation checkbox fit the home promise "no email to start"? Owner: Dilip. Due: before T16. Copy question only; AC33 holds either way.
