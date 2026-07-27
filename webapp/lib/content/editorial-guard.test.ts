// Run: node --test --experimental-strip-types lib/content/editorial-guard.test.ts
//
// Fixtures are the ACTUAL strings that leaked to production on two live blog
// posts (verified against prod HTML, 2026-07-27), plus the copy that must NOT
// trip the guard. If a future pattern change breaks one of these, it either
// re-opens the leak or starts stripping legitimate advice.
import test from "node:test";
import assert from "node:assert/strict";

import { hasEditorialNote, countEditorialNotes, isVerifiable } from "./editorial-guard.ts";

// Real leaks — dpdpa-compliance-for-smes-practical-guide-key-obligations
const SME_LEAKS = [
  "this claim as written is outdated and must be corrected",
  "editors should verify the exact wording against the enrolled Act",
  "editors should confirm the notification date",
];

// Real leaks — dpdpa-terminology-data-principal-fiduciary-guide.
// The first two are in BODY PROSE, not primary_sources, which is why the guard
// has to run over section text and not just citations.
const TERM_LEAKS = [
  "readers should verify the precise section number against the official enrolled Act as published in the Gazette of India",
  "Readers should verify the precise sub-section numbers for these definitions against the enrolled Act text",
  "Verify whether cross-border transfer restriction categories appear in notified Rules vs. earlier drafts only",
  "official Gazette notification to be cited; reviewer notes this claim appears unsupported",
];

// Must NOT be flagged. The first is real advice copy from the CMP article that
// a naive /verify/i pattern would wrongly strip.
const LEGITIMATE = [
  "verify that the vendor is registered with the Data Protection Board",
  "Section 12 of the DPDPA grants a right to correction and erasure.",
  "Businesses should verify consent records annually.",
  "The Gazette of India published the DPDP Rules, 2025.",
];

test("flags every editorial note that reached production", () => {
  for (const text of [...SME_LEAKS, ...TERM_LEAKS]) {
    assert.equal(hasEditorialNote(text), true, `should flag: ${text.slice(0, 60)}`);
  }
});

test("does not flag legitimate advice or ordinary prose", () => {
  for (const text of LEGITIMATE) {
    assert.equal(hasEditorialNote(text), false, `should NOT flag: ${text.slice(0, 60)}`);
  }
});

test("handles empty and missing text", () => {
  assert.equal(hasEditorialNote(""), false);
  assert.equal(hasEditorialNote(null), false);
  assert.equal(hasEditorialNote(undefined), false);
});

test("counts notes across mixed surfaces", () => {
  assert.equal(countEditorialNotes([...LEGITIMATE, ...TERM_LEAKS]), TERM_LEAKS.length);
  assert.equal(countEditorialNotes(LEGITIMATE), 0);
  assert.equal(countEditorialNotes([]), 0);
});

test("a high score alone does not earn the Verified badge", () => {
  // The exact production defect: score 100, but the sources say "must be corrected".
  assert.equal(isVerifiable(100, SME_LEAKS), false);
  assert.equal(isVerifiable(100, TERM_LEAKS), false);
});

test("clean article with a passing score is verifiable", () => {
  assert.equal(isVerifiable(80, LEGITIMATE), true);
});

test("a clean article below the score threshold is still not verified", () => {
  assert.equal(isVerifiable(74, LEGITIMATE), false);
  assert.equal(isVerifiable(0, LEGITIMATE), false);
  assert.equal(isVerifiable(null, LEGITIMATE), false);
  assert.equal(isVerifiable(undefined, LEGITIMATE), false);
});

test("one leaked note anywhere is enough to withhold the badge", () => {
  assert.equal(isVerifiable(100, [...LEGITIMATE, TERM_LEAKS[0]]), false);
});
