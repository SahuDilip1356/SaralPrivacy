# SCALE ARCHITECTURE SPEC — SaralPrivacy at 1M Users

**Status:** DRAFT v1.0 — for review, nothing in here is authorized to build until its phase gate fires
**Audience:** Founder (Dilip) + any future engineer/advisor
**Scope:** Whole-platform target architecture (www + paid app), Appwrite→Supabase migration, Vercel/Render/Supabase split, and the evidence-gated transformation roadmap
**Method:** Alex Xu, *System Design Interview Vol 1 & 2* (estimation-first, scale-by-evidence); Kleppmann, *DDIA* (outbox/consistency); Fowler (strangler fig)
**Prime rule carried over:** complexity follows evidence. Every phase below has a trigger; nothing ships early just because it is specced here.

---

## 1. Executive summary

**Question 1 — can the DB move from Appwrite to Supabase?** Yes, cleanly. All 19 Appwrite collections are low-volume document stores with no Appwrite-specific features in use beyond CRUD + storage. They map 1:1 to Postgres tables. Migration is a per-module strangler cutover (expand → backfill → verify → flip → contract), ~24–32h of work, near-zero risk because current write volume is a handful of rows/day. Full plan in §9.

**Question 2 — how to restructure for 1M users?** The math (§4) says 1M monthly users of *this* product ≈ **~150–200 peak API QPS and ~150–250 GB of hot relational data**. That is served by: stateless Next.js frontends on Vercel (CDN does the heavy lifting — unchanged), a stateless Node.js API tier + workers on Render (horizontally scaled), **one Postgres primary on Supabase** with a read replica and time-partitioned event tables, Redis for cache/rate-limit/queues, and an outbox-driven async pipeline. **No microservices, no Kubernetes, no sharding, no multi-region active-active.** Those triggers sit at ~10× beyond this spec's design point and are documented as "revisit-when" items (§17).

**The one-screen target:**

```
                          INTERNET
                             │
              ┌──────────────┴────────────────┐
              │        Vercel Edge / CDN       │  static content ≈ 95% of traffic
              └──────┬───────────────┬─────────┘  terminates here (SSG/ISR)
                     │               │
             ┌───────▼─────┐  ┌──────▼───────┐
             │  www (Next) │  │  app (Next)  │   monorepo: apps/www, apps/app
             │  content,   │  │  paid product│   shared packages/ui, packages/types
             │  free tools │  │  dashboard   │
             └───────┬─────┘  └──────┬───────┘
                     │  /api/v1/* rewrites │
                     └────────┬───────────┘
                              ▼
                 ┌────────────────────────┐
                 │  BACKEND (Mumbai/O2b)  │
                 │  api  — Node/TS, REST  │◄── autoscale 2..N, stateless
                 │  worker — BullMQ jobs  │◄── email, PDF, AI, webhooks
                 │  cron — scheduled jobs │
                 └───┬────────┬───────┬───┘
                     │        │       │
        ┌────────────▼──┐ ┌───▼────┐ ┌▼──────────────┐
        │ SUPABASE (BOM)│ │ REDIS  │ │ Vercel Blob    │
        │ Postgres 17   │ │Upstash │ │ public PDFs    │
        │ + Auth (JWT)  │ │ cache  │ └────────────────┘
        │ + RLS tenancy │ │ ratelim│ ┌────────────────┐
        │ + pgvector    │ │ queues │ │ Anthropic API  │
        │ + PITR        │ └────────┘ │ Resend │Razorpay│
        └───────────────┘            └────────────────┘
```

**Sequence (details §15):** merge P0 security (precondition, already built) → Supabase foundation + Appwrite migration → real auth (admin first) → extract backend to Render via strangler → paid app + idempotent payments → scale hardening (cache, queues, SLOs, load test) → 1M-readiness (replica, partitions, DR drill). ≈ **180–270 tentative hours** end-to-end, each phase independently shippable and independently valuable.

---

## 2. Requirements

### 2.1 Functional (target state)

| # | Requirement | Exists today? |
|---|---|---|
| F1 | Public content site: 151+ briefings, 12 data-flow maps, guides, blog — SEO-critical, static | ✅ (keep as-is) |
| F2 | Free tools: 12 assessments, discovery, notice builder, penalty calculator — stateless | ✅ (keep as-is) |
| F3 | Setu chatbot: grounded RAG answers with lexical fallback | ✅ (consolidate index → pgvector) |
| F4 | **Paid app** (`app.saralprivacy.com`): org accounts, seats, roles | ❌ new |
| F5 | **Compliance ledger**: per-org RoPA, vendors, consents, DSARs, notices, breach log, audit trail | ❌ new (DSAR/notice fragments exist) |
| F6 | Payments: subscriptions + one-time SKUs via Razorpay, invoices | ❌ new (Pounce P2) |
| F7 | Notifications: transactional email, briefing sends, DSAR deadline alerts, WhatsApp (Twilio wired) | ◐ partial |
| F8 | Admin: content approval, outreach, blogger CRM, reports | ✅ (re-auth + migrate) |
| F9 | Consent-event ingestion API for customer websites (the B2B2C multiplier) | ❌ future, drives data scale |

