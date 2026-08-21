# Setu Outcome Layer — Enhancement Spec

> **Version:** 1.0 · **Date:** 2026-08-21 · **Status:** proposed, awaiting decisions D10–D14
> **Parent spec:** `SETU_BINDU_CHATBOT_SPEC.md` v2.4 (canonical) — this document extends it, never overrides it
> **Also read:** `SETU_CHARACTER_CANON.md` · `SETU_JAILBREAK_HARDENING.md` · `HANDOFF_SETU_VOICE_MULTILINGUAL.md` · `docs/Setu_Knowledge_Universe_RAG_Strategy.md`
> **Branch:** `feature/setu-outcome-layer` (cut from `main`, developed in parallel — see §15)
> **Owner:** Dilip Sahu

---

## 0. What this is

Setu ships today as a grounded site guide: it answers DPDPA questions from a 406-chunk corpus, refuses below the retrieval floor, and attaches server-validated page cards. That part works — golden set 70/70, zero off-site citations, first token 1.7–2.4 s.

What Setu has no version of is **what happens after a good answer**. Every conversation terminates in the same place: an `open_url` card. There is no booked call, no human handoff, no captured lead, and no server-side record that the conversation happened at all.

This spec defines the **outcome layer** — the wrapper around the existing brain that gives a good conversation somewhere to land. It was written after a teardown of two competitor patterns (Akamai's "Kai", Pathlock's "Gracie"), both of which are AI sales agents rather than knowledge agents. The teardown's conclusion drives this document:

> Setu is not behind on intelligence. On grounding, citation integrity and injection hardening it is ahead of both reference bots. It is missing an outcome layer, and that layer can be built without touching the grounding architecture at all.

### 0.1 The inherited contract — what this spec must not break

These are load-bearing and out of bounds for every workstream below. Any change that touches them is out of scope for this spec and needs its own decision record.

| Guarantee | Where it lives | Why it is untouchable |
|---|---|---|
| Model is never called below the retrieval floor | `orchestrate.ts` `planTurn().refuse` → `route.ts` early return | Zero-hallucination guarantee; a wrong DPDPA answer is a liability for the SMB that acts on it |
| Model streams **text only** | `route.ts` `streamText` | Citations/actions cannot be model-authored |
| Citations and actions are server-built from an allowlist | `orchestrate.ts` `buildMeta` + `isValidCitation` | A model literally cannot emit a URL the router doesn't know |
| History is HMAC-verified before it re-enters the prompt | `guard.ts` `verifyTurn` / `signTurn` | Prevents forged assistant turns putting words in Setu's mouth |
| Per-turn nonce closes the user block | `guard.ts` `newNonce` / `wrapUserMessage` | Prevents early block closure and framework-voice continuation |
| Output leak scan with `LEAK_HOLDBACK` | `route.ts` stream loop | System-prompt leakage never reaches the browser |
| PII is detected, warned, never echoed | `redact.ts` + turn notes | Text widget deliberately avoids collecting personal data |
| Golden set gates merge | `eval/chat-golden.json`, `golden.test.ts` | Routing accuracy cannot silently regress |

### 0.2 What this spec does *not* do

- It does not turn Setu into a sales agent. See §2.1.
- It does not add cross-session behavioural tracking, visitor profiling, or firmographic enrichment. See §3.2 and §9.4 — this is a deliberate, permanent refusal, not a phasing decision.
- It does not change retrieval, the corpus, the index, or the system prompt's boundary rules.
- It does not implement voice. That remains governed by parent spec §11.1 and is sequenced after this work.

---

## 1. Problem statement — the observed state

Four findings from reading the shipped code on `main`, each independently verifiable.

**1.1 The escalation path is a dead end.** `orchestrate.ts` detects escalation intent via `ESCALATE_RE` ("talk to a human", "need a lawyer", "privacy expert"). On a match, `buildActions()` pushes exactly one card: `{ type: "open_url", label: "Talk to a human — Contact SaralPrivacy", url: "/contact" }`. The user lands on an empty form. The industry Setu detected, the journey they were in, the facts they confirmed, the pages they were shown, and the question that stalled — all discarded.

**1.2 Escalation is not instrumented.** `trackEvent.chatEscalation` is defined in `lib/analytics.ts` and **called from nowhere in the codebase**. There is currently no data on how often users ask Setu for a human. This is the metric that would size the entire opportunity, and it has never been collected.

**1.3 Feedback is failing silently.** `COLLECTIONS.CHAT_FEEDBACK` is declared in `lib/appwrite.ts` and `/api/chat/feedback` writes to it, but per the Phase-3 handoff note the collection was never created in the Appwrite console. The route catches the failure and returns `{ stored: false }` deliberately, so chat UX never breaks — which means 👍/👎 has been discarding data since launch without a visible symptom.

**1.4 There is no lane structure.** The opening state renders `chipsForPage()` — three content questions of equal visual weight. Every path leads back into the same retrieval loop. A user who arrives wanting a person, or wanting to start the assessment, has no affordance that says so.

### 1.5 Parent-spec drift worth recording

