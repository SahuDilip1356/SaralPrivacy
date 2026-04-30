# MEMORY.md — SaralPrivacy Project Black Box

> Last updated: 2026-04-30
> Rule: Update this file after every meaningful change. Never erase history. Append logs.

---

## Project Objective

**SaralPrivacy** (`saralprivacy.com`) — India's practical DPDPA readiness platform.
Helps Indian businesses understand and comply with the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 — without legalese.

Revenue model: Free educational content + paid consultation (`/contact`).
Target: SMBs, recruitment agencies, CA firms, training institutes, D2C brands.

---

## Repository Structure

```
/webapp/                        ← repo root (git)
  MEMORY.md                     ← this file
  webapp/                       ← Next.js app (rootDirectory in Vercel)
    app/                        ← App Router pages
      learn/
        page.tsx                ← /learn hub (card grid + two-row reading guide)
        dpdp-act-2023/
          page.tsx              ← /learn/dpdp-act-2023 (full Act reader)
        dpdp-rules-2025-plain-english-guide/
          page.tsx              ← /learn/dpdp-rules-2025-plain-english-guide
        [topic]/page.tsx        ← dynamic /learn/[topic] pages
      industries/               ← recruitment-agencies, ca-firms, training-institutes, d2c-brands
      assessment/               ← SurveyClient.tsx + sub-routes
      glossary/                 ← /glossary (50+ terms)
      penalty-calculator/       ← /penalty-calculator (Penalty Risk Indicator)
      briefings/[slug]/         ← daily briefing pages
      blog/[slug]/              ← insights blog
      faq/                      ← FAQ page
      about/, contact/, white-paper/, privacy/, terms/
      sitemap.ts                ← dynamic XML sitemap
      robots.ts
    components/
      layout/
        Header.tsx              ← global nav (dropdown + mobile menu)
        Footer.tsx              ← global footer
    content/
      dpdp-act-2023.ts          ← DPDP Act 2023 typed data (9 ch, 44 sections, Schedule)
    lib/
      learnNav.ts               ← shared topicNav (drives ALL sidebars)
      schema.tsx                ← JSON-LD schema helpers
      appwrite.ts               ← Appwrite DB client
    public/
      llms.txt                  ← LLM-readable site index
      llms-full.txt             ← extended LLM index
      logo-emblem.png
    vercel.json                 ← region: sin1, cron jobs
    next.config.ts
    tailwind.config.ts
    tsconfig.json
    package.json                ← Next.js 16.1.7, React 19.2.3
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.7 (App Router) |
| UI | React 19.2.3, Tailwind CSS |
| Language | TypeScript |
| Database | Appwrite (blog posts, subscribers) |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Region | `sin1` (Singapore) |
| Git remote | `https://github.com/SahuDilip1356/SaralPrivacy.git` |
| Active branch | `main` |
| Other branch | `feature/email-report-upgrade` (paused) |

---

## Deployment Rules (CRITICAL)

- **ALWAYS deploy via `git commit → git push origin main`** — never use Vercel deploy tools directly.
- Vercel GitHub webhook must be connected. If deploys stop triggering, check Vercel Settings → Git.
- `rootDirectory = webapp` in Vercel Dashboard — never clear this.
- One `package.json` at `webapp/webapp/` only — no duplicate Next.js apps.
- One middleware file: `proxy.ts` (Next.js 16), never `middleware.ts` alongside it.

---

## Current Production State (as of 2026-04-30)

