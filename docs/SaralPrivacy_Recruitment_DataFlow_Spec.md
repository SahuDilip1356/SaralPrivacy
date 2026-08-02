# SaralPrivacy Personal Data Flow Map — Recruitment & Staffing

**Product scope and development specification (v1.0 · 2026-07-18 · ship contract refined by v1.1)**

- Working name: **Recruitment Personal Data Flow Map**
- Parent platform: SaralPrivacy
- Positioning: India's first interactive personal data flow map designed for recruitment and staffing businesses (marketing claim to be verified before external use)
- Primary purpose: help recruitment firms see how candidate, employee, client and workforce data enters, moves, changes, gets copied, leaves the organisation, and should eventually be deleted.

> **Status**: Approved for build. **v1.0 = product bible** (domain depth, guardrails, architecture). **v1.1 = ship contract** — when MVP must-ship conflicts, follow `docs/SaralPrivacy_Recruitment_DataFlow_Spec_v1.1_Build_Addendum.md` (P0 view ladder, signature erasure arc, hotspot SSOT, completeness gates). Companion: `.claude/agents/recruitment-data-flow-orchestrator.md`, `.claude/orchestration/recruitment-data-flow.yaml` (optional; sequential gated sessions are enough).

---

## §0. Repo-reality corrections (authoritative — overrides anything below)

The original spec draft assumed a generic repo. These corrections are binding:

| Spec draft assumed | Repo reality |
|---|---|
| Route `/industries/recruitment` | **`/industries/recruitment-agencies`** (slug from `webapp/lib/data/sectors.ts`); full experience at `/industries/recruitment-agencies/data-flow` |
| `src/app/...` layout | No `src/`. App root is `webapp/` inside the repo root (`DPDPA Daily Brief/webapp/webapp/` from Desktop) |
| Supabase / PostgreSQL data layer | **Appwrite** (`webapp/lib/appwrite.ts`, lazy-init Proxy pattern, 18 collections). v1 map is static config — no DB writes |
| Zustand for state | Not needed — `useState`/`useMemo` per existing client-component pattern |
| JSON config files in `data/` | **TypeScript config modules** in `webapp/lib/data/data-flow/` (mirrors the proven `lib/data/industry-assessment/packs/*.ts` pattern), validated with Zod |
| React Flow package name | **`@xyflow/react`** — the only new dependency. `framer-motion@12` is already installed (currently unused) — use it for motion; add nothing else |
| Discovery = separate taxonomy to re-model | **Reuse `webapp/lib/discovery/`** — niche `recruitment-staffing` (23 items: 6 Core, 10 Operational, 7 Hidden) with `dataSubjects` / `processingPurposes` / `sources` / `obligations` / `precaution` per item. Reuse strings + IDs; do not import the discovery engine at runtime |
| Per-question assessment anchors | The wizard has no per-question anchors. Link to `/assessment/recruitment` + bucket label. Pack bucket keys: `candidate_sourcing`, `candidate_document`, `client_sharing`, `ats_tool_access`, `retention_rights`; questions `q1`–`q10` |
| New analytics util | Extend `webapp/lib/analytics.ts` (`trackEvent` gtag wrapper, follow the `notice:` block pattern) |
| New design language | **Forbidden.** Navy/teal/pearl tokens from `webapp/tailwind.config.ts`; card idiom from `app/industries/recruitment-agencies/page.tsx`; risk badge convention red/amber/green from the pack; risk never communicated by colour alone |

---

## §1. Product thesis

Recruitment businesses do not have a single candidate database. They have a network of job portals, ATS platforms, recruiter email, WhatsApp, Excel trackers, Google Drive/OneDrive, recruiter laptops, client emails, assessment tools, BGV vendors, AI resume screeners, payroll platforms, backups and archives. One candidate record is copied, enriched and shared many times.

The product must help a recruitment business answer: **what personal data do we hold, where does it travel, who can access it, who receives it, why is it used, how many copies may exist, and when should it be deleted?**

