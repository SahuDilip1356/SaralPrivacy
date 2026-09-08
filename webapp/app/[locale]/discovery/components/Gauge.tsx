"use client";
import { bandColor } from "@/lib/discovery/engine";
import type { RiskBand } from "@/lib/discovery/types";

// Semicircle risk gauge (0–100), colored by band. Labelled for screen readers (§8).
export default function Gauge({ score, band }: { score: number; band: RiskBand }) {
  const color = bandColor(band);
  const R = 88;
  const C = Math.PI * R; // semicircle arc length
  const frac = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="gauge" role="img" aria-label={`Personal data risk score ${Math.round(score)} out of 100 — ${band} risk`}>
      <svg viewBox="0 0 200 116" width="200" height="116" aria-hidden="true" focusable="false">
        <path d="M12 104 A88 88 0 0 1 188 104" fill="none" stroke="#E8EDF3" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M12 104 A88 88 0 0 1 188 104"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="gauge-center" aria-hidden="true">
        <div className="gauge-score" style={{ color }}>{Math.round(score)}</div>
        <div className="gauge-of">/ 100</div>
      </div>
    </div>
  );
}