### 2.2 Non-functional (the numbers that shape the design)

| Dimension | Target at 1M MAU | Notes |
|---|---|---|
| Availability (API) | 99.9% (≤43 min down/mo) | error-budget policy; 99.95% only when revenue justifies warm standby |
| Availability (content) | 99.99% effective | CDN-served static; survives origin outage |
| Latency | p95 read ≤ 250 ms, p95 write ≤ 400 ms (in-region), content TTFB ≤ 200 ms | Stack in Mumbai, audience in India — last-mile only; no cross-border RTT tax |
| Durability | RPO ≤ 5 min (PITR), RTO ≤ 60 min single-region | quarterly restore drill is the proof, not the setting |
| Consistency | Strong within org (single Postgres primary) | compliance ledger must never show phantom state |
| Security | RLS tenant isolation, MFA admin, audit-log append-only, OWASP ASVS L2 | see §13 |
| Data residency | **Mumbai (`ap-south-1`) — ✅ DECIDED (Dilip, 2026-09-02): Mumbai is the hosting territory** | Data lands there at the Supabase migration and never moves again; Vercel functions follow (`bom1`); see O2b for the backend-host consequence |
| Cost ceiling | Infra ex-LLM ≤ 3% of revenue at scale | §14 shows ~1–2% |

### 2.3 Constraints

- **Team = 1 founder + AI agents.** Every choice biases toward managed services, one language (TypeScript), few moving parts. Ops burden is a first-class cost.
- **Operation Pounce order is law:** P0 security → P2 Razorpay → Gate 3 (≥25 paying, ≥2 conv/100 assessments). This spec is Pounce's *infrastructure track*, not a competitor to it. No scale phase may jump the revenue gates.
- **Preview-before-prod law:** every phase lands via preview verification + explicit confirmation. Never self-merge.
- **Content laws unchanged:** `sectors.ts` single source of truth, presentation-unified-content-varies, content-as-code stays.

---

## 3. As-is architecture (verified against the repo, this branch)

```
                        INTERNET
                           │
                    ┌──────▼──────┐
                    │ VERCEL sin1 │  one Next.js 16 monolith
                    │  78 pages   │  SSG/ISR content + free tools
                    │  40 API rts │  transactional + admin + chat + crons
                    │  3 crons    │  outreach 04:00 · briefings 04:30 · AEO Mon 03:30
                    └──┬───┬───┬──┘
            ┌──────────┘   │   └───────────┐
     ┌──────▼─────┐ ┌──────▼─────┐ ┌───────▼──────┐
     │ APPWRITE   │ │ Vercel Blob│ │ Pinecone     │
     │ Singapore  │ │ PDFs       │ │ 406 chunks   │
     │ 19 colls   │ └────────────┘ │ + chat-index │
     │ + 1 bucket │ ┌────────────┐ │   .json      │
     └────────────┘ │ Resend     │ │ (lexical)    │
                    │ Twilio     │ └──────────────┘
                    │ Anthropic  │
                    │ OpenRouter │
                    └────────────┘
```

**Inventory (facts, not estimates):**

- One Next.js 16 / React 19 app; 78 `page.tsx`, 40 API routes, ~106k LOC of TS/TSX, of which ~50k LOC is content-as-code in `lib/data/` (briefings, 12 assessment packs, 12 data-flow packs).
- **Appwrite (Singapore)** — `DB_ID` + 19 collections: `leads, subscribers, downloads, assessments, briefings, consent_log, survey_responses, blog_posts, blogger_accounts, template_downloads, outreach_contacts, email_send_log, ai_citations, notice_captures, notice_runs, notice_events, business_profiles, dsar_requests, chat_feedback` + 1 storage bucket. Lazy-init Proxy wrapper (build-crash workaround). Known constraint: `report_type` ≤ 10 chars.
- **Auth:** none for users. Admin = `ADMIN_PASSWORD` env check setting `admin_session` cookie — the forgeable-cookie hole; P0 fix built on `worktree-p0-security`, unmerged.
- **Chat:** `lib/chat/*` — Pinecone vector + `public/chat-index.json` lexical, RRF merge, guard/redact layers. Known failure class: index↔Pinecone lockstep (chunk added to JSON without upsert = silent no-op in prod).
- **Jobs:** 3 Vercel crons; PDF gen via puppeteer-core + @sparticuz/chromium in-function; no queue; retries ad-hoc.
- **Observability:** Vercel Analytics (Pro, custom events verified) + Vercel/function logs. No error alerting, no uptime checks, no traces.
- **Payments:** none. **Cache:** none beyond CDN/ISR (correct — no hot DB path exists).

