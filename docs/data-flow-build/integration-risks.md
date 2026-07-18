# Integration Risks — Recruitment Data Flow Map (Phase 0)

Ranked. Each risk has an owner phase and mitigation.

1. **Content authoring is the schedule risk, not code.** 12 stages × nodes/edges/personas/obligations/recommendations ≈ 1,500–2,000 lines of config where every edge needs a purpose and classification. → Start Phase 1 first; UI overlaps only after Gate 2. Completeness tests (no orphan nodes/edges, every external edge classified, every high-risk node has ≥1 action) are the guardrail.
2. **React Flow accessibility + mobile.** Canvas interactions are not keyboard-accessible by default; a dense graph is unusable at 375px. → Mobile is a separate `MobileFlowView` (tabs + vertical journey + bottom sheets), graph never rendered on mobile; desktop canvas gets `nodesFocusable`, aria labels, visible focus; budgeted explicitly in Gate 5.
3. **Bundle/perf.** `@xyflow/react` + 100+ node config on a marketing-adjacent page. → `next/dynamic` lazy canvas (no SSR for the canvas itself), keep page shell + SEO text server-rendered, node-count budget per view, don't mount hidden views.
4. **Claims discipline (DPDPA product credibility).** Exposure ≠ compliance score; reference metrics ≠ user findings; no invented statutory retention periods; no GDPR "sensitive data" tier language; "India's first" only after verification. → Privacy Reviewer gate (Gate 5) with veto; wording locks in the orchestrator prompt.
5. **Parent page regression.** `/industries/recruitment-agencies` is an indexed, statically-rendered SEO page. A client-boundary leak via the preview would degrade it. → `DataFlowPreview` is server-safe (no trackEvent, plain Links); verify static rendering in `next build` output.
6. **Config/pack drift.** Pack bucket keys are plain strings; a typo in `assessmentLink.bucket` won't fail typecheck naturally. → Literal-union type derived from the pack import; build fails on drift.
7. **Design-system fragmentation.** The spec's radial "signature visual identity" temptation vs the 12-hue ceiling and navy/teal idiom. → Constraint locked in orchestrator prompt; `/plan-design-review` ≥8 gate before UI code.
8. **`<details>`/bottom-sheet interaction bugs on iOS Safari.** → Use `onToggle` not `onClick`, don't control `open`; test 375×812 in Gate 5.
9. **Analytics may be a no-op.** No gtag.js loader found in `app/layout.tsx`; `trackEvent` guards on `window.gtag`. → Flag to Dilip (pre-existing, affects all tools, out of this build's scope); events still wired per pattern so they light up when the loader is fixed.
10. **Nested-root foot-guns.** Builds run in `webapp/`; iCloud can zero files mid-session (detect via `tr -d '\000' | wc -c`); duplicate "name 2" files corrupt .git. → Known playbooks in memory; `git status --short webapp/` before push.
