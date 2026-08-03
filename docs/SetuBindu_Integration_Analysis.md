# Setu/Bindu → SaralPrivacy Integration — Deep Analysis

> **Status:** Analysis complete — pre-build decision doc
> **Branch:** `feat/setu-bindu-chatbot`
> **Inputs:** `webapp/SetuBinduChatBot/SETU_BINDU_CHATBOT_SPEC.md` (v2.3, canonical) · Motion Spec V2 · guided-discovery-agent research (Dilip, Aug 2026) · live repo audit (2026-08-03)
> **Owner:** Dilip Sahu

---

## TL;DR

- **Spec v2.3 survives contact with the repo intact** — every infrastructure assumption verified true today (`ai` v6.0.158, `@ai-sdk/anthropic`, framer-motion 12, Next 16.1.7, all 12 industry routes on disk, zero existing chat code). It is build-ready as written.
- **The guided-discovery research is additive, not contradictory** — its six operational layers (trigger policy, journey router, profiling schema, action registry, handoff packet, coaching loop) fill real gaps v2.3 leaves open. Fold them in as **spec v2.4**; nothing settled in v2.3 needs reopening.
- **Five decisions block the build** (below) — most importantly the refusal-logging vs no-transcripts tension, and the missing Character Bible V3 file. Everything else is sequenced and estimated.

---

## 1. Verified ground truth (repo audit 2026-08-03)

| Spec v2.3 assumption | Repo reality | Verdict |
|---|---|---|
| `ai` v6.0.158 + `@ai-sdk/anthropic` in prod | `ai ^6.0.158`, `@ai-sdk/anthropic ^3.0.69` in `webapp/package.json` | ✅ |
| framer-motion v12 installed | `^12.38.0` | ✅ |
| Next 16.1.7 / React 19.2.3 / Tailwind v4 | Exact match | ✅ |
| 12 industries at `app/industries/*` | All 12 slugs present incl. `fintech-nbfc`, `gyms-salons-spas` | ✅ |
| `/api/chat`, `lib/chat/*`, `components/chat/*` net-new | None exist — fully greenfield | ✅ |
| `public/llms.txt` stale at 4 industries | Confirmed: 4 industry links | ✅ (fix in-build as spec mandates) |
| Voice canon `setu_bindu_pro_dpdpa_character_bibleV3.md` | **NOT in the folder** | ⚠️ missing dependency |
| `eval/golden-questions.json` | **NOT in the folder** | ⚠️ must author fresh (spec §10 wants ≥40) |

Folder hygiene: `SETU_BINDU_CHATBOT_SPEC (1).md` / `(2).md` were byte-identical Finder duplicates — excluded from the branch copy (per the file-sync duplicates rule).

## 2. Verdict on the two documents

**SETU_BINDU_CHATBOT_SPEC.md v2.3 is the canonical build spec.** Motion Spec V2 and the V1/V2 prompts + JSONs are its archive/inputs. The discovery-agent research is a **product-behaviour overlay** that upgrades the bot from "grounded FAQ + navigation" to "guided discovery agent." The two agree on every hard boundary:

- Site-only knowledge, allowlisted URLs, zero invented links (both)
- One clarifying question at a time / progressive profiling (both)
- No contact details before value; consultation is the only contact-collecting journey, with explicit consent (both)
- Escalate legal opinions / active breaches / low confidence to humans (both)
- 12 canonical sectors as the industry vocabulary (both)
- Multilingual and voice **deferred** until the core journeys perform (spec §11.1 Phase 3; research §7 "only after these perform reliably")

No settled decision is reopened. Proceed by merging, not choosing.

## 3. Gap map — what the six operational layers add to v2.3

