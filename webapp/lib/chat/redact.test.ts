// Run: node --test --experimental-strip-types lib/chat/redact.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { redact, redactText } from "./redact.ts";

test("redacts emails", () => {
  const { text, redactions } = redact("write to ramesh.k@example.co.in please");
  assert.equal(text, "write to [email] please");
  assert.equal(redactions, 1);
});

test("redacts PAN", () => {
  assert.equal(redactText("client PAN is ABCDE1234F ok"), "client PAN is [pan] ok");
});

test("redacts Aadhaar-like 12-digit runs, spaced or not", () => {
  assert.equal(redactText("aadhaar 1234 5678 9012"), "aadhaar [aadhaar]");
  assert.equal(redactText("aadhaar 123456789012"), "aadhaar [aadhaar]");
});

test("redacts phone numbers with country code, spaces, dashes", () => {
  assert.equal(redactText("call +91 98765 43210 now"), "call [phone] now");
  assert.equal(redactText("call 98765-43210 now"), "call [phone] now");
});

test("multiple PII types in one message all redacted", () => {
  const { text, redactions } = redact(
    "I am ravi@firm.in, PAN ABCDE1234F, phone +91 9876543210"
  );
  assert.ok(!text.includes("ravi@"));
  assert.ok(!text.includes("ABCDE1234F"));
  assert.ok(!text.includes("9876543210"));
  assert.equal(redactions, 3);
});

test("leaves ordinary DPDPA questions untouched", () => {
  const q = "Do I need consent to email marketing offers to my 500 customers under Section 6?";
  const { text, redactions } = redact(q);
  assert.equal(text, q);
  assert.equal(redactions, 0);
});

test("small numbers and years are not phone numbers", () => {
  const q = "The DPDP Act 2023 and Rules 2025 apply from 2026, penalty up to 250 crore.";
  assert.equal(redactText(q), q);
});
