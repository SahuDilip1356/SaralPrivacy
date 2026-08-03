// Live briefings context (Plane 3, pulled forward 2026-08-03).
// On a freshness-intent turn the route fetches the most recent Appwrite
// briefings, scores them lexically against the question, and injects the top
// matches as a DATED context block. Tier rule stands: dated updates only —
// the prompt still prefers canonical Learn content for settled law.
// Any failure (missing env, network, schema drift) degrades to null; the
// turn proceeds on the static index alone.

import { databases, DB_ID, COLLECTIONS, Query } from "../appwrite";
import { tokenize } from "./retrieve.ts";

export const FRESH_INTENT_RE =
  /\b(latest|this (week|month)|recent(ly)?|what('s| is| has) (new|changed|happening)|any (news|updates?)|update on|enforcement (news|date)|notified)\b/;

interface LiveBriefing {
  title: string;
  date: string;
  summary: string;
}

function pick(doc: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = doc[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Best-effort fetch of recent briefings matching the question. Null on any failure. */
export async function fetchLiveBriefings(query: string, limit = 3): Promise<LiveBriefing[] | null> {
  try {
    if (!DB_ID) return null;
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
      Query.orderDesc("$createdAt"),
      Query.limit(25),
    ]);
    const qTokens = new Set(tokenize(query));
    const scored = res.documents
      .map((doc) => {
        const d = doc as unknown as Record<string, unknown>;
        const title = pick(d, ["title", "headline"]);
        const summary = pick(d, ["summary", "excerpt", "whyItMatters", "business_impact", "businessImpact", "content"]);
        const date = pick(d, ["date", "published_at", "publishedAt"]) || String(doc.$createdAt).slice(0, 10);
        if (!title) return null;
        const overlap = tokenize(`${title} ${summary}`).filter((t) => qTokens.has(t)).length;
        return { title, date, summary: summary.slice(0, 600), overlap };
      })
      .filter((b): b is LiveBriefing & { overlap: number } => b !== null)
      .sort((a, b) => b.overlap - a.overlap || (a.date < b.date ? 1 : -1))
      .slice(0, limit);
    return scored.length ? scored.map(({ overlap: _o, ...b }) => b) : null;
  } catch {
    return null;
  }
}

export function briefingsContextBlock(items: LiveBriefing[]): string {
  const lines = items.map((b) => `[briefing · ${b.date}] ${b.title}\n${b.summary}`).join("\n\n");
  return `<briefings_context note="dated updates from SaralPrivacy Daily Briefings — cite the date when you use one; for settled law prefer the Learn guides">\n${lines}\n</briefings_context>`;
}
