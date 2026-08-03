// Platform guide — what each SaralPrivacy surface IS, for the Setu chatbot.
// The law lives in learn/FAQ/glossary; THIS file is how Setu explains and
// navigates the platform itself ("how do I use Data Discovery?", "what do
// the briefings cover?"). Indexed as first-class chunks by index-build.ts.
//
// Keep claims repo-verifiable (counts come from the actual data modules);
// no dates, no stats we cannot stand behind (content-trust law).

export interface PlatformSurface {
  url: string; // must exist in site-routing ROUTES
  name: string;
  topicTags: string[];
  /** Plain-English guide text — chunked as-is. Write for a visitor who asked
   * "what is this / how do I use it / what do I get". */
  guide: string;
}

export const PLATFORM_SURFACES: PlatformSurface[] = [
  {
    url: "/discovery",
    name: "Personal Data Discovery",
    topicTags: ["discovery", "data map", "inventory", "ropa", "tool guide"],
    guide: `Personal Data Discovery shows you what personal data your business most likely holds — before you audit anything. You pick your business type from 276 niches (from cloud kitchens to CA firms), and it instantly builds a map of the personal data a business like yours typically collects, a risk snapshot, and a RoPA-style data inventory you can download as a CSV. It ends with prioritised actions so you know what to fix first.
How to use it: open Personal Data Discovery, choose your business niche, confirm the data items that apply to you, and read your snapshot. It takes a few minutes, it is free, and you do not need to give an email to see your results.
Where it fits: Discovery is step one of the SaralPrivacy journey — Discover what you hold, then Map how it flows, then Assess your readiness, then Fix the gaps.`,
  },
  {
    url: "/data-mapping",
    name: "Personal Data Flow Maps",
    topicTags: ["data flow", "flow map", "data mapping", "journey", "systems", "tool guide"],
    guide: `Personal Data Flow Maps show how personal data actually travels through a business like yours — stage by stage, from first enquiry to deletion. Each industry map covers the journey stages, the systems data sits in (forms, WhatsApp, CRMs, cloud drives, vendor tools), and flags the red risk hotspots where DPDPA exposure concentrates. Many maps include walkthroughs of what happens when a customer exercises a right, and what an incident looks like. You can switch between business models (for example retail pharmacy versus online pharmacy) and view everything as an accessible table.
How to use it: open the Data Flow hub, pick your industry's map, choose the business model closest to yours, and follow the stages. Free, no sign-up.
Where it fits: Map is step two — after Discovery tells you WHAT you hold, the Flow Map shows WHERE it travels and where it leaks.`,
  },
  {
    url: "/assessment",
    name: "DPDPA Readiness Assessment",
    topicTags: ["readiness", "assessment", "industry assessment", "score", "gap analysis", "tool guide"],
    guide: `The Readiness Assessment tells you where your business stands on DPDPA — with questions written for your industry, not generic ones. There is a dedicated assessment for each of the 12 industries SaralPrivacy covers, from CA firms and clinics to fintech and gyms. You answer a short set of sector-specific questions and get a readiness score, a risk band, and your prioritised gaps.
How to use it: open the Readiness Assessment, pick your industry, and answer honestly — it takes about 3 to 5 minutes, it is free, and no email is needed to start.
Where it fits: Assess is step three — once you know what data you hold and how it flows, the assessment scores how ready you actually are and what to fix first.`,
  },
  {
    url: "/penalty-calculator",
    name: "Penalty Risk Indicator",
    topicTags: ["penalty", "fine", "section 33", "risk band", "tool guide"],
    guide: `The Penalty Risk Indicator helps you understand how DPDPA penalties are framed — without pretending to predict a fine. It walks you through the six statutory factors the law lists under Section 33(2) (such as the nature and duration of a breach and the type of data affected), and gives you an indicative risk band: Low, Moderate, High or Severe.
How to use it: select the breach category closest to your concern, rate each factor, read your band. Free, educational, and deliberately not a fine calculator — nobody can honestly predict a specific penalty amount.
Where it fits: use it when a "how much could this cost us?" question comes up — it turns fear into a structured, statute-based view.`,
  },
  {
    url: "/tools/dpdpa-privacy-notice-generator",
    name: "Privacy Notice Generator",
    topicTags: ["notice generator", "privacy notice builder", "privacy policy", "tool guide"],
    guide: `The Privacy Notice Generator builds a DPDPA-ready privacy notice for your business, step by step. An 8-step wizard asks what data you collect, why, where you collect it, whom you share it with, and how people can reach you to exercise their rights — then produces a branded, downloadable notice document.
How to use it: open the Notice Generator and answer the wizard one step at a time. It explains each question in plain English as you go; nothing is written without your input.
Where it fits: this is a Fix-stage tool — once Discovery and the Assessment show you need a proper notice, this is where you create one.`,
  },
  {
    url: "/compliance-checklist",
    name: "DPDPA Compliance Checklist",
    topicTags: ["checklist", "controls", "compliance steps", "tool guide"],
    guide: `The Compliance Checklist is the full to-do list: 96 concrete controls across two parts — statutory and rule-based requirements first, then the operational evidence and governance that proves you actually did the work. Every control carries a plain requirement, a practical guardrail, and its statutory reference.
How to use it: work through it section by section and track your status per control. Pair it with your assessment results to prioritise.
Where it fits: it is the Fix-stage backbone — the assessment tells you which gaps matter most; the checklist is how you close them.`,
  },
  {
    url: "/white-paper",
    name: "DPDPA White Paper",
    topicTags: ["white paper", "download", "deep dive", "share", "tool guide"],
    guide: `The White Paper is the full written deep-dive on DPDPA for Indian businesses, updated for the DPDP Rules 2025 — the thing to download and share when your partner, boss or team asks "so what do we actually have to do?". Free to download.
Where it fits: use it to bring other people in your organisation up to speed after you have run Discovery or the Assessment yourself.`,
  },
  {
    url: "/briefings",
    name: "DPDPA Daily Briefings",
    topicTags: ["briefings", "daily briefing", "news", "updates", "enforcement", "tool guide"],
    guide: `The Daily Briefings track what is changing around DPDPA — enforcement signals, rule developments, and sector-specific implications — in short, dated briefs written for business readers, not lawyers. When something moves, the briefing tells you what changed and what it practically means.
How to use it: open Briefings for the latest, or search past briefs by sector. For settled law, prefer the Learn guides; briefings are for what is new.
Where it fits: this is how you stay current after you have done the groundwork — the law's foundations live in the Learn guides, the movement lives here.`,
  },
  {
    url: "/blog",
    name: "Insights Blog",
    topicTags: ["blog", "articles", "insights", "tool guide"],
    guide: `The Insights Blog carries longer implementation articles — deeper dives into how DPDPA plays out in practice for Indian businesses, with worked examples and practical detail that would not fit a briefing.
Where it fits: read the blog when you want depth on a topic; read the briefings when you want to know what changed this week.`,
  },
  {
    url: "/industries",
    name: "Industry guides",
    topicTags: ["industry guide", "sector guide", "tool guide"],
    guide: `The Industry guides translate DPDPA into your sector's daily reality — 12 guides covering recruitment agencies, CA firms, training institutes, D2C brands, clinics and labs, schools and colleges, law firms, real estate, hotels and travel, pharmacies, fintech and NBFCs, and gyms, salons and spas. Each guide covers the sector's risk areas, a compliance checklist, and the questions that sector actually asks.
Where it fits: start here when you want everything filtered through your industry's lens; each guide links onward to its data flow map and its readiness assessment.`,
  },
];

/** One overview chunk explaining how the platform fits together. */
export const PLATFORM_OVERVIEW = {
  url: "/discovery", // "start here" — the first step of the journey
  title: "How SaralPrivacy fits together",
  topicTags: ["platform", "tools", "where to start", "journey", "tool guide"],
  text: `SaralPrivacy is a set of free, plain-English tools that take an Indian business from confusion to a DPDPA action plan, in four steps: Discover, Map, Assess, Fix.
1. Discover — Personal Data Discovery shows what personal data a business like yours holds (276 business niches, instant snapshot, downloadable inventory).
2. Map — the Personal Data Flow Maps show where that data travels, system by system, and flag the risk hotspots for your industry.
3. Assess — the industry Readiness Assessment scores where you stand and lists your prioritised gaps (12 industries, 3–5 minutes, free).
4. Fix — the Privacy Notice Generator, the 96-control Compliance Checklist and the Learn guides help you close those gaps; the Penalty Risk Indicator gives statutory framing when the cost question comes up.
Around all of this: 12 industry guides tailor everything to your sector, the Daily Briefings keep you current on changes, the Insights Blog goes deeper, and the White Paper is the download to share with your team. Everything is free and nothing requires an email to start.`,
};
