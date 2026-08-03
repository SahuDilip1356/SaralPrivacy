// Setu retrieval — Plane 1 backbone (strategy §3.1, spec D6).
// Lexical BM25 over public/chat-index.json with router-aware boosts and a
// confidence floor. Deterministic and offline — no network at query time.
// If the index ships with dense vectors AND the caller supplies a query
// vector, scores are merged (0.55 dense / 0.45 lexical); absent either,
// the lexical path stands alone.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { ChatChunk } from "./index-build.ts";
import type { IndustrySlug } from "./site-routing.ts";

export interface ChatIndex {
  version: number;
  model: string | null;
  chunks: ChatChunk[];
  embeddings: number[][] | null;
}

export interface RetrievedChunk {
  chunk: ChatChunk;
  score: number;
}

export interface RetrievalResult {
  hits: RetrievedChunk[];
  confidence: "high" | "low";
  matchedTermRatio: number;
}

const STOPWORDS = new Set(
  "a an and are as at be by can do does for from has have how i in is it its my of on or our so that the this to under we what when where which who will with you your".split(
    " "
  )
);

/** Light stemmer: folds plural/verb/nominal suffixes so "deletion", "deleted"
 * and "delete" share a stem. Deliberately crude — golden set is the judge. */
export function stem(word: string): string {
  let w = word;
  if (w.length > 5) w = w.replace(/(ation|ations)$/, "ate");
  if (w.length > 5) w = w.replace(/(ion|ions)$/, "");
  if (w.length > 4) w = w.replace(/(ies)$/, "y");
  if (w.length > 4) w = w.replace(/(ing|ed|es)$/, "");
  if (w.length > 3) w = w.replace(/(s)$/, "");
  if (w.length > 3) w = w.replace(/(e|y)$/, "");
  return w;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

// BM25 parameters — standard defaults; floor constants tuned via golden set.
const K1 = 1.5;
const B = 0.75;
export const CONFIDENCE_MIN_RATIO = 0.4; // share of query terms the top hit must cover
export const CONFIDENCE_MIN_SCORE = 3.0; // absolute BM25 floor for the top hit

interface Posting {
  chunkIdx: number;
  tf: number;
}

class Bm25Engine {
  readonly index: ChatIndex;
  private postings = new Map<string, Posting[]>();
  private docLen: number[] = [];
  private avgLen = 0;

  constructor(index: ChatIndex) {
    this.index = index;
    const { chunks } = index;
    for (let i = 0; i < chunks.length; i++) {
      // Field weighting: title + tags count 3×, section 2×, body 1× — a match
      // on what a page IS about must outrank incidental body mentions.
      const head = `${chunks[i].title} ${chunks[i].topicTags.join(" ")}`;
      const terms = tokenize(
        `${head} ${head} ${head} ${chunks[i].section} ${chunks[i].section} ${chunks[i].text}`
      );
      this.docLen[i] = terms.length;
      const tf = new Map<string, number>();
      for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const [term, count] of tf) {
        let list = this.postings.get(term);
        if (!list) this.postings.set(term, (list = []));
        list.push({ chunkIdx: i, tf: count });
      }
    }
    this.avgLen = this.docLen.reduce((a, b) => a + b, 0) / Math.max(1, this.docLen.length);
  }

  /** BM25 scores plus per-chunk matched-term counts for the query. */
  score(queryTerms: string[]): { scores: Float64Array; matched: Uint16Array } {
    const N = this.index.chunks.length;
    const scores = new Float64Array(N);
    const matched = new Uint16Array(N);
    for (const term of new Set(queryTerms)) {
      const list = this.postings.get(term);
      if (!list) continue;
      const idf = Math.log(1 + (N - list.length + 0.5) / (list.length + 0.5));
      for (const { chunkIdx, tf } of list) {
        const norm = tf * (K1 + 1);
        const denom = tf + K1 * (1 - B + (B * this.docLen[chunkIdx]) / this.avgLen);
        scores[chunkIdx] += idf * (norm / denom);
        matched[chunkIdx] += 1;
      }
    }
    return { scores, matched };
  }
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

let cached: { engine: Bm25Engine; path: string } | null = null;

export function loadIndex(indexPath?: string): Bm25Engine {
  const path = indexPath ?? join(process.cwd(), "public", "chat-index.json");
  if (cached && cached.path === path) return cached.engine;
  const index = JSON.parse(readFileSync(path, "utf8")) as ChatIndex;
  const engine = new Bm25Engine(index);
  cached = { engine, path };
  return engine;
}

export interface RetrieveOptions {
  topK?: number;
  industry?: IndustrySlug;
  pageUrl?: string;
  /** Dense query vector (same model as the index). Merged only if index has vectors. */
  queryVector?: number[];
  indexPath?: string;
}

export function retrieve(query: string, opts: RetrieveOptions = {}): RetrievalResult {
  const { topK = 6, industry, pageUrl, queryVector, indexPath } = opts;
  const engine = loadIndex(indexPath);
  const { chunks, embeddings } = engine.index;
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return { hits: [], confidence: "low", matchedTermRatio: 0 };

  const { scores, matched } = engine.score(queryTerms);

  // Optional dense merge — min-max normalise both signals first.
  let final: Float64Array = scores;
  if (queryVector && embeddings) {
    const dense = new Float64Array(chunks.length);
    for (let i = 0; i < chunks.length; i++) dense[i] = cosine(queryVector, embeddings[i]);
    const maxLex = Math.max(...scores, 1e-9);
    final = new Float64Array(chunks.length);
    for (let i = 0; i < chunks.length; i++) {
      final[i] = 0.45 * (scores[i] / maxLex) * 10 + 0.55 * Math.max(0, dense[i]) * 10;
    }
  }

  // Router-aware boosts (multiplicative; never resurrect zero-match chunks).
  const boosted = Array.from(final, (s, i) => {
    if (s === 0) return 0;
    let boost = 1;
    const c = chunks[i];
    if (industry && c.industry === industry) boost *= 1.35;
    if (industry && c.industry && c.industry !== industry) boost *= 0.6;
    if (pageUrl && c.url === pageUrl) boost *= 1.15;
    if (c.tier === 1) boost *= 1.05;
    if (c.extraction === "tsx-text") boost *= 0.92;
    return s * boost;
  });

  const order = boosted
    .map((score, i) => ({ score, i }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const hits: RetrievedChunk[] = order.map(({ score, i }) => ({ chunk: chunks[i], score }));

  const top = order[0];
  const matchedTermRatio = top ? matched[top.i] / new Set(queryTerms).size : 0;
  const confidence: "high" | "low" =
    top && matchedTermRatio >= CONFIDENCE_MIN_RATIO && scores[top.i] >= CONFIDENCE_MIN_SCORE
      ? "high"
      : "low";

  return { hits, confidence, matchedTermRatio };
}
