// Setu chatbot site router — the ONLY source of link targets for the bot.
// Spec: webapp/SetuBinduChatBot/SETU_BINDU_CHATBOT_SPEC.md §3 (v2.4).
//
// Every citation and action URL the model emits must pass isValidCitation();
// the agent never generates a URL, it selects from ROUTES/UTILITY_ROUTES.
// Dead links fail in lib/chat/site-routing.test.ts, which resolves every URL
// against the app/ directory.

export type Tier = 1 | 2 | 3 | 4;

export type IndustrySlug =
  | "ca-firms"
  | "recruitment-agencies"
  | "training-institutes"
  | "d2c-brands"
  | "clinics-diagnostic-labs"
  | "schools-colleges"
  | "law-firms"
  | "real-estate"
  | "hotels-travel"
  | "pharmacies"
  | "fintech-nbfc"
  | "gyms-salons-spas";

export type Intent = "assessment" | "penalty" | "discovery" | "notice" | "whitepaper";

export interface Route {
  url: string; // path only, must exist in app/ (verified by test)
  title: string;
  tier: Tier;
  topicTags: string[];
  industry?: IndustrySlug;
  triggers: string[]; // phrases that route here (router hints, not exhaustive)
  summary: string; // one line shown on Open cards
}

export interface Chip {
  label: string;
  message: string; // seed message sent when the chip is tapped
}

const INDUSTRY_TITLES: Record<IndustrySlug, string> = {
  "ca-firms": "CA Firms",
  "recruitment-agencies": "Recruitment Agencies",
  "training-institutes": "Training Institutes",
  "d2c-brands": "D2C Brands",
  "clinics-diagnostic-labs": "Clinics & Diagnostic Labs",
  "schools-colleges": "Schools & Colleges",
  "law-firms": "Law Firms",
  "real-estate": "Real Estate",
  "hotels-travel": "Hotels & Travel",
  pharmacies: "Pharmacies",
  "fintech-nbfc": "Fintech & NBFCs",
  "gyms-salons-spas": "Gyms, Salons & Spas",
};

export const INDUSTRY_SLUGS = Object.keys(INDUSTRY_TITLES) as IndustrySlug[];

