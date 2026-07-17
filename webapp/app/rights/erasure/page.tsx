import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

// /rights/erasure — utility action route.
// 308 Permanent Redirect → /rights#erasure (the authoritative canonical destination).
// permanentRedirect signals to Google/AI crawlers: drop this URL from index.
// noindex metadata backs that up — see app/rights/access/page.tsx for the robots.ts note.
//
// Was → /privacy#data-rights until Jul 2026. See app/rights/access/page.tsx for rationale.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RightsErasurePage() {
  permanentRedirect("/rights#erasure");
}
