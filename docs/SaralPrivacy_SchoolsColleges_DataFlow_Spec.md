# SaralPrivacy — Schools & Colleges Personal Data Flow Map (Map #6)

**Status:** built on `feat/data-flow-schools-colleges`, awaiting preview sign-off.
**Route:** `/industries/schools-colleges/data-flow`
**Contract:** `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
**Precedents:** TI + D2C (multi-model, shared spine) · Clinics (multi-model, **gated** spine, derived hotspot count)

---

## 1. The sector's shape

Recruitment is a pipeline that flows once. A CA firm is a loop that recurs yearly. A training
institute is a lifecycle with an end. D2C is a funnel that never closes. A clinic is a record that
outlives the visit.

**Education is a permanent record accumulated by proxy.** It is the only sector in the series where
the record *starts before the person can consent to it*, is added to every single day for a decade or
more by people who are not the institution's own staff — teachers, drivers, app vendors — and then
follows the person out as an alumnus. Nobody chose most of what is in it, and by the time the subject
can ask about it, the people who created it have moved on.

**Signature exposure (hotspot #1):** *the child's face is the institution's marketing asset.* No other
kind of business publishes its data principals' faces and names as a matter of routine. A named child,
in uniform, at an identifiable place, on a known daily schedule — with their marks beside them.

---

## 2. Operating models

| id | Label | Stages | Role |
|---|---|---|---|
| `school` | School — K–12 | 12 | **DEFAULT** (drives the `/data-mapping` card stats) |
| `college` | College / higher education | 13 | — |
| `integrated` | Integrated multi-campus institution | 15 | **SUPERSET** (appears in every gated tag) |

Default ≠ superset — the D2C pattern, not the clinics one. `school` is first because it is what most
people searching this actually run; `integrated` is the superset because it genuinely runs both a
school and a college plus central analytics.

**The spine is model-gated** (recruitment/clinics precedent), because the divergence is real: a K–12
school runs bus routes and has no placement cell; a degree college runs hostels, proctoring and
placements and no school transport. Counts are free in this framework — they were not forced to match.

Gated stages: `transport` (school+integrated) · `residential`, `placement` (college+integrated) ·
`analytics` (integrated only).

---

## 3. The hotspot count is DERIVED, not chosen

Eleven of the fifteen stages are all-model. Each of the eight hotspot nodes is **ungated**, and each
one's **earliest** stage is a **distinct all-model stage**:

| Stage (seq) | Hotspot node | Rank |
|---|---|---|
| admission (2) | `consent-record` | 2 |
| enrolment (3) | `student-erp` | 6 |
| learning (4) | `public-ai-tool` | 5 |
| monitoring (5) | `cctv-system` | 3 |
| wellbeing (8) | `counselling-notes` | 4 |
| fees (10) | `fee-portal` | 7 |
| communication (13) | `public-website-social` | 1 |
| exit (15) | `erp-archive` | 8 |

⇒ **flags = 8 = counter in all three models, by arithmetic.** Verified: `school 8/8 · college 8/8 ·
integrated 8/8`. This is the defect still open on `ca-firms`, `recruitment` and two of three
`training-institutes` models.

A hotspot node may span *later* stages (the ERP genuinely does) but never an earlier one — an earlier
gated stage would move the flag in some models and break the reconciliation.

**Deliberately not hotspots**, because they sit on model-gated stages: the driver's personal phone
carrying children's home addresses, online proctoring recording the inside of a student's home, an
employer keeping a whole batch's CVs, group analytics scoring children. Each is authored as a
**critical-risk node** with its own `riskWhy`/`riskAction` and renders in full where it exists.

---

## 4. Computed reference model

| | school | college | integrated |
|---|---|---|---|
| Stages | 12 | 13 | 15 |
| Distinct places (systems) | 48 | 51 | 57 |
| External parties | 17 | 18 | 21 |
| External transfers | 37 | 39 | 47 |
| Copies created | 89 | 95 | 108 |
| Hotspots (flags = counter) | 8 = 8 ✅ | 8 = 8 ✅ | 8 = 8 ✅ |

Pack totals: 15 stages · 60 nodes · 115 edges · 16 data categories · 15 personas · 8 hotspots ·
7 rights scenarios · 7 incident scenarios.

Every metric is computed from the dataset by `computePackSummary` / `filterByBusinessModel` — none is
hand-typed into copy.

---

## 5. Language locks

- **"High-impact student data", never "sensitive personal data."** The DPDPA creates no such statutory
  category — that is GDPR-tier language and would be a factual error dressed as rigour.
- **DPDPA scope only.** No claims about what an education board, university or regulator *requires* to
  be retained. No legal advice. No statutory retention schedule.
- **Guardian ≠ automatic authority.** The map never treats a family member as authorised by default.
- The guardian sits in the `candidate` boundary because for a minor they exercise the child's rights.
  That stops being true at 18 — carried as a **rights scenario** (`rs-now-an-adult`), not a footnote.

---

## 6. Shared-engine additions in this cycle

Dilip's call on the pasted spec was **"content pack + shared-engine additions"** — the simulators go
into the shared engine so all twelve maps can carry them, not into a Schools-only tree.

| Addition | Where | Notes |
|---|---|---|
| `rightsScenarios` (optional pack field) | `lib/data-flow/schemas.ts` + `components/data-flow/RightsSimulator.tsx` | Renders only for packs that author it. `blockedNodeIds` is first-class — a walkthrough implying every copy is reachable would be worse than none. |
| `incidentScenarios` (optional pack field) | `lib/data-flow/schemas.ts` + `components/data-flow/IncidentSimulator.tsx` | Labelled an *operational response reference*; explicitly not breach-notification advice. |
| Accessible table view of the system map | `components/data-flow/FlowSystemTable.tsx` | Real `<table>` of the same filtered model. The lane board is close to unusable by keyboard/screen reader/320px. Board↔Table toggle. |
| `?model=` URL state | `DataFlowClient.tsx` | Closes the gap logged in the map-#5 handoff §10. **All five existing maps get it too.** |

**Why optional-per-pack does not violate "presentation unified, content varies":** the law bans a
per-industry component tree, not pack-driven content. This is the same mechanism as `businessModels`
(one model hides the selector) and `boundaryLabels`. Presentation is identical wherever a section
appears; only whether a pack has authored content differs.

⚠️ **Follow-up owed:** the other five live packs have no rights/incident content yet, so those sections
are absent on their maps. Authoring them is a **content-only** cycle per sector, no code.

### `?model=` — why not `useSearchParams()`

`useSearchParams()` forces the client subtree behind a Suspense boundary during static prerendering,
which would have stripped the journey, every system and every hotspot title out of the **indexed
HTML** — a bad trade for a query parameter on a page that exists to be found. The model is instead
read from `window.location` after mount and written with `history.replaceState`. Verified: the
prerendered HTML (446 KB) contains the H1, all three model labels, all eight hotspot titles and both
new sections.

---

## 7. Verified inputs

- `assessmentRoute`: `/assessment/schools-colleges`
- `assessmentBuckets`: `student_parent_data` · `children_consent` · `monitoring_safety_systems` ·
  `learning_vendor_platform` · `retention_sharing_rights` — verified against
  `lib/data/industry-assessment/packs/schools-colleges.ts`. **All five are reachable from the map.**
- `discoveryNicheId`: `schools` (real slug; `colleges`, `playschools-daycare`, `school-transport` also
  exist — `schools` matches the default model)
- Hotspot deep-links land on `?bucket=` with a teal focus banner. **`<Suspense>` added to
  `app/assessment/schools-colleges/page.tsx`** — it was missing, and `next build` fails without it.

---

## 8. §14 — What this build deliberately does NOT do

The pasted specification proposed a bespoke Schools-only engine. Per the established response (map #3,
#4, #5), its **content inventory was mined in full** and its **architecture was rejected in writing**.
Every deviation is recorded here rather than silently dropped.

| Spec asked for | Not built | Why |
|---|---|---|
| ~30 new `Education*` components (`EducationFlowPage`, `EducationStageCard`, `EducationVariantSelector`, …) | ❌ | Violates "presentation unified, content varies". The shared engine already renders all of it pack-driven. A parallel tree means the next six maps diverge. |
| `EducationFlowSystem` / `EducationFlowStage` / `EducationFlowNode` types | ❌ | The existing `FlowNode`/`FlowStage`/`FlowEdge` schemas carry every field that renders. Adding a parallel type system would fork validation and tests. |
| 43 data categories | ❌ — **16 authored** | Past ~16 the legend stops communicating and every node renders a wall of tags. The fine distinctions (caste/category certificates, safeguarding concerns, mess registration, viva recordings) live as `examples`. |
| Separate `EducationFlowMetrics` with 17 counters | ❌ | `computePackSummary` + the journey's cumulative counters already derive every metric that is displayed. Unrendered counters are not metrics. |
| `GuardianAuthorisation` state machine (8 states, verification/expiry fields) | ❌ | This is an *operational system* an institution would run, not a reference model. The map's job is to show that authority is assumed rather than recorded. Covered as hotspot #2 + `rs-now-an-adult`. |
| 21 graph filters (children's-data only, CCTV only, biometric only, …) | ⚠️ partial | Risk + connection-type filters exist and now a table view. A 21-facet filter bar on a reference model is a research tool, not a teaching one. Reconsider as a shared-engine cycle if usage justifies it. |
| Dedicated recipient / monitoring / data-category **matrices** | ❌ | Three more views of the same 60 nodes. The table view plus the node drawer answer the same questions. |
| 18 `education_flow_*` analytics events | ⚠️ partial | Reused the shared `trackEvent.dataFlow` namespace and added `map_view_changed`, `rights_scenario_opened`, `incident_scenario_opened`. A per-sector event namespace would make cross-map comparison impossible. |
| FAQ schema on the data-flow page | ❌ | There are no visible FAQs on this page. Emitting FAQ schema without them is exactly the kind of thing the content/trust audit flagged. |
| Lighthouse 90+/95+ targets measured | ⏳ not measured | Requires the deployed preview. Flagged as an open item, not claimed. |
| Move `/data-mapping` card to "Available maps" | ✅ automatic | The registry line does this. It shows on the **preview** for review; production is unchanged until merge. |

**Also worth flagging:** the pasted spec asserted the variant selector was already URL-backed. It was
not, on any of the five live maps — that gap is closed in this cycle (§6).

---

## 9. Known limitations

1. **Lighthouse / Core Web Vitals not measured** — needs the deployed preview.
2. **Rights & incident sections are absent on the other five maps** until their packs author content.
3. **Content not domain-reviewed.** Like CA, D2C and clinics before it, the sector detail is authored
   from the framework and the pasted spec, not validated by a practising school or college.
4. **`transport` is gated to school+integrated** — many Indian colleges do run buses. Deliberate, to
   keep the three models genuinely distinct rather than near-identical.
5. **Flags-vs-counter debt elsewhere is untouched.** `ca-firms`, `recruitment` and `training-institutes`
   (2 of 3 models) still mismatch. This pack proves the construction that fixes them; the universal
   Tier-1 test can only be added once all three are corrected.
