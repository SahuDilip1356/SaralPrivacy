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
import { fuseRetrieval, platformTour, retrieve, type RetrievalResult } from "./retrieve.ts";
import { pineconeSearch } from "./pinecone.ts";
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
  /** HMAC over this answer, so the next turn can tell our transcript from a
   *  forged one. Empty when CHAT_HISTORY_SECRET is unset (see guard.ts). */
  sig?: string;
}

export const DISCLAIMER = "Educational only — not legal advice.";

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

/** Whole-word match. Substring matching silently mis-fires — "ats" (applicant
 *  tracking system) matches inside "whatsapp", so every WhatsApp question was
 *  being classified as a recruitment agency until the hybrid eval caught it. */
function mentionsWord(haystack: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(haystack);
}

export function detectIndustry(
  message: string,
  state: ChatSessionState,
  pageUrl?: string
): IndustrySlug | undefined {
  if (state.industry && (INDUSTRY_SLUGS as string[]).includes(state.industry)) return state.industry;
  const m = ` ${message.toLowerCase()} `;
  for (const { slug, words } of INDUSTRY_KEYWORDS) {
    if (words.some((w) => mentionsWord(m, w))) return slug;
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
  routerRoutes: Route[];
  navIntent: boolean;
  escalate: boolean;
  refuse: boolean;
  piiWarning: boolean;
}

/** Router rescue: an exact trigger phrase in the message is navigation-grade
 * evidence even when BM25 scores low (e.g. the single-term "what is dpdpa"). */
function routerRescue(message: string): Route[] {
  const m = message.toLowerCase();
  return ROUTES.filter((r) => r.triggers.some((trig) => m.includes(trig))).sort(
    (a, b) => a.tier - b.tier
  );
}

/** Meta-questions about the platform itself — phrased in words that share no
 * vocabulary with content ("help me navigate", "what can you do"). These must
 * NEVER refuse: they ground on the platform-guide chunks deterministically. */
const NAV_INTENT_RE =
  /\b(navigat(e|ing|ion)|show me around|(how|what) (do|does|can|is) (i|you|this|the)? ?(use|do|work)?,? ?(this|the|your)? ?(site|website|platform|app|tool)s?\b|what can you (do|help)|help me (get started|start|use)|getting started|guide me (through|around)|give me a tour|what is this (site|website|platform))/;

const ESCALATE_RE =
  /\b(talk to (a |an )?(human|person|someone|expert)|speak (to|with) (a |an )?(human|person|someone|expert)|human (help|expert)|privacy expert|need a lawyer|legal opinion|consultation with)\b/;

export interface PlanOptions {
  /** Pre-computed retrieval (Pinecone). When null/absent the lexical index is
   *  used — the automatic fallback if the vector store is down or unset. */
  retrieval?: RetrievalResult | null;
}

/** Pre-model planning: retrieval + tools + the refusal decision. */
export function planTurn(
  message: string,
  state: ChatSessionState,
  pageUrl?: string,
  opts: PlanOptions = {}
): TurnPlan {
  const industry = detectIndustry(message, state, pageUrl);
  const journey = detectJourney(message, state.journey);
  const lower = message.toLowerCase();
  const navIntent = NAV_INTENT_RE.test(lower);
  let retrieval = opts.retrieval ?? retrieve(message, { industry, pageUrl, topK: 6 });
  // Platform meta-questions ground on the platform guide, not lexical overlap.
  if (navIntent && retrieval.confidence === "low") {
    retrieval = platformTour();
  }
  const glossary = lookupGlossary(message);
  const routerRoutes = routerRescue(message);
  const escalate = ESCALATE_RE.test(lower);
  const piiWarning = redact(message).redactions > 0;

  // Spec §4.2: below floor → refuse, no model-memory fill-in. A confident
  // glossary hit or an exact router-trigger match rescues the turn.
  const refuse =
    retrieval.confidence === "low" && !glossary.best && routerRoutes.length === 0 && !escalate;

  return { journey, industry, retrieval, glossary, routerRoutes, navIntent, escalate, refuse, piiWarning };
}

/** Production entry point: Pinecone semantic search + rerank as the primary
 *  retrieval path (D7), with the local lexical index as an automatic fallback
 *  whenever Pinecone is unset, unreachable, or returns nothing. */
export async function planTurnAsync(
  message: string,
  state: ChatSessionState,
  pageUrl?: string
): Promise<TurnPlan & { retrievalSource: "hybrid" | "lexical" }> {
  const industry = detectIndustry(message, state, pageUrl);
  const vector = await pineconeSearch(message, { industry });
  const lexical = retrieve(message, { industry, pageUrl, topK: 8 });
  const fused = vector ? fuseRetrieval(vector, lexical, { industry, pageUrl, topK: 6 }) : null;
  const plan = planTurn(message, state, pageUrl, { retrieval: fused });
  return { ...plan, retrievalSource: vector ? "hybrid" : "lexical" };
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
  const fromRouter = plan.routerRoutes.slice(0, 1).map((r) => ({
    title: r.title,
    url: r.url,
    tier: r.tier as number,
  }));
  const fromRetrieval = plan.retrieval.hits.map((h) => ({
    title: h.chunk.title,
    url: h.chunk.url,
    tier: h.chunk.tier as number,
  }));
  const fromGlossary: ChatCitation[] = plan.glossary.best
    ? [{ title: "DPDPA Glossary", url: "/glossary", tier: 1 }]
    : [];
  return dedupeByUrl([...fromRouter, ...fromGlossary, ...fromRetrieval])
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

  // Platform tour: the journey's first steps as Open cards.
  if (plan.navIntent) {
    push(ROUTES.find((r) => r.url === "/discovery") ?? null, "Start with Data Discovery");
    push(ROUTES.find((r) => r.url === "/data-mapping") ?? null);
    push(ROUTES.find((r) => r.url === "/assessment") ?? null);
    return dedupeByUrl(actions).slice(0, 3);
  }

  // Escalation intent: the human door leads (spec §6 escalation).
  if (plan.escalate) {
    actions.push({ type: "open_url", label: "Talk to a human — Contact SaralPrivacy", url: "/contact" });
  }
  // Exact router-trigger match: that destination is the answer.
  if (plan.routerRoutes[0]) push(plan.routerRoutes[0]);
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
  if (plan.navIntent)
    return ["What tools does SaralPrivacy offer?", "Where should my business begin?", "What does DPDPA mean for my industry?"];
  if (plan.journey) return FOLLOWUP_BY_JOURNEY[plan.journey];
  const tags = plan.retrieval.hits[0]?.chunk.topicTags ?? [];
  if (tags.includes("consent")) return FOLLOWUP_BY_JOURNEY.J4;
  return ["Does DPDPA apply to me?", "Where should my business begin?"];
}

export function buildMeta(plan: TurnPlan): ChatMeta {
  const refusal = plan.refuse;
  const rescued = plan.routerRoutes.length > 0 || plan.glossary.best !== null || plan.escalate;
  return {
    citations: refusal ? [] : buildCitations(plan),
    actions: buildActions(plan),
    confidence: refusal ? "low" : rescued ? "high" : plan.retrieval.confidence,
    refusal,
    piiWarning: plan.piiWarning,
    suggestedFollowups: buildFollowups(plan),
    journey: plan.journey,
    industry: plan.industry,
    animation: { state: refusal ? "unsure" : "pointing" },
    disclaimer: DISCLAIMER,
  };
}
