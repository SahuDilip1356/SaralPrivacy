# SaralPrivacy Motion Graphic Chatbot — Spec V2

> **Product name:** Setu Guide (working title)  
> **Version:** 2.0  
> **Status:** Ready for design + engineering  
> **Last updated:** 14 July 2026  
> **Hard boundary:** Answers and navigation only from content published on saralprivacy.com. Nothing beyond.

---

## 0. Why this V2 exists

V1 covered a helpful text chatbot with site links.  
V2 upgrades that into a **motion-graphic guide** — Setu (and optionally Bindu) as living characters who:

1. **Listen** to the user’s question  
2. **Explain** only what SaralPrivacy already teaches  
3. **Walk the user** to the correct page/tool on the site  
4. **Never invent** law, penalties, or off-site advice  

**Analogy:** Like a museum docent with a tablet. They can only talk about exhibits in *this* museum, and they physically take you to the right gallery. They do not invent a new wing.

---

## 1. One-page product snapshot

| Field | Decision |
|-------|----------|
| **What** | Animated on-site DPDPA guide for saralprivacy.com |
| **Who** | Indian SMB operators (founders, HR, CA firms, training institutes, D2C brands) |
| **Job** | “Help me understand this DPDPA topic and take me to the right SaralPrivacy page.” |
| **Not** | Law firm, legal advice engine, general web search, open-domain chatbot |
| **Visual form** | Motion-graphic mascot (Setu primary; Bindu secondary) driven by real-time states |
| **Knowledge** | Strict RAG / retrieval over SaralPrivacy pages only |
| **Success** | User gets a correct, cited answer + clicks through to the right page |

### 1.1 Non-negotiable product rules

1. **Site-only knowledge.** If it is not on saralprivacy.com (indexed content), the bot must say it does not have that on the site and offer FAQ / Contact.  
2. **Navigation is a first-class job**, not a footnote. Every substantive answer includes 1–3 Open actions.  
3. **Educational, not legal advice.** Persistent disclaimer.  
4. **Motion supports understanding**, never distracts from compliance clarity.  
5. **Respect `prefers-reduced-motion`.** Text-only fallback always works.

---

## 2. Product vision (plain English)

SaralPrivacy already has the library: Learn pages, FAQ, glossary, industry guides, assessment, penalty indicator, briefings, white paper.

Visitors still get lost: menus are many, questions are messy, confidence is low.

**Setu Guide** sits on every public page as a calm animated guide. Ask in plain English; Setu answers from SaralPrivacy’s own pages and opens the right door — consent guide, CA industry page, readiness assessment, etc.

Bindu (optional second voice) asks the clarifying question the user was thinking, so the answer stays sharp.

---

## 3. Scope — what is in / what is out

### 3.1 In scope (must ship)

| Capability | Detail |
|------------|--------|
| Answer DPDPA concepts | Only from indexed SaralPrivacy educational content |
| Site navigation | Deep-link + “Open” cards to canonical URLs |
| Industry routing | Recruitment, CA, Training, D2C guides |
| Tool handoff | Assessment, Penalty Risk Indicator, White Paper |
| Motion avatar | Setu states: Idle, Listening, Thinking, Speaking, Pointing/Guide, Unsure, Celebrate-light |
| Dual voice (optional) | Bindu short bubble for clarify/restate |
| Page awareness | Knows which URL the chat opened on |
| Guardrails | Disclaimer, no PII fishing, low-confidence refuse |
| Accessibility | Keyboard, screen reader, reduced motion |

### 3.2 Explicitly out of scope

- Answering from general internet / Wikipedia / other law sites  
- Drafting custom privacy policies as legal documents  
- Reviewing uploaded contracts for legal validity  
- Submitting assessment answers on user’s behalf  
- Predicting exact fines for a real case  
- Non-DPDPA topics (tax, company law, politics)  
- Kids-mode cartoon comedy in Pro compliance context  
- Voice call / phone agent (Phase 3+ optional)

### 3.3 Knowledge allowlist (source of truth)

**Primary index sources**

- `https://saralprivacy.com/llms.txt`  
- `https://saralprivacy.com/llms-full.txt`  
- All Tier-1 `/learn/*` pages listed in llms-full  
- `/faq`, `/glossary`  
- `/industries/*` (4 guides)  
- `/assessment` (entry page only — not wizard steps as authority)  
- `/penalty-calculator`  
- `/white-paper`  
- `/briefings`, `/blog` (freshness only; never override Learn pages)

**Must not use as primary educational authority**

- `/consent-preferences`, `/privacy`, `/terms`  
- `/admin/*`, `/api/*`  
- `/assessment/*` wizard internals  
- Any URL outside `saralprivacy.com`

---

## 4. Motion graphic design system

### 4.1 Character roles in the UI