**Honest reading:** for its current evidence level this is a *good* architecture — static-first content scales to millions of readers free. The gaps are (a) security hardening (built, unmerged), (b) everything a *paid* product needs: auth, relational ledger, payments, observability.

---

## 4. Back-of-envelope estimation (Alex Xu Vol 1 Ch 2 — do this before designing anything)

**Define "1M users":** 1M monthly active people across the funnel, split by assumption:

| Segment | Assumption | Derived |
|---|---|---|
| Content readers | ~950k MAU, 3 pages/visit | ~600k pageviews/day peak-month |
| Free-tool users | ~40k/mo complete an assessment/tool | ~1.5k tool runs/day |
| Paid orgs | ~5,000 orgs, 2–3 seats, ~5k DAU in-app | 40 API calls/user-day |
| Data principals (B2B2C) | 5k orgs × ~20k principals avg | **100M principal records** — the real scale driver |
| Consent events | ~2 events/principal/yr | **200M events/yr** |

**Traffic:**

| Path | Avg | Peak (×5–20 IST morning) | Served by |
|---|---|---|---|
| Content pageviews | ~7/s | ~70/s | CDN (≥95% cache hit) — origin ≈ idle |
| App/API requests | 5k DAU × 40 = 200k/day ≈ 2.3/s | ~50/s | Render api + Postgres |
| Public tool/API writes | ~100k/day ≈ 1.2/s | ~25/s | Render api |
| Consent ingestion (F9) | 200M/yr ≈ 6.3/s | ~60/s | api → queue → batch insert |
| Chat LLM calls | ~8k/day | ~3 concurrent streams | Vercel fn → Anthropic |
| **Design point** | | **~150–200 QPS peak; stress-test 500 QPS** | |

A tuned Postgres on a mid-size instance sustains thousands of simple indexed QPS. **Design point is ~10× under single-primary capacity.** Conclusion: replicas + partitioning, not sharding.

**Storage (year-1 at scale):**

| Table family | Volume | Size est. |
|---|---|---|
| consent_events (partitioned) | 200M rows/yr × ~350 B | ~70 GB + ~35 GB idx |
| data_principals | 100M × ~250 B | ~25 GB |
| audit_log (partitioned) | ~50M/yr × ~500 B | ~25 GB |
| Everything else (orgs, assessments, DSARs, marketing, vectors) | | < 10 GB |
| **Total hot** | | **~150–250 GB** — one Postgres, monthly partitions, 24-mo hot retention, archive to cold storage |

**Bandwidth:** ~600k pv/day × ~400 KB ≈ 7 TB/mo through Vercel CDN → $300–900/mo at list price. Mitigations: image optimization, font subsetting (done), static asset offload if the bill ever dominates.

**LLM cost — the line item that actually scales badly:** 8k calls/day × $0.008–0.03 ≈ **$2k–7k/mo unmitigated**. Mitigations are product policy, not infra: per-IP/user rate limits (exists: abuseGuard), model tiering (small model for retrieval-grounded answers), response caching for repeated questions, depth-gating behind auth. Budget alarm at $100/day.

**Takeaway:** the estimation kills the fashionable answer. At 1M users this product is a **modest-QPS, strong-consistency, event-heavy B2B system** — exactly the profile Alex Xu's hotel-reservation and payment chapters solve with one relational primary, partitions, queues, and idempotency. Not the news-feed/fan-out profile that needs NoSQL + sharding.

---

## 5. To-be architecture

### 5.1 Component choices and why

