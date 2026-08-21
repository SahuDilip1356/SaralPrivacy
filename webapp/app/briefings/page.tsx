import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { BriefingSentence } from "@/components/briefings/BriefingSentence";
import { BriefingTracks } from "@/components/briefings/BriefingTracks";
import { VerdictWall } from "@/components/briefings/VerdictWall";
import { BriefingAlmanac } from "@/components/briefings/BriefingAlmanac";
import { getArchive, tracksFrom } from "@/lib/data/briefings-archive";
import { formatDateShort } from "@/lib/utils";
import { itemListSchema } from "@/lib/schema";

export const revalidate = 3600; // Briefings publish once daily, at 09:00 IST.

export const metadata: Metadata = {
  title: "Daily DPDPA Compliance Briefings for India",
  description:
    "One practical DPDPA thing to check or fix, every morning. Browse by what just happened in your business, by industry track, or read every verdict.",
  alternates: { canonical: "https://saralprivacy.com/briefings" },
};

/**
 * The briefings landing page — a field manual, not a feed.
 *
 * It used to be a reverse-chronological wall of every briefing ever published:
 * 33 screens of scrolling on desktop, 98 on mobile, and zero cards above the
 * fold on a phone. Scanning could not work either, because the card title is an
 * email subject line by construction and carries none of the words a reader
 * looks for.
 *
 * So the page is now four surfaces, each doing one job the wall was doing badly:
 *
 *   the sentence  — answers "does this apply to me" before anything is learned
 *   today         — the feed job, in one card
 *   tracks        — the library job: a shelf with a beginning and an end
 *   the wall      — the browse job, on verdicts rather than hooks
 *   the run       — proof the thing is alive
 *
 * The exhaustive card grid still exists, at /briefings/all, for the reader who
 * genuinely wants to see everything.
 */
export default async function BriefingsPage() {
  let all: Awaited<ReturnType<typeof getArchive>> = [];
  let fetchFailed = false;
  try {
    all = await getArchive();
  } catch (err) {
    console.error("[briefings] Appwrite fetch failed:", err);
    fetchFailed = true;
  }

  const today = all[0] ?? null;
  const tracks = tracksFrom(all);

  return (
    <div className="min-h-screen bg-cloud-50">
      {all.length > 0 && itemListSchema(
        all.slice(0, 50).map((b) => ({
          name: b.verdict || b.title,
          url: `https://saralprivacy.com/briefings/${b.slug}`,
        })),
        "DPDPA Daily Briefings",
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" aria-hidden />
          <span className="text-xs font-semibold text-slate-600">
            Published every morning, 9 AM IST
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-8">
          DPDPA Daily Briefings
        </h1>

        {fetchFailed ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-lg font-medium mb-2 text-navy-700">Briefings are momentarily unavailable</p>
            <p className="text-sm">Please refresh in a few seconds — they&rsquo;ll be right back.</p>
          </div>
        ) : all.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-lg font-medium mb-2 text-navy-700">No briefings yet</p>
            <p className="text-sm">Daily DPDPA briefings will appear here automatically at 9 AM IST.</p>
          </div>
        ) : (
          <>
            {/* The opener — a sentence about the reader's own week. */}
            <BriefingSentence briefings={all} />

            {/* Today — the feed job, in the one card it deserves. */}
            {today && (
              <section className="mt-14" aria-labelledby="today-heading">
                <h2 id="today-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Today · {formatDateShort(today.date)}
                </h2>
                <Link href={`/briefings/${today.slug}`}
                  className="group block rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-teal-300 transition-colors sm:flex">
                  {today.image && (
                    <div className="sm:w-2/5 shrink-0 aspect-[16/9] sm:aspect-auto bg-navy-700 group-hover:bg-navy-800 transition-colors p-3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={today.image} alt={`${today.infTitle || today.title} — DPDPA infographic`}
                        loading="eager" decoding="async"
                        className="w-full h-full object-contain rounded-md ring-1 ring-white/10 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.04]" />
                    </div>
                  )}
                  <div className="p-5 sm:p-6 flex flex-col justify-center min-w-0">
                    {today.infTitle && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-green-800 leading-snug">
                        {today.infTitle}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-navy-700 leading-snug mt-1 group-hover:text-green-900 transition-colors">
                      {today.verdict || today.title}
                    </h3>
                    {today.fixToday && (
                      <p className="text-sm text-green-800 bg-green-50 rounded-lg px-3 py-2 mt-3">
                        <span className="font-semibold">Fix this today:</span> {today.fixToday}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 mt-4">
                      Read the briefing <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* Tracks — the archive counted the way it was written. */}
            {tracks.length > 0 && (
              <section className="mt-14" aria-labelledby="tracks-heading">
                <h2 id="tracks-heading" className="text-xl font-semibold text-navy-700 mb-1">
                  Work through a track
                </h2>
                <p className="text-sm text-slate-600 mb-5 max-w-2xl">
                  Each industry runs as five consecutive mornings, and each foundation week as a
                  themed set. Pick one and you have something with a beginning and an end.
                </p>
                <BriefingTracks tracks={tracks} />
              </section>
            )}

            {/* The wall — browse by what the briefing concluded, not what it was titled. */}
            <section className="mt-14" aria-labelledby="verdicts-heading">
              <h2 id="verdicts-heading" className="text-xl font-semibold text-navy-700 mb-1">
                Every verdict
              </h2>
              <p className="text-sm text-slate-600 mb-5 max-w-2xl">
                The one line each briefing was written to leave you with. Scan them, and open the
                one that applies.
              </p>
              <VerdictWall briefings={all} />
            </section>

            {/* The run — proof, and a filter readout. */}
            <section className="mt-14" aria-labelledby="run-heading">
              <h2 id="run-heading" className="text-xl font-semibold text-navy-700 mb-1">
                The run
              </h2>
              <p className="text-sm text-slate-600 mb-5 max-w-2xl">
                One cell per morning since the first briefing.
              </p>
              <BriefingAlmanac briefings={all} />
            </section>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <Link href="/assessment"
                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
                <ShieldCheck size={16} /> Check my readiness
              </Link>
              <Link href="/briefings/all"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 hover:text-green-700">
                Browse all {all.length} briefings <ArrowRight size={15} />
              </Link>
            </div>
          </>
        )}

        <div className="mt-14 max-w-md mx-auto">
          <BriefingSubscribeCard />
        </div>
      </div>
    </div>
  );
}
