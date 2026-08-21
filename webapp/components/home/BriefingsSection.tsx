import Link from "next/link";
import { ArrowRight } from "lucide-react";
// Only `Surface` survives the merge with main's deck: the briefing cards that
// used `surfaceClasses` are gone, replaced by BriefingsDeck, which owns its
// own geometry. The empty state is still a card and still uses the ladder.
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingsDeck, type DeckBriefing } from "@/components/home/BriefingsDeck";

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

  return (
    <Section surface="deep" type="demo" width="wide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          {/* The pill this used to open with was cloud-100 on cloud-200 —
              1.07:1, a chip you cannot see. The shared Eyebrow does the same
              job and is what every other section on the page opens with. */}
          <Eyebrow surface="deep" className="mb-3">
            Daily briefings
          </Eyebrow>
          <h2 className="type-display-3 text-navy-700">
            Stay ahead of DPDPA developments
          </h2>
          <p className="type-intro text-slate-600 mt-2 max-w-xl">
            Clear, actionable briefings on DPDPA updates, enforcement signals, and compliance
            guidance, written for business owners, not lawyers.
          </p>
        </div>
        {/* green-800, not green-700: on the deep fill green-700 measures
            4.29:1 and misses AA. green-800 is 6.01:1. */}
        <Link
          href="/briefings"
          className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-green-800 hover:text-green-900 shrink-0"
        >
          All briefings
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Empty state */}
      {briefings.length === 0 && (
        <Surface rung="card" onDeep className="p-10 text-center text-slate-600">
          <p className="text-base font-medium mb-1">Briefings coming soon</p>
          <p className="text-sm">Daily DPDPA briefings will appear here automatically.</p>
        </Surface>
      )}

      {briefings.length > 0 && <BriefingsDeck briefings={briefings} />}

      {briefings.length > 0 && (
        <p className="text-slate-600 text-xs mt-6 text-center lg:text-left">
          <span className="hidden lg:inline">Hover a card to bring it forward.</span>
          <span className="lg:hidden">Swipe to browse.</span>{" "}
          One briefing every morning, 9 AM IST.
        </p>
      )}
    </Section>
  );
}
