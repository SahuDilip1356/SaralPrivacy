---
name: SaralPrivacy
description: DPDPA readiness for Indian businesses, in plain language.
colors:
  # Trust Navy: headings, dark bands, secondary buttons
  navy-50: "#E8ECF2"
  navy-100: "#C5CDD9"
  navy-200: "#9FADBF"
  navy-300: "#7A8DA6"
  navy-400: "#566D8C"
  navy-500: "#354F72"
  navy-600: "#1E3355"
  navy-700: "#121A2E"
  navy-800: "#0D1322"
  navy-900: "#080D17"
  navy-950: "#04060C"
  # Verification Green: the one filled action
  green-50: "#E6FAF4"
  green-100: "#C0F3E2"
  green-200: "#87E9C8"
  green-300: "#4DDCA9"
  green-400: "#1FCC8D"
  green-500: "#07B981"
  green-600: "#059669"
  green-700: "#047857"
  green-800: "#065F46"
  green-900: "#064E3B"
  green-950: "#022C22"
  # Assurance Teal: secondary accent, the dashed "privacy thread"
  teal-50: "#E9F7F7"
  teal-100: "#C7ECEB"
  teal-200: "#9ADAD8"
  teal-300: "#67C8C5"
  teal-400: "#48BAB7"
  teal-500: "#35B6AE"
  teal-600: "#2A9A93"
  teal-700: "#207D78"
  teal-800: "#175F5B"
  teal-900: "#0F4240"
  teal-950: "#072422"
  # Signal Gold: one emphasis per view, and risk (never red)
  gold-50: "#FDF7E8"
  gold-100: "#FAEDC5"
  gold-200: "#F5D98A"
  gold-300: "#EFC24E"
  gold-400: "#E8AB42"
  gold-500: "#D4921F"
  gold-600: "#B07516"
  gold-700: "#8A5A10"
  gold-800: "#64420C"
  gold-900: "#422B08"
  gold-950: "#211505"
  # Cloud: canvas and surfaces
  cloud-25: "#FFFFFF"
  cloud-50: "#F7F9FC"
  cloud-100: "#EEF2F7"
  cloud-200: "#DDE4EF"
  cloud-300: "#C2CEDF"
  cloud-400: "#9AAEC8"
  cloud-500: "#7290B0"
  cloud-600: "#506F94"
  cloud-700: "#3A5270"
  cloud-800: "#26384F"
  cloud-900: "#141F2E"
  cloud-950: "#0A1018"
  # Slate (Tailwind v4): text and form lines
  slate-50: "oklch(98.4% 0.003 247.858)"
  slate-100: "oklch(96.8% 0.007 247.896)"
  slate-200: "oklch(92.9% 0.013 255.508)"
  slate-300: "oklch(86.9% 0.022 252.894)"
  slate-400: "oklch(70.4% 0.04 256.788)"
  slate-500: "oklch(55.4% 0.046 257.417)"
  slate-600: "oklch(44.6% 0.043 257.281)"
  slate-700: "oklch(37.2% 0.044 257.287)"
  slate-800: "oklch(27.9% 0.041 260.031)"
  slate-900: "oklch(20.8% 0.042 265.755)"
  # Semantic (globals.css :root)
  text-primary: "#334155"
  text-secondary: "#64748B"
  warning: "#D99A1F"
  danger: "#C2413A"
  info: "#2563EB"
