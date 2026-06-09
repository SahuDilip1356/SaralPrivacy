# SaralPrivacy.com — Product Requirements Document (PRD)

**Document type:** Reverse-engineered PRD
**Version:** 1.0
**Date:** 2026-04-28
**Author:** Dilip Sahu (Product Owner / Founder)
**Status:** Live product — documented for refactor and v1 hardening

---

## 1. Product Vision

**SaralPrivacy is the operating system for DPDPA compliance for Indian SMBs.**

A single platform where small businesses (10–500 employees) can understand the Digital Personal Data Protection Act, assess their readiness, generate compliant artifacts (consent notices, privacy policies, data-rights workflows), and stay current on regulatory changes — without hiring an in-house DPO or paying enterprise compliance vendors ₹15L+/year.

---

## 2. Target Users

### Primary Personas (in priority order)

| Persona | Pain | Willingness to Pay |
|---|---|---|
| D2C brand founder (₹2–50Cr revenue) | Has Klaviyo/Shopify customer list, doesn't know if it's lawful under DPDPA, scared of fines | High — DPDPA has visible enforcement teeth |
| CA firm partner | Clients keep asking "what about DPDPA?" — needs to give a credible answer | Medium-high — billable to clients |
| Recruitment agency owner | Sits on tens of thousands of candidate CVs with consent gaps | Medium |
| Training institute admin | Stores student PII for years, no formal DPDPA stance | Low-medium |

### Secondary Personas
- SaaS startups
- Healthcare clinics
- Ed-tech platforms
- Mid-market enterprises

---

## 3. Jobs-to-be-Done

1. *"Help me understand if I'm at risk under DPDPA — fast and in plain English."*
   → Assessment + Learn pages
2. *"Tell me what the new law actually says without 200 pages of legalese."*
   → Daily Briefing + Plain-English Rules guide
3. *"Give me the documents I need (consent notice, privacy policy)."*
   → Templates + Resources
4. *"Show me I'm compliant when an auditor / customer asks."*
   → Audit log + evidence trail (current gap — see roadmap)
5. *"Handle data-rights requests so I don't drop one."*
   → Consent preferences + data rights pages

---

## 4. Functional Requirements

### F1 — Daily Briefing System
- AI-generated daily briefing on DPDPA news, rulings, enforcement
- Editor-in-the-loop (admin approves before send)
- Email delivery to subscribers via Resend with `List-Unsubscribe` and full audit trail
- Frequency preference: daily or weekly (Monday-only for weekly)
- Suppression handling: bounce, complaint, unsubscribe → auto-suppressed
- Webhook integration with Resend for status events
- Public archive at `/briefings/[slug]`

### F2 — DPDPA Readiness Assessment
- 4 industry variants: D2C, CA firms, recruitment, training institutes
- ~15–25 questions per variant, multi-choice + multi-select
- Real-time scoring with category breakdown (consent, breach, retention, etc.)
- Tokenized full-report page (`/report/[token]`, robots-noindexed, 90-day expiry)
- Output: numerical score, verdict band, red flags, immediate actions, 30-day plan
- Lead capture: name, email, business name on completion
- Auto-email of report PDF/link via Resend

### F3 — Lead & Subscriber Management
- Newsletter signup (homepage + footer)
- Lead capture from assessment, white paper, template downloads
- Admin CRUD for leads with consultation booking pipeline
- Consent basis recorded for every record (DPDPA Section 6 evidence)

### F4 — Content System (Blog + Learn + Resources)
- Blog with markdown rendering (`react-markdown` + `remark-gfm`)
- Admin authoring interface with AI-assisted revise/validate/infographic generation
- Multi-author support (`blogger_accounts` collection)
- Public Learn pages (`/learn/[topic]`) for plain-English DPDPA explainers
- Resources hub with templates and white papers

### F5 — Templates & Downloads
- Gated downloads (email required) for consent notices, privacy policies, etc.
- Tracking via `template_downloads` collection
- Email delivery of download link

### F6 — Outreach System
- CSV import of contacts
- Cron-driven outbound email with magic-token unsubscribe
- Stats dashboard
- Suppression honored across outreach + subscriber lists

