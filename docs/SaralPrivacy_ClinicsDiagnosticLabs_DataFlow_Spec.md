# SaralPrivacy — Clinics & Diagnostic Labs Personal Data Flow Map

**Spec v1 · Map #5 in the Data Flow series · 2026-08-01**
Model copied: `docs/SaralPrivacy_D2CBrands_DataFlow_Spec.md` (multi-model) · Contract: `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
Actor: **Patient** · Route: `/industries/clinics-diagnostic-labs/data-flow`
Branch: `feat/data-flow-clinics-diagnostic-labs` (off `main` @ `8c0a89d`)

**Status: SPEC — nothing built yet. Awaiting sign-off on §0 and §14 before authoring.**

---

## 0. The one decision that governs everything else

A long external *"Comprehensive Claude Code Development Specification"* was supplied for this map —
the third time this has happened (maps #3, #4, now #5). It is an **excellent content inventory**:
its stage detail, system naming, external-party network and hotspot reasoning are the richest input
this series has had for any sector, and it is mined in full.

But its **architecture is wrong for this codebase**, and is not followed literally. It proposes a
bespoke healthcare engine: ~30 new components (§26), new `HealthcareFlowSystem` / `HealthcareFlowStage`
/ `HealthcareFlowNode` / `HealthcareFlowEdge` types (§14, §15, §19), a 16-metric interface (§20), a
separate dataset per variant (§16), a patient-rights simulator (§22), an incident simulator (§23), a
20-filter graph matrix (§25), a new validation module (§35), a new test suite (§36) and
`healthcare_flow_*` analytics (§34) — all scoped to one industry.

That violates two settled laws:

- **"Presentation unified, content varies"** (architectural law): the data-flow *presentation* is
  identical across all 12 industries; only *content* differs. **A view change shipped to one
  industry alone is forbidden.**
- **The config-driven engine** (handoff §0): a map = **one pack folder + two one-line
  registrations**, ~content-only, no route/component/schema edits.

**And the pasted spec's headline feature already exists.** Its "three genuinely different journeys,
not labels or filters over one common journey" (§1) is precisely what `businessModels` does today:
recruitment ships two, training institutes and D2C three, gated per-stage / per-node / per-edge,
projected by `filterByBusinessModel()`, with the selector auto-hiding at one model and the URL
already carrying the choice.

> **Recommended scope: Selective Expansion.** Deliver the pasted spec's rich content and its three
> operating models **through the existing config engine**. Author one pack; touch no route, schema
> or graph model. See **§14** for the explicit "will NOT build" list.
>
> ⚠️ **This is Dilip's call, not the build's** (handoff §9 step 3). Confirm before authoring.

---

## 1. The 10-layer standard applied to clinics & diagnostic labs

Identical presentation, healthcare content.

| Layer | Clinics & Diagnostic Labs content |
|---|---|
| Main actor | **Patient** (plus the **family member / caregiver**, a second principal who receives data they were never asked about) |
| Business journey | 14-stage superset → 10 / 12 / 14 visible per model (§4) |
| Personal data | 16 categories, 3 of them derived (§6) |
| Business activity | consulting, testing, imaging, reporting, billing and above all **report sharing** |
| Systems | ~42–46 nodes: reception phone, clinic software, EMR, LIS, PACS, analysers, home-collection app, reference lab, TPA portal, WhatsApp, archives |
| People who access | ~12 personas, incl. the phlebotomist and the remote pathologist |
| External sharing | referring doctors, hospitals, reference labs, TPAs/insurers, corporate employers, device and AI vendors, couriers, family members |
| Copies created | computed per model — never hand-typed |
| Where control breaks | **8 hotspots** (§7 — the count is structurally derived, see §7.1) |
| DPDPA expectation | per stage, in `dpdpaNote` |

**The sector's shape: a record that outlives the visit.** Recruitment is a pipeline that flows once,
CA a loop that recurs yearly, a training institute a lifecycle with an end, D2C a funnel that never
closes. A patient record is different again — **one short episode of care generates a permanent,
high-impact artefact that keeps being re-shared long after the patient stops being a patient.** The
map's centre of gravity is therefore stages 9–14 (reporting → delivery → archive), not intake.

**Signature exposure (the thing no other vertical has):** *the report itself is the deliverable, and
delivering it is the breach.* A lab report or prescription is sent onward — to the patient, a spouse,
a parent, a referring doctor, an employer who paid for the health check, a TPA processing a claim —
over WhatsApp, an open link, or a printout collected at a counter, **with no verification of who the
recipient actually is, and no way to recall a wrong send.** Ranked hotspot #1.

---

## 2. Business models

Three genuine journeys, gated per stage/node/edge.

| id | label | Role |
|---|---|---|
| `clinic` | Standalone Clinic | leanest — consultation-led, refers testing out |
| `diagnostic-lab` | Diagnostic Laboratory | sample-led, no consultation, deepest physical chain |
| `integrated` | Integrated Clinic + Diagnostics | **superset** — consultation *and* testing *and* home collection *and* TPA |

**Gating convention (handoff §3):** shared core carries **no** `businessModels` tag; each
variant-specific entity tags itself with **its own model + `integrated`**, so `integrated` appears in
every gated tag and renders the full union.

### ⚠️ Open decision D1 — which model is the default

`businessModels[0]` is the default, and it also drives the **`/data-mapping` card stats** (the card
calls `filterByBusinessModel(pack, pack.businessModels[0].id)`).

| Option | Effect | Argument |
|---|---|---|
| **`integrated` first** | matches pasted spec §7.3 verbatim; card shows the largest numbers | The spec explicitly names it the default |
| **`clinic` first** | default ≠ superset (the D2C pattern, now generalised); card shows leaner, more typical numbers | Most SaralPrivacy visitors in this sector are a standalone clinic or a standalone lab. Opening on the biggest, reddest map risks the fearmongering the content standard forbids, and weakens the "that's my clinic" recognition test |

**Recommendation: `integrated` first**, following the pasted spec — the sector genuinely trends
integrated, and the D2C precedent proves the engine handles either. Flagging it because it is a
one-line change now and a re-verification later.

---

## 3. Lexicon & boundaries

```
subject: "patient" · subjectArtefact: "One patient's record" · org: "practice"
```

`org` is deliberately `practice`, not "clinic" — it must read correctly in "outside your ___" for a
standalone lab as well as a clinic.

`boundaryLabels`:

| Boundary | Label | Who |
|---|---|---|
| `candidate` | **The patient** | the data principal |
| `agency` | **Your clinic or lab** | the business |
| `client` | **Referring doctors & hospitals** | who orders/receives care data |
| `vendor` | *(default)* | LIS/HIS/PACS, cloud, device vendors, AI tools, reference labs, couriers |
| `third-party` | **Family, employers & insurers** | receive data with no processing contract; separate controllers |
| `government` | *(default)* | notifiable-disease reporting |
| `public` | *(default)* | not expected to be used in this pack |

A **reference lab is `vendor`** (processes on our instruction). A **TPA/insurer and a corporate
employer are `third-party`** (separate controllers we cannot administer or delete from). A **family
member is `third-party`**, which is the modelling decision that makes the pasted spec's core concern —
"caregiver contact treated as blanket authorisation" (§9.9) — visible on the map as an external
transfer rather than an internal convenience.

---

## 4. Journey stages — a 14-stage superset, projected per model

This is the **first map in the series where the stage spine itself must be model-gated.** D2C and TI
share one spine and only repopulate the systems; here that would be dishonest — a diagnostic lab has
no consultation, and a standalone clinic has no analyser. Recruitment set the precedent (permanent 10
of 12 stages, staffing 12).

| # | id | Stage | `clinic` | `diagnostic-lab` | `integrated` |
|---|---|---|:--:|:--:|:--:|
| 1 | `booking` | Appointment, enquiry & test booking | ✅ | ✅ | ✅ |
| 2 | `registration` | Registration, identity & consent | ✅ | ✅ | ✅ |
| 3 | `consultation` | Consultation & clinical documentation | ✅ | — | ✅ |
| 4 | `orders` | Prescriptions, test orders & referrals | ✅ | ✅ | ✅ |
| 5 | `collection` | Sample collection & imaging | — | ✅ | ✅ |
| 6 | `home-collection` | Home collection & field staff | — | ✅ | ✅ |
| 7 | `transport` | Transport, chain of custody & accession | — | ✅ | ✅ |
| 8 | `processing` | Lab processing, devices, outsourcing & AI | — | ✅ | ✅ |
| 9 | `reporting` | Validation, report generation & correction | ✅ | ✅ | ✅ |
| 10 | `delivery` | Report delivery, family & third-party sharing | ✅ | ✅ | ✅ |
| 11 | `billing` | Billing, insurance & TPA | ✅ | ✅ | ✅ |
| 12 | `followup` | Follow-up, chronic care & engagement | ✅ | — | ✅ |
| 13 | `grievance` | Complaints, corrections & incidents | ✅ | ✅ | ✅ |
| 14 | `archive` | Archive, retention, sample disposal & deletion | ✅ | ✅ | ✅ |
| | | **Visible stages** | **10** | **12** | **14** |

**Eight stages are all-model** (1, 2, 4, 9, 10, 11, 13, 14). That number is not cosmetic — §7.1 shows
it is exactly what makes the hotspot count reconcile.

**Deviation from the pasted spec, recorded:** it asks for exactly 10 stages in each variant (§9.1,
§10.1, §11.1). We ship 10 / 12 / 14. The framework states stage counts are free and should follow the
sector's reality; forcing 10 everywhere would mean either merging chain-of-custody into collection
(losing the lab's signature physical exposure) or padding the clinic journey. The pasted spec's own
stage *content* is preserved in full — it is redistributed, not dropped.

**Build-time check (not schema-enforced, handoff §2.2):** every stage must have **≥1 system in every
model that shows it**, or it renders empty. Verified by the §12 script.

---

## 5. Systems — what "name real software" means here

Per handoff §8, generic labels fail the recognition test. This pack names, where genuinely typical of
Indian clinics and labs: reception register and reception phone, **personal WhatsApp**, clinic
software / HIS, EMR, **LIS**, **PACS**, haematology and biochemistry **analysers** and their
middleware, barcode/accession, the **home-collection app and phlebotomist's own phone**, route/maps
tooling, transport box and chain-of-custody log, **reference lab** and courier, remote-reporting
portal, **AI interpretation / scribe tools**, patient portal and report links, **TPA/pre-auth portal**,
corporate health-check roster, billing and UPI, shared drive, doctor's laptop, cloud backup, **stored
physical samples** (`physical_storage`), and physical file racks.

`sample-specimen` and stored samples are modelled as real nodes with the `physical_storage` node type —
the pasted spec is right that a sample *is* personal data in a place, and the engine already has the
node type for it. **No schema change is needed to represent physical samples.**

---

## 6. Data categories — 16 (3 derived)

The pasted spec lists 40 category ids (§8). That is a taxonomy, not a map legend: at 40 the colour/
legend layer stops communicating and every node lists a wall of tags. Existing packs run 11–15. These
16 carry all 40 of the pasted spec's concepts as **examples** inside a category.

**Provided (13):** `patient-identity` · `patient-contact` · `family-caregiver` · `government-id` ·
`appointment-visit` · `clinical-history` · `diagnosis-treatment` · `prescription-medication` ·
`lab-order-result` · `diagnostic-image` · `sample-specimen` · `billing-insurance` ·
`communication-media`

**Derived (3):** `clinical-inference` (AI flags, preliminary interpretations, auto-generated summaries) ·
`chronic-care-profile` (adherence, missed-appointment score, risk category) · `marketing-segment`
(wellness/campaign segmentation built from clinical history)

The derived three are the quiet half of the map and are exactly what the patient has never seen and
cannot correct — rendered visually distinct by the shared views.

### Copy locks (non-negotiable — handoff §7)

- ✅ **"high-impact health data"** — the pasted spec's own instruction (§8), and correct.
- ⛔ **Never "sensitive personal data"** — DPDPA has no such statutory category; that is GDPR-tier
  language and is a factual error in this context.
- ⛔ **No NDHM / ABDM / Clinical Establishments Act / MCI retention-schedule claims.** DPDPA scope
  only. The map must not imply a universal medical-record retention period.
- ⛔ **No medical advice, no legal advice.** Handled by `disclaimer` plus the pasted spec's
  medical/legal line folded into the stage copy where relevant.
- ⛔ **No accusation framing.** Frame by custody: "this is where a copy exists and who can reach it."

---

## 7. Hotspots — 8, and why it is exactly 8

### 7.1 The structural derivation (this is the important part)

Reading `MotionJourney.tsx:160–200` and `DataFlowClient.tsx:247,284` gives the exact semantics that
produce the "5 flags vs counter 7" defect Dilip catches on every map:

- The **journey red flags** = the number of **distinct stages** that at least one hotspot's node
  resolves to, where a node resolves to *the first of its `stageIds` that is visible in the current
  model*. A node with **no visible stage is silently skipped**.
- The **counter and legend copy** = `pack.hotspots.length` — **pack-level, constant, not filtered by
  model.**

So the invariant that must hold is stricter than D2C's:

> **In every business model, all 8 hotspot nodes must resolve to 8 distinct visible primary stages.**

Two failure modes follow, and both are avoided by construction:

1. **Collision** — two hotspot nodes sharing a primary stage → flags < counter.
2. **Disappearance** — a hotspot node whose only stages are model-gated vanishes in the models that
   hide them → flags < counter, while the copy still says 8.

**The construction:** each hotspot node is **ungated** and **pinned to exactly one stage**, and that
stage is one of the **8 all-model stages** (§4). One hotspot per all-model stage. Then flags = 8 =
counter in all three models, by arithmetic rather than by luck.

**This is why the count is 8, not 7 and not 10:** there are exactly 8 all-model stages. It is also why
`billing` is an all-model stage — a diagnostic lab does bill patients, corporates and TPAs, and making
it all-model is both domain-honest and what yields the eighth slot.

### 7.2 The 8

| Rank | Stage (primary) | Hotspot | Bucket |
|---|---|---|---|
| 1 | `delivery` | **The report is delivered without knowing who receives it** — patient, spouse, parent, referring doctor, employer, TPA, over WhatsApp, an open link, or a counter printout; wrong sends cannot be recalled | `report_sharing_communication` |
| 2 | `booking` | **Symptoms arrive on a personal phone before any patient record exists** — reception WhatsApp and phone carry health concerns, forwarded reports and prescriptions with no access control, retention or export | `patient_data_collection` |
| 3 | `registration` | **Identity is collected by default and matched by hand** — Aadhaar and full ID copies retained without need, duplicate patient profiles, and manual matching that can attach a result to the wrong person | `patient_data_collection` |
| 4 | `reporting` | **Draft, validated and corrected versions of the same report coexist** — and AI-generated interpretations pass into the record without a human validating them | `health_data_sensitivity` |
| 5 | `orders` | **Referrals and prescriptions disclose more history than the question needs** — a whole clinical history travels to an external lab, imaging centre or specialist for one test | `report_sharing_communication` |
| 6 | `billing` | **Diagnosis reaches finance staff, insurers and employers** — invoices print the condition, full reports go to TPAs where a summary would do, and corporate health checks return to the employer | `system_staff_vendor_access` |
| 7 | `grievance` | **Corrections and wrong-recipient incidents stay in the chat they arrived in** — the master record is never amended, and the recipients of the wrong version are never told | `retention_incident_readiness` |
| 8 | `archive` | **Deleting the record reaches almost none of the copies** — analyser memory, device logs, the reference lab, WhatsApp, doctor laptops, backups, printed files and stored physical samples | `retention_incident_readiness` |

All five assessment buckets are covered (§9).

### 7.3 What this costs, recorded honestly

The pasted spec asks for **8 / 9 / 10 hotspots per variant** (§9.12, §10.12, §11.12) — 27 in total.
Two constraints make that impossible as specified: the schema band is **5–8**, and hotspots are
**pack-level, not per-variant**.

The casualty is real and worth naming: the lab's most distinctive exposures — **home-collection staff
carrying addresses and test names on a personal phone**, **sample and identity separating during
collection or transport**, **analysers retaining results outside the LIS**, and **reference labs
receiving excessive identifiers for genetic testing** — live on lab-only stages and therefore
**cannot** be hotspots without breaking the count.

**They are not dropped.** Each is authored as a `critical` or `high` risk **node** with mandatory
`riskWhy` + `riskAction`, which the journey and the detail sheet render in full, filtered correctly to
the models where they exist. The hotspot rail is explicitly the curated "start here" list, not the
risk inventory — the schema says so at `schemas.ts:289`.

**If Dilip wants those four surfaced as hotspots**, the honest options are (a) make them the 8 and
demote four all-model ones, or (b) an engine change to filter the rail and counter by model — which
is a shared-engine change for all 12 maps, in its own cycle, never on one sector. **Flagged, not
decided here.**

---

## 8. High-impact healthcare scenarios (pasted spec §12)

Children, fertility/pregnancy, mental health, genetic testing, infectious disease, corporate health
checks and teleconsultation are **not** a new UI panel (`SpecialHealthRiskPanel`, §26). They are
carried as **content**: examples inside `diagnosis-treatment` and `lab-order-result`, `riskWhy`
wording on the relevant nodes, and `dpdpaNote` lines on `delivery`, `billing` and `archive`.

Two get explicit node/edge representation because they change the flow, not just the risk wording:

- **Corporate health checks** — an employer-paid transfer to a `third-party` who is not the patient.
- **Teleconsultation** — a genuinely separate intake and recording surface in `clinic` and `integrated`.

**Children's data** reuses the training-institutes pattern (guardian persona + family-caregiver
category) rather than inventing a new one.

---

## 9. Assessment wiring — verified

`assessmentRoute: "/assessment/clinics-diagnostic-labs"`

`assessmentBuckets` — **verified 2026-08-01** against
`lib/data/industry-assessment/packs/clinics-diagnostic-labs.ts` (lines 30–50):

```
patient_data_collection · health_data_sensitivity · report_sharing_communication
system_staff_vendor_access · retention_incident_readiness
```

Matches the handoff §7 table exactly. All five are reachable from the 8 hotspots.

### ⚠️ Open decision D2 — `discoveryNicheId`

The handoff §7 lists `clinics` (or `hospitals`). **Both are wrong-ish: there are two equally valid
niches**, verified in `lib/discovery/data.generated.ts`:

| id | name | aliases |
|---|---|---|
| `clinics` | Clinics & polyclinics | doctor's clinic, OPD clinic |
| `diagnostic-labs` | Diagnostic labs | pathology lab, radiology centre, imaging centre, sample collection centre |

(`hospitals`, `dental-clinics`, `ayush-clinics`, `telemedicine`, `mental-health` also exist and are
out of scope.)

The field takes one value. **Recommendation: `clinics`** — it matches the sector's primary name and
the default clinical journey. Note that `discoveryNicheId` is currently **only** consumed by the
recruitment-specific Tier-2 test (`data-flow.test.ts:222`) and is not rendered anywhere, so this is
low-blast-radius and reversible; it matters for correctness and for when Discovery cross-linking lands.

---

## 10. Presentation copy

Per pasted spec §4 and §33, adopted nearly verbatim — it is good copy and it is on-brand.

- **h1:** `One patient. Many systems. One healthcare provider's responsibility.`
- **eyebrow:** `Clinics & Diagnostic Labs` · **breadcrumbLabel:** `Clinics & Diagnostic Labs`
- **metaTitle:** `Clinic & Diagnostic Lab Patient Data Flow Map | SaralPrivacy`
- **ogTitle:** `Where does one patient's data go?`
- **intro / metaDescription / ogDescription / previewBlurb:** from §4 and §33.
- **howToRead[3]:** "Pick your model" · "When it leaves you" · "Where control breaks" — the shared
  three-card pattern, with the model names of §2.
