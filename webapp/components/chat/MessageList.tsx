"use client";
// Message list: Setu/user bubbles, markdown-lite rendering, citation cards
// with the Bindu-✓ verified badge, action CTAs, follow-up chips and 👍/👎.
// Tokens per spec §8.9 — body 15/400, labels 13/600, navy text on cloud.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink, ThumbsDown, ThumbsUp, BadgeCheck } from "lucide-react";
import type { ChatMessage } from "./useSetuChat";
import { SetuStage, type AvatarState } from "./SetuStage";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { SETU_SURFACE } from "@/lib/chat/theme";
import { t } from "@/lib/chat/strings";
import { trackEvent } from "@/lib/analytics";

const TOOL_URLS = new Set([
  "/assessment",
  "/discovery",
  "/tools/dpdpa-privacy-notice-generator",
  "/penalty-calculator",
  "/white-paper",
  "/data-mapping",
]);

// ---------------------------------------------------------------------------
// Markdown-lite: **bold** + "- " lists. The prompt bans links/headings/JSON.

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyBase}-b${i}`} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={`${keyBase}-t${i}`}>{part}</span>
    )
  );
}

export function renderLite(text: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flushList = (key: string) => {
    if (!list.length) return;
    blocks.push(
      <ul key={key} className="my-1 list-disc space-y-1 pl-5">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ul>
    );
    list = [];
  };
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      list.push(trimmed.slice(2));
      return;
    }
    flushList(`ul-${i}`);
    if (trimmed) {
      blocks.push(
        <p key={`p-${i}`} className="my-1">
          {renderInline(trimmed, `p-${i}`)}
        </p>
      );
    }
  });
  flushList("ul-end");
  return blocks;
}

// ---------------------------------------------------------------------------

function CitationCards({ msg }: { msg: ChatMessage }) {
  const meta = msg.meta;
  if (!meta || (!meta.citations.length && !meta.actions.length)) return null;
  return (
    <div className="mt-2 space-y-2">
      {meta.actions.map((a) => (
        <a
          key={a.url}
          href={a.url}
          target="_blank"
          rel="noopener"
          onClick={() => {
            if (TOOL_URLS.has(a.url)) {
              trackEvent.chatToolCta({ url: a.url, journey: meta.journey });
            } else {
              trackEvent.chatLinkClicked({ url: a.url, kind: "action" });
            }
          }}
          className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-[#121A2E]/40 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78] active:scale-[0.99]"
        >
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold text-[#121A2E]">{a.label}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tracking-wide text-[#0B7A5C]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("en", "verifiedPage")}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#07B981] px-3 py-1.5 text-[13px] font-semibold text-[#121A2E] transition group-hover:bg-[#06a874]">
            {t("en", "openPage")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </a>
      ))}
    </div>
  );
}

function FeedbackButtons({
  msg,
  onFeedback,
}: {
  msg: ChatMessage;
  onFeedback: (msg: ChatMessage, helpful: boolean) => void;
}) {
  const [voted, setVoted] = useState<null | boolean>(null);
  return (
    <div className="mt-1.5 flex items-center gap-2" aria-label={t("en", "feedbackAsk")}>
      <span className="text-[13px] text-[#354F72]">
        {voted === null ? t("en", "feedbackAsk") : t("en", "feedbackThanks")}
      </span>
      {[true, false].map((helpful) => {
        const Icon = helpful ? ThumbsUp : ThumbsDown;
        const active = voted === helpful;
        return (
          <button
            key={String(helpful)}
            type="button"
            disabled={voted !== null}
            aria-label={helpful ? "Helpful" : "Not helpful"}
            aria-pressed={active}
            onClick={() => {
              setVoted(helpful);
              onFeedback(msg, helpful);
            }}
            className={`rounded p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78] ${
              active ? "text-[#0B7A5C]" : voted !== null ? "opacity-40" : "text-[#354F72] hover:text-[#121A2E]"
            }`}
          >
            <Icon className="h-4 w-4" fill={active ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function MessageList({
  messages,
  avatarState,
  onFeedback,
  onChip,
}: {
  messages: ChatMessage[];
  avatarState: AvatarState;
  onFeedback: (msg: ChatMessage, helpful: boolean) => void;
  onChip: (text: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Screen readers: announce completed Setu messages once, never per token.
  const lastDone = [...messages].reverse().find((m) => m.role === "setu" && !m.streaming);
  useEffect(() => {
    if (lastDone && lastDone.text && lastDone.text !== announced) {
      setAnnounced(lastDone.text);
    }
  }, [lastDone, announced]);

  const lastSetu = [...messages].reverse().find((m) => m.role === "setu");

  return (
    <div
      className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3"
      role="log"
      aria-label="Conversation with Setu"
    >
      <div aria-live="polite" className="sr-only">
        {announced ? `Setu says: ${announced}` : ""}
      </div>

      {messages.map((msg) =>
        msg.role === "user" ? (
          <div key={msg.id} className="flex justify-end">
            <div
              className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[15px] leading-relaxed text-white"
              style={{ backgroundColor: SETU_SURFACE }}
            >
              {msg.text}
            </div>
          </div>
        ) : (
          <div key={msg.id} className="flex items-start gap-2">
            <SetuStage state={msg.streaming ? avatarState : msg.meta?.refusal ? "unsure" : "idle"} size={32} />
            <div className="min-w-0 max-w-[85%]">
              <span className="text-[13px] font-semibold tracking-wide text-[#354F72]">Setu</span>
              <div
                className={`mt-0.5 rounded-2xl rounded-tl-sm px-3.5 py-2 text-[15px] leading-relaxed text-[#121A2E] ${
                  msg.error ? "bg-amber-50 border border-amber-200" : "bg-white shadow-sm border border-slate-100"
                }`}
              >
                {msg.text ? renderLite(msg.text) : <ThinkingIndicator />}
                {msg.meta?.piiWarning && (
                  <p className="mt-2 rounded bg-amber-50 p-2 text-[13px] text-amber-800">{t("en", "piiWarning")}</p>
                )}
              </div>
              <CitationCards msg={msg} />
              {!msg.streaming && !msg.error && msg.meta && <FeedbackButtons msg={msg} onFeedback={onFeedback} />}
              {msg.id === lastSetu?.id && !msg.streaming && msg.meta?.suggestedFollowups?.length ? (
                <div className="mt-2 flex flex-wrap gap-2" aria-label={t("en", "suggestedLabel")}>
                  {msg.meta.suggestedFollowups.slice(0, 3).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => onChip(f)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[13px] font-medium text-[#121A2E] transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78] active:border-[#35B6AE]"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )
      )}
      <div ref={endRef} />
    </div>
  );
}