const LEARN_ROUTES: Route[] = [
  {
    url: "/learn",
    title: "DPDPA Learning Hub",
    tier: 1,
    topicTags: ["learning", "hub", "start here"],
    triggers: ["where to start", "learn dpdpa", "guides"],
    summary: "All DPDPA guides in one place — start here.",
  },
  {
    url: "/learn/what-is-dpdpa",
    title: "What is DPDPA?",
    tier: 1,
    topicTags: ["overview", "basics", "scope"],
    triggers: ["what is dpdpa", "explain the law", "dpdp act overview"],
    summary: "The law in plain English — what it is and why it matters.",
  },
  {
    url: "/learn/applicability",
    title: "Who does DPDPA apply to?",
    tier: 1,
    topicTags: ["applicability", "coverage", "exemptions", "threshold"],
    triggers: ["does it apply to me", "am i covered", "are we covered", "small business", "exempt", "paper records"],
    summary: "Check whether the law covers your business.",
  },
  {
    url: "/learn/consent",
    title: "Consent under DPDPA",
    tier: 1,
    topicTags: ["consent", "consent manager", "opt-in", "opt-out"],
    triggers: ["do i need consent", "deemed consent", "marketing consent", "checkbox"],
    summary: "When you need consent and what makes it valid.",
  },
  {
    url: "/learn/notice",
    title: "Notice requirements",
    tier: 1,
    topicTags: ["notice", "privacy notice", "transparency", "purpose"],
    triggers: ["privacy policy", "privacy notice", "draft a notice", "disclosure"],
    summary: "What your privacy notice must say, and when.",
  },
  {
    url: "/learn/rights",
    title: "Data Principal rights",
    tier: 1,
    topicTags: ["rights", "access", "correction", "erasure", "grievance"],
    triggers: ["delete my data", "access request", "erasure", "grievance"],
    summary: "The rights people have over their data — and your duties.",
  },
  {
    url: "/learn/data-breach",
    title: "Data breach obligations",
    tier: 1,
    topicTags: ["breach", "incident", "notification", "security"],
    triggers: ["data breach", "hack", "leak", "incident response"],
    summary: "What to do, and whom to notify, when data leaks.",
  },
  {
    url: "/learn/childrens-data",
    title: "Children's data",
    tier: 1,
    topicTags: ["children", "minors", "parental consent", "profiling"],
    triggers: ["child", "minor", "under-18", "parent consent", "school data"],
    summary: "Extra duties when you process children's data.",
  },
  {
    url: "/learn/retention",
    title: "Retention and erasure",
    tier: 1,
    topicTags: ["retention", "storage limitation", "deletion"],
    triggers: ["how long to keep", "retention period", "old records", "archive"],
    summary: "How long you may keep personal data, and when to erase.",
  },
  {
    url: "/learn/cross-border",
    title: "Cross-border transfers",
    tier: 1,
    topicTags: ["cross-border", "transfer", "international"],
    triggers: ["send data abroad", "foreign server", "transfer outside india"],
    summary: "Rules for moving personal data outside India.",
  },
  {
    url: "/learn/duties",
    title: "Data fiduciary duties",
    tier: 1,
    topicTags: ["duties", "fiduciary", "accountability", "safeguards"],
    triggers: ["data fiduciary", "responsibilities", "obligations", "sdf"],
    summary: "Your obligations as a business that handles personal data.",
  },
  {
    url: "/learn/key-terms",
    title: "Key DPDPA terms",
    tier: 1,
    topicTags: ["definitions", "terminology"],
    triggers: ["data principal", "data fiduciary", "what does processing mean"],
    summary: "The law's core vocabulary, defined simply.",
  },
  {
    url: "/learn/myths",
    title: "Common DPDPA myths",
    tier: 1,
    topicTags: ["myths", "misconceptions"],
    triggers: ["myth", "is it true that", "misconception"],
    summary: "What people get wrong about DPDPA.",
  },
  {
    url: "/learn/dpdp-act-2023",
    title: "DPDP Act 2023 — full text with summaries",
    tier: 1,
    topicTags: ["act text", "sections", "statute"],
    triggers: ["the actual act", "bare text", "section number"],
    summary: "The Act itself, section by section, with plain summaries.",
  },
  {
    url: "/learn/dpdp-rules-2025-plain-english-guide",
    title: "DPDP Rules 2025 — plain English",
    tier: 1,
    topicTags: ["rules 2025", "schedules", "implementation"],
    triggers: ["the 2025 rules", "dpdp rules", "notified rules"],
    summary: "The 2025 Rules decoded for business readers.",
  },
  {
    url: "/faq",
    title: "DPDPA FAQ",
    tier: 1,
    topicTags: ["faq", "questions"],
    triggers: ["frequently asked", "common questions"],
    summary: "Short answers to the most common DPDPA questions.",
  },
  {
    url: "/glossary",
    title: "DPDPA Glossary",
    tier: 1,
    topicTags: ["glossary", "definitions"],
    triggers: ["define", "meaning of", "term"],
    summary: "Every DPDPA term, defined.",
  },
  {
    url: "/compliance-checklist",
    title: "DPDPA Compliance Checklist",
    tier: 1,
    topicTags: ["checklist", "compliance steps"],
    triggers: ["checklist", "compliance steps", "what do i need to do"],
    summary: "A step-by-step compliance checklist for SMBs.",
  },
];

// Sectors with a LIVE data-flow map. Kept static so the client bundle never
// imports the heavy pack registry; the guard test asserts this list matches
// lib/data/data-flow LIVE_DATA_MAPS exactly.
export const DATA_FLOW_SECTORS: IndustrySlug[] = [
  "recruitment-agencies",
  "ca-firms",
  "training-institutes",
  "d2c-brands",
  "clinics-diagnostic-labs",
  "schools-colleges",
  "law-firms",
  "real-estate",
  "hotels-travel",
  "pharmacies",
  "fintech-nbfc",
  "gyms-salons-spas",
];

