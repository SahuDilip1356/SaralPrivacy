// db.test.ts — seam contract: flag routing + column-rename mapping.
// Run: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/db/db.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { dataBackend, COLLECTION_MODULE } from "./flags.ts";
import { TARGETS, RENAMES, toRow } from "./supabase.ts";

test("every collection has exactly one module and one target table", () => {
  const collections = Object.keys(TARGETS);
  assert.equal(collections.length, 19);
  for (const c of collections) {
    assert.ok(COLLECTION_MODULE[c], `collection ${c} missing a module`);
  }
  assert.deepEqual(Object.keys(COLLECTION_MODULE).sort(), collections.sort());
});

test("default backend is appwrite for every collection", () => {
  for (const c of Object.keys(TARGETS)) {
    assert.equal(dataBackend(c), "appwrite", c);
  }
});

test("DATA_BACKEND_<MODULE>=supabase flips only that module's collections", () => {
  process.env.DATA_BACKEND_TEMPLATES = "supabase";
  try {
    assert.equal(dataBackend("template_downloads"), "supabase");
    assert.equal(dataBackend("downloads"), "supabase");
    assert.equal(dataBackend("subscribers"), "appwrite");
    assert.equal(dataBackend("consent_log"), "appwrite");
  } finally {
    delete process.env.DATA_BACKEND_TEMPLATES;
  }
});

test("garbage flag value falls back to appwrite", () => {
  process.env.DATA_BACKEND_TEMPLATES = "postgres";
  try {
    assert.equal(dataBackend("template_downloads"), "appwrite");
  } finally {
    delete process.env.DATA_BACKEND_TEMPLATES;
  }
});

test("unknown collection throws instead of guessing", () => {
  assert.throws(() => dataBackend("nonexistent"));
});

test("toRow applies the rename map and passes other keys through", () => {
  const row = toRow("template_downloads", {
    business_name: "Acme",
    created_at: "2026-01-01T00:00:00.000Z",
    consent_contact: true,
  });
  assert.deepEqual(row, {
    business_name: "Acme",
    created_at_attr: "2026-01-01T00:00:00.000Z",
    consent_contact: true,
  });
});

test("toRow is identity for collections without renames", () => {
  const data = { name: "x", email: "y@z.in", consent_email: true };
  assert.deepEqual(toRow("downloads", data), data);
});

test("renames only name columns that exist in the DDL convention", () => {
  for (const [collection, map] of Object.entries(RENAMES)) {
    assert.ok(TARGETS[collection], `rename for unknown collection ${collection}`);
    for (const [from, to] of Object.entries(map)) {
      assert.ok(["created_at", "updated_at"].includes(from));
      assert.equal(to, `${from}_attr`);
    }
  }
});
