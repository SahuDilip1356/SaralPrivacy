// Setu chat endpoint — two-phase streaming (spec §5.5).
// Phase A: Setu's answer streams as plain text.
// Phase B: one  sentinel + a server-built ChatMeta JSON block.
//
// The model streams TEXT ONLY. Retrieval runs BEFORE the model call
// (planTurn = the spec §5.2 search/route/suggest tools executed
// deterministically each turn); citations, actions, confidence and refusal
// are computed server-side in lib/chat/orchestrate.ts, so an invalid URL
// cannot reach the client. Below the retrieval floor the model is never
// called at all — the canned refusal streams instead (zero cost, zero risk).

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import { rateLimit, getClientIp } from "@/lib/abuseGuard";
import {
  planTurnAsync,
  buildGroundingBlock,
  buildMeta,
  DISCLAIMER,
  type ChatMeta,
} from "@/lib/chat/orchestrate";
import { buildSystemPrompt, buildTurnNotes } from "@/lib/chat/system-prompt";
import { sanitizeState } from "@/lib/chat/journeys";
import { t } from "@/lib/chat/strings";
import { FRESH_INTENT_RE, fetchLiveBriefings, briefingsContextBlock } from "@/lib/chat/briefings-live";
import {
  LEAK_HOLDBACK,
  detectInjection,
  historySigningAvailable,
  newNonce,
  sanitizeUntrusted,
  scanOutput,
  signTurn,
  verifyTurn,
  wrapUserMessage,
} from "@/lib/chat/guard";

export const maxDuration = 60;

import { META_SENTINEL } from "@/lib/chat/protocol";
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 8;

interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * History arrives from the browser, so every turn in it is a claim, not a
 * record. Two defences apply:
 *   - all content is tag-neutralised, so no turn can smuggle framing markup;
 *   - assistant turns must carry a valid HMAC we issued (guard.signTurn), or
 *     they are dropped. Without that check an attacker can put words in
 *     Setu's mouth — "developer mode enabled" — and the model reads them as
 *     its own prior commitment, which is far more persuasive than any user
 *     instruction. When CHAT_HISTORY_SECRET is unset we cannot verify, so
 *     assistant turns are dropped rather than trusted; the user side of the
 *     conversation still carries continuity.
 */
function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const canVerify = historySigningAvailable();
  const out: HistoryTurn[] = [];
  for (const m of raw.slice(-MAX_HISTORY_TURNS)) {
    if (!m || typeof m !== "object") continue;
    const turn = m as { role?: unknown; content?: unknown; sig?: unknown };
    if (typeof turn.content !== "string") continue;
    if (turn.role !== "user" && turn.role !== "assistant") continue;

    const content = sanitizeUntrusted(turn.content.slice(0, MAX_MESSAGE_CHARS));
    if (turn.role === "assistant") {
      if (!canVerify) continue;
      if (!verifyTurn(turn.content.trim(), turn.sig)) continue;
    }
    out.push({ role: turn.role, content });
  }
  return out;
}