This is not a decorative flowchart. It is an interactive operational model of personal-data movement.

## §2. Goals and non-goals

**Primary goals**
1. Make invisible candidate-data movement visible.
2. Explain DPDPA obligations through real recruitment workflows.
3. Bridge the Discovery Tool and the recruitment assessment (the missing middle: Discovery → **Flow Map** → Risk hotspots → Assessment → Fixes).
4. Identify high-risk systems, people and sharing points.
5. Drive users into `/assessment/recruitment` and `/discovery`.
6. Create a reusable architecture for future industry maps (config-only additions).

**Secondary goals**: industry-page dwell time, assessment completion, Discovery usage, signature visual asset, structured data for future notice/retention/vendor tools.

**Non-goals for v1**: live network scanning, SaaS integrations, full enterprise RoPA, consent management, automated deletion, DLP/security platform, legal advice substitute, PDF/PNG export, saved maps, user-edited nodes, multi-user collaboration, other industries.

## §3. Target users

**Primary**: agency founder (owns risk, lacks visibility), operations head (owns ATS/process), recruiter (creates most copies), HR/compliance owner (needs evidence + vendor map), IT admin (system inventory, access, backups).
**Secondary**: client HR, client hiring manager, BGV provider, payroll provider, assessment vendor, job-portal operator, cloud admin, finance, legal, auditor.

## §4. Business models covered (v1)

Permanent recruitment · Temporary staffing · RPO · Executive search.
Selection dynamically shows/hides applicable stages (onboarding + exit/redeployment only for staffing/RPO).
Later: campus partners, gig platforms, blue-collar/security/healthcare staffing, international.

## §5. Core user journey

Industry landing page → animated data-spread teaser → open interactive map → choose business model → explore by process / system / persona / risk → DPDPA overlay → top risk hotspots → recruitment assessment → full personal-data discovery.

## §6. Landing-page experience (on `/industries/recruitment-agencies`)

1. **Preview section** (server-rendered, between "Risk map" and "How the scan works"): headline "One candidate. Many copies. One business responsibility." + animated teaser using existing `sp-line-flow` CSS (Candidate → Portal → Email → ATS → Excel → WhatsApp → Drive → Client → AI tool → Backup) + end line "One candidate profile may exist in 10 or more places. Can you find every copy when the candidate asks for deletion?" + CTA "Explore the data flow" → `/industries/recruitment-agencies/data-flow`.
2. **Reference-model metrics**, always labelled as an industry model, never as user findings. No invented claims ("143 copies found" style is forbidden).

## §7. Canonical recruitment lifecycle — 12 process stages

Each stage defines: activities, data collected/added, personas, systems, external parties, copy-creation points, key risks.