| # | Layer (research) | v2.3 today | Delta for v2.4 | Cost |
|---|---|---|---|---|
| 1 | **Trigger policy** | Launcher exists; fully passive. No proactive behaviour at all | New §: per-page proactive prompts (homepage 30–40s/50% scroll, industry pages, learn 60% scroll, tool-result pages), **1 prompt/session, ~7-day suppression after dismissal, permanent mute**, suppressed on `/privacy`, `/consent-preferences`, rights-request surfaces, never mid-tool-flow. Pure client-side (localStorage) — no backend | Small |
| 2 | **Journey router** | Intent→URL routing table (§3.1) but no named journeys | Name the 6 initial journeys (applicability · data discovery · where-to-begin · consent · notice · term-explainer) with entry/completion conditions; `journey_stage` drives which clarifier gets asked. Layer over the existing router, not a replacement | Small–medium |
| 3 | **Progressive profiling schema** | localStorage: `industry?`, `lastTopic`, `pagesShown[]` | Typed `ChatSessionState` (`lib/chat/state.ts`): intent, user_type, industry, business_niche, journey_stage, facts_confirmed, missing_details, answer_confidence, recommended_action, consent_to_contact. **Client-held, passed per request, never server-persisted** — preserves v2.3's no-transcript stance. Kills repeat-questioning | Small |
| 4 | **Action registry** | 3 read-only tools (`search_knowledge_base`, `list_routes_for_topic`, `suggest_tool`) | Add navigation actions: `start_discovery`, `start_assessment`, `start_notice_generator`, `request_consultation`. Phase 1 = **deep links with non-sensitive preselection** (e.g. industry). Only `request_consultation` touches contact data → explicit in-chat confirmation + consent, reuse existing contact/leads flow. Nuance: an assessment-start **action** may target `/assessment/{slug}` entry, but quiz URLs stay banned as **citations** (they're `noindex`) | Medium |
| 5 | **Human-handoff packet** | Escalation = link to `/contact` | Structured packet (summary, industry, intent, sources shown, unresolved question, consent flag) attached to the consultation submission. Phase 2 | Small |
| 6 | **Coaching loop** | Golden set ≥40, ~20 sampled reviews/week | Add: refusal/negative-feedback review queue, source-gap detection ("asked but no page covers it" → content backlog), monthly golden-set expansion. Depends on Decision D2 | Small + ops cadence |

Also from the research, worth adopting verbatim: **page-contextual opening chips** (industry pages swap the 3 default chips for sector-specific ones — cheap, high-perceived-intelligence) and the **authority hierarchy** (Learn > industry guidance > FAQ/glossary > tool blurbs > briefings/blog), which v2.3's tier system already encodes — just state it explicitly in the prompt.

## 4. Decisions needed (D1–D5) — the only open items

| # | Decision | Recommendation |
|---|---|---|
| **D1 Multilingual** | Prompt brief says "should be multilingual"; both spec §11.1 and the research defer it post-MVP | Build **i18n-ready, ship English**: externalize every widget string + prompt template from day one (one strings file, one prompt-per-locale slot), Hindi/Hinglish as the first fast-follow. Retrieval corpus is English-only today — a Hindi bot without Hindi source pages would break grounding, which is the product's spine |
| **D2 Refusal logging vs "no transcripts"** | v2.3: no server-side transcripts. Coaching loop needs to see what failed | Log **only** refusal / low-confidence / 👎 turns: redacted question text + pageUrl + reason into `chat_feedback` (schema already planned). Not full transcripts. This is the minimum signal the coaching loop can run on |
| **D3 Model** | Spec locks `claude-sonnet-4-6` (July decision) | Update to current **`claude-sonnet-5`** at build time; same AI SDK call shape, no other change |
| **D4 Result-page triggers** | Research wants proactive help on Discovery/Assessment result pages | Yes — and note the synergy: the analytics thread found content pages dead-end with zero in-body tool links and `/discovery` is starved. The chatbot **is** a new referral path into the tools; `chat_tool_cta` feeds the starved Phase-B denominator. Wire and verify these events before merge (content-trust law) |
| **D5 Character Bible V3** | Referenced as voice canon; file absent from the folder | Drop `setu_bindu_pro_dpdpa_character_bibleV3.md` into `webapp/SetuBinduChatBot/` — or confirm the condensed voice rules in spec §6 + system-prompt-v2 suffice for MVP |

## 5. Stale artifacts (superseded — do not build from these)

- `site-routing.json` — 4 industries; missing `/discovery`, `/tools/dpdpa-privacy-notice-generator`, `/compliance-checklist`, `/rights`, 8 industry routes. **Superseded by typed `lib/chat/site-routing.ts`** (spec §3 already chose TS so dead links fail at compile/test time). Keep JSON as archive only.
- `tool-definitions.json` — 4-industry enum, 5-tool shape from V1; spec §5.2's 3-tool set + action registry (layer 4 above) replaces it.
- `system-prompt.md` (V1) — archive.
- `system-prompt-v2.md` — strict single-JSON output **contradicts** spec §5.5's two-phase streaming (stream Setu text, emit structured meta on finish). Rewrite the production prompt to the two-phase contract during the build.
- `public/llms.txt` — refresh 4 → 12 industries in the same commit as the index build (spec §11 Phase 1 already mandates).

## 6. Build sequence (sequence + tentative hours — no calendar; Dilip owns scheduling)

**Phase 0 — Spec v2.4 merge + design gate (~4h)**
1. Resolve D1–D5.
2. Fold the six layers into SETU_BINDU_CHATBOT_SPEC.md → v2.4 (trigger policy §, journey router §, `ChatSessionState`, action registry, handoff packet, coaching loop cadence).
3. `/plan-design-review` on the widget UI — spec §10 gates build on avg ≥ 8 (§8.9 tokens already pre-answer the contrast findings: navy-on-green CTA, teal-700 links).

**Phase 1 — MVP (~35–45h, each step independently verifiable)**
1. `lib/chat/site-routing.ts` — typed routes, all 12 industries, `isValidCitation()` + unit test that every URL resolves (≈4h)
2. `scripts/build-chat-index.mjs` → `public/chat-index.json` (learn + FAQ + glossary + checklist + 12 industries + tool blurbs; ~200–320 chunks) (≈5h)
3. `app/api/chat/route.ts` — streamText + 3 tools + two-phase protocol + server-side citation filtering (≈6h)
4. `lib/chat/state.ts` + `redact.ts` (PII patterns from spec §7) (≈3h)
5. `components/chat/*` — launcher, panel, bubbles, citation cards, chips, disclaimer strip, static Setu avatar + CSS states (≈10h)
6. Trigger policy client module (layer 1) (≈3h)
7. `chat_feedback` collection + `/api/chat/feedback` + rate limits (spec §9.3 MVP tier) (≈3h)
8. `llms.txt` 4→12 refresh (≈1h)
9. Golden set ≥40 (one per industry) + eval runner; targets: ≥90% primary-URL routing, wrong-citation <2%, off-site hallucination **= 0** (≈5h)
10. A11y + reduced-motion pass, analytics events wired **and verified firing** (≈3h)

**Phase 2 — Guided-agent polish (~18–24h):** journey router + contextual chips · action deep-links with preselection · handoff packet · Rive `.riv` states (needs design asset) · Appwrite rate-limit hardening · analytics dashboard.

**Phase 3 — Scale (unestimated until Phase 1 data):** briefings/blog freshness index · Hindi/Hinglish · Sarvam TTS/ASR (consent-gated, India-hosted per spec §11.1) · Pinecone only if the corpus outgrows the in-repo index.

**Ship law:** every phase lands via preview deployment → Dilip verifies → explicit confirmation → merge. No exceptions.

## 7. Success metrics (merged)

Primary: **guided-value completion** — grounded answer AND (confirmed helpful OR opened a cited source OR started a tool). Supporting: supported-answer rate · citation correctness (<2% wrong) · invented URLs (**0**, hard) · clarification abandonment · `chat_link_clicked` CTR · Discovery/Assessment/Notice starts from chat (feeds the starved Phase-B gate) · handoff rate + packet quality · repeat-question rate · 👎 by topic · redaction incidents · first-token <8s, p95 <12s.
