// Citation audit: every DPDP Act reference in content must point at a clause
// that exists in the Gazette text (content/dpdp-act-2023.ts). Rules 2025 are
// not in the repo, so Rule references are listed as unverifiable, not failed.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { allSections } from "../content/dpdp-act-2023.ts";

type Clause = { sub?: string; clause?: string; sub2?: string };
const ROOT = process.cwd();
const SCAN = ["lib/data", "components", "app/[locale]", "lib/notice-pack", "lib/discovery", "lib/chat", "lib/data/data-flow"];
const SKIP = /node_modules|\.test\.|\/i18n\/|\.hi\.ts$|content\/dpdp-act-2023/;

// Build structure map: section -> set of "(n)" subsections -> set of "(a)" clauses
const act = new Map<number, { title: string; subs: Map<string, Set<string>>; topClauses: Set<string> }>();
for (const s of allSections) {
  const subs = new Map<string, Set<string>>(); const top = new Set<string>();
  let cur: string | null = null;
  for (const raw of s.officialText.split("\n")) {
    const line = raw.trim();
    const m = line.match(/^\((\d+)\)/);
    if (m) { cur = m[1]; if (!subs.has(cur)) subs.set(cur, new Set()); continue; }
    // Clauses run (a)…(z), then (za), (zb) — s.2 definitions reach (zb).
    const c = line.match(/^\(([a-z]|z[a-z])\)/);
    if (c) { if (cur) subs.get(cur)!.add(c[1]); else top.add(c[1]); }
  }
  act.set(s.sectionNumber, { title: s.title, subs, topClauses: top });
}

const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); const st = statSync(p); if (st.isDirectory()) walk(p); else if (/\.(ts|tsx|md|json)$/.test(f)) files.push(p); } };
for (const d of SCAN) { try { walk(join(ROOT, d)); } catch {} }

const re = /\b(?:Section|Sec\.|s\.)\s*(\d{1,2})((?:\s*\(\s*[0-9a-z]{1,3}\s*\))*)/g;
const ruleRe = /\bRule\s*(\d{1,2})(?:\s*\(\s*\d+\s*\))?/g;
type Hit = { file: string; line: number; ref: string; verdict: string; ctx: string };
const hits: Hit[] = []; const rules: Hit[] = [];
for (const f of files) {
  if (SKIP.test(f)) continue;
  const src = readFileSync(f, "utf8"); const lines = src.split("\n");
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(re)) {
      const sec = Number(m[1]);
      const parts = [...m[2].matchAll(/\(\s*([0-9a-z]{1,3})\s*\)/g)].map(x => x[1]);
      const ref = `Section ${sec}${parts.map(p => `(${p})`).join("")}`;
      const s = act.get(sec);
      let verdict = "ok";
      if (!s) verdict = "NO SUCH SECTION";
      else if (parts.length) {
        const [p1, p2, p3] = parts;
        if (/^\d+$/.test(p1)) {
          if (!s.subs.has(p1)) verdict = `no sub-section (${p1}) in s.${sec}`;
          else if (p2 && !s.subs.get(p1)!.has(p2)) verdict = `no clause (${p2}) in s.${sec}(${p1})`;
        } else {
          if (!s.topClauses.has(p1)) verdict = `no clause (${p1}) directly under s.${sec}`;
        }
      }
      const ctx = ln.replace(/\s+/g, " ").trim();
      const at = ctx.indexOf(m[0]);
      hits.push({ file: relative(ROOT, f), line: i + 1, ref, verdict, ctx: ctx.slice(Math.max(0, at - 110), at + 130) });
    }
    for (const m of ln.matchAll(ruleRe)) rules.push({ file: relative(ROOT, f), line: i + 1, ref: m[0], verdict: "unverifiable (Rules not in repo)", ctx: ln.trim().slice(0, 160) });
  });
}
const bad = hits.filter(h => h.verdict !== "ok");
console.log(`files scanned: ${files.length}  section refs: ${hits.length}  STRUCTURALLY INVALID: ${bad.length}  rule refs: ${rules.length}`);
console.log("\n=== STRUCTURALLY INVALID ===");
for (const h of bad) console.log(`${h.file}:${h.line}  ${h.ref}  → ${h.verdict}\n    …${h.ctx}…`);
// dump all for semantic pass
import { writeFileSync } from "node:fs";
writeFileSync(process.argv[2] ?? "/tmp/citations.json", JSON.stringify({ hits, rules, act: Object.fromEntries([...act].map(([k, v]) => [k, v.title])) }, null, 1));
