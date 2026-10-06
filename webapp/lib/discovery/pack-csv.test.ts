// Run: node --test --experimental-strip-types lib/discovery/pack-csv.test.ts
//
// Self-contained: pack-csv only imports register *types*, so no engine/data chain.
import test from "node:test";
import assert from "node:assert/strict";

import { buildPackCsv, csvCell } from "./pack-csv.ts";
import type { DiscoveryRegister } from "./register.ts";

test("csvCell quotes and escapes embedded quotes", () => {
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell(undefined), '""');
});

test("csvCell neutralises spreadsheet formula prefixes", () => {
  for (const lead of ["=", "+", "-", "@", "\t", "\r"]) {
    const cell = csvCell(`${lead}HYPERLINK("http://x","y")`);
    assert.ok(cell.startsWith(`"'${lead}`), `prefix ${JSON.stringify(lead)} not neutralised: ${cell}`);
  }
  assert.equal(csvCell("Name"), '"Name"');
});

test("buildPackCsv guards every register cell", () => {
  const reg = {
    counts: { items: 1, categories: 1, highRisk: 0 },
    rows: [{
      dataItem: "=cmd|' /C calc'!A0", description: "d", dataPrincipal: "p", dataCategory: "c",
      purpose: "u", collectionSource: "s", storedAt: "t", riskLevel: "Low", riskReason: "r",
      recommendedAction: "a", externalRecipients: [], status: "Suggested",
    }],
    retention: [],
    risks: [],
  } as unknown as DiscoveryRegister;
  const csv = buildPackCsv(reg, "Test niche");
  assert.ok(csv.includes(`"'=cmd|`), "formula cell was not prefixed");
  assert.ok(!/(^|,)"=/m.test(csv), "an unguarded formula cell remains");
});
