# Mobile Spec — Recruitment Data Flow Map (Phase 3 build, spec now)

Breakpoint: `< 1024px` renders `MobileFlowView`; the React Flow canvas is **never mounted** on mobile (v1.1 rule — no graph squeezed into a narrow viewport; also saves the chunk).

## Structure (single column)

1. Header band + signature arc strip (same server-rendered content as desktop, arc beats stack 1-per-row on ≤480px).
2. Business-model select (same control, full-width).
3. **Stage journey**: 12 collapsible stage cards in lifecycle order, connected by the existing `sp-line-flow` vertical connector. Card header: stage number, name, risk summary chips (counts of high/critical nodes in stage). Native `<details>`; `onToggle` tracked (iOS-safe, uncontrolled `open`).
4. Expanded stage card: summary → systems in this stage as tappable rows (name + type icon + risk chip + external/shadow badges) → dpdpaNote line (DPDPA overlay content inline — no separate toggle on mobile) → copy events count.
5. Tapping a system row opens a **bottom sheet** (Radix Dialog styled as sheet, `max-h-[85vh]`, drag-free, ✕ + swipe-down-region close): same content order as the desktop node panel.
6. Hotspot rail: horizontal scroll-snap cards (or stacked list ≤480px) — tap opens the same bottom sheet for that node.
7. CTA band identical to desktop.

## Rules

- No horizontal page scroll at 375px (Gate 5 test).
- Touch targets ≥ 44px.
- Sticky elements: none except the bottom sheet — the arc strip is not sticky on mobile (viewport too small).
- Reduced motion: `sp-line-flow` already static under `prefers-reduced-motion`; sheet uses fade instead of slide.
- Copy tally: the arc strip carries the number; per-stage cards show incremental copy counts — no scroll-linked animation (perf + a11y).