- **ctaHeading / ctaBody / ctaButton:** `Take the clinic & lab risk scan`.
- **disclaimer:** the pasted spec's reference-model line **plus** its medical/legal line, merged:
  *"This is a reference model of a typical clinic or diagnostic laboratory — not a scan of your
  systems, and not medical or legal advice. Your own flow may have fewer or more stops."*

**Canonical, OG, Twitter, breadcrumb + WebPage structured data, preview `noindex`, prod indexable**
(§33) are **all already produced by the shared route** for every map. No new SEO work.

---

## 11. Wiring — four edits, all one-liners except one

| # | File | Edit |
|---|---|---|
| 1 | `webapp/lib/data/data-flow/index.ts` | add `"clinics-diagnostic-labs": clinicsDiagnosticLabsDataFlowPack,` to `PACKS` + its import |
| 2 | `webapp/lib/data-flow/data-flow.test.ts` | add the pack to `PACKS` + its import → inherits all 7 universal guarantees |
| 3 | `webapp/app/industries/clinics-diagnostic-labs/page.tsx` | insert `<DataFlowPreview …/>` above "How the 3-minute scan works" (line ~172) |
| 4 | `webapp/app/assessment/clinics-diagnostic-labs/page.tsx` + `ClinicAssessmentClient.tsx` | `?bucket=` deep-link + focus banner |