1. **Candidate sourcing** — portals, LinkedIn, referrals, walk-ins, campus, previous database. Risks: no notice at source, old CVs reused, personal trackers, indefinite retention, scraped/public profiles treated as unrestricted.
2. **Registration and consent** — application, profile creation, notice display, consent capture (timestamp, notice version, source, channel prefs, client-sharing permission). Risks: pre-ticked/bundled consent, no evidence, one consent reused for all roles, withdrawal harder than collection.
3. **Resume screening** — download, keyword search, shortlisting, enrichment, AI screening. Data added: recruiter notes, suitability score, rejection reason, AI summary. Risks: unapproved AI tools, sensitive inference, biased scoring, local copies, uncontrolled exports.
4. **Candidate engagement** — calls, email, WhatsApp, scheduling, salary discussion. Risks: personal devices, chat history outside business systems, screenshots, recordings without awareness.
5. **Assessment** — aptitude/coding/psychometric tests, video interviews, proctoring. External: assessment/video/proctoring vendors. Risks: excessive collection, biometric-like data, opaque scoring, vendor retention.
6. **Client submission** — summary creation, resume formatting, email/portal share, hiring-manager circulation. Risks: sharing before candidate confirmation, over-sharing, client forwarding, no contractual controls, no post-transfer visibility.
7. **Interview management** — scheduling, feedback, recordings, rejection/progression. Risks: subjective/discriminatory notes, indefinite feedback retention, client-generated data not returned.
8. **Background verification** — identity/employment/education/address checks, references. Data: PAN, Aadhaar-related records, certificates, payslips, verification reports. Risks: high-volume sensitive docs, unclear legal basis, email-based transfer, vendor reuse, junior-staff access.
9. **Offer management** — approval, negotiation, offer letter, document collection (bank, tax, emergency contact, signature). Risks: email/WhatsApp document exchange, excessive pre-joining collection, offer data retained after rejection.
10. **Onboarding and employment** (staffing/RPO only) — employee creation, payroll, attendance, benefits, client deployment, statutory portals (PF/ESI/tax). Risks: agency–client ambiguity, broad client access, records in multiple HR systems, retention after deployment ends.
11. **Exit and redeployment** (staffing/RPO only) — offboarding, settlement, access removal, future placement. Risks: access not removed, "kept for future jobs" without basis, negative notes reused indefinitely.
12. **Archive, retention and deletion** — data remains in ATS archive, CRM, mailboxes, WhatsApp, drives, laptops, client/vendor systems, backups, exports, print. Key questions: purpose complete? statutory reason? consent withdrawn? deletion requested? dispute? client copy? backup expiry?

## §8. Data categories (11 groups; provided vs derived distinguished)

A **Identity** (name, photo, DOB, gender, PAN, Aadhaar-related record, passport, DL, voter ID, signature) · B **Contact** (mobile, email, address, WhatsApp, emergency contact) · C **Professional** (resume, history, employer, designation, skills, notice period, references) · D **Education** (institution, qualification, marks, certificates) · E **Financial** (current/expected salary, payslips, bank details, tax) · F **Assessment** (scores, psychometric profile, interview feedback, AI score, video, proctoring) · G **Verification** (employment/address/education verification, reference feedback, BGV status) · H **Communication** (email history, WhatsApp chats, call notes, recordings) · I **Device & technical** (IP, device ID, browser metadata, login history, source URL) · J **Employment** (staffing: employee ID, attendance, payroll, PF, ESI, leave, performance, exit) · K **Derived & inferred** (ranking, role-fit score, salary estimate, attrition likelihood, rehire eligibility, recruiter recommendation) — **must be visually and semantically distinct from provided data**.

Wording aligned with Discovery niche `recruitment-staffing` item strings wherever the concept matches.

## §9. System and repository catalogue

- **Collection**: careers site, job portal, LinkedIn, referral form, walk-in form, email inbox, WhatsApp, campus form
- **Core**: ATS, recruitment CRM, staffing platform, resume parser, candidate database, interview scheduler
- **Productivity**: Gmail/Outlook, Drive/OneDrive/SharePoint, Excel/Sheets, Teams/Slack, Zoom, calendar
- **High-risk shadow**: personal WhatsApp, personal Gmail, local laptop folders, USB, personal cloud, screenshots, printed CVs, unapproved AI tools
- **External**: client ATS/HRMS, assessment vendor, BGV vendor, payroll provider, e-sign provider, job portal, cloud host, email provider, AI screening vendor
- **Archive**: email archive, cloud backup, DB backup, file archive, historical ATS, offboarded laptops, printed storage

## §10. Persona and ownership model

Four distinct ownership concepts per node — never use "owner" ambiguously:
**Business owner** (accountable function) · **System owner** (application accountable person) · **Data steward** (quality/handling) · **User/accessor** (anyone who can view/create/update/export/delete).

## §11–12. Node and edge model (implementation trims to fields the 7 views render)

