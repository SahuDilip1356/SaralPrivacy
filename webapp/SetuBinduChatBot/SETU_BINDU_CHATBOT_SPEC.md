# Setu & Bindu — Site-Guide Chatbot for SaralPrivacy

> **Version:** 2.4 (canonical · build-ready · decisions locked 2026-08-03)  
> **Status:** Engineering handoff — build in progress on `feat/setu-bindu-chatbot`  
> **Owner:** SaralPrivacy (Dilip Sahu)  
> **Voice canon:** `setu_bindu_pro_dpdpa_character_bibleV3.md`  
> **Audience:** internal engineering  
> **App root:** `DPDPA Daily Brief/webapp/webapp/` · Next.js 16.1.7 · React 19.2.3 · Tailwind v4  
> **Hard boundary:** Answers and links **only** from SaralPrivacy content that exists on this site. Nothing beyond.

---

## 0. What this is

A **first-party, motion-graphic, character-voiced site guide** on saralprivacy.com. It:

1. Answers DPDPA questions in plain English  
2. Grounds every claim in SaralPrivacy’s own pages  
3. Navigates the visitor to the right Learn / Industry / Tool page  
4. Never invents law, penalties, URLs, or off-site advice  

**Analogy:** a museum guide with a tablet — only talks about exhibits in *this* museum, and walks visitors to the correct gallery.

**Setu is the chatbot** (locked 2026-08-03). One voice: Setu explains and internalises the clarifying reframe ("You might be wondering…"). Bindu stays in the lore / Character Bible and may return as an optional short text-bubble clarifier in Phase 2+ — never a second competing chatbot.

### What changed vs v1.0 draft

| # | v1.0 draft | This spec (v2.2) | Why |
|---|------------|------------------|-----|
| 1 | 4 industry guides | **12 industries** (verified `app/industries/*`) | Site shipped more sectors; `llms.txt` was stale |
| 2 | `widget.js` + CORS | **First-party** component in `app/layout.tsx`, same-origin `/api/chat` | Bot is site-only; embed machinery is overhead |
| 3 | External vector DB | **In-repo embedded index** (~200–320 chunks, ~2 MB) | Corpus is small; Pinecone = Phase 3 scale path |
| 4 | TBD LLM stack | **Reuse `ai` v6 + `@ai-sdk/anthropic`** (`claude-sonnet-4-6`) | Already in production for blog/briefings |
| 5 | Freshness in MVP | **Briefings/blog deferred to Phase 3** | Prove core guide loop first |
| 6 | 30-day transcript storage | **No default server-side transcripts** | Privacy-first; only feedback/escalations logged |
| 7 | Text + links | **Motion state machine** (Rive character + framer-motion chrome) | Navigation-linked states: pointing / unsure / guide |

### Gaps closed in v2.2 (vs plan blueprint)

| Gap | Resolution |
|-----|------------|
| Phase 1 skipped industries in index while §D indexed them | **Phase 1 indexes learn + FAQ + glossary + all 12 industries.** Phase 2 polishes industry UX / tools / greetings / animation polish |
| Motion only idle/thinking/talking | Full product states: idle, greeting, listening, thinking, speaking, **pointing**, **unsure**, **guide**, error |
| Streaming vs dual-speaker JSON unclear | **Two-phase response protocol** (§5.5): stream Setu text first; emit structured payload on finish |
| Rate limiting left open | **MVP locked:** client throttle + soft server cap; Phase 2 hardens with Appwrite counter (default) or Upstash |
| Embedding provider open | **Default locked:** `text-embedding-3-small` via OpenRouter (`OPENROUTER_API_KEY` already wired) |
| Avatar ownership open | **Static SVG/PNG ships MVP.** Rive `.riv` is Phase 2 polish; owner = design; format = Rive |

### Decisions locked in v2.4 (2026-08-03, Dilip)

| # | Decision | Call |
|---|----------|------|
| D0 | Character scope | **Setu only.** Bindu deferred to Phase 2+ as optional text bubble; `speaker` enum keeps `"bindu"` reserved |
| D1 | Multilingual | **English MVP, i18n-ready.** All widget strings + prompt templates externalized (`lib/chat/strings.ts`); Hindi/Hinglish is the first fast-follow. Corpus is English — a non-English voice without matching source pages would break grounding |
| D2 | Failure logging vs no-transcripts | **Log failure turns only, redacted.** Refusal / low-confidence / 👎 turns store PII-redacted question + pageUrl + reason in `chat_feedback`. Never full transcripts |
| D3 | Model | **`claude-sonnet-5`** (supersedes `claude-sonnet-4-6` lock of July) |
| D4 | Proactive result-page triggers | **Yes** — chatbot is a deliberate referral path into the starved tools funnel; `chat_tool_cta` feeds the Phase-B denominator gate |
| D5 | Character Bible V3 file | Pending from Dilip; **not a build blocker** — §6 voice rules carry MVP. Interim canon: `SETU_CHARACTER_CANON.md` (from the intro films) |
| D6 | Retrieval backbone (build-time finding, 2026-08-03) | **Lexical BM25 + router boosts is the always-on backbone**; dense `text-embedding-3-small` vectors are an optional add-on when `OPENROUTER_API_KEY` is present at index build (key exists in Vercel, not locally; OpenRouter embeddings unverified). Golden-set eval decides whether dense is needed at all for ~326 chunks |

### Guided-agent layers added in v2.4 (from discovery-agent research)

