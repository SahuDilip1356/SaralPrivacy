# SUPABASE MIGRATION SPEC — Complete Appwrite Exit

**Status:** DRAFT v1.0 — ready for review; implementation gated on Dilip's go
**Branch:** `feat/supabase-migration` (cut from `origin/main` @ `a16bcc4`)
**Goal:** SaralPrivacy runs with **zero** Appwrite dependencies — database (19 collections) and storage (blog-infographic bucket) fully on Supabase — and the Appwrite project is deleted.
**Method:** Expand → Backfill → Verify → Flip → Contract, per-module strangler behind the one seam (`lib/appwrite.ts`). No big-bang, no dual-write infrastructure.
**Parent docs:** `SCALE_ARCHITECTURE_SPEC.md` §9 (summary this expands), `TRANSFORMATION_SEQUENCE.md` H1.
**Precondition:** P0 security merged first (Blueprint P1 / Sequence U1). The unauth `outreach/import` hole must not be migrated alive.
**Laws in force:** preview-before-prod on every flip · sprint format (sequence + hours, no dates) · ⛔ env var live ≠ env var listed — **redeploy, then verify** · never commit PII snapshots.

---

## 1. Goal, non-goals, success criteria

**In scope**
- All 19 Appwrite collections → Supabase Postgres (schema, data, and every consumer).
- Appwrite Storage bucket (blog infographics — the only storage feature in use) → Supabase Storage.
- Removal of `node-appwrite`, `lib/appwrite.ts`, the lazy-init Proxy hack, the ≤10-char `report_type` workaround, and all `APPWRITE_*` env vars.
- Idempotent, re-runnable migration tooling committed to the repo (minus data).

**Out of scope (explicit)**
- Vercel Blob (guide PDFs at `krocsl5bx9ykit9h.public.blob.vercel-storage.com`) — **not Appwrite**; consolidation into Supabase Storage is optional module M10 (§11), default = defer. Exiting Appwrite does not require it.
- Auth (Blueprint P3), Render extraction (P4), org tenancy — later phases. RLS here is deny-all scaffolding only.
- Any schema *redesign*. Tables mirror collections 1:1 plus hygiene (types, FKs where free, indexes). The compliance-ledger schema is Blueprint P5's job.

**Success = all six true**
1. `grep -r "appwrite" webapp --include="*.ts*"` → zero hits (code, not docs).
2. Every route/page listed in §4 serves identical responses from Supabase (parity matrix green).
3. Row counts + spot-diffs verified per collection; archives stored.
4. Blog infographics render from Supabase Storage URLs.
5. 7 consecutive green days on prod, then Appwrite read-only; 30 days, then deleted.
6. `npm run build` + full test suite green with `node-appwrite` uninstalled.

---

## 2. Current-state inventory (verified in repo @ `a16bcc4`)

- **47 files** import from `@/lib/appwrite` (routes, server pages, libs).
- Client: `node-appwrite` `Client/Databases/Storage` behind a lazy-init Proxy (build-crash workaround — the lesson carries over to the Supabase client).
- Reference counts per collection (code refs, proxy for blast radius): briefings 23 · subscribers 15 · outreach_contacts 14 · assessments 11 · blog_posts 9 · blogger_accounts 9 · consent_log 8 (incl. new `chat/handoff`) · downloads 4 · leads 3 (incl. `chat/handoff`) · survey_responses 3 · email_send_log 3 · ai_citations 3 · template_downloads 2 · notice_captures 1 · notice_events 1 · chat_feedback 1 · **notice_runs 0 · business_profiles 0 · dsar_requests 0** (defined in `COLLECTIONS`, never wired — see §3.4).
- **Storage:** exactly one feature — `app/api/blog/infographic/route.ts` (`storage.createFile`/`deleteFile`) + URL helpers `getFileViewUrl`/`getFileDownloadUrl` in `lib/appwrite.ts`. File URLs/IDs are persisted inside `blog_posts` rows → data rewrite required at M7 (§7).
- **Server-render consumers** (not just API routes): `app/blog/*`, `app/briefings/*`, `app/report/[token]`, `app/sitemap.ts`, `app/admin/*` pages, `lib/chat/briefings-live.ts`, `lib/data/briefings-source.ts`, `lib/subscribers.ts`, `lib/suppression.ts`.
- Volumes: thousands of rows total, single-digit writes/day. No cross-collection transactions exist today.

