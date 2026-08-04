// Run: node --test --experimental-strip-types lib/data/data-flow/live-slugs.test.ts
//
// live-slugs.ts exists so client components can resolve flow-map links without
// bundling the packs. Its only failure mode is drifting from the registry —
// this pins the two together. The registry itself can't be imported here (its
// sectors.ts chain used extensionless imports historically and it pulls every
// pack in), so the sync check parses the registry SOURCE for the PACKS keys —
// same source-reading approach as data-flow.test.ts.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { LIVE_FLOW_MAP_SLUGS, resolveFlowMapLink } from "./live-slugs.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Slug keys of the registry's PACKS map, read from the source of record. */
function registryPackSlugs(): string[] {
  const src = readFileSync(join(HERE, "index.ts"), "utf8");
  const block = src.match(/const PACKS[^{]*\{([\s\S]*?)\n\};/);
  assert.ok(block, "could not find the PACKS block in index.ts");
  // Entries are `"slug-with-dashes": somePack,` or `bareword: somePack,`
  return [...block[1].matchAll(/(?:"([\w-]+)"|(\w+)):\s*\w+DataFlowPack,/g)].map(
    (m) => m[1] ?? m[2],
  );
}

test("LIVE_FLOW_MAP_SLUGS matches the registry's PACKS keys exactly", () => {
  const registry = registryPackSlugs();
  assert.ok(registry.length >= 12, `parsed only ${registry.length} PACKS keys`);
  assert.deepEqual(
    [...LIVE_FLOW_MAP_SLUGS].sort(),
    registry.sort(),
    "live-slugs.ts drifted from lib/data/data-flow/index.ts — a map was " +
      "published or removed without updating the client-safe list",
  );
});

test("resolveFlowMapLink returns the registry-shaped href for every live sector", () => {
  for (const slug of LIVE_FLOW_MAP_SLUGS) {
    const link = resolveFlowMapLink(slug);
    assert.ok(link, `no link resolved for live sector ${slug}`);
    assert.equal(link.href, `/industries/${slug}/data-flow`);
    assert.equal(link.sector.slug, slug);
    assert.ok(link.sector.navLabel.length > 0, `empty navLabel for ${slug}`);
  }
});

test("resolveFlowMapLink returns null for unknown or missing slugs (hub fallback)", () => {
  assert.equal(resolveFlowMapLink("not-a-sector"), null);
  assert.equal(resolveFlowMapLink(undefined), null);
  assert.equal(resolveFlowMapLink(null), null);
  assert.equal(resolveFlowMapLink(""), null);
});
