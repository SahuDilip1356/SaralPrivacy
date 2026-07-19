# Decision Log — Recruitment Data Flow Map

| Date | Decision | By | Where |
|---|---|---|---|
| 2026-07-18 | Layer verdict: essential, not fluff — the missing middle between Discovery and Assessment; meta-layer ("Data DNA", digital twin, knowledge-graph refactor) excluded from this build | Orchestrator analysis, Dilip approved | Plan + spec §0 |
| 2026-07-18 | Scope: FULL React Flow interactive graph (7 views), not lean vertical-journey v1 | **Dilip** (explicit choice vs recommendation) | AskUserQuestion |
| 2026-07-18 | Process: 8-role gated multi-agent workflow, one phase per session, Dilip approves each gate | **Dilip** | AskUserQuestion |
| 2026-07-18 | Architecture decisions A1–A12 recorded | Orchestrator | architecture-decisions.md |
| 2026-07-18 | Numeric exposure engine deferred to phase 2 post-launch (A8) | Orchestrator, pending Gate 1 | architecture-decisions.md |
| 2026-07-18 | Phase 0 artefacts written; Gate 1 approved ("Pls proceed" + v1.1 addendum authored by Dilip) | Dilip | this file |
| 2026-07-18 | **v1.1 Build Addendum adopted as ship contract**: P0 view ladder (Process, Systems, Copy, External, Risk heat), signature erasure arc, 7 canonical hotspots, Gate 2 minimums; orchestration YAML demoted to optional — sequential gated sessions | Dilip | Spec v1.1 §E–§K |
| 2026-07-18 | Hotspot 7 (BGV vendor transfer) mapped to `candidate_document` — exposure is the document bundle, not the client relationship (§G "pick one and document") | Orchestrator | hotspots.ts |
| 2026-07-18 | `external` edge flag is validated against node boundaries (derivation, not free authoring) | Orchestrator | schemas.ts validatePack |
| 2026-07-18 | tsconfig: `allowImportingTsExtensions: true` added so the data-flow config chain runs under plain `node --test` (existing discovery test convention was broken; not fixed here) | Orchestrator | webapp/tsconfig.json |
| 2026-07-18 | **Phase 1 complete — Gate 2 READY**: 31 nodes / 49 edges / 39 copies / 27 external / 7 hotspots; 8/8 tests, tsc + build clean. Awaiting Gate 2 approval → Phase 2 (UX + desktop P0) | Orchestrator | domain-completeness-report.md |
| 2026-07-18 | Phase 2 UX specs written (ux-flow, interaction-spec, mobile-spec, component-map); /plan-design-review scored **8.1/10 → PROCEED** (fixes folded into build: canvas loading skeleton + chunk-failure fallback; explicit hover/active states) | Orchestrator | ux docs |
