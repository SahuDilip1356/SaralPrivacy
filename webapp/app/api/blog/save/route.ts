import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";

interface PrimarySource {
  claim: string;
  sourceType: string;
  citation: string;
  riskLevel: string;
}

interface SavePayload {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  lane: string;
  author: string;
  tags: string;
  featured: boolean;
  status: "draft" | "review" | "published";
  section_what_changed: string;
  section_law_says: string;
  section_do_now: string;
  section_uncertain: string;
  section_mistakes: string;
  primary_sources: PrimarySource[];
  validated_at: string;
  score_legal_accuracy: number;
  score_primary_source: number;
  score_currency: number;
  score_scope: number;
  score_operational: number;
  scope_labels?: Record<string, string>;
}

function countWords(text: string): number {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function buildDocument(payload: SavePayload) {
  const {
    title, slug, excerpt, lane, author, tags, featured, status,
    section_what_changed, section_law_says,
    section_do_now, section_uncertain, section_mistakes, primary_sources,
    validated_at,
    score_legal_accuracy, score_primary_source, score_currency, score_scope, score_operational,
  } = payload;

  const validation_score =
    score_legal_accuracy + score_primary_source + score_currency + score_scope + score_operational;

  // Normalise section text — treat empty strings and placeholder "Blank" as null
  function normSection(s: string | null | undefined): string | null {
    if (!s) return null;
    const trimmed = s.trim();
    if (trimmed === "" || trimmed.toLowerCase() === "blank") return null;
    return trimmed;
  }

  const norm_do_now    = normSection(section_do_now);
  const norm_uncertain = normSection(section_uncertain);
  const norm_mistakes  = normSection(section_mistakes);

  // Pack overflow sections into sections_json (Appwrite byte limit workaround)
  const sectionsJsonStr = JSON.stringify({
    section_do_now:    norm_do_now,
    section_uncertain: norm_uncertain,
    section_mistakes:  norm_mistakes,
    primary_sources:   JSON.stringify(primary_sources),
  });

  // Auto read_time from word count (use normalised values so "Blank" doesn't inflate count)
  const totalWords =
    countWords(section_what_changed) +
    countWords(section_law_says) +
    countWords(norm_do_now || "") +
    countWords(norm_uncertain || "") +
    countWords(norm_mistakes || "");
  const read_time = Math.max(1, Math.round(totalWords / 200));

  const published_at =
    status === "published"
      ? (payload as any).published_at || new Date().toISOString().slice(0, 10)
      : undefined;

  const doc: Record<string, unknown> = {
    title:                title.slice(0, 200),
    slug:                 slug.slice(0, 200),
    excerpt:              excerpt.slice(0, 600),
    lane:                 lane.slice(0, 60),
    author:               author.slice(0, 100),
    tags:                 tags ? tags.slice(0, 500) : null,
    featured,
    status,
    section_what_changed: normSection(section_what_changed)?.slice(0, 10000) ?? null,
    section_law_says:     normSection(section_law_says)?.slice(0, 10000) ?? null,
    sections_json:        sectionsJsonStr,
    validated_at:         validated_at ? validated_at.slice(0, 30) : null,
    score_legal_accuracy,
    score_primary_source,
    score_currency,
    score_scope,
    score_operational,
    validation_score,
    read_time,
  };

  if (published_at) {
    doc.published_at = published_at.slice(0, 30);
  }

  return doc;
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || !["authenticated", "blogger"].includes(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload: SavePayload = await req.json();

    if (!payload.title || !payload.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const doc = buildDocument(payload);
    const result = await databases.createDocument(
      DB_ID,
      COLLECTIONS.BLOG_POSTS,
      ID.unique(),
      doc
    );

    return NextResponse.json({ success: true, id: result.$id, slug: result.slug });
  } catch (err: unknown) {
    console.error("[blog/save POST]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || !["authenticated", "blogger"].includes(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload: SavePayload = await req.json();

    if (!payload.id) {
      return NextResponse.json({ error: "Document ID required for update" }, { status: 400 });
    }

    const doc = buildDocument(payload);
    const result = await databases.updateDocument(
      DB_ID,
      COLLECTIONS.BLOG_POSTS,
      payload.id,
      doc
    );

    return NextResponse.json({ success: true, id: result.$id, slug: result.slug });
  } catch (err: unknown) {
    console.error("[blog/save PATCH]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
