// ─────────────────────────────────────────────────────────────────────────────
// Shapes of the per-locale CONTENT overlays (MULTILINGUAL_SPEC §4.3B, W4).
//
// Type-only module: overlays import these with `import type`, so nothing here
// reaches any bundle. Every overlay is SPARSE — a missing key renders English —
// and keyed by a STABLE identifier, never an array index:
//
//   entity key   the English module's own id (faq id, topic slug, glossary term
//                id, checklist item/section id, sector slug)
//   string lists fields that are plain string arrays (a preview's top gaps, a
//                deck card's pain points) are keyed by their ENGLISH TEXT. An
//                English edit therefore orphans the translation and that line
//                falls back to English — a stale Hindi line can never survive
//                an English rewrite.
//
// Legal-content trust law (spec §6): section/rule citations, ₹ amounts, dates,
// statute names and every numeral are copied byte-identical from English and
// Latin digits only — enforced by scripts/i18n/check-content-overlays.mts.
// ─────────────────────────────────────────────────────────────────────────────

/** A map from an English string to its translation. */
export type TextKeyed = Record<string, string>;

/** lib/data/faqs.ts — keyed by FAQItem.id and faqCategories[].id. */
export interface FaqsOverlay {
  items: Record<string, { question?: string; answer?: string }>;
  categories?: Record<string, string>;
}

/** lib/data/learn-content.ts — keyed by topic slug. `content` is markdown and
 *  must keep the English line structure (checked mechanically). */
export type LearnOverlay = Record<
  string,
  { title?: string; description?: string; content?: string }
>;

/** components/glossary/glossaryData.ts — keyed by GlossaryTerm.id.
 *  The HEADWORD (`term`) is never translated: it is the legal term people
 *  search for, and the A–Z index groups on it (spec §10.6). `localTerm` is the
 *  Hindi equivalent rendered alongside it. `section` is a citation — never
 *  overlaid. */
export interface GlossaryOverlay {
  terms: Record<string, { localTerm?: string; definition?: string }>;
  categories?: Record<string, string>;
}

/** lib/data/compliance-checklist.ts — sections keyed by sectionId ("1"…"15",
 *  "O1"…"O12"), items by item id ("1.1", "O12.3"), status labels by ItemType,
 *  guardrails by their numeric id. `reference` is a citation — never overlaid.
 *  A translated `subsection` keeps its "1.1 " id prefix (the renderer strips
 *  the first token). */
export interface ChecklistOverlay {
  sections?: Record<string, { title?: string }>;
  items: Record<
    string,
    { subsection?: string; requirement?: string; guardrail?: string }
  >;
  statusLabels?: Record<string, { label?: string; meaning?: string }>;
  keyGuardrails?: Record<string, { heading?: string; body?: string }>;
  disclaimer?: string;
}

/** lib/data/hero-verdicts.ts — keyed by assessment slug. `band` is a typed key
 *  (display text comes from the home.band catalog override), never overlaid. */
export type HeroVerdictsOverlay = Record<
  string,
  { chipLabel?: string; riskLine?: string }
>;

/** lib/data/verdict-previews.ts — previews keyed by slug; category labels,
 *  gaps and actions are text-keyed. Scores, pct and band are never overlaid. */
export interface VerdictPreviewsOverlay {
  previews: Record<
    string,
    {
      tab?: string;
      label?: string;
      categories?: TextKeyed;
      topGaps?: TextKeyed;
      firstActions?: TextKeyed;
    }
  >;
  checklist?: TextKeyed;
}

/** Copy of the homepage sector deck (components/home/AudienceCards.tsx), keyed
 *  by industry slug. Card TITLES are not here — they are the sector nav labels
 *  and reuse the nav.items overrides in messages/<locale>.json. The chip reuses
 *  the localized verdict-preview tab (same string by design). */
export type SectorDeckOverlay = Record<
  string,
  { risk?: string; line?: string; painPoints?: TextKeyed }
>;

/** lib/data/resource-templates.ts — keyed by the template's file name. The
 *  translated title is DISPLAY-only: the English title stays the lead
 *  payload's templateName. */
export type ResourceTemplatesOverlay = Record<string, { title?: string; desc?: string }>;
