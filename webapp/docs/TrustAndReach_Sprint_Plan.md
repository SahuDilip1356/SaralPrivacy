# Sprint Plan: Trust & Reach

**Spec:** `docs/SaralPrivacy_TrustAndReach_Spec.md` v0.1 (DRAFT)
**Branch (docs):** `claude/saralprivacy-audit-improvements-0da03d`
**Total effort (tentative):** ~75–100h (Claude) + ~35–45h (Dilip — reviews, calls, CA cohort)
**Scheduling:** Dilip's call. Sequence and effort only — no dates.
**Status:** ⏸ ON HOLD — nothing starts until Dilip says go.

> **Sprint goal**
> The confirmed trust errors are corrected on a verified preview, we know who our users are
> and what triggers them, and one trigger path is in the hands of 5 CAs' clients — with a
> way to pay when they say yes.

> **Governing laws:** preview-before-prod (Dilip verifies every preview; never self-merge) ·
> blast-radius filter · content/citation laws · source registry · eval-before-proposing ·
> concurrent-sessions check before every edit.

---

## The chain

```
D1..D6 (decisions, any time)
S0 triage ─┬─> S1 analytics read ─> S2 user calls ─> GATE B (trigger known)
           │                                            │
           ├─> S3 F5 merge ─> S4 trust copy ─> GATE A   │
           │                                    │       │
           └─> S5 staging (DB + retrieval) ─> S6 CMP + Setu re-index + evals
                                                │       │
                           S7 result integrity ─┘       │
                                                        v
                                S8 trigger path ─> S9 homepage entrances ─> GATE C
                                                        │
                       S10 claim register v1 (parallel) │
                                                        v
                         S11 till (Razorpay thread) ─> S12 CA cohort ─> GATE D
```

S1/S2 (learning) and S3/S4 (trust) run in parallel. S8 is blocked until GATE B.

---

## Phase 1 — Know what is true (read-only)

### S0 · Triage register — **2–3h, Claude** · no code
Resolve every *needs-verification* row in spec §3 to present / fixed.
- [ ] F6: verify Rule 13 vs 14 against the official Rules PDF (D4 decides whether the text lands in repo)
- [ ] F9, F10: trace Discovery counts and retention defaults to their data files
- [ ] F11: read the CMP article row (read-only query)
- [ ] F13: trace how access/control reaches 100
- [ ] F14–F16: check primers, glossary/FAQ, `/resources` gate fields
**Done when:** every §3 row has a status + file:line or row id. Committed to the spec.

### S1 · Who are the 4,000 — **2–3h, Claude** · no code
- [ ] Entry pages, sources, device split, top paths (8-month window)
- [ ] Funnel: `heroSectorSelect` → `landingCtaClick` → assessment complete; `discoveryComplete` → `discoveryInventoryDownload` → `discoveryHandoffClick`
- [ ] Leads table: count, sector mix, which surface captured them (aggregates only — no personal data in the write-up)
**Done when:** a one-page "who came, from where, did what" note in the spec.

### S2 · 10 user calls — **~5h, Dilip** (Claude: 1h script + 1h synthesis)
- [ ] Script: *"What made you look for this that day?"* + 4 follow-ups
- [ ] 5 who left after one visit, 5 who returned or left details
- [ ] Synthesis: top triggers, words they used, what they expected to get
**Done when:** the top 1–2 triggers are named with evidence.

### 🚦 GATE B — trigger known
I5 hypothesis ("my client / my CA asked") confirmed or replaced. **D6** recorded.

---

## Phase 2 — Repair trust (two separate releases)

### S3 · Merge the privacy disclosure fix — **0.5h Claude + 1h Dilip**
`fix/privacy-setu-disclosure` (`a356f0e`) — F5. Same file as F4, so it goes first.
- [ ] **D2** wording approved → preview re-verified → merged by Dilip
**Done when:** live `/privacy` shows the corrected infrastructure + AI processors.

### S4 · Trust-correction release (copy only) — **6–8h Claude + 1.5h Dilip**
Fresh branch off main. Wording only — no scoring logic.
- [ ] F1–F3 assessment help text rewritten (Act-grounded, cited, `allSections`-checked)
- [ ] F4 privacy basis: each processing row mapped to consent (s.6) or a specific s.7 use with its condition (D2)
- [ ] F6 checklist rights/grievance references corrected (after S0 verification)
- [ ] F7 Discovery phone optional; F16 template gate reduced if S0 confirms
- [ ] F12 "DPDPA-ready" → "check your readiness" across AudienceCards + 12 assessment metadata
- [ ] F14 breach/rights primers aligned with our Rules page
- [ ] F15 applicability/processing-role wording (per S0)
- [ ] F18 Hindi mirrors changed in the same commit (`git grep` EN + HI for each phrase)
- [ ] SEO: changed titles ≤ limit with entities decoded
- [ ] Setu goldens run against current index → **known-gap report** (no re-index here)
**Done when:** preview passes Dilip's check; grep shows zero occurrences of F1–F4 phrasings
as assertions in EN and HI.

### 🚦 GATE A — copy release on preview, verified by Dilip, merged by Dilip

