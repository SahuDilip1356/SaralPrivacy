# SaralPrivacy (saralprivacy.com): Design Dossier

> Lives at `docs/system-design.md`. Target about 2 pages; depth is in the linked specs.
> Owner: Dilip Sahu · Last updated: 2026-10-17 · Skill version: system-design-principles v1.2 (+ book-rules: DDIA, Clean Architecture, Pragmatic Programmer)
> Update when: a seam is crossed · a decision changes · a 10× growth step · an incident · a milestone review.
> Basis: architecture review of `origin/main` @ `2bb9cf5` (2026-10-09). Production env vars were not readable (Vercel 403), so which `DATA_BACKEND_*` flags are set in production is taken from project memory, not verified.

## 0. Review status (2026-10-17)

The shape is right for the load: one modular Next.js monolith on Postgres, at about 27 visitors a day. Nothing is over-built. The risk sits in write semantics on compliance data and in seams that hold only by convention. Findings are ranked by blast radius.

| # | Severity | Finding | Evidence | Fix shape |
|---|---|---|---|---|
| F1 | Critical | Admin "Send briefing" mails unsubscribed, bounced and complained addresses | `webapp/app/api/briefings/send/route.ts:39` reads `queryDocuments("subscribers", { limit: 1000 })` with no status filter; called from `admin/briefings/page.tsx:58`. `outreach-send` cron also skips the unsubscribe check | Use `fetchEligibleSubscribers()`. Make the gateway the only source of an audience; lint-ban `resend` imports outside it |
| F2 | Critical | Consent proof fails open | All 7 `consent_log` writers are non-awaited `.catch(console.error)` (e.g. `app/api/assessment/route.ts:132`); no `after()`/`waitUntil`. Contact-step consent boxes are never sent (`SurveyClient.tsx:580-582` vs `:659-661`). Unsubscribe never writes `consent_log` (`subscribers/unsubscribe/route.ts:55-58`). The table is mutable (`withdrawn_at`, `updated_at`; `0005` grants update/delete) | Await the consent write in the same transaction or RPC as the business row, and fail the request if it fails. Withdrawal is a new row. Add a trigger blocking UPDATE/DELETE. Branch `fix/consent-flags-withdrawal` covers the two flag gaps only |
| F3 | High | Bulk sends are not idempotent | No Resend `idempotencyKey`; `status: "sent"` only after the loop (`cron/briefing-send/route.ts:98`); `briefings/approve` sends on a GET (link scanners prefetch) with a non-constant-time token compare; the publish "duplicate guard" never matches and `briefings_meta.slug` is not unique | Claim with `UPDATE … SET status='sending' WHERE status='approved' RETURNING`. Per-recipient unique row in `email_send_log` before the send, reused as the idempotency key. Approve becomes a POST. Unique slug + upsert |
| F4 | High | No gate between a push to `main` and production | `webapp/package.json` has no `test`/`typecheck` script; `.github/workflows/deploy.yml` only echoes; 26 `node:test` files and the 77-case Setu eval never run before a deploy | One GitHub Actions workflow (lint, typecheck, `node --test`, build) as a required check on `main` |
| F5 | High | The `lib/db` seam is unenforced and falls back to the retired vendor | `lib/db/flags.ts:64` returns `"appwrite"` for any unset or misspelled flag (locked by `db.test.ts:18`); `lib/seo/db.ts:71-81` is a second data layer with the service-role key and raw `fetch`; AI SDKs imported in route handlers; no `no-restricted-imports`; no `server-only` in `lib/db` | Default to Supabase, then delete `lib/appwrite.ts` and `node-appwrite`. Lint ban on vendor imports outside the adapters. Fold `lib/seo/db.ts` into `lib/db` |
| F6 | High | Compute in Singapore, database in Mumbai | Both `vercel.json` files say `"regions": ["sin1"]`; breaks D1 (compute and DB never split) | The pending October close-out (G2): `sin1` → `bom1` |
| F7 | Medium | Security edge gaps | `blog/save` PATCH has no ownership check and takes `status`/`author` from the client; `GET /api/blog/[id]` returns drafts unauthenticated; admin sessions are stateless for 8h (bans and logout don't revoke); rate limits are in-memory per instance (`lib/abuseGuard.ts:45`) | Ownership check + server-set author/status; filter drafts; session version or deny-list in DB; Postgres-backed limiter for login, MFA and chat |
| F8 | Medium | Failures are invisible | No error tracking or request IDs; 135 bare `console.*` calls; health endpoint only for chat | Error tracking or log drain; request ID echoed in error responses; alert on failed consent writes and sends |
| F9 | Medium | Facts copied by hand | The 12 sector slugs appear as literals in 23–31 files with 6+ parallel lists; 142 "Section N(M)" literals; 3 hard-coded model ids; 3 "keep in sync" schema comments; a possible third sender (`workflows/n8n_email_workflow.json`) | `SECTORS` as the parent type; citations from `content/dpdp-act-2023.ts` only; model ids in versioned config; confirm n8n is off |
| F10 | Medium | Setu below house AI defaults | Model hard-coded (`app/api/chat/route.ts:211`), no provider port, no timeout or cost ceiling on the model call, raw user text sent to Anthropic unredacted; eval scores routing only, 4 negative rows, not in CI | Provider port + versioned prompt/model config; timeout + spend ceiling; redact before send; see §12 |

## 1. Archetypes

| Bounded context | Archetype | Dominant constraint | First scale lever |
|---|---|---|---|
| Briefings, learn pages, industries, data-flow maps | Content / read-heavy | Read latency, SEO, citation correctness | ISR/CDN hit ratio |
| Send engine (briefings, outreach, transactional) | Workflow / pipeline | Exactly-once *effect*, suppression | Queue-backed worker past 300s |
| Briefing generation pipeline (GitHub Actions + Python) | Workflow / batch | Idempotent publish, reproducibility | Persist intermediates |
| Consent log | Transactional ledger | Immutability, proof under DPDPA s.6(10) | Partition by time, archive cold rows |
| Assessments, leads, subscribers, blog admin | CRUD | Correctness, iteration speed | Read replica (not needed) |
| Setu chat | AI / agentic | Correct, cited answers; cost | Prompt caching, model routing |

The ledger is currently built as CRUD (mutable rows, generic `updateDocumentById` accepts it). That mismatch drives F2.

## 2. Requirements & the number

- Real users now: about 27 visitors/day (Oct 2026); about 1,140 visitors over 3 months, about 10% reach `/assessment`, about 1 completion in the Sep-6 baseline. Target: not set. Graduation signal being watched: assessment completion rate (current bottleneck is on-site conversion, not reach).
- Functional: (1) read briefings and learn content; (2) take a sector assessment and receive a report; (3) subscribe to and unsubscribe from briefings; (4) ask Setu a DPDPA question; (5) admin: approve and send briefings, author blog posts, read leads and consent.
- Non-functional: latency target not set; availability target not set; consistency: strong for consent and subscribers (single Postgres primary), eventual for derived content (chat index, ISR); retention: not defined (see §7); compliance: DPDPA s.6 (consent, withdrawal as easy as giving), s.8 (security safeguards, erasure), s.8(9) DPO contact.
- Assumptions: one founder plus agents, no on-call; every infra component in Mumbai (D1).

## 3. Envelope

| Quantity | Estimate | Basis |
|---|---|---|
| Page views | ~30–50/day | Vercel Analytics, week of Oct 3–10: 224 views |
| Writes (assessments, leads, subscribes, consent) | < 20/day | Funnel above; each submission writes 2–4 rows |
| Briefing send ceiling per run | ~1,000 recipients | `maxDuration=300`s ÷ (100ms fixed delay + ~200ms Resend round trip) |
| Chat calls | ≤ 60/hour per IP | The only effective limit (F7) |
| Storage growth | Negligible (MB/year) | Row counts above |

The only number near a limit is the send ceiling: the loop runs in one function invocation. That is the first graduation trigger (§ closing line).

## 4. High-level design

```
Browser / PWA ──► Vercel (Next.js 16, functions sin1 → bom1) ──► lib/db seam ──► Supabase Postgres (Mumbai, RLS deny-all)
     │                 │  proxy.ts (pages only; /api excluded)          └─► Supabase Storage
     │                 ├─► Resend (email, US)        ├─► Twilio (WhatsApp)
     │                 ├─► Anthropic (Setu, US) ◄── Pinecone + public/chat-index.json (BM25 fallback)
     │                 └─► Vercel Blob (static templates)
GitHub Actions daily-briefing ─► Python pipeline (SerpAPI, Claude, KIE) ─► POST /api/briefings/generate
Vercel crons: outreach-send 04:00 UTC · briefing-send 04:30 UTC · aeo-panel Mon 03:30 UTC
```

- API: 44 route handlers under `webapp/app/api`. Authorisation lives in each handler (`requireRole`), because `proxy.ts`'s matcher excludes `/api`.
- Data model: 19 tables across the `app` and `ops` schemas (`supabase/migrations/0001_initial_schema.sql`); the port is a generic document API (`insertDocument`, `queryDocuments`, …) still shaped by Appwrite field names (`$id`, `$createdAt`).

## 5. Seams

| Likely change | Seam | Modules touched | Enforcement |
|---|---|---|---|
| New send channel or audience (WhatsApp digest, segment) | `sendGateway`: suppression → claim → send → log | 1 | Lint ban on `resend`/Twilio imports outside the gateway (missing today) |
| New consent purpose or notice version | Purpose registry + append-only `consent_log` | 1 + data | DB trigger + enum column (missing today) |
| 13th sector | `lib/data/sectors.ts` as the parent type | 1 + content | `Record<SectorSlug, …>` typecheck (today: 23–31 files) |
| Model or provider swap | AI provider port + versioned prompt/model config | 1 | Lint ban on `@ai-sdk/*` outside the port; eval in CI (missing today) |
| Region or host move (O2b) | `webapp/vercel.json` region + `lib/db` | Config only | CI assertion region = `bom1` |
| Vendor swap for data | `lib/db` adapters + `flags.ts` | 1 | `no-restricted-imports` (missing today) |

## 6. Decision records

| # | Decision | Alternatives rejected | Consequences | Reversibility | Date | Status |
|---|---|---|---|---|---|---|
| D1 | All infrastructure in Mumbai (`ap-south-1` / `bom1`); compute and DB never split | Singapore, US regions | Rules out Render; functions must move off `sin1` | One-way for data, two-way for compute | 2026-09-02 | Accepted; compute not yet compliant (F6) |
| D2 | Supabase Postgres (Mumbai, PG 17) is the system of record; RLS deny-all | MongoDB Atlas, staying on Appwrite | One store; app uses the service role, so RLS guards only direct API access | One-way | 2026-09-05 | Accepted |
| D3 | Appwrite retired; final archive taken | Keep as fallback | Fallback code and default must go (F5) | Two-way until code is deleted | 2026-09-08 | Accepted; code still present |
| D4 | Data access only through `lib/db`, per-module backend flag | Direct SDK use | Seam exists, not enforced (F5) | Two-way | 2026-09 | Accepted |
| D5 | Vercel + Next.js 16, single middleware `proxy.ts`, `rootDirectory = webapp` | Separate backend host | Function time limit is the scale ceiling | Two-way | Ongoing | Accepted |
| D6 | Mobile = PWA + TWA; service worker never touches `/api` or `/admin` | Native apps | — | Two-way | 2026-09-08 | Accepted |
| D7 | Consent writes are awaited and transactional with the business row; consent_log is append-only | Background writes (current) | Slightly slower submissions; a failed consent write fails the request | Two-way | 2026-10-17 | Proposed |
| O2b | Backend host at extraction time | Render (no Mumbai) | Recommendation pending: stay on Vercel `bom1`, extract a worker only on a trigger (job > 300s, DLQ, WebSockets) | Two-way | — | Open |

## 7. Data & privacy map

| Personal data | Purpose (DPDPA) | Stored where (region) | Retention | Processors / vendors | Erasure path |
|---|---|---|---|---|---|
| Name, email, phone, company, assessment answers | Report delivery; follow-up (s.6 consent) | Supabase `app.assessments`, `leads`, `survey_responses` (Mumbai) | Not defined | Supabase; Vercel (in transit, US); Resend (US) | None in code; "email the DPO" (`/rights#erasure`) |
| Email, name, sector, status | Briefing newsletter (s.6) | Supabase `app.subscribers` (Mumbai) | Not defined | Resend (US) | Unsubscribe sets status; no erasure; suppression depends on the row |
| Consent events (email, IP, UA, city, notice version) | Proof of consent (s.6(10)) | Supabase `app.consent_log` (Mumbai) | Not defined; must outlive erasure of the subject's other data | — | Must not be erased with the subject; needs a policy |
| Chat messages | Answer DPDPA questions | Not stored except redacted feedback/handoff | Not defined | Anthropic (US), Pinecone | — |
| Phone (WhatsApp delivery) | Template delivery | Lead row (Supabase); storage by Twilio not verified | Not defined | Twilio | None in code |
| Page views (hashed, daily reset) | Analytics | Vercel Web Analytics (US) | Vendor default | Vercel | — |

Gaps: `lib/data/privacy-vendors.ts` (the public processor table) still lists Appwrite and omits Anthropic, Pinecone and Twilio; the Setu disclosure fix is on preview (`fix/privacy-setu-disclosure`). `app.dsar_requests` exists but no code reads or writes it. All 6 DPAs are "available", none executed. Compute the residency line from the vendor list; never hand-write it.

## 8. Threat model (STRIDE per trust boundary)

| Boundary | Threat | Mitigation | Check |
|---|---|---|---|
| Public → API | Spoofed or replayed submits (duplicates) | Idempotency key per submission | Missing (F2, F3) |
| Public → API | Abuse / cost exhaustion (chat, downloads) | Per-IP limits | In-memory only; no spend ceiling (F7, F10) |
| Email link → API | GET-triggered side effects (approve, prefetch) | POST + constant-time token compare | Missing (F3) |
| Blogger → admin API | Elevation: edit or publish others' posts | Ownership check | Missing (F7) |
| Admin session | Session survives ban or logout (8h) | HMAC tokens, aal2 MFA, constant-time compare | No revocation (F7) |
| Server → client bundle | Service-role key leak | Read only in `lib/db/supabase.ts` | No `server-only` guard (F5) |
| User → Setu | Prompt injection, leakage | Regex guard, signed history, nonce delimiter, output leak scan | `guard.test.ts`; not in CI (F4) |
| App → Postgres | Repudiation / tampering of consent | — | No append-only trigger (F2) |

## 9. Quality targets

None are set today. Proposed:

| Target | Value | Measured by | Alert at |
|---|---|---|---|
| p95 latency (assessment submit) | < 1.5s | Vercel function logs | > 3s for 1h |
| Availability | 99.5% monthly | Uptime check on `/` and `/api/chat/health` | 2 failed checks |
| RPO / RTO | RPO 24h / RTO 4h | Supabase backups (plan to confirm); restore drill | No restore test on record: run one |
| Consent write success | 100% | Count of failed consent writes | Any failure |
| Cost per user / request | Not measured | Vercel + Anthropic invoices | — |

## 10. Cost model

Not measured. Known lines: Vercel Pro, Supabase, Resend, Anthropic (Setu, briefings, blog tools), Pinecone, OpenRouter (AEO panel), SerpAPI, KIE, Twilio. At the current number, Anthropic usage is likely the largest variable line; confirm from invoices before the next scale decision.

## 11. Agent build plan (Level 2)

| Ticket (per seam) | Blocks / blocked by | Context pointers | Check that must exist first |
|---|---|---|---|
| T1 Route admin send through `fetchEligibleSubscribers()` | None | `app/api/briefings/send/route.ts:39`, `lib/sendGateway.ts` | Test: unsubscribed fixture is not in the audience |
| T2 CI gate: lint, typecheck, `node --test`, build | Blocks T3–T8 | `webapp/package.json`, `.github/workflows/` | Required status check on `main` |
| T3 Consent: awaited, transactional, append-only; withdrawal row on unsubscribe; send contact-step flags | After T2; merge with `fix/consent-flags-withdrawal` | `app/api/assessment/route.ts:132`, `SurveyClient.tsx:580-661`, `0001`/`0005` migrations | Migration ships first; test that UPDATE on `consent_log` fails |
| T4 Send claims + idempotency keys; approve → POST; unique slug | After T2 | `cron/briefing-send`, `cron/outreach-send`, `briefings/approve`, `briefings/generate:325` | Test: two concurrent runs send once |
| T5 Seam: default Supabase, delete Appwrite code, lint ban, fold `lib/seo/db.ts`, `server-only` | After T2 | `lib/db/flags.ts:64`, `lib/db/index.ts:7`, `eslint.config.mjs` | Lint rule fails on a planted import |
| T6 Region `sin1` → `bom1` | Independent; preview first | `webapp/vercel.json`, root `vercel.json` (delete), `*.backup` (delete) | Preview latency check |
| T7 Security edge: blog ownership, draft filter, session revocation, DB-backed limiter | After T2 | `blog/save:175`, `blog/[id]`, `lib/adminSession.ts`, `lib/abuseGuard.ts` | Route tests per role |
| T8 Observability: error tracking, request IDs, failure alerts | After T2 | All route handlers | Synthetic failure shows up in the alert channel |

Build-prompt lines: deployment target Vercel `bom1` + Supabase Mumbai · unit test per query (true / false / false-positive / injection) · no secrets on public routes · migrations ship separately · every increment lists what it can break, loud or silent.

## 12. Eval plan (Level 3, required for every AI surface)

| AI surface | Correct means | Dataset source | Goldens by | Negative rows | Scorer | Trajectory? | Live guardrail | Ship bar |
|---|---|---|---|---|---|---|---|---|
| Setu chat | Cites the right page; answer matches the Act; refuses off-scope | `eval/chat-golden.json` (77 cases) + real redacted questions | Dilip (provenance not recorded today) | 4 today; add jailbreak, injection, wrong-law (CCPA/GDPR) and PII rows | Deterministic URL match (today); add citation check against `content/dpdp-act-2023.ts`; judge last | No tools today | Injection regex, signed history, leak scan; add timeout + spend ceiling | ≥ 0.9 core, 0 leaks, in CI |
| Briefing generation | Factual, cited, matches the roadmap topic | Past published briefings | Dilip | Off-topic, uncited claims | Citation registry check; judge for tone | No | None today | Not defined |
| Blog revise / validate | Edits keep facts and citations | Past posts | Dilip | Posts with planted wrong citations | Citation diff | No | None today | Not defined |

Current eval maturity: **Micro** for Setu (a golden set and unit guards exist, run by hand); **Why** for briefing and blog tools.

## 13. Production gates

- [x] Secrets: no secret in `NEXT_PUBLIC_*`; service role read only server-side (but no `server-only` guard)
- [ ] Five protections + five checks: rate limits in-memory only; no CI checks (F4, F7)
- [ ] Dev / staging / prod separated: previews share production data stores (to confirm)
- [ ] Logs located, rollback located, alerts on: logs = Vercel runtime logs; rollback = Vercel promote; **no alerts**
- [ ] Preview verified by Dilip → explicit go: the rule exists, but nothing blocks a push to `main` (F4)

## 14. Runbooks

| Failure mode | Detection | First response | Owner |
|---|---|---|---|
| Briefing sent to suppressed addresses | Complaint or unsubscribe spike in Resend | Pause crons; fix T1; send an apology only if counsel advises | Dilip |
| Duplicate briefing blast | Resend dashboard: double sends | Disable `briefing-send` cron; mark briefing `sent` | Dilip |
| Consent row missing for a submission | Admin consent page vs assessments count | Reconstruct from request logs if possible; record the gap | Dilip |
| Setu cost spike | Anthropic usage page | Lower the per-IP limit or rotate the key; add a kill switch (none exists today) | Dilip |
| Supabase unavailable | User-facing 500s | Status page; no failover (single region by design) | Dilip |

## 15. Open questions

- O2b backend host at extraction time (recommendation: stay on Vercel `bom1`; extract a worker on a trigger).
- Retention periods per table, and the consent-proof policy that survives erasure.
- Is `workflows/n8n_email_workflow.json` still active anywhere?
- Do previews share production Supabase and Resend? If so, previews can mail real subscribers.
- Production values of `DATA_BACKEND_*` (unverified in this review).
- Sign the 6 DPAs (G3) before the "inspect us" page ships.

---
**Decision · Trade-off accepted · Next scale step:** keep the modular monolith and fix write semantics in order: T1 (one line), T2 (CI gate), T3 (consent), T4 (send idempotency), then T5–T6 (seam, region). · Consent writes become synchronous, so submissions are slightly slower; a lost consent row is worse. · No traffic step needed; the first trigger is a send run that would exceed 300s (about 1,000 recipients), which moves sending to a queue-backed worker under O2b.
