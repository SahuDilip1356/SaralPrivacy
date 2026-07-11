# Briefings Discovery Redesign + Day 91–240 Pipeline Extension — Spec

_Status: Draft for approval · 2026-06-22 · Owner: Dilip_

## 1. Problem

The `/briefings` archive is piling up (~88 live, +150 authored = 238 by mid-pipeline) but
there is **no real taxonomy, no working filters, and no search**:

- Every briefing is stored with `category: "compliance-guidance"` hardcoded
  ([tools/publish_to_webapp.py:174](tools/publish_to_webapp.py)). One bucket for all.
- The pipeline *sends* `week_theme` + `day_number` but the API **drops them** at write time
  ([generate/route.ts:359](webapp/app/api/briefings/generate/route.ts)). The authored
  editorial arc is lost.
- The 6 filter chips on [/briefings](webapp/app/briefings/page.tsx) are decorative
  `<button>`s with no `onClick` — they filter nothing. No search box exists.

Goal: turn the archive into an **operator's knowledge system** — find "school," "consent
notice," "employee data," or "vendor risk" in seconds — for both humans and AI crawlers.
Per design guidelines (alfdesigngroup web-search best practices + SaralPrivacy operator brief).

## 2. Decisions locked (2026-06-22)

| Decision | Choice |
|----------|--------|
| Canonical source | **Google Sheet stays canonical.** I deliver a paste-ready block; Dilip pastes into the Sheet. Local `.xlsx` is a draft only. |
| Scheduling | **Fixed calendar dates.** Each of the 150 rows gets a `Plan Published Date`. Existing date-match logic in `read_roadmap.py` stays unchanged. |
| Existing 88 | **Backfill all.** One-time script re-classifies the live archive so the whole set groups correctly from launch. |

## 3. Taxonomy model (the spine)

Four facets, all **derived deterministically from existing roadmap fields** (week_theme,
topic prefix, concept keywords, infographic_type), with a light LLM pass only for ambiguous
rows. Vocabularies are fixed and small (chips with counts; no long tail).

1. **Theme** (compliance theme) — normalized from `week_theme`. ~8 stable values:
   `Foundations · Consent & Notice · Data Rights · Business Implications · Readiness & Roadmap ·
   Sector Deep-Dives · Enforcement & Risk · Vendors & Breach Response`.
2. **Sector** — parsed from the topic prefix ("CA Firms:", "Schools:", "Hotels:"…). Reuse the
   existing 12-sector vocabulary in [lib/data/sectors.ts](webapp/lib/data/sectors.ts) +
   `All sectors / General`.
3. **Business function** — `HR · Marketing · Finance · IT/Security · Operations · Legal ·
   Leadership · All`. From topic/concept keywords (employee→HR, WhatsApp/marketing→Marketing,
   vendor→IT/Security, breach→IT/Security).
4. **Content type** — `Explainer · Checklist · Mini-audit · Playbook · Case story ·
   Myth-buster · Stat`. From `infographic_type` + topic cues.

**Persistence:** store all four as a single JSON `taxonomy` blob packed into the existing
`tags`/payload — **no new Appwrite attributes or indexes** (the `briefings` collection is
already near attribute capacity; the page fetches every doc, so faceting is client-side).
This sidesteps the capacity/index ceiling entirely.

## 4. Data-flow changes

```
Google Sheet (+4 taxonomy cols + Plan Published Date)
  → read_roadmap.py        carry theme/sector/function/content_type through the row JSON
  → publish_to_webapp.py   STOP hardcoding category; send taxonomy{} (drop the literal)
  → generate/route.ts      persist taxonomy JSON (currently dropped); keep status=approved
  → Appwrite briefings     taxonomy parsed client-side on /briefings
```

## 5. Page redesign — `/briefings` (maps to your guidelines)

- **Default view:** latest briefings in clean editorial cards (unchanged card style).
- **Sticky search:** client-side fuzzy over title + excerpt + summary + tags (all already in
  the fetched payload — no new query infra). Sticks on scroll.
- **Fast facets:** four chip groups — Sector · Theme · Function · Content type — **each with
  live counts**.
- **Applied-filter chips** with counts + **"Clear all."**
- **Featured rails:** "Start here" (Foundations) · "Most relevant for SMBs" · "This week in
  DPDPA" (latest 5).
- **Server still renders the default list** (SEO + crawler-readable HTML preserved).

## 6. SEO / AI-crawler control

- Facets are **client state, no URL change** → zero indexable low-value filter combinations.
- `/briefings` stays the single **clean canonical** archive.
- Add **Article JSON-LD** per briefing detail page + `ItemList` on the archive.
- Optional Phase-2: a handful of **curated, indexable theme/sector hub pages**
  (`/briefings/theme/[theme]`) for high-value queries — kept few and hand-picked.
- Sitemap: keep the flat briefings list; do not emit filter-combo URLs.

## 7. Day 91–240 deliverable (paste-ready)

I generate a single block of 150 rows (days 91–240) with:
`day · week · week_theme · topic · concept · clarification · save_worthy_takeaway ·
publish_channels · infographic_type · research_query` **+ Plan Published Date + 4 taxonomy
columns**. Dates start at the **first open slot after the Sheet's last published day**
(days 87–90 are still pending in the Sheet — Dilip confirms the start date). Dilip pastes
the block into the Google Sheet; the existing pipeline consumes it unchanged.

## 8. Dev plan — milestones

| # | Milestone | Output |
|---|-----------|--------|
| M0 | Taxonomy + page design freeze | Vocabularies + mapping rules; **/plan-design-review ≥8** on the redesigned page before build |
| M1 | Roadmap Sheet block | Paste-ready 150-row block (dates + taxonomy) for the Sheet |
| M2 | Pipeline threading | `read_roadmap.py` + `publish_to_webapp.py` + `generate/route.ts` carry & persist taxonomy; drop the hardcoded category |
| M3 | Backfill script | Idempotent, reversible one-time re-classify of the 88 live briefings |
| M4 | Page redesign | Client-faceted `/briefings`: sticky search, 4 facet groups w/ counts, applied chips + clear-all, rails; server-rendered default |
| M5 | SEO + crawler | Article/ItemList JSON-LD, clean canonical, non-indexable filter state, sitemap |
| M6 | QA + ship | Preview verify → main → prod; check route count grows |

## 9. Risks / open items

- **Appwrite capacity** → mitigated by JSON `taxonomy` field, no new indexes. Verify on M2.
- **Date start** → must reconcile with the Sheet's real last-published day (days 87–90 pending).
- **Backfill** → must be idempotent + reversible (dry-run first, store original category).
- **Search scale** → client-side fine to ~500 items; revisit beyond that.
- **Branch hygiene** → current branch `notice-pack-builder` has unrelated WIP; new branch must
  start clean off `main` (do not carry the notice-pack diff).
