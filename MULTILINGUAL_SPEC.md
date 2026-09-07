# MULTILINGUAL_SPEC.md — SaralPrivacy 7-Language Transformation

**Status:** v1.2 (2026-09-07) — eng-review passed (v1.1); **D-5 DECIDED: B-lean cut ACTIVE** (Dilip, 2026-09-07). Sequencing reconciled with committed `TRANSFORMATION_SEQUENCE.md` (`docs/transformation-sequence`, `4766287`): the §5 refactors are NOT executed now — they ride the H1 monorepo restructure ("do them once, together"); full 7-language rollout remains H2/R1 post-Gate 3. B-lean = W1 locale infrastructure + W2 Hindi chrome catalog (hand-carried, no pipeline) + W3 QA, shipped dark behind `SHOW_HINDI`, TOFU surfaces only. D-1..D-4 remain open (spec defaults apply).
**Owner:** Dilip Sahu
**Scope basis:** 3-agent deep scan of `webapp/` (2026-08-26) — measured, not estimated
**Sequencing law:** No calendar dates in this spec. Sequence + tentative hours + monitorable steps only.

---

## 0. One-paragraph summary

Transform saralprivacy.com from English-only into 7 languages — English, हिन्दी, ગુજરાતી, मराठी, ಕನ್ನಡ, தமிழ், తెలుగు — without ever editing English content as part of translation. English stays the single source of truth; per-locale **overlay files** carry translations; a **build-time pipeline** (extract → machine-translate → review → emit → verify) produces and maintains them; **per-language × per-surface gates** (the existing `SHOW_HINDI` pattern) control what goes live. Untranslated content always falls back to English — a language can ship at partial coverage and grow weekly without anything breaking.

---

## 1. Goals / Non-goals

### Goals
- G1. Serve real, crawlable, hreflang-linked pages per locale (`/hi/...`, `/ta/...`); English URLs unchanged.
- G2. English remains the only hand-edited content. All other languages are pipeline artifacts + human review.
- G3. Graceful degradation: any untranslated string renders English. No broken/blank states, ever.
- G4. Legal-risk text never ships on machine translation alone (tier gates, §6).
- G5. New English content (briefings, blog, new packs) flows through the same pipeline with zero extra process.

### Non-goals (explicitly out of scope for this spec)
- Admin surfaces (`/admin/**`, admin APIs, 6 admin-alert email templates) — English-only forever. Confirmed excludable: auth-gated, noindex, robots-disallowed.
- Setu **voice** (D8/D9 in `SetuBinduChatBot/HANDOFF_SETU_VOICE_MULTILINGUAL.md`) — separate decision, separate spec.
- Runtime auto-translation (Google-Translate-widget style) — rejected: SEO-invisible, quality-uncontrolled, unacceptable for legal text.
- Translating the DPDP Act statute text (`content/dpdp-act-2023.ts`, 9,060 words) — **source official language versions instead of translating**. Translating legislation ourselves is a legal risk with a free alternative.
- Re-authoring the 17 binary template files (`public/templates/*.pdf|docx|xlsx`) ×7 = 119 binaries — deferred until per-language demand is proven via download analytics.
- Mobile app (separate thread).

---

## 2. Measured inventory (scan of 2026-08-26)

| Bucket | Words | Tier (§6) |
|---|---:|---|
| Data-flow map packs (`lib/data/data-flow/`, 12 sectors, 98 files) | 128,245 | content |
| UI chrome (`app/` + `components/` JSX + strings) | ~31,900 | chrome |
| Industry assessment packs (`lib/data/industry-assessment/`) | 20,866 | content |
| Other `lib/data/` (faqs, learn, glossary, checklist, taxonomy, verdicts…) | ~40,000 | content |
| Discovery dataset (`lib/discovery/data.generated.ts`, 276 niches) | 8,012 | content |
| Statute (`content/dpdp-act-2023.ts`) | 9,060 | **excluded** (§1) |
| Notice pack + consent sentences + retention citations | ~4,000 | **legal** |
| Email templates (user-facing subset of `lib/email-templates.ts`) | ~3,465 | chrome/content |
| Briefings + blog (Appwrite, growing daily) | 60,000–105,000+ | policy (D-1) |
| **In-repo total** | **~235,600** | |

