// Turn orchestration — the deterministic brain around the model.
// The model produces TEXT ONLY; everything in ChatMeta (citations, actions,
// confidence, follow-ups) is built HERE from typed data and validated through
// site-routing. A model cannot emit a URL the router doesn't know.

import {
  INDUSTRY_SLUGS,
  ROUTES,
  isValidCitation,
  routeForIndustry,
  toolForIntent,
  type IndustrySlug,
  type Route,
} from "./site-routing.ts";
import { retrieve, type RetrievalResult } from "./retrieve.ts";
import { lookupGlossary, type GlossaryHit } from "./knowledge-tools.ts";
import { detectJourney, journeyById, type ChatSessionState, type JourneyId } from "./journeys.ts";
import { redact } from "./redact.ts";

export interface ChatCitation {
  title: string;
  url: string;
  tier: number;
}

export interface ChatAction {
  type: "open_url";
  label: string;
  url: string;
}

export interface ChatMeta {
  citations: ChatCitation[];
  actions: ChatAction[];
  confidence: "high" | "low";
  refusal: boolean;
  piiWarning: boolean;
  suggestedFollowups: string[];
  journey?: JourneyId;
  industry?: IndustrySlug;
  animation: { state: "pointing" | "unsure" | "speaking" };
  disclaimer: string;
}

const DISCLAIMER = "Educational only — not legal advice.";

// ---------------------------------------------------------------------------

const INDUSTRY_KEYWORDS: Array<{ slug: IndustrySlug; words: string[] }> = [
  { slug: "ca-firms", words: ["ca firm", "chartered accountant", "accounting firm", "tax practice"] },
  { slug: "recruitment-agencies", words: ["recruitment", "staffing", "hiring agency", "candidates", "ats"] },
  { slug: "training-institutes", words: ["training institute", "coaching", "edtech", "institute"] },
  { slug: "d2c-brands", words: ["d2c", "ecommerce", "online store", "shopify", "brand"] },
  { slug: "clinics-diagnostic-labs", words: ["clinic", "diagnostic", "lab", "patient", "hospital"] },
  { slug: "schools-colleges", words: ["school", "college", "student", "university"] },
  { slug: "law-firms", words: ["law firm", "advocate", "legal practice", "lawyer"] },
  { slug: "real-estate", words: ["real estate", "property", "builder", "broker", "rera"] },
  { slug: "hotels-travel", words: ["hotel", "travel", "guest", "resort", "booking"] },
  { slug: "pharmacies", words: ["pharmacy", "chemist", "prescription", "medicine"] },
  { slug: "fintech-nbfc", words: ["fintech", "nbfc", "lending", "loan", "credit"] },
  { slug: "gyms-salons-spas", words: ["gym", "salon", "spa", "fitness", "member"] },
];

export function detectIndustry(
  message: string,
  state: ChatSessionState,
  pageUrl?: string
): IndustrySlug | undefined {
  if (state.industry && (INDUSTRY_SLUGS as string[]).includes(state.industry)) return state.industry;
  const m = ` ${message.toLowerCase()} `;
  for (const { slug, words } of INDUSTRY_KEYWORDS) {
    if (words.some((w) => m.includes(w))) return slug;
  }
  const fromPage = pageUrl?.match(/\/industries\/([a-z0-9-]+)/)?.[1];
  if (fromPage && (INDUSTRY_SLUGS as string[]).includes(fromPage)) return fromPage as IndustrySlug;
  return undefined;
}

// ---------------------------------------------------------------------------

export interface TurnPlan {
  journey?: JourneyId;
  industry?: IndustrySlug;
  retrieval: RetrievalResult;
  glossary: { best: GlossaryHit | null; related: GlossaryHit[] };
  refuse: boolean;
  piiWarning: boolean;
}

/** Pre-model planning: retrieval + tools + the refusal decision. */
export function planTurn(message: string, state: ChatSessionState, pageUrl?: string): TurnPlan {
  const industry = detectIndustry(message, state, pageUrl);
  const journey = detectJourney(message, state.journey);
  const retrieval = retrieve(message, { industry, pageUrl, topK: 6 });
  const glossary = lookupGlossary(message);
  const piiWarning = redact(message).redactions > 0;

  // Spec §4.2: below floor → refuse, no model-memory fill-in. A confident
  // glossary hit rescues term questions the BM25 floor may miss.
  const refuse = retrieval.confidence === "low" && !glossary.best;

  return { journey, industry, retrieval, glossary, refuse, piiWarning };
}

// ---------------------------------------------------------------------------

