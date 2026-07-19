# UX Flow — Recruitment Personal Data Flow Map (Phase 2)

Route: `/industries/recruitment-agencies/data-flow` · Desktop-first interactive graph; mobile is a separate vertical journey (mobile-spec.md). Brand: navy/teal/pearl, card idiom of the recruitment industry page. Eyebrow: **"Where your data travels"** (naming rule, v1.1 §D).

## Page skeleton (top → bottom)

1. **Header band** (navy-700, mirrors industry-page hero): eyebrow, H1 "Recruitment Personal Data Flow Map", one-line promise ("One candidate. Many systems. Many copies. One business responsibility."), reference-model disclaimer chip.
2. **Signature arc strip** (the erasure story, works with motion off): a horizontal 5-beat summary — 1 candidate → {systems} systems → {copies} copies → {external} external transfers → **"Can you delete every copy?"** Numbers computed from the pack (`computePackSummary`), each beat an icon + number + label. This is static content, always visible, crawlable.
3. **Toolbar**: view switcher (5 P0 views) · business-model selector · risk-heat toggle · reset. Left-aligned chips, same style as assessment topic chips.
4. **Canvas region** (the map): React Flow canvas, ~70vh, with legend (bottom-left overlay) and boundary swim-groups. Right side: detail panel (empty state: "Click any system to see what it holds, who can access it and what to fix").
5. **Hotspot rail** ("Top risk hotspots — the canonical 7"): ranked cards 1–7, each = title + risk chip + one-line whatHappens + "Check this in Assessment →" (deep-link with bucket param). Clicking a card selects + centres that node on the canvas and opens its panel.
6. **How to read this map**: 3 short cards (boundaries, copies, external transfers) + legend recap.
7. **CTA band**: primary → `/assessment/recruitment?from=data-flow`, secondary → `/discovery`. Disclaimer sentence repeated.

## The 5 P0 views (all projections of one model)

| View | What changes | Default emphasis |
|---|---|---|
| Process journey (default) | Nodes grouped into 12 stage columns, left→right lifecycle order; stage headers with dpdpaNote on hover/expand | The story |
| Systems | Nodes grouped by boundary swim-lanes (Agency / Client / Vendor / Government / Public); stage grouping off | Inventory |
| Copy proliferation | Only copy-creating edges highlighted; others dimmed to 20%; running copy count badge; duplicate-sheet markers on edges | The aha |
| External sharing | Internal-only nodes dimmed; boundary-crossing edges solid-highlighted; external party count badge | Loss of control |
| Risk heat (toggle, combinable with any view) | Node border/badge driven by riskLevel; high/critical get warning icon; low fades | Prioritisation |

## Selection model

- Click node → right panel (NodeDetailPanel). Click edge → right panel (EdgeDetailPanel). Click hotspot card → node panel + canvas focus. Esc / ✕ closes. One panel at a time.
- Panel content per spec §15–16, four ownership concepts worded distinctly, risk chip with icon+label, actions, "Check this in Assessment →".

## First-load narrative (motion, reduced-motion-safe)

With motion allowed: stages reveal left→right (staggered ~120 ms), then copy badges pop, then external edges pulse once, then hotspot rail slides in. Total < 3 s, plays once. With `prefers-reduced-motion`: everything renders instantly; the signature arc strip carries the story instead. No looping animation anywhere on the canvas.
