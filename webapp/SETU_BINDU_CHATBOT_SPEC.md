# Setu & Bindu — Site-Guide Chatbot for SaralPrivacy

> **Version:** 3.0 (final · build-approved)  
> **Status:** Development — Sprint plan: `SETU_BINDU_SPRINT_PLAN.md`  
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

**Setu** explains. **Bindu** reframes and confirms. One agent experience, two speaker styles — not two competing chatbots.

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

### 0.1 Success metrics (90-day) — added v3.0 per CEO review

**This is a conversion surface, not a help widget.** Instrument accordingly from day one.

| Metric | Target | Source |
|---|---|---|
| **North-star: chat-originated tool/assessment starts** | **≥ 10% of chat sessions** | `chat_tool_cta` events |
| Sessions with ≥ 1 Open click | ≥ 35% | `chat_link_clicked` |
| "Helpful" rating | ≥ 80% | `chat_feedback` |
| Wrong-page citation (QA audit) | < 2% | golden set + weekly audit |
| Off-site hallucination | **0** | automated citation check |
| p95 end-to-end latency | < 12 s | server timing |

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

**Default compressed 3-step:**

1. **Bindu** — one short reframe (optional if question is already sharp)  
2. **Setu** — plain-English answer + links  
3. **Setu** — one practical next step  

Expand to **5-step** only on “explain more” or high nuance. Single-bubble fallback: Setu internalises Bindu (“You might be wondering…”). Anchor line *“One rule. One step. Clear path forward.”* — sparingly.

### 2.3 Opening + quick replies

> **Setu:** Hi — I’m Setu. Ask me anything about DPDPA in plain English, and I’ll point you to the right guide on SaralPrivacy.  
> **Bindu:** What’s on your mind — consent, employee data, or whether the law applies to you?

Chips: `Does DPDPA apply to me?` · `Consent & notices` · `My industry` · `Data breach — what do I do?` · `Take the readiness assessment`

Page-aware: on `/industries/{slug}` or `/learn/{topic}`, greet with that context.

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

---

## 4. Retrieval — in-repo embedded index

### 4.1 Build script — `scripts/build-chat-index.mjs`

**Phase 1 sources (locked):**

1. `public/llms-full.txt`  
2. All Tier-1 `/learn/*` (extract `learnContent` + static pages)  
3. `/faq`, `/glossary`, `/compliance-checklist`  
4. **All 12 `/industries/*`**  
5. Static tool blurbs from `site-routing.ts` (assessment, penalty, discovery, notice generator, white paper)

**Extraction mechanics (locked v3.0):** default = **fetch the live saralprivacy.com page HTML and strip to text** — works uniformly for every page type (learn statics, TSX-rendered industries, FAQ) and indexes exactly what users see. Fallback for `/learn/[topic]`: import `learnContent` from source. The script tags each chunk with its canonical URL from §1.2 regardless of extraction path.

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
  model: anthropic("claude-sonnet-4-6"),
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

No open-web / browse tools. Ever.

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
    { "speaker": "bindu", "text": "Wait — marketing emails or HR records?" },
    { "speaker": "setu", "text": "In simple words, …" }
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

### 5.5 Streaming protocol (gap closed)

Dual-speaker JSON mid-stream is fragile. Use a **two-phase** pattern:

| Phase | What streams | UX |
|-------|--------------|-----|
| **A — Text stream** | Setu’s main answer as plain/markdown tokens (Bindu line may prepend as a short completed bubble once known) | Avatar → `speaking`; user sees words immediately |
| **B — Structured finish** | On `onFinish`, emit one `data-chat-meta` (or equivalent AI SDK data part) with citations, actions, confidence, grounding, suggested_followups, animation hint | Cards appear; avatar → `pointing` or `unsure` |

**Rules:**

- Never wait for full JSON before showing text (hurts first-token latency).  
- Cards/actions appear only after server validates URLs.  
- If tools need multi-step retrieval, show `thinking` until Phase A starts.  
- Bindu bubble: either (1) short pre-stream bubble after tool resolve, or (2) omitted when question is already clear.

