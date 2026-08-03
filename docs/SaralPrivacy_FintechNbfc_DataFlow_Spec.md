# SaralPrivacy — FinTech, NBFC & Digital Payments Personal Data Flow Map

**Map #11 in the series.** Route: `/industries/fintech-nbfc/data-flow`.
Framework contract: `docs/SaralPrivacy_DataFlow_Framework_Spec.md`.
Branch: `feat/data-flow-fintech-nbfc`.

---

## 1. Architecture decision — content-only, decided FROM the spec

The pasted spec answered its own architecture question, so it was recorded and acted on rather
than put to Dilip. Three of its own numbered sections say it:

- **§2** — "Reuse the shared data-flow engine. Extend shared models only where financial-sector
  functionality requires it. **Do not build a separate FinTech-only UI framework.**"
- **§27** — "Use one shared component engine. **Do not create separate UI trees for each variant.**"
- **§40** — "**Do not create an isolated hard-coded page.** Create one reusable data-flow interface
  with three complete journeys."

This is now the rule rather than the exception — maps #8, #9, #10 and #11 all had specs that
answered it themselves.

**Result: a content-only pack.** No route, component or schema file is touched by the map itself.
The only non-pack edits are the two one-line registrations, the industry-page preview insert, and
the assessment deep-link wiring (§6) — the same four touch points every map since #3 has used.

---

## 2. Three operating models — genuinely different journeys

Named by the pasted spec's §6 and adopted unchanged, because they are honestly different data
journeys rather than labels over one journey.

| id | Label | The journey |
|---|---|---|
| `digital-lending` *(default)* | Digital lending / LSP | App or DSA lead → device permissions → KYC → bank & Account Aggregator data → bureau → scoring → **fan-out to several lenders** → e-sign & mandate → disbursal → EMI → collections. |
| `payments` | Payments, wallet or UPI fintech | App install → device binding → KYC tier → **bank / card / UPI linking** → transaction → real-time fraud screening → processing & settlement → disputes & chargebacks → merchant analytics → restriction. |
| `nbfc` | Multi-product NBFC / branch lender | Branch, DSA, dealer or digital lead → customer **and related-party** KYC → **field verification & collateral** → underwriting committee → sanction, security & disbursal → branch servicing → field collections → **legal recovery & repossession**. |

`digital-lending` is `businessModels[0]`, so it is the default and drives the `/data-mapping`
card stats ("3 operating models · Shown for Digital lending / LSP").

### ⚠️ There is NO superset, and one was not manufactured

Map #8 established that a superset is a handoff convention, not a schema rule. None honestly
exists here:

- `nbfc` is **not** a superset of `digital-lending` — an NBFC lending on its own book does not
  fan one application out to several competing lenders, and does not harvest a contact list or
  SMS inbox off the applicant's phone as a substitute for credit history.
- `nbfc` is **not** a superset of `payments` — no UPI rail, no card tokenisation, no merchant
  acquiring, no settlement or chargeback workflow.
- `payments` is a superset of nothing — no bureau pull, no underwriting, no collateral.

Each variant-specific entity therefore tags itself with exactly the models it honestly appears in.
`validatePack`'s only model rule — an edge's models must be a subset of both endpoints' — is
satisfied.

---

## 3. The sector's shape

Every map names its sector's signature before writing stages.

> **A FINTECH OR NBFC IS THE ONLY BUSINESS IN THIS SERIES WHOSE PRODUCT IS A JUDGEMENT ABOUT
> THE PERSON.**
>
> Everywhere else the business holds records *about* someone and the risk is that a record
> escapes. Here the records are fed into a model that decides — approve, refuse, price, limit,
> block, freeze — and **the decision itself becomes a new, permanent, shareable fact about that
> person**, one they usually cannot see, cannot check the inputs of, and cannot appeal. A
> pharmacy's parcel discloses a condition that already existed. A lender's rejection *creates* one.

The second half of the signature, and the reason `related-party` and `contact-sms-location` are
first-class categories:

