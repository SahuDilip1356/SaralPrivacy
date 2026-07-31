import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { getBriefingBySlug, briefings as staticBriefings } from "@/lib/data/briefings";
import { formatDate, formatDateShort, getCategoryLabel, getIndustryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { articleSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { WhitepaperCTA } from "@/components/cta/WhitepaperCTA";
import { TemplatesCTA } from "@/components/cta/TemplatesCTA";

export const revalidate = 1800; // ISR — re-render at most every 30 min

interface Props {
  params: Promise<{ slug: string }>;
}

function tryParse(str: string | null | undefined, fallback: any) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

/**
 * Parse the why_it_matters field.
 *
 * v2 — new 6-block infographic structure (version: 2)
 * v1 — Python-pipeline / AI envelope ({ why, why_heading, impact, ... })
 * v0 — plain text (static briefings)
 */
function parseWhyField(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      // v2 — new 6-block infographic structure
      if (parsed.version === 2) {
        return { version: 2, ...parsed };
      }
      // v1 — old Python-pipeline / AI envelope
      if ("why" in parsed) {
        return {
          version: 1,
          whyItMatters: (parsed.why as string) || "",
          overviewHeading: (parsed.why_heading as string) || "",
          businessImpact: (parsed.impact as string) || "",
          whoIsAffected: (parsed.affected as string[]) || [],
          keyHeading: (parsed.key_heading as string) || "",
          saveWorthyTakeaway: (parsed.save as string) || "",
        };
      }
    }
  } catch { /* plain text */ }
  return { version: 0, whyItMatters: raw };
}

// ─── Cached data fetchers ───────────────────────────────────────────────────
// unstable_cache: stores result in Next.js data cache (ISR-aware, survives requests)
// cache (React): deduplicates within a single render pass so generateMetadata
//                and the page component never hit Appwrite twice for the same slug.

async function _fetchBriefingFromDb(slug: string) {
  try {
    // Primary: query by slug (requires slug index in Appwrite)
    let doc: any = null;
    try {
      const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
        Query.equal("slug", slug),
        Query.limit(1),
      ]);
      doc = result.documents[0] || null;
    } catch {
      // slug attribute not indexed — fall back to scanning recent briefings
    }

    // Fallback: fetch recent 50 briefings and match by slug in JS
    if (!doc) {
      const fallback = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ]);
      doc = fallback.documents.find((d: any) => d.slug === slug) || null;
    }

    if (!doc) return null;

    const parsed = parseWhyField(doc.why_it_matters || "");
    const isV2 = parsed.version === 2;

    const whyItMatters      = (parsed as any).whyItMatters      || "";
    const overviewHeading   = (parsed as any).overviewHeading   || "";
    const businessImpact    = (parsed as any).businessImpact    || "";
    const whoIsAffected     = (parsed as any).whoIsAffected     || [];
    const keyHeading        = (parsed as any).keyHeading        || "";
    const saveWorthyTakeaway = (parsed as any).saveWorthyTakeaway || "";

    const raw = doc.infographic_base64 || "";

    return {
      id:              doc.$id,
      slug:            doc.slug,
      title:           doc.title,
      excerpt:         doc.excerpt    || doc.summary?.slice(0, 200) || "",
      date:            doc.published_at || doc.created_at || doc.$createdAt,
      category:        doc.category   || "compliance-guidance",
      industries:      tryParse(doc.industries, ["general"]),
      tags:            tryParse(doc.tags,       []),
      readTime:        doc.read_time  || 5,
      featured:        doc.featured   ?? false,
      whyItMatters,
      businessImpact,
      whoIsAffected,
      summary:         doc.summary    || "",
      actionChecklist: tryParse(doc.action_checklist, []),
      author:          { name: doc.author || "DPDPA Editorial Team" },
      relatedIds:      [] as string[],
      fromDb:          true,
      overviewHeading:    overviewHeading || "",
      overviewBody:       doc.summary    || whyItMatters,
      keyPointsHeading:   keyHeading     || "",
      keyPoints:          whoIsAffected,
      bodyHeading:        "What does this mean for YOUR business?",
      bodyText:           businessImpact || "",
      saveWorthyTakeaway: saveWorthyTakeaway || "",
      // Appwrite Storage URL (new) or base64 data URI (legacy)
      infographicSrc: !raw ? "" : raw.startsWith("https://") ? raw : `data:image/jpeg;base64,${raw}`,
      infographicTitle:   "",
      isV2,
      tag:               (parsed as any).tag               || "",
      hookLine1:         (parsed as any).hook_line1         || "",
      hookLine2:         (parsed as any).hook_line2         || "",
      cardWhat:          (parsed as any).card_what          || "",
      cardWhy:           (parsed as any).card_why           || "",
      cardAction:        (parsed as any).card_action        || "",
      cardOwner:         (parsed as any).card_owner         || "",
      explainerConcept:  (parsed as any).explainer_concept  || "",
      explainerExample:  (parsed as any).explainer_example  || "",
      explainerMistake:  (parsed as any).explainer_mistake  || "",
      actionFormat:      (parsed as any).action_format      || "today",
      actionItems:       (parsed as any).action_items       || [],
      saveLine:          (parsed as any).save_line          || doc.summary || "",
      participation:     (parsed as any).participation      || "",
      themeLabel:        (parsed as any).theme_label        || "",
    };
  } catch (err) {
    console.error("[briefing-detail] Appwrite fetch failed:", err);
    return null;
  }
}