### 5.6 Request hygiene & cost guards (added v3.0)

- **History cap:** server keeps only the **last 8 messages** of client-supplied `history[]`, trims oldest-first, and **re-sanitises every entry** (never trust client history — same injection posture as the live message).  
- **Output cap:** `maxOutputTokens ≈ 700` — answers are short by design (3-step voice); this bounds per-turn cost and helps the <8 s first-token target.  
- **`suggested_followups` must be answerable:** each one is validated against router topics (`routesForTopic` non-empty) before emit — a suggested chip must never dead-end into a refusal.  
- Input cap 2,000 chars (§7) enforced server-side with the 400 error contract (§9.5), not silently truncated.

---

## 6. System prompt — `lib/chat/system-prompt.md`

Derived from Character Bible V3 §6 / §7 / §14 + §7 guardrails.

1. **Identity** — Setu explains; Bindu reframes/confirms. 3-step default. One concept, one example, one action.  
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

`ChatLauncher` · `ChatPanel` (mobile sheet / desktop ~400×600) · `SetuStage` (static MVP / Rive Phase 2) · `MessageList` · `SetuBubble` / `BinduBubble` · `CitationCard` · `ActionButton` · `QuickReplies` · `DisclaimerStrip` · `FeedbackButtons`. Mount once in `app/layout.tsx`.

**Bundle discipline (v3.0):** the launcher is the only eagerly-loaded piece (budget **≤ 10 KB**); `ChatPanel` and everything behind it load via `next/dynamic` on first open. The Rive runtime (Phase 2) loads only when the panel opens. The widget must not measurably regress LCP on any public page.

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
- **`aria-live="polite"` on the streaming answer region** (v3.0 — from design review) so screen readers announce new content without interrupting  
- Widget renders only when `NEXT_PUBLIC_CHAT_ENABLED=true` (kill switch, §9.3)  

### 8.7 Mascot assets (ownership locked)

| Asset | Owner | Timing |
|-------|-------|--------|
| Static Setu avatar | **Export from existing master** — `Product Dev/SetuBindu Shorts Factory/assets/characters/setu-master.png` → ≈512px head-crop WebP/PNG → `public/chat/setu-avatar.webp` | **Blocker cleared (v3.0)** — masters exist |
| Optional static Bindu accent | Export from `bindu-master.png`, same treatment | Nice-to-have MVP |
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

- **New Appwrite collection `chat_feedback`** — explicit attribute types (the `report_type` string(10) lesson: size every string):

  | Attribute | Type | Notes |
  |---|---|---|
  | `sessionId` | string(36) | UUID |
  | `turnId` | string(36) | |
  | `helpful` | boolean | |
  | `reason` | string(500), optional | user-typed; PII-redacted before write (§7) |
  | `pageUrl` | string(255) | path only, no query string |
  | `ts` | datetime | |

- **New Appwrite collection `chat_rate` (v3.0):** `{ sessionId string(36), hourBucket string(16), count integer }` — backs the hard cap (§9.3)  
- **No default transcript persistence**  
- **Client session (localStorage):** `sessionId`, `industry?`, `lastTopic`, `pagesShown[]`, `entryPageUrl`, `messageCount`  

### 9.3 Rate limiting & abuse controls (v3.0 — hard cap promoted to Phase 1 per CEO review)

The endpoint serves **anonymous public traffic**; best-effort caps leak at 10×. Phase 1 ships the hard cap.

| Layer | Phase 1 (all shipping) |
|-------|------------------------|
| Client throttle | Disable send while in-flight; soft 30/hr localStorage counter (UX nicety, not security) |
| **Hard server cap** | **Appwrite `chat_rate` counter** (no new vendor): 30 msg/hr/session, 100/day/session. **Fail-closed** → 429 with `Retry-After`. Counter reads cached ~10 s in-function to bound Appwrite latency |
| Origin checks | Validate `Origin`/`Referer` against the site host **and** require a custom header (e.g. `x-setu-chat: 1`) — cheap bot filter; defence-in-depth with the cap, not a substitute |
| Input validation | `message` > 2,000 chars or malformed body → 400 (§9.5) |
| **Kill switch** | `NEXT_PUBLIC_CHAT_ENABLED` gates widget render; server checks `CHAT_ENABLED` and returns 503 when off — disable without deploy |

