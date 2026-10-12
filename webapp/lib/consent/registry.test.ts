// registry.test.ts — consent-pair derivation for the admin Consent Registry.
// Run: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/registry.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { summariseConsent } from "./registry.ts";

const TYPES = ["email_marketing", "phone_contact", "webinars", "data_processing"];
const grant = (email: string, timestamp: string, consent_type = "email_marketing") =>
  ({ email, consent_type, consent_value: true, timestamp });
const withdrawal = (email: string, timestamp: string) =>
  ({ email, consent_type: "email_marketing", consent_value: false, timestamp, withdrawn_at: timestamp });

const em = (s: ReturnType<typeof summariseConsent>) => s.byType.find((b) => b.type === "email_marketing");

test("grant then later withdrawal → withdrawn, not active (AC14)", () => {
  const s = summariseConsent(
    [grant("x@example.com", "2026-10-01T00:00:00.000Z"), withdrawal("x@example.com", "2026-10-05T00:00:00.000Z")],
    TYPES,
  );
  assert.equal(s.active, 0);
  assert.equal(s.withdrawn, 1);
  assert.equal(s.totalRecords, 2);
  assert.deepEqual(em(s), { type: "email_marketing", pairs: 1, active: 0 });
});

test("withdrawal then a newer grant → active", () => {
  const s = summariseConsent(
    [withdrawal("x@example.com", "2026-10-01T00:00:00.000Z"), grant("x@example.com", "2026-10-05T00:00:00.000Z")],
    TYPES,
  );
  assert.equal(s.active, 1);
  assert.equal(s.withdrawn, 0);
});

test("mixed-case duplicate grants pair with one later withdrawal (AC15)", () => {
  const s = summariseConsent(
    [
      grant("X@Example.com", "2026-10-01T00:00:00.000Z"),
      grant("x@example.com", "2026-10-02T00:00:00.000Z"),
      withdrawal("x@example.com", "2026-10-03T00:00:00.000Z"),
    ],
    TYPES,
  );
  assert.equal(s.active, 0);
  assert.equal(s.withdrawn, 1);
  assert.deepEqual(em(s), { type: "email_marketing", pairs: 1, active: 0 });
});

test("a lone grant stays active (AC16)", () => {
  const s = summariseConsent([grant("y@example.com", "2026-10-01T00:00:00.000Z")], TYPES);
  assert.equal(s.active, 1);
  assert.equal(s.withdrawn, 0);
  assert.deepEqual(em(s), { type: "email_marketing", pairs: 1, active: 1 });
});

test("a legacy row with withdrawn_at counts as withdrawn", () => {
  const s = summariseConsent(
    [{ email: "z@example.com", consent_type: "email_marketing", consent_value: true, timestamp: "2026-09-01T00:00:00.000Z", withdrawn_at: "2026-09-10T00:00:00.000Z" }],
    TYPES,
  );
  assert.equal(s.active, 0);
  assert.equal(s.withdrawn, 1);
});

test("pairs are per consent type: a withdrawal leaves other purposes active", () => {
  const s = summariseConsent(
    [
      grant("x@example.com", "2026-10-01T00:00:00.000Z"),
      grant("x@example.com", "2026-10-01T00:00:00.000Z", "data_processing"),
      withdrawal("x@example.com", "2026-10-05T00:00:00.000Z"),
    ],
    TYPES,
  );
  assert.equal(s.active, 1);
  assert.equal(s.withdrawn, 1);
  assert.deepEqual(s.byType.find((b) => b.type === "data_processing"), { type: "data_processing", pairs: 1, active: 1 });
});
