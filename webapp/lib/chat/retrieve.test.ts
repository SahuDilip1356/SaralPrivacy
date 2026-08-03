// Retrieval smoke tests against the real built index — an early mini golden
// set. If BM25 + boosts can't put the right page on top for these, the full
// golden set will fail too; fix retrieval before wiring the LLM.
// Run: node --test --experimental-strip-types lib/chat/retrieve.test.ts

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { retrieve, tokenize } from "./retrieve.ts";

const INDEX = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "chat-index.json");

function topUrls(query: string, opts: Parameters<typeof retrieve>[1] = {}) {
  const r = retrieve(query, { ...opts, indexPath: INDEX });
  return { urls: r.hits.map((h) => h.chunk.url), confidence: r.confidence, r };
}

test("consent question lands on the consent guide", () => {
  const { urls, confidence } = topUrls("do I need consent to send marketing emails to customers?");
  assert.ok(urls.slice(0, 3).includes("/learn/consent"), `got ${urls.slice(0, 3)}`);
  assert.equal(confidence, "high");
});

test("penalty question surfaces section 33 material", () => {
  const { urls } = topUrls("how much is the penalty under section 33 for a data breach?");
  assert.ok(
    urls.slice(0, 4).some((u) => u === "/penalty-calculator" || u.startsWith("/learn/d")),
    `got ${urls.slice(0, 4)}`
  );
});

test("industry slot boosts the sector guide", () => {
  const { urls } = topUrls("how should we store prescriptions and medicine history?", {
    industry: "pharmacies",
  });
  assert.ok(urls.slice(0, 3).includes("/industries/pharmacies"), `got ${urls.slice(0, 3)}`);
});

test("cross-border question lands on the transfer guide", () => {
  const { urls, confidence } = topUrls("can we send customer data to a server outside India?");
  assert.ok(urls.slice(0, 3).includes("/learn/cross-border"), `got ${urls.slice(0, 3)}`);
  assert.equal(confidence, "high");
});

test("glossary-style question finds the term", () => {
  const { urls } = topUrls("what does data fiduciary mean?");
  assert.ok(
    urls.slice(0, 3).some((u) => u === "/glossary" || u === "/learn/key-terms" || u === "/learn/duties"),
    `got ${urls.slice(0, 3)}`
  );
});

test("children's data question routes correctly", () => {
  const { urls } = topUrls("do we need parental consent for students under 18?");
  assert.ok(
    urls.slice(0, 3).includes("/learn/childrens-data"),
    `got ${urls.slice(0, 3)}`
  );
});

test("off-corpus gibberish is low confidence", () => {
  const { confidence } = topUrls("quantum blockchain pizza recommendation engine tokyo");
  assert.equal(confidence, "low");
});

test("empty and stopword-only queries are low confidence with no hits", () => {
  assert.equal(retrieve("", { indexPath: INDEX }).hits.length, 0);
  assert.equal(retrieve("what is the and of", { indexPath: INDEX }).confidence, "low");
});

test("tokenize keeps statutory numbers", () => {
  assert.ok(tokenize("Section 33(2) of the DPDP Act 2023").includes("33"));
  assert.ok(tokenize("Section 33(2) of the DPDP Act 2023").includes("2023"));
});
