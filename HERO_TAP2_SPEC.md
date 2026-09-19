# Hero tap #2 — question → band → pre-filled assessment · spec

**Status:** design-reviewed. Pass 1 7.4 → fixes → pass 2 8.1 → 9+ set folded in → **projected 9.0/10 · PROCEED**. §9 decisions accepted (recommended defaults, 2026-09-14).
**Scope:** the homepage hero snapshot card (Beat 1) and a pre-fill seam into the 12 assessment clients.
**Lane:** pre-Gate-3 conversion slice #1 (of 4). No new tool, no new sector, no new route.
**Language:** **English first, built through the locale layer** (PR #34). Hindi is a later catalog-only phase — see §6.1.
**Read with:** `webapp/components/home/HeroSection.tsx`, `webapp/lib/data/hero-verdicts.ts`, `webapp/i18n/request.ts`, `THREAD_HANDOFF_SCALE_AND_MIGRATION.md` §4.

---

## 1 · The problem in one line

The hero already does tap #1: pick a chip → the snapshot card flips from *Sample* to a sector read with a **typical** band (`hero-verdicts.ts`, illustrative by design). The visitor is then asked to start a 10-question assessment cold. The funnel baseline (PR #27) says starts, not infra, are the bottleneck. Tap #2 adds one sector-true yes/no inside the card, so the read becomes *directionally theirs* and the assessment opens with that answer already ticked.

## 2 · What the visitor sees (card states)

| State | Trigger | Card body, top → bottom | Exits |
|---|---|---|---|
| **S0 Sample** | page load, or "other business" | unchanged: `ScoreDial 41` + "Pick your business on the left" | left CTA → `/assessment` |
| **S1 Typical** *(exists)* | chip picked, sector has **no** question authored | unchanged: applies-to · `riskLine` · **Typical risk · band** · First fix · real-score line + `#report` anchor | left CTA → `/assessment/<sector>` |
| **S2 Question** *(new)* | chip picked, sector has a question | applies-to · `riskLine` · **Typical risk · band** · **question row** (eyebrow *One question sharpens this read* · question · **Yes / No**) · First fix · real-score line + `#report` anchor | left CTA → `/assessment/<sector>` |
| **S3 Answered** *(new)* | Yes or No pressed | ~~applies-to~~ (dropped — already known) · answer line (`yesLine`/`noLine`) · **Typical risk · band** (band + chip weight step, fade-up) · clause line *for a CA firm that receives documents over WhatsApp* · answered row *You said yes · Change* · First fix · **See your real score →** (same href as the left CTA; `#report` anchor removed) | **one destination, two entry points:** `/assessment/<sector>?pre=<qid>:<opt>&src=hero` (Yes) or `?src=hero` (No). Left CTA label → *See your real score*. |

Rules:
- The gold band row is the eye's landing point in every state. The question sits **after** it, read as the way to sharpen it — never above it, where gold would pull the eye past the ask.
- Changing the chip resets S3 → S2 (or S1) for the new sector.
- **Return state:** `{slug, answer}` is written to `sessionStorage` on answer (wrapped in try/catch). On mount, a valid stored pair restores S3, so a visitor who clicks through and presses Back finds their answer, not S0. Unreadable/invalid storage → S0, silently.
- The word **typical** never leaves the card. S3 is a narrower *typical*, not a score. The real-score line stays.
- 9 non-hero sectors: rows may carry a question (data completeness) but the hero renders only `PRIORITY_SLUGS`; a row without a question renders S1 forever.

## 3 · The question is a pack question, not a hero invention

The 3 hero chips each have a real intake/channel question with a WhatsApp option in their pack (`lib/data/industry-assessment/packs/*`). The hero asks a yes/no wrapper of that question; **Yes** pre-selects that option in the real assessment; **No** pre-fills nothing (absence is not an answer in a multi-select).

| Hero chip | Pack question (verified) | Option pre-selected on Yes |
|---|---|---|
| CA firm | `ca-firms` **q3** multi · bucket `intake` · "How do clients usually send documents to your firm?" | `whatsapp` |
| Recruitment agency | `recruitment` **q2** multi · bucket `candidate_sourcing` · "Where do candidate profiles usually come from?" | `whatsapp_referrals` |
| D2C brand | `d2c-brands` **q1** multi · bucket `customer_data_collection` · "How does your brand sell to customers?" | `instagram_whatsapp` |

Other packs with a WhatsApp channel option, for later rows: clinics q3, fintech q3, hotels q4, law q3, pharmacies q4, real-estate q4 (all `whatsapp`). Gyms q3, schools q5, training q4 have no channel option — word their rows against *that* pack row when authored. A test enforces every row's `pre.questionId` + `pre.optionId` exists in its pack.

### 3.1 Band movement is authored, not computed

Running the engine on one answer is meaningless (normalised by Σcaps). Each row states its outcome:
- `yesBand` = one step **up** from `band`, capped at High. `noBand` = one step **down**, floored at Moderate.
- Test: `noBand ≤ band ≤ yesBand` on `Moderate | Moderate–High | High` (type unchanged).
- Test: for every row that carries a question, **`yesBand ≠ noBand`** — both answers must visibly move the band. This is what caught CA (below).

**CA re-authored: typical `High` → `Moderate–High`.** At `High`, a Yes could not move the band (capped), so the flagship chip's worse answer changed words but not the object the eye is on. `Moderate–High` is also the more honest typical — not every CA firm is High. ⚠️ Visible beyond the hero: `AudienceCards` reads the same field, so the CA sector card's band changes there too (consistent by construction — one source).

### 3.2 Copy (English — lives in `messages/en.json`, never in the data file)

`yesLine`/`noLine` are lifted from the same sector's `VERDICT_PREVIEWS.topGaps`, so the hero never claims something the report doesn't produce.

| Sector | Question | Yes → band · line | No → band · line |
|---|---|---|---|
| CA firm (typical Mod–High) | Do clients send PAN, Aadhaar or bank statements over WhatsApp? | **High** · Client documents then sit on personal handsets with no access review — the intake gap the report scores first. | **Moderate** · Then the usual gap is shared-folder access that nobody reviews when staff leave. |
| Recruitment (typical Mod–High) | Do candidate CVs reach you, or your clients, over WhatsApp? | **High** · CVs forwarded on WhatsApp leave a copy with every recipient after the role closes. | **Moderate** · Then the usual gap is no deletion period for unsuccessful applicants. |
| D2C brand (typical Mod–High) | Do you take orders or chat with customers on Instagram or WhatsApp? | **High** · Order and address data then lives in chat threads outside your store system. | **Moderate** · Then the usual gap is marketing consent bundled into checkout. |

Clauses: CA "that receives documents over WhatsApp" / "that keeps documents off WhatsApp" · recruitment "that sources CVs over WhatsApp" / "that keeps CVs off WhatsApp" · D2C "that sells over Instagram or WhatsApp" / "that sells only through its store".

Fixed strings: `questionEyebrow` "One question sharpens this read" · `yes` "Yes" · `no` "No" · `youSaid` "You said {answer}" · `change` "Change" · `typicalFor` "for a {sector} {clause}" · `seeRealScore` "See your real score" · `bandAnnounce` "Typical risk for a {sector} {clause}: {band}". No "Good." / "Great." openers — the card never praises an unverified claim; it states the next gap.

## 4 · The pre-fill seam (assessment side)

URL contract: `/assessment/<sector>?pre=<questionId>:<optionId>&src=hero`.

- One shared helper `lib/data/industry-assessment/prefill.ts`: `parsePrefill(searchParams, pack): IAAnswers | null`. Validates the question exists in the pack and the option id exists in it; `multi` → `[optionId]`, `single` → `optionId`; anything else → `null` (a hand-edited URL degrades cleanly, like `?bucket=`).
- Each of the 12 clients already calls `useSearchParams()` for `?bucket=`. Change per client: `useState<IAAnswers>(() => parsePrefill(searchParams, pack) ?? {})` + pass the pre-filled question id to the question renderer.
- **Pre-select, don't skip.** The assessment still opens on q0. At the pre-filled question the option is already ticked with one line: *Pre-selected from your homepage answer — change it if that's wrong.* (`assessment.shared.prefillNote`). Nothing is scored the visitor didn't confirm by advancing.
- Packs byte-identical (isolation rule). `core.ts` / `bands.ts` untouched.
- First step of the 12× assessment-client dedup: one function, twelve call sites, no per-sector logic.

## 5 · Analytics (verify each fires on preview before merge — content/trust law)

| Event | Params | Fires |
|---|---|---|
| `hero_question_answer` *(new)* | `sector`, `answer: yes\|no` | answer pressed (only on change) |
| `landing_cta_click` *(extend)* | + `answered: yes\|no\|""` | left CTA and the S3 card CTA (`cta: "assess_card"`) |
| `assessment_start` *(extend)* | + `prefilled: boolean`, `src: hero\|""` | existing mount effect |

Success read (denominator gate, never a 7-day keep/kill): per-sector **assessment_start ÷ hero_sector_select** before vs after; secondary **assessment_complete ÷ assessment_start**, `prefilled=true` vs `false`. Copy check post-ship: a sector with **hero_question_answer ÷ hero_sector_select < ~30%** has a question owners don't recognise → reword.

## 6 · Design register + laws

**Hierarchy & exits** — one destination per state (§2). S3 drops applies-to (6 elements, not 7).

**Colour** — pills on the white card use the light register: unselected `border-cloud-300 text-navy-700 bg-white`; selected `bg-green-700 text-white` (5.48:1, the settled pair; never green-500 + white = 2.54:1). Green on a pill = *selected*, the chip grammar — never a verdict. **Band chip weight steps with the band**, `text-navy-700` throughout, all measured: Moderate `gold-300` 10.3:1 · Moderate–High `gold-400` 8.52:1 (today's look) · High `gold-500` 6.54:1. Gold stays the only attention colour; only its weight moves. (Hero card only — `AudienceCards` keeps its own treatment.)

**Interaction** — Yes/No is one choice: `role="radiogroup" aria-labelledby="<question id>"`, each `role="radio" aria-checked`, roving tabindex, ←/→ move, Space selects. States all distinct: hover `hover:border-navy-700 hover:bg-cloud-50` · active `active:bg-cloud-100` · checked `bg-green-700 text-white hover:bg-green-800` · focus `focus-visible:ring-2 ring-green-700 ring-offset-2` · `transition-colors` (the chips have it). *Change* is a `<button>` (mutates state), styled like `seeFullReport`; after Change, focus returns to the first radio.

**Spacing** — 16px rhythm inside the card: the band row's inherited `pt-3.5 / mb-3.5 / mb-3` normalise to `pt-4 / mb-4` (in scope because the row is touched; nowhere else). Question row `mt-4 pt-4 border-t border-cloud-200` · eyebrow `mb-1` · question `mb-2` · radios `flex gap-2`, each `flex-1 sm:flex-none px-4 py-2 min-h-[44px] sm:px-3.5 sm:py-1.5 sm:min-h-0` (full-width halves under `sm`; no wrap at 320px). Clause `mt-1`, own line, never inside the band row.

**Type** — inside the card's existing scale only: `text-sm` / `text-xs` / `text-2xs`; semibold / normal; `leading-snug` declared on every card paragraph. Eyebrow must render ≥ 11px on mobile — if `text-2xs` measures 10px, use `text-xs`.

**Layout** — `lg:min-h-[400px]` was tuned for S1; S2 is the tallest state. Measure S2 at build, raise the min-height to it, so chip changes never re-centre the row.

**Accessibility** — the card container becomes `aria-live="off"`; one `sr-only` `<p aria-live="polite">` announces `bandAnnounce` on S3 (today the whole card re-reads its seven elements). Reduced motion → composed state (existing `motion-reduce:animate-none`). No `useSearchParams()` in the hero (indexed-HTML trap) — the hero only writes the query; the client assessment components read it.

### 6.1 Language layering — English first, on the locale layer

The site's locale layer (PR #34, `i18n/request.ts`) merges catalogs **per key: `en ⊕ <locale>`**. A key missing from `hi.json` renders English, never a raw key. The language switcher shows automatically on preview/dev and stays dark on prod (`lib/i18n/switcher-gate.ts`).

Rule for this slice: **every new visitor-facing string goes through `messages/en.json` via `useTranslations`** — including the per-sector question, lines and clauses (`home.heroQuestions.<slug>.{question, yesLine, noLine, yesClause, noClause}`). `hero-verdicts.ts` carries **structure only**: `band`, `yesBand`, `noBand`, `pre {questionId, optionId}`, and a `hasQuestion` derived from the catalog key's presence. Hindi then becomes a catalog-only addition with zero code change.

- **Phase A (this PR): English.** New keys in `en.json` only. `hi.json` untouched → on `/hi` preview the new rows render in English inside the Hindi card, by design of the fallback. Check that `/hi` renders without errors and with no raw keys.
- **Phase B (follow-up, only after Dilip approves Phase A): Hindi.** Add the same keys to `hi.json` (8 fixed + 5 × 3 sector strings). No code change. Own preview. Still dark on prod until `NEXT_PUBLIC_SHOW_HINDI` flips (multilingual thread's gate).
- Existing debt, not this slice's: `chipLabel` and `riskLine` still live in `hero-verdicts.ts` as English, so the Hindi hero already mixes languages. Leave it for the multilingual thread; don't widen scope.

## 7 · Where the changes land

| File | Change | Visible where |
|---|---|---|
| `webapp/lib/data/hero-verdicts.ts` | `HeroVerdict` gains `yesBand`, `noBand`, `pre`; CA `band` High → Moderate–High; rows for the 3 hero sectors | hero card S2/S3 · **CA card in `AudienceCards`** (band) |
| `webapp/lib/data/hero-verdicts.test.ts` *(new)* | every `pre` resolves in its pack · band monotonic · `yesBand ≠ noBand` · every questioned row has its `en.json` keys | CI only |
| `webapp/components/home/HeroSection.tsx` | answer state + sessionStorage restore; question row + radiogroup; S3 swap; single exit; band chip weight; scoped live region; 16px rhythm on the band row; min-h | homepage hero |
| `webapp/lib/data/industry-assessment/prefill.ts` *(new)* + test | `parsePrefill()` | — |
| `webapp/app/[locale]/assessment/*/…AssessmentClient.tsx` (12) | prefill wiring + `prefillNote` on the pre-filled question | assessment question screen |
| `webapp/lib/analytics.ts` | `heroQuestionAnswer`; extend `landingCtaClick`, `assessmentStart` | GA4 |
| `webapp/messages/en.json` | `home.hero.{questionEyebrow, yes, no, youSaid, change, typicalFor, seeRealScore, bandAnnounce}` · `home.heroQuestions.{recruitment, ca-firms, d2c-brands}.*` · `assessment.shared.prefillNote` | hero + assessment |
| `HERO_TAP2_SPEC.md` | this file, committed with the PR | — |

**Not touched:** chips and `PRIORITY_SLUGS` · S0 sample card · "other business" path · `ScoreDial` · `VERDICT_PREVIEWS` · packs · `core.ts` / `bands.ts` · any route · `messages/hi.json` (Phase B).

## 8 · Build sequence (tentative hours; sequence only)

1. Data + tests — `hero-verdicts.ts` fields + CA re-author, `prefill.ts`, both tests green under `node --test --experimental-strip-types` · **1.5h**
2. Catalog — all Phase A keys in `en.json` · **0.5h**
3. Hero UI — S2/S3, radiogroup, single exit, band weight, sessionStorage restore, reset, scoped live region, rhythm, min-h · **3h**
4. Prefill wiring — 12 clients + `prefillNote` · **1.5h**
5. Analytics — new + extended events · **0.5h**
6. Verify — contrast audit (pills + 3 band weights), `next build`, preview; walk S0→S3→CTA→Back→S3 literally (not reload-between-steps); keyboard-only pass; 320px; `/hi` renders with English fallback and no raw keys; all 3 events in GA DebugView; screenshots to Dilip · **2h**

**≈ 9h.** One PR, all 12 clients in it (presentation law). **Preview-before-prod: stop at the preview URL; merge only on Dilip's explicit "go".**

## 9 · Decisions (accepted 2026-09-14 — recommended defaults)

1. Per-sector wording, one semantic (WhatsApp as channel).
2. Pre-select, don't skip q0.
3. Band moves one authored step up/down; CA typical re-authored to Moderate–High so both answers move it.
4. English first on the locale layer; Hindi is Phase B, catalog-only.

**Deliberately out of scope:** a second question · a numeric score in the hero · a question for "other business" · rendering the 9 non-hero sectors' questions · migrating `chipLabel`/`riskLine` into the catalog · animated row collapse · pre-ship user testing (the event ratio in §5 is the test).

**Amendment 2026-09-19 (Dilip):** the "numeric score in the hero" exclusion is lifted, narrowly. A picked sector's card shows the SAMPLE dial: the same `VERDICT_PREVIEWS` score the report tab shows for that sector, labelled *Sample score · illustrative*, **number only**. The "Typical risk" row and its authored steps (point 3) are unchanged. The dial carries no band word, so an answer that steps the band never contradicts the dial. S0's dial reads the Clinics & Labs sample (42) instead of the hard-coded 41, to match its label.