### 9.5 API error contract (v3.0)

```json
{ "error": { "code": "rate_limited", "message": "Too many messages — try again soon.", "retryAfterSeconds": 900 } }
```

| HTTP | `code` | Widget behaviour (§8.9 states) |
|------|--------|--------------------------------|
| 400 | `invalid_input` | inline notice; input preserved |
| 429 | `rate_limited` | rate-limit state: Setu `unsure`, send disabled + countdown from `retryAfterSeconds`; **no automatic client retry** |
| 503 | `unavailable` | `error` state: soft apology + manual retry button |
| (network) | — | offline state: retry button, input preserved |

### 9.4 Analytics

`chat_opened` · `chat_message_sent` · `chat_link_clicked` · `chat_tool_cta` · `chat_feedback` · `chat_escalation` — wire to existing site analytics; else Appwrite-adjacent log.

---

## 10. Evaluation & QA

### 10.1 Gate 0 — headless routing eval (v3.0 · from CEO review · BLOCKS UI BUILD)

The riskiest assumption is routing quality, not tech. Test it **before any UI or mascot spend**: build only `site-routing.ts` + index + `retrieve.ts`, then run the golden set headless.

- **`eval/chat-golden.json` case schema:**
  ```json
  { "id": "consent-01", "category": "consent", "question": "Do I need consent for WhatsApp marketing?",
    "expected_primary_url": "/learn/consent", "allowed_secondary": ["/learn/notice", "/glossary"],
    "must_refuse": false, "forbidden_phrases": ["section 43A", "₹"] }
  ```
- **Runner:** `scripts/run-chat-eval.mjs` — executes every case through retrieval + router (and later the full API path), reports per-category pass rates.
- **Pass bar:** ≥ 90% correct primary URL · **0** off-site citations · < 2% wrong-cite.
- **Rule: Sprint 2 (widget) does not start until Gate 0 passes.** Fail → tune similarity floor / chunking / router triggers and re-run — days of tuning, not weeks of UI rework.

### 10.2 Golden set & ongoing QA

- **Golden set ≥ 40:** Applicability(8) · Consent/Notice(8) · Industry(12 — **one per industry**) · Rights/Erasure(6) · Breach/Penalty(6) · Navigation-only(8) · Off-scope refusal(4)  
- Each case: expected primary URL, disclaimer, forbidden claims, refusal when required  
- Automated: URL ∈ `ROUTES` + HTTP 200; domain check; no PII; Tier-1/2 for substantive; latency  
- Human: ~20 feedback-sampled reviews / week; full golden re-run on regulatory change  
- **Hard targets:** wrong citation **< 2%**; **off-site hallucination = 0**  
- Motion QA: no stuck `thinking`; `unsure`/`error` fire correctly; reduced-motion parity; keyboard path; pause on hidden tab  
- **Design gate:** `/plan-design-review` avg ≥ 8 on widget UI before build  

---

## 11. Phased rollout (lean · gaps closed)

### Phase 1 — MVP (ship the guide) — **Gate 0 first**

- **Gate 0: headless routing eval passes (§10.1) before any UI work**  
- First-party chat on all public pages, behind `NEXT_PUBLIC_CHAT_ENABLED`  
- **In-repo index: learn + FAQ + glossary + checklist + all 12 industries + tool blurbs**  
- Setu/Bindu 3-step voice + streaming protocol (§5.5) + request hygiene (§5.6)  
- Citations, Open cards, disclaimer, refusal-below-floor, 👍/👎  
- **Hard rate cap + origin checks + kill switch + error contract (§9.3/§9.5)** — promoted from Phase 2  
- **Static avatar exported from the existing master (§8.7)** + light chrome motion  
- `chat_feedback` + `chat_rate` collections  
- Conversion analytics live from day one — `chat_tool_cta` is the north-star (§0.1)  
- Refresh `public/llms.txt` industries 4 → 12  

