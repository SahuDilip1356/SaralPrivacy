// auth.test.ts — P3 pure-logic contract: pending cookie codec, role/step
// derivation, aal decoding, and the adminSession/sendGateway secret rules.
// Run: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/auth/auth.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { encodePending, decodePending } from "./pending.ts";
import {
  roleOf, displayNameOf, nextStep, pickVerifiedTotp, unverifiedTotp, aalOf, isValidTotpCode,
} from "./supabaseAuth.ts";
import { createAdminSessionToken, verifyAdminSessionToken } from "../adminSession.ts";
// (lib/sendGateway.ts pulls in "@/lib/db", which the node test resolver can't
// alias — its EMAIL_LINK_SECRET-only rule is the same 3-line shape as
// adminSession's and is covered by the type-check + preview smoke.)

const fakeJwt = (claims: Record<string, unknown>) =>
  `${Buffer.from("{}").toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;

// ── pending cookie ──────────────────────────────────────────────────────────

test("pending: encode/decode round-trips access + refresh tokens", () => {
  const at = fakeJwt({ aal: "aal1" });
  const v = encodePending({ at, rt: "r-1" });
  assert.deepEqual(decodePending(v), { at, rt: "r-1" });
});

test("pending: garbage, missing fields and non-JWT access tokens decode to null", () => {
  assert.equal(decodePending(undefined), null);
  assert.equal(decodePending(""), null);
  assert.equal(decodePending("not-base64-json"), null);
  assert.equal(decodePending(Buffer.from('{"at":"x"}').toString("base64url")), null);
  assert.equal(decodePending(Buffer.from('{"at":"not.a-jwt","rt":"r"}').toString("base64url")), null);
  assert.equal(decodePending(Buffer.from('[1,2]').toString("base64url")), null);
});

// ── role + step derivation ──────────────────────────────────────────────────

test("roleOf: only the two known roles from app_metadata count", () => {
  assert.equal(roleOf({ app_metadata: { role: "admin" } }), "admin");
  assert.equal(roleOf({ app_metadata: { role: "blogger" } }), "blogger");
  assert.equal(roleOf({ app_metadata: { role: "superuser" } }), null);
  assert.equal(roleOf({ app_metadata: {} }), null);
  assert.equal(roleOf({ user_metadata: { role: "admin" } }), null); // user-writable — ignored
  assert.equal(roleOf(null), null);
});

test("displayNameOf: trimmed user_metadata.name or undefined", () => {
  assert.equal(displayNameOf({ user_metadata: { name: "  Desk " } }), "Desk");
  assert.equal(displayNameOf({ user_metadata: { name: "" } }), undefined);
  assert.equal(displayNameOf({}), undefined);
});

const f = (status: "verified" | "unverified", type = "totp") =>
  ({ id: `${type}-${status}`, factor_type: type, status, created_at: "", updated_at: "" }) as never;

test("nextStep: no verified TOTP → enroll; verified TOTP → verify", () => {
  assert.equal(nextStep(null), "enroll");
  assert.equal(nextStep({ all: [], totp: [] }), "enroll");
  assert.equal(nextStep({ all: [f("unverified")], totp: [] }), "enroll");
  assert.equal(nextStep({ all: [f("verified")], totp: [f("verified")] }), "verify");
  assert.equal(nextStep({ all: [f("verified", "phone")], totp: [] }), "enroll"); // phone factors don't count
});

test("pickVerifiedTotp / unverifiedTotp split factors correctly", () => {
  const all = [f("unverified"), f("verified"), f("verified", "phone")];
  assert.equal(pickVerifiedTotp({ all })?.id, "totp-verified");
  assert.deepEqual(unverifiedTotp({ all }).map((x) => x.id), ["totp-unverified"]);
});

test("aalOf: reads the aal claim, null on anything malformed", () => {
  assert.equal(aalOf(fakeJwt({ aal: "aal2" })), "aal2");
  assert.equal(aalOf(fakeJwt({ aal: "aal1" })), "aal1");
  assert.equal(aalOf(fakeJwt({})), null);
  assert.equal(aalOf("nope"), null);
  assert.equal(aalOf(undefined), null);
});

test("isValidTotpCode: exactly six digits", () => {
  assert.equal(isValidTotpCode("123456"), true);
  assert.equal(isValidTotpCode("12345"), false);
  assert.equal(isValidTotpCode("12345a"), false);
  assert.equal(isValidTotpCode(123456), false);
});

// ── adminSession: dedicated secret only, carries the user id ────────────────

test("adminSession: no ADMIN_SESSION_SECRET → cannot mint, cannot verify (no derived fallback)", async () => {
  const saved = { s: process.env.ADMIN_SESSION_SECRET, p: process.env.ADMIN_PASSWORD };
  delete process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_PASSWORD = "legacy-password-must-not-derive-a-key";
  try {
    await assert.rejects(() => createAdminSessionToken("admin"), /ADMIN_SESSION_SECRET/);
    assert.equal(await verifyAdminSessionToken("v1.e30.e30"), null);
  } finally {
    if (saved.s) process.env.ADMIN_SESSION_SECRET = saved.s; else delete process.env.ADMIN_SESSION_SECRET;
    if (saved.p) process.env.ADMIN_PASSWORD = saved.p; else delete process.env.ADMIN_PASSWORD;
  }
});

test("adminSession: mint/verify round-trip carries role, name and user id; tamper → null", async () => {
  const saved = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = "unit-test-secret";
  try {
    const token = await createAdminSessionToken("blogger", "Desk", "user-uuid-1");
    assert.deepEqual(await verifyAdminSessionToken(token), {
      role: "blogger", name: "Desk", userId: "user-uuid-1",
    });
    const [v, payload, sig] = token.split(".");
    assert.equal(await verifyAdminSessionToken(`${v}.${payload}.${sig.slice(0, -2)}xx`), null);
    process.env.ADMIN_SESSION_SECRET = "rotated";
    assert.equal(await verifyAdminSessionToken(token), null); // rotation kills sessions
  } finally {
    if (saved) process.env.ADMIN_SESSION_SECRET = saved; else delete process.env.ADMIN_SESSION_SECRET;
  }
});