/** Grounding block injected per turn (spec §5.3). */
export function buildGroundingBlock(plan: TurnPlan): string {
  const chunks = plan.retrieval.hits
    .map(
      (h) =>
        `[chunk — source: https://saralprivacy.com${h.chunk.url} · ${h.chunk.title} · ${h.chunk.section}]\n${h.chunk.text}`
    )
    .join("\n\n");
  const glossaryBlock = plan.glossary.best
    ? `\n<glossary_match>\n${plan.glossary.best.term} (${plan.glossary.best.section}): ${plan.glossary.best.definition}\n</glossary_match>`
    : "";
  const journeyBlock = plan.journey
    ? `\n<journey>${plan.journey} — ${journeyById(plan.journey).name}; destination ${journeyById(plan.journey).completionUrl}</journey>`
    : "";
  const industryBlock = plan.industry
    ? `\n<industry>${plan.industry}</industry>`
    : "";
  return `<retrieved_context>\n${chunks}\n</retrieved_context>${glossaryBlock}${journeyBlock}${industryBlock}`;
}

// ---------------------------------------------------------------------------

function dedupeByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)));
}

export function buildCitations(plan: TurnPlan): ChatCitation[] {
  const fromRetrieval = plan.retrieval.hits.map((h) => ({
    title: h.chunk.title,
    url: h.chunk.url,
    tier: h.chunk.tier as number,
  }));
  const fromGlossary: ChatCitation[] = plan.glossary.best
    ? [{ title: "DPDPA Glossary", url: "/glossary", tier: 1 }]
    : [];
  return dedupeByUrl([...fromGlossary, ...fromRetrieval])
    .filter((c) => isValidCitation(c.url))
    .slice(0, 3);
}

export function buildActions(plan: TurnPlan): ChatAction[] {
  const actions: ChatAction[] = [];
  const push = (route: Route | null, label?: string) => {
    if (route && isValidCitation(route.url)) {
      actions.push({ type: "open_url", label: label ?? route.title, url: route.url });
    }
  };

  if (plan.refuse) {
    push(ROUTES.find((r) => r.url === "/faq") ?? null, "Open the FAQ");
    push(ROUTES.find((r) => r.url === "/learn") ?? null, "Browse the Learning Hub");
    actions.push({ type: "open_url", label: "Contact SaralPrivacy", url: "/contact" });
    return actions;
  }

  // Journey destination first.
  if (plan.journey) {
    const j = journeyById(plan.journey);
    const route = ROUTES.find((r) => r.url === j.completionUrl) ?? null;
    push(route, j.id === "J2" ? "Map my data" : j.id === "J3" ? "Start the readiness check" : undefined);
  }
  // Industry guide when known.
  if (plan.industry) push(routeForIndustry(plan.industry));
  // Top authority citation as an Open card.
  const top = plan.retrieval.hits[0];
  if (top) push(ROUTES.find((r) => r.url === top.chunk.url) ?? null);

  return dedupeByUrl(actions).slice(0, 3);
}

const FOLLOWUP_BY_JOURNEY: Record<JourneyId, string[]> = {
  J1: ["What counts as digital personal data?", "Where should my business begin?"],
  J2: ["What are the biggest risk hotspots for my industry?", "Check my readiness"],
  J3: ["What personal data does my business handle?", "What should I fix first?"],
  J4: ["What must my privacy notice say?", "What makes consent valid?"],
  J5: ["What rights do my customers have?", "Do I need consent for marketing?"],
  J6: ["Show me the key DPDPA terms", "How does this apply to my business?"],
};

export function buildFollowups(plan: TurnPlan): string[] {
  if (plan.refuse) return ["What is DPDPA?", "Does DPDPA apply to me?"];
  if (plan.journey) return FOLLOWUP_BY_JOURNEY[plan.journey];
  const tags = plan.retrieval.hits[0]?.chunk.topicTags ?? [];
  if (tags.includes("consent")) return FOLLOWUP_BY_JOURNEY.J4;
  return ["Does DPDPA apply to me?", "Where should my business begin?"];
}

export function buildMeta(plan: TurnPlan): ChatMeta {
  const refusal = plan.refuse;
  return {
    citations: refusal ? [] : buildCitations(plan),
    actions: buildActions(plan),
    confidence: refusal ? "low" : plan.retrieval.confidence,
    refusal,
    piiWarning: plan.piiWarning,
    suggestedFollowups: buildFollowups(plan),
    journey: plan.journey,
    industry: plan.industry,
    animation: { state: refusal ? "unsure" : "pointing" },
    disclaimer: DISCLAIMER,
  };
}