**Edit 1 alone surfaces the map** on `/data-mapping` (out of "Coming next" into "Available maps"), the
footer column and the sitemap. The pasted spec's §31 requirement — *promote only after preview
approval* — is satisfied by the branch/preview workflow itself: registration is on the branch, and the
branch only reaches prod on Dilip's explicit sign-off. **No separate feature flag is needed or wanted.**

### ⚠️ Confirmed blocker found in edit 4

`app/assessment/clinics-diagnostic-labs/page.tsx` currently renders `<ClinicAssessmentClient />`
**without `<Suspense>`**, and `ClinicAssessmentClient.tsx` does **not** use `useSearchParams`. Adding
the `?bucket=` deep-link introduces `useSearchParams`, which **fails `next build`** unless the client
is wrapped. `app/assessment/d2c-brands/page.tsx` is the exact pattern to copy. This is a required
modification, not optional.

---

## 12. Verification

1. `node --test --experimental-strip-types lib/data-flow/data-flow.test.ts` — expect **45 tests**
   (38 today + 7 inherited for this pack), all green. `validatePack` runs inside.
2. **The reconciliation script** (handoff §5, verbatim) extended with this pack, run for all three
   models. Required output: `flags=8 counter=8 OK` **three times**, and **no** `stages with no system`.