// ISR-aware cache: re-fetches at most every 30 min (matches page revalidate)
const _cachedFetchBriefing = unstable_cache(
  _fetchBriefingFromDb,
  ["briefing-detail-v2"],
  { revalidate: 1800, tags: ["briefings"] }
);

// Request-level deduplication: generateMetadata + page component share one fetch
const getBriefingFromDb = cache(_cachedFetchBriefing);

/**
 * Related briefings, ranked sector-first.
 *
 * Previously this matched on `category` alone, which is why a CA-firms briefing
 * surfaced law-firm articles. `category` is also where the Stage facet is stored
 * (learn|assess|fix|sustain), so once the archive is backfilled a category match
 * means "same journey stage" — even less topical than before. Sector lives in
 * `industries[0]` and is the field that actually expresses topic.
 *
 * One shared fetch of the whole published archive, ranked in memory:
 *   1. same sector (skipped for "general" — 89 briefings share it, so it carries
 *      no signal and would just mean "any foundational briefing")
 *   2. same category / stage
 *   3. recency
 * Ranking in memory rather than filtering in the query keeps the fallback chain
 * intact: a thin sector can never return fewer than 3 results while the archive
 * has 3 to give. Pooling the whole archive (not just the newest N) matters because
 * a sector's few briefings are often months old — a recency-capped pool would miss
 * them and silently fall back to generic matches.
 */
type RelatedCandidate = {
  id: string; slug: string; title: string; date: string; category: string; sector: string;
};

/**
 * The candidate pool: every published briefing, reduced to the ranking fields.
 *
 * Deliberately takes no arguments so `unstable_cache` stores ONE entry shared by all
 * briefing pages — a per-page pool would mean one archive fetch per slug per window.
 * No `Query.select`: `published_at` is a blog_posts attribute, not a briefings one, and
 * selecting an attribute a collection lacks is a 400 that the catch below would swallow
 * into "no related posts, sitewide", silently.
 */
async function _fetchRelatedPool(): Promise<RelatedCandidate[]> {
  const PAGE = 100;
  const docs: any[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
      Query.equal("status", ["sent", "approved"]),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE),
      Query.offset(offset),
    ]);
    docs.push(...result.documents);
    if (result.documents.length < PAGE || docs.length >= result.total) break;
  }
  return docs.map((d) => {
    // `industries` is a JSON string on the document; tolerate a real array too.
    const industries: string[] = Array.isArray(d.industries)
      ? d.industries
      : tryParse(d.industries, []);
    return {
      id:       d.$id,
      slug:     d.slug,
      title:    d.title,
      date:     d.published_at || d.created_at || d.$createdAt,
      category: d.category || "compliance-guidance",
      sector:   industries[0] || "general",
    };
  });
}

