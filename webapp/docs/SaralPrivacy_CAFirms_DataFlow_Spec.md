# CA Firms — Personal Data Flow Map
## Build Spec (map #2 of 12) — **V4**

**Status:** DRAFT v4 — awaiting go-ahead. No code written.
**Supersedes:** v3 (which wrongly proposed a *new* 10-section Lifecycle view).
**Presentation reference:** the live page —
`https://saralprivacy.com/industries/recruitment-agencies/data-flow`
**Workflow:** local → local test → **preview review** → prod. Never straight to prod.

> **Governing law.** *Content varies by industry; presentation is unified.*
> CA is the **same page** as recruitment with a different pack. Use case differs,
> personas differ, journey differs — the presentation framework does not.

---

## 1. The presentation framework (already shipped — do not redesign)

Ten sections, in this fixed order. This is the contract every industry renders.

| # | Section | Source |
|---|---|---|
| 1 | Navy header band — eyebrow, H1, intro | `page.tsx:40-54` |
| 2 | Journey selector + live stage count | `DataFlowClient.tsx:104-127` |
| 3 | **MotionJourney** — primary animated experience | `:129-137` |
| 4 | "See the full system map" — collapsed by default | `:140-161` |
| 5 | Risk filter + connection modes | `:168-212` |
| 6 | BoundaryLaneMap + legend | `:214-248` |
| 7 | Detail sheets — node / edge | `:252-271` |
| 8 | Hotspot rail — where control breaks | `:274-289` |
| 9 | "How to read this journey" — 3 cards | `page.tsx:60-94` |
| 10 | CTA band + reference-model disclaimer | `page.tsx:97-127` |

`DataFlowClient` already takes `pack` as a prop and is generic — per its own
header comment: *"The business map is configuration passed as a prop — never
hard-coded here."*

**No new view is being built.** v3's Lifecycle view is withdrawn: it would have
made map #2 look different from map #1, breaking the very standard it was meant
to establish.

### 1.1 The 10-layer content standard maps onto the shipped page

| V2 content layer | Rendered by |
|---|---|
| MAIN ACTOR | §1 header H1 + `pack.mainActor` *(new field)* |
| BUSINESS JOURNEY | §3 MotionJourney (`stages[]`) |
| PERSONAL DATA COLLECTED | §3 data chips + §7 detail (`dataCategories[]`) |
| BUSINESS ACTIVITY | §7 detail (`edge.purpose`, `edge.action`) |
| SYSTEMS USED | §3 + §6 (`nodes[]`) |
| PEOPLE WHO ACCESS | §7 detail (`node.accessPersonaIds`) |
| EXTERNAL SHARING | §6 boundary lanes (`edge.external`) |
| COPIES CREATED | §3 running counter (`edge.createsCopy`) |
| WHERE CONTROL BREAKS | §8 hotspot rail (`hotspots[]`) |
| DPDPA EXPECTATION | §3 stage overlay (`stage.dpdpaNote`) |

Nine of ten already exist as schema fields. Only MAIN ACTOR is new.

---

## 2. Architecture decision — one dynamic route, not twelve clones

**Decision: replace the per-industry route with `app/industries/[sector]/data-flow/page.tsx`**, reading the registry.

**Why.** Only ~12 strings are industry-specific (`page.tsx`: URL, metadata,
breadcrumbs, eyebrow, H1, intro, 3 card texts, CTA label; `DataFlowClient.tsx`:
`MODEL_LABELS` :34, `aria-label` :129, hotspot blurb :279). Cloning that twelve
times guarantees drift — someone improves a card on CA and recruitment silently
falls behind. That is the governing law broken by copy-paste rather than intent.

Moving those strings into the pack and serving one route makes divergence
**impossible** rather than merely discouraged.

| | Clone per industry | **One dynamic route** |
|---|---|---|
| Cost now | ~1.5h | ~4h |
| Cost per map 3–12 | ~1.5h each | **0** |
| Presentation drift | likely | structurally impossible |

URLs are unchanged (`/industries/{sector}/data-flow`), so SEO, sitemap and
existing links are unaffected. Metadata generates per sector.

