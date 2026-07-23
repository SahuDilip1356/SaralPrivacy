"use client";
// Report 1 — Master Personal Data Register. Read-first table with light
// interactivity: sort, risk/category filter chips, search, a compact per-row
// Yes/No decision (default Yes = green "you handle this"; No = red greys the
// row out), and a focus-trapped detail drawer. NOT a spreadsheet grid — that's
// Phase C. Decisions are session-only (nothing is stored in this cut).
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import type { RegisterRow, RiskRow, RetentionRule } from "@/lib/discovery/register";
import { bandColor } from "@/lib/discovery/engine";
import type { RiskBand } from "@/lib/discovery/types";

type SortKey = "dataItem" | "dataCategory" | "riskLevel";
type Decision = "yes" | "no";
const RISK_RANK: Record<RiskBand, number> = { Low: 0, Moderate: 1, High: 2, Critical: 3 };

export default function MasterRegister({
  rows,
  risks,
  retention,
}: {
  rows: RegisterRow[];
  risks: RiskRow[];
  retention: RetentionRule[];
}) {
  // Default is Yes for every row; only explicit "No"s are stored.
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [riskFilter, setRiskFilter] = useState<RiskBand | "All">("All");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "riskLevel", dir: -1 });
  const [openRow, setOpenRow] = useState<RegisterRow | null>(null);

  const categories = useMemo(() => ["All", ...new Set(rows.map((r) => r.dataCategory))], [rows]);
  const decisionOf = (id: string): Decision => decisions[id] ?? "yes";
  const setDec = (id: string, v: Decision) => setDecisions((d) => ({ ...d, [id]: v }));

  const view = useMemo(() => {
    let v = rows.slice();
    if (riskFilter !== "All") v = v.filter((r) => r.riskLevel === riskFilter);
    if (catFilter !== "All") v = v.filter((r) => r.dataCategory === catFilter);
    const q = query.trim().toLowerCase();
    if (q) v = v.filter((r) => (r.dataItem + r.dataCategory + r.dataPrincipal + r.purpose).toLowerCase().includes(q));
    v.sort((a, b) => {
      let cmp = 0;
      if (sort.key === "riskLevel") {
        cmp = RISK_RANK[a.riskLevel] - RISK_RANK[b.riskLevel];
      } else {
        const av = a[sort.key].toLowerCase();
        const bv = b[sort.key].toLowerCase();
        cmp = av < bv ? -1 : av > bv ? 1 : 0;
      }
      return cmp * sort.dir;
    });
    return v;
  }, [rows, riskFilter, catFilter, query, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));
  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort.key !== key ? "none" : sort.dir === 1 ? "ascending" : "descending";
  const clearFilters = () => { setRiskFilter("All"); setCatFilter("All"); setQuery(""); };

  const removedCount = rows.filter((r) => decisions[r.id] === "no").length;

  return (
    <section className="dpack-report" aria-labelledby="reg-h">
      <header className="dpack-rh">
        <h3 id="reg-h">1 · Master Personal Data Register</h3>
        <p>A working inventory of the personal data your business is likely to handle. Every row is kept (<strong>Yes</strong>) by default — mark <strong>No</strong> for anything that doesn&rsquo;t apply. Nothing here is stored.</p>
      </header>

      <div className="dpack-controls">
        <div className="dpack-chips" role="group" aria-label="Filter by risk">
          {(["All", "Critical", "High", "Moderate", "Low"] as const).map((k) => (
            <button key={k} type="button" className={"dpack-chip" + (riskFilter === k ? " on" : "")}
              aria-pressed={riskFilter === k} onClick={() => setRiskFilter(k as RiskBand | "All")}>{k}</button>
          ))}
        </div>
        <select className="dpack-select" aria-label="Filter by category" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
        </select>
        <input className="dpack-search" type="search" placeholder="Search items…" value={query}
          onChange={(e) => setQuery(e.target.value)} aria-label="Search register" />
      </div>

      <p className="dpack-count" aria-live="polite">
        {view.length} of {rows.length} items
        {removedCount > 0 && <span className="dpack-count-dec"> · <strong>{removedCount}</strong> marked No</span>}
      </p>

      {view.length === 0 ? (
        <div className="dpack-empty">
          No items match these filters. <button type="button" className="dpack-link" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="dpack-tablewrap">
          <table className="dpack-table reg">
            <caption className="dpack-sr">Master personal data register — {rows.length} items</caption>
            <thead>
              <tr>
                <th scope="col" aria-sort={ariaSort("dataItem")}><button type="button" className="dpack-sortbtn" onClick={() => toggleSort("dataItem")}>Data item{sort.key === "dataItem" && <Caret dir={sort.dir} />}</button></th>
                <th scope="col">Principal</th>
                <th scope="col" aria-sort={ariaSort("dataCategory")}><button type="button" className="dpack-sortbtn" onClick={() => toggleSort("dataCategory")}>Category{sort.key === "dataCategory" && <Caret dir={sort.dir} />}</button></th>
                <th scope="col">Stored at</th>
                <th scope="col" aria-sort={ariaSort("riskLevel")}><button type="button" className="dpack-sortbtn" onClick={() => toggleSort("riskLevel")}>Risk{sort.key === "riskLevel" && <Caret dir={sort.dir} />}</button></th>
                <th scope="col">Keep?</th>
              </tr>
            </thead>
            <tbody>
              {view.map((row) => {
                const dec = decisionOf(row.id);
                return (
                  <tr key={row.id} className={dec === "no" ? "dpack-row declined" : "dpack-row"}>
                    <td className="dpack-item"><strong>{row.dataItem}</strong></td>
                    <td>{row.dataPrincipal}</td>
                    <td>{row.dataCategory}</td>
                    <td className="dpack-dim dpack-stored">{row.storedAt}</td>
                    <td><span className="dpack-band" style={{ color: bandColor(row.riskLevel) }}>● {row.riskLevel}</span></td>
                    <td className="dpack-decision">
                      <div className="dpack-yn" role="group" aria-label={`Keep ${row.dataItem}?`}>
                        <button type="button" className={"dpack-yn-btn dpack-yn-yes" + (dec === "yes" ? " on" : "")}
                          aria-pressed={dec === "yes"} onClick={() => setDec(row.id, "yes")}>Yes</button>
                        <button type="button" className={"dpack-yn-btn dpack-yn-no" + (dec === "no" ? " on" : "")}
                          aria-pressed={dec === "no"} onClick={() => setDec(row.id, "no")}>No</button>
                      </div>
                      <button type="button" className="dpack-link" onClick={() => setOpenRow(row)}>Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {openRow && (
        <RowDrawer row={openRow} risks={risks} retention={retention} onClose={() => setOpenRow(null)} />
      )}
    </section>
  );
}

function Caret({ dir }: { dir: 1 | -1 }) {
  return <span aria-hidden="true" className="dpack-caret">{dir === 1 ? "▲" : "▼"}</span>;
}

function RowDrawer({ row, risks, retention, onClose }: { row: RegisterRow; risks: RiskRow[]; retention: RetentionRule[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const linkedRisks = risks.filter((r) => row.linkedRiskIds.includes(r.riskId));
  const rule = retention.find((r) => r.retentionRuleId === row.retentionRuleId);

  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <div className="dpack-drawer-scrim" onClick={onClose}>
      <div className="dpack-drawer" role="dialog" aria-modal="true" aria-label={`Details — ${row.dataItem}`}
        tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dpack-drawer-x" onClick={onClose} aria-label="Close">✕</button>
        <h4>{row.dataItem}</h4>
        <p className="dpack-dim">{row.description}</p>
        <dl className="dpack-dl">
          <div><dt>What it is</dt><dd>{row.dataCategory} · {row.dataPrincipal}</dd></div>
          <div><dt>Why it matters</dt><dd>{row.riskReason}</dd></div>
          <div><dt>Where the suggestion came from</dt><dd>Engine-suggested from your niche — confirm before treating as final.</dd></div>
          <div><dt>Stored at (to confirm)</dt><dd>{row.storedAt}</dd></div>
          {row.externalRecipients.length > 0 && <div><dt>Shared with</dt><dd>{row.externalRecipients.join(", ")}</dd></div>}
          {rule && <div><dt>Linked retention rule</dt><dd>{rule.retentionTrigger} — {rule.status === "statutory_floor" ? rule.otherLaw?.period : "no statutory number; you set it"} <em>(Suggested — validate)</em></dd></div>}
          {linkedRisks.length > 0 && <div><dt>Linked risks</dt><dd>{linkedRisks.map((r) => r.risk).join("; ")}</dd></div>}
          <div><dt>Recommended next action</dt><dd>{row.recommendedAction}</dd></div>
        </dl>
      </div>
    </div>
  );
}
