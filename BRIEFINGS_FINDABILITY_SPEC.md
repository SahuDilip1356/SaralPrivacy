# Briefings findability — analysis and proposed structure

**Branch:** `claude/briefings-findability` · **docs only, no code changed**
**Question:** a visitor lands on `/briefings`. Can they find the briefing that applies to them?
**Answer:** mostly not, and it gets worse every morning at 09:00 IST.

---

## 0. The short version

Three things are true at once, and each one alone would be survivable:

1. **The page shows almost no briefings.** Three cards above the fold on desktop. **Zero on mobile** — the first card starts at y≈1,000px, more than a full screen below the top.
2. **Nothing on a card says what it is about.** Titles are email subject lines by construction — `generate_content.py:158` asks for *"Max 55 chars. Punchy. Simple words. E.g. 'Are you breaking this new law without knowing?'"*. That headline is then reused as the card title, the `<h1>`, the `<title>` and the slug.
3. **So search can't rescue it.** Measured against a production build at full scale: **"retention" returns 9 briefings where the corpus actually covers 44. "consent" returns 7 where the corpus covers 49.**

Underneath all three is one fact: **the descriptive topic is thrown away at publish time.** The roadmap knows every briefing's topic — *"Insurance brokers: rights grievance and customer response channels"* — and `publish_to_webapp.py` never stores it. Only a mangled first-five-words copy survives in `tags[1..5]`, punctuation included, and nothing searches or shows it.

Restoring that one string fixes scanning and search together. Everything else in this document is structure built on top of it.

---

## 1. What I measured, and what I could not