| Character | Visual | Chat role | Motion role |
|-----------|--------|-----------|-------------|
| **Setu** | Electric-blue cyber squirrel, glasses, calm | Main explainer | Speaks, points to cards, thinks |
| **Bindu** | Tiny red precision drone | Clarifier (short) | Hover pulse, “check” nod |

Public brand name: **Setu**. Lore name Setuansh only if user asks who Setu is.

### 4.2 Recommended animation stack

| Choice | Recommendation | Why |
|--------|----------------|-----|
| **Primary runtime** | **Rive** (`.riv` + state machine) | Real-time Idle/Thinking/Speaking; not pre-rendered video |
| **Fallback / micro** | Lottie for simple UI flourishes | Linear moments only |
| **No** | Full HeyGen/talking-head video in-widget for MVP | Latency, cost, accessibility |

### 4.3 Avatar state machine (product states, not art for art’s sake)

| State | Trigger | User meaning |
|-------|---------|--------------|
| `idle` | No activity | “I’m here if you need me” |
| `greeting` | Widget open | Warm, short welcome |
| `listening` | User typing / mic (if any) | “I’m paying attention” |
| `thinking` | Waiting on API / retrieval | “Looking it up on SaralPrivacy…” |
| `speaking` | Streaming or speaking answer | Mouth/gesture loop |
| `pointing` | Citation/action cards shown | “Go here” — gesture toward cards |
| `unsure` | Low retrieval confidence | Humble shrug; offer FAQ/Contact |
| `guide` | Navigation CTA clicked | Brief “this way” before route change |
| `error` | Network/API failure | Soft apology; retry |

**Rules**

- One emotional beat at a time (Character Bible: face + one prop + one panel).  
- Prop default: TailPad for explanation; pointing hand/gesture for navigation.  
- No chaotic buzzing; Bindu hover is smooth.  
- Cap motion: ≤ 60fps, pause when tab hidden.  
- `prefers-reduced-motion: reduce` → static illustration + CSS fade only.

### 4.4 Motion + brand tokens (SaralPrivacy)

Align widget chrome with SaralPrivacy design language:

- Trust Navy `#121A2E` — panel header, headings  
- Verification Green `#07B981` — primary Open / CTA  
- Assurance Teal `#35B6AE` — links, secondary accents  
- Signal Gold `#E8AB42` — rare urgency/new signals only  
- Cloud `#F7F9FC` — panel background  

Mascot remains playful but **not childish**; compliance stays serious.

### 4.5 Motion moments tied to jobs (not decoration)

| Job | Motion moment |
|-----|----------------|
| User opens chat | Greeting → Idle |
| User asks question | Listening → Thinking |
| Answer ready | Speaking + text stream |
| Links appear | Pointing toward Open cards |
| User clicks Open | Guide flash → navigate |
| No answer on site | Unsure + FAQ/Contact cards |
| User finishes assessment CTA | Light celebrate (subtle, not fireworks) |

---

## 5. Conversation & navigation UX

### 5.1 Opening (page-aware)

**Default**

> **Setu:** Hi — I’m Setu. I can explain DPDPA topics using SaralPrivacy’s guides and take you to the right page.  
> **Bindu:** What’s on your mind — consent, whether the law applies, or your industry?

**If opened on `/industries/ca-firms`**

> **Setu:** You’re on the CA Firms guide. Ask me anything here, or jump to retention, duties, or the readiness assessment.

### 5.2 Quick-reply chips (always site-routable)

1. Does DPDPA apply to me? → `/learn/applicability`  
2. Consent & notices → `/learn/consent` + `/learn/notice`  
3. My industry → industry picker → `/industries/*`  
4. Data breach — what do I do? → `/learn/data-breach`  
5. Take readiness assessment → `/assessment`  
6. Penalty risk indicator → `/penalty-calculator`

### 5.3 Answer shape (every turn)

1. **Bindu** (optional, ≤ 2 short lines): clarify or restate question  
2. **Setu**: plain-English answer grounded in retrieved SaralPrivacy text  
3. **One practical next step**  
4. **1–3 Open cards** (title + reason + URL)  
5. **Suggested follow-ups** (2–3) that also stay on-site  
6. Disclaimer strip always visible: *Educational only — not legal advice.*

### 5.4 Navigation modes

| Mode | Behaviour |
|------|-----------|
| **Cite** | Inline markdown links in Setu’s text |
| **Card** | Structured Open buttons (primary UX) |
| **Handoff** | Assessment / Calculator / White Paper CTAs |
| **Soft redirect** | Optional “Open in this tab” vs “New tab” (default new tab to preserve chat) |

### 5.5 Refusal patterns (site boundary)

When off-scope or not found:

> **Setu:** I can only help with what’s on SaralPrivacy. I don’t have that in our guides yet.  
> **Actions:** Open FAQ · Contact · Learning Hub  