| Layer | Choice | Why (trade-off made explicit) |
|---|---|---|
| Frontend | **Next.js 16 / React on Vercel** — monorepo (Turborepo): `apps/www` (existing site, untouched), `apps/app` (paid product), shared `packages/ui`, `packages/types` | Keeps the working content machine; shares the design system (contrast-safe Button etc.); separate deploys so app churn never risks www SEO. Alternative (one app, route groups) rejected: couples release risk. |
| Backend | **Node.js + TypeScript, 3 services from one repo dir**: `api` (Fastify + zod, REST `/v1`), `worker` (BullMQ consumers), `cron` — **host: open decision O2b.** Render remains the reference model (managed, git-deploy, autoscaling, preview envs) but its region catalog has **no Mumbai**; with Mumbai decided as the territory, candidates at P4 are: a Mumbai-capable managed host (e.g. Fly.io BOM, AWS App Runner/ECS `ap-south-1`), Render Singapore + ~50 ms/query cross-region (rejected by default — chatty APIs), or staying on Vercel Fluid functions in `bom1` longer and extracting later | One language across stack (solo-founder constraint). Fastify+zod over Nest: less ceremony, zod already in repo. Decision is deferred to P4 start — by then the catalogs may have changed; the requirement that does not change: **compute and DB co-locate in Mumbai** |
| Database | **Supabase Postgres 17 (Mumbai, `ap-south-1`)** + PITR; read replica at Phase 6 | System of record for all relational/compliance data. Postgres because the domain is relationships + constraints + audit (§8). Supabase over Neon/RDS: bundles Auth, RLS tooling, storage, branch DBs for previews — fewest vendors. Region per the territory decision. |
| Auth | **Supabase Auth** — email OTP/magic link + Google OAuth; TOTP MFA for admin; JWT (asymmetric, JWKS) verified by Render api | Same vendor as DB → RLS integrates natively; no per-MAU pricing shock (Clerk at 50k+ MAU gets expensive). Clerk kept as fallback if UI velocity disappoints. **Never build auth ourselves.** |
| Tenancy | Single DB, shared schema, **`org_id` + RLS** on every tenant table; service-role key only inside Render | Alex Xu Vol 2 (hotel): partition logically first. Per-tenant DBs rejected: 5k orgs × ops burden. |
| Cache | **Upstash Redis (Mumbai)** — cache-aside for hot reads, token-bucket rate limiting, BullMQ backing | Introduced only at Phase 6 when a measured hot path exists. Serverless pricing fits spiky load. Upstash offers `ap-south-1` — co-locates with the stack. |
| Queue | **BullMQ on Redis** + **transactional outbox** table in Postgres | At-least-once delivery + idempotent consumers = exactly-once *effect* (Vol 2 queue chapter). Outbox (DDIA) so "write ledger row + send email" can't half-happen. Kafka rejected: nothing here needs log semantics at this scale. |
| Vector/RAG | **pgvector in Supabase** (HNSW) + Postgres FTS lexical, RRF in SQL | Kills the chat-index↔Pinecone lockstep failure class: chunk + embedding + lexical row commit in one transaction. 406→few-k chunks is trivial for pgvector. Pinecone retired after parity check. |
| Files | Vercel Blob stays for public PDFs; **Supabase Storage** for tenant-private files (RLS-scoped) | Private tenant docs need auth-scoped URLs; public marketing PDFs are fine where they are. |
| Payments | **Razorpay** (subscriptions + orders), Stripe only when international demand is real | India-first. Idempotent webhook design in §12.4. |
| Email/notify | Resend (kept) + Twilio WhatsApp via worker queue | Sends move off request path into workers. |
| Observability | **Sentry** (www+app+api+worker) + Render/Vercel logs + Better Stack/Checkly uptime + a `/metrics`-lite golden-signals dashboard; OpenTelemetry traces only at Phase 6 | Vol 2 metrics chapter, sized honestly: alerting first, tracing when there are enough services to trace. |
| Edge/DNS | Vercel edge for www/app; `api.saralprivacy.com` CNAME → Render. Cloudflare **not** stacked in front (own-the-layer rule) | Avoid double-proxy security/caching confusion. |
| CI/CD | GitHub → Vercel previews (www, app) + Render preview envs + **Supabase branch databases** per PR; migrations via Supabase CLI, applied by CI, never by hand | Preview-before-prod law becomes mechanically enforced for schema too. |

### 5.2 Request flows (the three that matter)

**Read (dashboard):** app.saralprivacy.com → Next.js RSC → `api.saralprivacy.com/v1/...` (JWT) → Fastify → (Redis cache-aside at P6) → Postgres via RLS-scoped client → JSON. p95 budget: 250 ms.

**Write with side effects (e.g. DSAR created):** api → single Postgres tx: `insert dsar_requests` + `insert audit_log` + `insert outbox` → commit → 201. Outbox relay (worker) publishes → BullMQ → consumers send acknowledgement email, schedule deadline reminders. Consumer idempotency key = outbox event id. Crash anywhere = no lost or duplicated side effect.

**Consent ingestion (F9, the 60 QPS path):** customer site → `POST /v1/consent-events` (org API key, rate-limited) → api validates + pushes to queue (fast 202) → worker batch-inserts 500-row chunks into monthly partition. Backpressure = queue depth alarm; degradation = 429 with Retry-After, never dropped silently.

---

## 6. As-is → to-be comparison (the requested side-by-side)

