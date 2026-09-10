// Silhouette of India for the language switcher chip
// (MULTILINGUAL_SPEC §4.1; Dilip's design, 2026-09-10 — signals "Indian
// languages" instead of a generic translate glyph).
//
// Outline derived from open map data (DataMeet Country/india-osm.geojson,
// community-maintained per the Indian government's depiction), Douglas-Peucker
// simplified to icon scale. ⚠ The full northern crown (Jammu & Kashmir) is part
// of that depiction and is NOT optional: never replace this path with a
// foreign map-library silhouette — truncated-Kashmir outlines are a real
// reputational problem for an Indian compliance brand.

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
      <path d="M8.2 1.8L9.2 1.4L9.7 1.9L10.0 1.8L9.8 2.4L9.3 2.6L9.3 3.0L8.9 3.0L9.0 3.3L8.9 3.5L9.3 3.6L9.4 4.0L8.9 4.3L8.8 4.0L8.5 4.1L8.8 4.6L8.8 5.1L9.0 5.0L9.3 5.3L10.4 5.9L10.0 6.3L9.8 7.1L11.1 7.8L11.7 7.9L11.7 8.1L12.1 8.2L12.7 8.1L13.5 8.7L13.8 8.6L14.0 8.8L15.5 9.0L15.6 7.8L16.0 7.6L16.2 7.8L16.1 8.4L16.3 8.6L18.5 8.6L18.5 8.3L18.2 8.1L18.1 7.8L18.8 7.9L19.4 7.2L19.9 7.1L20.3 6.7L20.8 6.9L21.4 6.6L21.8 7.1L21.6 7.3L21.9 7.3L22.4 7.7L22.0 8.0L22.2 8.4L21.8 8.2L20.7 8.8L20.7 9.2L20.3 9.8L20.4 10.1L20.0 11.0L19.4 10.8L19.4 11.5L19.2 11.6L19.3 12.2L19.1 12.5L19.0 12.3L18.9 12.4L18.6 11.1L18.4 11.1L18.1 11.7L17.8 11.1L18.0 10.8L18.3 10.7L18.6 10.2L18.8 10.1L18.5 9.9L16.9 9.8L16.7 9.1L16.7 9.3L16.5 9.3L16.3 9.0L16.0 9.1L15.8 8.8L15.9 9.0L15.6 9.4L16.3 9.9L15.8 9.9L15.5 10.3L16.1 10.7L15.9 11.1L16.0 11.5L16.2 11.5L16.1 11.6L16.3 12.3L15.9 12.5L15.9 12.4L15.7 12.6L15.6 12.3L15.7 12.4L15.4 12.7L14.7 13.0L14.8 13.4L14.6 13.5L14.8 13.4L14.6 13.7L13.5 14.4L12.7 15.3L11.4 16.3L11.4 16.6L11.2 16.6L11.4 16.7L10.6 16.9L10.3 17.4L10.1 17.2L9.9 17.3L9.7 17.8L10.0 19.3L9.5 20.6L9.6 21.6L9.2 21.7L8.9 22.3L9.1 22.5L8.5 22.6L8.3 23.2L7.9 23.4L7.2 22.8L7.0 21.9L7.1 22.1L7.1 22.0L5.9 19.6L5.5 18.2L5.2 17.6L5.3 17.5L5.2 17.6L4.9 17.1L4.6 15.4L4.7 15.3L4.5 15.0L4.6 15.1L4.6 14.6L4.4 14.5L4.3 14.1L4.6 13.4L4.5 13.0L4.3 13.2L4.5 12.9L4.3 12.8L4.5 12.7L4.3 12.7L4.4 12.5L4.2 12.5L4.3 12.3L4.5 12.3L4.2 12.1L3.9 12.4L4.1 12.7L4.0 13.1L3.0 13.5L2.5 13.2L1.6 12.2L2.5 12.0L3.0 11.5L3.7 11.5L3.3 11.5L3.4 11.4L3.2 11.1L3.3 10.7L2.8 10.7L3.2 10.5L3.2 10.3L2.9 9.5L2.5 9.3L2.5 8.8L2.1 8.7L2.1 8.4L2.7 7.7L3.1 7.9L3.8 7.7L4.2 7.1L4.6 6.9L4.9 6.2L5.3 6.0L5.3 5.8L5.8 5.3L5.7 5.2L5.8 4.6L6.3 4.4L5.8 4.2L5.8 3.9L5.1 3.7L4.9 2.7L5.4 2.1L4.7 1.5L4.3 1.5L4.3 1.2L4.7 0.8L5.2 0.9L5.1 0.7L6.2 0.6L7.3 1.3L7.4 1.5L7.8 1.6L7.8 1.8Z" />
    </svg>
  );
}
