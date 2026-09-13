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
import {
  part1Sections as enPart1,
  part2Sections as enPart2,
  statusLabels as enStatusLabels,
  keyGuardrails as enKeyGuardrails,
  DISCLAIMER as enDisclaimer,
  type ChecklistSection,
} from "@/lib/data/compliance-checklist";
import { HERO_VERDICTS, type HeroVerdict } from "@/lib/data/hero-verdicts";
import {
  VERDICT_PREVIEWS,
  VERDICT_CHECKLIST,
  type VerdictPreview,
} from "@/lib/data/verdict-previews";
import { RESOURCE_TEMPLATES } from "@/lib/data/resource-templates";
import type { ResourceTemplate } from "@/components/ResourceTemplateGate";
import { localize, localizeById, localizeText } from "@/lib/i18n/resolve";
import type {
  FaqsOverlay,
  LearnOverlay,
  GlossaryOverlay,
  ChecklistOverlay,
  HeroVerdictsOverlay,
  VerdictPreviewsOverlay,
  SectorDeckOverlay,
  ResourceTemplatesOverlay,
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
const CHECKLIST_OVERLAYS: Record<string, Loader<ChecklistOverlay>> = {
  hi: () => import("@/lib/data/i18n/compliance-checklist.hi"),
};
const HERO_OVERLAYS: Record<string, Loader<HeroVerdictsOverlay>> = {
  hi: () => import("@/lib/data/i18n/hero-verdicts.hi"),
};
const PREVIEW_OVERLAYS: Record<string, Loader<VerdictPreviewsOverlay>> = {
  hi: () => import("@/lib/data/i18n/verdict-previews.hi"),
};
const DECK_OVERLAYS: Record<string, Loader<SectorDeckOverlay>> = {
  hi: () => import("@/components/home/i18n/AudienceCards.hi"),
};
const RESOURCE_OVERLAYS: Record<string, Loader<ResourceTemplatesOverlay>> = {
  hi: () => import("@/lib/data/i18n/resource-templates.hi"),
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

// ── Compliance checklist ─────────────────────────────────────────────────────
export async function getChecklistContent(locale: string) {
  const o = await load(CHECKLIST_OVERLAYS, locale);
  const section = (s: ChecklistSection): ChecklistSection =>
    o
      ? {
          ...s,
          title: localizeText(s.title, o.sections?.[s.sectionId]?.title),
          items: localizeById(s.items, locale, o.items, (i) => i.id),
        }
      : s;
  return {
    part1Sections: o ? enPart1.map(section) : enPart1,
    part2Sections: o ? enPart2.map(section) : enPart2,
    statusLabels: o
      ? enStatusLabels.map((s) => ({
          ...s,
          label: localizeText(s.label, o.statusLabels?.[s.type]?.label),
          meaning: localizeText(s.meaning, o.statusLabels?.[s.type]?.meaning),
        }))
      : enStatusLabels,
    keyGuardrails: o
      ? enKeyGuardrails.map((g) => ({
          ...g,
          heading: localizeText(g.heading, o.keyGuardrails?.[String(g.id)]?.heading),
          body: localizeText(g.body, o.keyGuardrails?.[String(g.id)]?.body),
        }))
      : enKeyGuardrails,
    disclaimer: localizeText(enDisclaimer, o?.disclaimer),
  };
}

// ── Homepage sector content ──────────────────────────────────────────────────
export async function getHeroVerdicts(locale: string): Promise<HeroVerdict[]> {
  const o = await load(HERO_OVERLAYS, locale);
  return localizeById(HERO_VERDICTS, locale, o, (v) => v.slug);
}

export async function getVerdictPreviews(locale: string): Promise<{
  previews: VerdictPreview[];
  checklist: string[];
}> {
  const o = await load(PREVIEW_OVERLAYS, locale);
  if (!o) return { previews: VERDICT_PREVIEWS, checklist: VERDICT_CHECKLIST };
  const previews = VERDICT_PREVIEWS.map((p) => {
    const tr = o.previews[p.slug];
    if (!tr) return p;
    return {
      ...p,
      tab: localizeText(p.tab, tr.tab),
      label: localizeText(p.label, tr.label),
      categories: p.categories.map((c) => ({
        ...c,
        label: localizeText(c.label, tr.categories?.[c.label]),
      })),
      topGaps: p.topGaps.map((g) => localizeText(g, tr.topGaps?.[g])),
      firstActions: p.firstActions.map((a) => localizeText(a, tr.firstActions?.[a])),
    };
  });
  const checklist = VERDICT_CHECKLIST.map((c) => localizeText(c, o.checklist?.[c]));
  return { previews, checklist };
}

/** Sparse deck-copy overlay for the homepage sector deck, or undefined for
 *  English. The deck's English copy lives in the (client) component itself, so
 *  the merge happens there; only this locale's strings travel, as RSC props. */
export async function getSectorDeckOverlay(
  locale: string
): Promise<SectorDeckOverlay | undefined> {
  return load(DECK_OVERLAYS, locale);
}

// ── /resources templates ─────────────────────────────────────────────────────
/** The five downloadable templates. `title` stays English on every locale —
 *  it is the lead payload's templateName; the localized name travels as
 *  `displayTitle`. */
export async function getResourceTemplates(locale: string): Promise<ResourceTemplate[]> {
  const o = await load(RESOURCE_OVERLAYS, locale);
  if (!o) return RESOURCE_TEMPLATES;
  return RESOURCE_TEMPLATES.map((t) => {
    const tr = o[t.file];
    if (!tr) return t;
    return {
      ...t,
      desc: localizeText(t.desc, tr.desc),
      ...(tr.title ? { displayTitle: tr.title } : {}),
    };
  });
}
