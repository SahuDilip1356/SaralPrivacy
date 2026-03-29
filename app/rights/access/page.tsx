import type { Metadata } from "next";
import { redirect } from "next/navigation";

// /rights/access — utility action route.
// Redirects cleanly to /privacy#data-rights (the authoritative canonical destination).
// noindex prevents this utility route from competing with /privacy in search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RightsAccessPage() {
  redirect("/privacy#data-rights");
}