`ChatSessionState` in the parent spec §9.2 includes a `proactive: { shownAt?, dismissedUntil?, muted }` field. The shipped `journeys.ts` interface omits it; proactive state lives separately in `SetuChat.tsx` under the `sp_setu_proactive` localStorage key. The shipped split is fine and this spec does not change it — but §9.2 of the parent should be corrected to match reality when it is next revised.

---

## 2. Design principles

Five rules. Where a later section conflicts with one of these, the principle wins.

### 2.1 Setu guides. Setu never sells.

Kai is a sales representative; Setu is a museum guide. The character canon — 80% clarity, 15% warmth, 5% playfulness, no fear-mongering, no exclamation marks — is a deliberate rejection of compliance FUD selling, and it is the reason the brand is trusted by people who are frightened of a new law.

The outcome layer therefore adds a **door**, not a pitch. Setu recognises the moment a human should take over and opens that door cleanly. It never argues for a meeting, never creates urgency, never mentions pricing, and never re-offers a declined handoff in the same session.

### 2.2 Personalise from the page, never from a profile.

Roughly 80% of what makes a competitor's opener feel intelligent comes from knowing the page the visitor is on right now — which Setu already receives on every turn as `pageUrl`. The remaining 20% ("I noticed you visited three pages last week") requires cross-session tracking and is refused permanently under §3.2.

### 2.3 One lead path.

The widget collects; `/api/contact`'s validated shape stores. A second lead path would duplicate honeypot checks, rate limiting, consent-version stamping and the consent-log write, and the two would rot out of sync. See §6.4.

### 2.4 The refusal floor is not a tunable.

Once the funnel is visible there will be pressure to let Setu answer marginal questions rather than refuse and lose the session. The floor stays where it is. Conversion is measured *downstream* of a correct answer, never by loosening what counts as one.

### 2.5 Every workstream is measurable before the next begins.

W0 ships no user-visible change and exists solely to make the rest legible. No workstream merges without its metric already flowing.

---

## 3. Scope

### 3.1 In scope — five workstreams

| ID | Workstream | Est. | Ships |
|---|---|---|---|
| **W0** | Instrumentation & baseline | ~1 wk | No user-visible change |
| **W1** | Outcome lanes | ~1 wk | Three-lane opening state, named composer |
| **W2** | Human handoff + in-widget capture | ~2 wk | The §9.5 packet, realised |
| **W3** | Contextual openers + qualification | ~2 wk | Page-specific proactive messages, diagnostic opener |
| **W4** | Trust chrome | ~1 wk | "What Setu remembers", honest footer, off switch |

W0 → W1 → W2 is a hard sequence. W3 and W4 may run in parallel with each other once W1 has merged.

### 3.2 Out of scope — permanently

These are refusals, not backlog items. Recording them here so the question does not reopen every quarter.

| Excluded | Why |
|---|---|
| **Cross-session behavioural tracking** | Brand-existential for a company selling DPDPA compliance; requires consent machinery built to serve a marketing feature; reverses the deliberate July-2026 cookieless-analytics decision. Note that Akamai themselves gate their bot behind cookie preferences — the reference implementation already concedes this needs permission |
| **Reverse-IP firmographic enrichment** | Same reasoning. Resolving an anonymous visitor to a named company before they identify themselves is precisely the pattern SaralPrivacy's content warns customers about |
| **AI-SDR persona / sales pressure** | Violates §2.1 and the character canon |
| **Speech-to-speech voice agents** | Parent spec §11.1 — they run their own dialogue loop and bypass retrieval entirely. Unchanged by this spec |
| **Setu executing tools on the user's behalf** | Parent spec §15 — tools describe and deep-link; quizzes execute only on their own pages |
| **Live agent chat** | No staffing model exists. The handoff is asynchronous (callback), not a transfer into a queue |

---

## 4. W0 — Instrumentation & baseline

**Goal:** make the outcome layer measurable before any of it exists. Ships no user-visible change.

### 4.1 Create the `chat_feedback` collection

Schema is already specified in parent §9.2 and needs no redesign — create it to that table exactly (`sessionId`, `turnId`, `helpful?`, `reason?`, `pageUrl?`, `failureKind?`, `redactedQuestion?`, `ts`). Permissions: create = any (route is server-side with API key); read = team only.

Add the collection to `scripts/setup-appwrite.mjs` so it is reproducible rather than hand-made in the console. Verify with a real write from preview before closing the ticket — the route's graceful degradation means a silent failure looks identical to success from the client.

### 4.2 Wire `chat_escalation`

Fire `trackEvent.chatEscalation({ reason })` at the point escalation is *detected*, not where the card is clicked — a user who is offered the human door and doesn't take it is exactly the signal worth having.

`reason` enum: `explicit_ask` · `journey_stalled` · `repeat_refusal` · `negative_feedback`. In W0 only `explicit_ask` can fire (the others are introduced in W2 §6.1); ship the enum complete so the dashboard doesn't need re-cutting later.

Detection happens server-side in `orchestrate.ts`, but `trackEvent` is client-side. Carry the flag through `ChatMeta` as a new optional field:

```ts
// orchestrate.ts — ChatMeta addition
escalation?: { reason: "explicit_ask" | "journey_stalled" | "repeat_refusal" | "negative_feedback" };
```

`useSetuChat.ts` fires the event when it parses a meta block carrying it. This keeps the existing two-phase protocol unchanged — `escalation` is one more server-built, model-inaccessible field alongside `citations` and `actions`.

### 4.3 New analytics events

Added to `lib/analytics.ts` alongside the existing eight. No PII, no message text — sector, lane, reason and counts only, per the file's own standing rule.

| Event | Payload | Fires when |
|---|---|---|
| `chat_lane_selected` | `{ lane, page }` | User picks an outcome lane (W1) |
| `chat_handoff_opened` | `{ reason, journey?, industry? }` | Capture form is shown (W2) |
| `chat_handoff_submitted` | `{ journey?, industry? }` | Packet accepted by the server (W2) |
| `chat_handoff_abandoned` | `{ reason, fieldsFilled }` | Form shown, panel closed without submit (W2) |
| `chat_opener_answered` | `{ page, slot }` | User answers a qualification opener (W3) |
| `chat_memory_viewed` | `{}` | "What Setu remembers" opened (W4) |
| `chat_memory_cleared` | `{}` | User clears session state (W4) |

⛔ Per the standing warning at the top of `lib/analytics.ts`: verify each new event actually reaches the Vercel dashboard on preview (network tab: `POST /_vercel/insights/event`) before merge. Twenty-three events were silent no-ops for months because this check was skipped once.

### 4.4 The funnel

The one definition everything downstream is judged against:

```
chat_opened
  → chat_message_sent (first)
    → answered (meta.refusal === false)
      → chat_lane_selected | chat_link_clicked | chat_tool_cta
        → chat_escalation
          → chat_handoff_opened
            → chat_handoff_submitted
```

Two derived metrics matter more than any single event:

- **Answer-to-action rate** — of sessions that got a non-refused answer, the share that clicked anything at all. This is the number the outcome layer exists to move.
- **Silent abandonment** — sessions that open, ask exactly once, and leave without clicking. Currently invisible; likely the largest cohort.

### 4.5 Exit criteria

- [ ] `chat_feedback` collection exists; a write from preview is confirmed present in Appwrite
- [ ] `chat_escalation` observed firing on a live `explicit_ask` turn
- [ ] All seven new events verified reaching the dashboard on preview
- [ ] **Two weeks of clean baseline collected.** Every later workstream reports against this baseline, so it is a gate, not a formality

---

## 5. W1 — Outcome lanes

**Goal:** give the opening state a structure that admits more than one kind of intent.

### 5.1 The three lanes

Borrowed from the reference bots' two-or-three-lane pattern, mapped onto what SaralPrivacy actually offers.

| Lane | Label | Behaviour | Downstream |
|---|---|---|---|
| **Learn** | "Ask about DPDPA" | Focuses the composer; existing `chipsForPage()` chips render beneath | Existing retrieval loop — unchanged |
| **Assess** | "Check my readiness" | Sends a seeded message that enters journey J3 | `/assessment` deep link via existing `buildActions` journey path |
| **Human** | "Talk to a person" | Opens the W2 capture flow directly | `POST /api/chat/handoff` |

The Human lane is inert until W2 lands. Until then it sends a seeded message that trips `ESCALATE_RE`, producing today's `/contact` card — so W1 can merge and be measured independently.

### 5.2 Visual hierarchy

The current opening state renders three chips of equal weight, which communicates no priority. Pathlock's pattern — full-width high-contrast buttons for the lanes that matter, free-text composer beneath — is the hierarchy to adopt.

Using existing tokens from parent §8.9, no new colours:

- **Assess** and **Human** render as full-width buttons, Verification Green `#07B981` on Trust Navy `#121A2E` text, stacked with `gap-2`
- **Learn** is not a button — it is the composer itself, already present, with chips beneath as today
- Lane buttons appear **only in the empty state** (`messages.length === 0`), exactly where `chipsForPage` renders now. They do not persist into the conversation; once a turn has happened, the existing follow-up chips take over

### 5.3 Composer placeholder

Change the placeholder to **"Ask Setu a question"**. One string in `lib/chat/strings.ts`. Both reference bots that name the agent in the composer see it convert a text field into a conversation; this is the cheapest change in the entire spec.

### 5.4 Accessibility

Non-negotiable, matching what the panel already does:

- Lane buttons are real `<button>` elements inside the existing focus trap, reachable in tab order before the composer
- Each carries an `aria-label` that states the outcome, not the label ("Request a callback from a privacy specialist")
- Focus ring `#207D78` at `ring-2`, consistent with every other control in the panel
- The lane group is wrapped in a labelled region so screen-reader users hear it as a set of choices, not three loose buttons
- `prefers-reduced-motion` parity: no entrance animation on the lane group

### 5.5 Golden-set guard

Changing the opening state changes what users ask first, which changes what retrieval sees. Before W1 merges, extend `eval/chat-golden.json` with the seeded lane messages as cases, asserting each still routes to its expected primary URL. A conversion win must not silently cost routing accuracy.