**Node**: id, name, nodeType (`person | persona | business_process | system | repository | vendor | client | government_portal | device | physical_storage`), organisationBoundary (`candidate | recruitment_agency | client | vendor | government | public`), processStages[], dataCategoryIds[], accessPersonas[], retentionDefined, accessControlled, deletionSupported?, riskSignals[], riskLevel (`low | medium | high | critical`), plus optional owner/steward/location fields.

**Edge**: id, source, target, processStage, dataCategoryIds[], action (`collect | create | view | edit | copy | download | upload | share | export | print | archive | delete`), channel (`web_form | api | email | whatsapp | file_upload | shared_link | manual_entry | spreadsheet | physical | system_sync`), purpose, internalOrExternal, recurring, automated, createsCopy, riskLevel, plus optional consent/vendor-contract/encryption flags.

Exact Zod schemas defined in Phase 1 (`webapp/lib/data-flow/schemas.ts`); drop any field no view reads.

## §13. Trust boundaries

Candidate · Recruitment agency · Client organisation · Vendors · Government/statutory · Public source. Every crossing visually marked: solid line internal, dashed external, double line = copy created, warning marker = uncontrolled, lock = protected, question = unknown. Never colour-only.

## §14. Views (7 projections of one model — ship by priority; see v1.1)

All views are projections of one config model. **Launch requires P0 only** (v1.1 §E).

**P0 (required):** 1 Process journey (default) · 2 Systems map · 4 External sharing · 5 Copy proliferation · 7 Risk heat map (toggle)  
**P1 (same release if time):** 6 DPDPA obligation overlay · top-5/7 hotspots · business-model selector  
**P2 (next):** 3 Persona access as a full view (access lists still appear on node panels in P0)

1. **Process journey** (default) — Source → Screen → Assess → Submit → Interview → Verify → Offer → Join → Exit → Delete
2. **Systems map** — applications and repositories
3. **Persona access** — who can view/edit each data type
4. **External sharing** — internal nodes hidden; clients, vendors, portals, cloud, AI highlighted
5. **Copy proliferation** — every copy-creating action highlighted
6. **DPDPA obligation overlay** — notice, consent, purpose, accuracy, safeguards, vendor control, retention, erasure, grievance, breach at the relevant stages
7. **Risk heat map** — highest-risk nodes and edges first

## §15–16. Detail panels

**Node panel**: name, type, boundary, purpose, data categories/objects, owners (3 concepts), access personas, external parties, retention status, deletion capability, security indicators, risk signals + exposure, DPDPA relevance, recommended actions, linked assessment bucket.
**Edge panel**: source, destination, action, data transferred, purpose, channel, frequency, automated?, creates copy?, external?, responsible persona, consent relevance, vendor-contract relevance, encryption, retention at destination, exposure, recommended controls.

## §17. Operational exposure model (deferred to phase 2 post-launch; label rules apply from day one)

Transparent rules-based dimensions: data sensitivity 20 · external sharing 15 · access personas 10 · copy creation 10 · retention undefined 15 · personal/unmanaged system 15 · no deletion capability 5 · no vendor control 5 · no consent/notice evidence 5. Bands: 0–24 Controlled · 25–49 Needs review · 50–74 High exposure · 75–100 Critical.
**Guardrail**: label as **"SaralPrivacy Operational Exposure"** — never "DPDPA Compliance Score", "Legal Risk Score", or certification. Every score must list contributing factors. (v1 ships per-node `riskLevel` authored in config + hotspot ranking; the numeric engine lands in phase 2.)

## §18. User customisation (v1: business-model selector only)

Business-model selector (4 models) shows/hides stages and recalculates summary counts. System-selection checklist, data-type editing, shareable URL state → deferred.

## §19. Discovery Tool integration

Discovery taxonomy is the source of truth for personal-data wording. v1: config references `recruitment-staffing` item strings/IDs (`lib/discovery/types.ts`, `denormNiche`); Discovery ResultPanel gains a "See where this data travels" cross-link. Full `DiscoveryFlowMapping` personalization → deferred.

## §20. Assessment integration

