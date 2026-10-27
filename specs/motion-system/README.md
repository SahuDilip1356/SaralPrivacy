# SaralPrivacy motion system — start here

The reference for adding, changing or removing any animation on saralprivacy.com.
Pick one page, do its tasks, tick them off.

| File | Read it for |
|---|---|
| [intent.md](./intent.md) | Why we're doing this, goals G1–G7, what's out of scope, how to roll back |
| [spec.md](./spec.md) | What each page must do: AC1–AC100, timing tokens, markers, open questions |
| [plan.md](./plan.md) | How: tasks T1–T52 with files, dependencies and a check command each |
| baseline.md | Performance baseline (created by T3) |

**Related**
- House rules and build recipes: the `sd-web-design` skill (`rules/guardrails.md`, `recipes/`, `catalog/components.md`).
- Why each page gets what it gets: the [Motion Catalogue](https://claude.ai/artifact/EpWV1arVKDhhWoAAkwySBw).

## The eight rules (spec AC1–AC18)

1. **Explain.** Motion shows a sequence, a location, a change or a confirmation. Otherwise cut it.
2. **Once, then still.** Nothing loops on its own.
3. **Don't follow the visitor.** No cursor-following effects.
4. **Words and lines, never letters.** 7 languages.
5. **Still zones.** Consent, personal-data forms, legal pages, statute text, ₹ amounts and errors never move.
6. **Tap first.** Nothing is hover-only.
7. **Complete at rest.** The server HTML is the final state; opacity never drops below 0.6.
8. **Light.** At most 60 KB of motion JS per page; the shared kit together under 15 KB. One component per pattern.

## Before the first page

| Order | Task | What | Blocked by |
|---|---|---|---|
| 1 | T1, T2 | The motion lint and the route audit. Every later task's check uses them | none |
| 2 | T3 | Performance baseline | none |
| 3 | T4, T5 | Trust fixes: storage location, media reach, learn content, counts | Q3, Q4 (Dilip) for T4 |
| 4 | T6, T7, T8 | Stop today's looping effects | T1 |
| 5 | T9 → T10, T11, T12, T51 → T13 | Build the shared kit and its review gallery | T1 |

## Page picker

Pick a row whose "needs" tasks are done. Then follow "How to run one page" in plan.md.

| Page | Routes | Tasks | Spec | Needs | Status |
|---|---|---|---|---|---|
| Home | `/` | T14 (T50 optional) | AC20–AC24, AC94 | T7, T10, T11 | todo |
| Discovery | `/discovery` | T15, T16 | AC25–AC31 | T8, T11, T12, T51 | todo |
| Assessment | `/assessment` | T17 | AC32–AC36 | T10, T11, T12 | todo |
| Sector scans ×12 | `/assessment/{sector}` | T18 → T19, T20, T21 | AC37–AC41 | T11, T17 | todo |
| Notice generator | `/tools/dpdpa-privacy-notice-generator` | T22, T23 | AC42–AC48 | T8, T9, T11, T12 | todo |
| Data mapping hub | `/data-mapping` | T24 | AC49–AC51 | T9, T10 | todo |
| Data-flow maps ×12 (pilot: clinics) | `/industries/{sector}/data-flow` | T25 → T26 → T27; T28; T29 | AC52–AC62 | T2, T10, T12, T51 | todo |
| Penalties | `/penalty-calculator` | T30 | AC63–AC64 | T10 | todo |
| Templates, white paper, checklist | `/resources`, `/white-paper`, `/compliance-checklist` | T31 | AC65–AC67 | T9, T12, T51 | todo |
| Reading progress | learn topics, Act, Rules, articles | T32 | AC69 | T10 | todo |
| Learn hub, Act, Rules | `/learn`, `/learn/dpdp-act-2023`, `/learn/dpdp-rules-2025-…` | T33 | AC68, AC79 | T10, T32 | todo |
| Learn topics ×12 | `/learn/{topic}` | T34 → T35, T36 | AC70–AC78 | T5, T9, T12 | todo |
| DPDPA guide ×7 | `/guides/dpdpa-guide-*.html` | T37 → T38 → T52 → T39 | AC80–AC82 | T10; Q2 for T39 | todo |
| Glossary | `/glossary` | T40 | AC83–AC84 | T12 | todo |
| FAQ | `/faq` (+ home preview) | T41 | AC85 | T12 | todo |
| Industry pages ×12 | `/industries/{sector}` | T42 → T43, T44 | AC86–AC88 | T9, T10, T12 | todo |
| Briefings hub | `/briefings` | T45 | AC89–AC91 | T6, T9, T12 | todo |
| Articles and blog | `/briefings/{slug}`, `/blog`, `/blog/{slug}` | T46 | AC90, AC92 | T12, T32 | todo |
| About, Contact | `/about`, `/contact` | T47 | AC93 | T10, T11 | todo |
| Media | `/media`, `/media/coverage`, `/media/press-wall` | T48 | AC95 | T4, T9 | todo |
| Legal | `/privacy`, `/terms`, `/rights`, `/consent-preferences`, `/unsubscribe` | T49 | AC96 | T9 | todo |

**Suggested first pages after the kit**
1. Data-flow maps (clinics pilot): the most explanatory pages, and they fix today's hidden-at-rest content.
2. Discovery.
3. Home.

## Tier 1 tasks (Dilip reviews before merge)

These touch consent, personal-data forms or legal text:
- T4: Privacy Notice and media figures
- T17: assessment start card
- T31: lead forms
- T47: contact form
- T49: legal pages

## Keeping this honest

- When a page ships:
  1. Set `- status: done` on its tasks in plan.md.
  2. Change its row here to `done`.
  3. Update `motion-manifest.json`.
- If the build has to differ from spec.md, change spec.md in the same PR.
- Re-check the chain after editing any file here:
  `python3 ~/.claude/skills/spec-chain/scripts/validate_chain.py specs/motion-system/`
- When an assumption (A1–A6) is proven or broken, write the result under it in intent.md.
