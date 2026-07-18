# Assumptions & Open Questions — Recruitment Data Flow Map (Phase 0)

## Assumptions (proceeding on these; correct at Gate 1 if wrong)
1. **Layout**: default `@xyflow/react` layouting + hand-positioned nodes per view is acceptable for v1; no auto-layout lib (dagre/elkjs). The process-journey view is broadly linear, so manual positions are tractable.
2. **Node budget**: reference model targets ~40–60 nodes / ~80–120 edges total across all stages (not the spec's implied hundreds). Enough for the "so many places" moment; authorable and performant. Exact counts land at Gate 2.
3. **Business-model gating** applies at stage level only (stages 10–11 staffing/RPO) — not per-node/per-edge variants in v1.
4. **Reference metrics** on the landing preview derive from the config via a compute helper (systems/personas/external parties/copy events counted from the model) — never hand-typed numbers.
5. **DPDPA overlay** content comes from spec §27 plain-English table + Discovery item `obligations[]` wording; no section-number citations in the UI (consistent with existing site copy which references DPDP Rules 2025 at page footers).
6. **`/plan-design-review`** runs on the UX specs + a clickable-enough prototype (Gate 3), scored by the existing skill, threshold avg ≥ 8 (same bar as packs 6–12).
7. **Analytics**: wire `trackEvent` per pattern even though the gtag loader appears absent — pre-existing site-wide issue, out of scope here.
8. **No Hindi/multilingual** in v1 (site tools are EN; the 7-language surface is the Guide only).

## Open questions for Dilip (non-blocking; defaults stated)
- **Q1 — Sector rollout order after Recruitment**: spec's Phase-1 foundational set is CA Firms → Law Firms → Clinics. Default: decide after Recruitment ships and metrics arrive.
- **Q2 — "India's first interactive personal data flow maps" claim**: needs a competitive check before external marketing use. Default: internal/neutral copy until verified.
- **Q3 — Homepage teaser** (spec §"Homepage positioning"): default NOT in this build; revisit with the landing-page consistency pass already queued in memory.
- **Q4 — gtag loader absence** (see integration-risks #9): investigate as a separate small task? Default: yes, separate session.
