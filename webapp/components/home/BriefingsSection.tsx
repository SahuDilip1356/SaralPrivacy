import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { formatDateShort } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingsDeck, type DeckBriefing } from "@/components/home/BriefingsDeck";

// S7 — the briefings deck, on navy: the intelligence desk.
//
// It was a deep-fill reference beat until the recognition band left the page
// (founder call, 2026-08-22). That band was the mid-page dark reset, and a page
// that opens dark, runs light for three long beats and then closes dark has no
// turn in it. This section takes the navy instead — and it earns it better than
// the band did, because "here is what we published this week, dated" is a
// stronger authority claim than "here is who we are".
//
// Inks are the measured navy set: white heads, slate-300 body (11.66:1),
// teal-300 links and stamp, slate-400 for the footnote (6.75:1 — correct here,
// banned on any light fill). The deck's own cards stay white: seven lit objects
// on a dark desk, the same figure/ground move the risk map makes with its hub.

/** How many briefings the deck fans. Its geometry is tuned for exactly this many. */
const DECK_SIZE = 7;

function tryParse<T>(v: unknown, fallback: T): T {
  if (typeof v !== "string") return (v as T) ?? fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}

// Normalise an Appwrite doc into the deck's shape. Facets ride on existing
// attributes: Stage -> category, Sector -> industries[0] (see briefing-taxonomy).
function normalise(doc: any): DeckBriefing {
  const raw = doc.infographic_base64 || "";
  const industries = tryParse<string[]>(doc.industries, ["general"]);
  return {
    id:       doc.$id,
    slug:     doc.slug,
    title:    doc.title,
    date:     doc.published_at || doc.created_at || doc.$createdAt,
    readTime: doc.read_time || 5,
    // Appwrite Storage URL (new) or base64 data URI (legacy) — same unpack as the detail page
    image:    !raw ? "" : raw.startsWith("https://") ? raw : `data:image/jpeg;base64,${raw}`,
    infTitle: tryParse<{ inf_title?: string }>(doc.why_it_matters, {}).inf_title || "",
    stage:    doc.category || "",
    sector:   industries[0] || "general",
  };
}

export async function BriefingsSection() {
  // Fetch latest published briefings from Appwrite
  let briefings: DeckBriefing[] = [];
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
      Query.equal("status", ["sent", "approved"]),
      Query.orderDesc("$createdAt"),
      Query.limit(DECK_SIZE),
    ]);
    briefings = result.documents.map(normalise);
  } catch (err) {
    console.error("[BriefingsSection] Appwrite fetch failed:", err);
  }

  const latest = briefings[0];

  return (
    <Section surface="navy" type="demo" width="wide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-9">
        <div>
          <Eyebrow surface="navy" className="mb-3">
            Daily briefings
          </Eyebrow>
          <h2 className="type-display-3 text-white">
            Stay ahead of DPDPA developments
          </h2>
          <p className="type-intro text-slate-300 mt-2 max-w-xl">
            Clear, actionable briefings on DPDPA updates, enforcement signals, and compliance
            guidance, written for business owners, not lawyers.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          {/* The dateline. It is the whole authority claim of this section in one
              line — not "we publish daily" but the actual date of the actual
              most recent piece, which is a claim that goes stale in public if it
              is not true. Rendered only when there IS a briefing; an empty desk
              does not get to stamp itself. */}
          {latest && (
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-white/5 px-3 py-1">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-teal-300" />
              <span className="text-2xs font-semibold uppercase tracking-[0.09em] text-teal-300">
                Latest
              </span>
              <span className="text-2xs text-slate-300 tabular-nums">
                {formatDateShort(latest.date)}
              </span>
            </span>
          )}
          <Link
            href="/briefings"
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-teal-300 hover:text-teal-200 transition-colors"
          >
            All briefings
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Empty state. Not a Surface — that ladder is built for light fills; on
          navy the card rung would paint a white block where a quiet well
          belongs. */}
      {briefings.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-base font-medium text-white mb-1">Briefings coming soon</p>
          <p className="text-sm text-slate-300">
            Daily DPDPA briefings will appear here automatically.
          </p>
        </div>
      )}

      {briefings.length > 0 && <BriefingsDeck briefings={briefings} />}

      {briefings.length > 0 && (
        <p className="text-slate-400 text-xs mt-6 text-center lg:text-left">
          <span className="hidden lg:inline">Hover a card to bring it forward.</span>
          <span className="lg:hidden">Swipe to browse.</span>{" "}
          One briefing every morning, 9 AM IST.
        </p>
      )}
    </Section>
  );
}