> **The people who never applied are in the file too.** The contact list read off the phone at
> onboarding, the co-applicant, the guarantor, the nominee, the "alternate contact", the payee on
> a UPI transfer, the neighbour a field officer asked about. None of them applied for anything,
> none of them was given a notice — and every one of them can be telephoned when the account
> goes bad.

That is why the rank-1 hotspot sits on the decision engine rather than on a storage system.

---

## 4. Stage spine — model-gated, counts DERIVED

**16 stages in the union, gated to 13 / 12 / 15.**

The pasted spec's §9.1, §10.1 and §11.1 each ask for "Stages: 10". **Per-model stage counts are
derived** from one shared union array filtered by model and cannot be set independently — proven
on maps #8 (asked 10/10/10, got 10/13/14), #9 (got 11/14/16) and #10 (got 11/13/15). The honest
derived answer here is **13 / 12 / 15**. Every stage in the spec's three ten-stage lists is
represented; several of its stages merge, and several split, because the union has to serve all
three models at once.

| # | Stage | Models |
|---|---|---|
| 1 | Lead generation, DSA & partner referral | **all** |
| 2 | Registration, device binding & app permissions | **all** |
| 3 | KYC, identity verification & video KYC | **all** |
| 4 | Co-applicant, guarantor, nominee & references | lending · nbfc |
| 5 | Bank, card, wallet & UPI linking | payments |
| 6 | Bank statements, Account Aggregator, income & bureau | lending · nbfc |
| 7 | Field verification, collateral & valuation | nbfc |
| 8 | Fraud screening, scoring & the automated decision | **all** |
| 9 | Lender allocation, partner banks & networks | **all** |
| 10 | Agreement, e-sign, mandate & activation | **all** |
| 11 | Disbursal, payment processing & settlement | **all** |
| 12 | Servicing, statements, support & disputes | **all** |
| 13 | Adverse action, restriction & recovery | **all** |
| 14 | Legal recovery, repossession & proceedings | nbfc |
| 15 | Cross-sell, offers, audiences & analytics | **all** |
| 16 | Closure, rejected applications, archive & deletion | **all** |

**Eleven of the sixteen are all-model.** That is load-bearing: all eight hotspots sit on eight
*distinct* all-model stages, so the journey's red flags reconcile with the hotspot counter by
arithmetic in every model (guard test (a)). Do not gate an all-model stage without re-deriving §5.