---

## 6. W2 — Human handoff

**Goal:** realise parent spec §9.5, which was committed in v2.4 and never built. This is the highest-value workstream in the document.

### 6.1 Escalation triggers

Today: `ESCALATE_RE` only. W2 adds three more, all computed server-side in `planTurn()`:

| Trigger | Condition | `reason` |
|---|---|---|
| Explicit ask | `ESCALATE_RE.test(message)` — unchanged | `explicit_ask` |
| Journey stalled | Same journey active, same slot unfilled, across 2 consecutive turns | `journey_stalled` |
| Repeat refusal | `plan.refuse === true` on 2 consecutive turns | `repeat_refusal` |
| Negative feedback | 👎 on a turn inside a journey | `negative_feedback` |

The last three require turn-to-turn memory the server does not currently hold. Rather than introduce server-side session storage — which would breach the no-transcript-persistence rule in parent §9.2 — carry two counters in the existing client `ChatSessionState`, which already round-trips on every request and is already sanitised on arrival:

```ts
// journeys.ts — ChatSessionState additions
consecutiveRefusals: number;   // reset to 0 on any non-refused turn
stalledSlotTurns: number;      // reset to 0 when a slot is filled or journey changes
```

Both are integers, both get clamped in `sanitizeState()` alongside `messageCount` (cap 500 → cap 10 is sufficient here). Client-supplied counters are a *hint*, not an authority — the worst a tampered value can do is offer a human door too early, which is harmless.

**Offer discipline (enforces §2.1):** at most **one** handoff offer per session. Declining sets a session flag; Setu does not re-offer, and continues answering normally.

### 6.2 The handoff packet

Parent §9.5 defines the shape. Realised with the field names the code will actually use:

```ts
interface HandoffPacket {
  summary: string;            // ≤ 500 chars, redact() applied — what the user was trying to do
  unresolvedQuestion: string; // ≤ 500 chars, redact() applied — the turn that stalled
  intent: string;             // detected journey name, or "general enquiry"
  journey?: JourneyId;
  industry?: IndustrySlug;
  sourcesShown: string[];     // state.pagesShown, capped at 10
  pageUrl: string;
  reason: EscalationReason;
  consentToContact: true;     // literal — a packet cannot exist without it
  ts: string;                 // ISO 8601
}
```

**Construction rules:**

- `summary` and `unresolvedQuestion` pass `redact()` **before** the packet is assembled, never after. Both are derived from user turns and may contain a phone number or PAN the user typed despite the PII warning
- `consentToContact` is typed as the literal `true`, so the type system itself forbids a packet without consent
- The packet is assembled **server-side** in the handoff route from the sanitised state, not accepted wholesale from the client — same discipline as `ChatMeta`

### 6.3 In-widget capture — field contract

Three fields. Anything more and the form becomes the thing people abandon.

| Field | Type | Required | Validation | Maps to |
|---|---|---|---|---|
| Name | text, ≤ 100 | yes | non-empty after trim | `fullName` |
| Work email | email, ≤ 200 | yes | shape check server-side | `workEmail` |
| Consent | checkbox | yes | must be `true` | `consentContact` |

Company, industry and phone are **not asked**. Industry is already detected in `state.industry` for most sessions; company adds friction for a callback request that only needs an email. `issueSummary` is populated from the packet's `summary`, not typed by the user.

**Consent copy** (exact, and it is legally load-bearing — plain-language, specific purpose, no pre-tick):

> I'd like a SaralPrivacy specialist to contact me about this question. I understand my name, email and a summary of this conversation will be shared with them.

The checkbox renders unticked. There is no "by continuing you agree" pattern anywhere in this flow.

### 6.4 Endpoint — `POST /api/chat/handoff`

**Request**

```jsonc
{
  "sessionId": "…",        // ≤ 64
  "name": "…",             // ≤ 100
  "email": "…",            // ≤ 200
  "consent": true,         // must be literal true
  "state": { … },          // ChatSessionState — sanitised server-side
  "pageUrl": "/learn/consent",
  "reason": "explicit_ask",
  "lastUserMessage": "…",  // ≤ 2000, redacted server-side
  "website": ""            // honeypot — see below
}
```

**Response** — `{ ok: true }` or `{ error, status }`. Never echoes the packet back.

**Server behaviour, in order:**

1. Rate limit — reuse `rateLimit()` from `lib/abuseGuard`: `handoff:{ip}` at **3 / 10 min**, tighter than contact's 6/min because this is a higher-intent, lower-volume action
2. Honeypot — reuse `isHoneypotTripped(body)`; on trip return `{ ok: true }` and store nothing, matching `/api/contact`'s existing behaviour exactly
3. Reject unless `consent === true` — 400, no partial write, no logging of the attempt
4. `sanitizeState()` the incoming state
5. Assemble the packet (§6.2) with `redact()` applied to both free-text fields
6. **Delegate to the existing lead path** — see §6.5
7. Fire-and-forget `sendConsultationAlert()`; never block the response on email