Planning number: **~300–350k source words → ~1.8–2.1M translated words across 6 target languages.** This is why rollout is tiered (§8), never big-bang.

---

## 3. Locale registry — reuse, never rebuild

`lib/data/guide-languages.ts` is the **single locale registry**. It already defines exactly the 7 target languages with `code` (≤5 chars — Appwrite `downloads.language` string(5) invariant), BCP-47 `locale`, `native`, `roman`, and per-language asset resolution with English fallback. Extend it with:

```ts
appLocaleEnabled: boolean   // gate: locale routing live for this language
tier1Live: boolean          // gate: content tier shipped (drives hreflang emission)
```

⛔ Never create a second language list anywhere (no parallel array in next-intl config — derive it from this file). Drift between two registries is the #1 predictable failure.

---

## 4. Architecture

### 4.1 Routing
- **Library:** `next-intl` (App Router native, RSC-compatible). Only new dependency.
- **Structure:** `app/[locale]/` segment wraps existing public pages. Pages are *moved*, not rewritten.
- **Prefix policy:** `localePrefix: "as-needed"` — English keeps today's URLs exactly (protects the 103 indexed pages; no redirect churn); other locales get `/hi/...`, `/gu/...` etc.
- **Detection:** locale from URL prefix only. **No Accept-Language auto-redirect** (Google crawls from en-US; auto-redirect poisons indexing). Optional: a one-time dismissible banner suggesting the user's browser language.
- **Switcher:** in `components/layout/Header.tsx` (every page), chips styled per the existing white-paper chip pattern, `native` names from the registry. Links to the *same page* in the target locale, falling back to the locale home if the page has no translated route yet.

### 4.2 Middleware composition (⚠ trap)
Middleware is **`proxy.ts`** (Next 16 naming), not `middleware.ts`. Locale handling must compose with what's there:
1. Preserve the matcher's `.*\\.` exclusion — `/guides/*.html` and `/templates/*.pdf` must never be locale-rewritten.
2. Order: locale-prefix parse → existing lowercase-308 redirect on the *remainder* path → admin auth gate. Add a test: `/HI/Blog/Foo` resolves in ≤1 redirect hop (no loop).
3. Admin gate logic unchanged; admin routes never get locale prefixes.

### 4.3 String resolution — two mechanisms, one fallback rule

**A. UI chrome → message catalogs.** JSX literals move verbatim into `messages/en.json` (namespaced keys: `home.hero.title`, `assessment.shared.next`). Components call `t()`. English render is pixel-identical — this is extraction, not rewriting. Per-locale `messages/<code>.json` are pipeline artifacts (§7). next-intl's fallback chain: locale → `en`.

**B. Data content → sparse overlays.** English data modules stay untouched. Each gets an optional per-locale overlay of identical shape containing *only* translated fields, merged by one resolver:

```ts
// lib/i18n/resolve.ts
export function localize<T>(en: T, locale: Locale): T {
  if (locale === "en") return en;
  return deepMerge(en, getOverlay(en, locale) ?? {});  // missing field ⇒ English
}
```

Overlay location convention: sibling `i18n/<code>.ts` (e.g. `lib/data/data-flow/clinics/i18n/hi.ts`). Overlays are keyed by **stable IDs** (node id, question id), never by array index — reordering English must not orphan translations.

