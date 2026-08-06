"use client";
// Motion "thinking" state — replaces the literal string "Looking it up on
// SaralPrivacy…" (Dilip, 2026-08-05). Motion says "working" faster than a
// sentence does, and it doesn't age into a lie when the answer takes 2s.
//
// Visual: three teal dots pulsing in sequence under a soft scan-sweep — the
// film's beam-scan beat (SETU_CHARACTER_CANON §5) reduced to one quiet line.
// Screen readers still get a sentence via the sr-only status; reduced-motion
// users get the static text, so nobody loses information (spec §8.6).

import { t } from "@/lib/chat/strings";

export function ThinkingIndicator() {
  return (
    <span className="sp-think inline-flex items-center gap-[6px] py-1" role="status">
      <span className="sr-only">{t("en", "thinking")}</span>
      <span className="sp-dot" aria-hidden="true" />
      <span className="sp-dot" aria-hidden="true" />
      <span className="sp-dot" aria-hidden="true" />
      <span className="sp-sweep" aria-hidden="true" />
      <span className="sp-fallback text-[15px] text-[#354F72]" aria-hidden="true">
        {t("en", "thinking")}
      </span>

      <style jsx>{`
        .sp-think {
          position: relative;
        }
        .sp-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: #35b6ae;
          opacity: 0.35;
        }
        /* The sweep is a thin highlight travelling across the dot row. */
        .sp-sweep {
          position: absolute;
          left: 0;
          top: 50%;
          width: 34px;
          height: 1.5px;
          transform: translateY(6px);
          background: linear-gradient(90deg, transparent, #207d78, transparent);
          opacity: 0;
        }
        .sp-fallback {
          display: none;
        }

        @media (prefers-reduced-motion: no-preference) {
          .sp-dot {
            animation: sp-dot-pulse 1.25s ease-in-out infinite;
          }
          .sp-dot:nth-child(3) {
            animation-delay: 0.16s;
          }
          .sp-dot:nth-child(4) {
            animation-delay: 0.32s;
          }
          .sp-sweep {
            animation: sp-sweep-move 1.9s ease-in-out infinite;
          }
        }

        /* No motion allowed → say it in words instead, same meaning. */
        @media (prefers-reduced-motion: reduce) {
          .sp-dot,
          .sp-sweep {
            display: none;
          }
          .sp-fallback {
            display: inline;
          }
        }

        @keyframes sp-dot-pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        @keyframes sp-sweep-move {
          0% {
            opacity: 0;
            transform: translateY(6px) translateX(-6px);
          }
          35% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translateY(6px) translateX(14px);
          }
        }
      `}</style>
    </span>
  );
}