1. **Trigger policy** (§2.4) — contextual proactive prompts with hard frequency caps
2. **Journey router** (§3.2) — six named journeys with entry/completion conditions
3. **Progressive profiling** (§9.2) — typed `ChatSessionState`, client-held, never server-persisted
4. **Action registry** (§5.2) — deep-link tool starts with non-sensitive preselection; consultation requires explicit confirm
5. **Human-handoff packet** (§9.5) — structured escalation summary, consent-gated
6. **Coaching loop** (§10) — failure-turn review, source-gap detection, monthly golden-set expansion

---

## 1. Ground truth — site as it exists

Everything the bot cites must resolve to a real route below.

### 1.1 Infrastructure to reuse (do not rebuild)

- **AI:** `ai` **v6.0.158** + `@ai-sdk/anthropic`, used in `app/api/blog/validate`, `app/api/blog/revise`, `app/api/briefings/generate` via `generateText` / `Output`, model `anthropic("claude-sonnet-4-6")`. Helper: `lib/aeo/openrouter-client.ts`. Secrets: `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`.
- **Motion chrome:** `framer-motion` **v12** installed.
- **Data:** `lib/appwrite.ts` lazy-Proxy client. `COLLECTIONS` includes leads, subscribers, downloads, assessments, briefings, consent_log, survey_responses, blog_posts, template_downloads, outreach_contacts, etc.
- **Modal/layer pattern:** `components/TemplateGateModal.tsx`.
- **Consent:** `/consent-preferences` + `consent_log`.
- **Design tokens** (`app/globals.css`):

  | Role | Token | Hex | Widget use |
  |------|-------|-----|------------|
  | Trust Navy | `--color-navy-700` / `--color-brand-700` | `#121A2E` | panel header, headings |
  | Verification Green | `--color-green-500` | `#07B981` | primary Open / CTA |
  | Assurance Teal | `--color-teal-500` | `#35B6AE` | links, secondary |
  | Signal Gold | `--color-gold-400` | `#E8AB42` | rare “new / urgent” only |
  | Cloud | `--color-cloud-50` | `#F7F9FC` | panel background |

  Icons: `lucide-react`. Layout: `components/layout/{Header,Footer}`. CTAs: `components/cta/{AssessmentCTA,WhitepaperCTA,TemplatesCTA}`.
- **Middleware:** `proxy.ts` (Next 16).
- **Net-new for this feature:** `/api/chat`, in-repo chat index, `lib/chat/*`, `components/chat/*`, `chat_feedback` collection. No vector DB. Character Rive runtime optional until Phase 2 art lands (static avatar for MVP).

### 1.2 Real IA — the ONLY link targets

**Tier 1 · Learn / primary answers** (`app/learn/[topic]/page.tsx` `learnContent` + statics; `lib/learnNav.ts`):

| Topic | URL |
|-------|-----|
| Learn hub | `/learn` |
| What is DPDPA | `/learn/what-is-dpdpa` |
| Applicability | `/learn/applicability` |
| Consent | `/learn/consent` |
| Notice | `/learn/notice` |
| Rights | `/learn/rights` (also top-level `/rights`) |
| Data breach | `/learn/data-breach` |
| Children's data | `/learn/childrens-data` |
| Retention | `/learn/retention` |
| Cross-border | `/learn/cross-border` |
| Duties | `/learn/duties` |
| Key terms | `/learn/key-terms` |
| Myths | `/learn/myths` |
| DPDP Act 2023 | `/learn/dpdp-act-2023` |
| DPDP Rules 2025 | `/learn/dpdp-rules-2025-plain-english-guide` |
| FAQ | `/faq` |
| Glossary | `/glossary` |
| Compliance checklist | `/compliance-checklist` |

**Tier 2 · Industry guides (12 — verified `app/industries/*`):**

`/industries/ca-firms` · `/industries/recruitment-agencies` · `/industries/training-institutes` · `/industries/d2c-brands` · `/industries/clinics-diagnostic-labs` · `/industries/schools-colleges` · `/industries/law-firms` · `/industries/real-estate` · `/industries/hotels-travel` · `/industries/pharmacies` · `/industries/fintech-nbfc` · `/industries/gyms-salons-spas` · hub `/industries`

**Tier 3 · Interactive tools:**

| Tool | URL | Notes |
|------|-----|-------|
| Readiness Assessment | `/assessment` | Hub only. `/assessment/{slug}` quizzes are `noindex` — **never link quiz steps** |
| Penalty Risk Indicator | `/penalty-calculator` | |
| Personal Data Discovery | `/discovery` | data-map / RoPA style tool |
| Privacy Notice Generator | `/tools/dpdpa-privacy-notice-generator` | only tool under `/tools` |
| Personal Data Flow Maps | `/data-mapping` | added v2.4 — shipped after v2.3 was written; hub only |
| White Paper | `/white-paper` | download / share-with-team |

**Tier 4 · Freshness (Phase 3 index):** `/briefings` · `/blog`

**Utility — link only, never DPDPA authority:** `/about` · `/contact` · `/resources` · `/privacy` · `/terms` · `/consent-preferences`

**Never surface:** `/admin/*` · `/api/*` · `/assessment/{slug}` inner steps · `/report/*` · `/subscribe` · `/unsubscribe`

**Seed content:** `public/llms.txt` (⚠️ **stale — lists 4 industries; refresh to 12 alongside this build**) · `public/llms-full.txt` (regulatory-context block reusable).

---

## 2. Product behaviour — guide + navigate

### 2.1 Navigation modes

| Mode | UX | Backend |
|------|----|---------|
| Inline cite | 1–3 markdown links in Setu text | retrieval + `site-routing.ts` |
| Rich card | Title · summary · “Open →” | routes from tools / router |
| Tool hand-off | CTA to assessment / calculator / discovery / notice / white paper | `suggest_tool` |
| Contextual greeting | “You’re on the CA Firms guide…” | `pageUrl` from client |
| Industry branch | Sector mentioned → industry guide first | `industry` slot |