### F7 — Consent & Data Rights
- Consent preferences page (granular toggles by purpose)
- Data access request (`/rights/access`)
- Data erasure request (`/rights/erasure`)
- Privacy policy + terms pages
- Public-facing transparency about data handling

### F8 — Survey
- Industry-specific survey collection
- Admin views responses
- Used for content / product research

### F9 — Admin Console
- Magic-link or password login
- Modules: briefings, blog, bloggers, assessments, consultations, leads, downloads, subscribers, outreach, consent, survey responses
- Send-report endpoint for re-mailing assessment outputs

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | TTFB <500ms; Lighthouse ≥90 on key pages |
| SEO | AI SEO score ≥8.5/10 (currently 8.8 ✅), LLM-friendly via `llms.txt` / `llms-full.txt` |
| Security | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy headers; svix-verified webhooks |
| Compliance | Every email send must record `consent_basis`; assessment data tokenized; consent log immutable |
| Reliability | Cron jobs idempotent; retries safe; failures surface to admin |
| Cost | Hostable for under $40/month at <500 subscribers |

---

## 6. Out of Scope (Explicit)

- Enterprise compliance features (data inventory, ROPA generation, DPIAs) — phase 4+
- Multi-tenant org management — currently single-tenant SaralPrivacy
- Payment / subscription billing — manual today, automate later
- Indian languages beyond English — Hindi/Tamil in phase 5
- Mobile native app — responsive web only

---

## 7. Success Metrics

| Metric | 3-month target | 12-month target |
|---|---|---|
| Briefing subscribers | 500 | 5,000 |
| Assessment completions/month | 100 | 1,500 |
| Consultations booked/month | 5 | 50 |
| Organic traffic/month | 3K visits | 30K visits |
| Domain Authority | 15 | 35 |
| Paying customers | 5 | 100 |
| MRR | ₹50K | ₹6L |

---

## 8. Technical Architecture

### 8.1 Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | SSR + SEO + edge routing + file-based API |
| Runtime | Node.js (Vercel Functions) | Compatible with svix, node-appwrite SDK |
| UI | React 19, Tailwind v4, Radix UI primitives | Accessible, fast, low-CSS-overhead |
| Animation | Framer Motion | Polished without custom JS |
| Database | Appwrite Cloud (sgp.cloud) | Managed, schema-less docs, built-in auth |
| Storage | Appwrite Storage | Same provider, simpler ops |
| Email | Resend + svix webhooks | Best deliverability for transactional + great DX |
| AI | Anthropic via `@ai-sdk/anthropic` | Best-in-class reasoning for content |
| Hosting | Vercel (sin1 region) | Indian users get sub-100ms latency |
| CMS | None — Appwrite as headless CMS | Fewer moving parts |

### 8.2 Data Model — Appwrite Collections

```
leads               { name, email, business_name, source, consent_basis, $createdAt }
subscribers         { email, frequency, status, consent_basis, $createdAt }
assessments         { name, email, business_name, industry, answers_json,
                      category_scores_json, final_score, verdict_band,
                      red_flags_json, immediate_actions_json, thirty_day_actions_json,
                      report_token, report_token_expires_at }
briefings           { title, slug, summary, content, why_it_matters,
                      action_checklist, status, scheduled_for, sent_at,
                      subscriber_count, created_at }
blog_posts          { title, slug, content, author_id, status, published_at }
blogger_accounts    { name, email, password_hash, role }
consent_log         { email, purpose, granted, timestamp, ip_hash, user_agent_hash }
survey_responses    { industry, responses_json, $createdAt }
template_downloads  { email, template_id, downloaded_at }
outreach_contacts   { email, name, company, status, magic_token, $createdAt }
email_send_log      { recipient_email, email_type, resend_message_id,
                      status, consent_basis, sent_at, error_message? }
downloads           { email, asset_id, downloaded_at }
content_roadmap     { title, status, priority, owner }
```

### 8.3 External Integrations

- **Resend API** — outbound email
- **Resend webhooks** (svix-signed) — bounce/complaint events
- **Anthropic API** — content generation, briefing drafting, assessment narrative
- **Vercel Cron** — daily 04:30 UTC scheduled invocations

### 8.4 Cron Jobs

```json
{
  "crons": [
    { "path": "/api/cron/outreach-send",  "schedule": "0 4 * * *"  },
    { "path": "/api/cron/briefing-send",  "schedule": "30 4 * * *" }
  ]
}
```

