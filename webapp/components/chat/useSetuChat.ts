"use client";
// Client brain of the Setu widget: session identity, ChatSessionState
// persistence (localStorage only — spec §9.2, never server-persisted),
// streaming fetch to /api/chat and the U+001E two-phase split.

import { useCallback, useEffect, useRef, useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/abuseGuard";
import { META_SENTINEL, parseChatResponse } from "@/lib/chat/protocol";
import type { ChatMeta } from "@/lib/chat/orchestrate";
import {
  createInitialState,
  type ChatSessionState,
} from "@/lib/chat/journeys";
import { t } from "@/lib/chat/strings";
import { trackEvent } from "@/lib/analytics";

export interface ChatMessage {
  id: string;
  role: "user" | "setu";
  text: string;
  meta?: ChatMeta;
  streaming?: boolean;
  error?: boolean;
}

export type ChatStatus = "idle" | "thinking" | "streaming";

const SESSION_KEY = "sp_setu_session";
const STATE_KEY = "sp_setu_state";

function loadSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s-${Math.random().toString(36).slice(2)}`;
  }
}

function loadState(sessionId: string, pageUrl: string): ChatSessionState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatSessionState;
      if (parsed && parsed.sessionId === sessionId) return parsed;
    }
  } catch {
    /* fall through to fresh state */
  }
  return createInitialState(sessionId, pageUrl);
}

export function useSetuChat(pageUrl: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const sessionIdRef = useRef<string>("");
  const stateRef = useRef<ChatSessionState | null>(null);
  // A render-visible copy for the memory panel. The ref stays the source of
  // truth for request payloads — mirroring it avoids threading state through
  // every call site just so one disclosure panel can re-render.
  const [stateSnapshot, setStateSnapshot] = useState<ChatSessionState | null>(null);

  useEffect(() => {
    sessionIdRef.current = loadSessionId();
    stateRef.current = loadState(sessionIdRef.current, pageUrl);
    setStateSnapshot({ ...stateRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistState = useCallback(() => {
    try {
      if (stateRef.current) localStorage.setItem(STATE_KEY, JSON.stringify(stateRef.current));
    } catch {
      /* private mode — state stays in memory */
    }
    setStateSnapshot(stateRef.current ? { ...stateRef.current } : null);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed || status !== "idle") return;

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
      const setuMsg: ChatMessage = { id: crypto.randomUUID(), role: "setu", text: "", streaming: true };
      // Setu's own turns travel back with the signature the server issued for
      // them. The server drops any assistant turn that fails verification, so
      // a tampered or hand-crafted transcript cannot put words in his mouth.
      const history = [...messages]
        .filter((m) => !m.error)
        .slice(-8)
        .map((m) =>
          m.role === "setu"
            ? { role: "assistant" as const, content: m.text, sig: m.meta?.sig }
            : { role: "user" as const, content: m.text }
        );

      setMessages((prev) => [...prev, userMsg, setuMsg]);
      setStatus("thinking");
      trackEvent.chatMessageSent({
        journey: stateRef.current?.journey,
        industry: stateRef.current?.industry,
        turn: (stateRef.current?.messageCount ?? 0) + 1,
      });

      const patchSetu = (patch: Partial<ChatMessage>) =>
        setMessages((prev) => prev.map((m) => (m.id === setuMsg.id ? { ...m, ...patch } : m)));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            message: trimmed,
            pageUrl,
            history,
            state: stateRef.current,
          }),
        });

        if (!res.ok || !res.body) {
          const errText =
            res.status === 429 ? t("en", "rateLimited") : t("en", "apiError");
          patchSetu({ text: errText, streaming: false, error: true });
          setStatus("idle");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let sawText = false;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const sentinelAt = buffer.indexOf(META_SENTINEL);
          const visible = sentinelAt === -1 ? buffer : buffer.slice(0, sentinelAt);
          if (visible && !sawText) {
            sawText = true;
            setStatus("streaming");
          }
          patchSetu({ text: visible });
        }
        const { text: finalText, meta } = parseChatResponse(buffer);
        patchSetu({ text: finalText.trim(), meta: meta ?? undefined, streaming: false });

        if (meta && stateRef.current) {
          const s = stateRef.current;
          const priorJourney = s.journey;
          s.messageCount += 1;
          if (meta.industry) s.industry = meta.industry;
          if (meta.journey) s.journey = meta.journey;
          s.lastTopic = meta.citations[0]?.title ?? s.lastTopic;
          for (const c of meta.citations) {
            if (!s.pagesShown.includes(c.url)) s.pagesShown.push(c.url);
          }

          // Escalation memory (spec §6.1). The server holds no transcript, so
          // these two counters are how a "second turn running" signal survives
          // between requests. Both are re-clamped server-side on arrival.
          s.consecutiveRefusals = meta.refusal ? s.consecutiveRefusals + 1 : 0;
          s.stalledSlotTurns =
            meta.journey && meta.journey === priorJourney ? s.stalledSlotTurns + 1 : 0;

          // The event fires when the door OPENS, not when it is walked
          // through — a user who is offered a human and declines is exactly
          // the signal that was missing before (chatEscalation was defined in
          // lib/analytics.ts and called from nowhere).
          if (meta.escalation) {
            trackEvent.chatEscalation({ reason: meta.escalation.reason });
          }
          persistState();
        }
      } catch {
        patchSetu({ text: t("en", "offline"), streaming: false, error: true });
      } finally {
        setStatus("idle");
      }
    },
    [messages, pageUrl, persistState, status]
  );

  const sendFeedback = useCallback(
    (turn: ChatMessage, helpful: boolean) => {
      trackEvent.chatFeedback({ helpful });
      const priorUser = [...messages].reverse().find((m) => m.role === "user");
      void fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          turnId: turn.id,
          helpful,
          pageUrl,
          ...(helpful
            ? {}
            : { failureKind: "thumbs_down", question: priorUser?.text ?? "" }),
        }),
      }).catch(() => {});
    },
    [messages, pageUrl]
  );

  /**
   * Post the consented handoff. The packet itself is assembled server-side
   * from sanitised state — the client sends raw inputs and never authors the
   * object, the same rule that keeps ChatMeta trustworthy.
   */
  const submitHandoff = useCallback(
    async (contact: { name: string; email: string; honeypot: string }, reason: string) => {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      try {
        const res = await fetch("/api/chat/handoff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            name: contact.name,
            email: contact.email,
            consent: true,
            // Field name comes from the shared constant; the server checks the
            // same one, so the two cannot drift apart again.
            [HONEYPOT_FIELD]: contact.honeypot,
            state: stateRef.current,
            pageUrl,
            reason,
            lastUserMessage: lastUser?.text ?? "",
          }),
        });
        if (!res.ok) return { ok: false };
        if (stateRef.current) {
          stateRef.current.consentToContact = true;
          stateRef.current.handoffOffered = true;
          persistState();
        }
        trackEvent.chatHandoffSubmitted({
          journey: stateRef.current?.journey,
          industry: stateRef.current?.industry,
        });
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    [messages, pageUrl, persistState]
  );

  /** One offer per session (§6.1) — set whether they accept or decline. */
  const markHandoffOffered = useCallback(() => {
    if (stateRef.current && !stateRef.current.handoffOffered) {
      stateRef.current.handoffOffered = true;
      persistState();
    }
  }, [persistState]);

  /** Record an answer to a qualification opener without a model round-trip. */
  const confirmFact = useCallback(
    (slot: string, value: string) => {
      if (!stateRef.current) return;
      stateRef.current.factsConfirmed[slot] = value;
      stateRef.current.stalledSlotTurns = 0;
      persistState();
      trackEvent.chatOpenerAnswered({ page: pageUrl, slot });
    },
    [pageUrl, persistState]
  );

  /** "Forget this session" (§8.1) — everything Setu holds, gone. */
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STATE_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* private mode — in-memory reset below still applies */
    }
    sessionIdRef.current = loadSessionId();
    stateRef.current = createInitialState(sessionIdRef.current, pageUrl);
    setStateSnapshot({ ...stateRef.current });
    setMessages([]);
    trackEvent.chatMemoryCleared();
  }, [pageUrl]);

  return {
    messages,
    status,
    send,
    sendFeedback,
    state: stateSnapshot,
    submitHandoff,
    markHandoffOffered,
    confirmFact,
    clearSession,
  };
}
