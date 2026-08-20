import Link from "next/link";
import { SECTORS } from "@/lib/data/sectors";
import { DATA_MAPS } from "@/lib/data/data-flow";
import { assessmentSectorFor } from "@/lib/data/briefing-taxonomy";

// Every tool link on a briefing page sits in the chrome — three in the nav,
// four in the footer, the rest in CTA cards below the article. A reader in the
// middle of the piece has no way into the tools without first leaving the
// sentence they are reading. This is that way in: one line of prose, inside the
// article flow, naming the sector the briefing is actually about.
//
// Deliberately not a card or a button. The page already ends in CTA blocks; a
// fourth one mid-article would read as an ad break. Links carry the 5.48:1
// green-700 recipe and a visible focus ring.

interface Props {
  /**
   * `industries[0]` — a BRIEFING sector slug, which is a different vocabulary
   * from the 12 assessment sectors (see assessmentSectorFor). Most briefings
   * are tagged "general" and get the general prompt.
   */
  sector?: string;
  className?: string;
}

export function InBodyToolLink({ sector, className }: Props) {
  const assessmentSlug = assessmentSectorFor(sector);
  const match = SECTORS.find((s) => s.slug === assessmentSlug);
  const flow = match
    ? DATA_MAPS.find((m) => m.sector.slug === match.slug && m.live)
    : undefined;

  const link =
    "font-medium text-green-700 underline underline-offset-2 decoration-green-700/40 hover:decoration-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded-sm";

  return (
    <aside
      className={`border-l-2 border-green-700 pl-4 py-1 text-sm text-slate-700 leading-relaxed ${className ?? ""}`}
    >
      {match ? (
        <>
          {/* navLabel keeps its own casing — lowercasing "Fintech, NBFC &
              Digital Payments" mid-sentence reads as a typo. */}
          This applies directly to {match.navLabel}.{" "}
          <Link href={`/assessment/${match.assessmentSlug}`} className={link}>
            Check where your own business stands
          </Link>{" "}
          in 3 to 5 minutes, no email to start
          {flow ? (
            <>
              , or{" "}
              <Link href={flow.href} className={link}>
                see how personal data actually moves through a business like yours
              </Link>
            </>
          ) : null}
          .
        </>
      ) : (
        <>
          Not sure whether any of this applies to you?{" "}
          <Link href="/assessment" className={link}>
            Check your DPDPA readiness
          </Link>{" "}
          in 3 to 5 minutes, or{" "}
          <Link href="/discovery" className={link}>
            find where your personal data actually sits
          </Link>
          . Both are free and need no email to start.
        </>
      )}
    </aside>
  );
}