**Failure posture:** if Appwrite is unavailable, the endpoint returns 500 and the widget shows a recoverable message with the `/contact` link as fallback. Unlike `/api/chat/feedback`, this must **not** degrade silently — a dropped lead is worse than a visible error.

### 6.5 One lead path (§2.3, realised)

The handoff writes through the same three-step sequence `/api/contact` already performs, with the same collections and the same consent-version stamping:

| Step | Collection | Notes |
|---|---|---|
| 1 | `COLLECTIONS.LEADS` | `source: "setu_handoff"` — the only field that differs from a contact-form lead |
| 2 | `COLLECTIONS.CONSENT_LOG` | `source: "setu_handoff"`, `consent_type: "data_processing"`, `privacy_version: PRIVACY_NOTICE_VERSION` |
| 3 | `sendConsultationAlert(leadData)` | Existing Resend template; existing admin recipient |

Field mapping into the existing `leadData` shape:

```
name              ← form
email             ← form
phone             ← ""            (not collected)
company           ← ""            (not collected)
industry          ← state.industry ?? ""
company_size      ← ""
source            ← "setu_handoff"
issue_summary     ← packet.summary + "\n\nUnresolved: " + packet.unresolvedQuestion
preferred_contact ← "email"
preferred_time    ← ""
consent_version   ← PRIVACY_NOTICE_VERSION
risk_level        ← ""
created_at        ← ISO now
ip/city/country/region ← same headers as /api/contact
```

**Implementation note:** extract the shared write sequence from `/api/contact/route.ts` into a small helper (`lib/leads.ts` or similar) that both routes call, rather than copying it. Copied code here means the consent-log write drifts, and the consent log is the record that matters if anyone ever asks.

Leads land in the existing `/admin/consultations` and `/admin/leads` views with no admin work required — they are ordinary leads with a distinguishing `source`.

### 6.6 Conversation UX

1. Escalation detected → Setu's answer ends normally, then a card appears: **"Would you like a specialist to call you back?"** with *Yes* and *No thanks*
2. *No thanks* → session flag set, no re-offer, Setu continues. This path must feel like a complete answer, not a rejection
3. *Yes* → three fields inline in the message rail (not a modal, not a new surface — the panel already has a focus trap and a modal inside it would double-trap)
4. Submit → confirmation in Setu's voice: **"Done. Someone from the team will email you within one business day. In the meantime, the consent guide covers most of this."** — with the relevant page card still attached
5. Error → recoverable message plus `/contact` link

`chat_handoff_abandoned` fires on panel close with the form open, carrying `fieldsFilled` (0–3) so drop-off can be located.

### 6.7 Acceptance

- [ ] Packet cannot be constructed without `consentToContact: true` (type-level + runtime)
- [ ] `summary` and `unresolvedQuestion` are redacted — unit test with a PAN and a phone number in the transcript
- [ ] Honeypot trip stores nothing and returns success
- [ ] Lead appears in `/admin/leads` with `source: "setu_handoff"`
- [ ] Consent-log row written with the current `PRIVACY_NOTICE_VERSION`
- [ ] Appwrite outage → visible error + `/contact` fallback, never a silent drop
- [ ] Declining suppresses re-offer for the remainder of the session
- [ ] Full keyboard path: lane → form → submit, no focus escape from the panel

---

## 7. W3 — Contextual openers & qualification

**Goal:** reproduce the reference bots' perceived intelligence from page context alone.

### 7.1 Page-specific openers

`triggers.ts` already picks the right *moment* per page — dwell on the homepage, 50% scroll on industry pages, 60% on Learn. The *message* it shows is still generic. W3 makes the message as specific as the timing already is.

| Page | Today | W3 |
|---|---|---|
| `/industries/{slug}` | "Would you like to check what this means for your business?" | Names the sector and one real risk from that sector's data-flow pack — e.g. pharmacies: "Prescription records are the biggest DPDPA exposure for most pharmacies. Want to see where yours sit?" |
| `/learn/{topic}` | "Want me to explain how this applies to your business?" | Names the topic: "Want to see what valid consent looks like for your kind of business?" |
| `/faq`, `/glossary` | "Couldn't find the exact answer? Ask me in plain English." | Unchanged — already fits |

Sector lines are **authored, not generated**, and live beside the routes in `site-routing.ts` — the same rule parent §2.3 already applies to chips. Twelve sector lines and roughly eight topic lines. Source them from the ranked hotspots already in the data-flow packs so they are factually anchored to indexed content.

### 7.2 Qualification by question

Gracie's opener is a diagnostic question, not an offer — it makes the visitor describe their own situation, which qualifies them and gives the agent something to work with. Adapted to a guide rather than a seller, the question must be **useful to answer**, not merely revealing.

Homepage opener becomes:

> "Which of these does your business already have — a privacy notice, a data inventory, or neither?"

Three chips: `A privacy notice` · `A data inventory` · `Neither yet`.

Each answer does three things at once: fills a journey slot, routes to the right next page, and tells Setu where the visitor actually is.

| Answer | Slot written | Journey | Routes to |
|---|---|---|---|
| A privacy notice | `hasNotice: "yes"` | J3 | `/assessment` — "good start, here's what's next" |
| A data inventory | `hasInventory: "yes"` | J3 | `/assessment` |
| Neither yet | `hasNotice: "no"` | J1 | `/learn/applicability` — start at the beginning |

