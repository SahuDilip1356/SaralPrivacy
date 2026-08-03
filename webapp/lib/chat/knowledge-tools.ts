// Plane 2 — typed knowledge lookups (strategy §3.2). MVP pair:
// glossary terms and checklist controls. Outputs are rendered from typed data
// the model narrates verbatim — it never recalls these from memory.

import { TERMS, type GlossaryTerm } from "../../components/glossary/glossaryData.ts";
import {
  part1Sections,
  part2Sections,
  type ChecklistItem,
  type ChecklistSection,
} from "../data/compliance-checklist.ts";
import { tokenize } from "./retrieve.ts";

export interface GlossaryHit {
  term: string;
  section: string;
  category: string;
  definition: string;
  url: "/glossary";
  learnHref?: string;
}

function toHit(t: GlossaryTerm): GlossaryHit {
  return {
    term: t.term,
    section: t.section,
    category: t.category,
    definition: t.definition,
    url: "/glossary",
    learnHref: t.learnHref,
  };
}

/** Exact-or-close glossary lookup. Returns best match plus near matches. */
export function lookupGlossary(query: string): { best: GlossaryHit | null; related: GlossaryHit[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { best: null, related: [] };

  const exact = TERMS.find((t) => t.term.toLowerCase() === q || t.id === q);
  if (exact) {
    const related = (exact.relatedIds ?? [])
      .map((id) => TERMS.find((t) => t.id === id))
      .filter((t): t is GlossaryTerm => Boolean(t))
      .slice(0, 3)
      .map(toHit);
    return { best: toHit(exact), related };
  }

  const qTokens = new Set(tokenize(q));
  const scored = TERMS.map((t) => {
    const termTokens = tokenize(t.term);
    const overlap = termTokens.filter((tok) => qTokens.has(tok)).length;
    const contains = t.term.toLowerCase().includes(q) || q.includes(t.term.toLowerCase()) ? 1 : 0;
    return { t, score: overlap / Math.max(1, termTokens.length) + contains };
  })
    .filter((x) => x.score > 0.34)
    .sort((a, b) => b.score - a.score);

  return {
    best: scored[0] ? toHit(scored[0].t) : null,
    related: scored.slice(1, 4).map((x) => toHit(x.t)),
  };
}

export interface ChecklistHit {
  id: string;
  part: 1 | 2;
  sectionTitle: string;
  requirement: string;
  guardrail: string;
  reference: string;
  url: "/compliance-checklist";
}

const ALL_SECTIONS: ChecklistSection[] = [...part1Sections, ...part2Sections];

function itemHit(sec: ChecklistSection, it: ChecklistItem): ChecklistHit {
  return {
    id: it.id,
    part: sec.part,
    sectionTitle: sec.title,
    requirement: it.requirement,
    guardrail: it.guardrail,
    reference: it.reference,
    url: "/compliance-checklist",
  };
}

/** Look up checklist controls by exact id ("4.3") or by topic keywords. */
export function lookupChecklist(query: string, limit = 5): ChecklistHit[] {
  const q = query.trim();
  if (!q) return [];

  if (/^\d{1,2}\.\d{1,2}$/.test(q)) {
    for (const sec of ALL_SECTIONS) {
      const item = sec.items.find((it) => it.id === q);
      if (item) return [itemHit(sec, item)];
    }
    return [];
  }

  const qTokens = new Set(tokenize(q));
  if (qTokens.size === 0) return [];
  const scored: Array<{ hit: ChecklistHit; score: number }> = [];
  for (const sec of ALL_SECTIONS) {
    const secTokens = tokenize(sec.title);
    const secOverlap = secTokens.filter((t) => qTokens.has(t)).length;
    for (const it of sec.items) {
      const itemTokens = tokenize(`${it.subsection} ${it.requirement} ${it.guardrail}`);
      const overlap = itemTokens.filter((t) => qTokens.has(t)).length;
      const score = overlap + secOverlap * 0.5;
      if (score > 0) scored.push({ hit: itemHit(sec, it), score });
    }
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.hit);
}