3. **Scoped `tsc`** — `tsconfig.scoped.json` covering the pack, the test, and the two pages touched.
   Full `tsc --noEmit` never completes on this disk.
4. **Shared-view literal grep** (handoff §6) for `candidate|recruitment|agency|customer|brand` across
   `components/data-flow/`, `DataFlowPreview.tsx`, the `[sector]` route and `/data-mapping` — this map
   introduces the first `physical_storage` nodes and the first model-gated stage spine since
   recruitment, so it is a realistic chance to surface a leak.
5. **Lint + build** in background (eslint ~10 min, build ~15 min); the Vercel preview build is faster
   and authoritative.
6. **Preview** → Dilip opens it (previews are SSO-gated; the agent cannot render them) → sign-off →
   `--ff-only` merge → prod curl + HTML grep for H1, all three model labels and all 8 hotspot titles.

---

## 13. Files

**New:** `webapp/lib/data/data-flow/clinics-diagnostic-labs/{stages,data-categories,personas,nodes,edges,hotspots,index}.ts`
**Modified:** the four wiring points in §11.
**Not modified:** `lib/data-flow/schemas.ts`, `components/data-flow/*`, `app/industries/[sector]/data-flow/*`,
`app/data-mapping/page.tsx`, anything under `lib/discovery/` or `app/discovery/`.