Answers write into `state.factsConfirmed`, which the system prompt already instructs Setu never to re-ask. That existing rule does the work; nothing new is needed in the prompt.

### 7.3 The no-tracking boundary

W3's entire personalisation surface is: **the current page, and the current conversation.** Explicitly not available to it — a cross-session history, an enrichment lookup, a segment carried from a previous visit, or any identifier beyond the existing first-party `sp_setu_session` UUID.

This boundary gets a test, not just a paragraph. `triggers.test.ts` gains a case asserting that opener selection is a pure function of `(pathname, sessionState)` and reads no other source. A test is what keeps a principle alive after the people who wrote it have moved on.

### 7.4 Suppression — unchanged

All of parent §2.4 continues to apply without modification: never auto-open, one proactive prompt per session, ~7-day dismissal suppression, permanent mute, and full suppression on `/privacy`, `/terms`, `/consent-preferences`, rights surfaces, `/subscribe`, `/unsubscribe`, `/contact`, active assessment steps and tool flows.

Per **D14**, W3's qualification opener is initially enabled on industry and Learn pages only.

---

## 8. W4 — Trust chrome

**Goal:** turn the tracking Setu refuses to do into something a visitor can see. This is the cheapest workstream and the one with the most marketing leverage.

### 8.1 "What Setu remembers"

A disclosure control in the panel header, opening a plain-English rendering of `ChatSessionState`:

> **What Setu remembers**
> You're reading the clinics guide. You told me you handle patient records. We've covered consent and retention.
> This is stored in your browser only — never on our servers. It clears when you clear your browser data.
>
> `[ Forget this session ]`

"Forget this session" clears `sp_setu_session`, `sp_setu_state` and `sp_setu_proactive`, resets the message rail, and confirms in one line. Fires `chat_memory_cleared`.

Rendering rules: describe state in the user's words, never dump JSON; if state is empty, say so plainly ("Nothing yet — we've just started").

### 8.2 The footer

Akamai's footer is the stronger of the two reference implementations and the bar to clear: it links the privacy statement, names the cookie category the bot belongs to, offers a deactivation path, discloses AI fallibility, and states that sessions may be recorded.

Setu's version, which should be more accurate than theirs because Setu genuinely stores less:

> Setu answers from SaralPrivacy's published guides and can be wrong — it's educational, not legal advice. Your conversation stays in your browser; we store nothing unless you ask for a callback. [What Setu remembers] · [Privacy notice] · [Turn Setu off]

The existing persistent disclaimer strip stays where it is. This footer is additive.

### 8.3 The off switch

"Turn Setu off" routes to `/consent-preferences` — the surface SaralPrivacy already ships — where a Setu toggle is added. Disabling hides the launcher entirely and suppresses all proactive prompts.

The point is not just the control; it is that disabling Setu uses **the same mechanism a customer would build for their own site**. The off switch is a working demonstration of the product.

### 8.4 Privacy notice — precision, not addition

One accuracy fix is required regardless of whether W4 ships in full.

`useSetuChat.ts` writes a UUID to `localStorage` under `sp_setu_session` that **persists across sessions**. It is first-party, never server-persisted, and not used for cross-site tracking — but it is a persistent identifier, and the notice should describe it in exactly those words rather than implying the widget is stateless.

Draft language:

> Setu stores a randomly generated ID and your conversation in your browser's local storage so it can keep context between messages. This never reaches our servers, is not linked to your identity, and is not used to track you across sites or sessions on other websites. You can clear it at any time from the chat panel.

Being precise here is strictly stronger than being vague. The claim survives scrutiny; a vaguer one wouldn't.

---

## 9. Data & privacy

### 9.1 What this spec adds to the data footprint

| Data | Where | When | Retention |
|---|---|---|---|
| Name, work email | `leads` | Only on explicit consented handoff | Existing lead retention policy |
| Redacted conversation summary | `leads.issue_summary` | Same | Same |
| Consent record | `consent_log` | Same | Existing consent-log retention |
| Escalation reason (no text) | Vercel Analytics | On escalation detect | Vercel's window |
| `hasNotice` / `hasInventory` | `localStorage` only | On opener answer | Until browser data cleared |
| Two counters (§6.1) | `localStorage` only | Per turn | Same |

### 9.2 DPDPA posture

The handoff is the only place this spec touches personal data, and it is built to be the demonstration case:

- **Notice** — the consent line (§6.3) states purpose, recipients and what is shared, in plain language, at the point of collection
- **Consent** — free, specific, informed, unambiguous; unticked checkbox; no bundling; the packet type cannot exist without it
- **Purpose limitation** — collected to arrange a callback about this question, and used for nothing else. It must not be added to newsletter or outreach lists without separate consent
- **Data minimisation** — three fields; company and phone deliberately not collected
- **Withdrawal** — as easy as giving: the existing unsubscribe/contact path, referenced in the confirmation message
- **Record** — `consent_log` row with the notice version in force at collection time

