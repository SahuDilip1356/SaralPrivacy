// Contract tests for the template_downloads lead payload.
// Run: node --test --experimental-strip-types lib/templates/lead.test.ts
//
// Appwrite rejects unknown attributes and the routes swallow the error as
// non-fatal, so a payload key outside the collection schema means every lead
// from that route is silently dropped. These tests pin the payload to the
// schema recorded in TEMPLATE_DOWNLOAD_ATTRIBUTES.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTemplateLeadDocument,
  TEMPLATE_DOWNLOAD_ATTRIBUTES,
} from "./lead.ts";

const sample = {
  email: "owner@example.com",
  contactName: "Asha Rao",
  businessName: "Rao Diagnostics",
  templateName: "Privacy Notice Template",
  phone: "+919876543210",
  consentContact: true,
  referer: "https://saralprivacy.com/tools/dpdpa-templates",
  ip: "203.0.113.7",
  city: "Mumbai",
  country: "IN",
};

test("every payload key is a real collection attribute", () => {
  const doc = buildTemplateLeadDocument(sample);
  for (const key of Object.keys(doc)) {
    assert.ok(
      TEMPLATE_DOWNLOAD_ATTRIBUTES.has(key),
      `"${key}" is not an attribute of template_downloads — Appwrite will reject the whole document`
    );
  }
});

test("the historic wrong names never come back", () => {
  const doc = buildTemplateLeadDocument(sample);
  for (const bad of [
    "contact_email",
    "contact_person",
    "template_selected",
    "phone_number",
    "consent_briefings",
  ]) {
    assert.ok(!(bad in doc), `payload carries dropped-lead field "${bad}"`);
  }
});

test("required attributes are present and non-empty", () => {
  const doc = buildTemplateLeadDocument(sample);
  for (const required of ["business_name", "phone", "contact_name"]) {
    assert.ok(
      typeof doc[required] === "string" && doc[required].length > 0,
      `required attribute "${required}" is missing or empty`
    );
  }
});

test("source fits the 64-char attribute even with a long referer", () => {
  const doc = buildTemplateLeadDocument({
    ...sample,
    referer:
      "https://saralprivacy.com/tools/dpdpa-templates?utm_source=linkedin&utm_medium=social&utm_campaign=aug-templates",
  });
  assert.ok(typeof doc.source === "string" && doc.source.length <= 64);
});

test("missing referer falls back to direct", () => {
  const doc = buildTemplateLeadDocument({ ...sample, referer: null });
  assert.equal(doc.source, "direct");
});
