"use client";

// Shared overlay: bottom sheet on mobile, centered drawer on desktop. Wraps a
// detail panel (node or edge). No position:fixed pitfalls - used by both the
// journey and the opt-in full map.

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  onClose: () => void;
  children: ReactNode;
}

export function DetailSheet({ onClose, children }: Props) {
  // Remember what opened the sheet and hand focus back on close - otherwise a
  // keyboard user is dropped at the top of the document and has to tab all the
  // way back to the chip or hotspot they were reading.
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    // Move focus in: with role="dialog" + aria-modal, leaving focus outside
    // means a screen reader is never taken to the content it just announced.
    panelRef.current?.focus();
    return () => openerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/40 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-2 pb-[env(safe-area-inset-bottom)] outline-none sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-1 mt-1 h-1 w-10 rounded-full bg-slate-300 sm:hidden" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
