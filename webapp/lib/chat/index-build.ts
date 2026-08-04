// Setu chat index builder — Plane 1 extraction (strategy doc §3.1).
// Content-as-data: typed modules are IMPORTED, never scraped. The two TSX-only
// surfaces (static learn pages, industry-page prose) go through a best-effort
// literal harvest and are flagged extraction:"tsx-text" so eval can judge them
// separately. Run via scripts/build-chat-index.mts.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { learnContent } from "../data/learn-content.ts";
import { PLATFORM_SURFACES, PLATFORM_OVERVIEW } from "../data/platform-guide.ts";
import { LIVE_DATA_MAPS } from "../data/data-flow/index.ts";
import { briefings } from "../data/briefings.ts";
import { faqs } from "../data/faqs.ts";
import { TERMS } from "../../components/glossary/glossaryData.ts";
import { part1Sections, part2Sections } from "../data/compliance-checklist.ts";
import {
  INDUSTRY_SLUGS,
  ROUTES,
  type IndustrySlug,
  type Tier,
} from "./site-routing.ts";

export interface ChatChunk {
  id: string;
  url: string;
  title: string;
  tier: Tier;
  industry?: IndustrySlug;
  topicTags: string[];
  section: string;
  text: string;
  extraction: "typed" | "tsx-text";
}

const MAX_CHUNK_CHARS = 2600; // ≈650 tokens
const MIN_CHUNK_CHARS = 120;

// ---------------------------------------------------------------------------
// Generic helpers

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

/** Split markdown by `## ` headings; text before the first heading is "Overview". */
export function splitMarkdownSections(md: string): Array<{ heading: string; body: string }> {
  const out: Array<{ heading: string; body: string }> = [];
  const parts = md.split(/^##\s+/m);
  const intro = parts[0].trim();
  if (intro) out.push({ heading: "Overview", body: intro });
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const body = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    if (body) out.push({ heading, body });
  }
  return out;
}

/** Split an oversized body on paragraph boundaries into ≤ MAX_CHUNK_CHARS pieces. */
function splitLong(body: string): string[] {
  if (body.length <= MAX_CHUNK_CHARS) return [body];
  const paras = body.split(/\n\n+/);
  const pieces: string[] = [];
  let cur = "";
  for (const p of paras) {
    if (cur && cur.length + p.length + 2 > MAX_CHUNK_CHARS) {
      pieces.push(cur);
      cur = p;
    } else {
      cur = cur ? `${cur}\n\n${p}` : p;
    }
  }
  if (cur) pieces.push(cur);
  return pieces;
}

// ---------------------------------------------------------------------------
// TSX literal harvesting (best-effort — flagged "tsx-text")

/** Slice a balanced `const <name> = [ … ]` array literal out of TSX source. */
export function extractBalancedArray(source: string, constName: string): string | null {
  const declIdx = source.indexOf(`const ${constName} = [`);
  if (declIdx === -1) return null;
  const start = source.indexOf("[", declIdx);
  let depth = 0;
  let inStr: string | null = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (ch === "\\") i++;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") inStr = ch;
    else if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") {
      depth--;
      if (depth === 0 && ch === "]") return source.slice(start, i + 1);
    }
  }
  return null;
}

/** Evaluate a pure data-literal (arrays/objects/strings only). Build-time, own repo. */
export function evalDataLiteral(literal: string): unknown {
  try {
    return new Function(`"use strict"; return (${literal});`)();
  } catch {
    return null;
  }
}

const CSSISH = /^[a-z0-9\s\-_:\[\]\/.%#(),>+*!]+$/;

/** Split one very long harvested string on sentence boundaries. */
function splitLongText(s: string): string[] {
  if (s.length <= MAX_CHUNK_CHARS) return [s];
  const sentences = s.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let cur = "";
  for (const sent of sentences) {
    if (cur && cur.length + sent.length + 1 > MAX_CHUNK_CHARS) {
      out.push(cur);
      cur = sent;
    } else {
      cur = cur ? `${cur} ${sent}` : sent;
    }
  }
  if (cur) out.push(cur);
  // Hard wrap anything still oversized (text with no sentence punctuation).
  return out.flatMap((piece) => {
    if (piece.length <= MAX_CHUNK_CHARS) return [piece];
    const hard: string[] = [];
    let rest = piece;
    while (rest.length > MAX_CHUNK_CHARS) {
      const cut = rest.lastIndexOf(" ", MAX_CHUNK_CHARS);
      const at = cut > MAX_CHUNK_CHARS / 2 ? cut : MAX_CHUNK_CHARS;
      hard.push(rest.slice(0, at));
      rest = rest.slice(at).trimStart();
    }
    if (rest) hard.push(rest);
    return hard;
  });
}

/** Harvest prose string literals (sentence-like, ≥60 chars) from TSX source. */
export function extractTsxProse(source: string): string[] {
  const found: string[] = [];
  const re = /"((?:[^"\\\n]|\\.){60,}?)"|`((?:[^`\\]|\\.){60,}?)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const raw = (m[1] ?? m[2] ?? "").replace(/\\n/g, " ").replace(/\\"/g, '"').trim();
    if (raw.length < 60) continue;
    if (CSSISH.test(raw)) continue; // class strings
    if ((raw.match(/ /g)?.length ?? 0) < 8) continue;
    if (!/[.!?…]( |$)/.test(raw)) continue; // must read as sentences
    if (raw.includes("${")) continue;
    found.push(raw);
  }
  return [...new Set(found)];
}