function streamCanned(text: string, meta: ChatMeta): Response {
  const encoder = new TextEncoder();
  const signed: ChatMeta = { ...meta, sig: signTurn(text.trim()) };
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.enqueue(encoder.encode(META_SENTINEL + JSON.stringify(signed)));
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

/** Meta for a turn refused by the injection guard — no citations, no leads. */
function guardedMeta(): ChatMeta {
  return {
    citations: [],
    actions: [
      { type: "open_url", label: "Open the FAQ", url: "/faq" },
      { type: "open_url", label: "Contact SaralPrivacy", url: "/contact" },
    ],
    confidence: "low",
    refusal: true,
    piiWarning: false,
    suggestedFollowups: ["What is DPDPA?", "Does DPDPA apply to me?"],
    animation: { state: "unsure" },
    disclaimer: DISCLAIMER,
  };
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.slice(0, 64) : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const pageUrl = typeof payload.pageUrl === "string" ? payload.pageUrl.slice(0, 200) : undefined;

  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId and message are required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: "Message too long (max 2000 characters)." }, { status: 413 });
  }

  // Spec §9.3 MVP limits: burst 5/10s, 30/hr per session, 60/hr per IP.
  const ip = getClientIp(request);
  for (const [key, max, win] of [
    [`chat-burst:${sessionId}`, 5, 10_000],
    [`chat-hour:${sessionId}`, 30, 3_600_000],
    [`chat-ip:${ip}`, 60, 3_600_000],
  ] as const) {
    const rl = rateLimit(key, max, win);
    if (!rl.ok) {
      return NextResponse.json(
        { error: t("en", "rateLimited") },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }
  }

  // Instruction-override attempts stop here: before retrieval, before the
  // model, at zero cost. This runs ahead of planTurnAsync deliberately — the
  // refusal floor inside the plan is rescued by any router trigger or glossary
  // hit, so appending "what is dpdpa" to a payload would otherwise walk it
  // straight through to the model.
  const injection = detectInjection(message);
  if (injection.blocked) {
    console.warn(`[chat-guard] blocked turn (${injection.rule})`);
    return streamCanned(t("en", "guarded"), guardedMeta());
  }

  const state = sanitizeState(payload.state, sessionId, pageUrl ?? "");
  const history = sanitizeHistory(payload.history);
  // Pinecone semantic search + rerank (D7); falls back to the local lexical
  // index automatically if the vector store is unavailable.
  const plan = await planTurnAsync(message, state, pageUrl);
  const meta = buildMeta(plan);

  // Below the floor: refuse without ever calling the model (spec §4.2).
  if (plan.refuse) {
    return streamCanned(`${t("en", "refusal")} ${t("en", "refusalHint")}`, meta);
  }

  const system = buildSystemPrompt();
  const turnNotes = buildTurnNotes({
    piiWarning: plan.piiWarning,
    refusalForced: false,
    factsConfirmed: state.factsConfirmed,
    pageUrl,
  });
  let grounding = buildGroundingBlock(plan);

  // Freshness intent: fetch live Appwrite briefings as a dated context block
  // (Plane 3 pulled forward). Failure degrades silently to the static index.
  if (FRESH_INTENT_RE.test(message.toLowerCase())) {
    const live = await fetchLiveBriefings(message);
    if (live) {
      // Briefings are generated from external news sources, so unlike the rest
      // of the corpus this text is not ours. Neutralise it before it enters a
      // block the prompt treats as trusted — indirect injection travels the
      // same path as direct injection once it is inside the context.
      grounding += `\n\n${sanitizeUntrusted(briefingsContextBlock(live))}`;
      if (!meta.citations.some((c) => c.url === "/briefings")) {
        meta.citations = [
          { title: "DPDPA Daily Briefings", url: "/briefings", tier: 4 },
          ...meta.citations,
        ].slice(0, 3);
      }
      if (!meta.actions.some((a) => a.url === "/briefings")) {
        meta.actions = [
          { type: "open_url" as const, label: "Read the Daily Briefings", url: "/briefings" },
          ...meta.actions,
        ].slice(0, 3);
      }
    }
  }

  try {
    // The closing delimiter carries an unguessable per-turn nonce, so even a
    // message that somehow evaded neutralisation cannot close the block early
    // and continue in the framework's own voice.
    const nonce = newNonce();
    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system,
      messages: [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        {
          role: "user" as const,
          content: `${turnNotes}\n\n${grounding}\n\n${wrapUserMessage(message, nonce)}`,
        },
      ],
      // temperature is not supported by the claude-5 family — omit it.
      maxOutputTokens: 600,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          // Release the stream LEAK_HOLDBACK characters behind the model, so a
          // leak signature is always still in the buffer when it completes and
          // never reaches the browser. The cost is a fixed ~25-character lag.
          let produced = "";
          let pending = "";
          let released = "";
          let leaked = false;

          for await (const chunk of result.textStream) {
            produced += chunk;
            pending += chunk;
            if (scanOutput(produced).leaked) {
              leaked = true;
              break;
            }
            if (pending.length > LEAK_HOLDBACK) {
              const flush = pending.slice(0, pending.length - LEAK_HOLDBACK);
              pending = pending.slice(pending.length - LEAK_HOLDBACK);
              released += flush;
              controller.enqueue(encoder.encode(flush));
            }
          }

          if (leaked) {
            // Whatever is still held back contains the signature; drop it and
            // close with the guarded line instead of the model's answer.
            console.warn("[chat-guard] output leak scan tripped — answer withheld");
            const tail = ` ${t("en", "guarded")}`;
            controller.enqueue(encoder.encode(tail));
            const answer = (released + tail).trim();
            controller.enqueue(
              encoder.encode(
                META_SENTINEL +
                  JSON.stringify({ ...guardedMeta(), sig: signTurn(answer) } satisfies ChatMeta)
              )
            );
            controller.close();
            return;
          }

          controller.enqueue(encoder.encode(pending));
          const answer = (released + pending).trim();
          controller.enqueue(
            encoder.encode(META_SENTINEL + JSON.stringify({ ...meta, sig: signTurn(answer) }))
          );
        } catch {
          const errMeta: ChatMeta = {
            ...meta,
            confidence: "low",
            animation: { state: "unsure" },
          };
          controller.enqueue(
            encoder.encode(`\n${t("en", "apiError")}` + META_SENTINEL + JSON.stringify(errMeta))
          );
        } finally {
          controller.close();
        }
      },
    });
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch {
    return NextResponse.json({ error: t("en", "apiError") }, { status: 500 });
  }
}