**Measured**, against a `next build` production server with a mock corpus at real scale
(149 = today's archive, 240 = the full roadmap), Chromium at 1440×900 and 390×844:

| | 149 (today) | 240 (Nov 2026) |
|---|---:|---:|
| Page height, desktop | 30,073px — **33 screens** | 47,835px — **53 screens** |
| Page height, mobile | 83,054px — **98 screens** | 133,766px — **159 screens** |
| Cards above the fold, desktop | **3** | 3 |
| Cards above the fold, mobile | **0** | 0 |
| First card starts at (mobile) | y = 982px | y = 1,006px |
| HTML payload | 780 KB | **1,226 KB** |
| DOM nodes | 5,473 | 8,626 |
| Images | 144 | 229 |

There is no pagination and no virtualisation: every card renders on load.

**Computed**, from `roadmap/90_day_roadmap.csv` + `roadmap/day_91_240_enriched.csv` through the
pipeline's own `derive()`.

**Could not get:** real traffic. Ahrefs and Semrush both return *Insufficient plan* on this
account, and `saralprivacy.com` is outside this environment's egress allowlist, so I could not
see which pages people actually land on or what they search for. Everything below is reasoning
from the corpus and the code, not from behaviour. **A week of Search Console data would test the
core claim cheaply** — if detail pages get impressions on topic queries but no clicks, finding 2
is confirmed from the outside.

**One number is generous, not conservative.** The search-recall test used the roadmap's
descriptive `concept` sentence as the card excerpt. The live excerpt is `preview_text` — *"One
sentence. Max 90 chars. Conversational."* — which carries less topical vocabulary. **Real recall
is lower than the numbers below, not higher.**

---

## 2. Findings

### F1 — The landing view is almost entirely chrome

Before a mobile visitor sees a single briefing they scroll past: the navy hero (~350px), a
three-card featured rail, the search box, three rows of facet chips, and the result count. That
is 982px of furniture in front of the content. On desktop they get three cards.

### F2 — Titles are subject lines, so scanning fails

`generate_content.py:158` specifies the title as a punchy ≤55-character hook. This is right for
an inbox and wrong for an archive. The consequence compounds through every surface:

| Surface | What it shows | What a reader is looking for |
|---|---|---|
| Card title | "Your customer complained. Did anyone listen?" | "insurance broker complaint handling" |
| `<h1>` | same | same |
| `<title>` / SEO | same | same |
| Slug | `2026-03-26-are-you-breaking-this-new-law-without-knowing` | anything nameable |

A person scanning 149 cards for *retention* sees no card with the word *retention* on it.

### F3 — Search finds roughly one in five of the right briefings

`matchesQuery` searches `title + excerpt + fixToday + sectorLabel + stageLabel + formatLabel`.
It does **not** search the body — `why`, `impact`, `affected`, `save` are all stored in the
`why_it_matters` envelope and all invisible to search.

Measured on the production build, 240 cards:

| Query | Briefings the corpus covers | Page returns | Recall |
|---|---:|---:|---:|
| `consent` | 49 | **7** | 14% |
| `retention` | 44 | **9** | 20% |
| `vendor` | 79 | 46 | 58% |
| `insurance` | 5 (a sector) | 5 | **100%** |

The last row is the tell. **Sector search works perfectly** because sector labels are in the
haystack. Topic search fails because topic words are nowhere.

### F4 — Search over-returns on labels

The same haystack means label words and content words are indistinguishable. `fix` returns
**107 of 240**; `checklist` returns **88**. A reader typing a word that happens to be a stage or
format name gets half the archive.

### F5 — The topic string is discarded at write time

`publish_to_webapp.py` builds a rich `why_it_matters` envelope carrying `stage`, `sector`,
`content_type`, `week_theme` and `inf_title` — but not `topic`. The topic survives only as
`tags = [content_type] + topic.split()[:5]`, so day 91 stores
`["stat", "ca", "firms:", "what", "personal"]`: truncated, punctuated, unsearched, unshown.

### F6 — The axis readers identify with is the most buried control

Sector is the one thing an SMB owner knows about themselves without being taught. It is
presented as a 32-option `<select>` at y≈350px, below the featured rail, at `text-xs`. Stage and
Format — both derived, both editorial constructs — get full chip rows above it.

### F7 — Sector × Stage is a diagonal, so the facet grid is mostly empty

Documented in `BRIEFINGS_CARD_SPEC.md` F1 and unchanged: each vertical carries exactly one stage
forever, so **36 of 52** reachable Sector × Stage combinations return nothing. The zero-count
chips are hidden now, which removes the dead end but also means picking a sector makes three of
four stage chips vanish — the filter bar visibly loses controls as you use it.

### F8 — The industry hubs point at the wrong corpus

This is the one I did not expect. Across the 12 industry hubs there are **28 links to briefings,
and all 28 point at 7 legacy seed articles** hardcoded in `lib/data/briefings.ts` from March 2025:

```
12 × /briefings/dpdpa-consent-notice-requirements-2025
 9 × /briefings/rights-of-data-principals-dpdpa-explained
 2 × /briefings/training-institutes-student-data-dpdpa
 2 × /briefings/data-breach-notification-obligations-dpdpa
 1 × each: recruitment-agencies…, d2c-brands…, ca-firms-pan-aadhaar…
```

**Not one links to any of the 149 daily briefings.** A CA firm reading `/industries/ca-firms`
cannot reach the five CA-firm briefings; it is offered a generic consent article instead — the
same article twelve hubs link to. The topic-hub layer already exists, is correctly placed in the
funnel, and is wired to the wrong content.

### F9 — Nothing is addressable

There is no `/briefings/industry/ca-firms`, no `/briefings/topic/retention`. Filter state lives
in React only. So a filtered view cannot be linked from an industry hub, shared in a WhatsApp
group, sent in the newsletter, or indexed. Every arrival starts from the unfiltered wall.

### F10 — It scales the wrong way

Each morning adds a card to a list that already needs 98 mobile screens. By day 240 the page
ships 1.2 MB of HTML and 229 images before a reader has expressed any interest. The archive's
growth is a feature of the product and a liability for this page.

---

## 3. Root cause

`/briefings` is being asked to be three different products, and is built as one of them:

| Job | Reader | What it needs |
|---|---|---|
| **The feed** | a subscriber checking today | one card, dated, latest-first |
| **The reference** | someone with a problem *right now* | search and topic entry |
| **The library** | an SMB owner learning their exposure | a browsable per-sector shelf |

It is built entirely as the feed — reverse chronology, everything rendered — and the other two
jobs are handled by a search box that cannot see topics and a dropdown below the fold.

---

## 4. Proposed structure

### 4.1 Restore the topic string *(do this first)*

Store `topic` on the document and use it in two places: a kicker line above the card title, and
the search haystack. Titles stay hooks — they earn opens and that is their job. The topic line
is what makes them findable.

```
┌──────────────────────────────────┐
│  [ navy mat · infographic ]      │
├──────────────────────────────────┤
│  Insurance brokers · Fix · Checklist   20 Aug · 3 min
│  RIGHTS, GRIEVANCE AND CUSTOMER RESPONSE CHANNELS   ← new: the topic
│  Your customer complained.                          ← unchanged: the hook
│  Did anyone listen?
│  ✓ Fix this today: …
└──────────────────────────────────┘
```

One pipeline field, one line of card markup, one string in `matchesQuery`. It repairs F2, F3 and
F5 at once, and it is the prerequisite for everything below.

### 4.2 Add the missing axis: Topic

Stage, Sector and Format are all **single-valued**. What readers search by is not: a briefing
about *vendor contracts for payroll data* is about vendors **and** employee data. That is why
Topic has to be a multi-valued tag set, not a fourth chip row of the same kind.

Ten clusters, derived from the corpus itself. **Coverage: 215 of 240 briefings (89%), mean 2.0
tags each** — a deliberately tight match; a looser one reaches 93% and 2.7:

| Topic | Briefings | | Topic | Briefings |
|---|---:|---|---|---:|
| Vendors & processors | 79 (32%) | | Retention & deletion | 44 (18%) |
| Data map & inventory | 57 (23%) | | Marketing & messaging | 41 (17%) |
| Breach & incident | 57 (23%) | | Rights & grievance | 40 (16%) |
| Employee & HR data | 51 (21%) | | Access & security | 38 (15%) |
| Consent & notice | 49 (20%) | | Ownership & governance | 30 (12%) |

The 25 with no match are mostly campaign days — *Webinar day*, *Sector recap PDF*, *Announce
readiness sprint*. They are not topics and should not be forced into one.

### 4.3 Split the haystack

Content words search content; labels are chips you click. Search `title + topic + excerpt +
body`, and drop `stageLabel`/`formatLabel` from the string. Fixes F4, and F3 further: the body
fields already carry the vocabulary and are simply unread today.

### 4.4 Make the landing page a directory, not a feed

The wall becomes the *last* thing on the page rather than the first:

```
┌─────────────────────────────────────────────────────────┐
│  DPDPA Daily Briefings                                  │  one line, not a hero
│  [ Search briefings…                                 ]  │  ← above the fold
│  I run a…  [ CA firm ▾ ]   or browse ↓                  │  ← the question they can answer
├─────────────────────────────────────────────────────────┤
│  TODAY · 21 Aug          [ one card ]                   │  the feed job, in one card
├─────────────────────────────────────────────────────────┤
│  START HERE              [ 5 evergreen foundations ]    │  the "I'm new" path
├─────────────────────────────────────────────────────────┤
│  BROWSE BY TOPIC                                        │  the reference job
│  Vendors 79 · Data map 57 · Breach 57 · HR 51 · …       │
├─────────────────────────────────────────────────────────┤
│  BROWSE BY INDUSTRY                                     │  the library job
│  CA firms 5 · Recruitment 5 · Clinics 5 · … (30)        │
├─────────────────────────────────────────────────────────┤
│  ALL BRIEFINGS →                                        │  the wall, paginated, opt-in
└─────────────────────────────────────────────────────────┘
```

The test: **a reader should be one click from a shelf of 5–20 briefings that are all about them**,
instead of zero clicks from 149 that mostly aren't.

### 4.5 Give sectors and topics real URLs

`/briefings/industry/[sector]` and `/briefings/topic/[topic]`. Forty-odd pages, generated from
data already present. This is the highest-value item after 4.1 because one change does four jobs:

- filtered views become **linkable and shareable**
- the industry hubs get something real to link to — **fixes F8**
- each page is an **indexable landing page** on a topical query, which the hook-titled detail
  pages can never be
- it repairs F9 without adding any client state

### 4.6 Paginate the wall

24–36 per page, or infinite scroll with a real `?page=` fallback. F10 stops being a problem the
day this lands rather than in November.

### 4.7 Rewire the industry hubs

Replace the hardcoded legacy slugs with a query on `industries[0]`. Each hub then shows its own
sector's briefings, newest first, plus a link to the sector page from 4.5.

---

## 5. Cost and benefit

| # | Change | Touches | Effort | Fixes |
|---|---|---|---|---|
| 4.1 | Store + show + search `topic` | pipeline, card, search, backfill | **S** | F2 F3 F5 |
| 4.3 | Split the search haystack | search fn | **XS** | F4 |
| 4.5 | Sector + topic routes | new routes | **M** | F8 F9, SEO |
| 4.7 | Hubs query live briefings | 12 hub pages | **S** | F8 |
| 4.4 | Landing page as directory | explorer rewrite | **L** | F1 F6 F10 |
| 4.2 | Topic tags | taxonomy, backfill | **M** | the axis 4.5 needs |
| 4.6 | Paginate | explorer | **S** | F10 |

Everything touching the pipeline needs a run of `backfill_briefing_taxonomy.py` against
production Appwrite — reversible and idempotent, but it needs credentials this environment does
not have.

## 6. Sequencing

1. **4.1 + 4.3** — the topic string and the haystack split. Small, and they fix the measured
   failure. Nothing else is worth doing first.
2. **4.2 + 4.5 + 4.7** — topic tags, then the routes they make possible, then point the hubs at
   them. This is the block that turns the archive into a library.
3. **4.4 + 4.6** — the landing page rebuild and pagination, once there are shelves to send
   people to. Doing this first would just reorganise the same unfindable pile.

## 7. Decisions to make

1. **Topic tag names.** The ten in 4.2 come from the corpus, not from a keyword tool. Worth
   sanity-checking against what customers actually ask — you have that from sales calls and I
   don't.
2. **Does the wall survive at all?** 4.4 keeps "All briefings" as a paginated page. The
   alternative is dropping the exhaustive list entirely and letting search plus the shelves carry
   everything. Cleaner, but it loses the *"we've published 149 of these"* proof.
3. **Do topic pages get editorial intros?** A paragraph at the top of `/briefings/topic/retention`
   is what makes it rank rather than just list. It also makes 40 pages into 40 pieces of writing.
4. **Titles.** This document assumes hooks stay and the topic line carries findability. The other
   option is changing `subject_line` to lead with the topic — better for the archive, worse for
   the email that pays for it. I would keep the hook.