### Live pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Home | Live |
| `/learn` | DPDPA Learning Hub (16 cards + two-row reading guide) | Live |
| `/learn/dpdp-act-2023` | DPDP Act 2023 full-text reader (44 sections, keyword highlighting) | Live ✅ NEW |
| `/learn/dpdp-rules-2025-plain-english-guide` | DPDP Rules 2025 plain-English guide | Live |
| `/learn/[topic]` | 12 topic pages (what-is-dpdpa, applicability, consent, rights, data-breach, key-terms, duties, notice, childrens-data, retention, cross-border, myths) | Live |
| `/glossary` | 50+ DPDPA terms | Live |
| `/penalty-calculator` | DPDPA Penalty Risk Indicator (statutory) | Live |
| `/assessment` | Free readiness assessment (SurveyClient) | Live |
| `/assessment/[industry]` | Industry-specific assessments | Live |
| `/industries/[slug]` | 4 industry pages | Live |
| `/briefings/[slug]` | 8 daily briefings | Live |
| `/blog/[slug]` | Insights blog (Appwrite-backed) | Live |
| `/faq` | 40+ Q&A | Live |
| `/white-paper` | White paper download | Live |
| `/contact` | Consultation enquiry | Live |
| `/about` | About page | Live |
| `/privacy`, `/terms`, `/consent-preferences` | Legal pages | Live |
| `/rights/access`, `/rights/erasure` | DPDPA data rights pages | Live |
| `/unsubscribe` | Email unsubscribe | Live |

### Cron jobs (vercel.json)
- `/api/cron/outreach-send` — daily 04:00 UTC
- `/api/cron/briefing-send` — daily 04:30 UTC

---

## Key Architectural Decisions

| Decision | Detail |
|----------|--------|
| `learnNav.ts` is single source of truth | All sidebars (Act reader, Rules page, future learn pages) import `topicNav` from here. Never hardcode sidebar nav again. |
| Act content in `content/dpdp-act-2023.ts` | Typed data file (not hardcoded JSX) so content is reusable and maintainable |
| Keyword highlighting via regex split | `highlightKeywords()` in Act page — 3 colour categories, no dangerouslySetInnerHTML |
| Dropdown uses 150ms close delay | `useRef` timer prevents gap-close bug when mousing to dropdown panel |
| PDF as authoritative source | Act text sourced from Gazette of India PDF (pypdf extraction), NOT dpdpa.com (inaccurate) |

---

## Shared Nav — `learnNav.ts` (topicNav order)

Order must be maintained consistently across Header dropdown, /learn page, and all sidebars:

1. DPDP Act 2023 (Full Text) → `/learn/dpdp-act-2023`
2. DPDP Rules 2025 → `/learn/dpdp-rules-2025-plain-english-guide`
3. What is DPDPA? → `/learn/what-is-dpdpa`
4. Who It Applies To → `/learn/applicability`
5. Must Learn: Key Terms → `/learn/key-terms`
6. Consent → `/learn/consent`
7. Notice Requirements → `/learn/notice`
8. Rights → `/learn/rights`
9. Business Duties → `/learn/duties`
10. Children's Data → `/learn/childrens-data`
11. Data Breach → `/learn/data-breach`
12. Penalties → `/penalty-calculator`
13. Retention → `/learn/retention`
14. Cross-Border → `/learn/cross-border`
15. Myth vs Fact → `/learn/myths`
16. Glossary (50+ Terms) → `/glossary` ← **always last**

---

## Uncommitted / Untracked Files (known, not yet staged)

| File/Dir | Status | Note |
|----------|--------|------|
| `webapp/lib/appwrite.ts` | Modified (unstaged) | Unknown changes — inspect before staging |
| `webapp/package.json` | Modified (unstaged) | Unknown changes — inspect before staging |
| `webapp/package-lock.json` | Modified (unstaged) | Likely from npm install |
| `webapp/pnpm-lock.yaml` | Untracked | pnpm lockfile — review before staging |
| `webapp/app/api/templates/` | Untracked | Template download API — not yet committed |
| `webapp/components/TemplateDownloadForm.tsx` | Untracked | Template download form — not yet committed |
| `webapp/components/TemplateDownloadModal.tsx` | Untracked | Template download modal — not yet committed |
| `webapp/lib/templates/` | Untracked | Template library — not yet committed |

**Action needed:** Inspect and decide whether to commit template download work or discard it.

---

## Known Issues / Bugs

