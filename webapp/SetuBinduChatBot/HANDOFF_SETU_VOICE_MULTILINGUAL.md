# Handoff — Setu Phase 3: Multilingual + Voice

> **Written:** 2026-08-06, at the close of the MVP build session
> **For:** a fresh session picking up Setu's next phase
> **Prereq reading:** `SETU_BINDU_CHATBOT_SPEC.md` (v2.4, canonical) §11.1 · `SETU_CHARACTER_CANON.md` · `docs/Setu_Knowledge_Universe_RAG_Strategy.md`
> **Owner:** Dilip Sahu

---

## 1. Where Setu stands today (shipped state)

Setu is **live in production** as a grounded, English, text-only site guide.

| Layer | State |
|---|---|
| Widget | `components/chat/*` — launcher, panel, message rail, citation cards with the green ✓ "Verified page" badge, quick-reply chips, 👍/👎, proactive nudge policy. Mounted once in `app/layout.tsx`; hidden on `/admin` and `/report` |
| Character | New portrait at `public/setu-avatar.png`; squash-and-stretch motion in `SetuStage.tsx` (hop on greeting/thinking, breathe, nod, lean); `ThinkingIndicator.tsx` = animated dots, no text label |
| API | `app/api/chat/route.ts` — model from `CHAT_MODEL` (`lib/chat/system-prompt.ts`, currently `claude-sonnet-5`), two-phase stream (text, then `U+001E` + `ChatMeta` JSON) |
| Retrieval | **Pinecone `saralprivacy-setu`** primary (406 records, integrated `llama-text-embed-v2`, rerank `bge-reranker-v2-m3`, industry metadata filter) + local lexical index as automatic fallback |
| Knowledge | 406 chunks: Learn, FAQ, glossary, 96-control checklist, 12 industry guides, **12 data-flow packs** (stages + ranked hotspots), platform guides, 8 seed briefings + live Appwrite briefings on freshness intent |
| Quality gates | Golden set 70/70 = 100%; 56 tests; zero-hallucination refusal hard-gated; first token 1.7–2.4 s |
| Analytics | 8 `chat_*` events via `lib/analytics.ts`, verified firing on preview |

**Open from MVP (small):** the `chat_feedback` Appwrite collection is not yet created — schema is in spec §9.2; 👍/👎 degrades silently until it exists.

---

## 2. What Dilip asked for next

> "Setu answers in multiple languages, and I'd like to build a voice agent instead of only text — I believe ElevenLabs integration would work."

Two related but separable workstreams. **Multilingual is the prerequisite** — a Hindi voice reading English answers is worse than either alone.

---

## 3. ⚠️ Read this before designing the voice agent

Spec §11.1 contains a **deliberate exclusion** that this request touches directly. Do not silently overturn it; put it to Dilip.

**The settled position (spec v2.3, July 2026):**

> **Excluded — speech-to-speech agents** (Grok Voice, **ElevenLabs Conversational AI**, OpenAI Realtime): they do their own reasoning/turn-taking and would **bypass the strict-RAG boundary**. Not used.
>
> **Principle: voice is an I/O skin on the grounded text brain — never a replacement for it.**

**Why it matters concretely.** Setu's entire value is that he *cannot* invent an answer: retrieval happens before the model is called, the model streams text only, and every citation/action is server-built from an allowlist. A speech-to-speech agent owns its own dialogue loop — it decides when to answer and what to say from its own knowledge. Bolting one on would return a fluent, ungrounded DPDPA bot, which is precisely the product this build spent its whole life avoiding. The golden-set guarantee (100% routing, zero invented URLs) would not survive it.

**The reading that honours both the request and the boundary:**

```
user speech → ASR → text → [EXISTING grounded pipeline: Pinecone → orchestrate → claude-sonnet-5]
           → text answer → TTS → spoken reply
```

ElevenLabs is then used for **TTS only** (its Flash v2.5 model, ~75 ms streaming), *not* Conversational AI. The brain, grounding, citations, and refusals stay exactly as shipped. Same character, same guarantees, new mouth and ears.

**Two decisions for Dilip (do not assume):**

- **D8 — Voice architecture:** TTS/ASR skin over the grounded brain (recommended, preserves everything) **vs** ElevenLabs Conversational AI as a true speech-to-speech agent (fluent, but abandons strict grounding). If he chooses the latter knowing the trade-off, that is his call — record it as a decision that supersedes §11.1.
- **D9 — Vendor + data residency:** spec §11.1 currently prefers **Sarvam AI (Bulbul TTS / Saarika ASR, India-hosted)** as *primary* for Hindi/Hinglish and Indian-English, with ElevenLabs *secondary* for premium English. Rationale: SaralPrivacy sells Indian data-protection compliance; routing Indian users' voice to US servers is a story the brand has to be able to tell. Dilip named ElevenLabs — worth re-confirming with the residency point on the table. (Note: voice input is personal data in a way the current text widget deliberately avoids — see §5.)

---

## 4. Multilingual — what already exists and what's missing

**Already built for this (decision D1, MVP):**
- `lib/chat/strings.ts` — every user-facing widget string externalized behind `t(locale, key)`; `Locale = "en" | "hi"` already typed
- Canonical Hindi seeds already present, taken verbatim from Dilip's Hindi intro film (`SETU_CHARACTER_CANON.md` §4): सेतु — शांत पुल-निर्माता · बिंदु — सटीक चेकर · सीखें · उद्योग मूल्यांकन · व्यावहारिक उपकरण · "सेतु समझाता है। बिंदु पुष्टि करती है।"