### 2.2 Conversation flow (Character Bible V3)

**Default compressed 3-beat (Setu only, v2.4):**

1. **Reframe** — one short internalised clarifier (“You might be wondering…”) — omit when the question is already sharp  
2. **Answer** — plain English, grounded, + links  
3. **Next step** — one practical action  

Expand to 5-beat only on “explain more” or high nuance. Anchor line *“One rule. One step. Clear path forward.”* — sparingly. If a genuine clarification is required before answering (journey slot missing, §3.2), ask **exactly one question** — never a form.

### 2.3 Opening + quick replies

> **Setu:** Hi — I’m Setu. Ask me anything about DPDPA in plain English, and I’ll point you to the right guide on SaralPrivacy. What’s on your mind — consent, employee data, or whether the law applies to you?

Chips: `Does DPDPA apply to me?` · `Consent & notices` · `My industry` · `Data breach — what do I do?` · `Take the readiness assessment`

Page-aware: on `/industries/{slug}` or `/learn/{topic}`, greet with that context **and swap the three default chips for sector/topic-specific ones** (e.g. CA Firms page: `What client data creates risk?` · `Check my CA firm` · `How should we handle old records?`). Chip sets live beside the routes in `site-routing.ts` — never free-typed.

### 2.4 Trigger policy (v2.4 — proactive invitations)

The launcher is always available; proactive prompts are contextual and restrained. **All client-side (localStorage), no backend.**

| Page context | Trigger | Opening line |
|---|---|---|
| Homepage | 30–40 s dwell or 50% scroll | “Not sure where to begin? I can point you to the right DPDPA tool.” |
| `/industries/{slug}` | 50% scroll | “Would you like to check what this means for your business?” |
| `/learn/*` article | 60% scroll or second Learn page this session | “Want me to explain how this applies to your business?” |
| `/faq`, `/glossary` | two searches/expansions | “Couldn’t find the exact answer? Ask me in plain English.” |
| Discovery / Assessment results | results rendered | “Would you like help understanding what appeared here?” |
| Notice Generator | help requested / long hesitation | “I can explain what each question means. I won’t write answers without your confirmation.” |
| Briefing / blog post | near end of article | “Want the practical business implication of this update?” |

**Hard controls (all enforced in `lib/chat/triggers.ts`):**

- Never auto-open on arrival; max **one proactive prompt per session**
- Dismissal → suppress proactive prompts **~7 days**; user can **permanently mute** (persisted)
- Never interrupt an active Assessment / Discovery / Notice Generator step
- Suppressed entirely on `/privacy`, `/terms`, `/consent-preferences`, rights-request surfaces, `/subscribe`, `/unsubscribe`
- No desktop exit-intent behaviour on mobile

---

## 3. Site router — `lib/chat/site-routing.ts`

Typed + importable. One source for tools and eval. Prefer TypeScript over loose JSON so dead links fail at compile/test time.

```ts
export type Tier = 1 | 2 | 3 | 4;
export type IndustrySlug =
  | "ca-firms" | "recruitment-agencies" | "training-institutes" | "d2c-brands"
  | "clinics-diagnostic-labs" | "schools-colleges" | "law-firms" | "real-estate"
  | "hotels-travel" | "pharmacies" | "fintech-nbfc" | "gyms-salons-spas";
export type Intent = "assessment" | "penalty" | "discovery" | "notice" | "whitepaper";

export interface Route {
  url: string;          // MUST exist in §1.2
  title: string;
  tier: Tier;
  topicTags: string[];
  industry?: IndustrySlug;
  triggers: string[];
  summary: string;
}

export const ROUTES: Route[];
export const EXCLUDE_FROM_AUTHORITY: string[];
export function routesForTopic(topic: string): Route[];
export function toolForIntent(intent: Intent): Route | null;
export function isValidCitation(url: string): boolean;
```

### 3.1 Routing table

| Intent / phrase | Primary | Secondary |
|-----------------|---------|-----------|
| "what is DPDPA", "explain the law" | `/learn/what-is-dpdpa` | `/faq` |
| "am I covered", "does it apply" | `/learn/applicability` | `/faq` |
| "deemed consent", "do I need consent", "opt-in" | `/learn/consent` | `/glossary`, `/learn/notice` |
| "privacy notice", "privacy policy", "draft a notice" | `/learn/notice` | `/tools/dpdpa-privacy-notice-generator` |
| "rights", "erasure", "access request", "grievance" | `/learn/rights` | `/faq` |
| "data breach — what do I do" | `/learn/data-breach` | `/penalty-calculator`, `/contact` |
| "penalty", "fine", "Section 33", "breach cost" | `/penalty-calculator` | `/learn/data-breach` |
| "retention", "how long to keep" | `/learn/retention` | `/learn/duties` |
| "children", "under-18", "age-gating" | `/learn/childrens-data` | — |
| "cross-border", "transfer abroad" | `/learn/cross-border` | — |
| "duties", "fiduciary", "SDF" | `/learn/duties` | `/learn/key-terms` |
| "myth", "is it true that…" | `/learn/myths` | — |
| "the actual Act", "bare text" | `/learn/dpdp-act-2023` | — |
| "the 2025 Rules" | `/learn/dpdp-rules-2025-plain-english-guide` | — |
| "where do I stand", "gap analysis", "checklist score" | `/assessment` | `/compliance-checklist` |
| "map my data", "what data do I hold", "RoPA" | `/discovery` | — |
| "download", "deep dive", "share with team" | `/white-paper` | — |
| "latest", "news", "what's new" | `/briefings` | `/blog` |
| industry mention ("we're a clinic / CA / …") | `/industries/{slug}` | relevant `/learn/*` |
| "I need a lawyer", "formal legal opinion" | `/contact` | privacy@saralprivacy.com |