| Component | WHERE WE ARE (today) | WHERE WE GO (1M target) | Trigger to move |
|---|---|---|---|
| Frontend | One Next.js 16 monolith on Vercel, 78 pages | Same tech; monorepo `apps/www` + `apps/app` on Vercel | First paid-app screen (Phase 5) |
| Content | Content-as-code (~50k LOC), SSG/ISR, CDN | **Unchanged** (deliberate) | Only if build minutes wall at ~thousands of pages → content store + ISR |
| Backend/API | 40 Next API routes in the monolith | Render `api` (Fastify/zod, REST /v1, autoscaled) + `worker` + `cron`; transactional routes strangled out, content helpers stay on Vercel | Phase 4; chat stays on Vercel until voice/WebSockets |
| Database | Appwrite (SG), 19 collections, doc-store, 10-char quirks | Supabase Postgres (Mumbai `ap-south-1`): constraints, FKs, partitions, PITR — the compliance ledger | Phase 2 (migration §9) |
| Auth | None; forgeable admin cookie (fix built, unmerged) | Supabase Auth: JWT+JWKS, MFA admin, org roles, RLS | Phase 1 merge → Phase 3 |
| Tenancy | n/a (stateless tools) | org_id + RLS everywhere; service-role only server-side | Phase 5 |
| Cache | CDN only (no hot DB path exists) | + Redis cache-aside on measured hot reads | Phase 6, only with p95 evidence |
| Jobs/queue | 3 Vercel crons; in-function PDF/email | BullMQ workers + outbox; Render cron | Phase 4–6 |
| Vector/RAG | Pinecone + chat-index.json (lockstep trap) | pgvector + FTS in same DB, transactional ingest | Phase 6 (or first chat touch) |
| Payments | None | Razorpay, idempotency keys, reconciliation job | Pounce P2 = Phase 5 |
| Files | Vercel Blob (public) + Appwrite bucket | Blob (public) + Supabase Storage (tenant-private) | Phase 5 |
| Observability | Vercel Analytics + raw logs | Sentry + uptime + golden-signal SLO dashboard + burn-rate alerts | Phase 6 (alerting the week Razorpay ships) |
| Rate limiting | abuseGuard (chat only) | Token-bucket in Redis at api edge, per-IP/key/org | Phase 6 |
| Regions | Vercel sin1 + Appwrite SG | **Mumbai territory (✅ decided):** Supabase `ap-south-1` + Vercel functions `bom1`; P4 backend host must be Mumbai-capable (O2b) | Supabase at P2; functions at P2 contract |
| DR | Appwrite defaults | PITR RPO≤5min, quarterly restore drill, cold-standby runbook RTO≤60min | Phase 7 |
| IDs | Appwrite `$id` strings | UUIDv7 (time-ordered, index-friendly) + `legacy_id` for lineage | Phase 2 |
| Cost/mo | ~$45–70 | ~$900–2,200 ex-LLM at 1M (≈1–2% of modeled revenue); LLM $2–7k managed by policy | §14 |

**What deliberately does NOT change:** content-as-code + SSG (the cheapest scale trick we own), sectors.ts as single source of truth, the design system, Resend, preview-before-prod, Vercel for all frontends.

---

## 7. Domain model — the compliance ledger (why Postgres wins)

The paid product's nouns are the Act's nouns, and they are relational:

```
organisations ─┬─ org_members ── users(auth)
               ├─ subscriptions ── payments ── invoices
               ├─ business_profiles (migrated)
               ├─ ropa_activities ─── activity_vendors ── vendors
               ├─ consent_purposes ── consent_events (PARTITIONED monthly)
               ├─ data_principals (the 100M-row table)
               ├─ dsar_requests ── dsar_events (state machine, deadline SLA)
               ├─ notices ── notice_versions (immutable published copies)
               ├─ breach_incidents ── breach_events
               ├─ documents (Supabase Storage refs)
               └─ audit_log (append-only, PARTITIONED)
```

Design rules (Vol 2 hotel-reservation discipline):

- **UUIDv7 PKs** everywhere; migrated rows carry `legacy_id text` (the Appwrite `$id`).
- **State machines as constraints:** `dsar_requests.status` transitions enforced by trigger + audit row; deadlines computed columns → the DSAR-SLA reminder query is an index scan.
- **Immutable event tables** (`consent_events`, `audit_log`, `*_events`): INSERT-only, no UPDATE grant even to service role; monthly `PARTITION BY RANGE (occurred_at)`; retention = detach + archive partition to storage.
- **RLS policy pattern:** every tenant table has `org_id uuid not null references organisations`; policy `using (org_id in (select org_id from org_members where user_id = auth.uid()))`; admin routes use service-role through the Render api only. The browser never holds a key that can cross tenants.
- Marketing/ops tables (`subscribers`, `leads`, `outreach_contacts`, `email_send_log`, `ai_citations`, `blog_posts`, `blogger_accounts`, `survey_responses`, `chat_feedback`) live in an `ops` schema — no RLS tenancy, service-role only, cleanly separable later.

---

## 8. API contract (Render `api`)

- REST, versioned `/v1`, JSON; zod schemas shared from `packages/types` → request validation and typed clients from one source; OpenAPI generated (`zod-openapi`) for future partner/consent-SDK use.
- AuthN: Supabase JWT (Authorization: Bearer) verified against JWKS — no auth round-trip per request. Machine callers (consent ingestion): per-org hashed API keys with scopes.
- Conventions: cursor pagination (no OFFSET on big tables), `Idempotency-Key` honored on all POSTs that create money or ledger state, RFC 7807 error bodies, `Retry-After` on 429.
- Strangler seam: `next.config` rewrite `/api/v1/:path* → https://api.saralprivacy.com/v1/:path*` so frontends never hardcode the split; legacy Next routes keep working until each module flips.

---

## 9. Appwrite → Supabase migration plan (comprehensive)

**Answer: yes, and this is the lowest-risk phase of the whole program.** Volumes are tiny (thousands of rows, single-digit writes/day), there are no cross-collection transactions today, and every consumer is our own code behind `lib/appwrite.ts` — one seam to cut.

