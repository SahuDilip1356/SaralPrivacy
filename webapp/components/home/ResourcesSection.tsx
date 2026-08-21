import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper, FileDown } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { GUIDE_LANGUAGES } from "@/lib/data/guide-languages";
import { getBriefingCountLabel } from "@/lib/data/briefings-source";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

// S8 — Resources. Three cards, and that is the whole section.
//
// It replaces two full sections — a seven-card briefings deck and a nine-row
// guide table of contents — that together ran past 2,500px doing what 400px
// does. The archives are not lost, they are on their own pages, which is where
// someone browsing an archive actually wants to be.
//
// The counts live here rather than under the hero. "130+ briefings" and "17
// templates" measure our publishing effort; they are a fair claim next to the
// thing they describe, and the wrong claim next to "will this take long and
// will you email me".

/** Downloadable assets in /public/templates — 5 generic + one checklist per sector. */
const TEMPLATE_COUNT = 17;

export async function ResourcesSection() {
  // Both are best-effort: Appwrite is unreachable in some preview builds, and a
  // resources card is never worth failing a page render over.
  const briefingCount = await getBriefingCountLabel();

  let latest: { slug: string; title: string } | null = null;
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
      Query.equal("status", ["sent", "approved"]),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]);
    const doc = result.documents[0] as { slug?: string; title?: string } | undefined;
    if (doc?.slug && doc?.title) latest = { slug: doc.slug, title: doc.title };
  } catch {
    // Fall through to the generic briefings card.
  }

  const cards = [
    {
      icon: BookOpen,
      title: "The complete DPDPA guide",
      description: `What the Act requires, who it applies to, and a 90-day plan — in ${GUIDE_LANGUAGES.length} Indian languages.`,
      href: "/white-paper",
      cta: "Read the guide",
    },
    {
      icon: Newspaper,
      title: latest ? "Latest briefing" : "Daily briefings",
      description: latest
        ? latest.title
        : "A short daily read on what changed in DPDPA and what to do about it.",
      href: latest ? `/briefings/${latest.slug}` : "/briefings",
      cta: briefingCount ? `Browse ${briefingCount} briefings` : "Browse briefings",
    },
    {
      icon: FileDown,
      title: "Template library",
      description: `${TEMPLATE_COUNT} free notices, consent lines, vendor checklists and sector checklists you can adapt today.`,
      href: "/resources",
      cta: "Get the templates",
    },
  ];

  return (
    <Section surface="deep" type="utility">
      <div className="text-center mb-9">
        <Eyebrow surface="deep" className="mb-3">
          Learn more
        </Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-3">
          If you&apos;d rather read first
        </h2>
        <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
          The assessment is faster. But if you want the background, start here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((c) => (
          <Surface key={c.href} rung="card" onDeep className="p-6 flex flex-col">
            <span className="w-10 h-10 rounded-lg bg-cloud-50 grid place-items-center mb-4">
              <c.icon size={19} className="text-slate-600" />
            </span>
            <h3 className="font-semibold text-navy-700 text-base mb-2">{c.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
              {c.description}
            </p>
            {/* Quiet links, not buttons. Green is rationed to the assessment —
                this section's job is to serve the reader who is not ready. */}
            <Link
              href={c.href}
              className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors"
            >
              {c.cta}
              <ArrowRight size={14} />
            </Link>
          </Surface>
        ))}
      </div>
    </Section>
  );
}
