// Simplified silhouette of India for the language switcher chip
// (MULTILINGUAL_SPEC §4.1; Dilip's design, 2026-09-10 — replaces the generic
// translate glyph to signal "Indian languages").
//
// ⚠ The outline deliberately follows the OFFICIAL Indian depiction — the full
// northern crown including Jammu & Kashmir. Never swap this for a foreign
// map-library silhouette: truncated-Kashmir outlines are a real reputational
// problem for an Indian compliance brand. Decorative simplification is fine;
// the crown is not optional.

export function IndiaIcon({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M8.6 1.4 10.9 2l1.8 1.5-.6 1.9 1.7 1.2 2.4-.4 1.2 1.1 2.6-.6 1.5 1.3-1.9 1.2.4 1.4-2.1-.3-1.5 1-1.4-.6-.9.9.5 1.6-1.1 3.2-1.4 2.9-1.3 2.9-.9-2.6-1.5-2.1-2.2-1.6-1.6-2.3-2-1 .5-1.7-1.5-1.3 1.6-1.5-.4-2 1.7.3 1.3-1.5-.7-1.6L7 3.4l1.6-2Z" />
    </svg>
  );
}