### 9.1 Inventory & mapping (all 19 collections + bucket)

| Appwrite collection | Target table (schema) | Notes |
|---|---|---|
| leads | ops.leads | straight map |
| subscribers | ops.subscribers | + unique(email), suppression flags |
| downloads / template_downloads | ops.template_downloads | merge; keep `source` attr |
| assessments | app.assessments | `report_type` becomes full-length text (10-char cap dies) |
| briefings | app.briefings_meta | approval state only; content stays in repo |
| consent_log | app.site_consent_log | our own site's consent records |
| survey_responses | ops.survey_responses | |
| blog_posts / blogger_accounts | ops.blog_posts / ops.blogger_accounts | admin CRM |
| outreach_contacts / email_send_log | ops.outreach_contacts / ops.email_send_log | + FK between them |
| ai_citations | ops.ai_citations | AEO panel output |
| notice_captures / notice_runs / notice_events | app.notice_* | notice builder funnel |
| business_profiles | app.business_profiles | becomes child of organisations later |
| dsar_requests | app.dsar_requests | seeds the real DSAR module |
| chat_feedback | ops.chat_feedback | |
| Storage bucket | Supabase Storage `legacy` bucket | enumerate files, re-upload, rewrite `getFileViewUrl` |

### 9.2 Procedure (expand → backfill → verify → flip → contract)

1. **Expand.** Write Supabase DDL migrations (all tables, `legacy_id text unique`, `created_at` from `$createdAt`). RLS ON with deny-all default; service-role only. CI applies to a branch DB first.
2. **Seam.** Introduce `lib/db/` with the same function signatures the 40 routes already call; env flag **per module** (`DATA_BACKEND_SUBSCRIBERS=appwrite|supabase` …). Lazy-init the Supabase client the same way the Appwrite Proxy does (build-without-env lesson carries over).
3. **Backfill.** Node script in `tools/`: paginated `listDocuments` per collection → JSONL snapshot committed to a private location → transform → `upsert on conflict (legacy_id)` into Supabase. Idempotent = re-runnable at any time.
4. **Verify.** Per collection: row counts equal, min/max created_at equal, random-20 deep-diff equal, app-level read parity (same API JSON from both backends on preview).
5. **Flip, one module at a time,** lowest risk first: `template_downloads` → `subscribers` → `survey/contact` → `notice_*` → `outreach_*` → `assessments` → admin CRM. Each flip: preview → verify → prod flag → watch Sentry/logs 48h. Because writes are sparse, run a **final delta backfill** at flip moment (re-run step 3 — idempotent) instead of dual-writing; a write-freeze window of minutes, not hours.
6. **Contract.** After all modules green ~7 days: Appwrite → read-only; after 30 days: final JSONL archive + delete project; remove `lib/appwrite.ts`, the lazy Proxy, and the 10-char workarounds.

**Rollback at any point:** flip the module's env flag back; Appwrite untouched until step 6. **Effort: ~24–32h.** Explicitly out: no dual-write infrastructure (unjustified at these volumes), no big-bang cutover.

---

## 10. Authentication rollout (no auth today → org-grade)

1. **Admin first** (kills the forged-cookie class for good, after P0 merge already hardens it): Supabase Auth email+password+TOTP, `role=admin` claim, `@supabase/ssr` HttpOnly session cookies, middleware guard on `/admin/*` + service-role moves behind Render api later. Delete `ADMIN_PASSWORD` path.
2. **Customer accounts** (with paid app): magic-link/OTP + Google OAuth; onboarding creates `organisations` + `org_members(owner)`; invite flow adds members; JWT stays slim (no org claims — membership resolved by RLS join).
3. **Machine auth**: per-org API keys (hashed, scoped, rotatable) for consent ingestion.

---

## 11. Scale & reliability engineering (Alex Xu patterns, sized to the numbers)