typography:
  display-1:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display-2:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "clamp(2.125rem, 4vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  display-3:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "clamp(1.875rem, 3.2vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "clamp(1.15rem, 2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  intro:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "1.0625rem"
    lineHeight: 1.65
  body:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"cv01\", \"ss03\""
  label:
    fontFamily: "Inter, Noto Sans Devanagari"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "0.8125rem"
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  pill: "9999px"
spacing:
  beat-1: "96px"
  beat-2: "80px"
  beat-3: "64px"
  beat-4: "56px"
  beat-5: "24px"
components:
  button-primary:
    backgroundColor: "{colors.green-700}"
    textColor: "{colors.cloud-25}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.green-800}"
  button-primary-on-dark:
    backgroundColor: "{colors.green-400}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.navy-700}"
    textColor: "{colors.cloud-25}"
    rounded: "{rounded.sm}"
  button-ghost:
    textColor: "{colors.navy-700}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.cloud-25}"
    textColor: "{colors.slate-900}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.cloud-25}"
    rounded: "{rounded.md}"
  chip-header:
    backgroundColor: "{colors.cloud-25}"
    textColor: "{colors.navy-700}"
    rounded: "{rounded.pill}"
    height: "36px"
---

# Design System: SaralPrivacy

Written 2026-11-01 by scanning the code: `app/globals.css` (Token System v3.0), `components/ui/`
(`Button`, `Surface`, `Input`, `Badge`), `scripts/design-lint.sh` and `HANDOFF_DESIGN.md`. The tokens
above are the rules. The `saralprivacy-brand` skill says what the brand wants; this file says how the
code builds it. Where the two differ, the brand skill wins and this file gets fixed.

## Overview

**Theme: "Quiet Authority"** (the name `LANDING_PAGE_QUIET_AUTHORITY_SPEC.md` gave it).

A small business owner arrives worried about a law they don't understand. The site's job is to calm
them down and get them started. Hierarchy comes from size, tracking and space, not from heavier
strokes or more colour. Cards are flat and separated by a hairline. One green button per view says
what to do next. Nothing glows, nothing loops, and nothing is red.

**Key characteristics:**
- Inter for everything, Noto Sans Devanagari first on Hindi pages.
- Navy for authority, green for the one action, gold for the one emphasis and for risk.
- Depth is fill plus border plus shadow, with the border doing most of the work.
- Every text and surface pairing was measured at 4.5:1 or better, and the numbers live next to the code.

## Colors

Five brand families from `@theme`, slate for text and form lines, and a small semantic set.

### Primary
- **Verification Green** (green-700 `#047857` as a fill, white text at 5.48:1): the one filled action
  per view. On a navy band the action is green-400 with navy-950 text (9.72:1).
- **Trust Navy** (navy-700 `#121A2E`): headings, dark bands, the secondary button.

### Secondary
- **Assurance Teal** (teal-500 `#35B6AE`): the dashed "privacy thread" connectors and quiet accents.
  As text on a light surface only teal-800 passes (7.05:1).

### Tertiary
- **Signal Gold** (gold-400 `#E8AB42`): one emphasis word or chip per view, the header's readiness chip,
  and every risk level. Gold text on light needs gold-700 or darker.

### Neutral
- **Cloud** (cloud-50 `#F7F9FC` canvas, cloud-100 well, cloud-200 hairline, cloud-300 overlay edge):
  surfaces, from `Surface.tsx`.
- **Slate** (text-primary `#334155`, text-secondary `#64748B`, slate-600 for muted text on light,
  slate-300 for form borders): text and form lines. slate-400 is for navy surfaces only (2.4:1 on light).

### Named rules
**The Measured Ink Rule.** No colour pair ships without its contrast number. White on green-500 is
2.54:1 and is banned; it is the reason the primary button is green-700.

**The No Red Rule.** Risk is gold, never red. `danger` (`#C2413A`, 5.1:1 on white) is for field
errors and destructive actions only, never for a score or a risk level.

**The One Voice Rule.** One filled green action per view, one gold emphasis per view.

## Typography

**Display and body font:** Inter (`next/font`), with Noto Sans Devanagari leading on Hindi pages.
**Code font:** the system monospace, for code and generated text blocks only.

**Character:** one family, with weight capped at 600. Emphasis comes from size and tracking.

### Hierarchy
- **Display 1–3** (600, `clamp()` sizes above, line-height 1.05–1.12, tracking -0.02 to -0.015em):
  hero, narrative sections, working sections.
- **Headline / title** (600): the base `h1` to `h3` scale in `globals.css`.
- **Intro** (17px, 1.65): section intro copy.
- **Body** (16px, 1.625, `cv01` and `ss03`): running text, 65–75 characters a line.
- **Label** (13px, 600, sentence case): form labels, chips, controls.
- **Code** (13px monospace): code and generated text blocks.

### Named rules
**The 600 Cap Rule.** No heading heavier than semibold. `design-lint.sh` guards it (`heading-weight`).

**The Devanagari Rule.** On `hi-IN` pages body line-height is at least 1.7, headings at least 1.3,
and letter-spacing is 0 wherever a negative value is set. Matras clip otherwise.

## Layout

Homepage sections follow a beat ladder of 96, 80, 64, 56 and 24px, set by what each beat does
(`LANDING_PAGE_SIGNOFF_SPEC.md`). Two adjacent sections on the same fill must differ in padding,
because that gap is the boundary (`section-rhythm` lint). Light sections alternate white and cloud-200
(1.28:1), never white and cloud-50 (1.05:1, which reads as banding). Most visitors are on 360–430px
phones; every layout is checked there.

## Elevation & Depth

Four rungs, owned by `components/ui/Surface.tsx`: canvas (cloud-50, no edge), sunken (cloud-100,
cloud-200 border, inset shadow), card (white, cloud-200 border, `shadow-card`) and raised (white,
cloud-300 border, `shadow-elevated`, overlays only). A fill step on this canvas measures 1.03–1.07:1;
a hairline measures 1.28–1.59:1. So the border carries depth.

### Shadow vocabulary
- **card** (`0 1px 3px rgb(18 26 46 / .06), 0 1px 2px -1px rgb(18 26 46 / .05)`): resting cards.
- **elevated** (`0 10px 25px -5px rgb(18 26 46 / .12), 0 4px 10px -5px rgb(18 26 46 / .06)`):
  dropdowns, modals, the chat panel.
- **sunken** (`inset 0 1px 2px rgb(18 26 46 / .05)`): wells inside a card.

### Named rules
**The Edge Carries Depth Rule.** Use the `Surface` rung, not a hand-written `bg-white` plus border
(`hand-rolled-surface` lint). No glow: `--shadow-green` was deleted (`cta-glow` lint).

## Shapes

Radius has four steps: **8px** for buttons, inputs and selects, **12px** for cards, dialogs and
panels, **pill** for chips, tags, toggles and small round controls, and **4px** for checkboxes,
progress bars and inline marks only. Nothing else: no 6px, no 16px, no 24px bubbles
(`card-radius` lint counts `rounded-2xl`).

## Components

- **Button** (`components/ui/Button.tsx`): primary, primaryOnDark, secondary, outline, ghost, danger.
  `as="a"` renders a link with the same styles. Focus is a 2px green-700 ring with a 2px offset. On
  a touch screen the minimum height is 44px. Loading swaps the label for a spinner and disables it.
- **Input / Select** (`components/ui/Input.tsx`): 8px radius, slate-300 border, label above, error
  text below and tied to the field.
- **Surface / Card**: the depth ladder above.
- **Header chip** (`.sp-chip`): a pill with a 2.5px navy ring. Readiness alone is filled gold. Focus
  is a white then green-700 ring.
- **Focus, everywhere:** a visible 2px ring at 3:1 or better against its surface, green-700 on light
  and green-400 on navy.

## Do's and Don'ts

### Do
- Build on `Button`, `Surface` and `Input`. A pattern used three or more times for the same job
  becomes a shared part; one used once stays local.
- Name a new token by its job (`ink-on-brand`), not its value.
- Measure every new colour pair and write the ratio next to it.
- Show a score only once there's input to compute it from.

### Don't
- Don't put white on green-500, green-600 text on light, or slate-400 text on light.
- Don't use red for risk, a score or a level.
- Don't hand-write a card surface, or use a radius outside 4 / 8 / 12 / pill.
- Don't animate on a loop. An entrance is allowed; an idle animation isn't.
- Don't start a parallel token set inside a feature's CSS. Map it to these tokens.

### Known drift (measured 2026-11-01)
- **Tailwind `red-*` and `amber-*`** appear about 550 times, mostly in assessment results. The brand
  says risk is gold. Each use is either a field error (move to `danger`) or a risk level (move to gold).
- **`rounded` (4px) and `rounded-md` (6px)** appear about 150 times; only about 10 of them are the
  checkboxes and bars the 4px step is for.
- **`Input.tsx`** uses a green-500 focus ring and red-400, red-500 and red-600 errors, not green-700
  and `danger`.
- **`design-lint.sh`** reads `.tsx` class names only, so feature stylesheets (such as the Notice Pack
  builder's `notice-pack.css`) slip past it. The rendered off-system check in sd-web-design's gate
  covers them.