Every material risk maps to: pack bucket (literal-union typed against `recruitmentAgenciesPack` so drift fails typecheck) + recommended action. Result-page cross-link: "Your map shows N high-exposure points. Take the recruitment assessment to check whether controls exist."

## §21. Page architecture

- Preview: `/industries/recruitment-agencies` (new section + sidebar card)
- Full experience: `/industries/recruitment-agencies/data-flow` — hero · animated preview · reference-model stats · interactive map · view selector · risk-summary cards · how-it-works · common hotspots · DPDPA overlay explanation · assessment CTA · discovery CTA · FAQ · educational disclaimer
- Indexable (unlike the noindex assessment wizard): self-canonical, breadcrumb schema, sitemap entry.

## §22. UI architecture

**Desktop**: filters rail · interactive flow canvas (`@xyflow/react`) · details panel.
**Mobile**: summary first → process-stage tabs → simplified vertical journey → tap node opens bottom sheet → full map on desktop only. **Never squeeze the dense graph into a narrow viewport.**

## §23. Visual design system

SaralPrivacy brand system only (navy/teal/pearl; recruitment page idiom). Semantic shapes, not colour-only: person = circular avatar; process = rounded rect; system = app node; repository = database node; external party = outlined hexagon; copy = duplicate-sheet icon; retention issue = clock; deletion issue = trash. Motion: travelling data tokens, copy-duplication events, boundary pulses, risk activation after data arrives, progressive reveal; no constant motion; `prefers-reduced-motion` fully supported with equivalent static experience.

## §24. Technical stack (corrected)

Next.js 16 App Router · TypeScript · **`@xyflow/react`** (graph) · **framer-motion** (already installed) · Tailwind v4 tokens · Zod · static versioned TS config (no DB) · `lib/analytics.ts` events: `data_flow_preview_viewed`, `data_flow_opened`, `business_model_selected`, `node_clicked`, `edge_clicked`, `view_changed`, `filter_applied`, `risk_overlay_enabled`, `dpdpa_overlay_enabled`, `hotspot_clicked`, `discovery_cta_clicked`, `assessment_cta_clicked`.

## §25. Code structure (corrected paths)

```
webapp/
  app/industries/recruitment-agencies/data-flow/
    page.tsx                 # thin server page: metadata, canonical, schema
    DataFlowClient.tsx       # client shell: view state, breakpoint switch
  components/data-flow/
    DataFlowCanvas.tsx  DataFlowNode.tsx  DataFlowEdge.tsx
    FlowToolbar.tsx  FlowFilters.tsx  FlowLegend.tsx
    NodeDetailPanel.tsx  EdgeDetailPanel.tsx
    RiskSummary.tsx  DpdpOverlay.tsx  ProcessTimeline.tsx  MobileFlowView.tsx
  components/industries/DataFlowPreview.tsx   # server-safe landing teaser
  lib/data-flow/
    schemas.ts  risk-engine.ts  map-builder.ts  filters.ts
  lib/data/data-flow/recruitment/
    processes.ts  nodes.ts  edges.ts  personas.ts
    data-categories.ts  obligations.ts  recommendations.ts  index.ts
```

## §27. DPDPA overlay content (plain-English, operational)

Candidate applies → tell them what you collect and why · Consent captured → keep evidence · Resume screened → use only for stated purpose · AI tool used → no uncontrolled tools · Profile shared → only what the client needs · Vendor receives → make responsibilities clear · Correction request → simple route · Withdrawal → stop consent-based processing where applicable · Purpose ends → review retention · Leak → breach-response workflow.
**Rules**: no invented statutory retention periods; no GDPR-tier "sensitive personal data" labels as statutory DPDPA categories; no certification language.

## §28. Recommended actions library

