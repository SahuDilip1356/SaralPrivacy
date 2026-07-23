# SaralPrivacy — Data Discovery Enhancement (Lean First Cut)

**Branch:** `feat/data-discovery-enhancement`
**Status:** Design-review PASSED 2026-07-23 (avg 8.4/10 after read-first Register + state-coverage patch). Cleared to build.
**Scope owner:** Dilip Sahu
**Decision date:** 2026-07-23

---

## 1. The correction we're making

Discovery today (`/discovery`) is a **stateless snapshot advisor**: pick niche → confirm items in 3 buckets → 3 control questions → one result panel (risk gauge + mini-RoPA "Personal Data Map" + top-5 precautions + CSV). It stores nothing. Data Mapping (`/data-mapping` + industry lane boards) is a **curated editorial pack per industry**, hand-authored, *not* generated from a user's discovery answers.

**The two are disconnected, and Discovery over-reaches** by trying to be the whole picture in one panel.

The corrected product logic:

| Stage | Question it answers |
|---|---|
| **Master Register** | What personal data do we have? |
| **Retention Matrix** | How long should we keep it? |
| **Risk Register** | What can go wrong? |
| → Data Mapping (next stage) | Where does it travel? |

**Discovery must NOT generate the final Data Flow Mapping Report.** It stops at three reports, then hands off. Discovery doesn't yet know process sequence, system-to-system movement, downloads/copies, vendor transfers, backup paths, or hidden flows — that's Mapping's job.

## 2. What "lean first cut" includes (and defers)

**In scope (cut 1):**
- Restructure the single result panel into **three named reports**: Master Register, Retention Matrix, Data Risk Register.
- **Editable, filterable, sortable, searchable Master Register** — core fields visible; advanced fields present in the data model but hidden by default.
- **Retention Matrix** derived from Register rows (grouped, "Suggested — validate" discipline).
- **Data Risk Register** with the **bridge fields** that make the handoff possible.
- **Prioritised Action Summary** — ≤5 immediate / ≤5 30-day / ≤5 90-day. No monetary penalty estimates.
- **Completion screen** ("Your Personal Data Discovery Pack is Ready") + counts + 3 report cards + **`Build My Data Flow Map`** CTA → Data Mapping.
- All **stateless** — same "we store nothing" posture as today. Data shaped as a JSON `DiscoveryRegister` payload so Appwrite persistence drops in later with no rework.

**Deferred (Phase 2+):**
- Appwrite persistence (`discovery_register` = ONE document per session/org holding the register JSON — NOT one doc per row).
- Bulk actions (confirm suggestions, assign owner, assign retention/storage, mark N/A, send rows to Mapping).
- Owner/review-status tracking, `last_reviewed_at`, shareable internal review link (needs auth).
- Live "linked flow node" wiring (needs the Mapping stage to consume the handoff payload).

## 3. Data model (stateless now, Appwrite-ready later)

The engine already resolves selected items into `ResolvedItem[]` (fields: `item`, `examples`, `tags`, `precaution`, `bucket`, `obligations`, `dataSubjects`, `processingPurposes`, `sources`, `weight`). The Register is a **derivation** of those, not a new source of truth.