const getRelatedPool = unstable_cache(
  _fetchRelatedPool,
  ["briefing-related-pool-v2"],
  { revalidate: 1800, tags: ["briefings"] }
);

async function getRelatedFromDb(currentSlug: string, category: string, sector: string) {
  try {
    const pool = (await getRelatedPool()).filter((c) => c.slug !== currentSlug);

    // "general" covers 89 briefings, so it carries no topical signal — matching on it
    // would just mean "any foundational briefing". Fall through to category + recency.
    const useSector = Boolean(sector) && sector !== "general";
    const score = (c: RelatedCandidate) =>
      (useSector && c.sector === sector ? 2 : 0) + (c.category === category ? 1 : 0);

    return pool
      .map((c, i) => ({ c, i, s: score(c) }))
      // Stable sort: equal scores keep the pool's recency order, so the chain is
      // sector → category/stage → recency and never returns fewer than 3 while the
      // archive has 3 to give.
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .slice(0, 3)
      .map(({ c }) => ({ id: c.id, slug: c.slug, title: c.title, date: c.date, category: c.category }));
  } catch {
    return [];
  }
}

function seoTitle(title: string, max = 46): string {
  if (title.length <= max) return title;
  const truncated = title.slice(0, max - 1).trimEnd();
  return truncated.endsWith("—") || truncated.endsWith("-")
    ? truncated.slice(0, -1).trimEnd()
    : truncated + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalUrl = `https://saralprivacy.com/briefings/${slug}`;

  // Try Appwrite first
  const dbBriefing = await getBriefingFromDb(slug);
  if (dbBriefing) {
    const title = seoTitle(dbBriefing.title);
    return {
      title,
      description: dbBriefing.excerpt,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'article',
        url: canonicalUrl,
        title,
        description: dbBriefing.excerpt,
        publishedTime: dbBriefing.date,
        authors: ['SaralPrivacy Editorial Team'],
      },
    };
  }

  // Fallback to static
  const staticBriefing = getBriefingBySlug(slug);
  // notFound() HERE, not just in the page body: with streaming + loading.tsx the
  // body's notFound() lands after the 200 header is already flushed, so crawlers
  // saw a soft 404. Throwing during metadata resolution emits a real 404 status.
  if (!staticBriefing) notFound();
  const title = seoTitle(staticBriefing.title);
  return {
    title,
    description: staticBriefing.excerpt,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description: staticBriefing.excerpt,
    },
  };
}

