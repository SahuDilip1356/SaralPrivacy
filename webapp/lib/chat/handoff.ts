// Human-handoff packet — SETU_BINDU_CHATBOT_SPEC §9.5, realised.
//
// Specced in v2.4 and never built, which left escalation as a dead end: Setu
// detected "I want a person", emitted one /contact card, and discarded the
// industry, journey, confirmed facts and pages it had just spent the
// conversation establishing.
//
// Two rules hold this file up:
//   1. A packet cannot exist without consent. `consentToContact` is typed as
//      the literal `true`, so the type system refuses a packet without it —
//      not a runtime check someone can forget to call.
//   2. Free text is redacted BEFORE assembly, never after. Both fields derive
//      from user turns and may carry a PAN or phone the user typed despite
//      the PII warning.

import { redactText } from "./redact.ts";
import type { EscalationReason } from "./orchestrate.ts";
import type { ChatSessionState } from "./journeys.ts";
import { journeyById } from "./journeys.ts";
import type { IndustrySlug } from "./site-routing.ts";

export interface HandoffPacket {
  summary: string;
  unresolvedQuestion: string;
  intent: string;
  journey?: string;
  industry?: IndustrySlug;
  sourcesShown: string[];
  pageUrl: string;
  reason: EscalationReason;
  /** Literal true — the type forbids a packet without consent. */
  consentToContact: true;
  ts: string;
}

const MAX_FREETEXT = 500;
const MAX_SOURCES = 10;

/**
 * The packet's destination is an HTML email (lib/email-templates.ts
 * consultationAlertTemplate), which interpolates every field raw — labelRow
 * and the issue-summary block both do `${value}` with no escaping.
 *
 * redact() strips PII patterns; it does not touch markup. So without this,
 * anything a caller can put into ChatSessionState arrives as live HTML in an
 * internal alert: factsConfirmed keys and values, and pagesShown, none of
 * which sanitizeState validates beyond "is a string" — it was written to make
 * state safe for the model's context, not for an HTML sink.
 *
 * Escaping here rather than in the template because the template is shared
 * with /api/contact and out of this branch's scope. The template should grow
 * its own escaping too; this closes the path Setu opens.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * pagesShown is machine-populated with site paths, so anything that is not a
 * site path is a caller inventing one. Dropping rather than escaping keeps the
 * lead readable — an admin should see the guides Setu showed, not a mangled
 * payload.
 */
const SITE_PATH_RE = /^\/[A-Za-z0-9\-_/]{0,120}$/;

/** Industry slugs are lowercase-hyphen only; anything else is invented. */
const SITE_SLUG_RE = /^[a-z0-9-]{1,40}$/;

export const ESCALATION_REASONS: readonly EscalationReason[] = [
  "explicit_ask",
  "journey_stalled",
  "repeat_refusal",
  "negative_feedback",
];

export function isEscalationReason(v: unknown): v is EscalationReason {
  return typeof v === "string" && (ESCALATION_REASONS as readonly string[]).includes(v);
}

/**
 * Plain-language description of what the visitor was trying to do, assembled
 * from state rather than asked for. The person picking this up should be able
 * to open the email and know the situation without replaying a transcript.
 */
function summarise(state: ChatSessionState, lastUserMessage: string): string {
  const bits: string[] = [];
  if (state.journey) bits.push(`Working through: ${journeyById(state.journey).name}`);
  if (state.industry) bits.push(`Industry: ${state.industry}`);
  const facts = Object.entries(state.factsConfirmed);
  if (facts.length) {
    bits.push(`Told us: ${facts.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  bits.push(`Turns: ${state.messageCount}`);
  if (lastUserMessage.trim()) bits.push(`Last asked: ${lastUserMessage.trim()}`);
  // Redact first (PII), then escape (markup) — both before the string can
  // reach the email template. Order matters only in that escaping first would
  // let &lt;-encoded text hide a pattern from the redactor.
  return escapeHtml(redactText(bits.join(" · "))).slice(0, MAX_FREETEXT);
}

/**
 * Build the packet server-side from already-sanitised state. Deliberately
 * does NOT accept a client-supplied packet — same discipline as ChatMeta,
 * where letting the untrusted side author the object is the whole class of
 * bug the architecture exists to prevent.
 */
export function buildHandoffPacket(args: {
  state: ChatSessionState;
  pageUrl: string;
  reason: EscalationReason;
  lastUserMessage: string;
  now?: Date;
}): HandoffPacket {
  const { state, pageUrl, reason, lastUserMessage } = args;
  return {
    summary: summarise(state, lastUserMessage),
    unresolvedQuestion: escapeHtml(redactText(lastUserMessage)).slice(0, MAX_FREETEXT),
    intent: state.journey ? journeyById(state.journey).name : "general enquiry",
    journey: state.journey,
    // sanitizeState casts industry to IndustrySlug without checking membership,
    // so treat it as untrusted here rather than trusting the type.
    industry: state.industry && SITE_SLUG_RE.test(state.industry) ? state.industry : undefined,
    sourcesShown: state.pagesShown.filter((p) => SITE_PATH_RE.test(p)).slice(0, MAX_SOURCES),
    pageUrl: pageUrl.slice(0, 200),
    reason,
    consentToContact: true,
    ts: (args.now ?? new Date()).toISOString(),
  };
}

export interface HandoffContact {
  name: string;
  email: string;
}

export type HandoffValidation =
  | { ok: true; contact: HandoffContact }
  | { ok: false; error: string };

// Deliberately permissive: this gates obvious rubbish, not deliverability.
// Rejecting a real address because it has an unusual TLD costs a lead.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Three fields, and consent must be literal `true`. Any more fields and the
 * form becomes the thing people abandon; company and phone are deliberately
 * not collected for what is only a callback request (§6.3, data minimisation).
 */
export function validateHandoffInput(body: {
  name?: unknown;
  email?: unknown;
  consent?: unknown;
}): HandoffValidation {
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";

  if (body.consent !== true) return { ok: false, error: "Consent is required." };
  if (!name) return { ok: false, error: "Please add your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please check the email address." };

  return { ok: true, contact: { name, email } };
}
