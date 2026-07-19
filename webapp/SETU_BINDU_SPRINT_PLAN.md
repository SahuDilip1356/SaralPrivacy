# Sprint Plan — Setu Guide Chatbot (Phase 1 MVP)

> **Spec:** `SETU_BINDU_CHATBOT_SPEC.md` v3.0 (final)
> **Team:** Dilip (product/review) + Claude Code (build) — solo-founder cadence
> **Sprint length:** ~1 week part-time each (assumption — adjust freely; the P0 ordering is the contract)
> **Branch:** `feat/setu-chatbot` off `main` · no direct commits to `main` · push after each green milestone (iCloud-path insurance)

**Sprint Goal (Phase 1):** A grounded, hardened, conversion-instrumented Setu chat live on saralprivacy.com behind a kill switch — with routing quality proven *before* any UI spend.

---

## Sprint 0 — "Prove the routing" (Gate 0 · 2–3 days)

**Goal:** the headless pipeline passes the golden set — kill or confirm the whole bet before UI/mascot budget.

| Priority | Item | Spec § | Est |
|----------|------|--------|-----|
| P0 | Branch `feat/setu-chatbot` off `main`; commit spec + this plan | — | 0.5 h |
| P0 | `lib/chat/site-routing.ts` — full typed route table + `isValidCitation` | §3 | 0.5 d |
| P0 | `scripts/build-chat-index.mjs` — fetch live HTML → strip → chunk (~500 tok / 80 overlap) → embed (`text-embedding-3-small` via OpenRouter) → `public/chat-index.json` | §4.1 | 1 d |
| P0 | `lib/chat/retrieve.ts` — in-memory cosine top-6, floor 0.72 | §4.2 | 0.5 d |
| P0 | `eval/chat-golden.json` ≥ 40 cases (schema §10.1) + `scripts/run-chat-eval.mjs` | §10.1 | 0.5 d |
| P0 | **Gate 0 run: ≥ 90% primary-URL · 0 off-site · < 2% wrong-cite** | §10.1 | 0.5 d |

**Exit:** pass → Sprint 1. Fail → tune floor/chunking/triggers and re-run. **Do not start the widget.**

---

## Sprint 1 — "Grounded API" (~1 week)

**Goal:** a streamed `/api/chat` that answers only from the site, refuses cleanly, and can't be abused.

| Priority | Item | Spec § | Est |
|----------|------|--------|-----|
| P0 | `app/api/chat/route.ts` — `streamText` + tools + two-phase protocol | §5.1–5.5 | 1.5 d |
| P0 | `lib/chat/system-prompt.md` + per-turn grounding block | §6 | 0.5 d |
| P0 | Guardrails: citation filter, `lib/chat/redact.ts`, input caps, history trim, `maxOutputTokens` | §5.6, §7 | 1 d |
| P0 | Hard rate cap (`chat_rate` counter, fail-closed 429) + origin/header checks + kill switch + error contract | §9.3, §9.5 | 1 d |
| P0 | `chat_feedback` collection + `/api/chat/feedback` + `/api/chat/health` | §9.1–9.2 | 0.5 d |
| P1 | Golden set re-run **through the full API path** | §10.1 | 0.5 d |

**Exit:** eval green end-to-end; `curl` abuse tests rejected; 429 verified at cap.

---

## Sprint 2 — "The widget" (~1 week)

**Goal:** Setu visible on prod behind the flag; conversion analytics live.

| Priority | Item | Spec § | Est |
|----------|------|--------|-----|
| P0 | `components/chat/*` — lazy `ChatPanel` (`next/dynamic`), launcher ≤ 10 KB, bubbles, citation cards, chips, disclaimer strip, feedback; §8.9 tokens/states incl. rate-limit + offline states | §8 | 2 d |
| P0 | Static Setu avatar exported from master → `public/chat/setu-avatar.webp`; CSS/framer pulse states | §8.7 | 0.5 d |
| P0 | A11y: focus trap, `aria-live="polite"`, keyboard path, reduced-motion parity | §8.6 | 0.5 d |
| P0 | Analytics events wired — **`chat_tool_cta` north-star** — mount in `app/layout.tsx` behind `NEXT_PUBLIC_CHAT_ENABLED` | §0.1, §9.4 | 0.5 d |
| P1 | `public/llms.txt` refresh 4 → 12 industries | §1.2 | 0.5 h |
| P1 | Page-aware greetings (`pageUrl` context) | §2.3 | 0.5 d |
| P2 (stretch) | Rive runtime spike (Phase 2 prep — no shipping dependency) | §8.4 | — |

**Exit:** §13 acceptance criteria pass on a Vercel preview (verify via Vercel MCP — previews 401 to curl) → enable flag on prod.

---

## Capacity & load

Solo-founder cadence: plan to ~70–80% and let P1/P2 slip first. Total P0 ≈ 11 days across 3 sprints; the P2 Rive spike is the designated cut.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gate 0 fails at 0.72 floor | Sprint 1 delayed | Budgeted tuning loop in Sprint 0 exit; floor/chunking/triggers are all adjustable without architecture change |
| First-token > 8 s with tool round-trips | Feels slow | `maxOutputTokens` 700, streaming, single retrieval step by default (`stepCountIs(4)` is a ceiling not a target) |
| Appwrite counter adds latency to every turn | p95 regression | ~10 s in-function cache on counter reads; write-behind increment |
| iCloud Desktop path corruption (memory: zeroed files before) | Lost work | Commit early, push to origin after every green milestone |
| Anonymous-traffic abuse spike | Sonnet spend | Fail-closed 429 + origin/header checks + kill switch (all Phase 1) |
| Widget regresses site LCP | SEO/UX hit | Launcher-only eager load ≤ 10 KB; panel `next/dynamic` |

## Definition of Done (every sprint)

- [ ] `next build` clean
- [ ] Eval/tests green for the sprint's scope
- [ ] Committed on `feat/setu-chatbot`, pushed to origin
- [ ] Spec cross-reference intact (no drift between code and §)
- [ ] Preview verified via Vercel MCP where applicable

## Key dates (relative — set start date when Sprint 0 begins)

| Milestone | When |
|-----------|------|
| Sprint 0 start / branch cut | Day 0 |
| **Gate 0 verdict** | Day 2–3 |
| Sprint 1 exit (hardened API) | ~Day 10 |
| Sprint 2 exit / flag-on decision | ~Day 17 |
| First conversion-metric review (`chat_tool_cta`) | flag-on + 14 days |