- **Stateless tiers (Vol 1 Ch 1):** api holds zero session state → Render autoscale 2..N on CPU/latency; frontends already stateless.
- **Caching (cache-aside):** CDN/ISR today does 95% of the work. Redis added at Phase 6 for *measured* hot reads (dashboard aggregates, org settings), TTL + explicit invalidation on write, stampede-guarded (single-flight). Never cache tenant data keyed without org_id.
- **Rate limiting (Vol 1 Ch 4):** token bucket in Redis — per-IP (public), per-user (app), per-org (API keys); 429 + Retry-After; chat abuseGuard folds into it.
- **Queues (Vol 2):** BullMQ, at-least-once, consumers idempotent by event id; DLQ + alarm on depth/age; outbox relay for DB-coupled events.
- **Payments (Vol 2 payment ch):** order state machine in Postgres; `Idempotency-Key` on create; Razorpay webhook signature-verified, processed idempotently (unique event id); **daily reconciliation job** diffs Razorpay settlements vs ledger and alerts on drift; refunds are compensating entries, never row edits.
- **Read replica (Phase 7):** report/analytics queries pinned to replica; primary reserved for OLTP. Replication-lag-aware: never read-your-own-write from replica.
- **Partitioning before sharding:** monthly partitions on the two event giants; sharding (by org_id) documented as a >1–2 TB / write-saturation trigger only — with 100M principals we are an order of magnitude away.
- **Observability (Vol 2 metrics ch):** golden signals per service (traffic, errors, latency, saturation) + business SLIs (assessment completions, payment success rate, DSAR SLA breaches); burn-rate alerts on the 99.9% budget; Sentry release tracking tied to deploys.
- **Degradation paths:** chat → lexical-only fallback (exists, keep); Redis down → api serves from Postgres (slower, correct); queue down → writes still commit, outbox drains on recovery; Anthropic down → chat offline banner, site unaffected.
- **Load test (k6) at Phase 6 exit:** 500 QPS mixed profile, p95 within budget, zero 5xx at design point — the number the whole spec stands on.

---

## 12. Security & compliance-by-construction

OWASP ASVS L2 posture: RLS isolation tests in CI (cross-tenant read attempt must fail), zod validation at every boundary, secrets only in platform env managers, api CORS locked to our origins, webhook signature verification (Resend today, Razorpay next), append-only audit_log, admin MFA, dependency audit in CI. **Dog-food DPDPA:** our own privacy notice, consent records, retention schedule, and DSAR flow run on the same ledger we sell — `privacy-vendors.ts` law extends: adding any processor (Supabase, Render, Upstash, Sentry) updates the vendor table + privacy notice *in the same PR*, and each needs a DPA + sub-processor listing before prod data touches it.

---

## 13. Cost model (monthly, honest ranges)

| Stage | Infra ex-LLM | LLM | Notes |
|---|---|---|---|
| Today | ~$45–70 | <$50 | Vercel Pro + Appwrite + Resend |
| First customers (P5) | ~$150–300 | <$200 | + Supabase Pro $25, Render ~$40, Sentry $26 |
| 1M MAU | **~$900–2,200** | **$2k–7k → policy-managed** | Vercel $400–1000 (bandwidth-dominated) · Render api×2–3 + worker $100–200 · Supabase compute+PITR $250–500 · Upstash $20–80 · Sentry/uptime $50–120 · Resend $90–300 |

Modeled revenue at that stage (5k orgs × ~₹2k/mo blended) ≈ ₹1 cr/mo → infra ex-LLM ≈ **1–2% of revenue**. The LLM line is the one to manage weekly; set a $100/day alarm from Phase 6.

---

## 14. Transformation roadmap (sequence + tentative hours + monitorable steps — no dates)

> Format per sprint-plan law. Each phase ends on preview with explicit confirmation before prod. Hours are tentative single-operator estimates.

**Phase 1 — Land P0 security (~4–6h) · PRECONDITION**
Merge `worktree-p0-security` (already code-complete: forged cookie dead 5/5, 118 tests). Steps: rebase → preview → re-run C1 proof on preview → confirm → merge. *Exit: forged `admin_session` rejected on prod; unauth `POST /api/outreach/import` dead.*

**Phase 2 — Supabase foundation + full Appwrite migration (~24–32h)**
§9 end-to-end: DDL migrations in repo → seam (`lib/db/`) → backfill script → per-module flips → contract. *Exit: zero runtime Appwrite calls for ≥7 days; parity checks archived; 10-char workaround deleted.* Trigger: immediately after Phase 1 — this also unblocks Razorpay work landing on a real ledger.

**Phase 3 — Real auth, admin first (~10–16h)**
§10 step 1. *Exit: admin login = Supabase session + MFA; `ADMIN_PASSWORD` env deleted; RLS deny-all verified by a failing cross-role test.*

**Phase 4 — Backend extraction to Render, strangler (~32–48h)**
Stand up `api`/`worker`/`cron` (Fastify skeleton, healthz/readyz, Sentry, deploy from repo) → move crons → move outreach/briefings/notice/admin-data routes behind `/v1` rewrites module-by-module → workers take email + PDF (puppeteer leaves the request path). Chat stays on Vercel. *Exit: Vercel runs pages + chat + content helpers only; each moved module has contract-test parity; crons run on Render with success alerts.* Trigger: Phase 2 done; do not start before — the backend must be born on Postgres, not Appwrite.

**Phase 5 — Paid app + payments (~48–80h) · = Operation Pounce P2 lane**
`apps/app` scaffold on `app.saralprivacy.com` → customer auth + org onboarding (§10.2) → ledger modules v1 (assessment history, notices, DSAR tracker) → Razorpay orders/subscriptions with §11 idempotency + reconciliation → migrate notice/DSAR fragments to org-owned. *Exit: a stranger can pay and use it; Pounce Gate 3 counters measurable from the ledger itself.* Trigger: Phases 2–4; Gate discipline: ship smallest sellable slice, Pounce not-do list still applies.

