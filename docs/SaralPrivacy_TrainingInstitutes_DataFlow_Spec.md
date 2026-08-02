# SaralPrivacy — Training Institutes Personal Data Flow Map

**Spec v1 · Map #3 in the Data Flow series · 2026-07-26**
Model to copy: `docs/SaralPrivacy_CAFirms_DataFlow_Spec.md` (v4) · Contract: `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
Actor: **Student** · Accent: **deep amber / gold** · Route: `/industries/training-institutes/data-flow`

---

## 0. The one decision that governs everything else

A long external "Claude Code development specification" was supplied for this map. It is an
excellent **content inventory** — its stage/system/hotspot detail is gold and we mine it. But its
**architecture is wrong for this codebase** and must not be followed literally. It proposes a
bespoke three-variant engine: ~25 new components, a new graph node/edge model, a fresh
variant-selector with URL state, three separate datasets, new validation utilities and a new test
suite — all scoped to one industry.

That directly violates two settled laws:

- **"Presentation unified, content varies"** (architectural law, memory + framework spec §4): the
  data-flow *presentation* is identical across all 12 industries; only *content* differs. A view
  change shipped to one industry is forbidden.
- **The config-driven engine** (handoff §0, shipped prod `fd62af9`): map #3 = **one pack folder +
  two one-line registrations**, ~content-only, **no route/component/schema edits.**

**And the pasted spec's headline feature already exists.** Its "variant selector / three genuinely
different journeys, not cosmetic filters" is precisely what the shipped engine's `businessModels`
mechanism does today — recruitment ships two (permanent / staffing), gated per-stage / per-node /
per-edge, filtered by `filterByBusinessModel()`, with the selector auto-hiding at one model. We get
the pasted spec's *intent* for free and reject its *implementation*.

> **Locked scope: Selective Expansion.** Deliver the pasted spec's rich content and its
> operating-model distinction **through the existing config engine**. Author one pack; touch no
> component, route, schema, or graph model. See §14 for the explicit "will NOT build" list.

---

## 1. The 10-layer standard applied to Training Institutes

Identical presentation, TI content. (Handoff §1.)

| # | Layer | Training Institutes |
|---|---|---|
| 1 | **Main actor** | **Student** (and, for minors, the parent/guardian as a linked principal) |
| 2 | **Business journey** | Enquiry → Counselling → Admission → Fees → Learning → Assessment → Communication → Certification → Placement → Alumni/Retention |
| 3 | **Personal data** | student & parent identity/contact, education & eligibility, photos/recordings, attendance, marks/performance, fees/payments, placements, behavioural/derived (EdTech) |
| 4 | **Business activity** | enrol, teach, assess, communicate, certify, place, retain |
| 5 | **Systems** | LMS, ERP/admission system, payment gateway, Zoom/Meet, WhatsApp, proctoring, CRM, placement portal, certificate system, cloud drive, backups, staff devices |
| 6 | **People who access** | counsellor, admission staff, faculty, finance, placement cell, admin/owner, IT, plus external recipients |
| 7 | **External sharing** | payment gateway, LMS/EdTech vendor, proctoring vendor, employers, certification bodies, marketing agency, government (where applicable) |
| 8 | **Copies created** | WhatsApp forwards, spreadsheet exports, recordings/transcripts, backups, faculty local copies, warehouse/analytics copies |
| 9 | **Where control breaks** | 5–8 ranked hotspots (§10) |
| 10 | **DPDPA expectation** | per-stage `dpdpaNote`; hotspot `action`; children-data framing |

---

## 2. Business models (the operating-model selector)

The TI assessment already segments the sector by operating model (`edtech`, `hybrid`,
`coaching_tuition`, etc. in `packs/training-institutes.ts` q1). A pure classroom coaching centre and
a pure EdTech platform are **genuinely different data journeys** — paper registers, biometric
attendance, physical files and WhatsApp on one side; cookies, proctoring, CDNs, AI tutors and a
stack of subprocessors on the other. This is exactly the condition the `businessModels` field exists
for.

**Recommended: three models, `hybrid` as default.**

| id | Label | Journey character |
|---|---|---|
| `classroom` | Classroom / coaching centre | Offline-first: paper, reception register, biometric, cash/UPI, physical files, WhatsApp |
| `hybrid` | Hybrid institute | **Default.** The union — website + CRM + LMS + physical classes + payment gateway; the richest, most-fragmented picture |
| `online` | Online / EdTech | Digital-native: cookies/pixels, accounts, subscription billing, video CDN, proctoring, AI personalisation, data warehouse, subprocessors |

**Gating convention** (locks in plan-eng): the shared lifecycle core (enquiry, payment,
certification, placement, retention) carries **no** `businessModels` tag → shows in all three.
Offline-only entities tag `["classroom","hybrid"]`; digital-only entities tag `["online","hybrid"]`.
So `hybrid` renders the full union, `classroom`/`online` render their honest subset. This is the
recruitment precedent applied (RPO folds into staffing; here nothing folds away — the third model is
the genuine superset a blended institute lives in).

**Leaner alternative (Dilip's call in plan-ceo):** two models (`classroom` / `online`), hybrid
described in copy as "you'll recognise both journeys." Matches recruitment's exact 2-model count and
trims ~20% of gating authoring. Recommendation stays **3**, because the assessment already treats
hybrid as its own high-risk model and it is the most compelling default view.

---

## 3. Lexicon, boundaries, accent

```ts
mainActor: "Student",
businessModels: [
  { id: "hybrid",    label: "Hybrid institute" },      // first = default
  { id: "classroom", label: "Classroom / coaching centre" },
  { id: "online",    label: "Online / EdTech" },
],
lexicon: {
  subject: "student",
  subjectArtefact: "One student's record",
  org: "institute",
},
boundaryLabels: {
  candidate: "The student",       // the individual / data principal
  agency:    "Your institute",    // the business
  client:    "Parent / guardian", // linked principal for minors; see §11
},
```

**Accent: deep amber / gold.** Framework spec §5 flags plain amber as colliding with the risk-fill
hue — use a deeper/warmer amber (gold) for chrome only. Accent touches decorative chrome only (hero,
tile gradients, CTA); the three semantic hues (data teal, boundary violet, risk amber/red) are
untouched. If the accent field/`INDUSTRY_ACCENT` map is not yet wired, the map falls back to the
default chrome — accent wiring is **not** a blocker for this map (framework spec §5 impl note).

---

## 4. Journey stages

Ten stages (free count; CA=10, recruitment=12). Each has `id`, `name`, `sequence`, `summary`,
`dpdpaNote`, optional `businessModels`. Names/summaries drawn from the pasted spec's per-variant
stage detail, generalised to one stage set with per-model gating where a stage is model-specific.

| # | Stage id | Name | Model gating |
|---|---|---|---|
| 1 | `enquiry` | Marketing & enquiry | all (classroom: walk-in/paper; online: cookies/pixels — carried by nodes) |
| 2 | `counselling` | Counselling & course recommendation | all |
| 3 | `admission` | Admission, documents & consent | all |
| 4 | `fees` | Fees, instalments & payments | all |
| 5 | `learning` | Learning delivery (classroom + LMS) | all |
| 6 | `attendance` | Attendance & engagement | all (classroom: register/biometric; online: login telemetry) |
| 7 | `assessment` | Tests, proctoring & performance | all (online: proctoring/AI adds nodes) |
| 8 | `communication` | Student & parent communication | all |
| 9 | `certification` | Certification & placement | all |
| 10 | `retention` | Alumni, retention & deletion | all |

The genuinely model-specific *systems* (biometric device, proctoring vendor, data warehouse, cookie
platform, subprocessors) are expressed as **nodes** gated to a model, not as separate stages — so
the stage spine stays stable across the selector, which is what keeps the presentation honest.

---

## 5. Data categories (`kind: provided | derived`)

Provided: `student-identity`, `parent-guardian`, `contact`, `education-eligibility`, `id-document`,
`financial-payment`, `photos-recordings`. Derived (visually distinct per schema §8K):
`attendance`, `assessment-performance`, `behavioural-derived` (EdTech watch/engagement/AI
inferences), `placement-employability`. Each carries `examples[]`; where a category matches the
Discovery `training-institutes` niche wording, mirror it in `discoveryItems`.

---

## 6. Personas (people who access) — with `boundary`

Internal (`agency`): counsellor, admission staff, faculty, finance, placement cell, admin/owner, IT.
External: parent/guardian (`client`), payment gateway / LMS / proctoring / marketing agency /
EdTech subprocessors (`vendor`), employers & certification/internship partners (`third-party`),
government (`government`) where an ID/scheme genuinely applies, ad platforms / public directories
(`public`) for pre-account tracking and referrals.

---

## 7. Nodes (systems) — real software, honest risk

~28–34 nodes. **Name real tools** the sector uses (recognition test). Illustrative set:

- **Shared core:** admission/ERP system, payment gateway (Razorpay/PayU), fee spreadsheet, cloud
  drive (Google Drive), **staff personal devices** and **backups** (SPANNING nodes — tag to all
  stages), WhatsApp (shadow IT), certificate system, placement portal/CRM.
- **`classroom`/`hybrid`:** paper enquiry form & reception register, counsellor notebook, physical
  admission file, cash receipt book, biometric attendance device, CCTV, printed marks/rank sheets.
- **`online`/`hybrid`:** website + cookie/pixel platform, analytics, account/identity + OTP
  provider, LMS, video CDN, Zoom/Meet + cloud recordings + transcripts, proctoring vendor, AI tutor
  / recommendation engine, data warehouse, subscription billing, support desk.

Rules (handoff §2A): staff devices + backups are spanning; every high/critical node needs `riskWhy`
+ `riskAction` (schema-enforced); no orphan nodes (every node touched by ≥1 edge).

**Signature exposure (rank #1 hotspot):** the thing no other vertical has — **children's data at
scale routed through consumer channels** (WhatsApp groups exposing minors' numbers; classroom
photos/recordings reused for marketing; EdTech behavioural profiling and proctoring of minors). This
is TI's DSC-equivalent.

## 8. Edges (copies & external sharing)

Each edge: `source`, `target`, `stageId`, `action`, `channel`, `purpose`, `dataCategoryIds`,
`createsCopy`, `external`, `riskLevel`. `external` **must** equal "either endpoint is
client/vendor/government/third-party/public" (validatePack enforces). Copy-heavy moments to capture:
WhatsApp forwards, spreadsheet exports, recording→transcript→AI-summary chains, backups, faculty
local copies, warehouse/analytics duplication, employer transfers of placement profiles.

---

## 9. Hotspots — 5–8, ranked worst-first, each → an assessment bucket

The TI assessment (`packs/training-institutes.ts`) exposes exactly five buckets — every hotspot must
deep-link to one of these (validatePack enforces membership):
`student_data_collection`, `communication_marketing`, `lms_vendor_platform`,
`minor_parental_consent`, `retention_rights`.

**Recommended 7 hotspots** (honest to the sector; band 5–8):

| Rank | Hotspot | Bucket |
|---|---|---|
| 1 | Children's data routed through WhatsApp / photos / behavioural profiling (signature exposure) | `minor_parental_consent` |
| 2 | Open WhatsApp groups exposing student & parent numbers; fee/marks disclosed in-group | `communication_marketing` |
| 3 | Aadhaar / ID & certificate photocopies over-collected and over-retained | `student_data_collection` |
| 4 | LMS / EdTech / proctoring vendors & subprocessors — recordings, transcripts, warehouse copies ungoverned | `lms_vendor_platform` |
| 5 | Marks, ranks & performance labels publicly displayed / inaccurate & uncorrectable | `student_data_collection` |
| 6 | Placement profiles shared with employers without opportunity-level confirmation | `communication_marketing` |
| 7 | No retention schedule — physical files, ex-staff devices, backups, alumni lists never cleared; account deletion doesn't reach subprocessors | `retention_rights` |

Hotspots are the curated "start here", **not** the full risk list (that's the nodes' `riskLevel` on
the lane board). Each references a real `nodeId`.

---

## 10. Children's data — first-class, via the existing bucket

TI is the first map where minors are a core principal. No new UI: children's-data risk is expressed
through (a) the `parent-guardian` data category, (b) the `parent/guardian` persona (`client`
boundary), (c) hotspot #1 mapped to the `minor_parental_consent` assessment bucket, and (d)
`dpdpaNote`s framing verifiable parental consent, minimisation, and no behavioural
tracking/targeted-marketing of minors — always as custody/DPDPA guidance, never accusation, never
absolute legal advice ("validate for the learner's age and applicable DPDPA requirements").

---

## 11. Presentation copy (`presentation` block)

Author all fields (eyebrow, h1, intro, meta/OG, breadcrumbLabel, previewBlurb, `howToRead[3]`,
cta*). Direction:

- **h1:** "One student. Many systems. One institute's responsibility."
- **intro:** follow one student's record through enquiry, counselling, admission, fees, classes,
  the LMS, assessments, WhatsApp groups, placements and years of archives — and count every place it
  ends up, and where control breaks.
- Brand voice: no fearmongering, custody framing, DPDPA-scope only (no UGC/AICTE/GDPR overclaim).

---

## 12. Wiring & routes

- `assessmentRoute: "/assessment/training-institutes"` · `assessmentBuckets`: the five above ·
  `discoveryNicheId: "training-institutes"` (verified present in `lib/discovery/data.generated.ts`).
- `disclaimer`: reference-model banner (never present metrics as the user's own data).
- BUCKET_FOCUS map added to `app/assessment/training-institutes/TrainingAssessmentClient.tsx` so
  hotspot deep-links focus the right section.

---

## 13. Build recipe (from handoff §2) & files touched

Branch `feat/data-flow-training-institutes` off `main`.

**Create — one pack folder** `webapp/lib/data/data-flow/training-institutes/`:
`stages.ts · data-categories.ts · personas.ts · nodes.ts · edges.ts · hotspots.ts · index.ts`
(clone CA folder shape; copy CA `index.ts`, swap every field per §3, §9, §12).

**Modify — three one-liners + one insert + one map:**
1. `lib/data/data-flow/index.ts` — add `"training-institutes": trainingInstitutesDataFlowPack,` to `PACKS`.
2. `lib/data-flow/data-flow.test.ts` — add the pack to the `PACKS` test array.
3. `app/industries/training-institutes/page.tsx` — insert `<DataFlowPreview pack={…} href="/industries/training-institutes/data-flow" />` above "How the 3-minute scan works".
4. `app/assessment/training-institutes/TrainingAssessmentClient.tsx` — add BUCKET_FOCUS.
5. (Optional) accent wiring if the `INDUSTRY_ACCENT` map is used.

**Verify:** `node --test --experimental-strip-types lib/data-flow/data-flow.test.ts` (validatePack
runs inside) + scoped tsc. Then **push → preview → hand Dilip the URL → STOP.** No self-merge (⛔).

**Estimate:** ~14–18h — top of the content band + hybrid-gating overhead (3 models). Pure content;
no framework risk.

---

## 14. Explicitly NOT building (rejecting the pasted spec's over-build)

| Pasted spec asks for | Verdict | Why |
|---|---|---|
| ~25 new UI components | ❌ | Shared components already render every pack |
| New graph node/edge model | ❌ | `flowNode`/`flowEdge` + BoundaryLaneMap already do this |
| Fresh variant selector + URL state | ❌ | `businessModels` + `filterByBusinessModel` already exist and are tested |
| New validation utilities | ❌ | `validatePack` covers all 25 listed checks |
| New test suite | ❌ | Pack inherits the 7 universal guarantees by registration |
| Separate dataset per variant | ❌ | One pack; entities gated by `businessModels` |
| New route `/…/data-flow` | ❌ | Dynamic `[sector]/data-flow` already serves it |
| Lighthouse/perf/a11y targets | ✅ inherited | Shared route already meets them; no new work |
| Rich content (stages/systems/hotspots/children) | ✅ **use it** | This is the pasted spec's real value — mine it into the pack |

**Net:** the pasted spec's *what* (content + operating-model distinction + children's data) ships in
full; its *how* (a parallel bespoke engine) is discarded because the codebase already provides a
better one.

---

## 15. Reference-model summary

Computed by `computePackSummary()` (never hand-typed): stages, systems, external parties, personas,
copy events, external transfers — all derived from the authored pack, per business model. Targets
(design guidance only, final = computed): stages 10; hybrid systems ~30; external parties ~10–15;
classroom leaner, online heaviest on subprocessors.

---

## Addendum — rights & incident walkthroughs (added 2026-08-02)

Fourth pack to author the two shared, opt-in sections, after `schools-colleges`,
`clinics-diagnostic-labs` and `d2c-brands`. **Content only** — `scenarios.ts` plus two lines in
`index.ts`. No component, route or schema work.

**8 rights scenarios · 8 incident scenarios**, gated per model:

| Model | Rights shown | Incidents shown |
|---|---|---|
| `hybrid` (default + superset) | 8 | 8 |
| `classroom` | 7 | 7 |
| `online` | 7 | 7 |

A classroom institute never sees the proctoring walkthrough; a purely online institute never sees
biometrics or CCTV.

### What makes these training-institute-specific

**The student's result is the product being sold.** Every other sector treats publishing a data
principal's data as a failure; here it is the business model. `rs-remove-result-post` — *"take my
photo, rank and marks out of your publicity"* — therefore has no real equivalent in the other packs,
and its hard part is honest: the asset has already been copied into every campaign folder, forwarded
through dozens of parent groups and reposted by franchise partners, and the original permission was a
clause signed before the student had any result to publish.

**The enquiry is a tradeable commodity.** `in-enquiry-list-shared` is ranked most severe because a
coaching enquiry routinely reaches competing institutes and agents within a day — which is why
`rs-stop-marketing`'s hard part is that suppression cannot reach copies already passed on.

**Whoever pays is treated as the account holder.** `rs-now-an-adult` exists because nothing in these
systems distinguishes the fee-payer from the data principal, and there is usually one phone number on
the record — the parent's. Note the pack models `parent` in the `client` boundary, so a disclosure to
a parent reads as external, which is correct once the student is an adult.

### Language locks

DPDPA scope only. No claims about what an education board, university, skilling authority or
examination body requires to be retained, and no "sensitive personal data". The incident section is
labelled an *operational response reference*.

### Verification

52/52 pack tests · **zero scenario references to a node hidden in any model** · production build +
TypeScript clean · eslint clean.

### ⚠️ Pre-existing hotspot debt confirmed (NOT introduced here, NOT fixed here)

Measuring while in this pack pinned the long-standing flags-vs-counter mismatch to exact nodes:

| Model | visible / flags / counter | Hotspot nodes gated away |
|---|---|---|
| `hybrid` | 7 / 7 / 7 ✅ | — |
| `classroom` | 5 / 5 / 7 ❌ | `proctoring`, `ai-personalisation` |
| `online` | 5 / 5 / 7 ❌ | `physical-file`, `biometric-device` |

This is the **disappearance** failure mode (§2 of the root handoff), not collision. The spine is fully
shared — all 10 stages are all-model — so the only cause is that 4 of the 7 hotspot *nodes* carry
`businessModels` gates.

**Fixing it is a visible content change** (it alters the headline risk list), so it was deliberately
left out of this content-only cycle and needs Dilip's decision. Two options:

1. **Re-point the 4 gated hotspots to ungated anchors.** TI has 10 ungated non-person nodes
   (`admission-erp`, `payment-gateway`, `fee-spreadsheet`, `whatsapp`, `certificate-system`,
   `placement-portal`, `old-records`, `cloud-drive`, `staff-devices`, `backups`), so a 7-hotspot set
   on 7 distinct ungated anchors is achievable — but 4 hotspots' copy would be rewritten, and the
   sector-specific proctoring / biometric / AI-personalisation angles would move out of the hotspot
   rail into node-level risk (where they already exist with `riskWhy`/`riskAction`).
2. **Reduce to 5 hotspots** (the 3 currently-ungated plus 2 re-pointed). Legal — the band is 5–8 —
   but loses two headline risks.

Option 1 preserves more and matches what clinics and schools did. Either way, the universal Tier-1
invariant test can only land once `recruitment-agencies` and `ca-firms` are corrected too.
