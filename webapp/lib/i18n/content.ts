// ─────────────────────────────────────────────────────────────────────────────
// Localized CONTENT accessors (MULTILINGUAL_SPEC §4.3B, W4).
//
// One server-only entry point per English data module. Each accessor returns
// the English module untouched for "en" (same reference, zero cost) and, for
// any other locale, English with that locale's sparse overlay merged over it —
// a field the overlay lacks renders English (graceful degradation, spec G3).
//
// ⛔ Bundle-safety law (spec §4.3): overlays are loaded ONLY here, through the
// per-locale dynamic import() tables below, and only from Server Components.
// Client components (FAQContent, GlossaryClient, ChecklistContent, the home
// sections) receive the already-localized data as props — they must never
// import an overlay, or every locale's copy ships in every client chunk.
//
// Overlay location convention: see lib/i18n/resolve.ts.
// ─────────────────────────────────────────────────────────────────────────────
import "server-only";

import type { FAQItem } from "@/lib/types";
import { faqs as enFaqs, faqCategories as enFaqCategories, homepageFaqIds } from "@/lib/data/faqs";
import { learnContent } from "@/lib/data/learn-content";
import {
  TERMS as enTerms,
  CATEGORIES as enGlossaryCategories,
  type GlossaryTerm,
} from "@/components/glossary/glossaryData";
import { localize, localizeById, localizeText } from "@/lib/i18n/resolve";
import type {
  FaqsOverlay,
  LearnOverlay,
  GlossaryOverlay,
} from "@/lib/i18n/overlay-types";

type Loader<T> = () => Promise<{ default: T }>;

// ── Per-locale overlay tables ────────────────────────────────────────────────
// Adding a language = one line per table. A locale absent from a table renders
// English for that module.
const FAQ_OVERLAYS: Record<string, Loader<FaqsOverlay>> = {
  hi: () => import("@/lib/data/i18n/faqs.hi"),
};
const LEARN_OVERLAYS: Record<string, Loader<LearnOverlay>> = {
  hi: () => import("@/lib/data/i18n/learn-content.hi"),
};
const GLOSSARY_OVERLAYS: Record<string, Loader<GlossaryOverlay>> = {
  hi: () => import("@/components/glossary/i18n/glossaryData.hi"),
};

async function load<T>(
  table: Record<string, Loader<T>>,
  locale: string
): Promise<T | undefined> {
  if (locale === "en") return undefined;
  const loader = table[locale];
  return loader ? (await loader()).default : undefined;
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
export async function getFaqContent(locale: string) {
  const o = await load(FAQ_OVERLAYS, locale);
  const faqs: FAQItem[] = localizeById(enFaqs, locale, o?.items, (f) => f.id);
  const categories = enFaqCategories.map((c) => ({
    ...c,
    label: localizeText(c.label, o?.categories?.[c.id]),
  }));
  return { faqs, categories };
}

/** The homepage FAQ slice (S9), localized and in display order. */
export async function getHomepageFaqContent(locale: string) {
  const { faqs } = await getFaqContent(locale);
  const homepage = homepageFaqIds
    .map((id) => faqs.find((f) => f.id === id))
    .filter((f): f is FAQItem => Boolean(f));
  return { homepageFaqs: homepage, total: faqs.length };
}

// ── Learn topics ─────────────────────────────────────────────────────────────
export async function getLearnTopic(locale: string, slug: string) {
  const en = learnContent[slug];
  if (!en) return undefined;
  const o = await load(LEARN_OVERLAYS, locale);
  return localize(en, locale, o?.[slug]);
}

// ── Glossary ─────────────────────────────────────────────────────────────────
/** A glossary term plus, for non-English locales, the local-language
 *  equivalent shown beside the (always English) headword. */
export type LocalizedGlossaryTerm = GlossaryTerm & { localTerm?: string };

export async function getGlossaryContent(locale: string) {
  const o = await load(GLOSSARY_OVERLAYS, locale);
  const terms: LocalizedGlossaryTerm[] = enTerms.map((t) => {
    const tr = o?.terms[t.id];
    if (!tr) return t;
    return {
      ...t,
      definition: localizeText(t.definition, tr.definition),
      ...(tr.localTerm ? { localTerm: tr.localTerm } : {}),
    };
  });
  const categories = enGlossaryCategories.map((c) => ({
    id: c.id as string,
    label: localizeText(c.label, o?.categories?.[c.id]),
  }));
  return { terms, categories };
}
