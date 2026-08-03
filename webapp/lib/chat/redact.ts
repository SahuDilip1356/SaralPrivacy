// PII redaction for chat logs — spec §7 (v2.4).
// Applied before ANYTHING chat-related is persisted server-side: failure-turn
// questions in chat_feedback (D2) and the human-handoff packet (§9.5).
// Redaction is deliberately eager: false positives cost readability in an
// internal log; false negatives put PII in storage.

const PATTERNS: Array<{ label: string; re: RegExp }> = [
  // Order matters: Aadhaar before generic phone (both are digit runs).
  { label: "[email]", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { label: "[aadhaar]", re: /\b\d{4}\s?\d{4}\s?\d{4}\b/g },
  { label: "[pan]", re: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
  { label: "[phone]", re: /\+?\d[\d\s-]{8,}\d/g },
];

export interface RedactionResult {
  text: string;
  redactions: number;
}

export function redact(input: string): RedactionResult {
  let text = input;
  let redactions = 0;
  for (const { label, re } of PATTERNS) {
    text = text.replace(re, () => {
      redactions += 1;
      return label;
    });
  }
  return { text, redactions };
}

/** Convenience for log writers — redacted text only. */
export function redactText(input: string): string {
  return redact(input).text;
}