**Industry branch:** detect industry → fill `industry` slot → industry guide leads → topic `/learn/*` follows.

### 3.2 Named journeys (v2.4 — journey router)

Six launch journeys. Each declares entry conditions, the minimum slots it needs (ask **one** question at a time only for genuinely missing slots), and a completion condition. `journey_stage` lives in `ChatSessionState` (§9.2).

| # | Journey | Entry (intent/phrases) | Minimum slots | Completes when |
|---|---|---|---|---|
| J1 | Does DPDPA apply to me? | applicability questions | org type · handles digital personal data? · whose data · India/cross-border | Answer + `/learn/applicability` opened, or `/assessment` started |
| J2 | What personal data do I handle? | “what data do we hold”, RoPA, mapping | industry · niche · user role | `/discovery` started with industry preselected |
| J3 | Where should my business begin? | “where do I start”, readiness | industry · broad objective | `/assessment` (sector entry) started — **route to the tool, never re-run the assessment in chat** |
| J4 | Do I need consent for this? | consent questions | channel · purpose · data subject · existing consent? | Answer + `/learn/consent` (or `/learn/notice`) opened |
| J5 | Create / improve a privacy notice | notice/policy drafting | data collected · purpose · collection point · sharing · rights channel | `/tools/dpdpa-privacy-notice-generator` started |
| J6 | What does this term/rule mean? | glossary/definition asks | none (term from message) | Grounded definition + `/glossary` or `/learn/key-terms` cited |

**Rules:** infer slots from page context and prior turns before asking; never re-ask a `facts_confirmed` slot; a journey that stalls twice on clarification offers the human path (§9.5). Breach triage, rights-request guidance, voice and multilingual join only after these six hit targets (§10).

---

## 4. Retrieval — in-repo embedded index

### 4.1 Build script — `scripts/build-chat-index.mjs`

**Phase 1 sources (locked):**

1. `public/llms-full.txt`  
2. All Tier-1 `/learn/*` (extract `learnContent` + static pages)  
3. `/faq`, `/glossary`, `/compliance-checklist`  
4. **All 12 `/industries/*`**  
5. Static tool blurbs from `site-routing.ts` (assessment, penalty, discovery, notice generator, white paper)

**Excluded from Phase 1 index:** `/briefings`, `/blog` (Phase 3 freshness).

- **Chunking:** ~500 tokens, 80 overlap → **~200–320 chunks**  
- **Metadata:** `{ id, url, title, tier, topicTags[], industry?, lastModified, text }`  
- **Embeddings:** batch once → `public/chat-index.json` (or Vercel Blob via `BLOB_READ_WRITE_TOKEN`). ≈ **~2 MB**.  
- **Embedding model (locked default):** `text-embedding-3-small` via **OpenRouter** (`OPENROUTER_API_KEY`). Whole-corpus embed **< $0.01**.  
- **Refresh:** re-run on content deploy. Nightly/diff automation = Phase 3.

### 4.2 Query time

1. Embed user message  
2. In-memory cosine **top-k = 6**  
3. **Similarity floor 0.72** (tune in eval). Below floor → **refuse** (no model-memory fill-in)  
4. Substantive claims need **≥1 Tier-1 or Tier-2** citation. Pure navigation may use router alone  

---

## 5. LLM orchestration — reuse `ai` v6 + Anthropic

### 5.1 Endpoint — `app/api/chat/route.ts`

```ts
import { streamText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const result = streamText({
  model: anthropic("claude-sonnet-5"),   // D3: supersedes claude-sonnet-4-6
  system,                 // §6
  messages,               // sanitised history + current turn
  tools,                  // §5.2
  stopWhen: stepCountIs(4),
});
return result.toUIMessageStreamResponse();
```

Mirror patterns already proven in `app/api/blog/validate/route.ts`.

### 5.2 Tools

```ts
search_knowledge_base(query: string, filters?: { tier?: Tier; industry?: IndustrySlug })
  → { url, title, tier, snippet, score }[]
list_routes_for_topic(topic: string) → Route[]
suggest_tool(intent: Intent) → Route | null
```

**Action registry (v2.4).** Navigation actions the model may *propose*; the client renders them as cards and the **user click executes them** — the model never navigates or submits anything itself:

| Action | Phase 1 behaviour | Guard |
|---|---|---|
| `start_discovery` | Deep link `/discovery` (+ industry preselect when supported) | non-sensitive params only |
| `start_assessment` | Deep link to the sector assessment **entry** (`/assessment` hub or `/assessment/{slug}` landing) | quiz-step URLs stay banned as *citations* (`noindex`); entry-as-action is allowed |
| `start_notice_generator` | Deep link `/tools/dpdpa-privacy-notice-generator` | never pre-fills answers without user confirmation |
| `request_consultation` | Opens consultation hand-off (§9.5) | **only** action touching contact data — explicit in-chat confirmation + consent required |

Every action URL passes `isValidCitation()`-equivalent allowlisting. No open-web / browse tools. Ever. The agent never generates a URL — it selects from `site-routing.ts`.

### 5.3 Per-turn grounding block

```
<regulatory_context> … from llms-full.txt, refresh quarterly …
<retrieved_context>  [chunk — source: https://saralprivacy.com/…] … </>
<routing_hints>      primary_url: …  secondary_urls: […] </>
<user_message>       {sanitised message} </>
```

### 5.4 Final response contract

