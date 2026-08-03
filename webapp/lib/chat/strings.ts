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
  inputPlaceholder: "Ask a DPDPA question…",
  send: "Send",
  disclaimer: "Educational only — not legal advice.",
  verifiedPage: "Verified page",
  openPage: "Open",
  refusal:
    "I can only help with what's on SaralPrivacy — I don't have that in our guides yet.",
  refusalHint: "Try the FAQ, the Learning Hub, or ask our team directly.",
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
