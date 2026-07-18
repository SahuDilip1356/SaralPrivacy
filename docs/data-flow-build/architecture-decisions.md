# Architecture Decisions — Recruitment Data Flow Map (Phase 0)

| # | Decision | Rationale | Alternatives rejected |
|---|---|---|---|
| A1 | Full interactive graph (`@xyflow/react`) as the desktop experience | Dilip's explicit scope call (2026-07-18) — the map is the signature product layer, not a supporting graphic | Lean vertical-journey-only v1 (recommended by analysis, declined); middle option (journey + one graph view) |
| A2 | Gated multi-agent workflow (8 roles, 5 gates) | Dilip's explicit process call; content, claims-review and QA genuinely benefit from role separation at this scope | Single-session build flow used for the 12 assessment packs |
| A3 | TypeScript config modules, Zod-validated — not JSON, not DB | Proven pack pattern; typechecked cross-references (bucket literal union); no runtime fetch; versioned in git | JSON files (no typechecking); Appwrite-stored config (needless infra for static reference model) |
| A4 | All 7 views = projections (`map-builder.ts`) over ONE node/edge model | Spec's own requirement; prevents 7 divergent datasets | Per-view configs |
| A5 | Mobile = separate `MobileFlowView` (tabs + vertical journey + bottom sheets); graph desktop-only | Spec §22 mandate + a11y/perf reality | Responsive-shrunk canvas |
| A6 | Route `/industries/recruitment-agencies/data-flow`, indexable, self-canonical, in sitemap | Real crawlable content (unlike noindex quiz); linked from indexed industry page | Standalone `/recruitment-data-flow` (orphaned from industry IA); noindex (wastes SEO) |
| A7 | Reuse Discovery strings/IDs at authoring time; no runtime import of discovery engine | Single source of wording truth without coupling a 380 KB generated dataset into the page bundle | Runtime `denormNiche()` (bundle cost); re-inventing wording (drift) |
| A8 | Numeric exposure-score engine deferred to phase 2 post-launch; v1 ships authored `riskLevel` + hotspot ranking | Score adds authoring + explainability burden before user evidence; per-node authored risk delivers the same UX moment | §17 engine in v1 |
| A9 | framer-motion for token/pulse motion (already installed); CSS `sp-line-flow` for connectors/teaser | Zero new motion deps; reduced-motion parity already solved for CSS path | New animation lib; hand-rolled rAF |
| A10 | Exposure labelled "SaralPrivacy Operational Exposure"; reference-model banner on all metrics | Legal-claims discipline (memory: DPDPA-scoped, no overclaim) | — |
| A11 | No engine/core changes to `lib/data/industry-assessment/` | Existing packs stay byte-identical (isolation rule) | — |
| A12 | One new dependency total: `@xyflow/react` | Dependency-bloat rule; framer-motion + Zod + lucide + Radix already present | d3/dagre/elkjs custom stack |