```json
{
  "messages": [
    { "speaker": "setu", "text": "You might be wondering whether this covers marketing emails or HR records. In simple words, …" }
  ],
  "citations": [
    { "title": "Consent under DPDPA", "url": "https://saralprivacy.com/learn/consent", "tier": 1, "snippet": "…" }
  ],
  "actions": [
    { "type": "open_url", "label": "Read the consent guide", "url": "https://saralprivacy.com/learn/consent" }
  ],
  "animation": { "state": "pointing", "intensity": 0.7 },
  "confidence": "high",
  "grounding": { "used_urls": ["https://saralprivacy.com/learn/consent"], "refusal": false },
  "disclaimer": "Educational only — not legal advice.",
  "suggested_followups": ["What counts as valid consent?", "Show me the recruitment guide"]
}
```

- `animation.state` ∈ §8.2. Model hint is **advisory**; client owns real animation from UI events (§8.3).  
- `confidence`: `high | low`. `low` → refusal + `unsure`.  
- Server **must** filter citations/actions through `isValidCitation()` before emit.  
- `speaker` enum keeps `"bindu"` **reserved but unused in MVP** (D0); clients must render unknown speakers as Setu-styled.

### 5.5 Streaming protocol (gap closed)

Dual-speaker JSON mid-stream is fragile. Use a **two-phase** pattern:

| Phase | What streams | UX |
|-------|--------------|-----|
| **A — Text stream** | Setu’s answer as plain/markdown tokens (internalised reframe leads the same stream) | Avatar → `speaking`; user sees words immediately |
| **B — Structured finish** | On `onFinish`, emit one `data-chat-meta` (or equivalent AI SDK data part) with citations, actions, confidence, grounding, suggested_followups, animation hint | Cards appear; avatar → `pointing` or `unsure` |

**Rules:**

- Never wait for full JSON before showing text (hurts first-token latency).  
- Cards/actions appear only after server validates URLs.  
- If tools need multi-step retrieval, show `thinking` until Phase A starts.  
- The Phase-B meta also carries the updated `journey_stage` + newly confirmed slots so the client can merge them into `ChatSessionState` (§9.2).

---

## 6. System prompt — `lib/chat/system-prompt.md`

Derived from Character Bible V3 §6 / §7 / §14 + §7 guardrails.

1. **Identity** — Setu, single voice (D0); internalised reframe replaces Bindu. 3-beat default. One concept, one example, one action. English only in MVP (D1); all fixed strings come from `lib/chat/strings.ts`, never hardcoded in the prompt.  
2. **Grounding** — only `<retrieved_context>` / `<routing_hints>`. If absent → refuse. Never invent sections, penalties, URLs.  
3. **Uncertainty** — Bible lines: “This part is still evolving…” DPB not constituted; enforcement phased.  
4. **Scope fence** — DPDPA / privacy / SaralPrivacy only.  
5. **Navigation duty** — 1–3 real links + one next step on substantive answers.  
6. **Escalation** — legal opinion / active breach with identifiable victims / low confidence / human ask → `/contact` + privacy@saralprivacy.com.  
7. **Output** — §5.4 contract; markdown-lite (bold, links, lists ≤5).

### 6.1 Regulatory context (static, quarterly)

- DPDP Act 2023 — assented August 2023  
- DPDP Rules 2025 — notified 14 November 2025; phased implementation  
- DPB not yet constituted; enforcement phased  
- Penalty caps: ₹250 crore (SDF) / ₹200 crore (others) — framing only; never case-specific figures  

---

## 7. Guardrails & compliance

- Persistent **“Educational only — not legal advice”** strip for the whole session  
- Citations must pass `isValidCitation()` (∈ `ROUTES`, domain `saralprivacy.com`)  
- No PII intake; redact before logs: email; phone `\+?\d[\d\s-]{8,}`; PAN `[A-Z]{5}\d{4}[A-Z]`; Aadhaar-like `\d{4}\s?\d{4}\s?\d{4}`  
- Children’s data → `/learn/childrens-data`; no profiling advice  
- Penalties → `/penalty-calculator` + Section 33(2) framing; never fabricated amounts  
- Disallowed: law-firm claims; evasion help; off-topic; fake sections/amounts  
- Prompt-injection: system isolation; retrieved/user text = **data not instructions**; 2,000-char input cap  

---

## 8. UI & motion-graphic system

Mascot = **product-state indicator**, not decoration.

### 8.1 Components — `components/chat/`

`ChatLauncher` · `ChatPanel` (mobile sheet / desktop ~400×600) · `SetuStage` (static MVP / Rive Phase 2) · `MessageList` · `SetuBubble` (`BinduBubble` deferred with D0) · `CitationCard` · `ActionButton` · `QuickReplies` · `DisclaimerStrip` · `FeedbackButtons`. Mount once in `app/layout.tsx`. All user-facing strings from `lib/chat/strings.ts` (D1).

### 8.2 Avatar state machine

| State | Trigger | User meaning |
|-------|---------|--------------|
| `idle` | no activity | available (slow bob / blink) |
| `greeting` | panel opened | welcome |
| `listening` | user typing | paying attention |
| `thinking` | retrieval / tools in flight | looking up SaralPrivacy |
| `speaking` | Phase A text streaming | explaining |
| `pointing` | citations/actions rendered | go here |
| `unsure` | low confidence / refusal | not on site / need human |
| `guide` | Open/CTA clicked | this way |
| `error` | network/API failure | soft apology + retry |

One emotional beat at a time (Bible: face + one prop + one panel). TailPad for explain; pointing for navigate. Bindu never dominates.

### 8.3 Animation event bridge

**Product state → animation inputs. LLM never drives keyframes.**

| UI event | Animation state |
|----------|-----------------|
| `chat_opened` | `greeting` → `idle` |
| `user_typing` | `listening` |
| `retrieval_started` | `thinking` |
| `answer_streaming` | `speaking` |
| `citations_ready` | `pointing` |
| `low_confidence` | `unsure` |
| `navigate_clicked` | `guide` |
| `api_error` | `error` |

