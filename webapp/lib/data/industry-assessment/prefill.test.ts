// parsePrefill() contract tests (HERO_TAP2_SPEC.md §4).
// Run: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/data/industry-assessment/prefill.test.ts
//
// The seam must accept exactly what the hero writes and degrade to null on
// anything else — a hand-edited URL never throws and never ticks an option
// that isn't in the pack.

import test from "node:test";
import assert from "node:assert/strict";

import { parsePrefill, prefillStillHeld, entrySource } from "./prefill.ts";
import type { IAQuestion } from "./core.ts";

const q = (id: string, type: "single" | "multi", options: string[]): IAQuestion => ({
  id,
  question: id,
  badge: "",
  type,
  cap: 10,
  bucket: "b",
  layer: "exposure",
  options: options.map((o) => ({ id: o, label: o, riskPoints: 1 })),
});

const pack = {
  questions: [
    q("q0", "single", ["small", "large"]),
    q("q1", "multi", ["email", "whatsapp", "not_sure"]),
    q("q2", "single", ["yes", "no"]),
  ],
};

const p = (s: string) => new URLSearchParams(s);

test("multi question → the option as a one-item array", () => {
  assert.deepEqual(parsePrefill(p("pre=q1:whatsapp&src=hero"), pack), { q1: ["whatsapp"] });
});

test("single question → the option id itself", () => {
  assert.deepEqual(parsePrefill(p("pre=q2:no"), pack), { q2: "no" });
});

test("a URL-encoded colon still parses", () => {
  assert.deepEqual(parsePrefill(p("pre=q1%3Awhatsapp"), pack), { q1: ["whatsapp"] });
});

test("anything that doesn't validate degrades to null", () => {
  for (const bad of [
    "",
    "src=hero",
    "pre=",
    "pre=q1",
    "pre=q1:",
    "pre=:whatsapp",
    "pre=q9:whatsapp", // unknown question
    "pre=q1:telegram", // unknown option
    "pre=q2:whatsapp", // option from another question
    "pre=q1:whatsapp:extra",
    "pre=Q1:WHATSAPP", // ids are exact
  ]) {
    assert.equal(parsePrefill(p(bad), pack), null, `"${bad}" should not pre-fill`);
  }
});

test("absent params are safe", () => {
  assert.equal(parsePrefill(null, pack), null);
  assert.equal(parsePrefill(undefined, pack), null);
});

test("prefillStillHeld: the note shows only while the pre-filled option is ticked", () => {
  const pre = { q1: ["whatsapp"] };
  assert.equal(prefillStillHeld(pre, "q1", { q1: ["whatsapp"] }), true);
  assert.equal(prefillStillHeld(pre, "q1", { q1: ["email", "whatsapp"] }), true); // added more
  assert.equal(prefillStillHeld(pre, "q1", { q1: ["email"] }), false); // unticked it
  assert.equal(prefillStillHeld(pre, "q1", { q1: ["not_sure"] }), false); // exclusive cleared it
  assert.equal(prefillStillHeld(pre, "q1", {}), false); // retake
  assert.equal(prefillStillHeld(pre, "q0", { q0: "small" }), false); // other question
  assert.equal(prefillStillHeld(null, "q1", { q1: ["whatsapp"] }), false); // no pre-fill
  assert.equal(prefillStillHeld({ q2: "no" }, "q2", { q2: "no" }), true); // single
  assert.equal(prefillStillHeld({ q2: "no" }, "q2", { q2: "yes" }), false);
});

test("entrySource only ever reports a known value", () => {
  assert.equal(entrySource(p("src=hero")), "hero");
  assert.equal(entrySource(p("src=HERO")), "");
  assert.equal(entrySource(p("src=someone@example.com")), "");
  assert.equal(entrySource(p("")), "");
  assert.equal(entrySource(null), "");
});
