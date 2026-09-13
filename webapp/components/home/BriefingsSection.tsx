import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { formatDateShort } from "@/lib/utils";
import { getArchive } from "@/lib/data/briefings-archive";
import { BriefingsDeck, type DeckBriefing } from "@/components/home/BriefingsDeck";

// S7 — the briefings deck, on the deep fill.
//
// It held navy for about an hour. When the recognition band left the page there
// was no mid-page dark beat left, and this section took it. Then the founder
// asked for "How it works" back in its four-stage form AND on navy — which
// supplies that beat from better material (the product, not a biography), so
// this one gives the navy back. Otherwise the page would carry six navy
// sections out of ten, and navy stops meaning "a chapter turned" when most of
// the page is navy.
//
// Behaviour is untouched throughout — the founder's instruction on this section
// was "do not touch anything here", and the only thing that has ever changed is
// the ground it sits on. The dateline stays: it is the section's whole
// authority claim, and `revalidate = 3600` on the page keeps it from going
// stale (see app/[locale]/page.tsx).

/** How many briefings the deck fans. Its geometry is tuned for exactly this many. */
const DECK_SIZE = 7;

export async function BriefingsSection() {
  const t = await getTranslations("home.briefings");
  // The same loader /briefings uses. This section used to query Appwrite
  // directly, round the lib/db seam, so when briefings moved to Supabase on
  // 5 Sept the homepage kept serving Appwrite's frozen copy while /briefings
  // moved on. getArchive() is backend-agnostic, date-sorted, and carries the
  // "briefings" tag the publisher busts after every run, so the deck turns
  // over on publish rather than on the hourly revalidate.
  let briefings: DeckBriefing[] = [];
  try {
    // Pick the deck's fields so the client payload stays seven small objects.
    briefings = (await getArchive()).slice(0, DECK_SIZE).map(
      ({ id, slug, title, date, readTime, image, infTitle, stage, sector }) =>
        ({ id, slug, title, date, readTime, image, infTitle, stage, sector }),
    );
  } catch (err) {
    console.error("[BriefingsSection] briefings fetch failed:", err);
  }

  const latest = briefings[0];

  return (
    <Section surface="deep" type="demo" width="wide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-9">
        <div>
          <Eyebrow surface="deep" className="mb-3">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="type-display-3 text-navy-700">{t("title")}</h2>
          <p className="type-intro text-slate-600 mt-2 max-w-xl">
            {t("intro")}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          {/* The dateline. It is the whole authority claim of this section in one
              line — not "we publish daily" but the actual date of the actual
              most recent piece, which is a claim that goes stale in public if it
              is not true. Rendered only when there IS a briefing; an empty desk
              does not get to stamp itself. */}
          {latest && (
            <span className="inline-flex items-center gap-2 rounded-full border border-cloud-300 bg-cloud-25 px-3 py-1">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              <span className="text-2xs font-semibold uppercase tracking-[0.09em] text-teal-800">
                {t("latest")}
              </span>
              <span className="text-2xs text-slate-600 tabular-nums">
                {formatDateShort(latest.date)}
              </span>
            </span>
          )}
          <Link
            href="/briefings"
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-green-800 hover:text-green-900 transition-colors"
          >
            {t("allBriefings")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Empty state. Back to the card rung now that the ground is light —
          `onDeep` steps its border to cloud-300 so the hairline survives on
          cloud-200. */}
      {briefings.length === 0 && (
        <Surface rung="card" onDeep className="p-10 text-center">
          <p className="text-base font-medium text-navy-700 mb-1">{t("comingSoonTitle")}</p>
          <p className="text-sm text-slate-600">{t("comingSoonBody")}</p>
        </Surface>
      )}

      {briefings.length > 0 && <BriefingsDeck briefings={briefings} />}

      {briefings.length > 0 && (
        <p className="text-slate-600 text-xs mt-6 text-center lg:text-left">
          <span className="hidden lg:inline">{t("hoverHint")}</span>
          <span className="lg:hidden">{t("swipeHint")}</span>{" "}
          {t("cadence")}
        </p>
      )}
    </Section>
  );
}