**Phase 6 — Scale hardening (~32–48h)**
Redis (cache-aside where p95 evidence says, rate limiter everywhere public) → BullMQ+outbox under all side effects → observability full (§11: SLOs, burn-rate alerts, uptime, $100/day LLM alarm) → pgvector consolidation, retire Pinecone → k6 load test to 500 QPS. *Exit: load-test report in repo; alerts fire in a drill; lockstep failure class extinct.* Trigger: first paying cohort live (revenue → reliability, the session's own rule).

**Phase 7 — 1M-readiness (~24–40h, then ongoing)**
Read replica + query pinning → monthly partitions live on consent_events/audit_log with retention jobs → PITR restore drill (timed, documented) → cold-standby runbook rehearsal → capacity review vs §4 numbers each quarter. *Exit: restore drill ≤60 min proven; partition pruning shown in EXPLAIN; a one-page capacity dashboard.* Trigger: ≥~500 orgs or consent ingestion (F9) turned on, whichever first.

**Total: ~180–270h.** Strict order 1→2→3→4→5; 6–7 gated on revenue/scale evidence, not calendar.

---

## 15. What we deliberately do NOT build (and the trigger that would change it)

| Not building | Would revisit when |
|---|---|
| Microservices | A second team exists, or a bounded context demonstrably needs independent deploy cadence |
| Kubernetes / AWS primitives | Managed platforms miss a hard requirement (e.g. GPU inference in-VPC) |
| Sharding / Citus | Hot tables >1–2 TB or primary write saturation despite partitions |
| Multi-region active-active | Contractual RTO/latency demands + revenue to fund it; until then PITR + cold standby |
| Kafka | Event volume or fan-in/out beyond BullMQ's honest range (≥10× design point) |
| MongoDB | Never for the ledger; JSONB covers document-shaped needs |
| GraphQL | Multiple third-party client shapes demand it; REST+zod serves two first-party apps fine |
| Self-built auth | Never |

---

## 16. Risks

| Risk | Sev | Mitigation |
|---|---|---|
| Solo-founder bandwidth: 180–270h competes with selling | High | Phases independently valuable; Pounce gates pace them; Phase 5 is the only revenue-critical path |
| Migration data loss | Low | Idempotent backfill, per-module flags, Appwrite kept 30 days, JSONL archives |
| Backend host gap: Render has no Mumbai region (territory = Mumbai, decided) | Med | O2b: pick a Mumbai-capable host at P4 (Fly BOM / AWS `ap-south-1`) or extend Vercel `bom1` Fluid; never split compute from DB across regions |
| LLM cost runaway | Med | Rate limits + tiering + daily alarm (§4) |
| RLS policy bug = tenant leak | High | CI cross-tenant test suite; service-role never in browser; pen-test before Phase 5 exit |
| Strangler leaves zombie routes | Med | Route inventory checklist in Phase 4 PR template; 404-log watch after each module move |
| Vercel bandwidth bill at content scale | Low | Monitor; image/static offload lever documented |

---

## 17. Open decisions

| # | Decision | Default until decided |
|---|---|---|
| O1 | Supabase Auth vs Clerk for customer UX polish | Supabase Auth |
| O2 | Region | ✅ **DECIDED (2026-09-02): Mumbai is the hosting territory.** Supabase `ap-south-1` at P2; Vercel functions → `bom1` at P2 contract |
| O2b | Backend host for P4 (Render has no Mumbai region) | Evaluate at P4 start: Fly.io BOM / AWS `ap-south-1` managed / stay on Vercel `bom1` Fluid longer. Hard requirement: compute+DB co-located in Mumbai |
| O3 | Consent-ingestion SDK (F9) in v1 of paid app or later | Later — it is the biggest scale driver and the least-validated feature |
| O4 | Supabase Storage vs Blob for tenant docs | Supabase Storage (RLS URLs) |
| O5 | Fastify vs Hono for api | Fastify (ecosystem maturity) |

---

## 18. Reference map (where each practice comes from)

Vol 1: Ch 1 scale-from-zero (stateless tier, replica, cache, CDN → §5, §11) · Ch 2 estimation (§4) · Ch 3 framework (this doc) · Ch 4 rate limiter (§11) · Ch 7 unique IDs (UUIDv7, §7) · Ch 10 notification system (outbox+workers, §5.2) · Ch 12 chat (SSE now, WS trigger §15).
Vol 2: distributed queue (at-least-once + idempotent consumers, §11) · metrics/alerting (golden signals, burn rate, §11) · hotel reservation (relational constraints, partitioning, §7) · payment system (idempotency, reconciliation, §11) · ad-click aggregation (batch event ingestion, §5.2).
DDIA (Kleppmann): transactional outbox, replication-lag reads. Fowler: strangler fig (§8, §14 P4).

---

*End of spec. Nothing above overrides: preview-before-prod, Pounce phase order, sprint-plan format, presentation-unified law.*
