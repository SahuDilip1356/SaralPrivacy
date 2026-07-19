# Component Map — Recruitment Data Flow Map (Phase 2–3)

```
app/industries/recruitment-agencies/data-flow/
  page.tsx                    server · metadata (indexable, canonical, breadcrumb
                              schema), header band, signature arc strip (computed
                              summary), renders <DataFlowClient/>, hotspot rail +
                              how-to-read + CTA band are INSIDE client? No —
                              hotspot rail & CTAs are server-rendered below the
                              client region; client owns only toolbar+canvas+panel.
  DataFlowClient.tsx          client · state {view, model, riskHeat, selection},
                              breakpoint switch (matchMedia lg), analytics,
                              renders FlowToolbar + (Canvas | MobileFlowView) +
                              detail panels. Receives pack + precomputed summary
                              as props from the server page (config stays out of
                              components).

components/data-flow/
  DataFlowCanvas.tsx          client · next/dynamic wrapper around @xyflow/react
                              ReactFlow; consumes projected {nodes, edges} from
                              map-builder; fitView, zoom limits, a11y props.
  FlowNodeCard.tsx            custom node renderer (semantic shape by nodeType,
                              risk chip, shadow/external badges, copy-count badge)
  FlowEdgeLine.tsx            custom edge renderer (dashed external, ⧉ copy marker)
  FlowToolbar.tsx             view switcher, business-model select, risk toggle,
                              reset (role=toolbar, aria-live announcements)
  FlowLegend.tsx              canvas overlay legend (shapes, line styles, badges)
  NodeDetailPanel.tsx         right panel / bottom-sheet body for a node
  EdgeDetailPanel.tsx         right panel / bottom-sheet body for an edge
  HotspotRail.tsx             server-safe ranked 7 cards (client selects via
                              callback when interactive; plain anchors otherwise)
  MobileFlowView.tsx          client · stage journey + system rows + bottom sheet
  SignatureArc.tsx            server-safe 5-beat arc strip (numbers via props)

lib/data-flow/
  schemas.ts                  (Phase 1 — done)
  map-builder.ts              view projections: positions per view, visible sets,
                              stage columns, boundary lanes, copy/external
                              emphasis flags; pure functions, unit-tested
  data-flow.test.ts           Gate 2 tests (done) + map-builder tests (Phase 2)
```

Rules: config imported ONLY in `page.tsx` (server) and passed down; components receive typed props; no component imports the recruitment pack directly (industry #2 reuses everything). Icons: lucide-react set already used on the industry page. Styling: Tailwind tokens only.