**New pack fields** carrying the copy: `mainActor`, `pageTitle`, `pageIntro`,
`eyebrow`, `ctaLabel`, `hotspotBlurb`, `howToRead[3]`, plus the `lexicon`.
Defaults reproduce recruitment's current strings byte-for-byte.

---

## 3. CA content — Layer 1: MAIN ACTOR

**The client** — the individual whose financial life passes through the firm.

Two structural facts the map must carry:

**(a) The firm holds data for people who are not its clients.** Where the client
is a company, the data principals are its **employees** — salary, bank account,
PAN, Form 16, medical reimbursement — sitting in the firm's Tally file and on a
partner's laptop. They have no engagement letter with the firm and have never
heard of it. A candidate at least applied.

**(b) Recruitment is a pipeline; CA is a loop.** A candidate flows through once.
A client's data returns **every financial year and accumulates** — ten years of
ITRs, ten Form 16s, a decade of bank statements in one folder. CA firms do not
have a deletion problem; they have an **accumulation problem**.

**Section 2 (journey selector) hides for CA.** One journey, no variants — the
stage count renders alone. Employee exposure is carried by data categories and
personas, not by a second journey.

---

## 4. Layer 2 — BUSINESS JOURNEY (10 stages)

```
Client Onboarding → KYC Collection → Document Collection → Accounting
→ Tax Preparation → GST / TDS → ITR Filing → Client Review
→ Government Submission → Archive ⟲
```

Storage/backup and staff access are **not** stages — they are where data sits
across all stages. They become spanning nodes (`node.stageIds` is already an
array). This was a v2 modelling error, corrected.

---

## 5. Layers 3–8 — content model

### 5.1 PERSONAL DATA
PAN · Aadhaar · Mobile/Email/Address · Bank statements · Salary & Form 16 ·
GST details · Financial statements · Investment & loan documents · Medical
insurance claims · **Portal passwords** · **DSC** · computed tax position *(derived)*

Portal passwords and DSC have **no analogue in recruitment** and are the most
serious items on this map.

### 5.2 SYSTEMS
Email · WhatsApp · Google Drive · OneDrive · **Tally** · **Busy** · **ClearTax** ·
**Winman** · Income Tax Portal · GST Portal · Staff laptop · Backup

Real Indian CA software named explicitly — generic "accounting tool" fails the
recognition test.

### 5.3 PEOPLE WHO ACCESS
Client · Partner · CA · **Article Assistant** · Accountant · IT Support

**Article Assistant** is the CA-specific persona and structurally the
highest-risk access role: broad access, trainee status, annual turnover by design.

### 5.4 EXTERNAL SHARING
Income Tax Portal · GSTN · MCA · Banks · Statutory auditor · The client

**Hierarchy risk:** four statutory destinations where recruitment had ~one, and
the lane board gives `government` one row. **Mitigation:** a single grouped
"Government submission" node with portals named in its detail panel.

### 5.5 Boundary mapping

| enum key | CA meaning | label |
|---|---|---|
| `candidate` | The individual whose data it is | "Your client" |
| `agency` | The CA firm | "Your firm" |
| `client` | The client *business* (payroll employees) | "Client business" |
| `vendor` | Cloud hosting, outsourced data entry, IT support | "Vendor" |
| `government` | Income Tax, GSTN, MCA, EPFO | "Government" |
| `third-party` | Banks, lenders, statutory auditors | "Third party" |
| `public` | MCA public filings | "Public source" |

Enum keys reused structurally; only labels change.

---

## 6. Layer 9 — WHERE CONTROL BREAKS (5–8, ranked; CA has 7)

> **Framework change (2026-07):** hotspots were a hard "exactly 7"; relaxed to a
> band of **5–8** so the count is honest per industry, exactly as stage and node
> counts already vary (recruitment 12 stages, CA 10). The count is not
> presentation — a control-breaks section renders identically at 5 or 8 cards.
> Hotspots are the curated "start here" ranked highlight, not the full risk
> inventory (that lives in the nodes' risk levels). CA legitimately has 7 (DSC
> and portal passwords are real, serious, and CA-specific), so CA is unchanged.
> Schema: `.length(7)` → `.min(5).max(8)`; ranks contiguous `1..N`.