```ts
// One register row per confirmed data item. Derived from ResolvedItem + ScoreResult.
interface RegisterRow {
  id: string;                       // `${nicheId}:${seq}`
  // --- core (visible) ---
  dataItem: string;                 // ← item
  description: string;              // ← examples
  dataPrincipal: string;           // ← dataSubjects
  dataCategory: string;            // ← derived from tags (TAG_GROUP)
  purpose: string;                 // ← processingPurposes
  collectionSource: string;        // ← sources (best-guess; "Suggested")
  storedAt: string;                // ← sources (best-guess; "Suggested")
  riskLevel: RiskBand;             // ← bucket + top tag weight
  riskReason: string;              // short, derived
  recommendedAction: string;       // ← precaution
  status: 'Suggested' | 'Confirmed' | 'Unknown';   // default 'Suggested'
  // --- advanced (in model, hidden by default) ---
  processingGround?: string;       // 'Suggested: Consent' etc.
  noticeStatus?: 'Needs Confirmation' | 'In place' | 'Unknown';
  internalAccessRoles?: string[];
  externalRecipients?: string[];
  retentionRuleId?: string;        // link to Retention Matrix
  linkedRiskIds?: string[];        // link to Risk Register
  owner?: string;
  provenance: 'engine-suggested';  // cut 1 is always engine-derived
  confidence?: 'High' | 'Medium' | 'Low';
  userNotes?: string;
}

interface RetentionRule {
  retentionRuleId: string;
  category: string;                            // engine TAG_GROUP key — the lookup key
  dataItem: string; dataPrincipal: string; process: string; purpose: string;
  retentionTrigger: string;                    // "Vacancy closure" etc. (clock starts)
  dpdpaBaseline: string;                       // ALWAYS the minimise rule: "erase when purpose served"
  otherLaw: { period: string; citation: string } | null;   // statutory floor, or null
  status: 'statutory_floor' | 'dpdpa_determination';
  guidance: string;                            // the actionable "what the tool says" line
  systemsAffected: string[];
  disposalMethod: string;                      // "Secure deletion"
  confirmationStatus: 'unconfirmed'|'accepted'|'edited';
  label: 'Suggested — validate';               // always on
}

interface RiskRow {
  riskId: string;
  risk: string; affectedData: string[]; locationOrFlow: string; reason: string;
  severity: RiskBand; priority: 'Immediate'|'High'|'Medium';
  recommendedControl: string; category: RiskCategory;  // 12 categories from proposal
  // --- bridge into Mapping ---
  relatedDataItems: string[];
  relatedStorage?: string;
  relatedRecipient?: string;
  suggestedMappingQuestion: string;            // "Where does the candidate CV travel after collection?"
  mappingPriority: 'high'|'medium'|'low';
  linkedFlowNodeId?: string;                   // null until Mapping creates it
}

interface DiscoveryRegister {         // the whole cut-1 payload (Appwrite-storable as JSON later)
  nicheId: string; nicheName: string; generatedAt: string;
  rows: RegisterRow[]; retention: RetentionRule[]; risks: RiskRow[];
  counts: { items:number; categories:number; storageLocations:number; recipients:number; highRisk:number; retentionToConfirm:number };
}
```

### Retention model (LOCKED 2026-07-23) — two-force, status-flagged

Retention is presented as the tension between two forces, never a single asserted number:
- **DPDPA baseline** (identical for every category): *retain only while the purpose is live; erase when served or consent withdrawn.* DPDPA sets **no** number.
- **Other Indian law** (the only source of a firm period): a statute can *override the erasure duty* — because DPDPA's erasure provision (commonly cited as **s.8(7)**, confirm w/ counsel) expressly yields to "any law for the time being in force."

Each rule carries a **status flag**:
- `statutory_floor` → a retention law applies → firm period + citation shown → "keep N then erase; validate scope."
- `dpdpa_determination` → **no** other law → the tool shows NO hard number → "DPDPA: erase when purpose served; you set & justify the period."

Global rules: longest applicable statute wins; the floor attaches only to fields the statute covers; every citation marked "confirm with counsel"; standing footnote that DPDP Rules are still settling; **not legal advice**.

The seed lookup (`retention-suggestions.ts`), keyed on `TAG_GROUP` category:

| Category | DPDPA baseline | Other law (confirm w/ counsel) | Status |
|---|---|---|---|
| `IDENTITY` | erase when purpose served | None on its own | `dpdpa_determination` |
| `FINANCIAL_DATA` | erase when purpose served | Companies Act s.128 ~8 yrs; IT Rule 6F ~6 yrs | `statutory_floor` |
| `TRANSACTION_DATA` | erase when fulfilled | GST 72 mo; Companies Act ~8 yrs | `statutory_floor` |
| `EMPLOYMENT_DATA` | erase after employment purpose | IT/EPF/ESI/Wages/Companies ~7–8 yrs post-exit | `statutory_floor` |
| KYC (subset of `IDENTITY`) | erase after relationship | PMLA 5 yrs — regulated entities only | `statutory_floor` |
| `HEALTH_DATA` | erase after service | Clinical Establishments/ICMR ~3 yrs — providers only | `statutory_floor`* |
| `CHILD_DATA` | minimise, purpose-bound → erase | Education/board rules may apply | `dpdpa_determination` |
| `BEHAVIOURAL_DATA` | erase on consent withdrawal | None | `dpdpa_determination` |
| `AI_INFERENCE` | erase when purpose served | None (bound by source-data purpose) | `dpdpa_determination` |
| `DEVICE_NETWORK_DATA` | erase when purpose served | IT Intermediary Rules ~180 days — intermediaries only | `dpdpa_determination` |
| `LOCATION_DATA` | erase when purpose served | None | `dpdpa_determination` |
| `BIOMETRIC_SURVEILLANCE` | erase when security purpose served | None general | `dpdpa_determination` |
| `VENDOR_SHARED` | erase when purpose served | Follows underlying data + DPA | `dpdpa_determination` |
| `DARK_DATA` | should not persist past purpose | None | `dpdpa_determination` |
| `COMMUNICATION_DATA` | erase after resolved | None (unless financial dispute) | `dpdpa_determination` |
| `CONSENT_RECORD` | keep proof while processing | None | `dpdpa_determination` |
| `SENSITIVE_CONTEXT` | minimise → erase when served | None dedicated | `dpdpa_determination` |
| `RETENTION_RISK` | purpose likely served → erase | None | `dpdpa_determination` |
| `ACCESS_CONTROL_RISK` | retention follows underlying | Follows underlying category | `dpdpa_determination` |
| **default fallback** | erase when purpose served | None identified | `dpdpa_determination` |

`*` health = sector-conditional: providers see ~3 yrs; non-health businesses fall back to determination.

## 4. Register interaction model (cut 1 = read-first, not a spreadsheet grid)