function groupProse(strings: string[]): string[] {
  const groups: string[] = [];
  let cur = "";
  for (const s of strings.flatMap(splitLongText)) {
    if (cur && cur.length + s.length + 2 > MAX_CHUNK_CHARS) {
      groups.push(cur);
      cur = s;
    } else {
      cur = cur ? `${cur}\n\n${s}` : s;
    }
  }
  if (cur) groups.push(cur);
  return groups.filter((g) => g.length >= MIN_CHUNK_CHARS);
}

// ---------------------------------------------------------------------------
// Per-source collectors

function routeMeta(url: string) {
  return ROUTES.find((r) => r.url === url);
}

export function collectLearnChunks(): ChatChunk[] {
  const chunks: ChatChunk[] = [];
  for (const [slug, entry] of Object.entries(learnContent)) {
    const url = `/learn/${slug}`;
    const meta = routeMeta(url);
    const tags = meta?.topicTags ?? [slug];
    chunks.push({
      id: `learn:${slug}:lead`,
      url,
      title: entry.title,
      tier: 1,
      topicTags: tags,
      section: "Summary",
      text: entry.description,
      extraction: "typed",
    });
    for (const sec of splitMarkdownSections(entry.content)) {
      splitLong(sec.body).forEach((piece, i) => {
        chunks.push({
          id: `learn:${slug}:${slugify(sec.heading)}${i ? `:${i}` : ""}`,
          url,
          title: entry.title,
          tier: 1,
          topicTags: tags,
          section: sec.heading,
          text: piece,
          extraction: "typed",
        });
      });
    }
  }
  return chunks;
}

export function collectFaqChunks(): ChatChunk[] {
  return faqs.map((f) => ({
    id: `faq:${f.id}`,
    url: "/faq",
    title: "DPDPA FAQ",
    tier: 1 as Tier,
    topicTags: ["faq", f.category],
    section: f.question,
    text: `Q: ${f.question}\nA: ${f.answer}`,
    extraction: "typed" as const,
  }));
}

export function collectGlossaryChunks(): ChatChunk[] {
  return TERMS.map((t) => ({
    id: `glossary:${t.id}`,
    url: "/glossary",
    title: "DPDPA Glossary",
    tier: 1 as Tier,
    topicTags: ["glossary", t.category, t.term.toLowerCase()],
    section: t.term,
    text: `${t.term} (${t.section}): ${t.definition}`,
    extraction: "typed" as const,
  }));
}

export function collectChecklistChunks(): ChatChunk[] {
  const chunks: ChatChunk[] = [];
  for (const sec of [...part1Sections, ...part2Sections]) {
    const body = sec.items
      .map((it) => `${it.id} ${it.requirement} — ${it.guardrail} (${it.reference})`)
      .join("\n");
    splitLong(body).forEach((piece, i) => {
      chunks.push({
        id: `checklist:${sec.part}-${sec.sectionId}${i ? `:${i}` : ""}`,
        url: "/compliance-checklist",
        title: "DPDPA Compliance Checklist",
        tier: 1,
        topicTags: ["checklist", sec.title.toLowerCase()],
        section: `Part ${sec.part} · ${sec.title}`,
        text: piece,
        extraction: "typed",
      });
    });
  }
  return chunks;
}

