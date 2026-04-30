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
Latest commit on `main`: `1344beb`
Vercel deploy: triggered automatically on push.

**Remaining / not committed:**
- Template download feature (`TemplateDownloadForm.tsx`, `TemplateDownloadModal.tsx`, `webapp/app/api/templates/`, `webapp/lib/templates/`) — untracked, has TypeScript errors, needs missing dependencies before it can be committed.

---

## Next Recommended Action

**Option 1 (continue content):** Sprint 8 remaining blocks:
- Block 4: Expand 5 thin `/learn` pages (what-is-dpdpa, applicability, consent, rights, data-breach) from ~350 to 700+ words
- Block 5: Add FAQPage JSON-LD to 4 industry pages
- Block 6: Fix internal linking on briefing template — add "Related Briefings" section
- Block 7: Final sitemap + llms.txt update after all blocks deploy

**Option 2 (fix template download):** Install missing deps (`react-hook-form`, `@hookform/resolvers/zod`, `next-auth/react`), create missing UI components (`dialog`, `select`, `form`, `checkbox`), resolve TS errors, then commit.

**Option 3 (new feature):** Individual section routes `/learn/dpdp-act-2023/section-[N]/page.tsx` for deep SEO.

Start next session by reading this file, then run `git status --short webapp/` to verify repo state.
