# SaralPrivacy — Real Estate & Property Firms Personal Data Flow Map (Map #8)

**Status:** 📋 **SPEC — not built.** Branch `feat/data-flow-real-estate` created off `main` `dda11af`.
Both gating decisions in §0 are **open and awaiting Dilip's call**; authoring does not start until they
are settled.
**Route (planned):** `/industries/real-estate/data-flow`
**Contract:** `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
**Handoff:** `handoff.md` at the project root — §0–§6, §8–§9 are current; §7 and §11 are law-firms
history.
**Precedents:** Law firms (multi-model, gated spine, default ≠ superset, derived hotspot count,
tight language locks) · Schools (first gated spine with a non-superset default) · D2C (the
generalised multi-model rule)

---

## 0. The two gating decisions — ⏳ OPEN, must be settled before authoring

| Decision | Recommendation | Status |
|---|---|---|
| The pasted spec's architecture (handoff §9) | **Content-only pack.** Mine its content inventory in full; reject its architecture in writing (§8). | ⏳ Dilip |
| Gate 0 — operating models (handoff §3) | **Four models, gated spine 11 / 14 / 15 / 18** — `brokerage` (default) · `developer` · `property-management` · `integrated` (superset). | ⏳ Dilip |

### Decision 1 — the pasted specification's architecture

A large external specification was pasted in with this build request. As with maps #3–#7 it proposes
a **bespoke Real-Estate-only engine**: ~35 new `RealEstate*` components, a parallel
`RealEstateFlowSystem` / `RealEstateFlowStage` / `RealEstateFlowNode` / `RealEstateFlowEdge` type
system, its own `RealEstateFlowMetrics` module with 19 counters, a 16-event `real_estate_flow_*`
analytics namespace, 22 graph filters and 8 view modes.

That architecture **violates the "presentation unified, content varies" law** and duplicates what the
shared engine already renders pack-driven.

> **Recommendation: content-only pack.** The spec's content inventory is excellent — its stage,
> system, control-break and hotspot detail is the richest sector input since the clinics spec, and it
> is mined in full below. Its architecture is rejected in writing in §8. Nothing it asks for that a
> reader would actually *see* is missing from the shared engine today.

The standing answer **alternates** — content-only for #3, #4, #5; content + shared-engine additions
for #6; content-only again for #7. So it is asked, never assumed. If Dilip chooses shared-engine
additions this cycle, the two candidates worth costing are recorded in §8: an optional
`onwardSharingCount` node badge (how many onward recipients a node typically fans out to — the
sector's defining number) and an `occupancy/access` graph facet.

### Decision 2 — Gate 0: how many operating models

The pasted spec proposes **three**: Brokerage, Developer/Builder sales, Rental & Property
Management. The handoff's test — do they differ in *process* or only in *systems*? — is passed
decisively: they differ in process, three ways (§2).

**But three models leaves the pack with no superset**, and the framework's gating convention requires
one ("each gated entity tags itself with its own model **+ the superset**"). No one of the three
contains the other two: a brokerage runs no construction-linked demand notices or possession
handover; a developer holds no landlord mandates and settles no deposits; a property manager
arranges no home loans and registers no sale deeds.

> **Recommendation: four models, with `integrated` as the superset.** The fourth is a real and
> common Indian business shape — the group that runs a sales arm, a builder-channel arm and a
> lettings/facility-management arm under one roof, on one group CRM. It is also the only place the
> sector's sharpest structural story can be told: **the buyer who bought a flat from the sales arm
> becomes a rental lead for the management arm and a resale lead for the brokerage arm, because the
> same group holds all three records.** That is purpose creep by corporate structure, and no other
> model in this map can show it.

**Cost of the fourth model:** one extra selector button, roughly 4–6 integrated-only nodes, and a
4-model verification matrix instead of 3. It is not a fourth journey to author — it is the union of
the other three plus the cross-arm reuse story.

**If Dilip prefers three buttons**, the fallback is `brokerage` (default) · `developer` (superset) ·
`property-management`, tagging brokerage-only entities `[brokerage, developer]`. It works, but it
makes the developer view carry seller mandates and co-broker commission splits that a builder's
sales org does not run, and it loses the cross-arm reuse story entirely. **Recommended against.**

---

## 1. The sector's shape

Recruitment is a pipeline that flows once. A CA firm is a loop that recurs yearly. A training
institute is a lifecycle with an end. D2C is a funnel that never closes. A clinic is a record that
outlives the visit. Education is a permanent record accumulated by proxy. A law firm is an
adversarial record that becomes public by design.

**Real estate is a deal that ends and a database that doesn't — circulating in a network the client
never chose.** Three things are true here that are true nowhere else in the series:

1. **The lead is the asset, not the by-product.** A broker's actual stock-in-trade is the old
   buyer/tenant database. Every other sector in this series retains data by inertia; here it is
   retained *because it has resale value*. The purpose ends at registration; the record is kept
   precisely because another deal might come out of it. That inverts the usual retention
   conversation — "we forgot to delete it" becomes "deleting it destroys the asset".
2. **Onward sharing is the workflow, not the leak.** A client's phone number, budget and household
   details are *meant* to travel — to co-brokers, channel partners, builders, landlords, societies,
   loan agents. Law firms share with an adversary; real estate broadcasts to competitors and
   partners simultaneously, in a WhatsApp group, in seconds. Neither the firm nor the client can
   enumerate who now holds it.
3. **In rentals the data describes a home, not a transaction.** Who lives there, who visits, when
   they are out, who has the keys, who cleans. Held and continuously added to by societies, gate
   systems, security vendors and maintenance contractors — parties the tenant never contracted with
   and the property manager does not control.

**Signature exposure (hotspot #1): the client's number, budget and family details posted into a
co-broker or channel-partner WhatsApp group.** Unrecallable, un-enumerable, and it is how the deal
gets done. It is this sector's equivalent of the school publishing a child's face — the moment
control ends, performed deliberately, as routine business.

---

## 2. Operating models

| id | Label | Stages | Role |
|---|---|---|---|
| `brokerage` | Brokerage & property consultancy | 11 | **DEFAULT** (drives the `/data-mapping` card stats) |
| `developer` | Developer / builder sales | 14 | — |
| `property-management` | Rental & property management | 15 | — |
| `integrated` | Full-service / integrated property group | 18 | **SUPERSET** (appears in every gated tag) |

Default ≠ superset — the schools, D2C and law-firms pattern. `brokerage` is first because it is what
most Indian brokers, consultants and small agencies searching this actually run.

`?model=` values are exactly these ids, so the pasted spec's requested `?model=brokerage`,
`?model=developer` and `?model=property-management` all work as written.

### Why this is a process split, not a scale split

- A **brokerage** matches a client to somebody else's property, circulates the requirement through a
  co-broker network, coordinates a site visit, negotiates, supports KYC and a loan referral, and
  takes a commission at registration. It never runs a construction payment schedule and never holds
  a deposit.
- A **developer sales org** runs campaigns into a call centre, books and allots a unit, then carries
  the buyer for years — demand notices linked to construction, possession and defect lists, key
  handover, and a transfer of resident data to the RWA and facility vendors. Its channel partners
  are contracted, attributed and paid; its "co-broker group" is a partner portal.
- A **property manager** takes a landlord mandate over somebody's home, screens a tenant through
  police verification and employer checks, then holds an *ongoing* relationship: rent, maintenance
  vendors entering the property, keys and access credentials, society and gate systems, an exit
  inspection and a deposit deduction.
- An **integrated group** runs all three and adds what none has alone: one group CRM across the
  arms, and a buyer record that is re-used as a rental and resale lead by a different business unit.

**The stage spine is therefore model-gated** (recruitment / clinics / schools / law-firms
precedent). Counts are free in this framework — 11 / 14 / 15 / 18 is what the sector produced. The
pasted spec's "10 stages per variant" is rejected for exactly this reason (§8).

### Stage spine — union order

Ten of the eighteen stages are **all-model**; eight are gated.

| seq | id | Name | Models |
|---|---|---|---|
| 1 | `enquiry` | Lead capture & first enquiry | all |
| 2 | `landlord-mandate` | Landlord mandate & property onboarding | `property-management`, `integrated` |
| 3 | `qualification` | Qualification, budget & household profiling | all |
| 4 | `matching` | Property matching & inventory | all |
| 5 | `broker-network` | Co-broker groups & channel-partner circulation | all |
| 6 | `site-visit` | Site visits, walk-ins & field coordination | all |
| 7 | `negotiation` | Offer, booking & terms | all |
| 8 | `kyc-documents` | KYC, income & property documents | all |
| 9 | `screening` | Tenant screening & police verification | `property-management`, `integrated` |
| 10 | `finance` | Loan, lender & payment coordination | `brokerage`, `developer`, `integrated` |
| 11 | `agreement` | Agreement, stamp duty & registration | all |
| 12 | `construction` | Construction updates, demand notices & payments | `developer`, `integrated` |
| 13 | `possession` | Possession, inspection, defects & key handover | `developer`, `integrated` |
| 14 | `tenancy` | Move-in, rent collection & maintenance access | `property-management`, `integrated` |
| 15 | `society` | Society, security & facility handover | `developer`, `property-management`, `integrated` |
| 16 | `exit` | Renewal, exit inspection & deposit settlement | `property-management`, `integrated` |
| 17 | `commission` | Commission, payouts & post-deal reuse | all |
| 18 | `archive` | Old leads, closed deals, archives & deletion | all |

- **brokerage** sees 1, 3, 4, 5, 6, 7, 8, 10, 11, 17, 18 = **11**
- **developer** sees 1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 18 = **14**
- **property-management** sees 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 15, 16, 17, 18 = **15**
- **integrated** sees all = **18**

Two deliberate choices:

- **`broker-network` is all-model.** A developer's channel-partner portal and a property manager's
  tenant-sourcing broker network are the same act as a brokerage's co-broker group — the client's
  requirement leaving the firm to a network of independent parties. Keeping it all-model is also what
  lets the signature hotspot sit on an all-model stage (§3).
- **`agreement` is all-model.** Sale deed, agreement for sale, allotment letter and rent agreement
  all funnel identity and financial documents through drafting vendors, e-stamping, e-signature and
  the sub-registrar. *Which* instrument differs; the exposure does not.

**Gating convention:** the shared core carries **no** `businessModels` tag; each gated entity tags
itself with **its own model(s) + `integrated`** (the superset).

---

## 3. The hotspot count is DERIVED, not chosen

Guard test (a) — `hotspots reconcile with the counter in every model of every pack` — makes the
recurring flags-vs-counter defect unshippable. The construction it requires: **every hotspot node
ungated, and its earliest stage a distinct all-model stage.**

Ten stages are all-model. Eight of them carry a hotspot:

| Stage (seq) | Hotspot node | Rank | The failure in one line | Bucket |
|---|---|---|---|---|
| `broker-network` (5) | `co-broker-group` | **1** | The client's number, budget and family details go to a network nobody can list or recall | `broker_network_sharing` |
| `kyc-documents` (8) | `kyc-document-folder` | 2 | PAN, Aadhaar, bank statements and title papers arrive over WhatsApp and land in personal folders | `kyc_property_document` |
| `archive` (18) | `old-lead-database` | 3 | Nothing expires, because the old-lead database *is* the firm's asset | `retention_incident_readiness` |
| `qualification` (3) | `sales-crm` | 4 | Income guesses, household notes and subjective comments, visible to everyone and exportable by anyone | `crm_staff_vendor_access` |
| `enquiry` (1) | `shared-lead-sheet` | 5 | The lead is on a spreadsheet and a personal phone before anyone has been told anything | `client_lead_data` |
| `site-visit` (6) | `field-exec-phone` | 6 | The client's number and live location handed to site security, builders and landlords; photos and routes kept | `client_lead_data` |
| `agreement` (11) | `documentation-vendor` | 7 | The full KYC set to every intermediary — drafter, notary, registration agent, witness | `kyc_property_document` |
| `commission` (17) | `marketing-reuse-platform` | 8 | Closed *and* failed clients pushed into ad audiences and referral lists, with no withdrawal that propagates | `client_lead_data` |

⇒ **flags = 8 = counter in all four models, by arithmetic.**

All five assessment buckets are reachable from the hotspot rail ✅ — required by guard test (b).

`matching` (4) and `negotiation` (7) are all-model but carry no hotspot — that is fine and expected
(schools ran 8 hotspots across 11 all-model stages). A hotspot node **may span later stages** — the
CRM genuinely does — but must never acquire an *earlier* one, which would move its flag in some
models and break reconciliation.

### Deliberately NOT hotspots, because they sit on model-gated stages

Each is authored as a **critical- or high-risk node** with its own `riskWhy` / `riskAction`, and
renders in full wherever it exists — it simply carries no red flag, because a gated flag would make
the counter lie in the models that hide it.

- the **lender file** — bank statements and salary slips at four loan agents, rejected applications
  never returned (`finance`)
- the **police-verification and screening vendor** — tenant, household *and* domestic-staff identity
  pushed into a police workflow and a private screening vendor (`screening`)
- the **society app, gate register and CCTV** — continuous occupancy, visitor and vehicle recording,
  entirely outside the firm's control (`society`)
- the **maintenance vendor with home-access instructions** — a contractor gets a name, an address, a
  phone number and how to get in (`tenancy`)
- the **possession photo and defect repository**, and the resident dataset handed to facility
  vendors at handover (`possession`)
- the **demand-notice and reminder trail** that exposes a buyer's outstanding balance to the sales
  team (`construction`)
- the **exit inspection photos and deposit-deduction record** that become a lasting tenant-risk label
  (`exit`)
- the **landlord bank and ownership document set** copied into management, finance and operations
  (`landlord-mandate`)

---

## 4. Content model

### Target reference model — design targets only

Every published metric is computed by `computePackSummary` / `filterByBusinessModel`; none is
hand-typed into copy. These are sizing targets, to be replaced with measured values after the build.

| | brokerage | developer | property-management | integrated |
|---|---|---|---|---|
| Stages | 11 | 14 | 15 | 18 |
| Distinct places (systems) | ~34 | ~44 | ~46 | ~58 |
| External parties | ~16 | ~20 | ~21 | ~26 |
| Hotspots (flags = counter) | 8 = 8 | 8 = 8 | 8 = 8 | 8 = 8 |

Pack sizing target: **18 stages · ~72 nodes · ~185 edges · 16 data categories · ~15 personas ·
8 hotspots · 8 rights scenarios · 8 incident scenarios.** This lands between law firms (16/69/179)
and schools (15/60/115) — the four-model union is what pushes it, not per-model bloat.

### Data categories — 16

Sixteen, not the pasted spec's 43. Past ~16 the legend stops communicating and every node renders a
wall of tags; the fine distinctions live in each category's `examples`.

| id | Covers | kind |
|---|---|---|
| `client-identity` | Name, mobile, email, address, authorised representative, NRI/overseas contact | provided |
| `client-kyc` | PAN, Aadhaar, passport/OCI/visa, address proof | provided |
| `household-occupancy` | Family size, occupants, children, pets, domestic staff, lifestyle notes | provided |
| `employment-income` | Employer, occupation, salary slips, income and business proof | provided |
| `financial-records` | Bank statements, loan applications, sanction/rejection, payment history, deposits | provided |
| `requirement-budget` | Budget band, buy/rent preference, locality, unit preference, timeline | provided |
| `property-ownership-docs` | Title deeds, prior sale deed, tax receipts, society NOC, ownership records | provided |
| `transaction-documents` | Agreement to sell, sale deed, allotment, booking form, rent agreement, stamp & registration record | created |
| `site-visit-location` | Visit history, route, attendance, gate entry, visit photos, live-location shares | provided |
| `occupancy-access` | Keys, access credentials, entry/exit logs, vehicle, visitor and delivery records, CCTV | provided |
| `maintenance-complaint` | Work orders, contractor visits, repair photos, complaints, inspection and damage records | provided |
| `communication-records` | WhatsApp threads, call recordings, email, SMS, reminder history, sales notes | provided |
| `third-party-records` | Co-applicant, nominee, guarantor, references, prior landlord, witnesses, domestic staff, other occupants | provided |
| `client-scoring` | Lead score, affordability and seriousness ratings, tenant suitability, payment-behaviour label, fraud flag | derived |
| `marketing-profile` | Campaign attribution, ad audiences, retargeting and referral lists, suppression state | derived |
| `staff-access-record` | CRM logins, exports, device sync, portal credentials, access logs | created |

`third-party-records` and `occupancy-access` do the sector's distinctive work: the first shows how
much of the file belongs to people who never engaged the firm (a co-applicant, a guarantor, a
tenant's cleaner); the second is the rental half's signature — data that describes a home rather
than a transaction. `client-scoring` and `marketing-profile` are marked `derived`: the quiet half a
property firm never counts as personal data at all.

### Named software — the "that's my firm" test

Generic "CRM" fails it. Name what the sector actually runs: **portal dashboards** (99acres,
MagicBricks, Housing.com, NoBroker), **Meta and Google lead-ad forms**, the **sales CRM**
(Sell.Do, LeadSquared, Zoho), the **Google Sheet lead tracker**, the salesperson's **personal
WhatsApp** and the **co-broker WhatsApp group**, the **channel-partner portal**, the **dialler and
call recording**, the **site-office visitor register and CCTV**, the **sample-flat appointment
book**, the **inventory and booking system**, the **home-loan desk and DSA/loan-agent files**,
**e-stamping, e-signature and the sub-registrar appointment portal**, the **society app**
(MyGate/NoBrokerHood/ADDA), the **gate register and domestic-staff register**, the **key register
and facility-management system**, the **maintenance work-order app**, the **rent-collection platform
and landlord statement**, the **police tenant-verification portal**, and the **physical file
cupboard** in the office.

---

## 5. Language locks

- **"High-impact identity, financial and property data"**, never "sensitive personal data" — the
  DPDPA creates no such statutory category. The pasted spec makes this point itself; hold it.
- **No property, title, tax, registration, lending or investment advice.** This map describes custody
  and control of personal data. It does not opine on RERA, stamp duty, title validity, tenancy law
  or what a firm must retain under any of them.
- **Authority-controlled records must be marked as such.** A registered sale deed at the
  sub-registrar and a completed police verification are not the firm's to delete, and the map must
  say so plainly rather than implying a clean erasure path.
- **Retention is not uniformly deletable.** Commission and tax records, a registered instrument and
  an executed agreement have genuine grounds to be kept. Separate **what must be kept** from **what
  merely has been kept** — the old-lead database is the second, and that is the whole point of
  hotspot #3.
- **No accusation, no fearmongering.** Broker networks and channel partners are how this industry
  works; the map's job is to show where control breaks, not to tell a broker their trade is a
  violation. Watch the high/critical ratio — if most of the map is red, none of it is.
- **Distinguish the occupant from the signatory.** A co-applicant, a nominee, a guarantor, a
  tenant's family member and a domestic worker are separate people with separate rights. Never
  collapse them into "the client".

---

## 6. The two walkthrough sections

Mandatory build step (handoff §4 Step E). Copy `lib/data/data-flow/ca-firms/scenarios.ts` for the
language-lock header shape. Every referenced node must be visible in every model where the scenario
shows.

### Rights scenarios — 8

| id | The request, in their words | Type | Models |
|---|---|---|---|
| `rs-who-has-my-number` | "Four brokers I never contacted called me. Where did they get my number?" | access | all |
| `rs-delete-my-old-enquiry` | "I enquired two years ago and never bought. Delete everything." | erasure | all |
| `rs-stop-calling-me` | "Stop calling me about new projects. The deal closed." | withdraw-marketing | all |
| `rs-delete-my-kyc-after-registration` | "It's registered. Delete my PAN, Aadhaar and bank statements." | erasure | all |
| `rs-correct-my-details` | "My address and my co-applicant's name are wrong on the record." | correction | all |
| `rs-my-file-went-to-five-lenders` | "My salary slips went to lenders I never chose. Get them back." | access | `brokerage`, `developer`, `integrated` |
| `rs-i-moved-out-a-year-ago` | "Why does the society app still list my visitors and my cleaner?" | erasure | `property-management`, `integrated` |
| `rs-im-not-your-client` | "I'm the co-applicant / the guarantor. I never signed anything with you." | access | all |

**`blockedNodeIds` is the honest half**, and it carries unusual weight here. Three things a real
firm genuinely cannot reach, and the walkthroughs must say so:

- the **registered instrument at the sub-registrar** — an authority-controlled public record
- **co-brokers' and channel partners' own phones and CRMs** — the network that makes
  `rs-who-has-my-number` mostly a *partial* answer, which is exactly the lesson
- the **society, RWA and gate system** after handover — the property manager is not the controller
  there, and `rs-i-moved-out-a-year-ago` must not pretend otherwise

### Incident scenarios — 8

| id | Title | Severity | Models |
|---|---|---|---|
| `inc-id-to-wrong-whatsapp` | A PAN and Aadhaar copy went to the wrong WhatsApp contact | critical | all |
| `inc-lead-sheet-open-link` | The shared lead sheet is open to anyone with the link | critical | all |
| `inc-ex-staff-crm-export` | A departed salesperson kept a CRM export | high | all |
| `inc-bank-statement-to-lenders` | A client's bank statement was forwarded to loan agents they never chose | high | `brokerage`, `developer`, `integrated` |
| `inc-wrong-agreement-draft` | The wrong client's draft agreement was sent out | high | all |
| `inc-site-register-photographed` | A site-visit register page was photographed and circulated | medium | all |
| `inc-tenant-kyc-in-society-group` | A tenant's KYC was posted into a society WhatsApp group | critical | `property-management`, `integrated` |
| `inc-lost-field-phone` | A field executive's phone holding client documents was lost | high | all |

Labelled an **operational response reference**, explicitly not breach-notification advice — the
shared `IncidentSimulator` already carries that framing.

---

## 7. Verified inputs (checked against source, 2026-08-02)

| Field | Value | Verified against |
|---|---|---|
| Sector slug | `real-estate` | `lib/data/sectors.ts:43` |
| `navLabel` | Real Estate & Property Firms | `sectors.ts` |
| `assessmentLabel` | Real Estate & Property | `sectors.ts` |
| `reportType` | `realty` (6 chars — under the Appwrite `string(10)` cap) | `sectors.ts` |
| `assessmentRoute` | `/assessment/real-estate` | route exists, 200 on prod |
| Assessment client | `app/assessment/real-estate/RealEstateAssessmentClient.tsx` | exists |
| Industry page | `app/industries/real-estate/page.tsx` — **exists**, 254 lines, 5 FAQs | 200 on prod |
| `discoveryNicheId` | **`re-brokers`** ("Real estate brokers & agents") | `lib/discovery/data.generated.ts` |
| `lexicon` | `subject: "client"` · `subjectArtefact: "One client's property file"` · `org: "firm"` | reads correctly in "outside your firm" for all four models |

Other real discovery slugs, deliberately not chosen: `re-developers`, `property-management`,
`commercial-re`, `rental-platforms`, `housing-societies`, `coliving-pg`. `re-brokers` matches the
default model; the map is not niche-switched per model.

**`assessmentBuckets`** — verified against `lib/data/industry-assessment/packs/real-estate.ts`:

```
client_lead_data
kyc_property_document
broker_network_sharing
crm_staff_vendor_access
retention_incident_readiness
```

All five are reachable from the hotspot rail (§3) and all five must appear in the assessment
client's `BUCKET_FOCUS`, or guard test (b) fails.

### ⚠️ Assessment-client work is required and test-enforced

| Check | State |
|---|---|
| `<Suspense>` on `app/assessment/real-estate/page.tsx` | ❌ **MISSING — must be added, or `next build` fails** |
| `useSearchParams` in `RealEstateAssessmentClient.tsx` | ❌ **not present — must be added** |

Copy `app/assessment/schools-colleges/page.tsx` and its client's `?bucket=` + `BUCKET_FOCUS` + teal
focus-banner pattern. This is the one place `useSearchParams` is correct — the assessment is
`noindex`. The data-flow client is the opposite case and must never use it (handoff §6).

### `boundaryLabels`

| Boundary | Label |
|---|---|
| `candidate` | The client |
| `agency` | Your firm |
| `client` | Builders, landlords & owners |
| `vendor` | Portals, CRM & service vendors |
| `government` | Registration, police & authorities |
| `third-party` | Brokers, lenders & others who receive it |
| `public` | Open links & public records |

`third-party` is unusually load-bearing here — the broker network is the sector's signature and it is
neither a vendor (nothing is processed on the firm's instructions) nor a client.

### Presentation copy — proposed

| Field | Value |
|---|---|
| H1 | One client. One property decision. Many systems and people. |
| `metaTitle` | Real Estate Client & Property Data Flow Map \| SaralPrivacy |
| `metaDescription` | See how buyer, tenant, seller and landlord data moves through property portals, brokers, site visits, KYC, loans, agreements, registration and archives. |
| `ogTitle` | Where does one real-estate client's data go? |
| Central question | If this client asks you to find, correct or delete their data, can you list every copy your staff, brokers, builders, lenders and vendors hold? |

The pasted spec's headline, supporting copy and central question are adopted as written — they are
good, and they match the series' voice.

---

## 8. §14 — What this build deliberately does NOT do

The pasted specification proposed a bespoke Real-Estate-only engine. Per the established response
(maps #3–#7), its **content inventory is mined in full** and its **architecture is rejected in
writing**. Every deviation is recorded here rather than silently dropped.

| Spec asked for | Not built | Why |
|---|---|---|
| ~35 new `RealEstate*` components (`RealEstateFlowPage`, `RealEstateVariantSelector`, `RealEstateStageCard`, `DocumentLocationMatrix`, …) | ❌ | Violates "presentation unified, content varies". The shared engine already renders all of it pack-driven. A parallel tree means maps #9–#12 diverge from #1–#8. |
| `RealEstateFlowSystem` / `RealEstateFlowStage` / `RealEstateFlowNode` / `RealEstateFlowEdge` parallel types | ❌ | The existing `FlowNode` / `FlowStage` / `FlowEdge` schemas carry every field that renders. A second type system forks validation, both guard tests and the 7 per-pack tests. |
| 43 data categories | ❌ — **16 authored** | Past ~16 the legend stops communicating. Fine distinctions (stamp duty, commission, CCTV, children's data, fraud labels) live as `examples` on the 16. |
| 35-value `RealEstateRelationshipType` taxonomy | ❌ | The 7 boundaries already answer the question that changes the fix: is it inside the firm, at a vendor, at an authority, at another party, or public. A 35-way split renders as noise. |
| `RealEstateFlowMetrics` with 19 counters (`brokerSharingLocationCount`, `locationDataSystemCount`, …) | ❌ | `computePackSummary` plus the journey's cumulative counters derive every metric that is *displayed*. Unrendered counters are not metrics. |
| 22 graph filters (lead data only, KYC only, financial only, property docs only, site-visit/location, broker sharing, society sharing, …) | ⚠️ partial | Risk and connection-type filters exist, plus the accessible table view. A 22-facet filter bar on a reference model is a research tool, not a teaching one. **An `occupancy/access` facet is the one with a real sector argument** — costed in §0 as a shared-engine candidate, not built by default. |
| 8 view modes — recipient matrix, document-location matrix, data-category matrix, rights-coverage view, external-transfer table | ❌ | More views of the same ~58 nodes. The lane board, the accessible table view and the node drawer answer the same questions three ways already. |
| "10 stages per variant" | ❌ — **11 / 14 / 15 / 18** | Forcing equal counts to look tidy is explicitly against the framework. A brokerage runs no possession handover; a property manager registers no sale deed. |
| Three variants only | ⚠️ **four** — `integrated` added as superset | The gating convention requires a superset and none of the three contains the other two (§0 Decision 2). |
| 16 `real_estate_flow_*` analytics events | ⚠️ partial | Reuse the shared `trackEvent.dataFlow` namespace. A per-sector event namespace makes cross-map comparison impossible — the exact thing the OMTM needs. |
| FAQ schema on the data-flow page | ❌ | There are no visible FAQs on this page. Emitting FAQ schema without them is precisely what the content/trust audit flagged. (The *industry* page has 5 real FAQs and keeps its schema.) |
| Content path `src/content/data-flow/real-estate/` | ❌ | Repo convention is `lib/data/data-flow/real-estate/`. Same shape, existing path. |
| Client-rights simulator + marketing-withdrawal + KYC-correction as three bespoke components | ❌ — **rights scenarios** | The shared `RightsSimulator` says all three in the section Dilip rates highest, with no new component. Withdrawal and KYC correction are two of the eight scenarios (§6). |
| Incident simulator as a bespoke component | ❌ — **incident scenarios** | Shared `IncidentSimulator`, 8 scenarios (§6). |
| "High-impact real-estate scenario panels" (NRI, joint buyers, children, police verification, …) | ⚠️ folded in | Delivered as node risk copy, data-category `examples` and scenarios rather than a tenth page section. |
| Lighthouse 90+ / a11y 95+ / responsive at 7 widths, verified | ⏳ **not measured** | Never measured on any of the seven live maps. Flagged as an open item — **not claimed** (§9). |
| Inspect the supplied Vercel preview URL | ⚠️ **substituted** | The URL given (`webapp-git-feat-data-flow-recruitm-…`) is a stale recruitment-branch preview and is SSO-gated in any case. The **live production** `/industries/real-estate` page and the repository were inspected directly instead. |
| Move the `/data-mapping` card to "Available maps" after approval | ✅ automatic | The single registry line does it. It shows on the **preview** for review; production is unchanged until Dilip merges. |

**Also worth flagging:** the pasted spec asks for `?model=` URL state and an accessible table
fallback as if they were new. **Both already exist** — added in the map #6 cycle and inherited by
every pack (`DataFlowClient.tsx`, `FlowSystemTable.tsx`). No work needed.

---

## 9. Known limitations — stated, not hidden

1. **Lighthouse, axe and responsive behaviour have never been measured on any map in this series.**
   The pasted spec asks for 90+/95+/95+/95+ and 320–1440 verification. Do not begin claiming them
   here. A related measured defect is already on record: white on `green-500` is **2.54:1** against
   a 4.5:1 bar, and that is the primary CTA on all seven live data-flow pages and would be on this
   one.
2. **Content not domain-reviewed.** Like every pack before it, the sector detail is authored from the
   framework, the assessment pack, the industry page and the pasted spec — **not** validated by a
   practising broker, developer sales head or property manager.
3. **Four models is a first for the series.** Every live map has one, two or three. The selector has
   never rendered four buttons; check it on the preview at mobile width specifically.
4. **`society` is gated to `developer` + `property-management`.** A resale brokerage does deal with
   societies for NOCs and transfer formalities. That is carried as node-level risk copy on the
   documentation vendor rather than as a stage, to keep the four models genuinely distinct.
5. **The map does not model co-living / PG operators or housing societies as controllers**, though
   both are real discovery niches with their own exposure. They are adjacent sectors, not variants of
   this one.
6. **Flags-vs-counter debt elsewhere is untouched.** `training-institutes` still mismatches on 2 of 3
   models and remains in `KNOWN_HOTSPOT_DEBT`. This pack must not add to it — §3's construction plus
   guard test (a) is what prevents that.

---

## 10. Build order

Once §0 is settled, the handoff's recipe applies unchanged:

1. **Author the pack** — `lib/data/data-flow/real-estate/` (8 files, schools-colleges shape).
   **Hotspot nodes first** (§3), then everything else around them.
2. **Register** — one line in `lib/data/data-flow/index.ts`, one in `lib/data-flow/data-flow.test.ts`.
   **Expect 68 tests** (61 today + 7 per-pack).
3. **Surface** — `<DataFlowPreview>` on `app/industries/real-estate/page.tsx`, above "How the
   3-minute scan works" (line ~173).
4. **Assessment deep-links** — `<Suspense>` + `useSearchParams` + all five buckets in `BUCKET_FOCUS`
   (§7). Test-enforced.
5. **Verify** — the test run, then the unenforced-constraint script from handoff §5 across **all four
   models**, requiring `flags=8 counter=8 OK` and no `!!` lines. Then `npm run build`.
6. **Preview → sign-off → prod.** Push, hand Dilip the branch alias, **stop**. Never self-merge.

Realistic cost: ~10–14h, ~85–90% of it writing content — a little above the series norm because of
the four-model union.

---

— Framework contract: `docs/SaralPrivacy_DataFlow_Framework_Spec.md`.
This spec is map #8's content and decision record; the handoff is its build procedure.