export function collectToolChunks(): ChatChunk[] {
  // Rich platform-guide chunks — how Setu explains and navigates the
  // platform itself (Discovery, Flow Maps, Assessment, Notice Generator,
  // Briefings, Blog…). Each surface's guide text is chunked whole; the
  // overview chunk carries the Discover → Map → Assess → Fix spine.
  const chunks: ChatChunk[] = PLATFORM_SURFACES.flatMap((s) => {
    const route = routeMeta(s.url);
    return splitLong(s.guide).map((piece, i) => ({
      id: `tool:${slugify(s.url)}${i ? `:${i}` : ""}`,
      url: s.url,
      title: s.name,
      tier: (route?.tier ?? 3) as Tier,
      topicTags: [...new Set([...s.topicTags, ...(route?.topicTags ?? [])])],
      section: "How to use this",
      text: piece,
      extraction: "typed" as const,
    }));
  });
  chunks.push({
    id: "tool:platform-overview",
    url: PLATFORM_OVERVIEW.url,
    title: PLATFORM_OVERVIEW.title,
    tier: 3,
    topicTags: PLATFORM_OVERVIEW.topicTags,
    section: "Discover → Map → Assess → Fix",
    text: PLATFORM_OVERVIEW.text,
    extraction: "typed",
  });
  return chunks;
}

export function collectRegulatoryContextChunks(appRoot: string): ChatChunk[] {
  const text = readFileSync(join(appRoot, "public", "llms-full.txt"), "utf8").trim();
  return splitLong(text).map((piece, i) => ({
    id: `regctx:${i}`,
    url: "/learn/what-is-dpdpa",
    title: "DPDPA regulatory context",
    tier: 1 as Tier,
    topicTags: ["regulatory context", "overview"],
    section: "Regulatory context",
    text: piece,
    extraction: "typed" as const,
  }));
}

interface PageFaq {
  question: string;
  answer: string;
}

export function collectIndustryChunks(appRoot: string): ChatChunk[] {
  const chunks: ChatChunk[] = [];
  for (const slug of INDUSTRY_SLUGS) {
    const url = `/industries/${slug}`;
    const meta = routeMeta(url)!;
    const source = readFileSync(join(appRoot, "app", "industries", slug, "page.tsx"), "utf8");

    const literal = extractBalancedArray(source, "faqs");
    const pageFaqs = literal ? (evalDataLiteral(literal) as PageFaq[] | null) : null;
    if (pageFaqs) {
      for (const [i, f] of pageFaqs.entries()) {
        if (!f?.question || !f?.answer) continue;
        chunks.push({
          id: `industry:${slug}:faq:${i}`,
          url,
          title: meta.title,
          tier: 2,
          industry: slug,
          topicTags: meta.topicTags,
          section: f.question,
          text: `Q: ${f.question}\nA: ${f.answer}`,
          extraction: "typed",
        });
      }
    }

    const faqSet = new Set((pageFaqs ?? []).flatMap((f) => [f.question, f.answer]));
    const prose = extractTsxProse(source).filter((s) => !faqSet.has(s));
    groupProse(prose).forEach((piece, i) => {
      chunks.push({
        id: `industry:${slug}:guide:${i}`,
        url,
        title: meta.title,
        tier: 2,
        industry: slug,
        topicTags: meta.topicTags,
        section: "Guide notes",
        text: piece,
        extraction: "tsx-text",
      });
    });
  }
  return chunks;
}

const STATIC_LEARN: Array<{ slug: string; url: string; title: string; tags: string[] }> = [
  {
    slug: "dpdp-act-2023",
    url: "/learn/dpdp-act-2023",
    title: "DPDP Act 2023 — full text with summaries",
    tags: ["act text", "sections", "statute"],
  },
  {
    slug: "dpdp-rules-2025-plain-english-guide",
    url: "/learn/dpdp-rules-2025-plain-english-guide",
    title: "DPDP Rules 2025 — plain English",
    tags: ["rules 2025", "schedules", "implementation"],
  },
];

export function collectStaticLearnChunks(appRoot: string): ChatChunk[] {
  const chunks: ChatChunk[] = [];
  for (const page of STATIC_LEARN) {
    const source = readFileSync(join(appRoot, "app", "learn", page.slug, "page.tsx"), "utf8");
    groupProse(extractTsxProse(source)).forEach((piece, i) => {
      chunks.push({
        id: `learn-static:${page.slug}:${i}`,
        url: page.url,
        title: page.title,
        tier: 1,
        topicTags: page.tags,
        section: "Guide notes",
        text: piece,
        extraction: "tsx-text",
      });
    });
  }
  return chunks;
}

