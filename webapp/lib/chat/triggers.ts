// Proactive trigger policy (spec §2.4) — pure, testable logic.
// The client component owns timers/scroll listeners; every decision about
// WHETHER and WHAT lives here. Hard rules: never auto-open, max one prompt
// per session, ~7-day suppression after dismissal, permanent mute, never on
// consent/rights surfaces, never inside a tool flow.

export interface ProactiveStore {
  dismissedUntil?: number; // epoch ms
  muted: boolean;
  shownThisSession: boolean;
}

export const DISMISS_SUPPRESSION_MS = 7 * 24 * 60 * 60 * 1000; // ~7 days

// Proactive prompts are fully suppressed here (launcher itself stays).
const SUPPRESSED_PREFIXES = [
  "/privacy",
  "/terms",
  "/consent-preferences",
  "/rights",
  "/subscribe",
  "/unsubscribe",
  "/contact",
  "/assessment/", // active quiz — never interrupt (hub itself is fine)
  "/tools/", // notice generator mid-flow
];

export type TriggerCondition =
  | { kind: "dwell"; ms: number }
  | { kind: "scroll"; percent: number };

/**
 * A qualification opener (outcome-layer §7.2). Adapted from the AI-SDR
 * pattern, with one change that matters: the question has to be genuinely
 * useful to answer, not merely revealing. Each reply fills a journey slot the
 * system prompt then never re-asks.
 */
export interface OpenerChip {
  label: string;
  /** Slot written into ChatSessionState.factsConfirmed. */
  slot: string;
  value: string;
  /** Message sent on the user's behalf so the answer enters the normal loop. */
  message: string;
}

export interface PageTrigger {
  condition: TriggerCondition;
  message: string;
  chips?: OpenerChip[];
}

/**
 * Authored per sector — never generated, same rule spec §2.3 already applies
 * to chips. Each line names the sector's single biggest exposure, taken from
 * the ranked hotspots in that sector's data-flow pack, so the opener is
 * anchored to indexed content rather than to a guess.
 */
const SECTOR_OPENERS: Record<string, string> = {
  "ca-firms":
    "Client financial records are the biggest DPDPA exposure for most CA firms. Want to see where yours sit?",
  "recruitment-agencies":
    "Candidate CVs sitting in an ATS long after a role closes is the usual DPDPA gap for recruiters. Shall I show you what to check?",
  "training-institutes":
    "Student enrolment data is where most training institutes carry DPDPA risk. Want to see what applies to yours?",
  "d2c-brands":
    "Marketing consent and old order data are where D2C brands usually trip on DPDPA. Want me to walk you through it?",
  "clinics-diagnostic-labs":
    "Patient records carry the heaviest DPDPA obligations of any data a clinic holds. Want to see which ones apply to you?",
  "schools-colleges":
    "Children's data has stricter DPDPA rules than most schools expect. Shall I show you what changes?",
  "law-firms":
    "Client matter files are the DPDPA pressure point for law firms. Want to see how retention should work?",
  "real-estate":
    "Buyer and tenant KYC data is where real-estate businesses usually carry DPDPA risk. Want me to explain?",
  "hotels-travel":
    "Guest ID scans kept after checkout are the classic DPDPA problem in hospitality. Shall I show you what to do instead?",
  pharmacies:
    "Prescription records are the biggest DPDPA exposure most pharmacies have. Want to see where yours sit?",
  "fintech-nbfc":
    "Borrower KYC and credit data put fintechs and NBFCs among the most exposed under DPDPA. Want to see why?",
  "gyms-salons-spas":
    "Member contact lists used for marketing are where gyms and salons usually need DPDPA consent. Want me to explain?",
};

/**
 * The homepage qualification question (§7.2). Answering it is useful in its
 * own right, which is what separates this from a sales bot's opener.
 */
const HOME_OPENER_CHIPS: OpenerChip[] = [
  {
    label: "A privacy notice",
    slot: "hasNotice",
    value: "yes",
    message: "We already have a privacy notice. What should we do next for DPDPA?",
  },
  {
    label: "A data inventory",
    slot: "hasInventory",
    value: "yes",
    message: "We already have a data inventory. What should we do next for DPDPA?",
  },
  {
    label: "Neither yet",
    slot: "hasNotice",
    value: "no",
    message: "We have neither a privacy notice nor a data inventory. Where should we begin?",
  },
];

/** §2.4 table — which invitation fits this page, and when it may fire. */
export function triggerForPage(pathname: string): PageTrigger | null {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  if (SUPPRESSED_PREFIXES.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p || path.startsWith(p + "/"))))
    return null;

  if (path === "/") {
    return {
      condition: { kind: "dwell", ms: 35_000 },
      message: "Which of these does your business already have?",
      chips: HOME_OPENER_CHIPS,
    };
  }
  const sector = path.match(/^\/industries\/([a-z0-9-]+)$/)?.[1];
  if (sector) {
    return {
      condition: { kind: "scroll", percent: 50 },
      message:
        SECTOR_OPENERS[sector] ?? "Would you like to check what this means for your business?",
    };
  }
  if (path.startsWith("/learn/") || path === "/learn") {
    return {
      condition: { kind: "scroll", percent: 60 },
      message: "Want me to explain how this applies to your business?",
    };
  }
  if (path === "/faq" || path === "/glossary") {
    return {
      condition: { kind: "dwell", ms: 45_000 },
      message: "Couldn't find the exact answer? Ask me in plain English.",
    };
  }
  if (path.startsWith("/briefings") || path.startsWith("/blog")) {
    return {
      condition: { kind: "scroll", percent: 80 },
      message: "Would you like the practical business implication of this update?",
    };
  }
  return null;
}

/** Frequency-cap gate — checked before arming any timer/listener. */
export function canShowProactive(store: ProactiveStore, now: number): boolean {
  if (store.muted) return false;
  if (store.shownThisSession) return false;
  if (store.dismissedUntil !== undefined && now < store.dismissedUntil) return false;
  return true;
}

export function afterShown(store: ProactiveStore): ProactiveStore {
  return { ...store, shownThisSession: true };
}

export function afterDismissed(store: ProactiveStore, now: number, mute: boolean): ProactiveStore {
  return {
    ...store,
    shownThisSession: true,
    muted: store.muted || mute,
    dismissedUntil: now + DISMISS_SUPPRESSION_MS,
  };
}