---

## 14. Explicitly NOT building (rejecting the pasted spec's over-build)

| Pasted spec asks for | Verdict | Why |
|---|---|---|
| ~30 new UI components (§26) | ❌ | Shared components already render every pack |
| `HealthcareFlowSystem` / `Stage` / `Node` / `Edge` types (§14, §15, §19) | ❌ | `flowNode` / `flowEdge` / `flowStage` already carry every field that renders |
| Separate complete dataset per variant (§1, §16) | ❌ | One pack; entities gated by `businessModels` — the engine's core feature |
| Fresh variant selector (§7.3) | ❌ | `businessModels` + `filterByBusinessModel` exist and are tested |
| `?model=` URL-shareable variant state (§7.3) | ⚠️ **genuine gap** | Corrected 2026-08-01: the selector is plain React state (`DataFlowClient.tsx:42`, `useState(models[0].id)`) — **not** URL-backed, on any of the five maps. So a model view cannot be linked or shared, and a refresh returns to the default. Making it URL-backed is a **shared-engine** change benefiting all 12 maps; it does not belong on one sector. Backlog |
| 16-metric panel (§20) | ❌ | `computePackSummary` + journey counters already compute from data; hand-typed metrics are forbidden |
| Patient-rights simulator (§7.9, §22) | ❌ **backlog** | Genuinely new capability — shared engine, all 12 maps, own cycle |
| Incident simulator (§7.9, §23) | ❌ **backlog** | Same |
| 20-filter graph + 7 view modes + table fallback (§25) | ❌ **backlog** | Same; today's risk filter, wire modes and lane board cover the need |
| New validation module (§35, 35 rules) | ❌ | `validatePack` + the 7 universal tests already cover every listed rule that is expressible |
| New test suite (§36) | ❌ | Registration in `PACKS` inherits the suite |
| `healthcare_flow_*` analytics events (§34) | ❌ | Shared `trackEvent.dataFlow` already fires with `industry` / `model` / `node_id` |
| Tertiary + quaternary CTAs (§7.10) | ❌ | CTA band is shared; per-sector extra buttons fork the view |
| 10 stages per variant (§9.1, §10.1, §11.1) | ⚠️ **10 / 12 / 14** | Counts are free by contract; forcing 10 would drop chain-of-custody or pad the clinic journey (§4) |
| 8 / 9 / 10 hotspots per variant (§9.12, §10.12, §11.12) | ⚠️ **8, pack-level** | Schema band is 5–8, hotspots are pack-level; 8 is what reconciles in all 3 models (§7.1). Casualties named in §7.3 |
| 40 data categories (§8) | ⚠️ **16** | 40 breaks the legend; all 40 concepts survive as examples (§6) |
| Lighthouse / a11y / responsive / SEO targets (§27–29, §33, §37) | ✅ inherited | Shared route already meets them; zero new work |
| Rich content — stages, systems, external parties, hotspots, edge cases | ✅ **use it in full** | This is the pasted spec's real value |