### 9.3 What is deliberately not collected

Stated positively because it is a product claim, not merely an omission: no cross-session behavioural history, no page-view stream tied to an identifier, no firmographic enrichment, no full transcripts server-side, no audio, no message text in analytics, and no question text stored for successful turns.

---

## 10. API surface after this spec

| Method | Path | Status | Purpose |
|---|---|---|---|
| POST | `/api/chat` | existing, +1 meta field | Streamed chat; `ChatMeta.escalation` added |
| POST | `/api/chat/feedback` | existing, unchanged | 👍/👎 — collection finally created (W0) |
| GET | `/api/chat/health` | existing, unchanged | Health |
| POST | `/api/chat/handoff` | **new (W2)** | Consented consultation packet |

Request/response contracts for `/api/chat` are otherwise unchanged. The two-phase streaming protocol, the `U+001E` sentinel and `ChatMeta` signing are untouched.

---

## 11. Evaluation & QA

### 11.1 Golden-set extensions

Current: 70 cases, 100% pass. Add ~15, and the suite must stay at 100% for every workstream merge.

| Cases | Asserts |
|---|---|
| 3 lane-seeded messages (W1) | Each routes to its expected primary URL |
| 4 escalation triggers (W2) | Each produces `meta.escalation.reason` correctly and offers the human door exactly once |
| 3 qualification answers (W3) | Each writes the right slot and routes to the right page |
| 3 refusal-still-refuses | Adding lanes does not rescue a below-floor turn |
| 2 injection-through-handoff | A crafted name/summary cannot escape redaction or reach the prompt |

### 11.2 New unit tests

- `handoff.test.ts` — packet construction, consent gating, redaction of PII in summary and question, honeypot behaviour
- `triggers.test.ts` (extend) — opener purity (§7.3), suppression list intact, one-prompt-per-session cap
- `orchestrate.test.ts` (extend) — the three new escalation triggers, counter reset semantics, one-offer-per-session
- `journeys.test.ts` — `sanitizeState` clamps the two new counters

### 11.3 Regression gates — every workstream

- [ ] Golden set 100%, no exceptions
- [ ] Existing 56 tests pass
- [ ] `guard.test.ts` untouched and passing — the injection surface must not widen
- [ ] Zero off-site citations in QA
- [ ] First token < 8 s, p95 < 12 s (current: 1.7–2.4 s — do not regress)
- [ ] Keyboard-only path through every new surface
- [ ] `prefers-reduced-motion` parity
- [ ] Every new analytics event verified on preview (§4.3)

### 11.4 Manual QA

Handoff flow on mobile (full-sheet panel, keyboard covering the form is the likely defect); screen-reader pass on the lane group and capture form; Appwrite-outage simulation; a PAN and a phone number typed mid-conversation then a handoff requested, confirming both are redacted in the stored lead.

---

## 12. Open decisions — D10–D14

Continuing the parent spec's decision numbering (D0–D9 are locked there). **These five gate the build.**

| ID | Decision | Recommendation |
|---|---|---|
| **D10** | Does Setu capture leads in-widget, or keep pointing at `/contact`? | **Capture in-widget**, three fields, routed through the shared lead path (§6.5). Highest-value change in the spec — but it moves Setu from pure guide to guide-plus-front-door, which is a character decision, not a technical one |
| **D11** | Does the human lane book a slot, or request a callback? | **Callback.** Reuses `sendConsultationAlert` and `/admin/consultations` as they stand, and avoids a calendar dependency before escalation volume is known. Revisit after the W0 baseline |
| **D12** | Is the cookieless-analytics position permanent? | **Yes, and say so publicly.** If ever reversed, reverse it as its own decision with its own consent design — never as a side effect of a chatbot feature |
| **D13** | Voice: I/O skin, or true speech-to-speech? *(reopens D8)* | **I/O skin**, holding the §11.1 exclusion. Gracie's voice UX is genuinely good and the pull will be real, but speech-to-speech trades away the grounding guarantee that is Setu's whole advantage |
| **D14** | Does the qualification opener run everywhere, or high-intent pages only? | **Industry and Learn pages first**, suppression list intact. Widen only if the baseline shows lift in engagement without lift in dismissals |

---

## 13. Acceptance criteria — spec level

- [ ] W0 baseline collected for two weeks before W1 merges
- [ ] Answer-to-action rate measurably improved against baseline
- [ ] At least one `setu_handoff` lead reaches `/admin/leads` in production
- [ ] Golden set still 100%; zero off-site citations
- [ ] No change to `route.ts` guard sequence, refusal gating, or `guard.ts`
- [ ] Privacy notice updated for `sp_setu_session` (§8.4) before W4 ships
- [ ] Every new analytics event verified live, not assumed
- [ ] D10–D14 recorded as decisions in this file's changelog before W2 begins

---

## 14. File map

### Net-new

