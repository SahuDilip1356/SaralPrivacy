# QA Report — Recruitment Data Flow Map (Gate 5)

QA (adversarial) role · 2026-07-19 · Browser-verified on the local dev server + build/test gates.

## Functional
| Test | Result |
|---|---|
| Route `/industries/recruitment-agencies/data-flow` renders (200) | ✅ |
| View switch: process / systems / copy-spread / external | ✅ (verified process, copy-spread, systems; copy badges appear in copy view — e.g. ATS "5 copies") |
| Risk-heat toggle | ✅ (button turns red, aria-pressed toggles) |
| DPDPA overlay toggle | ✅ (aria-pressed=true → 10 stage obligation annotations render; disabled in Systems view) |
| Business-model selector | ✅ (permanent 10 stages/24 systems → staffing 12 stages/30 systems; aria-live announces) |
| Node click → detail panel | ✅ (Recruiter WhatsApp: chips, "What it holds", access personas, "No retention rule" flag, risk why+fix, assessment CTA) |
| Hotspot rail: 7 cards, correct bucket deep-links | ✅ (candidate_document, ats_tool_access, client_sharing, ats_tool_access, candidate_document, retention_rights, candidate_document) |
| Assessment deep-link banner (`?bucket=client_sharing`) | ✅ ("You're checking: Client sharing") |
| Landing preview on industry page + CTA | ✅ (server-rendered; "Explore the data flow map" → /data-flow) |
| Sitemap entry | ✅ (present in /sitemap.xml) |

## Content completeness (automated — 8/8 tests)
Schema parse ✅ · referential integrity (no orphans, boundary consistency, no drift) ✅ · §F minimums (31 nodes ≥28, 49 edges ≥40, 39 copies ≥12, 27 external ≥10) ✅ · 7 hotspots ✅ · shadow-IT set present + high/critical + why/action ✅ · business-model projection intact for all 4 models ✅ · discovery wording alignment (24 refs, all real niche items) ✅ · computed summary ✅.

## Accessibility
| Test | Result |
|---|---|
| Canvas nodes keyboard-focusable | ✅ (tabindex=0, focus received) |
| Node aria-labels | ✅ ("Candidate, person, Candidate, low risk") |
| Focus ring visible | ✅ (teal ring on focus/selection) |
| Toolbar is `role=toolbar`, buttons have aria-pressed | ✅ |
| aria-live announces model changes | ✅ |
| Risk never colour-only | ✅ (icon + text label on every risk chip: AlertTriangle/Info/CheckCircle2) |
| Detail panel `role=dialog` (non-modal — page stays operable) | ✅ |
| Reduced motion | ✅ by construction — no looping/scroll-linked animation; only one-shot CSS `transition` hovers + `sp-line-flow` (already `prefers-reduced-motion`-guarded). Signature arc is static content. |

## Mobile (375×812)
| Test | Result |
|---|---|
| Graph canvas NOT mounted | ✅ (0 `.react-flow` instances) |
| No horizontal overflow | ✅ (docWidth == winWidth == 375) |
| Stage journey: collapsible cards + per-stage risk/copy counts | ✅ (10 `<details>` for permanent) |
| System row → bottom sheet | ✅ (sheet opens with node detail + assessment CTA) |
| Arc strip wraps 2×2 | ✅ |

## Performance
| Test | Result |
|---|---|
| Canvas lazy-loaded (`next/dynamic`, ssr:false) | ✅ (skeleton "Loading the map…" shows before chunk) |
| Node budget | ✅ (31 nodes / 49 edges — trivial for React Flow) |
| Both pages prerender static (○) | ✅ (`next build` — no client-boundary leak into parent industry page) |
| SEO content in server HTML | ✅ (arc, hotspots, "delete every copy" present in curl, no JS) |

## Defects
**None blocking.** Minor notes (non-blocking, logged for later): the browser-pane screenshot scroll is quirky on this page (tooling artifact, not a page bug — verified via read_page/JS instead); site-wide gtag loader absence (pre-existing, affects all `trackEvent` calls, out of scope).