⚠️ **Stage sequence order is load-bearing, not just gating** (learned on map #10). A node resolves
to the *earliest* of its stages visible in the selected model, so the sequence has to follow the
real order of events or a stage renders with no system in one model. This is invisible to
`validatePack` and to both guard tests — only the framework's §5 script catches it.

### Two merges worth recording

- The pasted spec's payments §10.9 (*Account Restrictions, Recovery and Lawful Requests*) and its
  lending §9.10 / NBFC §11.7 (*Delinquency, Collections and Recovery*) are **one all-model stage**
  here — `adverse-recovery`. All three models genuinely have an adverse path; the systems on it
  differ completely, which is what model-gating is for. Keeping them separate would have cost an
  all-model stage and left only seven for eight hotspots.
- The spec's separate "Income / Bank" and "Bureau / Underwriting" stages merge into
  `bank-bureau-data`, because in both lending models the AA pull, the statement analysis and the
  bureau hit happen as one data-gathering act before any human sees the file.

---

## 5. Hotspots — eight, derived, one per distinct all-model stage

The counter and the legend print `pack.hotspots.length`; the journey paints one red flag per
distinct stage a hotspot's node resolves to. The construction that makes those agree by
arithmetic: **every hotspot node is UNGATED, and each one's EARLIEST stage is a distinct
ALL-MODEL stage.**

| Rank | Node | Earliest stage | Bucket |
|---|---|---|---|
| 1 | `decision-engine` | `risk-decision` (8) | `profiling_underwriting` |
| 2 | `device-permission-layer` | `registration-device` (2) | `kyc_financial_data` |
| 3 | `collections-agency` | `adverse-recovery` (13) | `vendor_partner_agent_sharing` |
| 4 | `partner-bank-lender` | `partner-disclosure` (9) | `vendor_partner_agent_sharing` |
| 5 | `agent-personal-phone` | `lead-acquisition` (1) | `vendor_partner_agent_sharing` |
| 6 | `support-console` | `servicing-support` (12) | `access_retention_incident` |
| 7 | `cross-sell-audience` | `marketing-crosssell` (15) | `consent_notice_rights` |
| 8 | `rejected-application-archive` | `archive-deletion` (16) | `access_retention_incident` |

The spec's §9.12 / §10.12 / §11.12 ask for **per-variant hotspot sets of 11 / 11 / 12**. Not
possible: the hotspot counter is pack-level and unfiltered, and the schema caps the band at 5–8.
Every one of those 34 items is authored — as a hotspot where it is one of the sector's worst
eight, and otherwise as a high- or critical-risk node with its own `riskWhy` and `riskAction`,
which the engine renders in full.

---

## 6. Wiring — the four touch points outside the pack

1. `lib/data/data-flow/index.ts` — one line in `PACKS`.
2. `lib/data-flow/data-flow.test.ts` — one line in its `PACKS` (+ import).
3. `app/industries/fintech-nbfc/page.tsx` — `<DataFlowPreview>` insert.
4. `app/assessment/fintech-nbfc/` — **`<Suspense>`, `useSearchParams` and `BUCKET_FOCUS` were all
   three missing** (verified against source, not assumed). Added, covering all five buckets.
   Without them `next build` fails and guard test (b) fails.

`/data-mapping` needs **no edit**: registering the pack moves the card out of "Coming next" into
"Available maps" automatically. On production that only happens when the branch is merged, which
is exactly the requested behaviour — the card stays under "Coming next" on `saralprivacy.com`
until the preview is approved.

---

## 7. What this build deliberately does NOT do

Per the framework's §9 rule: the pasted spec's architecture is rejected in writing, with a reason
per item. Everything in its *content* was mined in full.

| Spec asks for | Not built — why |
|---|---|
| §8, §14–§19, §23 bespoke `Financial*` TypeScript models (`FinancialDataCategory`, `FinancialFlowSystem`, `FinancialFlowStage`, `FinancialVariantJourney`, `FinancialControlBreak`, `FinancialRiskHotspot`, `FinancialFlowNode`, `FinancialFlowEdge`, `AutomatedDecisionRecord`) | The shared `lib/data-flow/schemas.ts` already expresses all of it. A parallel type tree forks the engine and breaks "presentation unified, content varies". |
| §16's `src/content/data-flow/fintech-nbfc/` folder layout | Repository convention is `lib/data/data-flow/<industry>/`, which its own line "adapt paths to repository conventions" permits. |
| §27's 50 `Financial*` / `Flow*` components | Every one maps to an existing shared component. Its own §27 says "use one shared component engine" — this follows the spec. |
| §12's twelve "high-impact financial scenario" contextual risk panels | Delivered as rights + incident scenarios and as node-level `riskWhy` / `riskAction`, which the engine already renders. A thirteenth panel type would be a fintech-only UI tree. |
| §20–§21 twenty-two bespoke metric fields + `calculateFinancialCumulativeMetrics` | `computePackSummary` + the journey's cumulative counter already derive stages, systems, external parties, personas, copies and external transfers from the dataset. The rest are slices of the same node flags — new UI, not new data. |
| §7.10 + §23 a standalone automated-decision **review simulator** and decision-record store | The map is a reference model, not a case-management system. The automated decision is modelled as data (`automated-decision` category, `decision-engine` / `decision-log` nodes, rank-1 hotspot) and as a **rights scenario** — "review the decision that refused me" — which is the shared engine's existing walkthrough surface. |
| §26's 30 graph filters + 11 view types (recipient matrix, KYC-location matrix, scoring-input matrix, decision matrix, agent-access matrix, rights-coverage view) | Genuinely unbuilt in the shared engine. Board/Table toggle, risk filter and stage grouping exist. Recorded as a **shared-engine backlog item** for all eleven maps — never a per-sector build. **Six specs have now asked for these.** |
| §35's nineteen `financial_flow_*` analytics events | The shared route already instruments model / stage / system / hotspot / CTA events with the sector as a property. Nineteen sector-prefixed names would fragment the funnel across eleven maps. |
| §7.3 "avoid full-page reload", §34 preview `noindex` | Already generic. `?model=` is read from `window.location` and written with `history.replaceState` — **never `useSearchParams`**, which would strip the whole journey out of the indexed HTML. Preview `noindex` is platform-level. |
| §9.1 / §10.1 / §11.1 target metrics ("~36 locations, ~18 parties, 39 transfers", 11/11/12 control breaks) | Metrics are dataset-derived and never hand-typed. Actuals in §9. |
| §9.1 / §10.1 / §11.1 "Stages: 10" per variant | Derived, not settable — see §4. Honest answer 13 / 12 / 15. |
| §36's 44-point validation list | `validatePack` + the pack tests cover every referential item. The rest are content judgements, not machine checks. |
| §38 Lighthouse 90+ / 95+ / 95+ / 95+, axe, 320–1440 responsive matrix | **Never measured on any of the eleven maps.** Not claimed here either — see §9. |

---

## 8. Language locks

- **"High-impact identity, financial and behavioural data"** — never "sensitive personal data".
  The DPDPA creates no such statutory category. (The spec's own §8 says the same.)
- **No financial, lending, investment, credit or regulatory advice.** Not one word on what a
  business must retain under RBI or any other regulator, or for how long. Where a record exists
  because other law requires it, the map says only that it is a **required record** and therefore
  not freely deletable.
- **No legal advice.**
- **Fraud suspicion is not confirmed fraud.** Wherever a flag, block or freeze appears, the copy
  keeps the two apart — the spec's §23 asks for this and it is the single most consequential
  wording choice in the pack.
- **Retention is not uniformly deletable.** Separate what must be **KEPT** (a ledger entry, a
  required record, a live loan account) from what has merely never been **DELETED** (a bank
  statement pulled for an application that was refused two years ago).
- **No accusation.** DSAs, WhatsApp follow-up, field agents and collection agencies are how this
  trade works. The map shows where control breaks; it does not call the trade a violation.

---

## 9. Known limitations — stated, not hidden

- **Not domain-reviewed.** No practising lender, payments operator, risk officer or collections
  head has read this pack. That review is worth more than another engineering pass.
- **Lighthouse, axe and the 320–1440 responsive matrix are unmeasured** — on this map and on all
  ten before it. The spec asks for 90+/95+/95+/95+; nothing here claims it. A known related
  issue: white on `green-500` measures **2.54:1** against a 4.5:1 bar, and that is the primary
  CTA on every data-flow page.
- **The graph-filter matrices remain unbuilt** (§7). Sixth spec to ask.
- **Metrics below are dataset-derived** and are a reference model, never a claim about any real
  business.

### Actual derived metrics

Pack totals: **16 stages · 80 nodes · 197 edges · 16 categories · 20 personas · 8 hotspots ·
10 rights scenarios · 11 incident scenarios.** 71 systems, 32 external parties, 173 copy events,
108 external transfers. Risk ratio 10 critical / 33 high of 80.

Per model, derived by `filterByBusinessModel` — never hand-typed:

| | digital-lending | payments | nbfc |
|---|---|---|---|
| Stages | 13 | 12 | 15 |
| Systems (data locations) | 53 | 47 | 62 |
| External parties | 25 | 22 | 30 |
| External transfers | 81 | 70 | 94 |
| Copies created | 123 | 100 | 147 |
| Rights / incident walkthroughs | 9 / 9 | 7 / 7 | 8 / 10 |
| **Hotspot flags = counter** | **8 = 8** | **8 = 8** | **8 = 8** |

The spec's per-variant targets were ~36 / ~35 / ~42 data locations and 39 / 42 / 45 external
transfers. The derived answers run higher on locations and broadly in line on transfers. They are
what the dataset actually contains; no number here was typed to hit a target.