/** Data-flow pack digests — Plane 2 pulled into the index (Dilip, 2026-08-03).
 * Generated from the SAME typed packs that render the live maps, at build
 * time, so chat answers and the page can never disagree. */
export function collectDataFlowChunks(): ChatChunk[] {
  const chunks: ChatChunk[] = [];
  for (const map of LIVE_DATA_MAPS) {
    const pack = map.pack!;
    const slug = map.sector.slug as IndustrySlug;
    const url = map.href;
    const title = `${map.sector.navLabel} — Personal Data Flow Map`;
    const stages = [...pack.stages].sort((a, b) => a.sequence - b.sequence);

    const overview = [
      `How personal data flows through a ${map.sector.navLabel} business, stage by stage` +
        (pack.businessModels.length > 1
          ? ` across ${pack.businessModels.length} business models (${pack.businessModels.map((m) => m.label).join(", ")}).`
          : "."),
      ...stages.map((s) => `${s.sequence}. ${s.name} — ${s.summary}`),
    ].join("\n\n");
    splitLong(overview).forEach((piece, i) => {
      chunks.push({
        id: `dataflow:${slug}:stages${i ? `:${i}` : ""}`,
        url,
        title,
        tier: 2,
        industry: slug,
        topicTags: ["data flow", "stages", "journey", slug],
        section: "Journey stages",
        text: piece,
        extraction: "typed",
      });
    });

    const hotspots = [...pack.hotspots]
      .sort((a, b) => a.rank - b.rank)
      .map(
        (h) =>
          `Risk hotspot #${h.rank}: ${h.title}. What happens: ${h.whatHappens} Why it matters: ${h.whyItMatters} Do now: ${h.action}`
      )
      .join("\n\n");
    splitLong(hotspots).forEach((piece, i) => {
      chunks.push({
        id: `dataflow:${slug}:hotspots${i ? `:${i}` : ""}`,
        url,
        title,
        tier: 2,
        industry: slug,
        topicTags: ["data flow", "risk hotspots", "risk", slug],
        section: "Risk hotspots",
        text: piece,
        extraction: "typed",
      });
    });
  }
  return chunks;
}

/** Seed briefings from lib/data/briefings.ts — tier 4, always dated in-text.
 * Live Appwrite briefings are fetched at answer time (briefings-live.ts). */
export function collectBriefingChunks(): ChatChunk[] {
  return briefings.map((b) => ({
    id: `briefing:${b.slug}`,
    url: "/briefings",
    title: "DPDPA Daily Briefings",
    tier: 4 as Tier,
    topicTags: ["briefing", "update", ...b.tags.slice(0, 4)],
    section: `${b.date} — ${b.title}`,
    text: `Briefing dated ${b.date}: ${b.title}\n${b.excerpt}\nWhy it matters: ${b.whyItMatters}\nBusiness impact: ${b.businessImpact}\nActions: ${b.actionChecklist.join("; ")}`.slice(
      0,
      MAX_CHUNK_CHARS
    ),
    extraction: "typed" as const,
  }));
}

// ---------------------------------------------------------------------------

export interface IndexStats {
  total: number;
  bySource: Record<string, number>;
  tsxTextShare: number;
  totalChars: number;
}

export function collectAllChunks(appRoot: string): { chunks: ChatChunk[]; stats: IndexStats } {
  const groups: Record<string, ChatChunk[]> = {
    learn: collectLearnChunks(),
    learnStatic: collectStaticLearnChunks(appRoot),
    faq: collectFaqChunks(),
    glossary: collectGlossaryChunks(),
    checklist: collectChecklistChunks(),
    industry: collectIndustryChunks(appRoot),
    dataFlow: collectDataFlowChunks(),
    briefings: collectBriefingChunks(),
    tools: collectToolChunks(),
    regulatoryContext: collectRegulatoryContextChunks(appRoot),
  };
  const chunks = Object.values(groups).flat();
  const ids = new Set<string>();
  for (const c of chunks) {
    if (ids.has(c.id)) throw new Error(`duplicate chunk id: ${c.id}`);
    ids.add(c.id);
  }
  const tsx = chunks.filter((c) => c.extraction === "tsx-text").length;
  return {
    chunks,
    stats: {
      total: chunks.length,
      bySource: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
      tsxTextShare: Math.round((tsx / chunks.length) * 100) / 100,
      totalChars: chunks.reduce((n, c) => n + c.text.length, 0),
    },
  };
}

/** Guard used by tests and the build script. */
export function assertAppRoot(appRoot: string): void {
  readdirSync(join(appRoot, "app", "industries"));
}