### 8.4 Runtime

| Layer | Tech | Notes |
|-------|------|-------|
| MVP character | Static PNG/SVG Setu + CSS / light framer pulse on thinking/speaking | Unblocks build |
| Phase 2 character | **Rive** `.riv` + §8.2 state machine | Real-time states |
| Widget chrome | **framer-motion** (already installed) | launcher, panel, cards |

- Cap ≤ 60fps; pause when tab hidden / panel closed  
- `prefers-reduced-motion: reduce` → static illustration + CSS fade; **same answer + links**  

### 8.5 Refusal pattern

> **Setu:** I can only help with what’s on SaralPrivacy — I don’t have that in our guides yet.  
> **Actions:** Open FAQ · Contact · Learning Hub  

Avatar → `unsure`. Never invent pages/sections/penalties.

### 8.6 Placement & a11y

- All public pages except `/admin/*`  
- Above content; **never obscure consent surface**; analytics only if consent allows  
- Reuse `TemplateGateModal` layering + §1.1 tokens  
- WCAG 2.1 AA: focus trap, launcher `aria-label`, focus return, “Setu says…” announcements, keyboard chips/cards  

### 8.7 Mascot assets (ownership locked)

| Asset | Owner | Timing |
|-------|-------|--------|
| Static Setu SVG/PNG | Design | **MVP blocker** — ship before/with Phase 1 |
| Optional static Bindu accent | Design | Nice-to-have MVP |
| `setu-guide.riv` state machine | Design + eng | **Phase 2** |
| Continuity | Bible V3 §8 | electric-blue squirrel + glasses; Bindu tiny red drone |

No in-page Veo/HeyGen video.

### 8.9 Widget visual tokens & interaction states

*Closes the `/plan-design-review` gaps (typography, spacing, per-element states, contrast). These are the build-time defaults; a designer may refine within the same token set.*

**Type scale** — ≤3 sizes, ≤2 weights, line-height 1.5:

| Role | Size / weight | Token |
|---|---|---|
| Setu panel header | 18 / 600 | `text-lg font-semibold` |
| Message body | 15 / 400 | `text-[15px]` |
| Speaker label ("Setu" / "Bindu"), chips, meta | 13 / 600, muted, tracking-wide | `text-[13px]` |

**Spacing** — 4/8/16/24 only: panel padding 16 (mobile) / 24 (desktop); bubble gap 8; inter-speaker gap 16; citation-card padding 16; chip gap 8; input area padding 12.

**Contrast-safe token roles** (WCAG AA ≥ 4.5:1 for text — the review found the raw brand accents fail as text/CTA):

| Element | Background | Text/fg | Ratio | Note |
|---|---|---|---|---|
| Primary "Open" CTA | Verification Green `#07B981` | **Trust Navy `#121A2E`** text | ~7.9:1 ✅ | white-on-green was ~2.5:1 ❌ — do not use |
| Link text (inline) | Cloud `#F7F9FC` | **Teal-700 `#207D78`** | ~4.8:1 ✅ | teal-500 as text was ~2.1:1 ❌ |
| Body text | Cloud `#F7F9FC` | Trust Navy `#121A2E` | ~15:1 ✅ | |
| Disclaimer strip | Cloud `#F7F9FC` | Navy-500 `#354F72` | ~5.6:1 ✅ | subtle but legible |
| Signal Gold `#E8AB42` | — | — | — | decorative badges only, never text/CTA |

**Interaction-state matrix** (every interactive element gets all four; focus ring = 2px Teal-700, ≥3:1 vs adjacent):

| Element | Hover | Focus | Active | Disabled |
|---|---|---|---|---|
| Open CTA / send | green→green-600 | teal ring | scale 0.98 | 40% opacity, no pointer |
| Quick-reply chip | teal-50 fill | teal ring | border teal-500 | hidden when N/A |
| Citation card | shadow + navy border | teal ring | scale 0.99 | — |
| 👍/👎 feedback | tint | teal ring | fill (selected persists) | dim after vote |
| Launcher | spring lift | teal ring | scale 0.96 | — |

**Two runtime states the review flagged as missing:**
- **Rate-limit reached** → Setu `unsure`: "You've asked a lot — give me a minute and try again." Send disabled with a countdown; no error-red.
- **Offline / network lost** → `error` state: "I've lost connection — check your network and retry." Retry button; input preserved.

---

## 9. API, data & limits

### 9.1 Endpoints (same-origin — no CORS)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat` | streamed chat |
| POST | `/api/chat/feedback` | 👍/👎 + optional reason |
| GET | `/api/chat/health` | health |

Request: `{ sessionId, message, pageUrl, history[] }` · `message` ≤ 2,000 chars.

### 9.2 Data

- **New Appwrite collection `chat_feedback`:** `{ sessionId, turnId, helpful?, reason?, pageUrl, ts, failureKind?, redactedQuestion? }` — `failureKind ∈ refusal | low_confidence | thumbs_down`; `redactedQuestion` is stored **only** on failure turns and **only after** `redact.ts` (D2). Coaching loop reads from here.

  **Console schema (create before preview sign-off; route degrades gracefully until then):**

  | Attribute | Type | Size | Required |
  |---|---|---|---|
  | `sessionId` | string | 64 | yes |
  | `turnId` | string | 64 | yes |
  | `helpful` | boolean | — | no |
  | `reason` | string | 500 | no |
  | `pageUrl` | string | 200 | no |
  | `failureKind` | string | 20 | no |
  | `redactedQuestion` | string | 2000 | no |
  | `ts` | string | 30 | yes |

  Permissions: create = any (route is server-side with API key, same as other collections); read = team only.
