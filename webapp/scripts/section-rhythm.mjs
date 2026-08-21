#!/usr/bin/env node
// section-rhythm — the check that makes the padding ladder real.
//
// W1.3 specified a ladder (statement 32 / demo 24 / utility 20 / evidence 16)
// and nothing enforced it, so the homepage drifted to
// 16/16/32/24/16/16/20/10/20/20 — three py-20 sections in a row, and ten
// consecutive cloud-50 fills. The page lost its background separation AND never
// got the silhouette that was supposed to replace it.
//
// The rule: two ADJACENT sections that share a fill may not share a padding
// type. A fill change is already a boundary; two beats on the same fill have
// only their padding and a hairline to separate them, so those must differ.
//
// Prints one line per violation. design-lint.sh ratchets the count (baseline 0).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = "app/page.tsx";

const read = (p) => {
  try {
    return readFileSync(join(root, p), "utf8");
  } catch {
    return null;
  }
};

/** Pull surface/type off the first <Section …> in a chunk of source. */
function sectionProps(src) {
  if (!src) return null;
  const m = src.match(/<Section\b[^>]*>/s);
  if (!m) return null;
  const tag = m[0];
  const surface = tag.match(/surface=["']([a-z]+)["']/)?.[1] ?? "white";
  const type = tag.match(/type=["']([a-z]+)["']/)?.[1] ?? "utility";
  return { surface, type };
}

const page = read(PAGE);
if (!page) {
  console.error(`section-rhythm: cannot read ${PAGE}`);
  process.exit(2);
}

// Resolve the homepage's import map so a component tag can find its file.
const imports = new Map();
for (const m of page.matchAll(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/g)) {
  const from = m[2];
  if (!from.startsWith("@/")) continue;
  for (const name of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
    imports.set(name, from.replace(/^@\//, "") + ".tsx");
  }
}

// Walk the render body in source order, collecting every section as it appears.
const body = page.slice(page.indexOf("export default function"));
const sections = [];

for (const m of body.matchAll(/<([A-Z][A-Za-z0-9]*)\b[^>]*>/g)) {
  const name = m[1];

  if (name === "Section") {
    const p = sectionProps(m[0] + ">");
    if (p) sections.push({ name: "Section (inline)", ...p });
    continue;
  }

  const file = imports.get(name);
  if (!file) continue;
  const p = sectionProps(read(file));
  // A component that does not render a <Section> is not part of the ladder —
  // the hero owns its own layout and is exempt by design.
  if (p) sections.push({ name, ...p });
}

const violations = [];
for (let i = 1; i < sections.length; i++) {
  const prev = sections[i - 1];
  const cur = sections[i];
  if (prev.surface === "navy" || cur.surface === "navy") continue;
  if (prev.surface !== cur.surface) continue;
  if (prev.type !== cur.type) continue;
  violations.push(
    `${PAGE}: ${prev.name} → ${cur.name} — both ${cur.surface}/${cur.type}; ` +
      `same fill and same padding means no boundary between them`,
  );
}

if (process.argv.includes("--show")) {
  console.error("section order:");
  for (const s of sections) console.error(`  ${s.surface.padEnd(6)} ${s.type.padEnd(10)} ${s.name}`);
}

for (const v of violations) console.log(v);
