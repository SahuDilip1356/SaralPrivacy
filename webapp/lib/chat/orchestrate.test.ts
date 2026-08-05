// Orchestrator tests — the deterministic turn brain, on the real index.
// Run: node --test --experimental-strip-types lib/chat/orchestrate.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGroundingBlock,
  buildMeta,
  detectIndustry,
  planTurn,
} from "./orchestrate.ts";
import { createInitialState } from "./journeys.ts";
import { isValidCitation } from "./site-routing.ts";

const state = () => createInitialState("s1", "/");

test("consent question: high confidence, valid citations, consent journey", () => {
  const plan = planTurn("Do I need consent to send marketing emails?", state());
  assert.equal(plan.refuse, false);
  assert.equal(plan.journey, "J4");
  const meta = buildMeta(plan);
  assert.equal(meta.refusal, false);
  assert.ok(meta.citations.length >= 1 && meta.citations.length <= 3);
  for (const c of meta.citations) assert.ok(isValidCitation(c.url), c.url);
  assert.ok(meta.actions.some((a) => a.url === "/learn/consent"));
  assert.equal(meta.animation.state, "pointing");
  assert.ok(meta.disclaimer.includes("not legal advice"));
});

test("off-corpus question refuses without citations, offers FAQ/Learn/Contact", () => {
  const plan = planTurn("best pizza restaurants in tokyo with blockchain payments", state());
  assert.equal(plan.refuse, true);
  const meta = buildMeta(plan);
  assert.equal(meta.refusal, true);
  assert.equal(meta.citations.length, 0);
  assert.deepEqual(
    meta.actions.map((a) => a.url),
    ["/faq", "/learn", "/contact"]
  );
  assert.equal(meta.animation.state, "unsure");
});

test("glossary hit rescues a term question from the BM25 floor", () => {
  const plan = planTurn("consent manager", state());
  assert.equal(plan.refuse, false, "glossary should rescue this");
  assert.ok(plan.glossary.best);
});

test("industry keywords match whole words only (the WhatsApp/ATS trap)", () => {
  // "ats" (applicant tracking system) is a substring of "whatsapp", so
  // substring matching classified every WhatsApp question as recruitment.
  assert.equal(
    detectIndustry("Our pharmacy keeps prescription images from WhatsApp orders", state()),
    "pharmacies"
  );
  assert.equal(
    detectIndustry("We run a Shopify D2C store doing WhatsApp marketing", state()),
    "d2c-brands"
  );
  assert.equal(
    detectIndustry("we send WhatsApp reminders to members at our gym", state()),
    "gyms-salons-spas"
  );
  // A genuine ATS mention must still route to recruitment.
  assert.equal(detectIndustry("our ATS stores candidate CVs", state()), "recruitment-agencies");
});

test("industry detection: state wins, then keywords, then pageUrl", () => {
  const s = state();
  s.industry = "law-firms";
  assert.equal(detectIndustry("we run a pharmacy", s), "law-firms");
  assert.equal(detectIndustry("we run a pharmacy chain", state()), "pharmacies");
  assert.equal(
    detectIndustry("how does this affect us?", state(), "/industries/hotels-travel"),
    "hotels-travel"
  );
  assert.equal(detectIndustry("generic question", state()), undefined);
});

test("industry-aware plan includes the sector guide as an action", () => {
  const plan = planTurn("what should we fix first?", state(), "/industries/ca-firms");
  const meta = buildMeta(plan);
  assert.ok(
    meta.actions.some((a) => a.url === "/industries/ca-firms"),
    JSON.stringify(meta.actions)
  );
});

test("PII in the message sets the warning flag", () => {
  const plan = planTurn("my number is +91 98765 43210, do I need consent?", state());
  assert.equal(plan.piiWarning, true);
  assert.equal(buildMeta(plan).piiWarning, true);
});

test("grounding block carries sources and journey", () => {
  const plan = planTurn("do I need consent for whatsapp marketing?", state());
  const block = buildGroundingBlock(plan);
  assert.match(block, /<retrieved_context>/);
  assert.match(block, /source: https:\/\/saralprivacy\.com\//);
  assert.match(block, /<journey>J4/);
});

test("every meta action and citation is allowlisted", () => {
  for (const q of [
    "where should my school begin with dpdpa?",
    "how long can we keep old client records?",
    "what data does my gym hold?",
  ]) {
    const meta = buildMeta(planTurn(q, state()));
    for (const a of meta.actions) assert.ok(isValidCitation(a.url), `${q} -> ${a.url}`);
    for (const c of meta.citations) assert.ok(isValidCitation(c.url), `${q} -> ${c.url}`);
    assert.ok(meta.suggestedFollowups.length >= 2);
  }
});
