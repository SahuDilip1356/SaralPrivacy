# SaralPrivacy — Law Firms & Legal Consultants Personal Data Flow Map (Map #7)

**Status:** spec authored on `feat/data-flow-law-firms`. **Pack not yet built — two decisions are owed
first (§0).**
**Route:** `/industries/law-firms/data-flow`
**Contract:** `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
**Handoff:** `handoff.md` at the project root
**Precedents:** Schools (multi-model, **gated** spine, default ≠ superset, derived hotspot count) ·
CA firms (closest sibling by content: client matters, documents, portal credentials, a file that
outlives the engagement)

---

## 0. Two decisions owed before authoring — read this first

### Decision 1 — the pasted specification's architecture (§9 of the handoff)

A large external specification was pasted in with this build request. As with maps #3, #4, #5 and #6,
it proposes a **bespoke Law-Firms-only engine** — ~40 new `Legal*` components, a parallel
`LegalFlowSystem` / `LegalFlowStage` / `LegalFlowNode` type system, its own metrics module, its own
19-event analytics namespace, 22 graph filters and 10 view modes, and a stateful `LegalHold` state
machine.

That architecture **violates the "presentation unified, content varies" law** and duplicates what the
shared engine already renders pack-driven.

> **Recommendation: content-only pack.** Mine the pasted spec's content inventory in full — it is the
> richest sector input the series has received — and reject its architecture in writing (§8 below).
> Nothing it asks for that a reader would actually *see* is missing from the shared engine today.

**But the standing answer changed on map #6** — Dilip chose "content pack + shared-engine additions"
after three straight content-only calls. **This is his call, not an assumption.** If he chooses
shared-engine additions again, they go in as **optional, pack-driven** capabilities that all twelve
maps can adopt — never a per-sector tree. §8 marks the two candidates worth considering
(`legal-hold` as a node attribute; an authority/public-record filter) and why neither is required.

### Decision 2 — Gate 0: three operating models (§3 of the handoff)

The handoff flagged "law firms are single-journey like CA" as an **untested guess** and named the real
candidate split. The pasted spec independently proposes the same three. **§2 below adopts three
models and explains why the split is a process difference, not a scale difference** — this is the
recommendation, and it is the one thing that most changes the size of the build. Confirm before
authoring.

Everything below assumes both recommendations. If either changes, §2–§4 change with it.

---

## 1. The sector's shape

Recruitment is a pipeline that flows once. A CA firm is a loop that recurs yearly. A training
institute is a lifecycle with an end. D2C is a funnel that never closes. A clinic is a record that
outlives the visit. Education is a permanent record accumulated by proxy.

**A law firm is an adversarial record that becomes public by design.** Two things are true here that
are true nowhere else in the series:

1. **The opposing side is a designed recipient.** Data is gathered specifically in order to be used
   against someone. The other party, their counsel, the court and often the police receive copies —
   not as a leak, but as the point of the exercise. Every other map in this series treats "it reached
   someone outside" as the failure. Here it is the workflow.
2. **Filing makes it public, and the client cannot take it back.** A pleading, an affidavit, an
   annexure — bank statements, a medical report, a chat log, a child's custody details — becomes part
   of a public record. No consent withdrawal, no erasure request and no change of lawyer reverses it.

There is a third feature that shapes the whole map: **most of the personal data in a matter belongs
to people who never engaged the firm.** Opposing parties, witnesses, family members, the target
company's employees in a data room. They have no engagement letter, no notice, and usually no idea
the firm holds their records.

**Signature exposure (hotspot #1):** *the annexure that should have been redacted.* The moment a firm
files high-impact client and third-party data into a public record, its control ends permanently.
That single act is the sector's equivalent of the school publishing a child's face.

---

## 2. Operating models

| id | Label | Stages | Role |
|---|---|---|---|
| `litigation` | Litigation & dispute resolution | 13 | **DEFAULT** (drives the `/data-mapping` card stats) |
| `corporate` | Corporate, transactional & advisory | 13 | — |
| `full-service` | Full-service multi-office firm | 16 | **SUPERSET** (appears in every gated tag) |

Default ≠ superset — the schools and D2C pattern. `litigation` is first because it is what most Indian
firms and independent advocates searching this actually run; `full-service` is the superset because it
genuinely runs both practices plus central knowledge management.

### Why this is a process split, not a scale split

The test the handoff sets is whether the models differ in *process* or only in *systems*. They differ
in process, in both directions:

- A litigation practice **collects evidence about third parties** and **files it into a public
  record**. It has no data room, no due-diligence request list and no closing set.
- A corporate practice **receives other people's personal data in bulk** — a target company's entire
  employee file set — into a data room with access groups and bidders, and never files an affidavit.
  Its "authority" is the MCA or a sector regulator, not a court registry.
- A full-service firm runs both **and** adds something neither has alone: a central precedent and
  knowledge system, ethical walls between practices, and matter data reused for pitches and
  directories across offices.

**The stage spine is therefore model-gated** (recruitment / clinics / schools precedent). Counts are
free in this framework — 13 / 13 / 16 is what the sector produced and was not forced to match. The
pasted spec's "10 stages per variant" is rejected for exactly this reason (§8).

### Stage spine — union order

Eleven of the sixteen stages are **all-model**; five are gated.

| seq | id | Name | Models |
|---|---|---|---|
| 1 | `enquiry` | Enquiry, conflict check & the first conversation | all |
| 2 | `engagement` | Engagement, KYC & matter opening | all |
| 3 | `intake` | Instructions, documents & client uploads | all |
| 4 | `evidence` | Evidence, witnesses & third-party records | `litigation`, `full-service` |
| 5 | `diligence` | Due diligence & the data room | `corporate`, `full-service` |
| 6 | `matter-file` | The matter file, DMS & working copies | all |
| 7 | `analysis` | Research, analysis & AI-assisted drafting | all |
| 8 | `drafting` | Drafting, review & client approval | all |
| 9 | `external` | External counsel, experts, translators & agents | all |
| 10 | `authority` | Court, tribunal & regulatory filing | all |
| 11 | `hearing` | Hearings, orders, settlement & enforcement | `litigation`, `full-service` |
| 12 | `closing` | Signing, closing sets & completion | `corporate`, `full-service` |
| 13 | `billing` | Time recording, billing & expenses | all |
| 14 | `knowledge` | Precedent bank, knowledge reuse & cross-office pitching | `full-service` |
| 15 | `closure` | Matter closure, legal hold & return of documents | all |
| 16 | `archive` | Archives, backups & the record room | all |

- **litigation** sees 1,2,3,4,6,7,8,9,10,11,13,15,16 = **13**
- **corporate** sees 1,2,3,5,6,7,8,9,10,12,13,15,16 = **13**
- **full-service** sees all = **16**

`authority` is deliberately all-model: every one of these firms submits personal data to a body with
its own publication and retention rules. *Which* body differs — court registry vs MCA vs a sector
regulator — and that is content, not structure. Keeping it all-model is also what lets the signature
hotspot sit on an all-model stage (§3).

**Gating convention:** the shared core carries **no** `businessModels` tag; each gated entity tags
itself with **its own model + `full-service`** (the superset).

---

## 3. The hotspot count is DERIVED, not chosen

Guard test (a) — `hotspots reconcile with the counter in every model of every pack` — makes the
recurring flags-vs-counter defect unshippable. The construction it requires: **every hotspot node
ungated, and its earliest stage a distinct all-model stage.**

Eleven stages are all-model. Eight of them carry a hotspot:

| Stage (seq) | Hotspot node | Rank | The failure in one line |
|---|---|---|---|
| `authority` (10) | `court-filing-portal` | **1** | Filing an unredacted annexure makes it public permanently |
| `intake` (3) | `client-whatsapp` | 2 | The client's evidence dump — including other people's records — lands on a personal phone |
| `matter-file` (6) | `matter-dms` | 3 | Everyone in the firm can open every matter, including family and criminal files |
| `external` (9) | `external-counsel` | 4 | The whole file goes out when a subset would do, with no record of who holds what |
| `analysis` (7) | `public-ai-tool` | 5 | Client facts pasted into a consumer AI tool to summarise or draft |
| `archive` (16) | `firm-archive-backup` | 6 | Nothing is ever deleted — "in case of appeal", forever |
| `engagement` (2) | `kyc-id-folder` | 7 | Aadhaar and PAN copies collected by default and never minimised |
| `billing` (13) | `billing-narrative` | 8 | Matter facts written into time entries and invoices that finance and the client's AP both read |

⇒ **flags = 8 = counter in all three models, by arithmetic.**

`enquiry`, `drafting` and `closure` are all-model but carry no hotspot — that is fine and expected
(schools ran 8 hotspots across 11 all-model stages). A hotspot node **may span later stages** — the
DMS genuinely does — but must never acquire an *earlier* one, which would move its flag in some models
and break reconciliation.

### Deliberately NOT hotspots, because they sit on model-gated stages

Each of these is authored as a **critical-risk node** with its own `riskWhy` / `riskAction` and renders
in full wherever it exists — it simply does not carry a red flag, because a gated flag would make the
counter lie in the models that hide it:

- the **data room** a bidder can still export from after the deal dies (`diligence`)
- **evidence media** — call recordings, device extractions, screenshots of someone else's chats
  (`evidence`)
- the **hearing recording and transcript** downloaded to a junior's laptop (`hearing`)
- the **closing set** duplicated across e-signature, email, bank and archive (`closing`)
- the **precedent bank** that kept the client's name in a template (`knowledge`)

---

## 4. Target reference model

Targets for authoring, not claims. **Every published metric is computed from the dataset** by
`computePackSummary` / `filterByBusinessModel` — none is hand-typed into copy, and the numbers below
are replaced by the verified table once the pack exists.

| | litigation | corporate | full-service |
|---|---|---|---|
| Stages | 13 | 13 | 16 |
| Distinct places (systems) | ~44 | ~46 | ~56 |
| External parties | ~17 | ~19 | ~23 |
| External transfers | ~36 | ~40 | ~50 |
| Hotspots (flags = counter) | 8 = 8 | 8 = 8 | 8 = 8 |

Pack targets: **16 stages · ~58 nodes · ~105 edges · 16 data categories · ~15 personas · 8 hotspots ·
8 rights scenarios · 8 incident scenarios.**

### Data categories — 16

Sixteen, not the pasted spec's 51. Past ~16 the legend stops communicating and every node renders a
wall of tags; the fine distinctions live in each category's `examples`.

| id | Covers | kind |
|---|---|---|
| `client-identity` | Name, contact, address, authorised representative | collected |
| `client-kyc` | PAN, Aadhaar, passport, company KYC, beneficial owner | collected |
| `matter-metadata` | Matter type, parties, court/forum, status, conflict-check result | collected |
| `instructions-communications` | Emails, WhatsApp threads, voice notes, attendance notes | collected |
| `financial-records` | Bank statements, tax filings, salary slips, funds flow | collected |
| `property-corporate-docs` | Title deeds, agreements, board resolutions, MCA records | collected |
| `employment-hr-records` | Employee files, disciplinary records, payroll schedules | collected |
| `health-records` | Medical reports, injury records, mental-health material | collected |
| `allegation-records` | Criminal allegations, harassment complaints, matrimonial facts | collected |
| `evidence-media` | Screenshots, photos, video, call recordings, device extractions | collected |
| `third-party-records` | Opposing party, witness, family member, target-company employee | collected |
| `court-filings` | Pleadings, affidavits, annexures, orders, regulatory filings | created |
| `legal-work-product` | Advice, opinions, drafts, strategy and settlement notes | derived |
| `case-assessment` | Risk ratings, outcome predictions, AI summaries, client profitability | derived |
| `billing-time` | Time entries, narratives, invoices, expense receipts, payments | collected |
| `staff-access-record` | Logins, DMS access logs, device and portal credentials | created |

`third-party-records` is the category doing the sector's distinctive work — it is how the map shows
that most of the personal data in a matter belongs to people the firm has no relationship with.
`case-assessment` and `legal-work-product` are marked `derived`: the quiet half that a firm rarely
counts as personal data at all.

### Named software — the "that's my firm" test

Generic "practice management system" fails it. Name what the sector actually runs: matter-management
software, the DMS and the shared drive beside it, the **clerk's diary**, e-filing and cause-list
portals, the **court registry counter**, dictation and outsourced transcription, e-discovery
platforms, virtual data rooms, e-signature, the **precedent drive**, partner and associate laptops,
personal WhatsApp, the **physical file room and evidence boxes**, and the boot of the car they travel
in.

---

## 5. Language locks — tighter here than any other pack

The audience *are* lawyers. An overclaim will be spotted on the first read and will cost the map its
credibility, so these are stricter than the series default.

- **"High-impact client data", never "sensitive personal data."** The DPDPA creates no such statutory
  category. That is GDPR-tier language and would be a factual error dressed as rigour.
- **DPDPA scope only.** No Bar Council of India rules, no advocate–client **privilege** doctrine, no
  professional-conduct claims, no court-rule or statutory retention schedule. Privilege is real and
  important — this map simply does not opine on it. Describe **custody and control**, never legal
  status.
- **No legal advice**, and no accusation. Frame everything by custody and DPDPA obligation. "Where the
  file is" is a fact; "you are in breach" is not ours to say.
- **Erasure needs unusual care.** Unlike every other sector in the series, a litigation file has
  genuine grounds to be retained. The map must never imply everything should be deletable. CA's
  `rs-changing-my-ca` and the schools erasure scenario are the models: **separate what must be kept
  from what merely has been kept.**
- **Confidentiality ≠ readiness.** The industry page already draws this line and the map must hold it:
  a firm can be scrupulous about confidentiality and still have no idea where the copies are.

---

## 6. The two walkthrough sections

Mandatory build step, not optional (handoff §4 Step E). Copy `lib/data/data-flow/ca-firms/scenarios.ts`
— closest sibling, and its language-lock header is the model for the tighter locks above. Every
referenced node must be visible in every model where the scenario shows.

### Rights scenarios — 8

| id | The request, in their words | Type | Models |
|---|---|---|---|
| `rs-return-my-documents` | "I'm changing lawyers. Give me my file back." | access | all |
| `rs-annexure-not-redacted` | "You filed my bank statements without redacting them." | correction | all |
| `rs-delete-my-closed-matter` | "The matter ended two years ago. Delete my file." | erasure | all |
| `rs-correct-my-details` | "My address on the record is wrong." | correction | all |
| `rs-opposing-party-asks` | "Your client's lawyer has my bank statements. Where from, and delete them." | access | `litigation`, `full-service` |
| `rs-my-hr-file-was-in-a-data-room` | "My employment file was shown to a bidder." | access | `corporate`, `full-service` |
| `rs-stop-the-firm-newsletter` | "Stop sending me event invitations." | withdraw-marketing | all |
| `rs-an-intern-read-my-file` | "An intern discussed my matter outside the firm." | complaint | all |

**`blockedNodeIds` is the honest half of this section, and it carries more weight here than anywhere
else in the series.** `rs-annexure-not-redacted` must name the court registry and the public record as
genuinely unreachable — a walkthrough implying a firm can un-file a document would be worse than no
walkthrough. `rs-opposing-party-asks` is mostly blocked too, and saying so plainly is the point.

### Incident scenarios — 8

| id | Title | Severity | Models |
|---|---|---|---|
| `inc-unredacted-annexure-filed` | An annexure was filed without redaction | critical | all |
| `inc-wrong-recipient-email` | The draft went to the opposing side | critical | all |
| `inc-ai-tool-upload` | A junior pasted matter facts into a public AI tool | high | all |
| `inc-open-cloud-link` | A matter-folder share link is still live | high | all |
| `inc-ex-associate-access` | A departed associate still has DMS access | high | all |
| `inc-lost-case-file` | A case bundle was left in a car or at court | high | all |
| `inc-data-room-export` | A bidder downloaded employee files after the deal died | critical | `corporate`, `full-service` |
| `inc-whatsapp-status-leak` | Matter status was posted to the wrong group | medium | all |

Labelled an **operational response reference**, explicitly not breach-notification advice — the shared
`IncidentSimulator` already carries that framing.

---

## 7. Verified inputs (re-checked against source, 2026-08-02)

| Field | Value | Verified against |
|---|---|---|
| Sector slug | `law-firms` | — |
| `assessmentRoute` | `/assessment/law-firms` | route exists |
| Industry page | `app/industries/law-firms/page.tsx` | exists |
| `discoveryNicheId` | **`law-firms`** — exact-match slug | `lib/discovery/data.generated.ts` (`advocate` and `legaltech` also exist; `advocate` would be right only if we modelled solo practice, `legaltech` is a different business) |
| `lexicon` | `subject: "client"` · `subjectArtefact: "One client's matter file"` · `org: "firm"` | reads correctly in "outside your firm" for all three models |

**`assessmentBuckets`** — verified against `lib/data/industry-assessment/packs/law-firms.ts`:

```
client_matter_data
case_evidence_sensitivity
document_sharing_court_workflow
staff_junior_vendor_access
retention_incident_readiness
```

All five must be reachable from the hotspot rail, **and all five must appear in the assessment
client's `BUCKET_FOCUS`** or guard test (b) fails. Suggested mapping of the eight hotspots:

| Hotspot | Bucket |
|---|---|
| `court-filing-portal` | `document_sharing_court_workflow` |
| `client-whatsapp` | `document_sharing_court_workflow` |
| `matter-dms` | `staff_junior_vendor_access` |
| `external-counsel` | `staff_junior_vendor_access` |
| `public-ai-tool` | `case_evidence_sensitivity` |
| `firm-archive-backup` | `retention_incident_readiness` |
| `kyc-id-folder` | `client_matter_data` |
| `billing-narrative` | `client_matter_data` |

### ⚠️ Assessment-client work is required and test-enforced

| Check | State |
|---|---|
| `<Suspense>` on `app/assessment/law-firms/page.tsx` | ❌ **MISSING — must be added, or `next build` fails** |
| `useSearchParams` in `LawFirmAssessmentClient.tsx` | ❌ **not present — must be added** |

Copy `app/assessment/schools-colleges/page.tsx` and its client's `?bucket=` + `BUCKET_FOCUS` + teal
focus-banner pattern. This is the one place `useSearchParams` is correct — the assessment is
`noindex`. The data-flow client is the opposite case and must never use it (handoff §6).

### `boundaryLabels`

`government` is unusually load-bearing here (courts, tribunals, registries, regulators) and `public`
is the sector's signature — a filed document *is* public. Proposed:

| Boundary | Label |
|---|---|
| `candidate` | The client |
| `agency` | Your firm |
| `client` | Counterparties & their advisors |
| `vendor` | Legal-tech & service vendors |
| `government` | Courts, tribunals & regulators |
| `third-party` | Others who receive it |
| `public` | On the public record |

---

## 8. §14 — What this build deliberately does NOT do

The pasted specification proposed a bespoke Law-Firms-only engine. Per the established response (maps
#3, #4, #5, #6), its **content inventory is mined in full** and its **architecture is rejected in
writing**. Every deviation is recorded here rather than silently dropped.

| Spec asked for | Not built | Why |
|---|---|---|
| ~40 new `Legal*` components (`LegalFlowPage`, `LegalVariantSelector`, `LegalStageCard`, `MatterAccessMatrix`, …) | ❌ | Violates "presentation unified, content varies". The shared engine already renders all of it pack-driven. A parallel tree means maps #8–#12 diverge from #1–#7. |
| `LegalFlowSystem` / `LegalFlowStage` / `LegalFlowNode` / `LegalFlowEdge` parallel types | ❌ | The existing `FlowNode` / `FlowStage` / `FlowEdge` schemas carry every field that renders. A second type system forks validation, both guard tests and the 7 per-pack tests. |
| 51 data categories | ❌ — **16 authored** | Past ~16 the legend stops communicating. Fine distinctions (translation/notarisation, hearing records, expert reports, chain of custody) live as `examples`. |
| 36-value `LegalRelationshipType` taxonomy | ❌ | The 7 boundaries already answer the question that changes the fix: is it inside the firm, at a vendor, at an authority, or public. A 36-way split renders as noise. |
| `LegalFlowMetrics` with 19 counters | ❌ | `computePackSummary` plus the journey's cumulative counters derive every metric that is displayed. Unrendered counters are not metrics. |
| `LegalHold` state machine (8 statuses, owner, review/release dates, audit history) | ❌ | This is an *operational system a firm would run*, not a reference model. The map's job is to show that a closed matter is retained by default with nobody owning the decision — carried by hotspot #6 and `rs-delete-my-closed-matter`. **If Dilip wants a shared-engine addition this cycle, an optional `retentionHold` node attribute is the one candidate worth costing** — but it is a badge, not a workflow. |
| 22 graph filters (evidence only, sensitive matters only, ethical-wall systems, legal-hold systems, …) | ⚠️ partial | Risk and connection-type filters exist, plus the table view. A 22-facet filter bar on a reference model is a research tool, not a teaching one. An `authority / public-record` facet is the only one with a real sector argument; reconsider as a shared cycle if usage justifies it. |
| 10 view modes — recipient matrix, matter-access matrix, evidence-location matrix, rights-coverage view, legal-hold overlay | ❌ | Five more views of the same ~58 nodes. The lane board, the accessible table view and the node drawer answer the same questions in three ways already. |
| "10 stages per variant" | ❌ — **13 / 13 / 16** | Forcing equal counts to look tidy is explicitly against the framework. Litigation has no data room; corporate files no affidavit. |
| 19 `legal_flow_*` analytics events | ⚠️ partial | Reuse the shared `trackEvent.dataFlow` namespace. A per-sector event namespace makes cross-map comparison impossible — the exact thing the OMTM needs. |
| FAQ schema on the data-flow page | ❌ | There are no visible FAQs on this page. Emitting FAQ schema without them is precisely what the content/trust audit flagged. (The *industry* page has real FAQs and keeps its schema.) |
| Content path `src/content/data-flow/law-firms/` | ❌ | Repo convention is `lib/data/data-flow/law-firms/`. Same shape, existing path. |
| Privilege / professional-conduct / Bar Council handling attributes | ❌ | Out of DPDPA scope and outside what this map may responsibly assert (§5). Custody and control only. |
| "Return-of-documents workflow" as a stateful simulator | ❌ — **a rights scenario** | `rs-return-my-documents` says the same thing in the section Dilip rates highest, with no new component. |
| Lighthouse 90+ / a11y 95+ / responsive at 7 widths, verified | ⏳ **not measured** | Never measured on any of the six live maps. Flagged as an open item — **not claimed** (§9). |
| Move the `/data-mapping` card to "Available maps" after approval | ✅ automatic | The single registry line does it. It shows on the **preview** for review; production is unchanged until Dilip merges. |

**Also worth flagging:** the pasted spec asks for a `?model=` URL state and an accessible table
fallback as if they were new. **Both already exist** — added in the map #6 cycle and inherited by
every pack (`DataFlowClient.tsx`, `FlowSystemTable.tsx`). No work needed.

---

## 9. Known limitations — stated, not hidden

1. **Lighthouse, axe and responsive behaviour have never been measured on any map in this series.**
   The pasted spec asks for 90+/95+/95+/95+ and 320–1440 verification. Do not begin claiming them
   here. A related measured defect is already on record: white on `green-500` is **2.54:1** against a
   4.5:1 bar, and that is the primary CTA on all six live data-flow pages and would be on this one.
2. **Content not domain-reviewed.** Like every pack before it, the sector detail is authored from the
   framework, the assessment pack and the pasted spec — **not** validated by a practising advocate or
   firm. For this sector that gap matters more than usual, because the audience are the domain
   experts. Worth a review pass before it is promoted anywhere.
3. **`third-party-records` describes people the firm cannot notify.** The map shows their data
   honestly; it does not pretend there is a clean DPDPA answer for a witness whose statement sits in a
   file. `rs-opposing-party-asks` is deliberately mostly-blocked for that reason.
4. **`knowledge` is gated to `full-service` only.** Plenty of two-partner firms keep a precedent drive.
   Gating it keeps the three models genuinely distinct rather than near-identical; the precedent risk
   still appears for the other two models as node-level risk copy on the DMS.
5. **Flags-vs-counter debt elsewhere is untouched.** `training-institutes` still mismatches on 2 of 3
   models and remains in `KNOWN_HOTSPOT_DEBT`. This pack must not be built in a way that adds to it —
   §3's construction plus guard test (a) is what prevents that.

---

## 10. Build order

Once §0's two decisions are confirmed, the handoff's recipe applies unchanged:

1. **Author the pack** — `lib/data/data-flow/law-firms/` (8 files, schools-colleges shape).
   **Hotspot nodes first** (§3), then everything else around them.
2. **Register** — one line in `lib/data/data-flow/index.ts`, one in `lib/data-flow/data-flow.test.ts`.
   **Expect 61 tests** (54 today + 7 per-pack).
3. **Surface** — `<DataFlowPreview>` on `app/industries/law-firms/page.tsx`, above "How the 3-minute
   scan works".
4. **Assessment deep-links** — `<Suspense>` + `useSearchParams` + all five buckets in `BUCKET_FOCUS`
   (§7). Test-enforced.
5. **Verify** — the test run, then the unenforced-constraint script from handoff §5 across **all three
   models**, requiring `flags=8 counter=8 OK` and no `!!` lines. Then `npm run build`.
6. **Preview → sign-off → prod.** Push, hand Dilip the branch alias, **stop**. Never self-merge.

Realistic cost: ~8–12h, ~85–90% of it writing content.

---

— Framework contract: `docs/SaralPrivacy_DataFlow_Framework_Spec.md`.
This spec is map #7's content and decision record; the handoff is its build procedure.
