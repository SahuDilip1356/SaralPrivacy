/**
 * briefings-archive.ts — one fetch + one normalise for every briefings surface.
 *
 * `/briefings` and `/briefings/all` both need the whole archive, and before this
 * they would each have run their own paginated loop and their own field
 * unpacking. Two copies of the unpacking is how the two pages start disagreeing
 * about what a briefing is.
 *
 * Everything below comes out of fields the pipeline already writes. The three
 * facets ride on existing Appwrite attributes (see briefing-taxonomy.ts), and the
 * verdict, the infographic headline and the week theme all live inside the
 * `why_it_matters` JSON envelope — the same envelope the detail page parses.
 * Topic slugs are derived here, server-side, so the client receives ten short
 * strings instead of 240 briefings' worth of body text.
 */
import { queryDocuments } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { FORMAT_SLUGS } from "@/lib/data/briefing-taxonomy";
import { topicsFor } from "@/lib/data/briefing-topics";

export interface ArchiveBriefing {
  id: string;
  slug: string;
  title: string;      // the hook headline — an email subject line by construction
  excerpt: string;
  date: string;
  readTime: number;
  image: string;      // infographic URL (or data URI); "" when none
  infTitle: string;   // the infographic's own headline — descriptive where the title isn't
  verdict: string;    // the save-worthy takeaway. The best line in the briefing.
  fixToday: string;   // first action-checklist item; "" when none
  weekTheme: string;  // foundations only — the editorial week it belongs to
  stage: string;
  sector: string;
  format: string;
  topics: string[];
}

const PAGE = 100;
/** Safety stop so a bad `total` can never spin the loop forever. */
const MAX_PAGES = 50;

function tryParse<T>(v: unknown, fallback: T): T {
  if (typeof v !== "string") return (v as T) ?? fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

/** The `why_it_matters` envelope, in both the shapes the pipeline has written. */
interface WhyEnvelope {
  save?: string;
  inf_title?: string;
  week_theme?: string;
  why?: string;
  impact?: string;
  affected?: string[];
}

function normalise(doc: Record<string, unknown>): ArchiveBriefing {
  const industries = tryParse<string[]>(doc.industries, ["general"]);
  const tags = tryParse<string[]>(doc.tags, []);
  const why = tryParse<WhyEnvelope>(doc.why_it_matters, {});
  const checklist = tryParse<string[]>(doc.action_checklist, []);

  const rawImg = (doc.infographic_base64 as string) || "";
  const summary = (doc.summary as string) || "";
  const title = (doc.title as string) || "";
  const excerpt = (doc.excerpt as string) || summary.slice(0, 200) || "";
  const verdict = why.save || "";
  const fixToday = (checklist.find(Boolean) || "").toString();

  return {
    id: doc.$id as string,
    slug: doc.slug as string,
    title,
    excerpt,
    date: (doc.published_at || doc.created_at || doc.$createdAt) as string,
    readTime: (doc.read_time as number) || 5,
    image: !rawImg ? "" : rawImg.startsWith("https://") ? rawImg : `data:image/jpeg;base64,${rawImg}`,
    infTitle: why.inf_title || "",
    verdict,
    fixToday,
    weekTheme: why.week_theme || "",
    stage: (doc.category as string) || "",
    sector: industries[0] || "general",
    format: tags.find((t) => FORMAT_SLUGS.has(t)) ?? "",
    // Everything textual the document holds, so a briefing is tagged on what it
    // says rather than on the hook it was titled with.
    topics: topicsFor(title, excerpt, verdict, summary, fixToday, why.inf_title,
                      why.why, why.impact, why.affected),
  };
}

async function fetchAll(): Promise<ArchiveBriefing[]> {
  const docs: Record<string, unknown>[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await queryDocuments("briefings", {
      where: [{ field: "status", value: ["sent", "approved"] }],
      orderBy: { field: "$createdAt", dir: "desc" },
      limit: PAGE,
      offset: page * PAGE,
    });
    docs.push(...(result.docs as unknown as Record<string, unknown>[]));
    if (result.docs.length < PAGE || docs.length >= result.total) break;
  }
  return docs
    .filter((d) => d.slug)
    .map(normalise)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** All published briefings, newest first. Cached hourly; publishing is once daily. */
export const getArchive = unstable_cache(fetchAll, ["briefings-archive-v1"], {
  revalidate: 3600,
  tags: ["briefings"],
});

/**
 * Tracks — the archive's own shape, which nothing on the page currently states.
 * Foundations group by editorial week; every vertical is five consecutive
 * mornings. Ordered oldest-first inside a track, because a track is read forwards.
 */
export interface Track {
  key: string;
  title: string;
  kind: "week" | "sector";
  briefings: ArchiveBriefing[];
}

export function tracksFrom(all: ArchiveBriefing[]): Track[] {
  const groups = new Map<string, ArchiveBriefing[]>();
  for (const b of all) {
    // Foundations have no vertical, so their week theme is the only grouping
    // available; skip the ones published before week_theme was being stored.
    const key = b.sector === "general" ? (b.weekTheme ? `week:${b.weekTheme}` : "") : `sector:${b.sector}`;
    if (!key) continue;
    const list = groups.get(key);
    if (list) list.push(b);
    else groups.set(key, [b]);
  }
  return [...groups.entries()]
    .map(([key, briefings]) => {
      const ordered = [...briefings].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return {
        key,
        kind: key.startsWith("week:") ? ("week" as const) : ("sector" as const),
        title: key.slice(key.indexOf(":") + 1),
        briefings: ordered,
      };
    })
    // Newest track first, so the vertical published this week leads.
    .sort((a, b) =>
      new Date(b.briefings[b.briefings.length - 1].date).getTime() -
      new Date(a.briefings[a.briefings.length - 1].date).getTime()
    );
}
