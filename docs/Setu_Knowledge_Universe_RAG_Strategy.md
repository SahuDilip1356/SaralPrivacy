# Setu — Knowledge Universe & RAG Strategy

> **Status:** Strategy for Dilip's review — precedes further build
> **Branch:** `feat/setu-bindu-chatbot` · complements spec v2.4 and `SetuBindu_Integration_Analysis.md`
> **Method:** full repo content census (2026-08-03), no external sources
> **Question answered:** What does Setu actually know, and what architecture makes it *optimally* intelligent rather than merely grounded?

---

## TL;DR

- **SaralPrivacy's knowledge universe is ~230k+ words of proprietary DPDPA content — and the majority is *structured data*, not prose.** A pure text-RAG would flatten the most valuable 80% (data-flow packs, discovery taxonomy, assessment packs) into chunks and lose exactly what makes them precise.
- **Therefore: a three-plane architecture.** Plane 1 = classic RAG over ~48k words of canonical prose (validates the spec's in-repo index — no Pinecone needed). Plane 2 = **typed lookup tools over the structured packs** — answers drawn from typed data cannot hallucinate. Plane 3 = freshness (briefings/blog from Appwrite, date-stamped, never overriding canon).
- **This is the moat none of the five benchmarks have.** Fin/Zendesk/Ada retrieve documents; Setu can *query the product itself* — "what data does a pharmacy handle at dispensing?" is answered from the same typed pack that renders the live data-flow map, byte-identical to what the page shows.

---

## 1. The knowledge universe — full census (repo, 2026-08-03)

### Plane 1 — Canonical prose (embeddable, citation-grade)

| Source | Where it lives | Size | Authority |
|---|---|---|---|
| 13 Learn topics | `app/learn/[topic]/page.tsx` → typed `learnContent` record | ~10.9k words | Tier 1 |
| DPDP Act 2023 page | `app/learn/dpdp-act-2023/` | ~1.6k | Tier 1 |
| DPDP Rules 2025 guide | `app/learn/dpdp-rules-2025-plain-english-guide/` | ~5.3k | Tier 1 |
| 12 industry guides | `app/industries/*/page.tsx` (~1.5–1.6k each) | ~18.9k | Tier 2 |
| FAQ (15 Q&As) | `lib/data/faqs.ts` | ~1.8k | Tier 1 |
| Glossary (51 terms, with section refs) | `components/glossary/glossaryData.ts` | ~3.7k | Tier 1 |
| Compliance checklist (96 controls) | `lib/data/compliance-checklist.ts` | ~5.0k | Tier 1 |
| Regulatory context block | `public/llms-full.txt` | ~0.5k | static context |
| Tool blurbs | `lib/chat/site-routing.ts` summaries | ~0.3k | Tier 3 |

**≈ 48k words ≈ 64k tokens → ~180–280 section chunks → ~2 MB index.** The spec's in-repo estimate is confirmed by measurement. Pinecone/pgvector would be architecture for a corpus we don't have; the whole thing fits in memory and embeds for under a cent.

**Critical advantage: content-as-data.** Learn topics, FAQs, glossary, and checklist are *typed TypeScript objects*, not HTML. The index build script **imports the modules** and serializes — no scraping, no parsing drift, deterministic chunks with clean `url` + section metadata. Chunk by semantic section (the content's own headings), not blind 500-token windows.

### Plane 2 — Structured product data (tool-queried, hallucination-proof)

| Source | Shape | Size | What Setu can answer with it |
|---|---|---|---|
| **Data-flow packs** (10 live, #11 fintech in build) | `lib/data/data-flow/*` — typed stages, systems, data items, risk hotspots, rights & incident scenarios per business model | **~184k words / 1.6 MB** | "Where does patient data travel in a clinic?" · "What are the risk hotspots for a CA firm?" — answered from the *same object that renders the live map*, then deep-link `/data-mapping` |
| **Discovery taxonomy** | `lib/discovery/data.generated.ts` — 23 categories · **276 niches** · 4,771 item rows · 182 item defs · 18 risk tags | ~7.1k words dense | "I run a cloud kitchen — what personal data do I likely hold?" → niche match → exact item list → deep-link `/discovery` preselected |
| **Assessment packs** (12 sectors) | `lib/data/industry-assessment/packs/*` — questions, buckets, score caps, verdicts | ~43k words | "What does the CA assessment check?" → real dimensions, then hand off to `/assessment` — never re-run the quiz in chat |
| Notice-pack engine | `lib/notice-pack/*` | ~5.4k | "What will the notice generator ask me?" → the actual 8 steps |
| Canonical constants | `sectors.ts` (sector labels SoT) · `privacy-vendors.ts` (DPO + 7 sub-processors) · penalty caps | small | Exact, current, single-source answers |

**This plane must NOT be embedded as text.** Chunking a typed pack throws away its structure and invites paraphrase drift. Expose it as **read-only lookup tools** (§3) whose outputs are formatted deterministically — the model narrates data it was handed, it never recalls it.

### Plane 3 — Freshness (dynamic, date-stamped)

| Source | Where | Notes |
|---|---|---|
| Daily briefings | Appwrite `briefings` collection | grows daily; date-stamped; enforcement/news questions |
| Blog posts | Appwrite `blog_posts` | long-form, dated |

Phase 3 as the spec already sequences. Retrieved via Appwrite queries at answer time (no embedding needed initially — recency + keyword is the right ranking for "what changed?"). **Hard rule preserved: Tier 1 beats Tier 4 — a briefing never overrides a Learn page.**

### What Setu will *never* know (the edges are a feature)

Case law and court decisions · other countries' laws (GDPR comparisons beyond what Learn pages state) · legal advice for specific facts · anything not published on saralprivacy.com. Below the similarity floor or outside the allowlist → refusal + FAQ/Contact. A guide who knows the edges of their museum is *more* trustworthy, not less.

---

## 2. Why this beats a plain RAG bot

A single-index RAG treats all knowledge as undifferentiated text. Measured against this corpus, that design:

1. **Wastes the structure** — 184k words of data-flow packs become fuzzy paraphrase instead of exact stage/system/hotspot answers.
2. **Can't preselect** — the discovery taxonomy's 276 niches are how Setu maps "I run a boutique hotel" → the exact niche → `/discovery` with context, the guided-value completion the whole product strategy aims at.
3. **Blurs authority** — statutory framing (penalty caps, section refs) must come from constants and glossary entries with section numbers, not from whichever chunk scored 0.74.

The three-plane split gives each knowledge type its correct retrieval physics: **prose → similarity · structure → typed query · news → recency.**

---

## 3. Architecture

### 3.1 Plane 1 — RAG pipeline (MVP)

- **Extraction:** `scripts/build-chat-index.mjs` imports content modules directly (no crawling). Emits chunks `{id, url, title, tier, industry?, topicTags, sectionHeading, lastReviewed, text}`.
- **Chunking:** semantic sections from the content's own structure; merge tiny sections; ~350–600 tokens typical.
- **Embeddings:** `text-embedding-3-small` via OpenRouter (already wired); whole corpus <$0.01; rebuilt on every content deploy (content is in git → index is reproducible build output).
- **Retrieval:** **hybrid** — dense cosine top-k **+ keyword/BM25-lite boost** for statutory tokens ("Section 33", "SDF", "consent manager"). Legal vocabulary is exact; pure dense retrieval is weakest precisely on rare exact terms. Small corpus makes hybrid essentially free.
- **Filters/boosts:** `industry` slot boosts that sector's chunks; current `pageUrl` boosts the page the user is reading.
- **Confidence:** top score + margin + tier coverage → `high | low`; low → refuse (floor ~0.72, tuned on golden set).

### 3.2 Plane 2 — structured knowledge tools (staged)

Read-only, typed, allowlisted — additions to spec §5.2:

```ts
lookup_glossary(term) → { term, definition, sectionRef, url } | null          // MVP (trivial, data exists)
lookup_checklist(topic|controlId) → ChecklistControl[]                        // MVP-easy
match_business_niche(description) → { category, niche, topDataItems, riskTags, discoveryUrl }  // Phase 2
query_data_flow(sector, stage?|hotspots?) → typed pack slice + /data-mapping link              // Phase 2
describe_assessment(sector) → { dimensions, buckets, entryUrl }                                // Phase 2
```

Rules: outputs rendered from data, never from model memory; every returned URL passes `isValidCitation()`; pack access is read-only imports of the same modules the pages render — **zero content duplication, zero sync problem.**

### 3.3 Plane 3 — freshness tool (Phase 3)

`search_briefings(query, since?) → dated summaries + /briefings links`, Appwrite-backed, always labeled with dates, never cited as legal authority.

### 3.4 Orchestration brain (already in spec v2.4 — now knowledge-aware)

Journeys J1–J6 select the *plane*, not just the page: J6 (term meaning) → glossary tool first; J2 (my data) → niche match + data-flow; J1/J4 (law questions) → Plane 1 RAG; "what's new" → Plane 3. `ChatSessionState.industry` propagates into every plane as a filter. Each turn appends an **audit record** `{plane, sources, scores, journey, action}` (client-side/dev-logged in MVP) — the Zendesk-style "why this source" trail that makes coaching-loop reviews diagnosable.

---

## 4. Benchmarks → concrete SaralPrivacy mechanisms

| Benchmark learning | Setu implementation |
|---|---|
| **Fin** — controlled knowledge sources, freshness, measurable outcomes | The three-plane census above *is* the source-management dashboard, in git. `lastReviewed` on every chunk; quarterly regulatory-context refresh; "Did this help?" = 👍/👎 + guided-value completion metric |
| **Zendesk** — adaptive reasoning, progressive parameters, audit trail | One-question slot filling via journeys (§3.2 spec) + facts_confirmed never re-asked; per-turn audit record (§3.4); knowledge answers (Plane 1) formally separated from procedures (Plane 2 tools) |
| **Ada** — playbooks, simulation, improvement loop, structured handoff | Journeys = playbooks with entry/completion; **golden set ≥40 run pre-release = conversation simulation**; coaching loop classifies failures as retrieval/routing/source gaps; §9.5 handoff packet |
| **Agentforce** — topics vs actions split, guardrails, confirmation | Topic allowlist = ROUTES/tiers; action allowlist = registry with per-action guards; consultation requires explicit confirm + consent; prompt-injection isolation + retrieved-text-is-data already in spec §7 |
| **Klarna** — instant, multilingual path, human always visible | First token <8s target; strings externalized for Hindi/Hinglish fast-follow; persistent Contact/human option in refusals and escalations; anonymous guidance vs (future) authenticated assistance kept distinct |

---

## 5. Intelligence ladder (maps to existing phases — no re-plan)

| Level | Capability | Knowledge planes | Phase |
|---|---|---|---|
| **L0 Grounded navigator** | Cited answers + right page + refusal at edges | Plane 1 + glossary/checklist tools | **Phase 1 (MVP)** |
| **L1 Sector-aware advisor** | Industry-filtered answers, niche matching, data-flow facts, preselected tool starts | + Plane 2 full | Phase 2 |
| **L2 Guided orchestrator** | Journey completion tracking, handoff packets, coaching loop closing gaps monthly | same + audit maturity | Phase 2–3 |
| **L3 Fresh & multilingual** | "What changed this week?", Hindi/Hinglish, optional voice I/O | + Plane 3 | Phase 3 |

**Build-plan delta vs spec v2.4 (only change this strategy introduces):** Phase 1 gains `lookup_glossary` + `lookup_checklist` (both trivial — data already typed); `match_business_niche`, `query_data_flow`, `describe_assessment` are named Phase 2 deliverables. Everything else in the committed plan stands.

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| TSX extraction misses copy edits in odd components | Golden set asserts expected URL per topic; index build fails loudly on missing module keys |
| Hybrid retrieval complexity creep | Keyword boost is a scoring add-on, not a second engine; ship dense-only if eval shows floor+tiers suffice |
| Plane 2 tools tempt scope growth ("run my assessment in chat") | Hard rule stands: tools *describe and deep-link*; quizzes/tools execute only on their own pages |
| Data-flow pack schema evolves (active workstream) | Chat imports the same schemas/validators the maps use; pack tests already guard shape |
| Briefings later pollute canon | Tier conflict rule enforced in prompt AND in citation ranker (Tier 1 beats Tier 4) |
