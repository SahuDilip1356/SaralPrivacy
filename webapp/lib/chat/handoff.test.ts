// Handoff packet + input validation (outcome-layer §6.2/§6.3, §11.2).
// Run: node --test --experimental-strip-types lib/chat/handoff.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { buildHandoffPacket, isEscalationReason, validateHandoffInput } from "./handoff.ts";
import { createInitialState, type ChatSessionState } from "./journeys.ts";

function state(over: Partial<ChatSessionState> = {}): ChatSessionState {
  return { ...createInitialState("s1", "/learn/consent"), ...over };
}

test("packet is always stamped consented — the type forbids anything else", () => {
  const p = buildHandoffPacket({
    state: state(),
    pageUrl: "/learn/consent",
    reason: "explicit_ask",
    lastUserMessage: "I want to talk to someone",
  });
  assert.equal(p.consentToContact, true);
});

test("PII in the transcript never reaches the packet", () => {
  const p = buildHandoffPacket({
    state: state({ factsConfirmed: { phone: "9876543210" } }),
    pageUrl: "/learn/consent",
    reason: "explicit_ask",
    lastUserMessage: "Call me on 9876543210, my PAN is ABCDE1234F, email me at a@b.com",
  });

  for (const field of [p.summary, p.unresolvedQuestion]) {
    assert.ok(!field.includes("9876543210"), "phone leaked");
    assert.ok(!field.includes("ABCDE1234F"), "PAN leaked");
    assert.ok(!field.includes("a@b.com"), "email leaked");
  }
  assert.ok(p.unresolvedQuestion.includes("[phone]"));
  assert.ok(p.unresolvedQuestion.includes("[pan]"));
  assert.ok(p.unresolvedQuestion.includes("[email]"));
});

test("Aadhaar in a confirmed fact is redacted out of the summary", () => {
  const p = buildHandoffPacket({
    state: state({ factsConfirmed: { id: "1234 5678 9012" } }),
    pageUrl: "/",
    reason: "journey_stalled",
    lastUserMessage: "help",
  });
  assert.ok(!p.summary.includes("1234 5678 9012"));
  assert.ok(p.summary.includes("[aadhaar]"));
});

test("packet carries the context the contact form used to throw away", () => {
  const p = buildHandoffPacket({
    state: state({
      industry: "pharmacies",
      journey: "J3",
      pagesShown: ["/learn/applicability", "/assessment"],
      messageCount: 4,
    }),
    pageUrl: "/industries/pharmacies",
    reason: "repeat_refusal",
    lastUserMessage: "what about schedule H registers",
  });
  assert.equal(p.industry, "pharmacies");
  assert.equal(p.journey, "J3");
  assert.deepEqual(p.sourcesShown, ["/learn/applicability", "/assessment"]);
  assert.equal(p.reason, "repeat_refusal");
  assert.ok(p.intent.length > 0);
});

test("sourcesShown is capped so one long session cannot bloat a lead", () => {
  const many = Array.from({ length: 30 }, (_, i) => `/learn/p${i}`);
  const p = buildHandoffPacket({
    state: state({ pagesShown: many }),
    pageUrl: "/",
    reason: "explicit_ask",
    lastUserMessage: "hi",
  });
  assert.equal(p.sourcesShown.length, 10);
});

// ── validateHandoffInput ────────────────────────────────────────────────────

test("consent must be literally true — truthy is not enough", () => {
  for (const consent of [false, undefined, null, "true", 1, {}]) {
    const r = validateHandoffInput({ name: "A", email: "a@b.com", consent });
    assert.equal(r.ok, false, `accepted consent=${JSON.stringify(consent)}`);
  }
  assert.equal(validateHandoffInput({ name: "A", email: "a@b.com", consent: true }).ok, true);
});

test("name and email are required and trimmed", () => {
  assert.equal(validateHandoffInput({ name: "   ", email: "a@b.com", consent: true }).ok, false);
  assert.equal(validateHandoffInput({ name: "A", email: "nope", consent: true }).ok, false);

  const r = validateHandoffInput({ name: "  Asha  ", email: "  a@b.com ", consent: true });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.contact.name, "Asha");
    assert.equal(r.contact.email, "a@b.com");
  }
});

test("unusual but real addresses are accepted — a false reject costs a lead", () => {
  for (const email of ["a.b+tag@sub.domain.co.in", "x@y.io", "first.last@a-b.org"]) {
    assert.equal(validateHandoffInput({ name: "A", email, consent: true }).ok, true, email);
  }
});

test("escalation reasons are a closed set", () => {
  assert.ok(isEscalationReason("explicit_ask"));
  assert.ok(isEscalationReason("journey_stalled"));
  assert.ok(!isEscalationReason("because_i_said_so"));
  assert.ok(!isEscalationReason(undefined));
});
