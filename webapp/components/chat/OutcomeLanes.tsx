"use client";
// Outcome lanes — the opening state's answer to "what do you actually want?"
// (outcome-layer spec §5.1–5.4).
//
// Before this, every path out of the widget led back into the same retrieval
// loop: three content chips of equal visual weight, which communicates no
// priority and admits only one kind of intent. A visitor who arrived wanting
// a person, or wanting to start the assessment, had no affordance saying so.
//
// Learn is deliberately NOT a button — it is the composer, which is already
// on screen. Making it a third button would flatten the hierarchy back out.

import { SETU_ACTION, SETU_FOCUS, SETU_INK } from "@/lib/chat/theme";
import { t } from "@/lib/chat/strings";

export type Lane = "learn" | "assess" | "human";

export function OutcomeLanes({
  onAssess,
  onHuman,
}: {
  onAssess: () => void;
  onHuman: () => void;
}) {
  return (
    <div
      role="group"
      aria-label={t("en", "laneGroupLabel")}
      className="mt-3 flex flex-col gap-2"
    >
      <LaneButton label={t("en", "laneAssess")} aria={t("en", "laneAssessAria")} onClick={onAssess} />
      <LaneButton label={t("en", "laneHuman")} aria={t("en", "laneHumanAria")} onClick={onHuman} />
    </div>
  );
}

function LaneButton({
  label,
  aria,
  onClick,
}: {
  label: string;
  aria: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="w-full rounded-lg px-4 py-2.5 text-[15px] font-semibold transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.99]"
      style={{
        backgroundColor: SETU_ACTION,
        color: SETU_INK,
        // Tailwind's ring-* can't read a JS constant; setting the custom
        // property keeps the focus colour in one place with the others.
        ["--tw-ring-color" as string]: SETU_FOCUS,
      }}
    >
      {label}
    </button>
  );
}