**Net:** the pasted spec's *what* ships in full; its *how* is discarded because the codebase already
provides a better one.

---

## 15. Known debt (not introduced here)

`ca-firms` and `recruitment-agencies` still show **5 control-break flags against a counter of 7**
(handoff §10) — colliding primary stages. This map reconciles at **8 = 8 in all three models by
construction** (§7.1), and its "one hotspot per all-model stage" rule is the first version of that
guarantee that is provable rather than lucky. **Once the two older packs are fixed, that rule should
become a universal Tier-1 test** — it cannot be added today because it would fail them on `main`.

---

## 16. Definition of done

- Three operationally different journeys, one pack, zero engine edits
- 10 / 12 / 14 stages by model, every stage carrying ≥1 system in every model that shows it
- 16 categories, 3 derived; 8 hotspots reconciling 8 = 8 in all three models
- All 5 assessment buckets reachable; `?bucket=` deep-link working with `<Suspense>` in place
- 45 tests green; scoped `tsc` clean; no shared-view literal leaks
- Industry page links to the map; `/data-mapping` surfaces it via registration alone
- Existing recruitment / CA / TI / D2C maps unchanged and passing
- **Vercel preview URL handed to Dilip; production untouched pending his explicit sign-off**

---

## 17. Build plan

Sequence only — no calendar. Hours are tentative and for sizing, not commitment.
**Gate 0 must clear before step 1 begins.**

