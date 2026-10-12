// withdrawal.test.ts — withdrawal record shape, normalisation, field limits.
// Run: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/withdrawal.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWithdrawalRecord, shouldRecordWithdrawal } from "./withdrawal.ts";

const AT = "2026-10-12T09:30:00.000Z";

test("record matches the spec Contracts table exactly", () => {
  const rec = buildWithdrawalRecord({
    email: "a@example.com",
    name: "Asha",
    at: AT,
    privacyVersion: "1.0.0",
    ip: "1.2.3.4",
    userAgent: "Mozilla/5.0",
    city: "Pune",
    country: "IN",
    region: "MH",
  });
  assert.deepEqual(rec, {
    email: "a@example.com",
    name: "Asha",
    source: "unsubscribe",
    consent_type: "email_marketing",
    consent_value: false,
    privacy_version: "1.0.0",
    timestamp: AT,
    withdrawn_at: AT,
    ip_address: "1.2.3.4",
    user_agent: "Mozilla/5.0",
    city: "Pune",
    country: "IN",
    region: "MH",
  });
});

test("email is trimmed and lower-cased; missing strings become empty", () => {
  const rec = buildWithdrawalRecord({
    email: "  X@Example.COM ",
    name: null,
    at: AT,
    privacyVersion: "1.0.0",
    ip: undefined,
    userAgent: null,
  });
  assert.equal(rec.email, "x@example.com");
  assert.equal(rec.name, "");
  assert.equal(rec.ip_address, "");
  assert.equal(rec.user_agent, "");
  assert.equal(rec.city, "");
  assert.equal(rec.country, "");
  assert.equal(rec.region, "");
});

test("long values are truncated at 50 / 100 / 500, never rejected", () => {
  const rec = buildWithdrawalRecord({
    email: "a@example.com",
    at: "t".repeat(80),
    privacyVersion: "1.0.0",
    ip: "i".repeat(150),
    userAgent: "u".repeat(900),
    city: "c".repeat(150),
    country: "n".repeat(150),
    region: "r".repeat(150),
  });
  assert.equal(rec.timestamp.length, 50);
  assert.equal(rec.withdrawn_at.length, 50);
  assert.equal(rec.ip_address.length, 100);
  assert.equal(rec.city.length, 100);
  assert.equal(rec.country.length, 100);
  assert.equal(rec.region.length, 100);
  assert.equal(rec.user_agent.length, 500);
});

test("shouldRecordWithdrawal is true for every status except unsubscribed", () => {
  assert.equal(shouldRecordWithdrawal("unsubscribed"), false);
  for (const s of ["active", "bounced", "complained", "", undefined, null]) {
    assert.equal(shouldRecordWithdrawal(s), true, String(s));
  }
});