Every risk maps to ≥1 concrete action. Core sets: uncontrolled WhatsApp (official business account, no ID docs in chat, deletion intervals, offboarded-device cleanup) · shared Excel tracker (master data into ATS, restrict access, no public links, deletion rule) · client email sharing (candidate confirmation first, minimum fields, protected transfer, client handling expectations) · unapproved AI tools (approved list, review terms, no ID/financial docs, disable training use, record purpose+owner) · old candidate database (segment active/inactive, define future-opportunity period, reconfirm, delete stale, keep evidence).

## §29. Scope tiers

**Must / P0 (this launch)** — see v1.1: recruitment reference pack (completeness gate) · process timeline · interactive graph · clickable nodes/edges + detail panels · P0 views (process, systems, copy, external, risk) · boundary + copy filters · 7 hotspots → assessment buckets · responsive mobile journey · assessment + discovery CTAs · analytics · accessible legend · static versioned TS config · signature erasure arc.
**Should / P1**: business-model selector · DPDPA overlay · animated landing preview · denser filter rail.
**Deferred / P2**: persona full view · numeric exposure score · system-selection checklist · shareable URL state · PDF/PNG export · saved maps · user editing · before/after comparison.
**Never (v1)**: SaaS scanning, integrations, collaboration, evidence upload, automated deletion, certification.

## §30. Acceptance criteria

**Launch criteria** are defined in v1.1 §J (P0 views + signature arc + pack completeness). Summary:

1. A business user understands the candidate-data journey without legal text — including copies and external crossings.
2. **P0 views** switchable from one underlying model (P1/P2 views may follow).
3. Pack meets completeness gate (≥28 nodes, ≥40 edges, 7 hotspots, no orphans).
4. Every external transfer and copy-creating edge visually distinguishable (not colour-only).
5. Every high-risk node explains why.
6. Every risk / hotspot has ≥1 practical action.
7. Assessment hand-off uses `?from=data-flow&bucket=<key>`; Discovery CTA works.
8. Desktop + mobile both work; mobile is the journey, not the graph.
9. Map content loaded from configuration, not hard-coded in components.
10. No illustrative metric presented as the user's actual result.
11. Motion-disabled users get an equivalent experience.
12. `next build` clean; parent industry page stays statically rendered; privacy/claims review passed.

## §31. Testing scenarios

**Functional**: filters hide unrelated nodes; staffing mode shows payroll/statutory flows; permanent mode hides employee-lifecycle stages; panels open correctly; risk + DPDPA toggles work; mobile no overflow.
**Content**: every data item categorised; every edge has a purpose; every external party has a boundary; every risk has a recommendation; derived data labelled; identity/verification documents not omitted.
**Accessibility**: keyboard nav (React Flow `nodesFocusable` + aria), focus states, screen-reader names, non-colour risk indicators, reduced motion, contrast.
**Performance**: first meaningful render < 2 s broadband; responsive interaction; `next/dynamic` lazy canvas; no rendering of hundreds of hidden nodes.

## §32. Phased delivery (gated; see orchestration YAML)

- **Phase 0** — repository audit → `docs/data-flow-build/` · **Gate 1**
- **Phase 1** — domain model: schemas + recruitment config + validation tests · **Gate 2**
- **Phase 2** — UX specs → `/plan-design-review` ≥8 → desktop prototype (`@xyflow/react`) · **Gate 3**
- **Phase 3** — mobile journey + risk/DPDPA overlays + business-model filtering + hotspots · **Gate 4**
- **Phase 4** — landing integration, analytics, SEO, privacy/claims review, adversarial QA · **Gate 5**
- **Ship** — branch off `main` → preview (verify via Vercel MCP; previews 401 to curl) → merge → prod. `git status --short webapp/` before push.

## §34. Strategic positioning

The map is the **visual intelligence layer** of SaralPrivacy: Discovery = *what do we collect* · **Flow Map = where does it move, who sees it, where does risk appear** · Assessment = *how ready are our controls* · Notice generator = *what do we tell people*. Build as a **reference map plus guided exploration**, not a blank modelling tool — the product outcome is the discovery moment: "I did not realise candidate data travelled through so many people and systems."

---

