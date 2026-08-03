"use client";
// Root of the Setu widget — launcher + panel, mounted once in app/layout.tsx.
// Launcher shows on all public pages; hidden on /admin (spec §8.6).

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChatPanel } from "./ChatPanel";
import { useSetuChat } from "./useSetuChat";
import { t } from "@/lib/chat/strings";

export default function SetuChat() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const { messages, status, send, sendFeedback } = useSetuChat(pathname);

  if (pathname.startsWith("/admin") || pathname.startsWith("/report")) return null;

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("en", "launcherLabel")}
          aria-haspopup="dialog"
          className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#121A2E] shadow-lg ring-2 ring-[#35B6AE]/40 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#207D78] active:scale-95"
        >
          <Image src="/setu-avatar.png" alt="" width={48} height={48} className="rounded-full" />
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
      />
    </>
  );
}
