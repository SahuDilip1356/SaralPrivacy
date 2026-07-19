# Interaction Spec — Recruitment Data Flow Map (Phase 2)

## Canvas (desktop, ≥1024px)

- **Library**: `@xyflow/react`, loaded via `next/dynamic` (`ssr: false`) inside a client component; the page shell, signature arc strip, hotspot rail and CTA band are server-prerendered HTML (SEO carries the content, canvas is enhancement).
- **Layout**: hand-positioned nodes per view (computed in `map-builder.ts`, not stored in config). Process journey = 12 stage columns × rows by boundary; Systems = boundary swim-lanes. Deterministic, no auto-layout dependency.
- **Pan/zoom**: enabled, `fitView` on load and on view switch; zoom limits 0.4–1.5; `panOnScroll` off (page scroll wins), drag-to-pan on canvas background only. Nodes are NOT draggable (reference model, not an editor).
- **Node component** (one, style-switched by nodeType — semantic shapes, never colour-only):
  - person = circular avatar (User icon) · system = rounded rect (app icon) · repository = rect with database icon · device = rect with smartphone/laptop icon · physical_storage = rect with archive icon
  - Risk chip: icon + short label (`AlertTriangle` critical/high, `Info` medium, `CheckCircle2` low) — icons carry meaning, colour reinforces
  - shadowIt: dashed border + "unmanaged" micro-badge
  - External boundary: outlined style + boundary tag (Client / Vendor / Govt / Public)
  - Copy view: duplicate-sheet icon badge with per-node incoming-copy count
- **Edge component**: solid = internal, dashed = external, double-line marker (⧉ label) when createsCopy; arrowheads always; edge click target ≥ 12px via interactionWidth.
- **Keyboard**: canvas nodes focusable (`nodesFocusable`), Tab order = stage order; Enter/Space opens panel; Esc closes panel and returns focus to the node; view switcher and toggles are native buttons in a `role="toolbar"`. Focus visible ring (teal) everywhere.
- **Screen readers**: each node `aria-label` = "name, node type, boundary, risk level"; panel is `role="dialog"` `aria-modal="false"` (page remains operable), labelled by node name; hotspot rail is an ordered list.

## State (single `useState` object in DataFlowClient — no store)

```
view: "process" | "systems" | "copies" | "external"   (riskHeat: boolean is orthogonal)
model: BusinessModel ("permanent" default)
selection: { kind: "node" | "edge"; id: string } | null
```
URL is not synced in P0 (shareable state is P2). View/model/riskHeat changes re-project via `useMemo(map-builder)`; selection survives view switches when the node remains visible, else clears.

## Detail panels

- Desktop: fixed right column (~360px), page content beside it; never overlays the canvas fully. Sticky within viewport. Close on ✕, Esc, or selecting empty canvas.
- Node panel order: name + type + boundary chips → "What it holds" (data category chips; derived categories get a distinct "inferred" tag) → "Who can access" (persona list with boundary tags) → ownership note (business owner / system owner / steward wording where authored) → retention line (retentionDefined ? "Retention defined" : "No retention rule — flag") → risk block (chip + why + action) → related hotspot (if any) → "Check this in Assessment →" (bucket-labelled).
- Edge panel order: source → target chips → action + channel line ("Shared · Email attachment") → purpose sentence → data chips → copy flag ("Creates a new copy: yes") → external flag ("Leaves your control: yes") → risk block → CTA.

## Toggles & filters (P0 set only)

- View switcher: 4 exclusive views (process / systems / copies / external) as segmented chips.
- Risk heat: independent toggle, combinable with any view.
- Business model: select (permanent · staffing · RPO · executive search); switching re-projects and announces "Showing N stages, M systems" via `aria-live="polite"`.
- Stage filter: click a stage header in process view narrows to that stage (click again to clear). No dense multi-filter rail in P0 (v1.1 §E).

## Empty/edge states

- Filter yields nothing visible → canvas shows inline note "No systems in this view for the selected business model" + reset button.
- Unknown/missing data in config → cannot happen at runtime (Zod-validated), but panel renders "—" for optional fields.
- JS disabled / canvas fails → server-rendered arc strip, hotspot rail and CTAs still deliver the story.

## Analytics (lib/analytics.ts pattern)

`data_flow_opened` (mount) · `view_changed {view}` · `business_model_selected {model}` · `node_clicked {nodeId}` · `edge_clicked {edgeId}` · `risk_overlay_enabled` · `hotspot_clicked {hotspotId}` · `assessment_cta_clicked {bucket?}` · `discovery_cta_clicked`.

## Performance budget

31 nodes / 49 edges — trivial for React Flow. Canvas chunk lazy-loaded; no canvas JS in initial route payload. First meaningful render (server HTML) < 1 s on broadband; canvas interactive < 2.5 s. No requestAnimationFrame loops; motion via CSS/`framer-motion` one-shot transitions only.
