// Run: node --test --experimental-strip-types lib/chat/knowledge-tools.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { lookupGlossary, lookupChecklist } from "./knowledge-tools.ts";

test("exact glossary term resolves with section reference", () => {
  const { best } = lookupGlossary("Data Fiduciary");
  assert.ok(best);
  assert.equal(best.term.toLowerCase(), "data fiduciary");
  assert.ok(best.section.length > 0);
  assert.equal(best.url, "/glossary");
});

test("fuzzy glossary query still finds the term", () => {
  const { best } = lookupGlossary("what is a consent manager");
  assert.ok(best, "no glossary hit");
  assert.match(best.term.toLowerCase(), /consent/);
});

test("unknown glossary term returns null best", () => {
  const { best } = lookupGlossary("blockchain oracle");
  assert.equal(best, null);
});

test("checklist lookup by exact id", () => {
  const hits = lookupChecklist("1.1");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].id, "1.1");
  assert.ok(hits[0].requirement.length > 0);
});

test("checklist lookup by topic returns relevant controls", () => {
  const hits = lookupChecklist("retention and deletion of old records");
  assert.ok(hits.length >= 2, `only ${hits.length}`);
  const text = hits.map((h) => `${h.requirement} ${h.guardrail}`).join(" ").toLowerCase();
  assert.match(text, /retention|delet|erase/);
});

test("nonsense checklist query returns empty", () => {
  assert.equal(lookupChecklist("zzz qqq xxx").length, 0);
});
