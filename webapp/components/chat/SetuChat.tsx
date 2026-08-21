"use client";
// Root of the Setu widget — launcher + proactive nudge + panel, mounted once
// in app/layout.tsx. Launcher shows on all public pages; hidden on /admin
// and /report (spec §8.6). Nudge policy lives in lib/chat/triggers.ts.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { SetuStage } from "./SetuStage";
import { useSetuChat } from "./useSetuChat";
import { SETU_SURFACE } from "@/lib/chat/theme";
import { t } from "@/lib/chat/strings";
import { trackEvent } from "@/lib/analytics";
import {
  afterDismissed,
  afterShown,
  canShowProactive,
  triggerForPage,
  type PageTrigger,
  type ProactiveStore,
} from "@/lib/chat/triggers";

const PROACTIVE_KEY = "sp_setu_proactive"; // { dismissedUntil?, muted }
const SESSION_SHOWN_KEY = "sp_setu_proactive_shown";

function loadStore(): ProactiveStore {
  let muted = false;
  let dismissedUntil: number | undefined;
  let shownThisSession = false;
  try {
    const raw = localStorage.getItem(PROACTIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProactiveStore>;
      muted = parsed.muted === true;
      dismissedUntil = typeof parsed.dismissedUntil === "number" ? parsed.dismissedUntil : undefined;
    }
    shownThisSession = sessionStorage.getItem(SESSION_SHOWN_KEY) === "1";
  } catch {
    /* private mode — defaults */
  }
  return { muted, dismissedUntil, shownThisSession };
}

function saveStore(store: ProactiveStore) {
  try {
    localStorage.setItem(
      PROACTIVE_KEY,
      JSON.stringify({ muted: store.muted, dismissedUntil: store.dismissedUntil })
    );
    if (store.shownThisSession) sessionStorage.setItem(SESSION_SHOWN_KEY, "1");
  } catch {
    /* ignore */
  }
}

export default function SetuChat() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  // Carries the whole trigger, not just its text, so a qualification opener
  // can offer its answer chips inline (§7.2).
  const [nudge, setNudge] = useState<PageTrigger | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const {
    messages,
    status,
    send,
    sendFeedback,
    state,
    submitHandoff,
    markHandoffOffered,
    confirmFact,
    clearSession,
  } = useSetuChat(pathname);

  const openPanel = useCallback(
    (proactive: boolean) => {
      setNudge(null);
      setOpen(true);
      trackEvent.chatOpened({ page: pathname, proactive });
    },
    [pathname]
  );

  // Proactive invitation (spec §2.4): armed per page, one per session.
  useEffect(() => {
    if (open) return;
    const trigger = triggerForPage(pathname);
    if (!trigger) return;
    const store = loadStore();
    if (!canShowProactive(store, Date.now())) return;

    const fire = () => {
      const s = loadStore();
      if (!canShowProactive(s, Date.now())) return;
      saveStore(afterShown(s));
      setNudge(trigger);
      trackEvent.chatProactiveShown({ page: pathname });
    };

    if (trigger.condition.kind === "dwell") {
      const id = window.setTimeout(fire, trigger.condition.ms);
      return () => window.clearTimeout(id);
    }
    const threshold = trigger.condition.percent / 100;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= threshold) {
        window.removeEventListener("scroll", onScroll);
        fire();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, open]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/report")) return null;

  const dismissNudge = (mute: boolean) => {
    saveStore(afterDismissed(loadStore(), Date.now(), mute));
    setNudge(null);
    trackEvent.chatProactiveDismissed({ page: pathname, muted: mute });
  };

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  return (
    <>
      {nudge && !open && (
        <div
          role="status"
          className="fixed bottom-24 right-5 z-[70] w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] leading-snug text-[#121A2E]">{nudge.message}</p>
            <button
              type="button"
              onClick={() => dismissNudge(false)}
              aria-label={t("en", "proactiveDismiss")}
              className="shrink-0 rounded p-0.5 text-slate-400 transition hover:text-[#121A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {/* Qualification chips: answering fills a journey slot AND opens the
              panel with the question already asked, so the opener costs the
              visitor one tap instead of a typed sentence. */}
          {nudge.chips && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {nudge.chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    confirmFact(chip.slot, chip.value);
                    openPanel(true);
                    send(chip.message);
                  }}
                  className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[13px] font-medium text-[#121A2E] transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => openPanel(true)}
              className="rounded-md bg-[#07B981] px-3 py-1.5 text-[13px] font-semibold text-[#121A2E] transition hover:bg-[#06a874] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78]"
            >
              {t("en", "launcherLabel")}
            </button>
            <button
              type="button"
              onClick={() => dismissNudge(true)}
              className="text-[13px] font-medium text-[#354F72] underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#207D78]"
            >
              {t("en", "muteProactive")}
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => openPanel(false)}
          aria-label={t("en", "launcherLabel")}
          aria-haspopup="dialog"
          className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#207D78] active:scale-95"
          style={{ backgroundColor: SETU_SURFACE }}
        >
          {/* The orb replaces the old static ring — its fresnel rim and halo
              are the presence signal now, so no ring-2 class here. */}
          <SetuStage state="idle" size={56} orb />
        </button>
      )}
      <ChatPanel
        open={open}
        onClose={close}
        messages={messages}
        status={status}
        onSend={send}
        onFeedback={sendFeedback}
        pageUrl={pathname}
        state={state}
        onSubmitHandoff={submitHandoff}
        onMarkHandoffOffered={markHandoffOffered}
        onClearSession={clearSession}
      />
    </>
  );
}
