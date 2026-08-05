// Pinecone vector store for Setu (decision D7, 2026-08-04 — Dilip).
// Supersedes the in-repo JSON index as the PRIMARY retrieval path.
//
// Integrated index: Pinecone hosts the embedding model (llama-text-embed-v2),
// so we send plain text and it embeds server-side — no OpenAI/OpenRouter
// dependency. Metadata (tier/industry/url/...) rides on each record so
// filtering happens inside Pinecone rather than after retrieval.
//
// Runtime uses the REST API via fetch rather than the SDK: one less dependency
// and no cold-start weight in a serverless route. Every call is wrapped so a
// Pinecone outage degrades to the local lexical index instead of breaking chat.

import type { ChatChunk } from "./index-build.ts";
import type { IndustrySlug } from "./site-routing.ts";
import type { RetrievalResult, RetrievedChunk } from "./retrieve.ts";

export const INDEX_NAME = "saralprivacy-setu";
export const INDEX_HOST = "saralprivacy-setu-k0kthbf.svc.aped-4627-b74a.pinecone.io";
export const NAMESPACE = "content";
export const EMBED_MODEL = "llama-text-embed-v2";
export const RERANK_MODEL = "bge-reranker-v2-m3";
const API_VERSION = "2025-04";

/** Upsert cap for INTEGRATED indexes is 96 records/request (embedding batch). */
export const UPSERT_BATCH = 96;

export function pineconeKey(): string | null {
  const key = process.env.PINECONE_API_KEY?.trim();
  return key && key.length > 10 ? key : null;
}

export function isPineconeConfigured(): boolean {
  return pineconeKey() !== null;
}

/** Record shape sent to Pinecone. `chunk_text` is the embedded field (fieldMap);
 *  every other key is stored as filterable metadata. Values must be scalars or
 *  string arrays — no nested objects, no nulls. */
export interface PineconeRecord {
  _id: string;
  chunk_text: string;
  url: string;
  title: string;
  section: string;
  tier: number;
  extraction: string;
  topicTags: string[];
  industry?: string;
}

export function chunkToRecord(chunk: ChatChunk): PineconeRecord {
  const rec: PineconeRecord = {
    _id: chunk.id,
    // Prefix with title/section so the embedding carries page context, matching
    // how the lexical index weights those fields.
    chunk_text: `${chunk.title} — ${chunk.section}\n${chunk.text}`,
    url: chunk.url,
    title: chunk.title,
    section: chunk.section,
    tier: chunk.tier,
    extraction: chunk.extraction,
    topicTags: chunk.topicTags.slice(0, 20),
  };
  // Omit rather than null — Pinecone rejects null metadata values.
  if (chunk.industry) rec.industry = chunk.industry;
  return rec;
}

interface SearchHit {
  _id?: string;
  id?: string;
  _score?: number;
  score?: number;
  fields?: Record<string, unknown>;
}

export interface PineconeSearchOptions {
  topK?: number;
  topN?: number;
  industry?: IndustrySlug;
  timeoutMs?: number;
}

/** Semantic search + rerank. Returns null on ANY failure so callers fall back. */
export async function pineconeSearch(
  query: string,
  opts: PineconeSearchOptions = {}
): Promise<RetrievalResult | null> {
  const key = pineconeKey();
  if (!key || !query.trim()) return null;

  const { topK = 24, topN = 6, industry, timeoutMs = 4000 } = opts;

  // Sector questions must still see cross-cutting law pages, so filter by
  // "this industry OR not industry-specific" rather than industry alone.
  const filter = industry
    ? { $or: [{ industry: { $eq: industry } }, { industry: { $exists: false } }] }
    : undefined;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://${INDEX_HOST}/records/namespaces/${NAMESPACE}/search`,
      {
        method: "POST",
        headers: {
          "Api-Key": key,
          "Content-Type": "application/json",
          "X-Pinecone-API-Version": API_VERSION,
        },
        // NB: the REST API is snake_case (top_k / top_n); the SDK camelCases.
        body: JSON.stringify({
          query: { top_k: topK, inputs: { text: query.slice(0, 2000) }, ...(filter ? { filter } : {}) },
          rerank: { model: RERANK_MODEL, top_n: topN, rank_fields: ["chunk_text"] },
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      console.error(`pinecone search ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as { result?: { hits?: SearchHit[] } };
    const hits = data.result?.hits ?? [];
    if (hits.length === 0) return null;

    const retrieved: RetrievedChunk[] = hits.map((h) => {
      const f = (h.fields ?? {}) as Record<string, string | number | string[]>;
      const text = String(f.chunk_text ?? "");
      return {
        chunk: {
          id: String(h._id ?? h.id ?? ""),
          url: String(f.url ?? ""),
          title: String(f.title ?? ""),
          section: String(f.section ?? ""),
          tier: Number(f.tier ?? 1) as ChatChunk["tier"],
          topicTags: Array.isArray(f.topicTags) ? (f.topicTags as string[]) : [],
          text,
          extraction: (f.extraction === "tsx-text" ? "tsx-text" : "typed") as ChatChunk["extraction"],
          ...(f.industry ? { industry: String(f.industry) as IndustrySlug } : {}),
        },
        score: Number(h._score ?? h.score ?? 0),
      };
    });

    // Rerank scores are 0..1 relevance. Below this the top hit is not really
    // about the question — treat as "not on the site" (the refusal floor).
    const top = retrieved[0]?.score ?? 0;
    return {
      hits: retrieved,
      confidence: top >= 0.12 ? "high" : "low",
      matchedTermRatio: top,
    };
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      console.error("pinecone search failed:", (err as Error).message);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Upsert one batch (≤96 records). Throws on failure — ingest should be loud. */
export async function pineconeUpsert(records: PineconeRecord[]): Promise<void> {
  const key = pineconeKey();
  if (!key) throw new Error("PINECONE_API_KEY is not set");
  if (records.length > UPSERT_BATCH) {
    throw new Error(`batch too large: ${records.length} > ${UPSERT_BATCH}`);
  }
  // Integrated upsert takes NDJSON, one record per line.
  const body = records.map((r) => JSON.stringify(r)).join("\n");
  const res = await fetch(`https://${INDEX_HOST}/records/namespaces/${NAMESPACE}/upsert`, {
    method: "POST",
    headers: {
      "Api-Key": key,
      "Content-Type": "application/x-ndjson",
      "X-Pinecone-API-Version": API_VERSION,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`pinecone upsert ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

export async function pineconeStats(): Promise<{ vectorCount: number } | null> {
  const key = pineconeKey();
  if (!key) return null;
  try {
    const res = await fetch(`https://${INDEX_HOST}/describe_index_stats`, {
      method: "POST",
      headers: {
        "Api-Key": key,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": API_VERSION,
      },
      body: "{}",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      namespaces?: Record<string, { recordCount?: number; vectorCount?: number }>;
      totalVectorCount?: number;
    };
    const ns = data.namespaces?.[NAMESPACE];
    return { vectorCount: ns?.recordCount ?? ns?.vectorCount ?? data.totalVectorCount ?? 0 };
  } catch {
    return null;
  }
}