const INDUSTRY_ROUTES: Route[] = [
  {
    url: "/industries",
    title: "Industry guides",
    tier: 2,
    topicTags: ["industries", "sector"],
    triggers: ["my industry", "sector guide", "industry guide", "sector specific"],
    summary: "DPDPA guidance mapped to 12 Indian industries.",
  },
  ...INDUSTRY_SLUGS.map(
    (slug): Route => ({
      url: `/industries/${slug}`,
      title: `DPDPA for ${INDUSTRY_TITLES[slug]}`,
      tier: 2,
      industry: slug,
      topicTags: ["industry", slug],
      triggers: [INDUSTRY_TITLES[slug].toLowerCase()],
      summary: `What DPDPA means day-to-day for ${INDUSTRY_TITLES[slug]}.`,
    })
  ),
  ...DATA_FLOW_SECTORS.map(
    (slug): Route => ({
      url: `/industries/${slug}/data-flow`,
      title: `${INDUSTRY_TITLES[slug]} — Personal Data Flow Map`,
      tier: 2,
      industry: slug,
      topicTags: ["data flow", "flow map", "hotspots", slug],
      triggers: [`${INDUSTRY_TITLES[slug].toLowerCase()} data flow`],
      summary: `Where personal data travels in a ${INDUSTRY_TITLES[slug]} business — and where the risk concentrates.`,
    })
  ),
];

const TOOL_ROUTES: Route[] = [
  {
    url: "/assessment",
    title: "DPDPA Readiness Assessment",
    tier: 3,
    topicTags: ["readiness", "gap analysis", "score"],
    triggers: ["where do i stand", "assessment", "readiness", "audit myself", "industry assessment", "check my business", "how ready"],
    summary: "A sector-wise self-check of your DPDPA readiness.",
  },
  {
    url: "/penalty-calculator",
    title: "DPDPA Penalty Risk Indicator",
    tier: 3,
    topicTags: ["penalty", "fine", "section 33", "risk"],
    triggers: ["penalty", "fine", "how much fine", "breach cost"],
    summary: "See the statutory penalty framing for your situation.",
  },
  {
    url: "/discovery",
    title: "Personal Data Discovery",
    tier: 3,
    topicTags: ["data map", "ropa", "inventory", "discovery"],
    triggers: ["map my data", "what data do i hold", "ropa", "data inventory", "data discovery", "discovery tool", "discover my data"],
    summary: "Map the personal data your business actually handles.",
  },
  {
    url: "/tools/dpdpa-privacy-notice-generator",
    title: "Privacy Notice Generator",
    tier: 3,
    topicTags: ["notice generator", "privacy notice builder"],
    triggers: ["create a notice", "generate privacy policy", "notice builder", "notice generator"],
    summary: "Build a DPDPA-ready privacy notice step by step.",
  },
  {
    url: "/data-mapping",
    title: "Personal Data Flow Maps",
    tier: 3,
    topicTags: ["data flow", "data map", "journey", "systems"],
    triggers: ["data flow", "where does data travel", "data journey", "flow map", "data mapping", "flow maps"],
    summary: "Visual maps of how personal data moves through a business like yours.",
  },
  {
    url: "/white-paper",
    title: "DPDPA White Paper",
    tier: 3,
    topicTags: ["white paper", "download", "deep dive"],
    triggers: ["download", "deep dive", "share with team", "pdf guide"],
    summary: "The full written guide — download and share with your team.",
  },
];

const FRESHNESS_ROUTES: Route[] = [
  {
    url: "/briefings",
    title: "DPDPA Daily Briefings",
    tier: 4,
    topicTags: ["news", "updates", "enforcement"],
    triggers: ["latest", "news", "what's new", "what changed", "daily briefing", "briefings"],
    summary: "Daily briefings on DPDPA developments.",
  },
  {
    url: "/blog",
    title: "Insights Blog",
    tier: 4,
    topicTags: ["blog", "articles", "insights"],
    triggers: ["article", "blog", "in depth", "insights"],
    summary: "Longer reads on DPDPA in practice.",
  },
];

export const ROUTES: Route[] = [
  ...LEARN_ROUTES,
  ...INDUSTRY_ROUTES,
  ...TOOL_ROUTES,
  ...FRESHNESS_ROUTES,
];

// Linkable for navigation/escalation, but NEVER cited as DPDPA authority.
export const EXCLUDE_FROM_AUTHORITY: string[] = [
  "/about",
  "/contact",
  "/resources",
  "/privacy",
  "/terms",
  "/consent-preferences",
];

// Never linked, never cited, never surfaced — prefix match.
export const NEVER_SURFACE_PREFIXES: string[] = [
  "/admin",
  "/api",
  "/report",
  "/subscribe",
  "/unsubscribe",
  "/assessment/", // quiz steps are noindex; only the /assessment hub is linkable
];

const CITATION_HOST = "https://saralprivacy.com";