### Phase 2 — polish navigation + motion

- Page-context greetings polish  
- Tool hand-offs UX (discovery, notice generator, assessment, penalty)  
- Rive `.riv` character states (pointing / unsure / guide live)  
- Analytics dashboard  
- Escalation flow polish  

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

- [ ] **Gate 0 passed** (≥ 90% routing, 0 off-site, < 2% wrong-cite) before widget build began  
- [ ] DPDPA question → answer with ≥ 1 valid saralprivacy.com link  
- [ ] Industry query → correct `/industries/{slug}` (any of 12)  
- [ ] Penalty query → `/penalty-calculator`  
- [ ] “Not legal advice” visible entire session  
- [ ] Below-floor retrieval → refuse; **zero** non-saralprivacy citations in QA  
- [ ] Streaming shows Setu text before cards; cards only after URL validation  
- [ ] **429 fires at the hard cap** (fail-closed); direct `curl` without origin/header rejected; kill switch verified off→on  
- [ ] `chat_tool_cta` conversion event fires end-to-end (north-star instrumented)  
- [ ] Avatar (static OK): thinking → speaking → pointing (or CSS equivalents)  
- [ ] Keyboard smoke test + `aria-live` announcement + `prefers-reduced-motion` parity  
- [ ] Golden set ≥ 90% primary-URL routing **through the full API path**  
- [ ] First-token < 8 s; p95 < 12 s  

---

## 14. File map (net-new)

| Path | Purpose |
|------|---------|
| `SETU_BINDU_CHATBOT_SPEC.md` | This document (canonical) |
| `lib/chat/site-routing.ts` | Typed routes + helpers |
| `lib/chat/system-prompt.md` | LLM system prompt |
| `lib/chat/retrieve.ts` | Load index + cosine top-k |
| `lib/chat/redact.ts` | PII redaction |
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
| **3.0** | 2026-07-19 | **Final, build-approved.** Folded CEO review: §0.1 success metrics (north-star = chat-originated tool starts ≥10%), hard rate cap + origin checks + kill switch promoted to Phase 1 (§9.3), Gate 0 headless routing eval blocks UI build (§10.1). Gap fixes: request hygiene & cost guards (§5.6), API error contract (§9.5), `chat_feedback`/`chat_rate` attribute schemas (§9.2), extraction mechanics locked (§4.1), bundle discipline (§8.1), `aria-live` (§8.6), avatar blocker cleared via existing master (§8.7), validated `suggested_followups`. Sprint plan: `SETU_BINDU_SPRINT_PLAN.md`. |
| **2.3** | 2026-07-15 | Added §11.1 Voice & multilingual (Phase 3, optional, consent-gated): Sarvam-primary/ElevenLabs-secondary TTS + Sarvam ASR as an I/O skin on the grounded brain; speech-to-speech agents (Grok Voice etc.) excluded for breaking grounding; India data-residency preference noted. Out-of-scope + Phase-3 lines updated. |
| **2.2** | 2026-07-14 | Canonical rewrite with plan gaps closed: Phase 1 indexes all 12 industries; streaming two-phase protocol; MVP rate-limit + embedding defaults locked; avatar ownership/timing locked; golden set one-per-industry; full navigation motion states retained from 2.1 |
| 2.1 | 2026-07-14 | Motion-graphic fold-in: Rive states, event bridge, animation/confidence/grounding fields, brand tokens, zero-hallucination audit |
| 2.0 | 2026-07-14 | Live-site rewrite: 12 industries, first-party, in-repo index, reuse AI SDK, privacy-first |
| 1.0 | 2026-06-17 | Original navigation-first draft |