### S5 · Content staging mechanism — **4–6h Claude + 0.5h Dilip (D3)**
- [ ] Check the Supabase blog schema for a draft/status field; else design copy-and-swap
- [ ] Preview-only Pinecone namespace (or index) + env switch, preview only
- [ ] Retrieval check script: superseded text must return no hits
**Done when:** a test edit is visible on preview and **not** on prod; a test chunk is
retrievable on preview only.

### S6 · CMP article + Setu re-index + evals — **5–7h Claude + 2h Dilip (goldens)**
*Blocked by S5.*
- [ ] F11 article rewritten per spec §4 (no "most MSMEs don't need"); "Verified" label removed until defined
- [ ] Dilip writes ~20 goldens (spec §7)
- [ ] Rebuild `public/chat-index.json` → upsert to the **preview** namespace → deterministic scorers → judge
- [ ] Superseded-chunk retrieval check passes
- [ ] On Dilip's approval: publish the article + upsert prod; health `chunks` == `pinecone.records`
**Done when:** eval report = "deterministic N/N, judge agrees with human X% of N",
failures clustered by claim; prod retrieval no longer returns the old claims.

### S7 · Result-integrity release (method change) — **8–10h Claude + 1.5h Dilip**
Separate branch and preview from S4.
- [ ] Assessment "Not sure" option; result text = reported / inferred / unchecked
- [ ] Remove single-checkbox 100s; plain-words result where no defensible method exists
- [ ] Methodology version stored with each new result; old reports keep their stored score
- [ ] Discovery: "Suggested — confirm for your business"; counts explained or reconciled (F9)
- [ ] Retention: shared record-specific methodology (record · entity · provision · trigger · exceptions) used by primer + Discovery (F10)
- [ ] Old report token renders unchanged (tested)
**Done when:** preview verified by Dilip; one old and one new report checked side by side.

---

## Phase 3 — One path, then reach

### S8 · The trigger path — **20–28h Claude + 3h Dilip**
*Blocked by GATE B.*
- [ ] `What brought you here?` entry (4 options) → one path for the GATE B trigger
- [ ] Scenario: former employee still has access to the shared client folder; owner / CA / legal / IT depths
- [ ] One decision question with explanatory feedback (no points, no badges)
- [ ] Output < 2 min, no form: three actions (what · why · owner · steps · evidence · how to check) + export
- [ ] "Email me a copy" (optional) and "Help me implement this" (clearly paid) as separate choices; payload pinned + contract test
- [ ] New events (`path_start`, `path_output`, `path_export`, `path_help_request`) — aggregate only, no answers in payloads, **verified firing on preview**
- [ ] EN + HI; 375px width; keyboard; no hover dependencies
**Done when:** Dilip completes it on a phone in both languages in < 2 minutes to output.

### S9 · Homepage entrances — **3–4h Claude + 0.5h Dilip (D5)**
- [ ] Hero: *Learn the basics* / *Check my business* → S8 path; existing hero events kept
- [ ] No section reorder
**Done when:** preview verified; `landingCtaClick` still fires with the new targets.

### 🚦 GATE C — observation
- [ ] 5 moderated MSME-owner sessions (Dilip ~5h; Claude 1h script + 1h synthesis)
- [ ] Pass: ≥4/5 pick the right start, reach output, and explain their next action
- [ ] Fix the biggest failure before GATE D

### S10 · Claim register v1 — **6–8h Claude** · parallel with S8
- [ ] Extend `content/source-registry.json` to legal claims (spec §5 I7 fields)
- [ ] Seed with every claim touched in S4/S6/S7
- [ ] Context-aware checks with positive + negative fixtures; blog validator reads the same source
**Done when:** CI fails on a planted false assertion and passes on its correct negation.

### S11 · The till — **per Razorpay spec (~16–24h)** · separate thread
- [ ] Razorpay's 4 decisions → `/pricing` + `/refund` live → checkout in test mode on preview → Dilip verifies
**Done when:** a test-mode payment completes end-to-end on preview, then ships on approval.

### S12 · CA cohort — **Dilip ~15–20h; Claude ~4h kit + tracking sheet**
*Blocked by GATE C + S11 + D1.*
- [ ] Recruit 5 CAs; each sends the S8 path to 10 clients
- [ ] Tracking sheet: reached output · asked for help · paid (per D1 unit) · 7-day action done (consenting only)
**Done when:** 50 sends tracked to outcome.

### 🚦 GATE D — decide what's next
- ≥30/50 reach an output → scale CA distribution
- Paid-help requests + D1-defined payers → feeds Pounce Gate 3
- Below that → the learning (not a rebuild) decides the next increment

---

## Effort summary (tentative)

| Phase | Claude | Dilip |
|---|---|---|
| 1 · Know what is true (S0–S2) | ~6–8h | ~5h |
| 2 · Repair trust (S3–S7) | ~24–31h | ~6.5h |
| 3 · Path + reach (S8–S12, excl. till) | ~35–45h | ~25–30h |
| Till (S11, separate spec) | ~16–24h | ~2h |

Dilip's hours dominate from GATE C onward — Phases 1–2 are designed to need little of them.