Never hallucinate a page. Never invent a section number not in retrieval.

---

## 6. Information architecture & routing

### 6.1 Tier priority (router)

| Tier | Zone | When to use |
|------|------|-------------|
| 1 | `/learn/*`, `/faq`, `/glossary` | Substantive DPDPA concepts |
| 2 | `/industries/*` | Sector or workflow mentioned |
| 3 | `/assessment`, `/penalty-calculator`, `/white-paper` | Self-check / risk / download |
| 4 | `/briefings`, `/blog` | “What’s new / latest” only |
| 5 | `/contact`, `/about` | Human help / who we are |

**Conflict rule:** Tier 1 beats Tier 4. Industry page + Learn page can both be shown (industry first if sector is clear).

### 6.2 Canonical topic map (abbreviated)

| Topic | Primary URL |
|-------|-------------|
| Overview | `/learn/what-is-dpdpa` |
| Applicability | `/learn/applicability` |
| Consent | `/learn/consent` |
| Notice | `/learn/notice` |
| Rights | `/learn/rights` |
| Breach | `/learn/data-breach` |
| Children | `/learn/childrens-data` |
| Retention | `/learn/retention` |
| Cross-border | `/learn/cross-border` |
| Duties | `/learn/duties` |
| Key terms | `/learn/key-terms` |
| Myths | `/learn/myths` |
| Act text | `/learn/dpdp-act-2023` |
| Rules 2025 | `/learn/dpdp-rules-2025-plain-english-guide` |
| Recruitment | `/industries/recruitment-agencies` |
| CA | `/industries/ca-firms` |
| Training | `/industries/training-institutes` |
| D2C | `/industries/d2c-brands` |

Full machine map: maintain in `config/site-routing.json` (sync from llms-full.txt).

### 6.3 Regulatory context (inject; refresh quarterly)

From llms-full (as of March 2026 review):

- Act assent Aug 2023; Rules notified Nov 2025  
- DPB not yet constituted; enforcement phased / date not officially notified  
- Penalty caps: up to ₹250 crore (SDF) / ₹200 crore (others) — always frame as statute-level, not case advice  
- Always prefer linking Penalty Risk Indicator over inventing risk bands

---

## 7. Technical architecture

### 7.1 Components

```
[Widget UI]
  - Rive Setu/Bindu stage
  - Message list (Setu / Bindu bubbles)
  - Open cards + chips
  - Disclaimer + feedback
        │
        ▼
[Chat API]  POST /api/chat
  - Session + rate limit
  - Intent + industry slots
  - Site router (JSON rules)
  - RAG retrieve (site only)
  - LLM with tools (no open web)
  - Response JSON → UI + animation events
        │
        ▼
[Ingestion]
  - Crawl allowlisted URLs
  - Chunk + embed + metadata (url, tier, topics)
  - Nightly + on-publish webhook
```

### 7.2 Animation event bridge

API/UI emits semantic events; Rive maps them:

| Event | Rive input |
|-------|------------|
| `chat_opened` | greeting |
| `user_typing` | listening |
| `retrieval_started` | thinking |
| `answer_streaming` | speaking |
| `citations_ready` | pointing |
| `low_confidence` | unsure |
| `navigate_clicked` | guide |
| `api_error` | error |

**Rule:** AI never drives keyframes directly. Product state → Rive inputs.

### 7.3 API response contract

```json
{
  "messages": [
    { "speaker": "bindu", "text": "..." },
    { "speaker": "setu", "text": "..." }
  ],
  "citations": [
    { "title": "...", "url": "https://saralprivacy.com/learn/consent", "tier": 1 }
  ],
  "actions": [
    { "type": "open_url", "label": "Open consent guide", "url": "https://saralprivacy.com/learn/consent" }
  ],
  "animation": { "state": "pointing", "intensity": 0.7 },
  "suggested_followups": ["...", "..."],
  "confidence": "high",
  "disclaimer": "Educational only — not legal advice.",
  "grounding": { "used_urls": ["https://saralprivacy.com/learn/consent"], "refusal": false }
}
```

### 7.4 Strict grounding policy

| Check | Enforcement |
|-------|-------------|
| Citation domain | Must be `saralprivacy.com` |
| URL allowlist | Must exist in index / site-routing |
| Empty retrieval | Refuse + FAQ/Contact; `confidence: low` |
| Similarity threshold | Below threshold → refuse (tune via golden set) |
| Open-web tools | **Disabled** |
| Model knowledge | May only paraphrase retrieved chunks; never fill gaps from training data |

### 7.5 System prompt hard lines (summary)

- You are Setu/Bindu on SaralPrivacy.  
- Use only `<retrieved_context>` and routing hints.  
- Navigate users with Open actions.  
- Not legal advice.  
- If missing from site: say so.  
- One concept, one example, one next step.  
- Uncertainty: say calmly; link Learn/FAQ.