- **No transcript persistence** — successful turns are never stored server-side
- **Client conversation state (`lib/chat/state.ts`, localStorage + per-request payload — never server-persisted):**

```ts
interface ChatSessionState {
  sessionId: string;
  intent?: string;                 // current classified intent
  userType?: "owner" | "employee" | "consultant" | "individual";
  industry?: IndustrySlug;
  businessNiche?: string;
  journey?: "J1"|"J2"|"J3"|"J4"|"J5"|"J6";
  journeyStage?: string;
  factsConfirmed: Record<string, string>; // slot → user-confirmed value; never re-ask
  lastTopic?: string;
  pagesShown: string[];
  entryPageUrl: string;
  messageCount: number;
  consentToContact: boolean;       // false until §9.5 explicit consent
  proactive: { shownAt?: number; dismissedUntil?: number; muted: boolean }; // §2.4
}
```

### 9.3 Rate limiting (MVP locked)

| Phase | Approach |
|-------|----------|
| **MVP** | Client throttle (disable send while in-flight + max 30/hr soft counter in localStorage) **plus** soft server checks: reject `message` > 2k chars; reject obvious floods (e.g. > 5 msgs / 10s per sessionId in-memory best-effort). Target: **30 msg/hr/session**, **100/day** (best-effort on serverless) |
| **Phase 2** | Harden with **Appwrite counter collection** (default; no new vendor) **or** Upstash KV if ops prefers |

### 9.4 Analytics

`chat_opened` · `chat_message_sent` · `chat_link_clicked` · `chat_tool_cta` · `chat_feedback` · `chat_escalation` · `chat_proactive_shown` · `chat_proactive_dismissed` — wire to Vercel Analytics custom events (verified live 2026-07-31) and **verify each fires on preview before merge** (content-trust law). `chat_tool_cta` deliberately feeds the starved `/discovery` funnel (D4).

### 9.5 Human-handoff packet (v2.4)

When escalation triggers (§6.6) or a journey stalls twice, offer the consultation hand-off. **Requires explicit user confirmation + `consentToContact`** before any contact field is accepted (name, work email, company, industry, short description). Submission posts through the existing contact/leads flow with a structured packet:

```
{ summary, industry?, intent, journey?, sourcesShown[], unresolvedQuestion, pageUrl, consentToContact: true, ts }
```

`summary` and `unresolvedQuestion` pass `redact.ts` first. No packet is ever created without consent; declining leaves the user with `/contact` links as today.

---

## 10. Evaluation & QA

- **Golden set ≥ 40:** Applicability(8) · Consent/Notice(8) · Industry(12 — **one per industry**) · Rights/Erasure(6) · Breach/Penalty(6) · Navigation-only(8) · Off-scope refusal(4)  
- Each case: expected primary URL, disclaimer, forbidden claims, refusal when required  
- Automated: URL ∈ `ROUTES` + HTTP 200; domain check; no PII; Tier-1/2 for substantive; latency  
- Human: ~20 feedback-sampled reviews / week; full golden re-run on regulatory change  
- **Coaching loop (v2.4):** weekly review of `chat_feedback` failure turns (D2) → classify as *retrieval gap* (chunking/floor tuning), *routing gap* (site-routing.ts fix), or **source gap** (no page covers it → content backlog item); monthly golden-set expansion from real failures  
- **Hard targets:** wrong citation **< 2%**; **off-site hallucination = 0**  
- Motion QA: no stuck `thinking`; `unsure`/`error` fire correctly; reduced-motion parity; keyboard path; pause on hidden tab  
- **Design gate:** `/plan-design-review` avg ≥ 8 on widget UI before build  

---

## 11. Phased rollout (lean · gaps closed)

### Phase 1 — MVP (ship the guide)

- First-party chat on all public pages  
- **In-repo index: learn + FAQ + glossary + checklist + all 12 industries + tool blurbs**  
- Setu single-voice 3-beat (D0) + streaming protocol (§5.5)  
- Citations, Open cards, disclaimer, refusal-below-floor, 👍/👎  
- **Trigger policy** (§2.4) + contextual chips (§2.3)  
- `ChatSessionState` progressive profiling (§9.2) — journeys J1–J6 routed  
- **Static avatar** + light chrome motion  
- `chat_feedback` collection incl. failure-turn fields (D2)  
- MVP rate limits (§9.3) · strings externalized (D1)  
- Refresh `public/llms.txt` industries 4 → 12  

### Phase 2 — polish navigation + motion

- Page-context greetings polish  
- Tool hand-offs UX (discovery, notice generator, assessment, penalty)  
- **Human-handoff packet live** (§9.5) + escalation flow polish  
- Rive `.riv` character states (pointing / unsure / guide live)  
- Optional Bindu text-bubble return (D0 revisit)  
- Analytics dashboard  
- Rate-limit hardening (Appwrite counter)  

### Phase 3 — optional scale

- Briefings/blog freshness + nightly re-index  
- Pinecone/pgvector only if corpus outgrows in-repo index  
- Opt-in email transcript  
- **Voice & multilingual (see §11.1)**  
- `widget.js` only if off-site embed ever required  

### 11.1 Voice & multilingual (Phase 3, optional · consent-gated)

**Principle: voice is an I/O skin on the grounded text brain — never a replacement for it.** The `ai` v6 + Anthropic + in-repo-index pipeline stays the single source of truth; TTS/ASR only convert its input/output. This preserves grounding, citations, and refusals intact.

