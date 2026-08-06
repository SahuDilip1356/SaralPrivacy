// Prompt-injection and jailbreak defence for the Setu chat endpoint.
//
// Setu's product claim is that he is structurally incapable of inventing a
// DPDPA answer: he speaks only from <retrieved_context>. That guarantee rests
// entirely on the model being able to tell OUR framing tags from the user's
// words. Everything in this file exists to keep that line intact.
//
// Threat model — three of the four inputs reaching the model are attacker
// controlled: the message body, the client-supplied history, and the
// client-supplied session state (factsConfirmed / pageUrl). Retrieved context
// is ours, EXCEPT the live briefings block, which is generated from external
// news and must therefore be treated as untrusted too.
//
// Layers, in the order a turn passes through them:
//   1. stripInvisible   — kill zero-width / Unicode-tag smuggling
//   2. neutralizeTags   — our tag vocabulary can never appear in user text
//   3. detectInjection  — obvious jailbreak intent refuses BEFORE the model
//   4. wrapUserMessage  — nonce delimiter a forged closing tag cannot match
//   5. scanOutput       — the answer never leaks the instructions back out

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// ---------------------------------------------------------------------------
// 1. Invisible-character smuggling
// ---------------------------------------------------------------------------

// Unicode Tag characters (U+E0000–U+E007F) mirror ASCII and render as nothing.
// A payload written in them is invisible to a human reviewer and to most log
// viewers, but a model reads it as plain text. Zero-width and bidi controls
// are the same trick with wider tool support.
const INVISIBLE_RE =
  /[­​-‏‪-‮⁠-⁤⁪-⁯﻿]|[\u{E0000}-\u{E007F}]/gu;

export function stripInvisible(input: string): string {
  return input.replace(INVISIBLE_RE, "");
}

// ---------------------------------------------------------------------------
// 2. Control-tag neutralisation
// ---------------------------------------------------------------------------

/** The framing vocabulary the model is trained by the system prompt to trust. */
export const CONTROL_TAGS = [
  "user_message",
  "retrieved_context",
  "glossary_match",
  "facts_confirmed",
  "current_page",
  "journey",
  "industry",
  "note",
  "system",
  "instructions",
] as const;

// Any tag-shaped token at all, not just ours: an attacker who invents
// <admin_override> is relying on the same "this looks like framing" effect.
const TAG_LIKE_RE = /<\s*\/?\s*[A-Za-z_][\w:.-]*(\s[^<>]*)?>/g;

/**
 * Render tag-shaped tokens inert by escaping the angle brackets. The model
 * still reads the user's words — it just reads them as literal text rather
 * than as structure. Escaping beats stripping here: deleting the token would
 * silently change what the user asked.
 */