function normalizePath(url: string): string | null {
  let path = url.trim();
  if (path.startsWith(CITATION_HOST)) path = path.slice(CITATION_HOST.length);
  if (path === "") path = "/";
  if (!path.startsWith("/")) return null; // other domains / protocols / garbage
  // Citations must be canonical: no query, no hash, no trailing slash.
  if (path.includes("?") || path.includes("#")) return null;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

const LINKABLE_PATHS = new Set<string>([
  ...ROUTES.map((r) => r.url),
  ...EXCLUDE_FROM_AUTHORITY,
]);

/** Prefixes ending in "/" ban only subpaths (the bare hub stays linkable). */
export function isNeverSurfaced(path: string): boolean {
  return NEVER_SURFACE_PREFIXES.some((p) =>
    p.endsWith("/") ? path.startsWith(p) : path === p || path.startsWith(p + "/")
  );
}

/** True when the URL may be emitted by the bot (citation or action). */
export function isValidCitation(url: string): boolean {
  const path = normalizePath(url);
  if (path === null) return false;
  if (isNeverSurfaced(path)) return false;
  return LINKABLE_PATHS.has(path);
}

/** True when the URL may ground a substantive claim (Tier 1 or 2). */
export function isAuthorityCitation(url: string): boolean {
  const path = normalizePath(url);
  if (path === null) return false;
  const route = ROUTES.find((r) => r.url === path);
  return route !== undefined && (route.tier === 1 || route.tier === 2);
}

export function routesForTopic(topic: string): Route[] {
  const needle = topic.trim().toLowerCase();
  if (needle === "") return [];
  return ROUTES.filter(
    (r) =>
      r.topicTags.some((t) => t.includes(needle) || needle.includes(t)) ||
      r.triggers.some((t) => t.includes(needle) || needle.includes(t))
  ).sort((a, b) => a.tier - b.tier);
}

export function routeForIndustry(slug: IndustrySlug): Route {
  return ROUTES.find((r) => r.industry === slug)!;
}

const INTENT_TOOL_URL: Record<Intent, string> = {
  assessment: "/assessment",
  penalty: "/penalty-calculator",
  discovery: "/discovery",
  notice: "/tools/dpdpa-privacy-notice-generator",
  whitepaper: "/white-paper",
};

export function toolForIntent(intent: Intent): Route | null {
  const url = INTENT_TOOL_URL[intent];
  return ROUTES.find((r) => r.url === url) ?? null;
}

// ---------------------------------------------------------------------------
// Quick-reply chips (§2.3) — default set, swapped for contextual sets by page.

export const DEFAULT_CHIPS: Chip[] = [
  { label: "Does DPDPA apply to me?", message: "Does DPDPA apply to my business?" },
  { label: "Consent & notices", message: "Do I need consent, and what must my privacy notice say?" },
  { label: "My industry", message: "What does DPDPA mean for my industry?" },
  { label: "Data breach — what do I do?", message: "We may have a data breach — what should we do?" },
  { label: "Take the readiness assessment", message: "Where does my business stand on DPDPA readiness?" },
];

/** Contextual chips for the current page; falls back to DEFAULT_CHIPS. */
export function chipsForPage(pathname: string): Chip[] {
  const path = normalizePath(pathname) ?? "/";

  const industryMatch = path.match(/^\/industries\/([a-z0-9-]+)$/);
  if (industryMatch && (INDUSTRY_SLUGS as string[]).includes(industryMatch[1])) {
    const slug = industryMatch[1] as IndustrySlug;
    const name = INDUSTRY_TITLES[slug];
    return [
      { label: "What data creates risk here?", message: `What personal data creates DPDPA risk for ${name}?` },
      { label: `Check my ${name.replace(/s$/, "").toLowerCase()}`, message: `How ready is my ${name.toLowerCase()} business for DPDPA?` },
      { label: "How do we handle old records?", message: `How should ${name.toLowerCase()} handle retention of old records under DPDPA?` },
    ];
  }

  if (path.startsWith("/learn/") || path === "/learn") {
    return [
      { label: "How does this apply to my business?", message: "How does this topic apply to my business?" },
      { label: "What should I do first?", message: "What is the first practical step my business should take here?" },
      { label: "Check my readiness", message: "Where does my business stand on DPDPA readiness?" },
    ];
  }

  return DEFAULT_CHIPS;
}
