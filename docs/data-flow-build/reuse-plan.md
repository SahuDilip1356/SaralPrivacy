# Reuse Plan — Recruitment Data Flow Map (Phase 0)

What existing code the build reuses, and how. Rule: reuse strings, IDs, tokens and patterns; add code only where nothing exists (the graph itself).

## Reused as-is (no changes)
| Asset | Path | Use |
|---|---|---|
| Discovery item wording + IDs | `webapp/lib/discovery/{types.ts,data.ts}` — `denormNiche("recruitment-staffing")` | Data-element names, subjects, purposes, sources, obligations for the config. Copy strings at authoring time; no runtime import of the engine |
| Assessment pack buckets | `webapp/lib/data/industry-assessment/packs/recruitment-agencies.ts` | Bucket keys as a **literal-union type** for `assessmentLink` (drift fails typecheck); bucket labels for chips; copy tone |
| CSS flow connectors | `webapp/app/globals.css` `sp-line-flow` / `sp-dash-flow` | Landing teaser + mobile journey spine; reduced-motion handling already built in |
| Design tokens | `webapp/tailwind.config.ts` navy/teal/pearl/amber | All map surfaces; no new hexes |
| Card idiom + page skeleton | `app/industries/recruitment-agencies/page.tsx` | Preview section styling; detail-panel card style |
| Risk-chip pattern (icon+label, not colour-only) | `app/assessment/recruitment/RecruitmentAssessmentClient.tsx` | Node/edge risk chips, hotspot cards |
| SEO plumbing | `webapp/lib/schema.ts`, `components/seo/Byline.tsx`, `lib/content-freshness.ts` | data-flow page metadata, breadcrumb schema, byline |
| Thin server page + client pattern | `/assessment/recruitment/page.tsx`, `/discovery/page.tsx` | `data-flow/page.tsx` + `DataFlowClient.tsx` |
| framer-motion@12 (installed, unused) | `webapp/package.json` | Data-token travel, copy-duplication, boundary pulses; gated on reduced-motion |

## Extended (small additive edits)
| Asset | Path | Edit |
|---|---|---|
| Analytics | `webapp/lib/analytics.ts` | One namespaced block, 12 events per spec §24, following the `notice:` pattern |
| Sitemap | `webapp/app/sitemap.ts` | One entry: `/industries/recruitment-agencies/data-flow` |
| Industry page | `app/industries/recruitment-agencies/page.tsx` | Insert `<DataFlowPreview/>` between Risk map and How-it-works + sidebar card; stays server-rendered |
| Discovery ResultPanel | `app/discovery/components/ResultPanel.tsx` | "See where this data travels" cross-link (Phase 4) |

## Net-new (the actual build)
- `webapp/lib/data-flow/` — schemas.ts, map-builder.ts, filters.ts (+ risk-engine.ts in phase 2 post-launch)
- `webapp/lib/data/data-flow/recruitment/` — 7 config modules + index
- `webapp/components/data-flow/` — canvas, node, edge, toolbar, filters, legend, panels, RiskSummary, DpdpOverlay, ProcessTimeline, MobileFlowView
- `webapp/components/industries/DataFlowPreview.tsx` — server-safe teaser
- `webapp/app/industries/recruitment-agencies/data-flow/` — page + client
- Dependency: `@xyflow/react` (only addition)

## Second-industry reuse contract
Adding CA Firms (or any industry) later = new `lib/data/data-flow/{industry}/` config + new thin route + preview include. Zero component changes if the schema holds — same contract as the assessment pack engine.