| Path | Workstream | Purpose |
|---|---|---|
| `app/api/chat/handoff/route.ts` | W2 | Consented handoff endpoint |
| `lib/chat/handoff.ts` | W2 | Packet construction + validation |
| `lib/chat/handoff.test.ts` | W2 | Packet, consent, redaction tests |
| `lib/leads.ts` | W2 | Shared lead-write helper (§6.5) |
| `components/chat/OutcomeLanes.tsx` | W1 | Three-lane opening state |
| `components/chat/HandoffForm.tsx` | W2 | Inline three-field capture |
| `components/chat/MemoryPanel.tsx` | W4 | "What Setu remembers" |

### Touched

| Path | Workstream | Change |
|---|---|---|
| `lib/analytics.ts` | W0 | Seven new events |
| `scripts/setup-appwrite.mjs` | W0 | `chat_feedback` collection |
| `lib/chat/orchestrate.ts` | W0, W2 | `ChatMeta.escalation`; three new triggers |
| `lib/chat/journeys.ts` | W2, W3 | Two counters; slot writes; `sanitizeState` clamps |
| `lib/chat/triggers.ts` | W3 | Page-specific openers |
| `lib/chat/site-routing.ts` | W3 | Authored sector/topic opener lines |
| `lib/chat/strings.ts` | W1, W2, W4 | Composer placeholder, consent copy, footer, memory panel |
| `components/chat/ChatPanel.tsx` | W1, W2, W4 | Lane mount, form mount, footer, memory control |
| `components/chat/useSetuChat.ts` | W0, W2 | Escalation event; handoff submit; counter maintenance |
| `app/api/contact/route.ts` | W2 | Extract shared write into `lib/leads.ts` |
| `app/consent-preferences/*` | W4 | Setu off switch |
| `eval/chat-golden.json` | all | ~15 new cases |

**Not touched by any workstream:** `guard.ts` · `retrieve.ts` · `pinecone.ts` · `index-build.ts` · `redact.ts` · `system-prompt.ts` · `protocol.ts`. If a PR in this stream modifies any of these, it needs explicit review against §0.1.

---

## 15. Parallel development

This work is on `feature/setu-outcome-layer`, cut from `main` rather than from any in-flight branch, so it carries no dependency on other streams.

### 15.1 Conflict surface — measured, not assumed

Checked against the design stream currently in flight (`claude/akamai-chatbot-analysis-xodhg5`, 62 changed files):

- **Files touched by both streams: zero.** The design work is entirely in `app/**/page.tsx`, assessment clients, industry pages and admin views
- **Shared infrastructure touched by the design stream: none.** `globals.css`, `app/layout.tsx`, `lib/analytics.ts`, `lib/chat/strings.ts`, `lib/appwrite.ts`, `lib/email.ts` and `app/api/contact/route.ts` are all untouched by it

The two streams can proceed independently with no coordination beyond ordinary rebasing.

### 15.2 The three genuine coupling points

Where a *future* stream could collide, and the protocol for each:

| Surface | Risk | Protocol |
|---|---|---|
| `lib/analytics.ts` | Append-only file; two streams adding events collide on the closing lines | Trivial conflict, always resolved by keeping both. Never reorder existing events |
| `app/api/contact/route.ts` | W2 extracts the shared write into `lib/leads.ts` | Do this extraction as its **own small PR, merged first**, so no other stream is rebasing across a refactor |
| Design tokens | If the design stream changes `#07B981` or `#121A2E`, lane buttons drift | W1 uses CSS custom properties from `globals.css`, never hardcoded hex — the lanes then inherit any token change automatically |

### 15.3 Merge protocol

- One PR per workstream, in W0 → W1 → W2 order; W3 and W4 may open in parallel once W1 is merged
- Rebase onto `main` before each PR; never merge `main` into the feature branch mid-stream
- Every PR runs the full golden set and the existing 56 tests
- The `lib/leads.ts` extraction lands as its own PR before W2's feature work
- No PR in this stream touches the §14 "not touched" list without explicit review

---

## 16. Risks

| Risk | Mitigation |
|---|---|
| Conversion pressure erodes the refusal floor | §2.4 — the floor is not a tunable. Conversion is measured downstream of a correct answer |
| Setu drifts into selling | §2.1 + one-offer-per-session cap (§6.1) + character canon in the prompt, unchanged |
| Two lead paths drift apart | §6.5 — single shared helper, extracted before feature work begins |
| Opener changes cost routing accuracy | §5.5, §11.1 — golden set extended before each merge |
| Handoff form becomes the abandonment point | Three fields; `chat_handoff_abandoned` with `fieldsFilled` locates drop-off precisely |
| Analytics silently dead again | §4.3 — preview verification is a merge gate, learned from the 23-event no-op incident |
| Lead dropped on Appwrite outage | §6.4 — visible error + `/contact` fallback; deliberately does not degrade silently |
| Scope creeps toward tracking | §3.2 is a permanent refusal with reasons recorded, plus the purity test in §7.3 |

---

## Changelog

| Version | Date | Notes |
|---|---|---|
| **1.0** | 2026-08-21 | Initial spec. Derived from the Kai/Gracie architecture teardown. Defines W0–W4, realises parent §9.5, opens D10–D14. Inherited grounding contract (§0.1) declared untouchable; cross-session tracking (§3.2) recorded as a permanent refusal rather than a backlog item |
