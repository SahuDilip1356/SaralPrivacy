"use client";
// Setu avatar as product-state indicator (spec §8.2/§8.4).
//
// Motion follows the classic squash-and-stretch principle so a still render
// reads as a character rather than a photo: he compresses before a hop and
// stretches at the top of it. That is where the "bubbly" comes from — not
// from bouncing constantly.
//
// Deliberate restraint: the hop fires ONCE on entering greeting/thinking, then
// settles into a calm sway. This widget sits in the corner of every page, and
// repeating motion in peripheral vision stops being charming within about
// three seconds — it also triggers vestibular discomfort for some people.
// prefers-reduced-motion removes all of it (spec §8.6).

import Image from "next/image";
import { SetuOrb } from "./SetuOrb";

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

/**
 * `orb` opts this instance into the WebGL presence sphere (SetuOrb).
 *
 * Deliberately opt-in rather than default: MessageList mounts one SetuStage
 * per Setu turn, so defaulting to on would spawn a WebGL context per message
 * and hit the browser's ~16-context ceiling inside a normal conversation.
 * The orb belongs where there is exactly one of it and it is big enough to
 * read — the launcher and the panel header.
 */
export function SetuStage({
  state,
  size = 40,
  orb = false,
}: {
  state: AvatarState;
  size?: number;
  orb?: boolean;
}) {
  // With the orb the character sits inboard, so the simmering rim reads all
  // the way round and the orb's own fresnel replaces the flat ring.
  const inset = Math.round(size * 0.64);

  return (
    <span
      className={`sp-stage sp-${state} relative inline-block shrink-0 rounded-full ${
        orb ? "" : `ring-2 ${RING[state]}`
      }`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {orb && <SetuOrb state={state} size={size} />}
      <Image
        src="/setu-avatar.png"
        alt=""
        width={size * 2}
        height={size * 2}
        className={
          orb
            ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
            : "h-full w-full rounded-full object-cover"
        }
        style={orb ? { width: inset, height: inset } : undefined}
        priority={false}
      />
      <style jsx>{`
        .sp-stage {
          transition: box-shadow 0.3s ease;
          transform-origin: 50% 100%; /* feet — squash reads correctly */
          will-change: transform;
        }

        @media (prefers-reduced-motion: no-preference) {
          /* Calm presence: a slow breath, not a bounce. */
          .sp-idle {
            animation: sp-breathe 4.5s ease-in-out infinite;
          }
          /* One bubbly hop on arrival, then still. */
          .sp-greeting {
            animation: sp-hop 0.72s cubic-bezier(0.34, 1.56, 0.64, 1) 1;
          }
          /* Hop once when the question lands, then a thinking sway. */
          .sp-thinking {
            animation:
              sp-hop 0.72s cubic-bezier(0.34, 1.56, 0.64, 1) 1,
              sp-sway 2.4s ease-in-out 0.72s infinite;
          }
          .sp-speaking {
            animation: sp-nod 1.6s ease-in-out infinite;
          }
          .sp-listening {
            animation: sp-lean 0.5s ease-out forwards;
          }
          /* Eager forward lean when there is somewhere to send you. */
          .sp-pointing {
            animation: sp-point 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .sp-unsure {
            animation: sp-tilt 0.9s ease-in-out 1;
          }
          .sp-error {
            animation: sp-shake 0.5s ease-in-out 1;
          }
        }

        /* Squash on the way down, stretch at the peak — the bubbly bit. */
        @keyframes sp-hop {
          0% {
            transform: translateY(0) scale(1, 1);
          }
          18% {
            transform: translateY(1px) scale(1.06, 0.92);
          }
          45% {
            transform: translateY(-9px) scale(0.95, 1.08);
          }
          72% {
            transform: translateY(0) scale(1.05, 0.94);
          }
          100% {
            transform: translateY(0) scale(1, 1);
          }
        }
        @keyframes sp-breathe {
          0%,
          100% {
            transform: translateY(0) scale(1, 1);
          }
          50% {
            transform: translateY(-1.5px) scale(0.995, 1.01);
          }
        }
        @keyframes sp-sway {
          0%,
          100% {
            transform: rotate(-1.5deg) translateY(0);
          }
          50% {
            transform: rotate(1.5deg) translateY(-1px);
          }
        }
        @keyframes sp-nod {
          0%,
          100% {
            transform: translateY(0) scale(1, 1);
          }
          50% {
            transform: translateY(-2px) scale(0.99, 1.02);
          }
        }
        @keyframes sp-lean {
          to {
            transform: rotate(-3deg) scale(1.02);
          }
        }
        @keyframes sp-point {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.08);
          }
          100% {
            transform: translateY(0) scale(1.04);
          }
        }
        @keyframes sp-tilt {
          0%,
          100% {
            transform: rotate(0deg);
          }
          30% {
            transform: rotate(-5deg);
          }
          70% {
            transform: rotate(4deg);
          }
        }
        @keyframes sp-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          75% {
            transform: translateX(3px);
          }
        }
      `}</style>
    </span>
  );
}