**The real blocker — and it is a content problem, not a code one:**

> The 406-chunk corpus is **English only**. The site's Learn pages, industry guides and data-flow packs are English. If Setu answers in Hindi from English sources, every citation sends the user to a page they cannot read, and the answer↔source match — the thing the whole grounding architecture guarantees — quietly breaks.

Three honest options, in increasing cost and quality:

| Option | How | Cost | Risk |
|---|---|---|---|
| **A. Answer-language switch** | Retrieve from English corpus; instruct the model to answer in the user's language; cite English pages with an honest "this guide is in English" note | Low — prompt + locale plumbing | Cited pages unreadable to the user; weakest option, but ships in a day |
| **B. Translated corpus** | Translate the 406 chunks (or the Tier-1 subset) into Hindi, upsert to Pinecone under a `lang` metadata field, filter by locale at query time | Medium | Translation quality on legal text; needs review. **Pinecone side is easy** — `lang` is just another filterable field, and `multilingual-e5-large` is available as an integrated embedding model |
| **C. Translated site + corpus** | Hindi versions of the Learn pages themselves, then the corpus follows the site as it does today | High | Real content work; but it is the only option where citations actually help a Hindi speaker |

**Note:** the site already ships a 7-language Guide (`/white-paper`), so multilingual content is not unprecedented here — check `lib/data/guide-languages.ts` for the existing pattern before designing new machinery.

**Recommendation to put to Dilip:** B for Tier-1 Learn content + platform guides (the answers people actually need), with A as the interim for the long tail — and be explicit in the UI about which pages are English.

---

## 5. Privacy implications — do not skip this

This is a DPDPA product; the voice feature must survive its own audit.

- **Voice is personal data.** The shipped text widget deliberately stores **no transcripts** (D2 — only redacted failure turns). Audio raises the stakes: a voice recording is biometric-adjacent and identifiable in a way text is not. Decide *before building*: is audio ever persisted? (Recommended: **no** — stream, transcribe, discard.)
- **Consent.** Microphone access needs explicit opt-in, and the privacy notice + `/consent-preferences` must name the processor. `lib/data/privacy-vendors.ts` is the single source of truth for sub-processors — **a PR adding ElevenLabs or Sarvam must add the row in the same PR** (this is an existing project law).
- **Residency.** See D9. Sarvam is India-hosted; ElevenLabs is US/EU.
- **The existing PII guard still applies:** `lib/chat/redact.ts` runs on text; anything derived from ASR must pass through it too before any logging.

---

## 6. Suggested sequence for the fresh session

1. **Resolve D8 and D9 with Dilip first** — architecture and vendor drive everything downstream. Do not start coding until they are locked.
2. **Multilingual before voice.** Pick a corpus option (§4), get Setu answering correctly in Hindi text, verify with an extended golden set (add Hindi cases; one Hinglish case already passes today).
3. **TTS second** — output only. Stream audio synced to the `speaking` avatar state (the state machine already emits it). Off by default; a visible mute; obey `prefers-reduced-motion` as a mute signal too.
4. **ASR last** — input is where consent, PII and cost concentrate. Transcript enters the *same* grounded pipeline; ASR must never shortcut retrieval.
5. Preview → Dilip verifies → prod. Never self-merge.

---

## 7. Landmines this build hit (save yourself the hours)

- **⛔ The repo lives on an iCloud-synced Desktop path.** Git operations hang indefinitely, `tsc` never starts, and a stray `node_modules` copy drowned the sync queue for hours. **Workaround that worked:** `git clone` into `/private/tmp/` and do all git work there. **Real fix:** move the repo off iCloud — worth doing before the next phase.
- **Pinecone REST is snake_case** (`top_k`, `top_n`); the SDK is camelCase. A camelCase body 422s.
- **Integrated-index upserts cap at 96 records per request** (the embedding model's batch size), not 1000.
- **`temperature` support differs by model.** The claude-5 family rejects it outright; Haiku 4.5 accepts it. Leaving it unset is the only setting that survives a swap in either direction — don't add it.
- **Swapping `CHAT_MODEL` invalidates the red-team result.** Two of the five guard layers (instruction hierarchy, forged-authority refusal) are properties of the model, not of `guard.ts`. Re-run `scripts/redteam-chat.mts` against a preview before shipping any new model.
- **Node's `--experimental-strip-types`** can't do parameter properties or runtime type imports; the repo's bundler-style imports need `scripts/ts-resolve.mjs`.
- **`Sector` has `navLabel`, not `label`** — using `.label` silently rendered "undefined" into chunk titles.
- **Whole-word industry matching matters:** "ats" is a substring of "whatsapp", which mis-routed every WhatsApp question to recruitment.
- `main` now has `lib/data/data-flow/live-slugs.ts`, which overlaps `DATA_FLOW_SECTORS` in `lib/chat/site-routing.ts`. Both are guard-tested against the pack registry, but consider collapsing to one source.

---

## 8. Strategic context worth surfacing

`OPERATION_POUNCE_SPEC.md` carries a not-do list until Gate 3 that names the chatbot. Setu shipped anyway on Dilip's explicit and repeated direction — that is his call to make, but the next session should know the tension exists rather than discover it in a memory file mid-build. Voice + multilingual is a *larger* investment than the MVP was; worth one explicit conversation about sequencing against the revenue work before starting.
