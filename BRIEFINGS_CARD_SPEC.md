# Briefing cards + classification — assessment and spec

**Branch:** `claude/briefings-card-design` (parallel to `claude/daily-briefings-topics-qe6lh6`)
**Status:** assessment for decision. Nothing implemented yet.
**Scope:** the `/briefings` explorer card and its three facets — Stage, Sector, Format —
plus the risk chip; the reference is the Pathlock *Featured Resources* card treatment.

---

## 0. The short version

**The classification is real and it is already on the card** — Stage, Sector and a derived
Risk tier all render as chips today. What is *not* on the card is **Format**
(Explainer / Checklist / Playbook / Stat): it filters but never shows, so a reader can
narrow by it and cannot see why a card matched.

So the answer to "can these be added" is yes for Format, and it is a two-line change.
But adding it as it stands would ship a label that does not mean what it says, so this
document argues for fixing four things first. All four are small.

The bigger finding is underneath the UI: **Sector and Stage are collinear.** Each of the 30
industry verticals carries exactly one stage, permanently. 36 of the 52 Sector × Stage
combinations a reader can click today return zero results and always will. That is a content
architecture question, not a CSS one, and it is the one decision worth taking slowly.

On the design: the navy infographic panel and hover zoom both work, but not with
`object-cover`. The infographics are white-background and text-dense — the navy has to be a
**mat around a contained image**, not a background behind a cropped one. That change is what
makes the zoom safe, and it is a better card besides.

---

## 1. What exists today

### 1.1 Where the three facets live

The briefings collection is at attribute capacity, so the taxonomy rides on three existing
Appwrite fields. From `webapp/lib/data/briefing-taxonomy.ts` and its Python mirror
`tools/briefing_taxonomy.py`:

| Facet | Stored in | Values | Derived from |
|---|---|---|---|
| **Stage** | `category` | learn · assess · fix · sustain | `week_theme` (roadmap) |
| **Sector** | `industries[0]` | 30 verticals + `general` | topic prefix before the first `:` |
| **Format** | `tags[0]` | explainer · checklist · playbook · stat | `infographic_type` (+ stage) |
| *Risk* | *not stored* | high · medium | computed from Sector at render time |

`tools/publish_to_webapp.py:187-189` writes all three on every daily publish;
`tools/backfill_briefing_taxonomy.py` reclassified the archive once, idempotently and
reversibly.

### 1.2 Where each one is shown

| Surface | Sector | Stage | Format | Risk |
|---|---|---|---|---|
| Filter chips (`BriefingsExplorer`) | ✅ select | ✅ chips | ✅ chips | ✗ |
| Card (`BriefingCard`) | ✅ chip | ✅ chip | **✗ never shown** | ✅ chip |
| Detail page `/briefings/[slug]` | ✗ | ✗ | ✗ | ✗ |

Two gaps fall straight out of that table: **Format filters but never displays**, and the
**detail page carries no trace of the classification at all** — a reader who filters to "Take
action" and clicks through lands on a page with no sign of why.

### 1.3 The live archive, by the numbers

149 briefings published through day 149 (20 Aug 2026):

| Stage | n | | Format | n | | Sector | n |
|---|---:|---|---|---:|---|---|---:|
| Assess | 80 | | Checklist | 51 | | `general` | 90 |
| Fix | 39 | | Explainer | 47 | | 12 verticals | 59 |
| Learn | 21 | | Stat | 41 | | | |
| Sustain | 9 | | Playbook | 10 | | | |

---

## 2. Findings

### F1 — Sector and Stage are the same axis (structural)

Every industry vertical carries exactly one stage, for all five of its briefings, forever:

| Days | Verticals | Stage they can ever have |
|---|---|---|
| 91–140 | CA firms, recruitment, training institutes, D2C, clinics & labs, schools, law firms, real estate, hospitality, pharmacies | **Assess only** |
| 141–190 | NBFCs, insurance brokers, manufacturing, logistics, retail, restaurants, fitness, IT/SaaS, marketing agencies, consultancies & BPO | **Fix only** |
| 191–240 | hospitals, edtech, marketplaces, housing & proptech, auto dealers, NGOs, media, travel tech, fintech, multi-location | **Sustain only** |

Two consequences.

