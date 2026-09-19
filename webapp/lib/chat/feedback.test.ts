// Which question a 👎 is logged against (failure-turn log, D2).
// Run: node --test --experimental-strip-types lib/chat/feedback.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { questionForTurn, type TranscriptTurn } from "./feedback.ts";

const user = (id: string, text: string): TranscriptTurn => ({ id, role: "user", text });
const setu = (id: string): TranscriptTurn => ({ id, role: "setu", text: "answer" });

const transcript = [
  user("u1", "Does DPDPA apply to my clinic?"),
  setu("s1"),
  user("u2", "What is the penalty for a breach?"),
  setu("s2"),
  user("u3", "How do I write a privacy notice?"),
  setu("s3"),
];

test("thumbs-down on an older answer logs THAT answer's question, not the latest", () => {
  assert.equal(questionForTurn(transcript, "s1"), "Does DPDPA apply to my clinic?");
  assert.equal(questionForTurn(transcript, "s2"), "What is the penalty for a breach?");
});

test("the latest answer still gets the latest question", () => {
  assert.equal(questionForTurn(transcript, "s3"), "How do I write a privacy notice?");
});

test("an answer with no user turn before it logs no question, not a later one", () => {
  const t = [setu("s0"), user("u1", "a later question"), setu("s1")];
  assert.equal(questionForTurn(t, "s0"), "");
});

test("a turn missing from the transcript logs no question rather than a wrong one", () => {
  assert.equal(questionForTurn(transcript, "cleared"), "");
  assert.equal(questionForTurn([], "s1"), "");
});
