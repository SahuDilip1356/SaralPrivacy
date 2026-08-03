"use client";
// The chat surface: desktop ~400×600 card bottom-right, mobile full sheet.
// Focus trap + Esc close + focus return handled here (spec §8.6, WCAG AA).

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X, SendHorizonal } from "lucide-react";
import { MessageList } from "./MessageList";
import { SetuStage, type AvatarState } from "./SetuStage";
import type { ChatMessage, ChatStatus } from "./useSetuChat";
import { chipsForPage } from "@/lib/chat/site-routing";
import { t } from "@/lib/chat/strings";

export function ChatPanel({
  open,
  onClose,
  messages,
  status,
  onSend,
  onFeedback,
  pageUrl,
}: {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  status: ChatStatus;
  onSend: (text: string) => void;
  onFeedback: (msg: ChatMessage, helpful: boolean) => void;
  pageUrl: string;
}) {
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const busy = status !== "idle";
  const avatarState: AvatarState =
    status === "thinking" ? "thinking" : status === "streaming" ? "speaking" : typing ? "listening" : messages.length === 0 ? "greeting" : "idle";

  const submit = () => {
    if (busy || !draft.trim()) return;
    onSend(draft);
    setDraft("");
    setTyping(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Minimal focus trap: keep Tab within the panel.
  const trapKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const showChips = messages.length === 0;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${t("en", "panelTitle")} — ${t("en", "panelSubtitle")}`}
      onKeyDown={trapKeyDown}
      className="fixed inset-0 z-[70] flex flex-col bg-[#F7F9FC] shadow-2xl sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[600px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#121A2E] px-4 py-3">
        <SetuStage state={avatarState} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-tight text-white">{t("en", "panelTitle")}</p>
          <p className="truncate text-[13px] text-slate-300">{t("en", "panelSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded p-1.5 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35B6AE]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Disclaimer strip — visible for the whole session (spec §7) */}
      <p className="border-b border-slate-200 bg-[#F7F9FC] px-4 py-1.5 text-center text-[13px] font-medium text-[#354F72]">
        {t("en", "disclaimer")}
      </p>

      {/* Conversation */}
      {showChips ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-start gap-2">
            <SetuStage state="greeting" size={32} />
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-3.5 py-2 text-[15px] leading-relaxed text-[#121A2E] shadow-sm">
              <p className="my-1">{t("en", "greeting")}</p>
              <p className="my-1">{t("en", "greetingPrompt")}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 pl-10">
            {chipsForPage(pageUrl).map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onSend(chip.message)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-[#121A2E] transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78] active:border-[#35B6AE]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList messages={messages} avatarState={avatarState} onFeedback={onFeedback} onChip={onSend} />
      )}

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            maxLength={2000}
            value={draft}
            placeholder={t("en", "inputPlaceholder")}
            aria-label={t("en", "inputPlaceholder")}
            onChange={(e) => {
              setDraft(e.target.value);
              setTyping(e.target.value.length > 0);
            }}
            onKeyDown={onKeyDown}
            className="max-h-28 min-h-[42px] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-[15px] text-[#121A2E] placeholder:text-slate-400 focus:border-[#207D78] focus:outline-none focus:ring-1 focus:ring-[#207D78]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            aria-label={t("en", "send")}
            className="rounded-lg bg-[#07B981] p-2.5 text-[#121A2E] transition hover:bg-[#06a874] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            <SendHorizonal className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