**For the reader.** A CA firm owner — audience #1 in the brand priority list — gets five
briefings about *what data they hold* and never one about *how to fix it* or *what to do when
someone complains*. Recruitment (#2) and D2C (#3) sit in the same block. The three priority
audiences all get Assess and stop.

**For the UI.** Of the 52 Sector × Stage combinations reachable today, **36 return zero and
always will** (69%). Format chips already hide themselves at count 0
(`BriefingsExplorer.tsx:206`); stage chips do not — they render `Take action 0` and clicking
lands on the empty state. The dead end is one click from the default view.

This is not a bug in the taxonomy code. The taxonomy is reporting the roadmap accurately.
The roadmap fills a diagonal where the facet UI implies a grid.

### F2 — Stage is a restatement of the publish date

Stage is a pure function of `week_theme`, which is a pure function of day number. It carries
no information a reader cannot read off the date. For days 1–90 that is defensible — the
foundational arc genuinely runs Learn → Assess → Fix → Sustain across twelve weeks. For days
91–240 it is a calendar wearing a journey's clothes.

### F3 — Format describes the picture, not the article

`content_type_for()` maps `infographic_type` 1:1 (`stat`→Stat, `process`→Explainer,
`checklist`→Checklist, `timeline`→Playbook), with one nuance: `process` under Sustain becomes
Playbook. So the facet headed **"How I want to use it"** actually answers *what shape is the
infographic*.

A reader who picks "Checklist" is asking for something to take away and work through. They get
an article whose *image* is a checklist. The two often coincide — every briefing carries an
`action_checklist` — but the label is promising something the derivation does not check.

### F4 — Two of the six format values can never occur

`FORMATS` declares six: explainer, checklist, playbook, stat, **case-story**, **myth-buster**.
`derive()` can only ever emit the first four. The last two are unreachable in every briefing
ever published. Day 3 is literally titled *"Myth-buster: We are too small"* and classifies as
`stat`.

The zero-count hide keeps them off screen, so this is vocabulary debt rather than a visible
break — but the taxonomy file reads as if six formats exist.

### F5 — Six genuinely sector-specific briefings are filed as `general`

`sector_for()` only matches a `"Prefix: rest of topic"` shape. Days 75–81 are the *Industry use
cases* week and have no colon:

| Day | Topic | Derived | Should be |
|---:|---|---|---|
| 75 | D2C and ecommerce | `general` | `d2c-brands` |
| 76 | SaaS and startup | `general` | `it-saas` |
| 77 | HR and staffing | `general` | `recruitment` |
| 78 | Healthcare and clinics | `general` | `clinics-labs` |
| 79 | Education | `general` | `training-institutes` |
| 80 | Hospitality and retail | `general` | `hospitality` |

The TS file already documents the intended fix — `match` is described as *"lowercase
topic-prefix substrings the pipeline maps from"* — but the Python implements exact prefix
equality only, never substring matching. The doc describes a feature the code does not have.

### F6 — Risk and Sector are the same chip twice

`riskFor()` is a lookup on sector: 12 sectors are High, everything else Medium. `low` is
declared and never returned. So on the card in production, **"High risk" + "Insurance
brokers"** is two chips carrying one bit — the first is fully implied by the second, and a
reader who learns the rule once never needs the first chip again.

It also means risk is a property of the *industry*, not of the *briefing*. Day 146 (collecting
data too early) and day 149 (complaint handling) are equally "High risk" because both are
insurance-broker pieces.

### F7 — The filter and the card speak different dialects

Filter chips call `stageJtbd()` → **"Understand the law" · "Check my risk" · "Take action" ·
"Maintain compliance"**.
Cards call `stageLabel()` → **"Learn" · "Assess" · "Fix" · "Sustain"**.

Same field, two vocabularies, no bridge on screen. A reader filters *Take action* and every
card that comes back says *Fix*.

### F8 — Format is filterable but invisible

The one facet with no chip on the card. This is the gap you spotted.

---

## 3. Verdict per facet

| Facet | Keep? | What to do |
|---|---|---|
| **Sector** | **Keep — it is the strongest facet.** It is what the reader self-identifies as, it drives the assessment cross-sell, and it is genuinely per-briefing. | Fix F5 (substring fallback + backfill). Relabel `general` on the card — today it is hidden entirely, so 90 of 149 cards show no sector chip at all. |
| **Stage** | **Keep, with honesty.** Real for days 1–90, collinear with Sector for 91–240. | Fix F7 (one vocabulary). Hide zero-count chips (F1). Decide F1's content question separately. |
| **Format** | **Keep, but re-derive first.** As it stands the label is not true. | Derive from the article (§4.3), then add the chip to the card. |
| **Risk** | **Drop from the card, or make it per-briefing.** | Recommendation: drop. It is sector restated, and the space is better spent on Format. Keep `riskFor()` for sorting/prioritisation elsewhere. |

---

## 4. Spec — the changes

### 4.1 The navy infographic panel

**The constraint.** `tools/generate_infographic.py:56-62` generates every infographic as
*"white #FFFFFF background, 600px wide"*, navy + saffron accents, and the type instructions
produce dense layouts — checklists, numbered flows, comparison tables. The card renders them
today at `aspect-[2/1] object-cover`, which crops a ~4:3 image to a letterbox and loses the
bottom third.

So a navy panel behind `object-cover` would never be seen — the image covers it. Navy only
becomes visible if the image is *contained*, which means:

> **The navy is a mat around the infographic, not a background behind it.**

That is a better card anyway: `object-contain` shows the whole infographic instead of a
cropped strip, and the mat gives the composition a frame that a white-on-white card does not.

```
┌────────────────────────────────────────┐
│▓▓▓▓▓▓▓ navy-700 mat · p-3 ▓▓▓▓▓▓▓▓▓▓▓▓│  aspect-[16/9], overflow-hidden
│▓ ┌──────────────────────────────────┐ ▓│
│▓ │  infographic · object-contain    │ ▓│  rounded-md
│▓ │  motion-safe:group-hover:scale   │ ▓│  scale-[1.04], 300ms
│▓ └──────────────────────────────────┘ ▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└────────────────────────────────────────┘
```

Tokens: mat `bg-navy-700` (`#121A2E`, the 45% brand ground); image `rounded-md`; a
`ring-1 ring-white/10` on the image so a white infographic does not fuse with a light section
edge. `bg-navy-800` on hover for a barely-there deepening.

**Why the mat makes the zoom safe.** A 12px mat on a ~380px card gives the image room to grow
into. At `scale-[1.04]` the image expands ~14px total — it consumes the padding and stops. So
the zoom reads as *stepping forward*, and, unlike a zoom on `object-cover`, it never crops
content that was visible a moment ago. This is the whole reason to pair the two changes.

**No-image fallback.** Some days publish without an infographic (`image === ""` — the card
currently renders no panel at all, so those cards are visibly shorter than their neighbours and
the grid goes ragged). Give them the same navy panel carrying the briefing's verdict line in
white — the pattern `app/blog/page.tsx:127-135` already uses. Every card the same height.

**Alt text.** Currently `alt=""` (decorative). Once the panel is the card's most prominent
element that is the wrong call. `inf_title` is already stored on every document
(`publish_to_webapp.py:158`) — use it: `alt="{inf_title} — DPDPA infographic"`.

### 4.2 Hover, motion, and the rest of the card

One hover group on the card, four coordinated responses:

| Element | Rest | Hover |
|---|---|---|
| Infographic | `scale-100` | `scale-[1.04]`, 300ms ease-out, `motion-safe:` only |
| Mat | `bg-navy-700` | `bg-navy-800` |
| Card border | `border-slate-200` | `border-teal-300` *(unchanged)* |
| Title | `text-navy-700` | `text-green-900` *(unchanged)* |

Not proposed: card lift/translate, or a shadow bloom. `docs/DESIGN.md §3` prefers flat with a
hairline border, and `shadow-green` is a lint-banned rule. Duration 300ms matches the existing
precedent at `app/blog/page.tsx:123` and `app/media/press-wall/page.tsx:63` — this is a pattern
the codebase already has, applied to the surface that skipped it.

`prefers-reduced-motion` is handled by the `motion-safe:` prefix, per `DESIGN.md §3`.

### 4.3 Re-deriving Format so the chip can be added

Format should describe what the reader gets, from fields the pipeline already stores:

```
Checklist  — action_checklist has ≥ 5 items                     (the takeaway is a list)
Playbook   — body has ordered/day- or step-numbered structure   (the takeaway is a sequence)
Stat       — headline or infographic leads with a figure        (the takeaway is a number)
Explainer  — everything else                                    (the takeaway is a concept)
```

Deterministic, computed at publish time exactly as today, and the label becomes true. Then
either retire `case-story` and `myth-buster` from `FORMATS` (F4) or add derivation rules for
them — `myth-buster` is cheap: the roadmap already titles them *"Myth-buster: …"*.

Backfill via the existing `backfill_briefing_taxonomy.py` — dry-run, `--apply`, `--revert`.

### 4.4 Proposed card anatomy

```
╔══════════════════════════════════════════════╗
║  NAVY MAT · contained infographic · zoom     ║
╠══════════════════════════════════════════════╣
║  [Insurance brokers] [Fix] [Checklist]       ║  sector · stage · format
║                          20 Aug 2026 · 3 min ║  meta, right-aligned
║                                              ║
║  Your customer complained. Did anyone        ║  h3, navy-700, 2 lines
║  listen?                                     ║
║  If complaints go to your sales team, you    ║  excerpt, 2 lines
║  may be breaking the law.                    ║
║                                              ║
║  ✓ Fix this today: Assign one person to…     ║  green-50 panel
║ ─────────────────────────────────────────── ║
║  Read briefing →        [Get the checklist]  ║  dual CTA, unchanged
╚══════════════════════════════════════════════╝
```

Net chip change: **−1 Risk, +1 Format.** Same chip count, one more bit of information.

Everything below the mat is otherwise unchanged — the fix-today panel and the dual CTA are the
card's strongest features and this spec does not touch them.

### 4.5 What to take from Pathlock, and what not to

| Their move | Take it? | Why |
|---|---|---|
| Large dark image panel as the card's anchor | **Yes** | This is §4.1. It is the thing that makes their row read as one system. |
| Title rendered *into* the artwork | **Partly** | Ours already does — the infographics carry their own headline. Contained (not cropped) is what lets it be read. |
| Big type, generous padding, one text CTA | **No** | Their cards carry no metadata. Ours earn their keep on the chips and the fix-today line; stripping those to look like theirs would cost more than it gains. |
| Horizontal carousel with peeking next card | **Yes — but not here** | A carousel suits ~8 featured items. `/briefings` is a 149-item searchable archive; a carousel would bury it. Apply the carousel to the **homepage** `BriefingsSection` instead, which is exactly Pathlock's use. |

### 4.6 Filter changes

| # | Change | Size |
|---|---|---|
| T1 | Hide zero-count **stage** chips, matching the rule formats already use (`BriefingsExplorer.tsx:206`) — removes the F1 dead end | 1 line |
| T2 | One stage vocabulary on screen: short labels on both chip and filter, JTBD wording demoted to the group hint | ~6 lines |
| T3 | Add Format chip to the card (after §4.3) | ~4 lines |
| T4 | Show `general` as *"All sectors"* rather than suppressing the chip, so 90 cards stop looking unclassified | ~2 lines |
| T5 | Echo sector / stage / format chips on `/briefings/[slug]` | ~15 lines |

---

## 5. Phasing

| Phase | Contents | Touches the daily pipeline? | Risk |
|---|---|---|---|
| **1 — card + filters** | §4.1 navy mat, §4.2 hover, T1, T2, T4, T5 | No | Low. Presentation only; no data migration; revert is a git revert. |
| **2 — format made true** | §4.3 re-derivation, F4 vocabulary, T3 chip | Yes — `briefing_taxonomy.py` + backfill | Medium. Backfill is reversible and idempotent; needs prod Appwrite credentials, which this environment does not have. |
| **3 — sector accuracy** | F5 substring fallback + backfill of days 75–81 | Yes — same two files | Low. 6 documents change. |
| **4 — the diagonal** | F1: decide whether verticals get more than one stage | Roadmap, not code | This is the content decision. Nothing else waits on it. |

Phase 1 stands alone and delivers the thing you asked for. Phases 2–3 make the chips honest.
Phase 4 is a conversation about the editorial plan.

---

## 6. Decisions I need from you

1. **Risk chip — drop it or keep it?** My recommendation is drop (F6): it is Sector restated,
   and Format is a better use of the slot. Keeping it is defensible if "High risk" is doing
   sales work on the card that the sector name alone would not.

2. **Navy mat, or navy card?** The spec proposes a navy *mat* with the body staying white. The
   alternative is the whole card navy with white text, matching the homepage featured card
   (`BriefingsSection.tsx:98`). Three columns of full navy is a lot of weight against
   `cloud-50`, and `DESIGN.md §2` budgets navy at 45% of surface — but it would be the most
   dramatic read of the Pathlock look.

3. **Carousel on the homepage?** §4.5 says yes there, no on `/briefings`. Confirm and I will
   scope it as its own phase.

4. **The diagonal (F1).** Three options: (a) leave it and just hide the dead chips —
   cheapest, honest; (b) extend the roadmap so each vertical eventually gets all three stages —
   30 × 3 × 5 = 450 days, a two-year commitment; (c) reframe Stage as a *foundations-only*
   facet and give the industry blocks a different second axis. My lean is (a) now, (c) when the
   archive next gets restructured.

5. **Infographic palette.** `generate_infographic.py:43-46` still generates against
   `#1B3A5C` navy + `#F4941B` saffron. Neither is in the current brand system
   (`#121A2E` Trust Navy, `#E8AB42` Signal Gold). On a navy mat this drift becomes visible —
   the mat and the image will read as two different navies. Worth a separate ticket; flagging
   it because §4.1 is what surfaces it.

---

## 7. Verification plan for phase 1

- `npm run lint` + `npx tsc --noEmit` in `webapp/`.
- `scripts/design-lint.sh` — must not add to `muted-text-on-light` (the card's date/read-time
  currently uses `text-slate-400`, already in the baseline at 279; the rebuild should take it
  *down*, not up).
- Chromium at 1440 / 768 / 390: hover zoom stays inside the mat, no layout shift, cards in a
  row are equal height with and without infographics.
- Contrast: anything placed on the navy mat measured against `#121A2E` — white is 15.4:1;
  the ring at `white/10` is decorative and exempt.
- `prefers-reduced-motion: reduce` — zoom does not fire.