export function neutralizeTags(input: string): string {
  return input.replace(TAG_LIKE_RE, (m) => m.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
}

/** Full cleaning pass for any untrusted free text heading for the model. */
export function sanitizeUntrusted(input: string): string {
  return neutralizeTags(stripInvisible(input));
}

/**
 * Cleaning pass for values placed in a TRUSTED position — <facts_confirmed>,
 * <current_page>. These sit where the prompt treats content as established,
 * so they additionally lose newlines: a value cannot open a new pseudo-block.
 */
export function sanitizeInline(input: string, max = 200): string {
  return sanitizeUntrusted(input).replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

// ---------------------------------------------------------------------------
// 3. Injection-intent detection
// ---------------------------------------------------------------------------

export interface InjectionVerdict {
  blocked: boolean;
  rule?: string;
}

// Deliberately narrow. A false positive refuses a real compliance question,
// which is a worse outcome for this product than a jailbreak attempt that
// still has to get past every other layer. Each pattern targets phrasing that
// has no legitimate reading in a DPDPA help conversation.
const INJECTION_RULES: Array<{ id: string; re: RegExp }> = [
  {
    id: "override-previous",
    re: /\b(ignore|disregard|forget|override|discard)\b[^.?!]{0,40}\b(previous|prior|earlier|above|all|any|your)\b[^.?!]{0,30}\b(instruction|prompt|rule|direction|guideline|constraint|boundary)/i,
  },
  {
    id: "reveal-instructions",
    re: /\b(reveal|show|print|repeat|output|display|reproduce|recite|dump|list|share|tell)\b[^.?!]{0,40}\b(your|the|these|initial|original|full|exact|verbatim)\b[^.?!]{0,20}\b(system\s*prompt|instruction|prompt|directive|ruleset|configuration|guidelines)/i,
  },
  { id: "system-prompt-noun", re: /\b(system|initial|original|hidden)\s+prompt\b/i },
  { id: "persona-override", re: /\byou\s+are\s+(now|no\s+longer)\b/i },
  { id: "mode-override", re: /\b(developer|debug|god|admin|dan|jailbreak|unrestricted|uncensored|sudo)\s+mode\b/i },
  { id: "jailbreak-noun", re: /\bjailbroken?\b/i },
  {
    id: "roleplay-escape",
    re: /\b(pretend|roleplay|role-play|act as|behave as|simulate)\b[^.?!]{0,50}\b(no|not|without|free from|unrestricted|uncensored|unfiltered|no longer)\b/i,
  },
  {
    id: "restriction-bypass",
    re: /\b(bypass|circumvent|get around|turn off|disable|switch off|remove)\b[^.?!]{0,30}\b(restriction|guardrail|filter|safety|rule|limitation|boundary|safeguard)/i,
  },
  {
    id: "ungrounded-answer",
    re: /\banswer\b[^.?!]{0,30}\b(from|using|with)\b[^.?!]{0,20}\b(your\s+own|general|internal|training|pretrain)\b[^.?!]{0,15}\b(knowledge|memory|data)/i,
  },
  {
    id: "new-instructions",
    re: /\b(new|updated|revised|additional)\s+(instruction|rule|system\s*prompt|directive)s?\s*[:\-]/i,
  },
  { id: "from-now-on", re: /\bfrom\s+now\s+on\b[^.?!]{0,40}\b(you|ignore|answer|respond|act)\b/i },
  // A literal framing tag in user input is never innocent — the UI never sends one.
  {
    id: "control-tag-literal",
    re: new RegExp(`<\\s*/?\\s*(${CONTROL_TAGS.join("|")})\\s*[^<>]*>`, "i"),
  },
];

/**
 * Runs on the RAW message, before neutralisation — the point is to catch the
 * attempt, and the attempt is most legible in its original form.
 */
export function detectInjection(message: string): InjectionVerdict {
  const probe = stripInvisible(message);
  for (const { id, re } of INJECTION_RULES) {
    if (re.test(probe)) return { blocked: true, rule: id };
  }
  return { blocked: false };
}

// ---------------------------------------------------------------------------
// 4. Nonce-delimited user block
// ---------------------------------------------------------------------------

/** Fresh per turn, so a delimiter cannot be forged from a previous response. */
export function newNonce(): string {
  return randomBytes(8).toString("hex");
}

/**
 * The closing tag carries an unguessable nonce, so even if neutralisation were
 * somehow evaded the user still cannot close the block early and start writing
 * in the framework's voice.
 */
export function wrapUserMessage(message: string, nonce: string): string {
  return `<user_message id="${nonce}">\n${sanitizeUntrusted(message)}\n</user_message id="${nonce}">`;
}

// ---------------------------------------------------------------------------
// 5. Output-side leak scan
// ---------------------------------------------------------------------------

// Distinctive strings from the system prompt. If any surfaces in an answer,
// the instructions are being read back to the user.
const LEAK_SIGNATURES = [
  "hard boundary",
  "museum guide for this museum",
  "setu pro:",
  "navigation duty",
  "regulatory context (fixed",
  "<retrieved_context>",
  "<facts_confirmed>",
  "<user_message",
  "my system prompt",
  "my instructions are",
];

/** Longest signature — how far the stream must lag to never emit a full one. */
export const LEAK_HOLDBACK = Math.max(...LEAK_SIGNATURES.map((s) => s.length));

export function scanOutput(text: string): { leaked: boolean; rule?: string } {
  const t = text.toLowerCase();
  for (const sig of LEAK_SIGNATURES) {
    if (t.includes(sig)) return { leaked: true, rule: sig };
  }
  return { leaked: false };
}

// ---------------------------------------------------------------------------
// 6. Assistant-turn authenticity
// ---------------------------------------------------------------------------
//
// History arrives from the client, so an attacker can forge an assistant turn
// ("developer mode enabled") and the model reads it as its own prior words —
// far more persuasive than any user instruction. Signing each answer we emit
// lets the next turn tell our transcript from theirs, with no session store.

const SECRET = process.env.CHAT_HISTORY_SECRET ?? "";

export function historySigningAvailable(): boolean {
  return SECRET.length > 0;
}

export function signTurn(text: string): string {
  if (!SECRET) return "";
  return createHmac("sha256", SECRET).update(text).digest("hex").slice(0, 32);
}

export function verifyTurn(text: string, sig: unknown): boolean {
  if (!SECRET || typeof sig !== "string" || sig.length !== 32) return false;
  const expected = Buffer.from(signTurn(text));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
