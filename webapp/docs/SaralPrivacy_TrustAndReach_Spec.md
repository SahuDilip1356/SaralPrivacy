# SaralPrivacy — Trust & Reach Spec (v0.1, DRAFT)

**Status:** DRAFT. Dilip is still deliberating. Nothing in this doc is approved for build.
**Inputs:** external public-site audit (ChatGPT, 2026-09-28 → 10-01: deep review, 24-feature
ratings, 9+ blueprint, practice strategy, reconciliation, public-experience priorities) +
Claude's code check and devil's-advocate review (this branch's session).
**Plan:** `docs/TrustAndReach_Sprint_Plan.md`

---

## 1. The problem, from first principles

> **Users = reach × relevance × time-to-value × reason to return.**

- ~4,000 users in 8 months ≈ 17/day. Zero paying customers. Gate 3 needs ≥25 paying.
- Every audit so far optimised the last three terms. **Reach is the binding constraint**, and
  we do not know who the 4,000 are: `/learn/dpdp-act-2023` alone is ~54% of search
  impressions — reference-seekers, probably not MSME owners.
- MSME owners do not search "DPDPA". They act on a **trigger**: a large client's vendor
  questionnaire, their CA, an incident, the deadline (~May 2027, main obligations).
- Six homepage redesigns (Landing P1/P2, Linear W0–W3, hero tap #2) improved experience and
  did not move reach. A seventh will not either.
- Trust errors are real and confirmed in code (§3). Fixing them is **hygiene, not growth** —
  necessary, cheap, and must not be sold to ourselves as the growth plan.

## 2. Goal and non-goals

**Goal:** a first-time visitor arriving on a real trigger leaves with a useful output in
under 2 minutes, without a form — and CAs can hand that path to their clients.

**Success (measured, not asserted):**
- Of a 5-CA × 10-client cohort (50 owners), ≥30 reach a useful output.
- Qualified paid-help requests from that cohort (target set after baseline — not invented now).
- Observed owners can explain the decision and their next action (5 moderated sessions).
- 7-day action completion, measured manually with consenting participants.

**Non-goals (this spec):** homepage full redesign · new features/sectors/languages · the
workspace platform (`app.saralprivacy.com`) · pricing changes (Pounce SKUs stand) ·
DPDPA.wiki / Shiksha build-out · leaderboards, badges, compliance scores as assurance ·
more briefings volume.

## 3. Audit findings — triage status

Rule: every finding is **present / fixed / needs-verification** before anyone edits.
"Confirmed" below means seen in code on this branch, 2026-09-30.

| # | Finding | Status | Location |
|---|---|---|---|
| F1 | "reduce your penalty exposure by up to 60%" | **present** | `app/[locale]/assessment/SurveyClient.tsx:1145` |
| F2 | "can rely on legitimate interest" | **present** | `SurveyClient.tsx:1143` |
| F3 | healthcare/finance "lower penalty thresholds" | **present** | `SurveyClient.tsx:1152` |
| F4 | "Contractual necessity" as a legal basis | **present** | `app/[locale]/privacy/page.tsx:46,104` |
| F5 | Hosting/infra statements vs actual (`sin1` functions) | **present — fix on preview** | `fix/privacy-setu-disclosure` `a356f0e` |
| F6 | Rights cited as Rule 13 + blanket 90 days | **needs-verification** — Rules text is NOT in repo (only the Act) | `lib/data/compliance-checklist.ts:331,335,451,455,461` |
| F7 | Discovery phone field `required` | **present** | `app/[locale]/discovery/components/ResultPanel.tsx:334` |
| F8 | Discovery "Confidence: High" | **present** | `ResultPanel.tsx:208` |
| F9 | Discovery category counts (14 vs 8) unexplained | **needs-verification** | Discovery data |
| F10 | Retention periods differ: primer vs Discovery | **needs-verification** (primer side present) | `lib/data/learn-content.ts:786-791` |
| F11 | CMP article: "essential", CMP≈Consent Manager, Jan-2025 Rules date, "Verified" | **needs-verification** — lives in Supabase, not repo | blog row |
| F12 | "DPDPA-ready" promises | **present** | `components/home/AudienceCards.tsx:88` + 12 assessment metadata |
| F13 | Access/control 100/100 from one self-reported checkbox | **needs-verification** (scoring path) | assessment scoring |
| F14 | Breach / rights primers vaguer than our Rules page | **needs-verification** | `/learn/data-breach`, `/learn/rights` |
| F15 | Applicability / processing-role wording; stale cross-border wording | **needs-verification** (audit said live FAQ already fixed cross-border) | glossary / FAQ / learn |
| F16 | Template gate requires phone + employees | **needs-verification** | `/resources` gate, `lib/templates/contact-storage.ts` |
| F17 | Fear-led briefing headlines (e.g. "₹250 crore") | **present** (editorial) | briefings archive |
| F18 | Hindi mirrors of changed strings (e.g. legitimate-interest row) | **present** — must change in lockstep | `lib/data/i18n/learn-content.hi.ts:62` |

Root cause behind most rows: guards are **per-surface, not per-claim**. The blog validator
already bans "legitimate interest" (`app/api/blog/validate/route.ts:56`) while the assessment
hardcodes it. Source registry = stats only; citation script = section numbers only.

## 4. Correction rules (locked by the reconciliation)

- **s.7:** never swap "contractual necessity" for a generic "legitimate use". Each processing
  activity must fit a specified use in s.7 with its conditions, or rest on consent (s.4/s.6).
- **CMP:** say buying a CMP is *not a universal statutory requirement*; explain when software
  may help; a Consent Manager is a registered statutory role. Do **not** claim "most MSMEs
  don't need one" — unproven.
- **Retention:** one shared *methodology*, not one set of numbers: record type · entity ·
  provision/source · starting event · conditions · exceptions.
- **Scores:** never replace an unjustified 100 with another arbitrary number. Either a
  defensible, versioned method or plain words: *"You reported an access-control practice;
  its effectiveness has not been checked."*
- **Citations:** every new/changed citation grepped against `allSections` in
  `content/dpdp-act-2023.ts`. Rules citations need the Rules text (see D4).
- **Numbers:** no numerical claim ships without a `content/source-registry.json` record.

## 5. Increments

### I0 — Triage register (read-only)
Turn §3 into a living table; resolve every *needs-verification* row to present/fixed.
No code change.

### I1 — Who are the 4,000 (read-only)
Analytics read: entry pages, sources, devices, paths, event funnel
(`discoveryComplete`, `discoveryInventoryDownload`, `discoveryHandoffClick`,
`heroSectorSelect`, `landingCtaClick`, assessment completes). Plus a 10-call script for
Dilip (5 who left, 5 who stayed): *"What made you look for this that day?"*
**Output:** the real user mix and the top 1–2 triggers. **I5 waits on this.**

### I2 — Trust-correction release (copy only)
F1–F4, F7, F12, F14, F15, F18 + F6 once verified. Wording only — no scoring logic. English
and Hindi in the same PR. F5 merges first (same file as F4).

### I3 — Content staging (DB + retrieval)
Preview shares the **prod** Supabase and the **single** Pinecone index. Editing the CMP row
or upserting Setu chunks goes live before approval. Before F11 or any Setu re-index:
- a draft/staged state for blog edits (or edit a copy, swap on approval);
- a preview-only retrieval namespace/index;
- a check that superseded chunks are **no longer retrieved**, not just that new ones exist.

### I4 — Result-integrity release (method change, versioned)
F8, F9, F13: assessment "Not sure" option; result language = reported vs inferred vs
unchecked; Discovery "Suggested — confirm for your business" + explained counts. Methodology
version stored with each new result; existing stored reports keep their score.

### I5 — One trigger path (built after I1)
Working hypothesis (I1 may replace it): **"My client / my CA asked about DPDPA."**
`What brought you here?` → one path → useful output in < 2 min, no form → three actions in
the standard format (what · why · owner · steps · evidence · how to check) → export →
optional "Email me a copy" and separate, clearly paid "Help me implement this".
First scenario: **former employee still has access to the shared client folder** — one case,
four depths (owner action · CA interview prompt · legal questions · IT steps + verification).
Reuses Discovery, the sector maps and the checklist. English + Hindi, phone-first.

### I6 — Homepage points at the path (small)
Hero gets two entrances (*Learn the basics* / *Check my business*) wired to I5. No full
section reorder. Only after I5 exists.

### I7 — Claim register v1 (context-aware)
Extend `content/source-registry.json` from stats to legal claims: claim · provision ·
conditions · reviewer · review date · dependent surfaces (pages, tools, Hindi, Setu index).
Checks assert **claims in context** with both positive and negative fixtures — a correct
sentence like "DPDPA has no general legitimate-interest basis" must pass.

### I8 — CA cohort + the till
5 CAs × 10 clients receive the I5 path. Razorpay + `/pricing` + `/refund` live (existing
Pounce P2 spec, 4 decisions pending) so a "yes" can pay. Manual tracking only.

## 6. Blast radius (per increment)

| Increment | Can break | Loud/Silent | Guard |
|---|---|---|---|
| I2 | Hindi pages keep old claims | **silent** | grep EN+HI in same PR; checklist item |
| I2 | Setu keeps answering with old claims | **silent** | do NOT re-index in I2; Setu goldens run as a known-gap report until I3 |
| I2 | Assessment/page metadata & titles change | loud | accepted; SEO title length rule (decoded entities) |
| I2/F5 | Privacy notice merge conflict | loud | F5 merged first |
| I3 | Blog/Setu edits go live from preview | **silent** | staging mechanism before any DB/index write |
| I3 | Old chunks still retrieved after upsert | **silent** | retrieval check on superseded text |
| I4 | Stored reports re-render with new scoring | **silent** | stored score + methodology version; old reports untouched |
| I4 | Admin/report views assume old fields | **silent** | additive fields only; report page tested on an old token |
| I5 | Lead-capture payload shape | **silent** (Appwrite-era lesson) | payload pinned in `lib/templates/lead.ts` + contract tests |
| I5 | Analytics events on static pages dropped (Suspense-wrapped `<Analytics />`) | **silent** | queue stub; verify events fire on preview |
| I5 | `.spd` CSS island breaks shared components in Discovery | **silent** | write in island idiom or mount outside |
| I6 | Hero tap #2 / sample dial / tracked `landingCtaClick` | loud | keep event names; additive |
| I7 | Over-strict checks block valid content | loud | positive fixtures |
| all | Another session editing the same files | **silent** | `git status` drift + `list_sessions` before each edit |

## 7. Eval plan (Setu + any AI surface touched)

- **Goldens, human-written by Dilip** (~20): CMP vs Consent Manager · DPO necessity ·
  legitimate interest · s.7 uses · rights timelines · grievance · retention per record ·
  breach reporting · cross-border · children's data · "is my business DPDPA-ready?".
- **Deterministic scorers first:** forbidden assertions absent; required qualifier present;
  cited section exists in `allSections`; answer links to the corrected page.
- **Judge last**, reported as "judge agrees with human X% of N". Claude-judging-Claude flagged
  as self-preference risk.
- Failures **clustered** (by claim), not averaged; every defect becomes a permanent golden row.
- Run on the preview-only retrieval namespace (I3), never by posting real 👎 on preview.

## 8. Decisions needed (Dilip)

- **D1** Paying unit for "≥25 paying": practice, client business, or engagement with cash received + service delivered.
- **D2** Approve privacy-notice wording (F5 branch) and the s.7/consent mapping for F4.
- **D3** Staging approach for Supabase blog edits and Setu retrieval (I3).
- **D4** Add the official Rules text to the repo (like the Act) so Rule citations can be verified the same way — yes/no.
- **D5** Homepage scope for I6 (hero entrances only — recommended).
- **D6** Is the I5 trigger hypothesis held until I1 reports, or overridden now?
- Razorpay's 4 pending decisions (separate thread) gate I8.

## 9. Open questions

- Who are the 4,000, and what triggered them? (I1)
- Does a Supabase blog draft/status field exist, or is a copy-and-swap needed? (I3)
- Which CA practices are the first 5, and what do they get for sending clients? (I8)
