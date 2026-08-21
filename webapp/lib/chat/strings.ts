// All user-facing widget strings — i18n-ready (decision D1).
// en is complete; hi seeds come verbatim from the Hindi intro film
// (SETU_CHARACTER_CANON.md §4) and grow with the Hindi fast-follow.
// Components must never hardcode copy — always t(locale, key).

export type Locale = "en" | "hi";

const en = {
  launcherLabel: "Ask Setu about DPDPA",
  panelTitle: "Setu",
  panelSubtitle: "Calm bridge-builder · SaralPrivacy guide",
  greeting:
    "Privacy rules can feel complicated. I'm Setu — ask me in plain English and I'll point you to the right SaralPrivacy guide.",
  greetingPrompt: "What's on your mind — consent, employee data, or whether the law applies to you?",
  // Naming the agent in the composer is the cheapest change in the outcome
  // layer and turns a text field into a conversation (§5.3).
  inputPlaceholder: "Ask Setu a question…",
  send: "Send",
  disclaimer: "Educational only — not legal advice.",
  verifiedPage: "Verified page",
  openPage: "Open",
  refusal:
    "I can only help with what's on SaralPrivacy — I don't have that in our guides yet.",
  refusalHint: "Try the FAQ, the Learning Hub, or ask our team directly.",
  // Shown when a turn is blocked as an instruction-override attempt. Stays in
  // Setu's voice on purpose: no accusation, no hint about what tripped it.
  guarded:
    "I stay on DPDPA questions answered from SaralPrivacy's own guides — that's the only way I can be sure of what I tell you.",
  rateLimited: "You've asked a lot — give me a minute and try again.",
  offline: "I've lost connection — check your network and retry.",
  retry: "Retry",
  apiError: "Something went wrong on my side — please try that again.",
  piiWarning:
    "I noticed personal details (like a phone number or ID) in your message. I won't repeat or store them — please avoid sharing personal data here.",
  feedbackAsk: "Did this help?",
  feedbackThanks: "Thank you — noted.",
  thinking: "Looking it up on SaralPrivacy…",
  suggestedLabel: "You could ask next",
  humanHelp: "Talk to a human",
  muteProactive: "Don't ask again",
  proactiveDismiss: "No thanks",

  // ── Outcome lanes (§5.1) ────────────────────────────────────────────────
  laneAssess: "Check my readiness",
  laneHuman: "Talk to a person",
  laneGroupLabel: "What would you like to do?",
  laneAssessAria: "Start the DPDPA readiness assessment",
  laneHumanAria: "Request a callback from a privacy specialist",

  // ── Human handoff (§6.6) ────────────────────────────────────────────────
  handoffOffer: "Would you like a specialist to call you back?",
  handoffYes: "Yes, please",
  handoffNo: "No thanks",
  handoffName: "Your name",
  handoffEmail: "Work email",
  // Legally load-bearing: states purpose, recipient and what is shared, in
  // plain language, at the point of collection. Never pre-ticked.
  handoffConsent:
    "I'd like a SaralPrivacy specialist to contact me about this question. I understand my name, email and a summary of this conversation will be shared with them.",
  handoffSubmit: "Request a callback",
  handoffSending: "Sending…",
  handoffDone:
    "Done. Someone from the team will email you within one business day. In the meantime, the guides below cover most of this.",
  handoffError: "I couldn't send that just now — the contact page will still reach us.",

  // ── Trust chrome (§8) ───────────────────────────────────────────────────
  memoryTitle: "What Setu remembers",
  memoryOpen: "What Setu remembers",
  memoryEmpty: "Nothing yet — we've just started.",
  memoryStorage:
    "This is stored in your browser only, never on our servers. It clears when you clear your browser data.",
  memoryClear: "Forget this session",
  memoryCleared: "Cleared. We can start fresh.",
  footerNote:
    "Setu answers from SaralPrivacy's published guides and can be wrong. Your conversation stays in your browser; we store nothing unless you ask for a callback.",
  footerPrivacy: "Privacy notice",
  footerOff: "Turn Setu off",
} as const;

export type StringKey = keyof typeof en;

// Canonical Hindi from the intro film; remaining keys fall back to en until
// the Hindi fast-follow fills them.
const hi: Partial<Record<StringKey, string>> = {
  panelSubtitle: "शांत पुल-निर्माता · SaralPrivacy गाइड",
  greeting:
    "प्राइवेसी नियम जटिल लग सकते हैं। मैं सेतु हूँ — सरल भाषा में पूछिए, मैं आपको सही SaralPrivacy गाइड तक ले चलूँगा।",
  disclaimer: "केवल शैक्षिक — कानूनी सलाह नहीं।",
};

const LOCALES: Record<Locale, Partial<Record<StringKey, string>>> = { en, hi };

export function t(locale: Locale, key: StringKey): string {
  return LOCALES[locale][key] ?? en[key];
}