Full prompt: `prompts/system-prompt.md` (update for V2 animation field).

### 7.6 Stack recommendation

| Layer | Choice |
|-------|--------|
| Widget | React/Preact embed |
| Animation | Rive Web runtime |
| API | Next.js / Node on SaralPrivacy host |
| LLM | Tool-calling model (server-side keys only) |
| Vector store | pgvector / Pinecone / equivalent |
| Analytics | Privacy-friendly events (PostHog/Plausible) |

---

## 8. Privacy, safety, compliance for the bot itself

| Topic | Requirement |
|-------|-------------|
| Data collected | Anonymous session id; optional feedback; message text transient |
| Retention | Default ≤ 30 days unless user opts into transcript email (Phase 2) |
| Do not ask for | Aadhaar, PAN, victim identities, passwords |
| Breach queries | Educational page + Contact; urge qualified counsel for real incidents |
| Cookies | Respect consent preferences; load analytics only if allowed |
| Security | CORS site-only; rate limits; prompt-injection isolation; PII redaction in logs |

---

## 9. Success metrics

| Metric | Target (90 days) |
|--------|------------------|
| Sessions with ≥1 Open click | ≥ 40% |
| Assessment / calculator starts from chat | ≥ 12% |
| Helpful rating | ≥ 80% |
| Wrong/missing citation (audit) | < 2% |
| Off-site hallucination (audit) | **0** |
| p95 answer latency | < 12s |
| Reduced-motion users complete job | Same success rate as motion users |

---

## 10. Evaluation

### 10.1 Golden set (expand to 50+)

Categories: applicability, consent, rights, breach, penalties, industry (×4), navigation-only, off-scope refusal, myths/uncertainty.

Assertions per case:

- Expected primary URL  
- Allowed secondary URLs  
- Must refuse if off-scope  
- Disclaimer required  
- Forbidden phrases (fake certainty, invented fines)

### 10.2 Motion QA

- State transitions correct under slow network  
- No stuck Thinking  
- Reduced motion path verified  
- Keyboard: open, send, open card, close  

---

## 11. Phased delivery

### Phase A — Spec & assets (1–2 weeks)

- Lock this V2  
- Rive artboard + state machine v1 (Setu only)  
- Final site-routing.json synced to llms-full  

### Phase B — MVP (4–6 weeks)

- Widget on homepage + `/learn/*`  
- RAG over Tier 1 + FAQ + glossary  
- Text + Open cards + Setu motion states  
- Disclaimer, rate limits, golden set ≥ 90% routing pass  

### Phase C — Site-wide guide (2–3 weeks)

- All industries + tools  
- Page-aware greetings  
- Bindu optional bubble  
- Analytics dashboard  

### Phase D — Polish

- Briefings/blog freshness  
- Stronger pointing/guide moments  
- Optional TTS (accessibility-aware)  
- Hindi/Hinglish only if product approves  

---

## 12. Acceptance criteria (MVP)

- [ ] Answers only from SaralPrivacy-indexed content  
- [ ] Off-site / unknown topics refuse cleanly  
- [ ] Every substantive answer has ≥1 valid Open card  
- [ ] Industry questions hit correct `/industries/*`  
- [ ] Penalty questions offer `/penalty-calculator`  
- [ ] Setu shows Thinking → Speaking → Pointing  
- [ ] Reduced-motion mode works  
- [ ] “Not legal advice” always visible  
- [ ] Golden set routing ≥ 90%  
- [ ] Zero citations to non-saralprivacy domains in QA  

---

## 13. Open decisions (need your call)

| # | Question | Suggested default |
|---|----------|-------------------|
| 1 | Setu only at launch, or Setu+Bindu day one? | Setu motion + Bindu as text bubble first |
| 2 | Open links in new tab vs same tab? | New tab |
| 3 | Voice / TTS in MVP? | No — text + motion only |
| 4 | Transcript storage? | 30-day anonymized |
| 5 | Widget on all public pages or Learn-first? | Learn + Home first, then all |

---

## 14. What improved vs V1

| Area | V1 | V2 |
|------|----|----|
| Form | Text chat + links | Motion-graphic guide with state machine |
| Boundary | Grounded | **Hard site-only allowlist + refuse** |
| Navigation | Supporting | **Core product job with Open cards + pointing** |
| Brand UI | Generic mention | SaralPrivacy tokens + Character Bible motion rules |
| Accessibility | Basic | Reduced-motion path as first-class |
| Eval | Golden questions | + hallucination = 0, motion QA |
| Architecture | RAG + tools | + animation event bridge |

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 2.0 | 2026-07-14 | Motion-graphic, site-only guide; Rive states; stricter scope; SaralPrivacy design tokens |
| 1.0 | 2026-06-17 | Initial text + routing chatbot spec |