| # | Hotspot | Bucket | Why here |
|---|---|---|---|
| 1 | **DSC token held by the firm** — it can legally sign *as* the client | `storage_access` | **Authority** exposure, not data exposure. Nothing in recruitment compares. |
| 2 | **Client portal passwords in a shared sheet** | `storage_access` | Government-portal credentials for hundreds of clients |
| 3 | PAN / Aadhaar / bank statements over WhatsApp | `intake` | Highest-volume uncontrolled channel |
| 4 | Article assistants with full drive access, annual turnover | `client_document` | Broad access + designed churn |
| 5 | Client files on personal laptops | `client_document` | Unmanaged devices, no wipe on exit |
| 6 | A decade of client folders, never deleted | `retention` | The accumulation problem (§3b) |
| 7 | IT support / data-entry vendor, no written contract | `vendor_incident` | Processor without a contract |

Spread: `storage_access` ×2 · `client_document` ×2 · `retention` ×1 · `intake` ×1
· `vendor_incident` ×1 — every assessment section reachable from the map.

### Copy locks (legal)
- **DPDPA-scoped only.** No ICAI ethics claims, no Income-Tax-Act compliance claims.
- "High-impact financial data" — **not** GDPR's "sensitive personal data" tier.
- DSC framed as *signing authority held on the client's behalf* — never as an
  accusation of misuse.
- Medical reimbursement = high-impact health data, DPDPA framing.
- Reference-model disclaimer identical in force to recruitment's.

---

## 7. Blockers (verified in code)

| | Blocker | Fix | Severity |
|---|---|---|---|
| **A** | `ASSESSMENT_BUCKETS` global enum (`schemas.ts:101`) — CA's 5 buckets have **zero overlap** | per-pack `assessmentBuckets`, `z.string()`, validate in `validatePack` | ⛔ silent failure |
| **C** | `BOUNDARY_META` hardcodes "Candidate"/"Your agency" (`flow-theme.ts:51-64`); `MotionJourney` copy (:263,:333,:569,:641) | per-pack `lexicon` + `mainActor` | ⛔ visibly wrong |
| **B** | tests import one pack, assert 12 stages (`data-flow.test.ts:21`) | parametrise over registry; stage count a range | ⚠️ |
| **D** | `BUSINESS_MODELS` global `permanent\|staffing` (`schemas.ts:21`) | allow a pack to declare one model or none; **selector hides when one** | ⚠️ low |
| **E** | design debt — 49 arbitrary px sizes, 3 weights, no empty states, no `disabled:`/`active:`, 15 hexes (dupe-cased teal) | Phase 0e, 5 items | ⚠️ |

### Non-blocking
- Delete empty iCloud duplicate `lib/data/data-flow/recruitment 2/`.
- CA assessment client needs a `BUCKET_FOCUS` map (CA's 5 keys) or the focus
  banner never renders — only recruitment has one today
  (`RecruitmentAssessmentClient.tsx:124`).

---

## 8. Effort

| Block | Effort |
|---|---|
| Phase 0 — engine debt (A–E) | ~10h |
| Dynamic route + copy into packs | ~4h |
| CA content pack | ~10h |
| Verify, preview, ship | ~4h |
| **Total** | **~28h** |

**Map #3 onward: ~10–12h — content only.**

Full sequence and gates: `docs/CA_DataFlow_Sprint_Plan.md`.

---

## 9. Open questions

1. **DSC framing** — is "your firm can sign as your client" the jolt that makes a
   partner act, or too confronting for hotspot #1?
2. **Article Assistant** — name the persona explicitly? Accurate and instantly
   recognisable, but it points at a specific group inside the firm.
3. Delete the stray `recruitment 2/` folder?
4. Phase 0e — fix the design debt now, or log an override?
5. **A named CA partner who sees this within 30 days** — still open from the CEO
   review; decides whether this is a validated bet or an SEO asset.
