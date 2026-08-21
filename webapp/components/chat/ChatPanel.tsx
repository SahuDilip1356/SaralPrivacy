"use client";
// The chat surface: desktop ~400×600 card bottom-right, mobile full sheet.
// Focus trap + Esc close + focus return handled here (spec §8.6, WCAG AA).
//
// Outcome layer (SETU_OUTCOME_LAYER_SPEC): the opening state now offers three
// lanes instead of three content chips, escalation opens a real human door
// instead of a link, and the footer says plainly what is stored and where.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { X, SendHorizonal } from "lucide-react";
import { MessageList } from "./MessageList";
import { SetuStage, type AvatarState } from "./SetuStage";
import { OutcomeLanes } from "./OutcomeLanes";
import { HandoffForm } from "./HandoffForm";
import { MemoryPanel } from "./MemoryPanel";
import type { ChatMessage, ChatStatus } from "./useSetuChat";
import { chipsForPage } from "@/lib/chat/site-routing";
import { SETU_ACTION, SETU_FOCUS, SETU_INK, SETU_SURFACE } from "@/lib/chat/theme";
import type { ChatSessionState } from "@/lib/chat/journeys";
import { t } from "@/lib/chat/strings";
import { trackEvent } from "@/lib/analytics";

/** Seeds J3 via journeys.ts entryKeywords ("readiness", "where do we stand"). */
const ASSESS_SEED = "Where does my business stand on DPDPA readiness?";

type HandoffPhase = "none" | "offered" | "form" | "sent";