### 8.5 Security Posture

- CSP, security headers in `next.config.ts`
- All admin routes behind authentication
- Tokenized links (assessment reports) with expiry
- svix signature verification on webhooks
- Email normalization (lowercase + trim) before storage
- bcrypt for blogger account passwords

---

## 9. Known Architectural Debts (Day-1 Roadmap)

1. Cron `briefing-send` is non-idempotent (double-send risk on Vercel retry)
2. 500-subscriber pagination cliff — silent truncation
3. Failed sends don't write to audit log — DPDPA evidence gap
4. No automated tests
5. CSP includes `unsafe-inline`, `unsafe-eval`
6. 4 near-duplicate industry assessment pages — should be unified

---

## 10. Resource & Cost Plan

### 10.1 Team

**Minimum viable team to ship in 16 weeks:**
- 1 founder (Dilip) — product, content, admin, oversight: 30hrs/week
- 1 full-stack dev — 30hrs/week
- Optional: 1 designer for 8hrs/week 1, 5, 9

If solo with AI assistance only, multiply timeline by ~1.6x → 22–25 weeks.

### 10.2 Recurring Costs (monthly, at <500 subs)

| Service | Cost |
|---|---|
| Vercel (Hobby/Pro) | $0–$20 |
| Appwrite Cloud | $0–$15 |
| Resend (3K emails/mo) | $0 |
| Anthropic API (~30 briefings/mo) | ~$5 |
| Domain | ~$1 |
| **Total** | **~$25–$40/mo** |

### 10.3 At Scale (5,000 subs)

| Service | Cost |
|---|---|
| Vercel Pro | $20 |
| Appwrite Pro | $25–$45 |
| Resend (150K emails) | ~$20 |
| Anthropic | $30 |
| **Total** | **~$95–$115/mo** |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Briefing cron double-sends → reputational damage | Medium | High | Idempotency lock — fix this week |
| Appwrite outage (single dependency) | Low | High | Daily exports → S3, runbook for read-only fallback |
| AI generates factually wrong briefing | Medium | Medium-High | Mandatory human approval gate (in place ✅) |
| Resend account suspended for spam complaints | Low | Critical | Aggressive bounce/complaint suppression (in place ✅) |
| DPDPA enforcement timeline shifts → demand drops | Low | Medium | Pivot to general "privacy compliance" — assessment engine reusable for ISO 27701, GDPR |
| Competitor (OneTrust India, Tsaaro) launches free assessment | Medium | Medium | Move faster on SEO + linkable assets; build moat in industry-specific guidance |
| Solo-founder burnout | High | Critical | Strict scope discipline (per CLAUDE.md) |

---

## 12. Decisions to Make Differently (Hindsight Refactors)

1. **Build the cron with idempotency & audit logging from line 1** — currently retrofit work
2. **One `AssessmentWizard` component, four industry configs** — not four pages
3. **Skip the in-app blog AI tooling in v1** — Claude.ai does it free
4. **Don't build outreach — buy it** (Resend Audiences / Loops.so)
5. **Tests on legally load-bearing paths from week 2, not week 13**
6. **Tighter CSP from day 1** — no `unsafe-inline`/`unsafe-eval`

---

## 13. Roadmap — Missing Pieces

Items planned but not yet built in the live product:

- **Pricing page** (`/pricing`) — three-tier structure with Free / Starter / Pro / Custom
- **Penalty Calculator** (`/penalty-calculator`) — interactive DPDPA exposure tool
- **Glossary** (`/learn/dpdpa-glossary`) — 25+ DPDPA terms with rich-result schema
- **Press page** (`/press`) — for HARO/Qwoted-driven backlinks
- **Test suite** — 7 tests on legally load-bearing paths (Vitest)
- **Rate limiting** on public POSTs
- **Tightened CSP** — nonce-based, no `unsafe-*`
- **Backup & DR** — daily Appwrite exports + restore runbook
- **Observability** — Sentry + cron health monitoring

---

## 14. Document Status

This PRD reverse-engineers the live SaralPrivacy.com application as of April 2026. It is intended as the source of truth for refactor planning and v1 hardening. Pair with `SaralPrivacy_DevelopmentPlan.md` for the block-by-block build sequence.