| Issue | Severity | Status |
|-------|----------|--------|
| `TemplateDownloadForm.tsx` has TS errors (react-hook-form, missing ui components) | Medium | Untracked, not blocking prod |
| `TemplateDownloadModal.tsx` has TS errors (next-auth/react, missing dialog) | Medium | Untracked, not blocking prod |
| Pre-existing TS errors in `TemplateDownloadForm/Modal` — missing deps: `react-hook-form`, `@hookform/resolvers/zod`, `next-auth/react`, `@/components/ui/dialog`, `@/components/ui/select`, `@/components/ui/form`, `@/components/ui/checkbox` | Medium | Untracked files, not in prod |

---

## Sprint History (summary)

| Sprint | Key deliverables |
|--------|-----------------|
| Sprint 7 | SEO hardening — title tag length, blog image fallback, /resources template page |
| Sprint 8 | Glossary page (50+ terms), Penalty Risk Indicator, thin /learn content expansion |
| Sprint 8 cont. | DPDP Act 2023 full-text reader page + content data file |
| Post-sprint | Dropdown hover fix, /learn card reorder, Act UX improvements (# notation, keyword highlighting) |
| Post-sprint | Nav sequence alignment, Glossary moved to last, two-row reading guide strip |

---

## Development Log

### 2026-04-30 — Session: Act reader + nav fixes

**Commits pushed (all to `main`):**

| Hash | Description |
|------|-------------|
| `2079f50` | chore: activate Vercel webhook after reconnect (empty commit, fixed broken deploy pipeline) |
| `7db4fc7` | feat: add DPDP Act 2023 full-text reader page |
| `1dcbaa0` | fix: dropdown hover gap, learn page cards, Act reader UX improvements |
| `1344beb` | fix: align nav sequence, Glossary last, two-row reading guide |

**Files created:**
- `webapp/content/dpdp-act-2023.ts` — 9 chapters, 44 sections, 7-item Schedule; types: `ActChapter`, `ActSection`, `ScheduleRow`; exports: `dpdpAct2023`, `allSections`
- `webapp/app/learn/dpdp-act-2023/page.tsx` — three-column reader layout; keyword highlighting (3 colours); `#` notation for sections; TOC by chapter; Schedule table

**Files modified:**
- `webapp/lib/learnNav.ts` — added Act + Rules entries; Glossary moved to last (position 16)
- `webapp/components/layout/Header.tsx` — added `useRef` close timer (150ms); dropdown rewritten (10 items, correct order); panel widened to `w-64`
- `webapp/app/learn/page.tsx` — card order rewritten (Act first, Glossary last); Penalty card added; two-row reading guide (Row 1 = clickable learning path, Row 2 = navy reference chips)
- `webapp/app/learn/dpdp-rules-2025-plain-english-guide/page.tsx` — removed hardcoded `guideNav`; now imports and renders `topicNav` from `learnNav.ts`
- `webapp/app/sitemap.ts` — added `/learn/dpdp-act-2023` at priority 0.9; LEARN_UPDATED bumped to 2026-04-30
- `webapp/public/llms.txt` — Act and Rules reader entries added

**Infrastructure:**
- Vercel GitHub webhook was completely missing (deleted). Fixed: reconnected GitHub integration in Vercel Settings → Git. Webhook now active.

---

## Current Pause Point

All work from this session is committed and live on production.
Latest commit on `main`: `ec61bff`
Vercel deploy: triggered automatically on push.

**Remaining / not committed:**
- Template download feature (`TemplateDownloadForm.tsx`, `TemplateDownloadModal.tsx`, `webapp/app/api/templates/`, `webapp/lib/templates/`) — untracked, has TypeScript errors, needs missing dependencies before it can be committed.

---

### 2026-04-30 — Block 4: Expand 5 thin learn pages

**Commit:** `ec61bff`
**File changed:** `webapp/app/learn/[topic]/page.tsx` (1 file, +311 / -116 lines)

| Page | Before | After |
|------|--------|-------|
| what-is-dpdpa | 448 words | 916 words |
| applicability | 403 words | 846 words |
| consent | 437 words | 1081 words |
| rights | 509 words | 1044 words |
| data-breach | 631 words | 1074 words |

New sections added per page:
- **what-is-dpdpa**: GDPR comparison table, implementation timeline, penalty overview, First Three Steps
- **applicability**: Size doesn't matter section, business-type table, SDF tier, 5-question scope test
- **consent**: Deemed Consent (Section 7), context examples (ecommerce/HR/WhatsApp), record-keeping fields, 7-item checklist
- **rights**: Why rights matter operationally, 4 scenario walkthroughs, response guidance, min. process requirements
- **data-breach**: Section 2(t) definition, breach vs incident test, DPDP Rules two-part notification detail, individual notification, penalties table

---

---

### 2026-04-30 — Block 5: FAQPage JSON-LD on 4 industry pages

**Commit:** `8682628`
**Files changed:** 4 industry pages (+100 / -4 lines)

| Page | FAQs added |
|------|-----------|
| `/industries/recruitment-agencies` | 5 FAQs: DPDPA applies? / CV sharing consent / ATS retention / Aadhaar copies / erasure requests |
| `/industries/ca-firms` | 5 FAQs: DPDPA applies? / Google Drive for PAN-Aadhaar / retention periods / outsourced bookkeeping / client deletion rights |
| `/industries/training-institutes` | 5 FAQs: DPDPA applies? / parental consent under-18 / admissions form compliance / placement data for marketing / tracking pixels |
| `/industries/d2c-brands` | 5 FAQs: DPDPA applies? / WhatsApp from order data / pre-ticked checkbox legality / Meta Pixel/GA disclosure / retention after last purchase |

**Pattern used:** `import { breadcrumbSchema, faqPageSchema }` + `const faqs = [...]` above component + `{faqPageSchema(faqs)}` injected after `{breadcrumbSchema(...)}` in JSX fragment. No new deps required — `faqPageSchema` already existed in `lib/schema.tsx`.

---

---

### 2026-04-30 — Block 6: Related Briefings in article body (mobile)

**Commit:** `d501baa`
**File changed:** `webapp/app/briefings/[slug]/page.tsx` (+54 lines)

- Added "More on this topic" section inside the main content column (`lg:hidden`)
- Appears at the bottom of the article on mobile/tablet — desktop already shows related in the sidebar
- Added to **both** renderers: v2 (new 6-block format) and legacy (v0/v1)
- Only renders when `related.length > 0` — safe fallback, no empty state needed
- Uses `related` array already fetched by `getRelatedFromDb` — zero new queries
- Style: white card, category label (green), title (navy → green on hover), date (slate), ArrowRight icon

---

---

### 2026-04-30 — Block 7: Sitemap + llms.txt housekeeping

**Commit:** `3b321da`
**Files changed:** `webapp/app/sitemap.ts`, `webapp/public/llms.txt`

- `INDUSTRY_UPDATED` bumped from `2026-03-20` → `2026-04-30` (reflects Block 5 FAQ additions)
- `llms.txt` industry guide entries expanded with FAQ topic descriptions — LLMs can now surface industry-specific Q&As

---

## Sprint 8 — COMPLETE ✅

| Block | Deliverable | Commit |
|-------|------------|--------|
| Block 4 | Expand 5 thin learn pages (916–1081 words each) | `ec61bff` |
| Block 5 | FAQPage JSON-LD on 4 industry pages (20 FAQs) | `8682628` |
| Block 6 | "More on this topic" in briefing body (mobile) | `d501baa` |
| Block 7 | Sitemap + llms.txt date/content update | `3b321da` |

---

---

### 2026-04-30 — Cross-linking Phase 1: Act + Rules pages

**Commit:** `b002878`
**Files created:** `webapp/lib/termLinks.ts`, `webapp/lib/linkifyText.tsx`
**Files modified:** `webapp/app/learn/dpdp-act-2023/page.tsx`, `webapp/app/learn/dpdp-rules-2025-plain-english-guide/page.tsx`

**What was built:**
- `termLinks.ts` — 29-term TERM_LINKS map (single source of truth). Each entry: `term`, `href` (optional), `className` (blue/green/amber). Ordered longest-first for correct regex alternation.
- `linkifyText.tsx` — utility function. Takes a string, splits by TERM_REGEX, wraps first occurrence of each term in `<Link>` with dotted underline, subsequent occurrences in `<span>` (highlight only). Per-call `Set<string>` tracks seen terms.
- Act page: removed `HIGHLIGHT_TERMS`, `HIGHLIGHT_REGEX`, `highlightKeywords()` — replaced with `linkifyText()` in `OfficialText`, `PlainEnglishBox`, `KeyTakeaways` components. Covers all 44 sections.
- Rules page: `BulletList` and `SubBulletList` now call `linkifyText()` on each item. Covers all 23 Rules + 7 Schedules bullet content.

**Term destinations (sample):**
- Data Fiduciary → `/glossary#data-fiduciary`
- Consent → `/learn/consent`
- Personal Data Breach → `/learn/data-breach`
- Penalty → `/penalty-calculator`
- Data Protection Board → `/glossary#dpb`

**Cross-linking Phases remaining:**
- **Phase 2:** Glossary outbound links + Learn pages cross-links
- **Phase 3:** Briefings — `linkifyText()` on dynamic Appwrite body text

---

---

### 2026-04-30 — Cross-linking Phase 2A: Glossary outbound links

**Commits:** `cc14e0d`
**Files modified:** `webapp/components/glossary/glossaryData.ts`, `webapp/components/glossary/GlossaryClient.tsx`

**What was built:**
- Added `learnHref?: string` to `GlossaryTerm` interface
- Added `learnHref` to all 50 glossary terms (100% coverage):
  - roles → `/learn/duties`, `/learn/rights`, `/learn/key-terms`, `/penalty-calculator`
  - concepts → `/learn/what-is-dpdpa`, `/learn/data-breach`, `/learn/key-terms`, `/learn/consent`
  - consent → `/learn/consent`, `/learn/notice`, `/learn/duties`
  - rights → `/learn/rights`
  - obligations → `/learn/duties`, `/learn/data-breach`, `/learn/retention`, `/learn/childrens-data`, `/learn/key-terms`
  - cross-border → `/learn/cross-border`
  - enforcement → `/penalty-calculator`
  - exemptions → `/learn/what-is-dpdpa`, `/learn/consent`
- `GlossaryClient.tsx` footer updated: single border-t row, `See also:` left + `Read more in the Guide →` right
  - "Read more" only renders when `term.learnHref` exists
  - Row only renders when term has at least one of relatedIds OR learnHref

---

---

### 2026-04-30 — Cross-linking Phase 2B: Related topics strip on Learn pages

**Commit:** `9f485d9`
**File modified:** `webapp/app/learn/[topic]/page.tsx`

**What was built:**
- Added `RELATED_TOPICS` constant (12 topic slugs → 3 related slugs each)
- "Related topics" chip strip rendered between disclaimer and prev/next nav
- Chips are rounded-full, slate background → green on hover
- Only renders for topics that have entries in RELATED_TOPICS
- Zero new dependencies — reuses `topicNav` labels and hrefs

---

## Cross-linking Summary (Phases complete)

| Phase | What | Status |
|-------|------|--------|
| Phase 1 | `termLinks.ts` + `linkifyText.tsx` applied to Act reader + Rules page | ✅ `b002878` |
| Phase 2A | `learnHref` on all 50 glossary terms + "Read more" link in GlossaryClient | ✅ `cc14e0d` |
| Phase 2B | Related topics chip strip on all 12 `[topic]` Learn pages | ✅ `9f485d9` |
| Phase 3 | Apply `linkifyText()` to briefing body text (Appwrite strings) | 🔜 Deferred |

---

## Next Recommended Action

**Cross-linking Phase 3 (deferred — complex):**
- Apply `linkifyText()` to dynamic briefing body text (Appwrite-sourced strings)
- Needs server-side text processor; worth doing when briefing volume grows

**Other parked work:**
- **Template download feature:** install `react-hook-form`, `@hookform/resolvers/zod`, missing UI components. Tackle separately.
- **`feature/email-report-upgrade` branch** — review, merge or discard

**Latest commit on `main`:** `9f485d9`

Start next session by reading this file, then run `git status --short webapp/` to verify repo state.
