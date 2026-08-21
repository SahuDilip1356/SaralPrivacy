"use client";
// "What Setu remembers" — the trust chrome (outcome-layer §8.1).
//
// The point is not the control, it is that the control can exist at all.
// Setu's session state is small, local and honest enough to show a visitor in
// full — which is the live demonstration of the discipline SaralPrivacy sells,
// and the thing a tracking-based competitor cannot put on screen.
//
// Rules: describe state in the user's words, never dump JSON; say plainly
// where it lives; make clearing it one button.

import { SETU_FOCUS, SETU_INK } from "@/lib/chat/theme";
import type { ChatSessionState } from "@/lib/chat/journeys";
import { journeyById } from "@/lib/chat/journeys";
import { t } from "@/lib/chat/strings";

const INDUSTRY_WORDS: Record<string, string> = {
  "ca-firms": "a CA firm",
  "recruitment-agencies": "a recruitment agency",
  "training-institutes": "a training institute",
  "d2c-brands": "a D2C brand",
  "clinics-diagnostic-labs": "a clinic or diagnostic lab",
  "schools-colleges": "a school or college",
  "law-firms": "a law firm",
  "real-estate": "a real-estate business",
  "hotels-travel": "a hotel or travel business",
  pharmacies: "a pharmacy",
  "fintech-nbfc": "a fintech or NBFC",
  "gyms-salons-spas": "a gym, salon or spa",
};

/** State → sentences a person would actually say. Empty array = nothing known. */
export function describeState(state: ChatSessionState | null): string[] {
  if (!state) return [];
  const lines: string[] = [];

  if (state.industry) {
    lines.push(`You mentioned you're ${INDUSTRY_WORDS[state.industry] ?? "in " + state.industry}.`);
  }
  if (state.journey) {
    lines.push(`We're working through: ${journeyById(state.journey).name}`);
  }
  const facts = Object.entries(state.factsConfirmed);
  for (const [k, v] of facts.slice(0, 5)) {
    lines.push(`You told me ${k}: ${v}`);
  }
  if (state.pagesShown.length) {
    lines.push(`Guides I've pointed you to: ${state.pagesShown.slice(0, 5).join(", ")}`);
  }
  if (state.messageCount > 0) {
    lines.push(`Messages this session: ${state.messageCount}`);
  }
  return lines;
}

export function MemoryPanel({
  state,
  onClear,
  onClose,
}: {
  state: ChatSessionState | null;
  onClear: () => void;
  onClose: () => void;
}) {
  const lines = describeState(state);

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] font-semibold" style={{ color: SETU_INK }}>
          {t("en", "memoryTitle")}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 text-[13px] font-medium text-[#354F72] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2"
          style={{ ["--tw-ring-color" as string]: SETU_FOCUS }}
        >
          Close
        </button>
      </div>

      {lines.length === 0 ? (
        <p className="mt-1.5 text-[13px] text-[#354F72]">{t("en", "memoryEmpty")}</p>
      ) : (
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] leading-snug text-[#354F72]">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-[13px] leading-snug text-slate-500">{t("en", "memoryStorage")}</p>

      <button
        type="button"
        onClick={onClear}
        className="mt-2 rounded-md border border-slate-300 px-3 py-1.5 text-[13px] font-semibold transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2"
        style={{ color: SETU_INK, ["--tw-ring-color" as string]: SETU_FOCUS }}
      >
        {t("en", "memoryClear")}
      </button>
    </div>
  );
}