export function ChatPanel({
  open,
  onClose,
  messages,
  status,
  onSend,
  onFeedback,
  pageUrl,
  state,
  onSubmitHandoff,
  onMarkHandoffOffered,
  onClearSession,
}: {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  status: ChatStatus;
  onSend: (text: string) => void;
  onFeedback: (msg: ChatMessage, helpful: boolean) => void;
  pageUrl: string;
  state: ChatSessionState | null;
  onSubmitHandoff: (
    contact: { name: string; email: string; honeypot: string },
    reason: string
  ) => Promise<{ ok: boolean }>;
  onMarkHandoffOffered: () => void;
  onClearSession: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [handoff, setHandoff] = useState<HandoffPhase>("none");
  const [handoffReason, setHandoffReason] = useState("explicit_ask");
  const fieldsFilledRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);

  // The form is taller than the remaining scroll area, so opening it would
  // otherwise show only "Your name" with no cue that anything follows.
  useEffect(() => {
    if (handoff === "form" || handoff === "sent") {
      handoffRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [handoff]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // The server decides when the human door opens; the panel only renders it.
  const lastSetu = useMemo(
    () => [...messages].reverse().find((m) => m.role === "setu" && !m.streaming),
    [messages]
  );
  const serverEscalation = lastSetu?.meta?.escalation?.reason;

  useEffect(() => {
    if (!serverEscalation) return;
    if (handoff !== "none") return;
    if (state?.handoffOffered) return; // one offer per session (§6.1)
    setHandoffReason(serverEscalation);
    setHandoff("offered");
    trackEvent.chatHandoffOpened({
      reason: serverEscalation,
      journey: state?.journey,
      industry: state?.industry,
    });
  }, [serverEscalation, handoff, state]);

  // An abandoned form is a drop-off worth locating, so report it on unmount
  // with how far they got rather than losing the session silently.
  useEffect(() => {
    if (!open && handoff === "form") {
      trackEvent.chatHandoffAbandoned({
        reason: handoffReason,
        fieldsFilled: fieldsFilledRef.current,
      });
    }
  }, [open, handoff, handoffReason]);

  if (!open) return null;

  const busy = status !== "idle";
  const avatarState: AvatarState =
    status === "thinking"
      ? "thinking"
      : status === "streaming"
        ? "speaking"
        : typing
          ? "listening"
          : messages.length === 0
            ? "greeting"
            : "idle";

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
      'button, a[href], textarea, input:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
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

  const chooseLane = (lane: "assess" | "human") => {
    trackEvent.chatLaneSelected({ lane, page: pageUrl });
    if (lane === "assess") {
      onSend(ASSESS_SEED);
      return;
    }
    setHandoffReason("explicit_ask");
    setHandoff("form");
    onMarkHandoffOffered();
    trackEvent.chatHandoffOpened({
      reason: "explicit_ask",
      journey: state?.journey,
      industry: state?.industry,
    });
  };

  const acceptHandoff = () => {
    setHandoff("form");
    onMarkHandoffOffered();
  };

  const declineHandoff = () => {
    // Declining is a complete answer, not a rejection — Setu simply carries on
    // and never asks again this session.
    setHandoff("none");
    onMarkHandoffOffered();
  };

  const showEmptyState = messages.length === 0;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${t("en", "panelTitle")} — ${t("en", "panelSubtitle")}`}
      onKeyDown={trapKeyDown}
      className="fixed inset-0 z-[70] flex flex-col bg-[#F7F9FC] shadow-2xl sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[600px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200 overflow-hidden"
    >
      {/* Header — SURFACE role (lib/chat/theme.ts), not the ink navy */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: SETU_SURFACE }}>
        <SetuStage state={avatarState} size={40} orb />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-tight text-white">{t("en", "panelTitle")}</p>
          <p className="truncate text-[13px] text-slate-300">{t("en", "panelSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded p-1.5 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2"
          style={{ ["--tw-ring-color" as string]: "#35B6AE" }}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Disclaimer strip — visible for the whole session (spec §7) */}
      <p className="border-b border-slate-200 bg-[#F7F9FC] px-4 py-1.5 text-center text-[13px] font-medium text-[#354F72]">
        {t("en", "disclaimer")}
      </p>

      {showMemory && (
        <MemoryPanel
          state={state}
          onClear={() => {
            onClearSession();
            setHandoff("none");
            setShowMemory(false);
          }}
          onClose={() => setShowMemory(false)}
        />
      )}

      {/* Conversation */}
      {/* min-h-0 is load-bearing: a flex child defaults to min-height:auto, so
          without it this grows to its content instead of scrolling and the
          composer ends up sitting on top of the form. */}
      {showEmptyState ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-start gap-2">
            <SetuStage state="greeting" size={32} />
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-3.5 py-2 text-[15px] leading-relaxed shadow-sm" style={{ color: SETU_INK }}>
              <p className="my-1">{t("en", "greeting")}</p>
              <p className="my-1">{t("en", "greetingPrompt")}</p>
            </div>
          </div>

          {handoff === "form" ? (
            <div className="pl-10" ref={handoffRef}>
              <HandoffForm
                onFieldsChange={(n) => (fieldsFilledRef.current = n)}
                onSubmit={async (contact) => {
                  const res = await onSubmitHandoff(contact, handoffReason);
                  if (res.ok) setHandoff("sent");
                  return res;
                }}
              />
            </div>
          ) : handoff === "sent" ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 pl-3 text-[15px] leading-relaxed text-emerald-900">
              {t("en", "handoffDone")}
            </p>
          ) : (
            <div className="pl-10">
              <OutcomeLanes
                onAssess={() => chooseLane("assess")}
                onHuman={() => chooseLane("human")}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {chipsForPage(pageUrl).map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => onSend(chip.message)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 active:border-[#35B6AE]"
                    style={{ color: SETU_INK, ["--tw-ring-color" as string]: SETU_FOCUS }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MessageList
            messages={messages}
            avatarState={avatarState}
            onFeedback={onFeedback}
            onChip={onSend}
          />
          {(handoff === "offered" || handoff === "form" || handoff === "sent") && (
            <div className="shrink-0 border-t border-slate-200 bg-[#F7F9FC] px-4 py-3">
              {handoff === "offered" && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[15px] leading-snug" style={{ color: SETU_INK }}>
                    {t("en", "handoffOffer")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={acceptHandoff}
                      className="rounded-md px-3 py-1.5 text-[13px] font-semibold transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2"
                      style={{
                        backgroundColor: SETU_ACTION,
                        color: SETU_INK,
                        ["--tw-ring-color" as string]: SETU_FOCUS,
                      }}
                    >
                      {t("en", "handoffYes")}
                    </button>
                    <button
                      type="button"
                      onClick={declineHandoff}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-[13px] font-medium text-[#354F72] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2"
                      style={{ ["--tw-ring-color" as string]: SETU_FOCUS }}
                    >
                      {t("en", "handoffNo")}
                    </button>
                  </div>
                </div>
              )}
              {handoff === "form" && (
                <HandoffForm
                  onFieldsChange={(n) => (fieldsFilledRef.current = n)}
                  onSubmit={async (contact) => {
                    const res = await onSubmitHandoff(contact, handoffReason);
                    if (res.ok) setHandoff("sent");
                    return res;
                  }}
                />
              )}
              {handoff === "sent" && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[15px] leading-relaxed text-emerald-900">
                  {t("en", "handoffDone")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-3">
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
            className="max-h-28 min-h-[42px] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-1"
            style={{ color: SETU_INK, ["--tw-ring-color" as string]: SETU_FOCUS }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            aria-label={t("en", "send")}
            className="rounded-lg p-2.5 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            style={{
              backgroundColor: SETU_ACTION,
              color: SETU_INK,
              ["--tw-ring-color" as string]: SETU_FOCUS,
            }}
          >
            <SendHorizonal className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Trust chrome (§8.2) — more accurate than the reference bots' because
            Setu genuinely stores less. */}
        <p className="mt-2 text-[13px] leading-snug text-slate-500">
          {t("en", "footerNote")}{" "}
          <button
            type="button"
            onClick={() => {
              setShowMemory((v) => !v);
              if (!showMemory) trackEvent.chatMemoryViewed();
            }}
            className="font-medium underline underline-offset-2 hover:text-[#354F72] focus-visible:outline-none focus-visible:ring-2"
            style={{ ["--tw-ring-color" as string]: SETU_FOCUS }}
          >
            {t("en", "memoryOpen")}
          </button>{" "}
          ·{" "}
          <a href="/privacy" className="font-medium underline underline-offset-2 hover:text-[#354F72]">
            {t("en", "footerPrivacy")}
          </a>
        </p>
      </div>
    </div>
  );
}
