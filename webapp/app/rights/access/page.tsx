import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

// /rights/access — utility action route.
// 308 Permanent Redirect → /rights#access (the authoritative canonical destination).
// permanentRedirect signals to Google/AI crawlers: drop this URL from index.
// noindex metadata backs that up. (robots.ts deliberately does NOT disallow /rights/ —
// it keeps rights pages crawlable as transparency surfaces; noindex alone deindexes
// these two stubs.)
//
// Was → /privacy#data-rights until Jul 2026. The intent is unchanged (thin utility URLs
// stay deindexed; rights authority consolidates on ONE page) — that page is now /rights,
// which carries the full per-right detail. /privacy §9 summarises and links here.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RightsAccessPage() {
  permanentRedirect("/rights#access");
}