- **TTS (speak the answer):** **Sarvam AI (Bulbul)** primary for Hindi/Hinglish + Indian-English; **ElevenLabs (Flash v2.5, ~75 ms streaming)** secondary for premium English. Stream audio synced to the `speaking` avatar state; toggle off by default; obey `consent-preferences` and `prefers-reduced-motion` (a "mute" that mirrors reduced-motion).
- **ASR (voice input, optional):** **Sarvam (Saarika)** for Indian-accent transcription → transcript enters the *same* grounded pipeline. ASR never shortcuts retrieval.
- **Excluded — speech-to-speech agents** (Grok Voice, ElevenLabs Conversational AI, OpenAI Realtime): they do their own reasoning/turn-taking and would **bypass the strict-RAG boundary**. Not used.
- **Data residency (on-brand for a DPDPA product):** prefer **Sarvam (India-hosted)** as default; document any ElevenLabs (US/EU) processing in the notice. Voice adds per-turn cost (ElevenLabs ~$0.10–0.30/1k chars) + latency + audio QA — the reasons it stays Phase 3, not MVP.
- **Runtime note:** shipped widget calls provider **HTTP APIs/SDKs**, not MCP (MCP is dev-time tooling only).

---

## 12. Cost & latency

- One-time index embed: **< $0.01**  
- Per query: tiny embed + short grounded Sonnet — within existing AI spend  
- **First token < 8 s** · **p95 end-to-end < 12 s**  

---

## 13. Acceptance criteria (MVP)

- [x] DPDPA question → answer with ≥ 1 valid saralprivacy.com link *(orchestrator tests + live smoke 2026-08-03)*  
- [x] Industry query → correct `/industries/{slug}` (any of 12) *(golden set 12/12)*  
- [x] Penalty query → `/penalty-calculator` *(golden brc-3/4)*  
- [ ] “Not legal advice” visible entire session *(built — verify on preview)*  
- [x] Below-floor retrieval → refuse; **zero** non-saralprivacy citations in QA *(hard-gated in golden.test.ts; server-built meta cannot emit off-allowlist URLs)*  
- [x] Streaming shows Setu text before cards; cards only after URL validation *(two-phase protocol; meta validated server-side)*  
- [ ] Avatar (static OK): thinking → speaking → pointing (or CSS equivalents) *(built — verify on preview)*  
- [ ] Keyboard smoke test + `prefers-reduced-motion` parity *(built — verify on preview)*  
- [x] Golden set ≥ 90% primary-URL routing *(51/51 = 100%, 2026-08-03)*  
- [x] First-token < 8 s; p95 < 12 s *(measured 1.7–2.4 s first token on live smoke)*  

---

## 14. File map (net-new)

| Path | Purpose |
|------|---------|
| `SETU_BINDU_CHATBOT_SPEC.md` | This document (canonical) |
| `lib/chat/site-routing.ts` | Typed routes + chips + helpers |
| `lib/chat/system-prompt.md` | LLM system prompt |
| `lib/chat/retrieve.ts` | Load index + cosine top-k |
| `lib/chat/redact.ts` | PII redaction |
| `lib/chat/state.ts` | `ChatSessionState` (§9.2) |
| `lib/chat/journeys.ts` | J1–J6 definitions (§3.2) |
| `lib/chat/triggers.ts` | Proactive trigger policy (§2.4) |
| `lib/chat/strings.ts` | All widget strings, i18n-ready (D1) |
| `app/api/chat/route.ts` | Stream + tools |
| `app/api/chat/feedback/route.ts` | 👍/👎 |
| `app/api/chat/health/route.ts` | Health |
| `components/chat/*` | Widget UI |
| `scripts/build-chat-index.mjs` | Build embeddings index |
| `public/chat-index.json` | Generated index artifact |
| `eval/chat-golden.json` | Golden set |

---

## 15. Out of scope (this feature)

- Open-web answers  
- Formal legal advice / contract review  
- Submitting assessment quizzes for the user  
- Predicting exact fines for a real incident  
- Veo/HeyGen talking-head video in the widget  
- Off-site embed (`widget.js`) until Phase 3 need is proven  
- **Voice I/O in MVP** — TTS/ASR are Phase 3 only (§11.1); **speech-to-speech voice agents excluded entirely** (break grounding)  

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| **2.4** | 2026-08-03 | Decisions D0–D5 locked (Setu-only voice; English i18n-ready; failure-only redacted logging; `claude-sonnet-5`; result-page triggers on; Bible file pending, non-blocking). Guided-agent layers merged from discovery research: §2.4 trigger policy, §3.2 journeys J1–J6, §5.2 action registry, §9.2 `ChatSessionState` + failure-turn logging, §9.5 handoff packet, §10 coaching loop. Contextual chips; proactive analytics events |
| **2.3** | 2026-07-15 | Added §11.1 Voice & multilingual (Phase 3, optional, consent-gated): Sarvam-primary/ElevenLabs-secondary TTS + Sarvam ASR as an I/O skin on the grounded brain; speech-to-speech agents (Grok Voice etc.) excluded for breaking grounding; India data-residency preference noted. Out-of-scope + Phase-3 lines updated. |
| **2.2** | 2026-07-14 | Canonical rewrite with plan gaps closed: Phase 1 indexes all 12 industries; streaming two-phase protocol; MVP rate-limit + embedding defaults locked; avatar ownership/timing locked; golden set one-per-industry; full navigation motion states retained from 2.1 |
| 2.1 | 2026-07-14 | Motion-graphic fold-in: Rive states, event bridge, animation/confidence/grounding fields, brand tokens, zero-hallucination audit |
| 2.0 | 2026-07-14 | Live-site rewrite: 12 industries, first-party, in-repo index, reuse AI SDK, privacy-first |
| 1.0 | 2026-06-17 | Original navigation-first draft |