## Addendum — rights & incident walkthroughs (added 2026-08-02)

Sixth and final live pack to author the two shared, opt-in sections. **Content only** —
`scenarios.ts` plus two lines in `index.ts`. **With this pack, all six live maps carry them.**

**8 rights · 8 incidents.** Only the payroll walkthroughs are gated, because only a staffing agency
employs the person it placed:

| Model | Rights shown | Incidents shown |
|---|---|---|
| `permanent` (default) | 7 | 7 |
| `staffing` (superset) | 8 | 8 |

### What makes these recruitment-specific

**The candidate is the product, not the customer.** In every other pack the data principal is
someone the business serves — a patient, a student, a client. Here the CV *is* the inventory, and the
agency's commercial interest runs against deletion. `rs-delete-my-cv` is the hardest scenario in the
whole series to answer honestly for exactly that reason, and its hard part says so.

**The worst outcome is exposure to one specific person.** Not the public — the candidate's *current
employer*. `in-cv-reached-current-employer` is the most severe incident in the pack because it can
cost someone the job they already have, and it cannot be undone. `rs-bgv-contacted-my-employer` is
the same harm arriving through a vendor.

**The pipeline ends in rejection for almost everyone.** Nobody designs for what happens to the data
of the people told no — hence `rs-why-was-i-rejected` (automated screening with no recorded human
decision) and `rs-stop-contacting-me` (still being called years later).

**Recruiter commentary is the hidden layer.** "Not a culture fit", a salary inferred from a call, a
suitability rating — these live in ATS free-text and a spreadsheet column, candidates never know they
exist, and they are usually why someone stopped hearing back.

### Language locks

DPDPA scope only. No labour-law, EPFO/ESIC or employment-law claims, no statements about what
background verification is legally permitted to do, and no "sensitive personal data".

### Verification

52/52 pack tests · **zero scenario references to a node hidden in either model** · production build +
TypeScript clean · eslint clean.

### ⚠️ Pre-existing hotspot debt now diagnosed (NOT introduced here, NOT fixed here)

The last of the three affected packs to be pinned:

| Stage | Hotspot nodes resolving there |
|---|---|
| 2 `registration` | `candidate-database` |
| 3 `screening` | `excel-tracker`, `ai-screener`, `recruiter-laptop` ← **COLLISION** |
| 4 `engagement` | `personal-whatsapp` |
| 6 `client-submission` | `client-email` |
| 8 `bgv` | `bgv-vendor` |

⇒ 7 hotspots, **5 distinct flags**, identically in both models. Collision mode, same as `ca-firms`.

**Cheap fix, no hotspot copy changes** — give two of the three colliding nodes an earlier or later
first stage so all seven land on distinct stages. Stages 1 `sourcing`, 5 `assessment`, 7 `interview`,
9 `offer` and 12 `archive` are all free. A natural split:

- `excel-tracker` → first stage `sourcing` (1) — recruiters track leads from the moment they source
- `ai-screener` → stays at `screening` (3)
- `recruiter-laptop` → first stage `assessment` (5)

That yields flags on 1, 2, 3, 4, 5, 6, 8 = **7 distinct = 7 counter**, in both models. Do not use
stages 10 `onboarding` or 11 `exit` — they are staffing-gated and would reintroduce the disappearance
mode in `permanent`.

### All three fixes are now specified

| Pack | Mode | Fix | Effort |
|---|---|---|---|
| `ca-firms` | collision | `shared-drive` → `kyc`, `staff-laptop` → `accounting` | ~10 min |
| `recruitment-agencies` | collision | `excel-tracker` → `sourcing`, `recruiter-laptop` → `assessment` | ~10 min |
| `training-institutes` | disappearance | re-point 4 gated hotspot nodes to ungated anchors | moderate, rewrites copy |

Once all three land, **add the flags-vs-counter invariant as a universal Tier-1 test** so it cannot
recur. It cannot be added before then, because it would fail three packs on `main`.
