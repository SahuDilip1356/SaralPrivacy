// The national flag of India, for the language switcher chip
// (MULTILINGUAL_SPEC §4.1; Dilip's design, 2026-09-11 — replaces the map
// silhouette).
//
// ⚠ Respectful-depiction rules, do not "tidy" these away:
// • Proportions are fixed at 3:2 — the viewBox is 36×24 and the caller sizes
//   by HEIGHT only. Stretching or cropping the flag is the thing the Flag
//   Code of India actually forbids; never pass a square size to it.
// • Colours are the official ones: India saffron #FF9933, white, India green
//   #138808, navy #000080 chakra.
// • The Ashoka Chakra has exactly 24 spokes. Keep the count if you restyle it.
// • Static by design — no animation, no waving, no partial reveal.

const SPOKES = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);

export function IndiaFlagIcon({ height = 12, className }: { height?: number; className?: string }) {
  return (
    <svg
      width={(height * 3) / 2}
      height={height}
      viewBox="0 0 36 24"
      aria-hidden
      className={className}
    >
      <rect width="36" height="8" fill="#FF9933" />
      <rect y="8" width="36" height="8" fill="#FFFFFF" />
      <rect y="16" width="36" height="8" fill="#138808" />
      <g stroke="#000080" strokeWidth="0.5" fill="none">
        <circle cx="18" cy="12" r="3.3" />
        {SPOKES.map((deg) => (
          <line
            key={deg}
            x1="18"
            y1="12"
            x2={18 + 3.3 * Math.cos((deg * Math.PI) / 180)}
            y2={12 + 3.3 * Math.sin((deg * Math.PI) / 180)}
          />
        ))}
      </g>
      <circle cx="18" cy="12" r="0.8" fill="#000080" />
      {/* Hairline keeps the white band visible on white surfaces. */}
      <rect
        x="0.25"
        y="0.25"
        width="35.5"
        height="23.5"
        fill="none"
        stroke="rgba(15,23,42,0.25)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
