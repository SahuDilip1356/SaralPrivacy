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
import { planTurn, buildGroundingBlock, buildMeta, type ChatMeta } from "@/lib/chat/orchestrate";
import { buildSystemPrompt, buildTurnNotes } from "@/lib/chat/system-prompt";
import { sanitizeState } from "@/lib/chat/journeys";
import { t } from "@/lib/chat/strings";

export const maxDuration = 60;

import { META_SENTINEL } from "@/lib/chat/protocol";
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 8;

interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is HistoryTurn =>
        !!m &&
        typeof m === "object" &&
        ((m as HistoryTurn).role === "user" || (m as HistoryTurn).role === "assistant") &&
        typeof (m as HistoryTurn).content === "string"
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
}

function streamCanned(text: string, meta: ChatMeta): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.enqueue(encoder.encode(META_SENTINEL + JSON.stringify(meta)));
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
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

  const state = sanitizeState(payload.state, sessionId, pageUrl ?? "");
  const history = sanitizeHistory(payload.history);
  const plan = planTurn(message, state, pageUrl);
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
  const grounding = buildGroundingBlock(plan);

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system,
      messages: [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        {
          role: "user" as const,
          content: `${turnNotes}\n\n${grounding}\n\n<user_message>\n${message}\n</user_message>`,
        },
      ],
      temperature: 0.3,
      maxOutputTokens: 600,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.enqueue(encoder.encode(META_SENTINEL + JSON.stringify(meta)));
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
