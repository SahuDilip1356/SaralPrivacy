"use client";
// The hero "Start free check" CTA. A returning visitor has their previous run
// restored from localStorage, so a plain #tool anchor would drop them back on
// their old result. This clears the saved state and reloads to the tool, so the
// flow always begins at step 0 — "refresh and go back to the beginning".
const LS = "sp_discovery_v1"; // must match DiscoveryClient's key

export default function StartFreshLink({ className, children }: { className?: string; children: React.ReactNode }) {
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    try {
      localStorage.removeItem(LS);
    } catch {
      /* private mode / quota — reload still resets in-memory state */
    }
    window.location.hash = "#tool";
    window.location.reload();
  }
  return (
    <a href="#tool" className={className} onClick={onClick}>
      {children}
    </a>
  );
}
