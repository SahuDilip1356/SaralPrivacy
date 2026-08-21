import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BriefingsExplorer, type ExplorerBriefing } from "@/components/briefings/BriefingsExplorer";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { getArchive } from "@/lib/data/briefings-archive";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Every DPDPA Daily Briefing",
  description:
    "The complete archive of SaralPrivacy's daily DPDPA briefings, filterable by industry, stage and format.",
  alternates: { canonical: "https://saralprivacy.com/briefings/all" },
};

/**
 * The exhaustive archive.
 *
 * This is the searchable card grid that used to be the whole of /briefings. It
 * is a bad landing page — 33 desktop screens, 98 on mobile, three cards above
 * the fold — but it is a perfectly good *second* page for the reader who has
 * already decided they want to see everything, so it keeps its filters and moves
 * here rather than being deleted.
 */
export default async function AllBriefingsPage() {
  let all: ExplorerBriefing[] = [];
  let fetchFailed = false;
  try {
    all = (await getArchive()).map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      date: b.date,
      readTime: b.readTime,
      image: b.image,
      infTitle: b.infTitle,
      fixToday: b.fixToday,
      stage: b.stage,
      sector: b.sector,
      format: b.format,
    }));
  } catch (err) {
    console.error("[briefings/all] Appwrite fetch failed:", err);
    fetchFailed = true;
  }

  return (
    <div className="min-h-screen bg-cloud-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/briefings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 hover:text-green-700 mb-5">
          <ArrowLeft size={15} /> Back to briefings
        </Link>
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-2">Every briefing</h1>
        <p className="text-slate-600 mb-8 max-w-2xl">
          The complete archive. If you know what you are looking for, the search and filters below
          will find it — otherwise the{" "}
          <Link href="/briefings" className="font-semibold text-green-800 hover:text-green-700">
            briefings page
          </Link>{" "}
          is a faster way in.
        </p>

        {fetchFailed ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-lg font-medium mb-2 text-navy-700">Briefings are momentarily unavailable</p>
            <p className="text-sm">Please refresh in a few seconds.</p>
          </div>
        ) : (
          <BriefingsExplorer briefings={all} />
        )}

        <div className="mt-12 max-w-md mx-auto">
          <BriefingSubscribeCard />
        </div>
      </div>
    </div>
  );
}