---

## 3. EXPAND — Supabase project + schema

### 3.1 Project setup
- One Supabase project, **region: Singapore** (`ap-southeast-1`) — co-located with Vercel `sin1` functions; Appwrite is Singapore today, so zero latency regression. ⚠️ **Decision O2 closes now:** a later Mumbai move means migrating again — if residency marketing is wanted, this is the cheapest moment to choose Mumbai and accept ~50 ms/query from `sin1` until Render lands in-region. Default stands: **Singapore**.
- Supabase CLI + `supabase/` dir in repo: `config.toml`, `migrations/*.sql` — schema lives in git, applied by CI (`supabase db push`), never by hand in the dashboard. Preview PRs get **branch databases**.
- Plan: Pro ($25/mo) from day one — PITR add-on deferred until paid-customer data exists (Blueprint P5).

### 3.2 Env vars (Vercel)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC_*`), `SUPABASE_ANON_KEY` (unused until P3, set anyway), plus per-module `DATA_BACKEND_*` flags (§5). ⛔ After each env change: **redeploy, then verify on a live endpoint** — a listed var is not a live var.

### 3.3 DDL conventions (every table)
- `id uuid primary key default uuid_generate_v7()` (via `pg_uuidv7` extension; fallback: app-generated UUIDv7).
- `legacy_id text unique` ← Appwrite `$id` (nullable after contract; kept forever for lineage).
- `created_at timestamptz not null` ← `$createdAt`; `updated_at timestamptz` ← `$updatedAt` (trigger-maintained after cutover).
- Types upgraded from Appwrite's flat strings where obviously safe: booleans → `boolean`, counts → `integer`, ISO dates → `timestamptz`, enum-like → `text` + `check` constraint. Anything ambiguous stays `text` (redesign is not this spec's job). `report_type` becomes unconstrained `text` — the ≤10-char era ends at flip M6.
- `alter table … enable row level security;` with **no policies** (deny-all). Only the service-role key reads/writes. Grants revoked from `anon`/`authenticated`.
- **Authoritative attribute list comes from introspection, not memory:** migration step 1 runs `databases.listAttributes()` per collection and emits a `schema-report.json`; DDL is written against that report, and the report is committed (schema is not PII). Hand-written DDL without the report = spec violation.

### 3.4 Table map (19 collections → 2 Postgres schemas)

Marketing/ops surface → schema **`ops`** · product surface → schema **`app`**:

| # | Appwrite collection | Target | Notes |
|---|---|---|---|
| 1 | leads | `ops.leads` | + `source` check (`chat_handoff` etc.) |
| 2 | subscribers | `ops.subscribers` | `unique(email)`; suppression flags typed boolean |
| 3 | downloads | `ops.downloads` | |
| 4 | template_downloads | `ops.template_downloads` | keeps `source` attr |
| 5 | survey_responses | `ops.survey_responses` | |
| 6 | consent_log | `ops.consent_log` | INSERT-only by convention (our own site's consent trail) |
| 7 | email_send_log | `ops.email_send_log` | FK → `ops.outreach_contacts` where resolvable, else null |
| 8 | outreach_contacts | `ops.outreach_contacts` | `unique(email)` |
| 9 | ai_citations | `ops.ai_citations` | AEO panel output |
| 10 | blog_posts | `ops.blog_posts` | infographic URL column rewritten in M7 (§7) |
| 11 | blogger_accounts | `ops.blogger_accounts` | bcrypt hashes copy as-is |
| 12 | chat_feedback | `ops.chat_feedback` | redacted turns only, per Setu spec |
| 13 | assessments | `app.assessments` | `report_type text` full-length; `report_token` indexed (serves `/report/[token]`) |
| 14 | briefings | `app.briefings_meta` | approval/send state; content stays content-as-code |
| 15 | notice_captures | `app.notice_captures` | |
| 16 | notice_events | `app.notice_events` | INSERT-only |
| 17 | notice_runs | `app.notice_runs` | **zero code refs** — create table; backfill only if live count > 0 |
| 18 | business_profiles | `app.business_profiles` | zero refs — same rule |
| 19 | dsar_requests | `app.dsar_requests` | zero refs — same rule; becomes the seed of Blueprint P5's DSAR module |

Indexes: every column the routes filter/sort on (from the §4 route audit) gets an index in the same migration — `subscribers(email)`, `assessments(report_token)`, `briefings_meta(status, date)`, `outreach_contacts(status)`, `email_send_log(sent_at)`, etc., finalized against the introspection report.

---

## 4. The seam — `lib/db/`

New directory, **identical function signatures** to today's call sites so route files change only their import line (or nothing, where a lib already wraps access):

```
lib/db/
  client.ts        // lazy-init Supabase client (service role) — same Proxy trick,
                   // build must succeed with no env vars present
  flags.ts         // dataBackend(module): 'appwrite' | 'supabase' from env
  types.ts         // row types per table (zod, shared with routes)
  modules/
    templates.ts   subscribers.ts   leads.ts   notices.ts
    outreach.ts    assessments.ts   editorial.ts   adminCrm.ts
  legacy/appwrite.ts  // the current client, quarantined; deleted at Contract
```

- Each module function branches on its flag internally: routes never know which backend answered.
- Flags (Vercel env): `DATA_BACKEND_TEMPLATES`, `_SUBSCRIBERS`, `_LEADS`, `_NOTICES`, `_OUTREACH`, `_ASSESSMENTS`, `_EDITORIAL`, `_ADMIN` — default `appwrite`, flipped one at a time.
- A collection used by two features routes through ONE module (e.g. `consent_log` writes from both subscribe-flow and `chat/handoff` go via `subscribers.ts`' consent function) so a flag can never split a collection across backends.
- Contract tests (§8) run every module function against **both** backends with the same fixtures — the parity proof is executable, not a checklist.

### Module → consumer map (the flip units)

| Module | Collections | Routes / pages / libs |
|---|---|---|
| M1 `templates` | template_downloads, downloads | `api/template-download`, `api/templates/download`, `api/white-paper` |
| M2 `subscribers` | subscribers, consent_log | `api/subscribe`, `api/subscribers/unsubscribe`, `api/webhooks/resend`, `api/briefings/send` (recipient reads), `lib/subscribers.ts`, `lib/suppression.ts`, `api/chat/handoff` (consent write) |
| M3 `leads` | leads, survey_responses | `api/contact`, `api/survey/submit`, `api/chat/handoff` (lead write) |
| M4 `notices` | notice_captures, notice_events, chat_feedback | `api/notice/capture`, `api/notice/events`, `api/chat/feedback` |
| M5 `outreach` | outreach_contacts, email_send_log | `api/outreach/*` (4 routes), `api/cron/outreach-send` |
| M6 `assessments` | assessments | `api/assessment`, `app/report/[token]`, `api/admin/send-report` |
| M7 `editorial` | briefings, blog_posts, ai_citations (+ storage §7) | `api/briefings/*` (5), `api/blog/*` (5), `api/cron/briefing-send`, `api/cron/aeo-panel`, `api/admin/aeo-panel-run`, `app/blog/*`, `app/briefings/*`, `app/sitemap.ts`, `lib/chat/briefings-live.ts`, `lib/data/briefings-source.ts`, `app/admin/citations` |
| M8 `adminCrm` | blogger_accounts (+ admin reads over all) | `api/admin/bloggers*`, `api/admin/login`, `api/admin/set-password`, `api/admin/data`, `app/admin/*` pages |
| — | notice_runs, business_profiles, dsar_requests | zero consumers — schema-only unless live count > 0 |

---

## 5. BACKFILL — tooling

`tools/migrate-supabase/` (TypeScript, run with `npx tsx`, all idempotent):

1. **`introspect.ts`** → `schema-report.json` (attributes, sizes, counts per collection; storage file list). Committed.
2. **`export.ts`** → paginated `listDocuments` (cursor, 100/page) per collection → JSONL to **`.migration-snapshots/`** — **gitignored; contains PII (emails, phone numbers). Never committed, never synced to iCloud** (write under `/private/tmp` and copy once to an encrypted local archive).
3. **`transform.ts`** → JSONL → row shape (`$id`→`legacy_id`, `$createdAt`→`created_at`, type coercions per §3.3, per-collection mappers).
4. **`load.ts`** → batched `insert … on conflict (legacy_id) do update` via service role. Re-runnable at any moment — **re-running load at flip time IS the delta sync**; no dual-write machinery.
5. **`verify.ts`** → per collection: row count Appwrite vs Postgres; `min/max(created_at)` equal; random-20 deep-diff (transform applied to the Appwrite doc must equal the Postgres row); emits `verify-report.json`.
6. **`files.ts`** → storage migration (§7).

---

## 6. VERIFY — the parity protocol (gate before every flip)

Per module, on **preview** with a branch database:
1. `verify.ts` green for the module's collections (counts, ranges, random-20).
2. Contract tests green against both backends.
3. **API-level parity:** for each route in the module's row of §4 — same request → byte-comparable JSON (modulo timestamps/ids where generated); for pages — rendered HTML spot-check (blog post with infographic, briefing page, report page).
4. Error-path check: duplicate subscribe, unknown unsubscribe token, missing report token — same status codes both backends.

---

## 7. Storage migration (bucket → Supabase Storage) — rides with M7

1. `files.ts` lists all bucket files (introspection report has the manifest), downloads each, uploads to Supabase Storage bucket **`infographics`** (public-read policy — these are published blog images; service-role write only). Content-addressed path: `infographics/<legacy_file_id>.<ext>` so the mapping is the filename.
2. Emit `file-map.json` (`legacy_id → public URL`). Idempotent (upsert semantics).
3. **Data rewrite:** `blog_posts` rows carrying Appwrite view URLs / file ids get their URL column rewritten via the map during M7's transform. `verify.ts` then HTTP-HEADs every rewritten URL → must be 200.
4. Code swap: `getFileViewUrl`/`getFileDownloadUrl` reimplemented over Supabase Storage inside `modules/editorial.ts`; `api/blog/infographic` create/delete moves to `supabase.storage`.
5. Old Appwrite URLs in the wild: infographic URLs are only referenced from our own pages (rewritten in 3) — no external redirect layer needed. Confirm with a site-wide grep before Contract; if any external embed exists, keep Appwrite read-only through its 30-day window (already the plan).

---

## 8. FLIP — cutover procedure

Order (lowest blast radius → highest): **M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8.**

Per module, the ritual is identical:
1. Re-run `load.ts` (delta sync) → `verify.ts` green.
2. Flip the module flag **on preview** → run §6 parity → Dilip verifies preview → explicit confirm (the law).
3. **Write-freeze** for the module (minutes): for cron-driven modules (M5, M7) flip between cron windows (04:00/04:30/Mon 03:30 IST); for user-driven writes the freeze is a final delta `load.ts` run immediately before the prod flag flips — any row written in the seconds between is caught by one more idempotent `load.ts` run right after.
4. Flip flag in prod env → **redeploy → verify live** (the env-var law) → smoke the module's routes.
5. **48 h watch:** function logs + error rate for the module's routes; row counts still converging (a stray write to Appwrite after flip = a consumer missed by the seam → find it, fix it, delta-sync).
6. Rollback at any point = flip the flag back (Appwrite untouched until Contract). If rolled back after new Supabase-side writes: export those rows (`created_at > flip time`), replay to Appwrite via a small `replay.ts`, then diagnose.

M7 is the big one (23 refs + SSR pages + sitemap + storage): give it its own preview cycle and revalidate/ISR purge after flip. M8 last because admin tolerates friction and it reads across everything.

---

## 9. CONTRACT — decommission Appwrite

1. 7 consecutive green days after M8 (no module rolled back, no Appwrite writes observed) → set Appwrite API key to read-only scope.
2. Final `export.ts` run → archive JSONL + `schema-report.json` + `file-map.json` to the encrypted local archive (retention: keep indefinitely; it's the lineage record).
3. 30 days after read-only → **delete the Appwrite project**.
4. Code cleanup PR: delete `lib/db/legacy/appwrite.ts`, uninstall `node-appwrite`, drop `APPWRITE_*` env vars from Vercel (all environments), delete the `DATA_BACKEND_*` flags (Supabase becomes the only path), remove the ≤10-char `report_type` handling wherever it was papered over, retire the lazy Proxy *comment* debt.
5. Memory + docs: update `critical-rules`, `deployment-pipeline`, `privacy-notice-vendor-truth` — **Appwrite leaves the sub-processor list and Supabase enters it (DPA reviewed, region recorded) in the same PR as the first prod flip, not at contract time.** Our privacy notice must be true on every day of this migration.

---

## 10. Testing summary

- **Unit:** transform mappers (fixtures per collection, edge rows from the real export), flag routing, client lazy-init (build with zero env vars must pass — the Appwrite lesson).
- **Contract:** every `lib/db` module function × both backends × same fixtures.
- **Integration (preview + branch DB):** §6 parity per module.
- **Post-flip smoke (prod):** scripted curl set per module, run after every flip and every redeploy.
- Existing suite (118+ tests) stays green throughout — it runs on every flip PR.

---

## 11. Optional module M10 — Vercel Blob → Supabase Storage (decision, default: DEFER)

Guides live on Vercel Blob (`lib/data/guide-languages.ts` hardcodes the host). Moving them: one bucket, ~tens of files, URL swap in one config file — **~3–4h, zero coupling to the Appwrite exit.** Reasons to do it: one storage vendor, RLS-ready for future private docs. Reasons to defer: Blob is on the CDN path for public PDFs and costs pennies; churn during a migration adds risk for no exit-value. **Recommendation: defer to Blueprint P5** (when private tenant docs force a Supabase Storage posture anyway). If Dilip wants full consolidation now, M10 slots after M8 with the same map/rewrite/verify pattern as §7.

---

## 12. Risks

| Risk | Sev | Mitigation |
|---|---|---|
| PII snapshot leaks (JSONL in iCloud/git) | HIGH | `.migration-snapshots/` gitignored + written under `/private/tmp`; encrypted archive; never in repo or scratchpad shared paths |
| A consumer bypasses the seam (missed call site) | MED | §2 inventory is grep-derived; CI guard: `grep -r "node-appwrite\|lib/appwrite" app lib --exclude-dir=db` must return only `legacy/` until Contract |
| Attribute drift (introspection vs code expectations) | MED | DDL only from `schema-report.json`; transform mappers unit-tested on real export rows |
| Another session ships new Appwrite writes mid-migration | MED | This branch tracks main; rebase before each flip PR; the CI guard above catches new imports (`chat/handoff` appeared in one week — this WILL recur) |
| ISR/SSR staleness after M7 (blog/briefings/sitemap) | LOW | revalidate purge in the flip runbook; parity includes rendered pages |
| iCloud zeroing during the work | MED | run tooling from `/private/tmp` clone; `tr -d '\000'` check before any commit (standing law) |
| Supabase branch-DB ≠ prod-DB config drift | LOW | schema only via committed migrations; no dashboard edits |

---

## 13. Work plan (sequence + tentative hours — no dates)

| Step | Work | Hours | Exit evidence |
|---|---|---|---|
| S0 | Precondition: P0 security merged | (4–6, already specced in Sequence U1) | forged cookie dead on prod |
| S1 | Supabase project + CLI + CI wiring + env plumbing | 3–4 | branch DB spins up on a PR |
| S2 | `introspect.ts` + full DDL migrations (19 tables, indexes, RLS deny-all) | 4–6 | `schema-report.json` committed; migrations apply clean |
| S3 | Seam: `lib/db/` modules + flags + route import swap | 5–7 | all flags=`appwrite`, prod behavior byte-identical, suite green |
| S4 | Export/transform/load/verify tooling | 5–7 | full backfill green on branch DB; verify-report clean |
| S5 | Flips M1–M5 (small modules) | 4–6 | five 48 h watches clean |
| S6 | Flip M6 + M7 incl. storage migration + M8 | 6–9 | parity matrix green; infographics on Supabase URLs |
| S7 | Contract: read-only → archive → delete → cleanup PR | 2–3 | success criteria §1 all six true |
| | **Total** | **~29–42 h** (+ M10 3–4 h if chosen) | |

---

## 14. Open decisions (answer before S1)

| # | Question | Default |
|---|---|---|
| D1 | Region: Singapore or Mumbai? (cheapest moment to choose is now — §3.1) | **Singapore** |
| D2 | M10 Vercel Blob consolidation now or defer to Blueprint P5? | **Defer** |
| D3 | Zero-ref collections (`notice_runs`, `business_profiles`, `dsar_requests`): create empty tables (schema parity) or drop from scope? | **Create empty** — they're the P5 DSAR seed |
| D4 | Supabase Pro from S1 or free tier until first flip? | **Pro from S1** (branch DBs + support during cutover) |

---

*End. This spec implements Blueprint P2 and is the first build item of the Transformation Sequence (after H0/U1). Nothing flips without preview + explicit confirmation.*
