// Escalation triggers + offer discipline (outcome-layer §6.1, §11.2).
// Run: node --test --experimental-strip-types lib/chat/escalation.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { planTurn, buildMeta } from "./orchestrate.ts";
import { createInitialState, type ChatSessionState } from "./journeys.ts";

function state(over: Partial<ChatSessionState> = {}): ChatSessionState {
  return { ...createInitialState("s1", "/"), ...over };
}

const OFF_CORPUS = "zzqq wibble frobnicate quux";

test("asking for a person opens the door on the first turn", () => {
  const plan = planTurn("I want to talk to a human", state(), "/");
  assert.equal(plan.escalationReason, "explicit_ask");
  assert.equal(buildMeta(plan).escalation?.reason, "explicit_ask");
});

test("one refusal is not enough — two in a row is", () => {
  const first = planTurn(OFF_CORPUS, state(), "/");
  assert.equal(first.refuse, true);
  assert.equal(first.escalationReason, undefined, "offered too early");

  const second = planTurn(OFF_CORPUS, state({ consecutiveRefusals: 1 }), "/");
  assert.equal(second.refuse, true);
  assert.equal(second.escalationReason, "repeat_refusal");
});

test("a journey stalls only while a slot is still missing", () => {
  // J3 needs `industry`. Stalled a turn, still unfilled → offer.
  const stalled = planTurn("where do i start", state({ stalledSlotTurns: 1 }), "/");
  assert.equal(stalled.journey, "J3");
  assert.equal(stalled.escalationReason, "journey_stalled");

  // Same stall count, slot now confirmed → no offer, Setu just carries on.
  const filled = planTurn(
    "where do i start",
    state({ stalledSlotTurns: 1, factsConfirmed: { industry: "pharmacies" } }),
    "/"
  );
  assert.equal(filled.escalationReason, undefined);
});

test("once offered, never offered again — Setu asks for a person exactly once", () => {
  const plan = planTurn("I want to talk to a human", state({ handoffOffered: true }), "/");
  assert.equal(plan.escalationReason, undefined);
  assert.equal(buildMeta(plan).escalation, undefined);

  // ...and the suppression covers every other trigger too.
  const refused = planTurn(
    OFF_CORPUS,
    state({ handoffOffered: true, consecutiveRefusals: 3 }),
    "/"
  );
  assert.equal(refused.escalationReason, undefined);
});

test("an ordinary answered turn never offers a human", () => {
  const plan = planTurn("what is dpdpa", state(), "/");
  assert.equal(plan.refuse, false);
  assert.equal(plan.escalationReason, undefined);
  assert.equal(buildMeta(plan).escalation, undefined);
});

test("escalation is absent from meta rather than false — the field is optional", () => {
  const meta = buildMeta(planTurn("what is dpdpa", state(), "/"));
  assert.ok(!("escalation" in meta) || meta.escalation === undefined);
});

test("adding lanes and openers did not rescue a below-floor turn", () => {
  // The refusal floor is not a tunable (§2.4). This is the regression guard.
  const plan = planTurn(OFF_CORPUS, state(), "/");
  assert.equal(plan.refuse, true);
  assert.equal(buildMeta(plan).refusal, true);
  assert.deepEqual(buildMeta(plan).citations, []);
});
