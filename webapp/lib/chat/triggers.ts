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

export interface PageTrigger {
  condition: TriggerCondition;
  message: string;
}

/** §2.4 table — which invitation fits this page, and when it may fire. */
export function triggerForPage(pathname: string): PageTrigger | null {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  if (SUPPRESSED_PREFIXES.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p || path.startsWith(p + "/"))))
    return null;

  if (path === "/") {
    return {
      condition: { kind: "dwell", ms: 35_000 },
      message: "Not sure where to begin? I can point you to the right DPDPA tool.",
    };
  }
  if (/^\/industries\/[a-z0-9-]+$/.test(path)) {
    return {
      condition: { kind: "scroll", percent: 50 },
      message: "Would you like to check what this means for your business?",
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
