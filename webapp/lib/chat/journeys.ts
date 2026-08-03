// Named journeys J1–J6 (spec §3.2) — entry detection + the slot each journey
// minimally needs. The prompt asks ONE missing slot at a time; facts already
// in ChatSessionState.factsConfirmed are never re-asked.

import type { IndustrySlug } from "./site-routing.ts";

export type JourneyId = "J1" | "J2" | "J3" | "J4" | "J5" | "J6";

export interface Journey {
  id: JourneyId;
  name: string;
  entryKeywords: string[]; // lowercase substring match
  slots: string[]; // slot names, asked one at a time when missing
  completionUrl: string; // the destination that completes the journey
}

export const JOURNEYS: Journey[] = [
  {
    id: "J1",
    name: "Does DPDPA apply to me?",
    entryKeywords: ["apply to", "applies to", "am i covered", "applicab", "exempt", "does the law"],
    slots: ["orgType", "handlesDigitalData", "whoseData"],
    completionUrl: "/learn/applicability",
  },
  {
    id: "J2",
    name: "What personal data does my business handle?",
    entryKeywords: ["what data", "data do we", "data map", "ropa", "inventory", "data flow", "where does data"],
    slots: ["industry"],
    completionUrl: "/discovery",
  },
  {
    id: "J3",
    name: "Where should my business begin?",
    entryKeywords: ["where do i start", "where to start", "begin", "readiness", "where do we stand", "assessment"],
    slots: ["industry"],
    completionUrl: "/assessment",
  },
  {
    id: "J4",
    name: "Do I need consent for this?",
    entryKeywords: ["consent", "opt-in", "opt in", "permission to", "checkbox"],
    slots: ["channel", "purpose"],
    completionUrl: "/learn/consent",
  },
  {
    id: "J5",
    name: "Create or improve a privacy notice",
    entryKeywords: ["privacy notice", "privacy policy", "notice generator", "draft a notice"],
    slots: [],
    completionUrl: "/tools/dpdpa-privacy-notice-generator",
  },
  {
    id: "J6",
    name: "What does this term or rule mean?",
    entryKeywords: ["what does", "what is a", "meaning of", "define", "definition of", "term"],
    slots: [],
    completionUrl: "/glossary",
  },
];

export function detectJourney(message: string, current?: JourneyId): JourneyId | undefined {
  const m = message.toLowerCase();
  for (const j of JOURNEYS) {
    if (j.entryKeywords.some((k) => m.includes(k))) return j.id;
  }
  return current; // stay in the active journey when the turn doesn't pivot
}

export function journeyById(id: JourneyId): Journey {
  return JOURNEYS.find((j) => j.id === id)!;
}

export interface ChatSessionState {
  sessionId: string;
  intent?: string;
  userType?: "owner" | "employee" | "consultant" | "individual";
  industry?: IndustrySlug;
  businessNiche?: string;
  journey?: JourneyId;
  journeyStage?: string;
  factsConfirmed: Record<string, string>;
  lastTopic?: string;
  pagesShown: string[];
  entryPageUrl: string;
  messageCount: number;
  consentToContact: boolean;
}

export function createInitialState(sessionId: string, entryPageUrl: string): ChatSessionState {
  return {
    sessionId,
    factsConfirmed: {},
    pagesShown: [],
    entryPageUrl,
    messageCount: 0,
    consentToContact: false,
  };
}

/** Sanitize an untrusted client-supplied state object into a safe shape. */
export function sanitizeState(raw: unknown, sessionId: string, pageUrl: string): ChatSessionState {
  const base = createInitialState(sessionId, pageUrl);
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Record<string, unknown>;
  const str = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const facts: Record<string, string> = {};
  if (s.factsConfirmed && typeof s.factsConfirmed === "object") {
    for (const [k, v] of Object.entries(s.factsConfirmed as Record<string, unknown>).slice(0, 20)) {
      const val = str(v, 200);
      if (val) facts[k.slice(0, 40)] = val;
    }
  }
  return {
    ...base,
    intent: str(s.intent),
    userType: ["owner", "employee", "consultant", "individual"].includes(s.userType as string)
      ? (s.userType as ChatSessionState["userType"])
      : undefined,
    industry: str(s.industry) as ChatSessionState["industry"],
    businessNiche: str(s.businessNiche),
    journey: ["J1", "J2", "J3", "J4", "J5", "J6"].includes(s.journey as string)
      ? (s.journey as JourneyId)
      : undefined,
    journeyStage: str(s.journeyStage),
    factsConfirmed: facts,
    lastTopic: str(s.lastTopic),
    pagesShown: Array.isArray(s.pagesShown)
      ? (s.pagesShown.filter((p) => typeof p === "string") as string[]).slice(0, 30)
      : [],
    messageCount: typeof s.messageCount === "number" ? Math.min(s.messageCount, 500) : 0,
    consentToContact: s.consentToContact === true,
  };
}