Cut 1 deliberately is **not** a full editable data-grid (that's Phase 2 with bulk actions). It's a **read-first table with inline per-row confirm/edit**, which keeps the interaction + a11y surface small while still delivering the value.

- **Rows** render as a semantic `<table>` (proper `<th scope="col">`, `<caption>`), core columns only. Risk column carries the semantic band colour (`bandColor`) + a text label (never colour alone).
- **Sort**: click a column header toggles asc/desc; header carries `aria-sort` (`ascending`/`descending`/`none`) and a visible caret. Keyboard: header is a `<button>` inside the `<th>`, Enter/Space sorts.
- **Filter**: filter chips (`data principal · data category · collection channel · storage location · risk · status`) are toggle buttons with `aria-pressed`. Active filter announced via an `aria-live="polite"` "N of M items" line above the table.
- **Edit**: each row has one **Confirm** action (Suggested → Confirmed) and an **Edit** action opening the existing detail-drawer pattern (not inline-cell editing — avoids the grid a11y minefield). Drawer is a focus-trapped dialog (`role="dialog"`, `aria-modal`, ESC closes, focus returns to trigger).
- **Interaction states** (reuse discovery.css tokens): hover = row `background: var(--cloud)`; focus = `--ring`; active sort header = navy caret; Confirm button disabled state once confirmed (`aria-disabled`, muted). Filter chip pressed = green fill.

Filters deferred with advanced fields: recipient, consent, notice, retention, provenance, review.

## 4a. State coverage (all designed)

| State | Design |
|---|---|
| **Success (default)** | 3 reports render; Register read-first table; completion screen counts populated. |
| **Empty — no items confirmed** | If the user confirmed 0 items, Register shows an empty-state card: "No personal data items confirmed yet. Go back and confirm what you handle." + link to re-open item review. No blank table. |
| **Zero in a count tile** | 0 external recipients / 0 high-risk → tile still renders with `0` and a muted "None identified" sub-label (honest, not hidden). |
| **Filter returns nothing** | Table area shows "No items match these filters" + a "Clear filters" ghost button. |
| **Edit-in-progress** | Detail drawer open; underlying row shows an "editing" left-border accent; background inert (`aria-hidden` on page behind dialog). |
| **Loading** | Derivation is synchronous/in-memory — no async load, so no spinner. Documented explicitly so no phantom loading state is built. |
| **Error** | Only failure path is the (optional) local "Save progress" write; on failure show an inline non-blocking toast "Couldn't save locally — your pack is still on screen." Never blocks the reports. |

## 5. Completion screen
Heading: **Your Personal Data Discovery Pack is Ready**. Count tiles (items / categories / storage locations / external recipients / high-risk findings / retention rules requiring confirmation). Three report cards (Register / Retention Matrix / Risk Register) with the one-line descriptions from the proposal. **Next Step** block: "See where your personal data travels" → primary CTA **`Build My Data Flow Map`** → routes to Data Mapping. Secondary: Save progress (local), Download summary, Restart/update answers.

## 6. Copy locks (non-negotiable)
- No overall compliance claim.
- Standard footer line: *"You have identified the personal data your business is likely to handle. We have organised it into a working register and suggested retention matrix. Review the assumptions before treating the outputs as final."*
- No monetary penalty estimates anywhere.
- Every retention period without a verified legal source reads "Suggested — validate."

## 7. Non-goals
- No persistence, no auth, no bulk actions, no live flow-node linking in cut 1.
- No change to the scoring engine (`lib/discovery/engine.ts`) — the Register is a pure derivation of existing `score()` output.
- No change to the Data Mapping packs. The CTA links to Mapping; consuming the handoff payload is Phase 2.

---

# PART II — Comprehensive Enhancement Scope (full vision, phased)

Cut 1 (Parts 1–7 above) is Phase A. This part maps the *entire* Data Discovery Enhancement so CEO/Eng/Sprint reviews have the full picture. Sequence, not calendar.

## The product spine
`Discovery answers → Master Register (source of truth) → Retention Matrix + Risk Register (derived) → Prioritised Action Summary → HANDOFF → Data Mapping`

Four durable truths this enhancement must honour:
- **Master Register = What.** Retention Matrix = How long. Risk Register = What can go wrong. Data Mapping = Where it travels. Discovery owns the first three; it must NOT emit the flow map.
- **Presentation-unified law:** the Discovery pack is industry-agnostic in presentation; only content (items/retention/risks) varies by niche. One view, all 276 niches.
- **Stack = Appwrite.** No Supabase. Persistence = one `discovery_register` JSON document per session/org, never one-doc-per-row.
- **Honesty locks:** no compliance claim; retention two-force + status-flag; no monetary penalties; provenance always shown.

## Phase map

### Phase A — Restructure (stateless) — *cut 1, design-review PASSED 8.4*
3 named reports; read-first Master Register (inline confirm + drawer edit, 6 filters, sortable); Retention Matrix (two-force table); Risk Register with bridge fields; Prioritised Action Summary (≤5/≤5/≤5, no penalties); completion screen + `Build My Data Flow Map` CTA; copy locks. No backend, no engine change.

### Phase B — Persistence (Appwrite)
`discovery_register` collection: one document per `session_id` (anon) — `{ token, nicheId, payload:JSON, createdAt, updatedAt }`, lazy-init Proxy client, `report_type`-style ≤10-char token if needed. Enables: resume a pack, "Save progress" that survives refresh, and a stable id the Mapping stage can read. Anonymous by default (no auth) — keeps the low-friction funnel. Data-protection note: we now store customers' data *inventories* (categories, not the personal data itself) — surface a plain-English retention/PII line on the tool so we practise what we preach.

### Phase C — Register depth (the full workbench)
Promote read-first table → full editable grid ONLY if Phase B shipped (persistence makes edits worth keeping). 45-field model surfaced progressively; bulk actions: confirm suggestions · assign owner · assign retention rule · assign storage · mark N/A · export selected · **send selected rows to Data Mapping**. Full filter set + detail drawer (what it is / where the suggestion came from / why it matters / what's unconfirmed / linked risks / linked flow nodes / linked retention rule / next action). Advanced-grid a11y is a first-class task here, not an afterthought.

### Phase D — The real handoff (Discovery → Mapping)
Today Mapping = curated per-industry lane boards, disconnected from Discovery. Phase D makes the bridge live: the Risk Register's `suggestedMappingQuestion` / `mappingPriority` / `relatedStorage` / `relatedRecipient` seed a **draft flow map** the user confirms; `linkedFlowNodeId` populates once a node is created. Requires the Mapping stage to *consume* the `discovery_register` payload — the biggest cross-tool piece, and the reason the bridge fields exist from Phase A.

### Phase E — Collaboration (auth-gated)
Owner/review tracking (`review_status`, `last_reviewed_at`), shareable internal review link, team confirm workflow. Needs real auth — deferred to last; only justified once B–D prove the pack is a living document, not a one-shot.

## Dependency spine
A → B → (C ∥ D) → E.  C and D both depend on B (persistence). D is the strategic payoff (continuity into Mapping); C is depth on the Register itself. E depends on everything.

## Success signals (per phase, no vanity metrics)
- A: % of Discovery completers who view all 3 reports; CTA click-through to Mapping.
- B: pack resume rate (return within a session/day).
- C: rows confirmed/edited per pack (is it used as a working doc?).
- D: packs that flow into a started Data Map (the continuity metric that matters most).
- E: multi-user packs / shared-link opens.

## Explicit non-goals (whole enhancement)
No monetary penalty estimates ever. No overall compliance verdict. No storing the actual personal data (only the inventory of categories). No change to `engine.ts` scoring. No second backend.

---

## Build log & notes

- **S10 (motion, fast-follow):** seam animation — data "flowing" from the Register into a map, CSS/SVG only (reuse the existing `/data-mapping` animated-hero technique + the `data-flow-motion.html` prototype), `prefers-reduced-motion` static fallback. NOT in the P0 critical path — functional-first, motion after the reports work, same branch. "Hiperframe" query dropped per founder.
- **Seam CTA target LOCKED:** `/data-mapping` hub; payload in `sessionStorage`; click instrumented via `trackEvent.discoveryHandoffClick`.
- **⚠️ Pre-existing test-runner finding:** the `lib/discovery` node-test files (`engine.test.ts`) fail under Node 24 because `engine.ts` imports `./data` extensionless and `--experimental-strip-types` no longer resolves that. NOT introduced here. New tests (`retention-suggestions.test.ts`) are written self-contained to stay green. The S9 component/e2e step needs a working runner (tsx loader or `.ts` extensions on engine.ts internal imports) — flag for a separate decision; do NOT fold an engine.ts change into this slice silently.

### Progress
- ✅ **S1** — `retention-suggestions.ts` + test (6/6 green). Two-force status-flagged lookup, 18 categories + fallback + `trigger`; statutory floor only on FINANCIAL/TRANSACTION/EMPLOYMENT/HEALTH.
- ✅ **S2** — `register.ts` `buildRegister()` + test (8/8 green). Pure, **dependency-injected** (`tagWeight`/`categoryName` passed in → no engine/./data import chain → testable under Node 24). Derives RegisterRow[] + RetentionRule[] (grouped per category) + RiskRow[] (≤6 themed, each with mapping bridge + row back-links) + Prioritised Actions (≤5/≤5/≤5, no penalties) + counts. Accepts `result` for continuity but cut-1 doesn't read it.
- ⏭️ **S3** — `DiscoveryPack` + `CompletionHeader`, wired into ResultPanel (first visible component — checkpoint before proceeding).

### Progress — session 2 (build)
- ✅ **S3–S7 built** — `app/discovery/components/pack/` : `DiscoveryPack` (completion header + 6 count tiles + Retention Matrix + Risk Register + Action Summary + disclaimer), `MasterRegister` (sort · risk/category filters · search · inline Confirm · focus-trapped detail drawer), `HandoffCTA` (sessionStorage `sp_discovery_handoff` payload + `trackEvent.discoveryHandoffClick` + push `/data-mapping`). Wired into `ResultPanel` (pack visible; lead-form + CSV preserved below). `discovery.css` extended (`.spd .dpack*`, reduced-motion guard). `lib/analytics.ts` += `discoveryHandoffClick`.
- ✅ **S8 copy-locks** — pack scanned: no penalty/₹/compliance-guarantee copy; all four honesty locks present ("Suggested — validate", "not legal advice", assumptions-disclaimer, "confirm with counsel").
- **Verification status (honest):**
  - Pure logic (`register.ts`, `retention-suggestions.ts`) — **14/14 unit tests green + scoped `tsc` clean.**
  - TSX components — written, one type bug fixed by eye (sort comparator union). **Full `tsc`/`next build`/dev-preview could NOT run locally**: `node_modules` is iCloud-zeroed (`eslint/package.json` = 7225 bytes, all null) → toolchain hangs/fails. This is the documented iCloud-zeroing pitfall, NOT a code issue. **Authoritative validation = preview deploy (clean Vercel node_modules).**
- ⏭️ **S9** — component/e2e tests + preview `next build` + browser verify (blocked locally; do at preview). **S10** — seam motion (fast-follow).
- **Repro to validate locally:** `npm ci` to restore node_modules, then `npm run dev` → `/discovery` → pick a niche → confirm items → see the 3-report pack + seam.
