"use client";
// Client brain of the Setu widget: session identity, ChatSessionState
// persistence (localStorage only — spec §9.2, never server-persisted),
// streaming fetch to /api/chat and the U+001E two-phase split.

import { useCallback, useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    sessionIdRef.current = loadSessionId();
    stateRef.current = loadState(sessionIdRef.current, pageUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistState = useCallback(() => {
    try {
      if (stateRef.current) localStorage.setItem(STATE_KEY, JSON.stringify(stateRef.current));
    } catch {
      /* private mode — state stays in memory */
    }
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed || status !== "idle") return;

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
      const setuMsg: ChatMessage = { id: crypto.randomUUID(), role: "setu", text: "", streaming: true };
      const history = [...messages]
        .filter((m) => !m.error)
        .slice(-8)
        .map((m) => ({ role: m.role === "setu" ? ("assistant" as const) : ("user" as const), content: m.text }));

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
          s.messageCount += 1;
          if (meta.industry) s.industry = meta.industry;
          if (meta.journey) s.journey = meta.journey;
          s.lastTopic = meta.citations[0]?.title ?? s.lastTopic;
          for (const c of meta.citations) {
            if (!s.pagesShown.includes(c.url)) s.pagesShown.push(c.url);
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

  return { messages, status, send, sendFeedback };
}
