# Domain Completeness Report — Recruitment Data Flow Pack (Gate 2)

Date: 2026-07-18 · Phase 1 complete · All checks automated in `webapp/lib/data-flow/data-flow.test.ts` (8/8 pass) · `tsc --noEmit` clean · `next build` clean.

## Gate 2 minimums (v1.1 addendum §F) — all met

| Artefact | Minimum | Actual | Status |
|---|---|---|---|
| Process stages | 12 (10 visible for permanent) | 12 (permanent projects to 10) | ✅ |
| Nodes | ≥ 28 | **31** | ✅ |
| Edges (purpose + action + channel) | ≥ 40 | **49** | ✅ |
| Copy-creating edges | ≥ 12 | **39** | ✅ |
| External edges | ≥ 10 | **27** | ✅ |
| Hotspots | exactly 7, each with action + bucket | 7 | ✅ |
| Data categories | 11 groups, Discovery IDs referenced | 11 (24 discovery-item refs, all verified against niche `recruitment-staffing` golden fixture) | ✅ |
| Orphans | 0 | 0 (validatePack) | ✅ |
| Shadow IT required set | WhatsApp, Excel, laptop, AI, backup | all present, all high/critical with why + action (plus google-drive, client-whatsapp flagged) | ✅ |

## Reference-model summary (computed, never hand-typed)

12 stages · 30 systems/repositories · 15 external parties · 11 personas · **39 copy events** · **27 external transfers**. Business-model projections: permanent 10/25/42 (stages/nodes/edges), staffing 12/31/49 — no dangling edges in any projection (tested for all 4 models).

## Files delivered (Phase 1)

- `webapp/lib/data-flow/schemas.ts` — Zod schemas, enums, `validatePack` (referential + boundary-consistency + risk-explanation rules), `computePackSummary`, `filterByBusinessModel`
- `webapp/lib/data/data-flow/recruitment/{stages,data-categories,personas,nodes,edges,hotspots,index}.ts` — the full pack (~1,300 lines of authored domain content)
- `webapp/lib/data-flow/data-flow.test.ts` — Gate 2 tests, runnable via `node --test --experimental-strip-types lib/data-flow/data-flow.test.ts`
- `webapp/tsconfig.json` — added `allowImportingTsExtensions: true` (safe: `noEmit` + bundler resolution) so the config chain is runnable by plain node for tests

## Notable decisions

- **Hotspot 7 (BGV vendor transfer) → `candidate_document`** per §G "pick one and document": the exposure is the identity-document bundle, not the client relationship.
- **`external` is a validated derivation**: must equal "either endpoint is client/vendor/government/public" — a content author cannot mislabel a boundary crossing.
- **Bucket drift guard is dual**: literal-union type (typo fails typecheck) + source-text assertion against the live assessment pack (renamed bucket fails tests).
- Known pre-existing issue, untouched: `lib/discovery/engine.test.ts` doesn't run under its own documented command (extensionless imports in `lib/discovery/*.ts`); the new data-flow chain uses explicit `.ts` imports to avoid the same trap.

## Gate 2 verdict

**READY.** Next: Phase 2 — UX specs + `/plan-design-review` (≥8) → desktop P0 views (`@xyflow/react`).