⛔ **Server-only resolution (bundle-safety rule).** `localize()` runs in Server Components only; overlays load via per-locale dynamic `import()` on the server; client components receive **already-localized props** (matches today's pattern — `DataFlowClient` gets pack data as props). A statically-imported overlay ships every locale's data in every client bundle — with 128k words of pack data ×7 this is a silent bundle catastrophe invisible in dev. Guard: `lib/i18n/resolve.ts` imports `server-only`; verify with a bundle-size check in the P1 gate. Orphan rule: an overlay key whose English entity was deleted is ignored by the resolver and flagged by `verify.mts`.

**Generalize, don't replace, the two existing footholds:** `lib/chat/strings.ts` `t(locale, key)` becomes the chat namespace of the catalog; the notice-pack `H` dictionary (`lib/notice-pack/engine.ts`) widens from `{en, hi}` to all 7.

### 4.4 SEO wiring
- One **locale-aware URL builder** `absoluteUrl(path, locale)` in `lib/i18n/urls.ts` replaces the ~60 hardcoded `https://saralprivacy.com/...` canonical strings. No page constructs its own absolute URL after R3 (§5).
- **hreflang:** `alternates.languages` emitted per page — but **only for locales where that page's surface is live** (registry `tier1Live` + surface gates). Emitting hreflang to an English-fallback page is lying to Google. `x-default` → English. Pattern already proven at `app/white-paper/page.tsx:9-18`.
- **Sitemap:** per-locale entries with `alternates.languages`, same gating. ⚠ Crawl-budget: 17 of 22 commercial URLs are already never-crawled in English; each locale's sitemap entries appear only when its tier gate opens. Never dump 7× URLs on day one.
- **JSON-LD:** pass `inLanguage` (parameter already exists in `lib/schema.tsx`).
- `<html lang>` from locale (currently hardcoded `en-IN` at `app/layout.tsx:56`); `openGraph.locale` likewise.

### 4.5 Typography per script
- Fonts: Noto Sans Devanagari (hi/mr), Noto Sans Gujarati / Kannada / Tamil / Telugu — via `next/font`, subset per locale, loaded only on that locale's pages. (The guide HTMLs already validate these choices.)
- Base layer per non-Latin locale: increase line-height (≥1.7 body, ≥1.3 headings), **remove negative letter-spacing** (Indic scripts break under `-0.02em`).
- ⚠ The `/discovery` `.spd` CSS island (663 lines, own reset, Latin-tuned metrics) needs its **own** typography pass in the island's idiom — per the standing law, never mount app-layer fixes inside it.
- ⚠ Contrast law still applies per locale: heavier Indic glyphs at small sizes can change perceived contrast — run the design-lint/contrast checks on locale pages, not just English.

---

## 5. Pre-i18n refactors (R1–R6) — deferred to the H1 restructure

> ⚠ **v1.2 amendment:** per the committed `TRANSFORMATION_SEQUENCE.md`, these refactors ride the Horizon-1 monorepo restructure (the 12× client dedup and the `packages/` extraction touch the same files — do them once, together). The B-lean cut does **not** execute them; W2 instead swaps the 12 clients' shared strings to `t()` key references (mechanical, keys survive the later merge). This section stands as the definition of the refactors for when H1 reaches them.

These shrink the translation surface and remove structural traps. Each is a separate PR, build + tests green, preview-verified.

| # | Refactor | Why | Tentative hours |
|---|---|---|---:|
| R1 | **Merge 12 assessment clients into one** shared `IndustryAssessmentClient` parameterized by pack (12 files × ~550 LOC, same ~40 strings each; `MICRO_NOTES` + copy move into pack data) | Cuts translation surface 12×; the single largest avoidable multiplier | 10–14 |
| R2 | **Separate stable keys from display strings** — `BandLabel`, `Obligation`, `Bucket`, `RiskBand`, `verdict_band`: introduce enum keys; display text via lookup; map legacy English values stored in Appwrite on read (no destructive migration) | These are simultaneously object keys, UI text, and persisted DB values; translating naively breaks stored reports and colour maps | 6–8 |
| R3 | **Centralize `absoluteUrl(path, locale)`** and sweep the ~60 hardcoded canonicals + duplicated `BASE` constants (sitemap, white-paper, glossary, data-flow, schema) | Locale-aware canonicals/hreflang impossible without it; also fixes the assessment-pages wrong-canonical bug in passing | 4–6 |
| R4 | **De-duplicate drift pairs**: verdict-band descriptions (`lib/data/dpdpa-assessment.ts:99` vs `app/report/[token]/page.tsx:358`), chat `DISCLAIMER` (`orchestrate.ts:49` vs `strings.ts`) | Duplicated English = doubly-translated, guaranteed drift | 1–2 |
| R5 | **`lib/api-errors.ts`** — collapse ~15 duplicated user-facing API error strings across 12 routes into ~8 keyed messages | Server errors surface to users (chat, notice PDF, forms) and must localize | 2–3 |
| R6 | **Relocate content trapped in components** — ~24k words of sector results copy in `app/assessment/*Client.tsx` (absorbed by R1) and `app/industries/*/page.tsx` inline FAQs/copy → `lib/data/` | Content must live in the data layer to get overlays; otherwise it's translated inconsistently with its pack | 6–8 |
| R7 | **Confirm + delete dead code**: `components/assessment/AssessmentWizard.tsx` (imported nowhere) + `lib/data/assessments.ts` (~800 LOC legacy Q&A) | Don't pay to translate a dead engine — verify zero imports first | 1 |

**R-phase total: ~30–42h.** Monitorable exit: build green · all tests green · `grep -r "https://saralprivacy.com" app/ components/` returns ≈0 outside `lib/i18n/urls.ts` · one assessment client file · English site pixel-identical on preview.

---

## 6. Translation-risk tiers (three workflows, never one)

| Tier | Examples | Ship bar |
|---|---|---|
| **chrome** | Nav, footer, buttons, form labels, validation, API errors, email chrome | MT draft + native-speaker spot-check (sampled ~10%) |
| **content** | Learn, FAQ, glossary, checklist, assessment questions, map descriptions, discovery precautions | MT draft + **domain reviewer** full pass (DPDPA-literate, per language) |
| **legal** | Generated privacy notice (`lib/notice-pack/`), consent sentences written to `CONSENT_LOG`, `retention-suggestions.ts` statutory citations, Setu `REGULATORY_CONTEXT` | MT draft + **qualified legal review** per language. Gated per `SHOW_<LANG>` — the flag flips only when review is signed off. `SHOW_HINDI = false` is the existing, correct pattern; flipping it IS the acceptance criterion. |

Tier is assigned **per file** in the extraction manifest, once. Content-trust law applies: DPDPA section citations in translated text must be verified against the source English before a `content`/`legal` string is approved — a translator "fixing" a section number is a defect.

---

## 7. The transformation pipeline (`scripts/i18n/`)

Five scripts, runnable locally and in CI. All artifacts committed to the repo (reviewable, diffable, no external TMS dependency).

### 7.1 `extract.mts`
Walks `messages/en.json` + registered data modules → flat catalog `i18n/catalog.en.jsonl`:
```jsonc
{ "id": "dataflow.clinics.node.reception-desk.description",
  "en": "Patient name, phone and symptoms are first recorded here.",
  "tier": "content", "file": "lib/data/data-flow/clinics/nodes.ts",
  "maxLen": null, "enHash": "a3f9…" }
```
- IDs are stable paths (module + entity id + field), never array indexes.
- `maxLen` set for UI-constrained strings (buttons, chips, badges).
- Registration manifest `i18n/sources.ts` lists which modules/fields are translatable and their tier — additions are one-line.

### 7.2 `translate.mts`
Batches entries with no TM entry or stale `enHash` through the Claude API (`claude-sonnet-5`), per language, with:
- **Do-not-translate list** (`i18n/dnt.txt`): Aadhaar, PAN, GST, TDS, ITR, DPDPA, DPDP Act, Data Fiduciary *(see glossary — translated with English in brackets on first use)*, SaralPrivacy, Setu, Bindu, product names (Tally, Busy, ClearTax, Winman, Razorpay…), all slugs/`report_type` values, URLs, `{placeholders}`.
- **Per-language glossary** (`i18n/glossary/<code>.tsv`): locked renderings of ~50 key legal/product terms, **seeded from the 7 existing guide HTMLs** (~14.8k professionally translated words each — free translation memory).
- Style directive per language: plain-spoken SMB register (the brand voice), not bureaucratic Hindi/Tamil; numerals stay Latin; ₹ amounts and Act citations copied verbatim.
- Writes drafts to `i18n/tm/<code>.json`: `{ id, enHash, text, status: "draft" }`.
- Idempotent + resumable; batch size tuned to stay well under output caps; **cost note: full corpus × 6 languages ≈ low hundreds of USD of tokens.**

### 7.3 `export-review.mts` / `import-review.mts`
- Export per language × tier to a review sheet (CSV/XLSX: id, English, draft, context, file).
- Reviewer edits in place, marks `approved` / `rejected` (+ corrected text).
- Import flips `status` → `reviewed` and records reviewer + date. Legal tier requires a named reviewer; the import refuses anonymous legal approvals.

### 7.4 `emit.mts`
Generates the runtime artifacts from the TM:
- `messages/<code>.json` (chrome tier: `draft`+ allowed; content tier: `reviewed`+; legal tier: `reviewed`+ **and** surface gate open).
- Data overlays `lib/data/**/i18n/<code>.ts` (same status rules).
- Regenerates derived artifacts per locale where their tier is live: `chat-index.<code>.json` via the existing `build-chat-index.mts` over localized sources; discovery data via the xlsx source + `tools/build-discovery-data.py` (⛔ generated files are never hand-edited — `data.generated.ts` and `chat-index.json` carry DO-NOT-EDIT semantics; translation happens at their sources).
- Deterministic output (sorted keys) → clean git diffs.

### 7.5 `verify.mts` (CI gate)
- Every emitted string's `enHash` matches current English (stale → dropped from emit, re-queued; **English edits automatically invalidate and re-queue their translations — you only ever edit English**).
- Placeholder/interpolation tokens identical between English and translation.
- DNT terms present untranslated; Act section citations (regex `[Ss]ection \d+`, `₹\d`) byte-identical.
- `maxLen` respected.
- Coverage report per language × tier × surface (the number the gates read).

### 7.6 TM concurrency rule
TM files (`i18n/tm/<code>.json`) have **one writer: the pipeline scripts** — never hand-edited, never touched by two sessions at once (concurrent-sessions law applies). Emit output is deterministic (sorted keys) so any residual git conflicts are trivial. `translate.mts` is resumable and never leaves a half-written TM (write temp + atomic rename).

**Pipeline build total: ~24–32h.**

---

## 8. Rollout phases (sequence, hours; no dates)

Every phase ends with: build + `tsc` + tests green → **preview deployment → Dilip verifies → explicit go** (absolute law) → merge. No self-merge to main.

### P0 — Refactors R1–R7 (~30–42h)
As §5. Zero user-visible change. *Gate: exit checks in §5.*

### P1 — i18n infrastructure (~16–24h)
`next-intl` + `[locale]` segment + resolver + registry extension + `proxy.ts` composition + fonts + `<html lang>`/OG locale + switcher (hidden behind env flag until P3).
*Gate: English site byte-identical on preview (diff key pages' HTML) · `/hi/` renders full English-fallback pages · no redirect loops (`/HI/Blog/X` test) · guides/templates untouched by middleware · Lighthouse unchanged.*

### P2 — Pipeline (~24–32h)
Scripts 7.1–7.5 + DNT + glossaries seeded from guide HTMLs + CI wiring.
*Gate: extract→translate→emit→verify round-trips one real module end-to-end for Hindi · verify catches a deliberately stale hash and a broken placeholder in tests.*

### P3 — Hindi chrome (~12–16h eng + review)
Extract chrome catalog (~4–6k words): Header/Footer, CTAs (`lib/cta-copy.ts` first — one file covers CTAs sitewide), forms + validation, API errors, user-facing email chrome, chat widget strings (fill the 19 missing `hi` keys; thread real locale through the ~26 `t("en",…)` call sites). Switcher goes live with EN + हिन्दी.
*Gate: navigate the funnel end-to-end in Hindi on preview with zero raw keys and zero layout breaks (Devanagari line-height pass done) · analytics event `locale` dimension firing (verify before merge, per analytics law) · hreflang emitted for exactly the live surfaces.*

### P4 — Hindi content Tier-1 (~epic; review-bound, eng ~16–20h)
Learn (7.6k words), FAQ, glossary, compliance checklist, 12 industry landing pages, one flagship assessment (CA firms) end-to-end including its report page + result email.
*Gate: domain review complete for shipped modules · `report/[token]` renders localized band labels from stored English values (R2 mapping proven) · sitemap + hreflang extended · Setu Option A live for Hindi (answer-language switch + honest "this guide is in English" citation note — corpus still English).*

### P5 — Hindi legal tier + Setu corpus (review-bound; eng ~12–16h)
Complete notice-pack Hindi (`H` gaps: `VENDOR_PURPOSE` 15, `retText` 8, vendor clauses, consent blocks — consolidate the inline `L === "hi"` ternaries into the dictionary first), legal review, **flip `SHOW_HINDI`**. Consent sentences translated → **add `language` column to `CONSENT_LOG` writes in the same PR** (consent log must record which language was agreed to). Setu Option B: translate Tier-1 corpus chunks, add `lang` metadata to Pinecone records, locale filter, per-locale index regeneration (⛔ chat-index ↔ Pinecone lockstep law: upsert and commit together; verify health `chunks` = `records` per namespace). Extend the golden set with Hindi cases — injection-resistance is a model+prompt property; a localized system prompt requires a fresh red-team pass, never inherited.
*Gate: `SHOW_HINDI = true` with signed-off legal review · Hindi golden set passing · red-team rerun clean.*

### P6+ — Languages 3–7 (repeat P3→P5 per language)
Order decided by evidence: guide-PDF download language split (already tracked in Appwrite `DOWNLOADS.language`) + assessment traffic. Each language advances only as its reviewers exist; a language may stop at chrome+Tier-1 indefinitely. Data-flow maps (128k words) and briefings enter only per D-1/D-2 decisions.

---

## 9. Briefings & blog (Appwrite) — needs decision D-1

Options (recommendation: **B**):
- **A. English-only** with a visible "Briefings are published in English" label on locale pages. Zero cost, honest.
- **B. MT-on-publish with disclaimer**: pipeline hook on briefing approve → store `briefings_i18n` sibling docs (`{slug, lang, title, body…}`) → locale page serves translated copy with a "machine-translated" badge; English canonical. ~1–2h/day of pipeline compute, no human review (chrome-tier rules do NOT apply to editorial claims — hence the mandatory badge).
- **C. Weekly digest hand-review**: one reviewed roundup per language per week; long tail stays English.

Whatever is chosen: Appwrite schema gains `language` on the relevant collections (5-char codes per the existing invariant), and localized briefings **never** enter the sitemap until D-1 is settled.

---

## 10. Risks & traps (carry into every build session)

1. `proxy.ts` composition (§4.2) — redirect-loop test is mandatory.
2. Key-as-label unions persisted in Appwrite (R2) — read-side mapping, no destructive migration.
3. Generated files translated at source only (§7.4).
4. Setu lexical fallback `tokenize()` is Latin-only → for non-English queries the BM25 path returns zero hits → refusal floor trips → **Setu refuses everything in Hindi** if Option A ships without either (a) skipping the lexical confidence floor for non-en, or (b) script-aware tokenization. Decide in P4, test explicitly.
5. Industry/intent detection (`INDUSTRY_KEYWORDS`, `NAV_INTENT_RE`, `ESCALATE_RE`, `FRESH_INTENT_RE`, journey `entryKeywords`) is English-regex — per-locale keyword tables or embedding-based detection needed before claiming Setu "works" in a language.
6. Glossary A–Z index (`GlossaryClient` `localeCompare` first-letter grouping) breaks for Indic scripts — per-locale collation + index letters.
7. `.spd` island typography in the island's idiom only.
8. Translated-string length: German-style +30–40% expansion applies to Indic scripts in UI chips/buttons — `maxLen` + visual pass per locale.
9. Crawl budget: hreflang/sitemap emission strictly gated (§4.4); never 7× the URL count in one release.
10. iCloud tree: pipeline runs (`tsc`, batch scripts) from a `/private/tmp` clone when the Desktop tree hangs.
11. Vercel build minutes/ISR: locale pages are mostly static/ISR — watch build time as locales multiply; consider `dynamicParams` + on-demand ISR for long-tail locale pages instead of full SSG.
12. **Invalid locale / unknown slug → real 404.** `/xx/learn` (unregistered locale) must 404, never render English at a bogus URL. Unknown slug under a valid locale must return HTTP 404 status — ⛔ existing project law: `notFound()` inside streaming/`generateMetadata` produces soft-404s; verify status codes with `curl -I`, not just visually.
13. **`/hi/admin` never exists.** proxy strips/refuses locale prefixes on `/admin` and `/api` paths before the auth gate; admin renders English-only at its canonical path.
14. **No RTL handling needed** — none of the 7 languages is right-to-left. Do not build `dir` plumbing.

---

## 11. Acceptance criteria — "language X is live"

### 11.1 Test matrix (built in P1/P2, run in CI thereafter)
- **Unit:** `localize()` — merge, English fallback, empty overlay, orphan-key ignore · `absoluteUrl()` — locale × path × trailing-slash table · `verify.mts` rules — stale hash, placeholder mismatch, DNT violation, maxLen breach (each with a deliberate failing fixture).
- **Integration:** proxy composition — `/HI/Blog/X`, `/xx/learn`, `/hi/admin` resolve with correct status + ≤1 redirect hop · per-page hreflang/sitemap emission matches registry gate state · emit→render round-trip for one module per tier.
- **E2E (per live language):** funnel walk home → industry → assessment → report with zero raw keys · `curl -I` 404-status checks · P1 English byte-diff check (key pages' HTML identical pre/post infra).

A language may be announced only when ALL hold for its shipped tiers:
1. Coverage report: 100% chrome, ≥95% Tier-1 content strings at required status (rest render English by design, not by accident).
2. Funnel walk on **preview** in that language: home → industry page → assessment → email capture → report → result email — zero raw keys, zero layout breaks, correct fonts, contrast checks pass.
3. hreflang + sitemap entries exactly match live surfaces; GSC shows no new soft-404s after the first crawl cycle.
4. Analytics events carry the `locale` dimension (verified firing pre-merge).
5. Legal tier only: named legal reviewer sign-off recorded in the TM; `SHOW_<LANG>` flipped in the same PR as the sign-off note.
6. Setu in that language: golden-set subset passing + red-team rerun (if the system prompt changed for that locale).

---

## 12. Open decisions (Dilip)

| # | Decision | Options | Spec default until decided |
|---|---|---|---|
| D-1 | Briefings/blog policy | §9 A / B / C | A (English + label) |
| D-2 | Data-flow maps (128k words) | translate per-language on demand / MT+badge / stay English | Stay English with label |
| D-3 | Reviewer sourcing per language | CA-partner network / hired freelance legal reviewers / defer language | Language ships chrome-only until reviewer exists |
| D-4 | Language order after Hindi | by guide-download data / by Pounce ICP geography | Read `DOWNLOADS.language` split before choosing |
| D-5 | Sequencing vs Operation Pounce Gate 3 | P0 refactors now (debt reduction) + rest post-Gate-3 / full program now | P0 allowed now; P1+ needs explicit call |

---

## 13. Effort summary (tentative hours, engineering only)

| Phase | Hours |
|---|---:|
| P0 refactors | 30–42 |
| P1 infrastructure | 16–24 |
| P2 pipeline | 24–32 |
| P3 Hindi chrome | 12–16 |
| P4 Hindi Tier-1 (eng share) | 16–20 |
| P5 Hindi legal + Setu corpus (eng share) | 12–16 |
| **Total to first full language** | **110–150** |

Review/translation human-hours are additional and language-dependent; MT token cost for the full corpus ×6 ≈ low hundreds of USD. Each additional language after the machinery exists: roughly P3+P4+P5's review cost with ~30–40% of the engineering.