export default async function BriefingDetailPage({ params }: Props) {
  const { slug } = await params;

  // Try Appwrite first
  let briefing: any = await getBriefingFromDb(slug);
  let related: any[] = [];

  if (briefing) {
    // If a static briefing exists for this slug, merge its editorNote.
    // The Appwrite document has no editorNote field, so without this merge
    // the editor-note banner would silently disappear for Appwrite-served briefings.
    const staticMatch = getBriefingBySlug(slug);
    if (staticMatch?.editorNote) {
      briefing.editorNote = staticMatch.editorNote;
    }
    // `briefing.industries` is already parsed to an array upstream (see line ~109).
    const sector = (briefing.industries as string[] | undefined)?.[0] || "general";
    related = await getRelatedFromDb(slug, briefing.category, sector);
  } else {
    // Fallback to static data
    const staticBriefing = getBriefingBySlug(slug);
    if (!staticBriefing) notFound();

    briefing = {
      ...staticBriefing,
      fromDb: false,
      isV2: false,
      businessImpact:  staticBriefing.businessImpact,
      whoIsAffected:   staticBriefing.whoIsAffected,
      actionChecklist: staticBriefing.actionChecklist,
      whyItMatters:    staticBriefing.whyItMatters,
    };

    // Static related briefings
    related = staticBriefings
      .filter((b) => staticBriefing.relatedIds.includes(b.id))
      .map((b) => ({ id: b.id, slug: b.slug, title: b.title, date: b.date, category: b.category }));
  }

  return (
    <>
      {articleSchema(
        briefing.title,
        briefing.excerpt,
        `https://saralprivacy.com/briefings/${briefing.slug}`,
        briefing.date
      )}
      {speakableSchema(['.answer-block'], `https://saralprivacy.com/briefings/${briefing.slug}`, briefing.title)}
      {breadcrumbSchema([
        { name: "Home",           url: "https://saralprivacy.com" },
        { name: "Daily Briefings",url: "https://saralprivacy.com/briefings" },
        { name: briefing.title,   url: `https://saralprivacy.com/briefings/${briefing.slug}` },
      ])}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Main content ─────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {briefing.isV2 ? (
                <>
                  {/* Back link */}
                  <Link href="/briefings" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-6 transition-colors">
                    <ArrowLeft size={14} /> Back to Daily Briefings
                  </Link>

                  {/* BLOCK 1 — HEADER */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {briefing.tag && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {briefing.tag}
                        </span>
                      )}
                      {briefing.themeLabel && (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {briefing.themeLabel}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 leading-snug mb-4">
                      {briefing.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(briefing.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} />{briefing.readTime} min read</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-600">{briefing.author.name}</span>
                    </div>
                    {briefing.excerpt && (
                      <AnswerBlock answer={briefing.excerpt} className="mt-4" />
                    )}
                  </div>

                  {/* BLOCK 2 — HOOK */}
                  {(briefing.hookLine1 || briefing.hookLine2) && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-4">
                      <p className="text-red-800 font-bold text-base leading-snug mb-1">{briefing.hookLine1}</p>
                      <p className="text-red-700 text-sm leading-relaxed">{briefing.hookLine2}</p>
                    </div>
                  )}

                  {/* BLOCK 3 — 4 CARDS */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "What is it?",        icon: "📋", content: briefing.cardWhat,   bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-900",   sub: "text-blue-700" },
                      { label: "Why should I care?", icon: "⚠️",  content: briefing.cardWhy,    bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-900",  sub: "text-amber-700" },
                      { label: "What should I do?",  icon: "✅",  content: briefing.cardAction, bg: "bg-green-50",  border: "border-green-100",  text: "text-green-900",  sub: "text-green-700" },
                      { label: "Who owns this?",     icon: "🏢",  content: briefing.cardOwner,  bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-900", sub: "text-purple-700" },
                    ].map(({ label, icon, content, bg, border, text, sub }) => (
                      <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                        <div className="text-xl mb-2">{icon}</div>
                        <div className={`text-xs font-bold ${text} uppercase tracking-wide mb-1`}>{label}</div>
                        <div className={`text-sm font-medium ${sub} leading-snug`}>{content}</div>
                      </div>
                    ))}
                  </div>

                  {/* BLOCK 4 — SIMPLE EXPLAINER */}
                  {(briefing.explainerConcept || briefing.explainerExample || briefing.explainerMistake) && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
                      <h2 className="text-base font-bold text-navy-700 mb-4">In simple words</h2>
                      <div className="space-y-3">
                        {briefing.explainerConcept && (
                          <div className="flex gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <p className="text-slate-700 text-sm leading-relaxed">{briefing.explainerConcept}</p>
                          </div>
                        )}
                        {briefing.explainerExample && (
                          <div className="flex gap-3">
                            <span className="text-lg shrink-0">🏪</span>
                            <p className="text-slate-600 text-sm leading-relaxed">{briefing.explainerExample}</p>
                          </div>
                        )}
                        {briefing.explainerMistake && (
                          <div className="flex gap-3 bg-red-50 rounded-lg p-3 -mx-1">
                            <span className="text-lg shrink-0">❌</span>
                            <p className="text-red-700 text-sm leading-relaxed font-medium">{briefing.explainerMistake}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* BLOCK 5 — ACTION CHECKLIST (format-aware) */}
                  {briefing.actionItems?.length > 0 && (
                    <div className="bg-navy-700 rounded-xl p-6 mb-4">
                      <h2 className="text-white font-bold text-base mb-4">
                        {briefing.actionFormat === "today"   && "✅ Do this today"}
                        {briefing.actionFormat === "team"    && "💬 Ask your team"}
                        {briefing.actionFormat === "mistake" && "🔍 Spot the mistake"}
                        {briefing.actionFormat === "audit"   && "📋 Quick audit"}
                      </h2>
                      <div className="space-y-3">
                        {(briefing.actionItems as string[]).map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full border border-green-400 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-green-400 text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BLOCK 6 — SAVE THIS LINE */}
                  {briefing.saveLine && (
                    <div className="border-l-4 border-green-400 bg-green-50 px-5 py-4 rounded-r-xl mb-4">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Save this</p>
                      <p className="text-green-800 font-semibold text-sm leading-relaxed">
                        &ldquo;{briefing.saveLine}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* SHARE + PARTICIPATION */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                    {briefing.participation && (
                      <p className="text-slate-700 text-sm font-medium mb-4 text-center">{briefing.participation}</p>
                    )}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`"${briefing.saveLine}"\n\nRead more: https://saralprivacy.com/briefings/${briefing.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Share on WhatsApp
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://saralprivacy.com/briefings/${briefing.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        Share on LinkedIn
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${briefing.saveLine}" — Read the full 2-min DPDPA brief:`)}&url=${encodeURIComponent(`https://saralprivacy.com/briefings/${briefing.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Share on X
                      </a>
                    </div>
                  </div>

                  {/* Survey CTA */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 mb-4 text-center">
                    <p className="text-green-100 text-xs font-bold mb-2 uppercase tracking-wide">Free · 3 minutes</p>
                    <h2 className="text-xl font-bold text-white mb-2">Is YOUR business DPDPA-ready?</h2>
                    <p className="text-green-100 text-sm mb-4 max-w-xs mx-auto">Answer a few simple questions. Get your free Readiness Score.</p>
                    <Link href="/assessment" className="inline-block py-2.5 px-6 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors">
                      Check My Readiness →
                    </Link>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-6">
                    <strong>Disclaimer:</strong> This briefing is for educational purposes only and does not constitute legal advice. Consult a qualified data protection lawyer for formal legal opinions specific to your business.
                  </div>

                  {/* Industry tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {(briefing.industries as string[]).map((ind: string) => (
                      <span key={ind} className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        {getIndustryLabel(ind as any)}
                      </span>
                    ))}
                  </div>

                  {/* More on this topic — mobile only (sidebar handles desktop) */}
                  {related.length > 0 && (
                    <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-5 mb-4">
                      <h3 className="font-bold text-navy-700 text-sm mb-4">More on this topic</h3>
                      <div className="space-y-1">
                        {related.map((rel: any) => (
                          <Link
                            key={rel.id}
                            href={`/briefings/${rel.slug}`}
                            className="flex items-start justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 py-2.5 rounded-lg transition-colors group"
                          >
                            <div>
                              <div className="text-xs text-green-600 font-semibold mb-0.5">
                                {getCategoryLabel(rel.category)}
                              </div>
                              <div className="text-sm font-medium text-navy-700 leading-snug group-hover:text-green-600 transition-colors">
                                {rel.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">{formatDateShort(rel.date)}</div>
                            </div>
                            <ArrowRight size={14} className="text-slate-300 shrink-0 mt-1 group-hover:text-green-500 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── LEGACY RENDERER (v0 / v1 old briefings) ── */
                <>
                  {/* Breadcrumb */}
                  <Link
                    href="/briefings"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-6 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to Daily Briefings
                  </Link>

                  {/* Editor note banner — shown when briefing has been reviewed/updated post-notification */}
                  {briefing.editorNote && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
                      <span className="text-blue-500 shrink-0 mt-0.5">ℹ️</span>
                      <p className="text-blue-800 text-xs leading-relaxed">{briefing.editorNote}</p>
                    </div>
                  )}

                  {/* Header card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="navy">{getCategoryLabel(briefing.category)}</Badge>
                      {briefing.featured && <Badge variant="teal">Featured</Badge>}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 leading-snug mb-4">
                      {briefing.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-5 border-b border-slate-100 mb-5">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(briefing.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {briefing.readTime} min read
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-medium text-slate-600">{briefing.author.name}</span>
                    </div>

                    {/* Industry tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(briefing.industries as string[]).map((ind: string) => (
                        <span
                          key={ind}
                          className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200"
                        >
                          {getIndustryLabel(ind as any)}
                        </span>
                      ))}
                    </div>
                    {briefing.excerpt && <AnswerBlock answer={briefing.excerpt} />}
                  </div>

                  {/* ── HOOK — infographic + overview ────────────────────── */}
                  {briefing.infographicSrc && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
                      <img
                        src={briefing.infographicSrc}
                        alt={briefing.infographicTitle || briefing.title}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      {briefing.infographicTitle && (
                        <p className="text-xs text-slate-400 text-center py-2 border-t border-slate-100">
                          {briefing.infographicTitle}
                        </p>
                      )}
                    </div>
                  )}

                  {(briefing.overviewBody || briefing.whyItMatters) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-5">
                      <h2 className="flex items-center gap-2 font-bold text-amber-900 text-base mb-3">
                        <AlertTriangle size={18} className="text-amber-600" />
                        {briefing.overviewHeading || "Why this matters for your business"}
                      </h2>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        {briefing.overviewBody || briefing.whyItMatters}
                      </p>
                    </div>
                  )}

                  {/* ── BODY — key points + what this means ──────────────── */}
                  <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5 space-y-6">
                    {briefing.keyPoints?.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-navy-700 mb-4">
                          {briefing.keyPointsHeading || "Key things to know"}
                        </h2>
                        <ul className="space-y-3">
                          {(briefing.keyPoints as string[]).map((point: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
                              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(briefing.bodyText || briefing.businessImpact) && (
                      <div className={briefing.keyPoints?.length > 0 ? "border-t border-slate-100 pt-5" : ""}>
                        <h2 className="text-xl font-bold text-navy-700 mb-3">
                          {briefing.bodyHeading || "What does this mean for YOUR business?"}
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm">
                          {briefing.bodyText || briefing.businessImpact}
                        </p>
                      </div>
                    )}

                    {/* Fallback for static briefings */}
                    {!briefing.keyPoints?.length && !briefing.bodyText && briefing.summary && (
                      <div>
                        <h2 className="text-xl font-bold text-navy-700 mb-3">Plain-English Summary</h2>
                        <p className="text-slate-600 leading-relaxed">{briefing.summary}</p>
                      </div>
                    )}

                    {briefing.whoIsAffected?.length > 0 && (
                      <div className="border-t border-slate-100 pt-5">
                        <h2 className="text-xl font-bold text-navy-700 mb-3">Who Is Affected</h2>
                        <ul className="space-y-2">
                          {(briefing.whoIsAffected as string[]).map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ── CTA — action checklist + survey prompt ────────────── */}
                  {briefing.actionChecklist?.length > 0 && (
                    <div className="bg-navy-700 rounded-xl p-7 mb-5">
                      <h2 className="text-xl font-bold text-white mb-4">3 things you can do this week</h2>
                      <div className="space-y-3">
                        {(briefing.actionChecklist as string[]).map((action: string, i: number) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full border border-green-400 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-green-400 text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save-worthy takeaway */}
                  {briefing.saveWorthyTakeaway && (
                    <div className="border-l-4 border-green-400 bg-green-50 px-5 py-4 rounded-r-xl mb-5">
                      <p className="text-green-800 font-semibold text-sm italic">
                        &ldquo;{briefing.saveWorthyTakeaway}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Survey CTA — primary */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-7 mb-5 text-center">
                    <p className="text-green-100 text-sm font-semibold mb-2 uppercase tracking-wide">
                      Free — takes 3 minutes
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Is YOUR business ready for DPDPA?
                    </h2>
                    <p className="text-green-100 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
                      Answer a few simple questions. Get your free Readiness Score — sent to your email or WhatsApp.
                    </p>
                    <Link
                      href="/assessment"
                      className="inline-block py-3 px-8 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors text-base shadow-sm"
                    >
                      Check My Readiness →
                    </Link>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-6">
                    <strong>Disclaimer:</strong> This briefing is for educational purposes only and does
                    not constitute formal legal advice. Consult a qualified data protection lawyer for
                    formal legal opinions specific to your business.
                  </div>

                  {/* Secondary CTAs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <Link
                      href="/assessment"
                      className="flex flex-col p-5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <span className="text-green-200 text-xs font-semibold mb-1">Free check</span>
                      <span className="font-bold text-base">Check your readiness</span>
                      <span className="text-green-200 text-sm mt-1">
                        Get your free Readiness Score →
                      </span>
                    </Link>
                    <Link
                      href="/white-paper"
                      className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all"
                    >
                      <span className="text-slate-500 text-xs font-semibold mb-1">Free resource</span>
                      <span className="font-bold text-base text-navy-700">Download the Guide</span>
                      <span className="text-slate-500 text-sm mt-1">
                        Complete DPDPA guide →
                      </span>
                    </Link>
                  </div>

                  {/* More on this topic — mobile only (sidebar handles desktop) */}
                  {related.length > 0 && (
                    <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-5 mb-6">
                      <h3 className="font-bold text-navy-700 text-sm mb-4">More on this topic</h3>
                      <div className="space-y-1">
                        {related.map((rel: any) => (
                          <Link
                            key={rel.id}
                            href={`/briefings/${rel.slug}`}
                            className="flex items-start justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 py-2.5 rounded-lg transition-colors group"
                          >
                            <div>
                              <div className="text-xs text-green-600 font-semibold mb-0.5">
                                {getCategoryLabel(rel.category)}
                              </div>
                              <div className="text-sm font-medium text-navy-700 leading-snug group-hover:text-green-600 transition-colors">
                                {rel.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">{formatDateShort(rel.date)}</div>
                            </div>
                            <ArrowRight size={14} className="text-slate-300 shrink-0 mt-1 group-hover:text-green-500 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <div className="space-y-5">
              {/* Related briefings — desktop only. The grid is grid-cols-1 lg:grid-cols-3,
                  so on mobile this sidebar stacks under the article and duplicated the
                  "More on this topic" block the renderers already emit (lg:hidden).
                  Only this card is hidden: everything else in the sidebar must stay on mobile. */}
              {related.length > 0 && (
                <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-bold text-navy-700 text-sm mb-4">Related Briefings</h3>
                  <div className="space-y-3">
                    {related.map((rel: any) => (
                      <Link
                        key={rel.id}
                        href={`/briefings/${rel.slug}`}
                        className="block hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors group"
                      >
                        <div className="text-xs text-green-600 font-semibold mb-1">
                          {getCategoryLabel(rel.category)}
                        </div>
                        <div className="text-sm font-medium text-navy-700 leading-snug group-hover:text-green-600 transition-colors">
                          {rel.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{formatDateShort(rel.date)}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry tags */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-navy-700 text-sm mb-3">Industries Affected</h3>
                <div className="flex flex-wrap gap-2">
                  {(briefing.industries as string[]).map((ind: string) => (
                    <span
                      key={ind}
                      className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full border border-green-200"
                    >
                      {getIndustryLabel(ind as any)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assessment CTA */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-bold text-navy-700 text-sm mb-2">
                  Is your business DPDPA-ready?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Take our free 3–5 minute industry assessment to find out your compliance risk level.
                </p>
                <Link
                  href="/assessment"
                  className="block text-center py-2.5 px-4 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Take Free Assessment →
                </Link>
              </div>

              {/* Whitepaper + Templates sidebar CTAs */}
              <WhitepaperCTA variant="sidebar" />
              <TemplatesCTA variant="sidebar" />

              {/* Newsletter — inline form, no navigation needed */}
              <BriefingSubscribeCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
