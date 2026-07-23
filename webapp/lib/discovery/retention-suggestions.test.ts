// Run: node --test --experimental-strip-types lib/discovery/retention-suggestions.test.ts
//
// Self-contained by design: importing engine.ts here would drag its extensionless
// `./data` import, which Node 24's --experimental-strip-types cannot resolve (the
// same pre-existing issue that currently breaks engine.test.ts). Instead we pin the
// category contract explicitly below — if engine.ts TAG_GROUP gains/loses a
// category, update EXPECTED_CATEGORIES here and add the matching lookup entry.
import test from "node:test";
import assert from "node:assert/strict";

import { RETENTION_SUGGESTIONS, RETENTION_FALLBACK, retentionFor } from "./retention-suggestions.ts";

// The engine TAG_GROUP keys, mirrored (see engine.ts TAG_GROUP). Drift tripwire.
const EXPECTED_CATEGORIES = [
  "IDENTITY", "FINANCIAL_DATA", "TRANSACTION_DATA", "HEALTH_DATA", "CHILD_DATA",
  "BEHAVIOURAL_DATA", "AI_INFERENCE", "DEVICE_NETWORK_DATA", "LOCATION_DATA",
  "BIOMETRIC_SURVEILLANCE", "VENDOR_SHARED", "DARK_DATA", "RETENTION_RISK",
  "ACCESS_CONTROL_RISK", "COMMUNICATION_DATA", "CONSENT_RECORD",
  "SENSITIVE_CONTEXT", "EMPLOYMENT_DATA",
].sort();

// The only categories where an Indian statute sets a retention floor.
const EXPECTED_STATUTORY = ["FINANCIAL_DATA", "TRANSACTION_DATA", "EMPLOYMENT_DATA", "HEALTH_DATA"].sort();

test("lookup covers exactly the engine categories — no gaps, no extras", () => {
  const actual = Object.keys(RETENTION_SUGGESTIONS).sort();
  assert.deepEqual(actual, EXPECTED_CATEGORIES);
});

test("every expected category resolves to a real suggestion (not the fallback)", () => {
  for (const key of EXPECTED_CATEGORIES) {
    assert.ok(RETENTION_SUGGESTIONS[key], `category "${key}" missing from lookup`);
    assert.notEqual(retentionFor(key), RETENTION_FALLBACK, `"${key}" should not resolve to fallback`);
  }
});

test("unknown category falls back — never throws, never empty", () => {
  const s = retentionFor("NOT_A_REAL_CATEGORY");
  assert.equal(s, RETENTION_FALLBACK);
  assert.equal(s.status, "dpdpa_determination");
  assert.equal(s.otherLaw, null);
});

test("statutory_floor is set ONLY on the expected categories", () => {
  const floors = Object.entries(RETENTION_SUGGESTIONS)
    .filter(([, s]) => s.status === "statutory_floor")
    .map(([k]) => k)
    .sort();
  assert.deepEqual(floors, EXPECTED_STATUTORY);
});

test("statutory_floor rows cite a hedged law + period; determination rows assert no number", () => {
  for (const [key, s] of Object.entries(RETENTION_SUGGESTIONS)) {
    if (s.status === "statutory_floor") {
      assert.ok(s.otherLaw, `${key}: statutory_floor must carry otherLaw`);
      assert.match(s.otherLaw!.citation, /confirm with counsel/i, `${key}: citation must be hedged`);
      assert.ok(s.otherLaw!.period.length > 0, `${key}: statutory_floor must state a period`);
    } else {
      assert.equal(s.otherLaw, null, `${key}: determination must NOT assert a statutory period`);
    }
  }
});

test("every suggestion has non-empty baseline + guidance", () => {
  const all = { ...RETENTION_SUGGESTIONS, FALLBACK: RETENTION_FALLBACK };
  for (const [key, s] of Object.entries(all)) {
    assert.ok(s.trigger.trim().length > 0, `${key}: trigger empty`);
    assert.ok(s.dpdpaBaseline.trim().length > 0, `${key}: dpdpaBaseline empty`);
    assert.ok(s.guidance.trim().length > 0, `${key}: guidance empty`);
  }
});
