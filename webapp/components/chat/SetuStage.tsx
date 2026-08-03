"use client";
// Setu avatar as product-state indicator (spec §8.2/§8.4 — static MVP).
// CSS-only motion; prefers-reduced-motion collapses everything to a static
// illustration with the same information (§8.6).

import Image from "next/image";

export type AvatarState =
  | "idle"
  | "greeting"
  | "listening"
  | "thinking"
  | "speaking"
  | "pointing"
  | "unsure"
  | "error";

const RING: Record<AvatarState, string> = {
  idle: "ring-[#35B6AE]/30",
  greeting: "ring-[#35B6AE]/60",
  listening: "ring-[#207D78]/60",
  thinking: "ring-[#E8AB42]/60",
  speaking: "ring-[#07B981]/60",
  pointing: "ring-[#07B981]/80",
  unsure: "ring-[#E8AB42]/70",
  error: "ring-red-400/70",
};

export function SetuStage({ state, size = 40 }: { state: AvatarState; size?: number }) {
  return (
    <span
      className={`sp-setu-stage sp-setu-${state} relative inline-block shrink-0 rounded-full ring-2 ${RING[state]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/setu-avatar.png"
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority={false}
      />
      <style jsx>{`
        .sp-setu-stage {
          transition: box-shadow 0.3s ease;
        }
        @media (prefers-reduced-motion: no-preference) {
          .sp-setu-idle {
            animation: sp-bob 4s ease-in-out infinite;
          }
          .sp-setu-thinking {
            animation: sp-pulse 1.2s ease-in-out infinite;
          }
          .sp-setu-speaking {
            animation: sp-pulse 2s ease-in-out infinite;
          }
          .sp-setu-greeting {
            animation: sp-bob 1.2s ease-in-out 2;
          }
          .sp-setu-unsure,
          .sp-setu-error {
            animation: sp-tilt 0.9s ease-in-out 1;
          }
        }
        @keyframes sp-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        @keyframes sp-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.75;
          }
        }
        @keyframes sp-tilt {
          0%,
          100% {
            transform: rotate(0deg);
          }
          30% {
            transform: rotate(-4deg);
          }
          70% {
            transform: rotate(3deg);
          }
        }
      `}</style>
    </span>
  );
}