### Gate 0 — decisions · ✅ SETTLED with Dilip 2026-08-01 — do not re-litigate

| | Decision | Settled as |
|---|---|---|
| **D0** | Scope: content-only pack vs the pasted spec's bespoke engine (§0) | ✅ **Content-only pack (Selective Expansion)** — §14 stands as written |
| **D1** | Default business model (§2) | ✅ **`integrated` first** (= default = superset, the TI pattern) |
| **D2** | `discoveryNicheId` (§9) | ✅ **`clinics`** |
| **D3** | 8 pack-level hotspots; the four lab-specific exposures ship as `critical` nodes, not hotspots (§7.3) | ✅ **Accepted** |

Consequences now locked: `integrated` is both the default **and** the superset, so **every gated
entity must include `integrated`** in its `businessModels` (handoff §3) — and the `/data-mapping`
card will show the integrated model's numbers.

### Step 1 — Stage spine + categories + personas · ~1.5 h

- `stages.ts` (14, model-gated per §4), `data-categories.ts` (16, 3 derived), `personas.ts` (~12)
- **Monitorable:** file compiles; stage ids and sequences match §4 exactly; each of the 3 models
  projects to 10 / 12 / 14

### Step 2 — Nodes · ~3 h (the bulk of the work)

- ~42–46 nodes across all 14 stages, real software named (§5), boundaries assigned per §3
- The 8 hotspot nodes authored **first**, each ungated and pinned to exactly one all-model stage (§7.1)
- Every `high`/`critical` node carries `riskWhy` + `riskAction`; the four lab-signature exposures of
  §7.3 authored as `critical` nodes
