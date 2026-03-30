import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

// /rights/access — utility action route.
// 308 Permanent Redirect → /privacy#data-rights (the authoritative canonical destination).
// permanentRedirect signals to Google/AI crawlers: drop this URL from index.
// noindex + robots disallow provide belt-and-suspenders coverage.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RightsAccessPage() {
  permanentRedirect("/privacy#data-rights");
}