- **Monitorable:** `validatePack` reports no unknown stage/category/persona refs and no missing
  `riskWhy`/`riskAction`

### Step 3 — Edges · ~2.5 h

- Movements per stage; `external` set strictly by boundary rule; `createsCopy` honest
- Every node reachable by ≥1 edge (orphans fail); every edge's `businessModels` a subset of both
  endpoints'
- **Monitorable:** `validatePack` returns `[]`

### Step 4 — Hotspots + pack assembly · ~1 h

- `hotspots.ts` (the 8 of §7.2, ranks 1–8, buckets from §9), `index.ts` (config + presentation §10)
- **Monitorable:** pack parses against the Zod contract; all 5 buckets covered

### Step 5 — Wiring · ~0.5 h

- The four edits of §11, including the **`<Suspense>` fix** on the assessment page
- **Monitorable:** `/data-mapping` shows the map; industry page renders the preview card

### Step 6 — Verification · ~1.5 h

- The six checks of §12, in order
- **Monitorable:** 45 tests green · `flags=8 counter=8 OK` ×3 · no empty stages · scoped `tsc` clean ·
  no literal leaks · `next build` succeeds

### Step 7 — Preview → sign-off · ~0.5 h + Dilip's review

- Commit, push branch, confirm the Vercel preview reached `● Ready`, confirm the route prerendered in
  the build logs, **hand over the preview URL and stop**
- ⛔ **No merge, no prod deploy, no `main` touch without Dilip's explicit confirmation that he has
  looked at the preview.**

### Step 8 — Post-merge (only after sign-off) · ~0.5 h

- `--ff-only` merge, push, prod curl + HTML grep (§12.6)
- Memory/handoff update: `.agent/CURRENT.md`, session digest, auto-memory, and a rewritten root
  `handoff.md` for map #6

**Total ~11 h of build**, ~85% of it steps 2–3 (content authoring) — in line with the handoff's
8–12 h estimate.
