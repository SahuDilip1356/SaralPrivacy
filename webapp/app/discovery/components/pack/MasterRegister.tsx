"use client";
// Report 1 — Master Personal Data Register. Read-first table (S3) with light
// interactivity (S4): sort, risk/category filter chips, inline Confirm, and a
// focus-trapped detail drawer. NOT a spreadsheet grid — that's Phase C.
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import type { RegisterRow, RiskRow, RetentionRule } from "@/lib/discovery/register";
import { bandColor } from "@/lib/discovery/engine";
import type { RiskBand } from "@/lib/discovery/types";

type SortKey = "dataItem" | "dataCategory" | "riskLevel";
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
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [riskFilter, setRiskFilter] = useState<RiskBand | "All">("All");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "riskLevel", dir: -1 });
  const [openRow, setOpenRow] = useState<RegisterRow | null>(null);

  const categories = useMemo(() => ["All", ...new Set(rows.map((r) => r.dataCategory))], [rows]);

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

  return (
    <section className="dpack-report" aria-labelledby="reg-h">
      <header className="dpack-rh">
        <h3 id="reg-h">1 · Master Personal Data Register</h3>
        <p>A working inventory of the personal data your business is likely to handle. Confirm or edit each row — nothing here is stored.</p>
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

      <p className="dpack-count" aria-live="polite">{view.length} of {rows.length} items</p>

      {view.length === 0 ? (
        <div className="dpack-empty">
          No items match these filters. <button type="button" className="dpack-link" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="dpack-tablewrap">
          <table className="dpack-table">
            <caption className="dpack-sr">Master personal data register — {rows.length} items</caption>
            <thead>
              <tr>
                <th scope="col" aria-sort={ariaSort("dataItem")}><button type="button" className="dpack-sortbtn" onClick={() => toggleSort("dataItem")}>Data item{sort.key === "dataItem" && <Caret dir={sort.dir} />}</button></th>
                <th scope="col">Principal</th>
                <th scope="col" aria-sort={ariaSort("dataCategory")}><button type="button" className="dpack-sortbtn" onClick={() => toggleSort("dataCategory")}>Category{sort.key === "dataCategory" && <Caret dir={sort.dir} />}</button></th>
                <th scope="col">Stored at</th>
                <th scope="col" aria-sort={ariaSort("riskLevel")}><button type="button" className="dpack-sortbtn" onClick={() => toggleSort("riskLevel")}>Risk{sort.key === "riskLevel" && <Caret dir={sort.dir} />}</button></th>
                <th scope="col">Status</th>
                <th scope="col"><span className="dpack-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {view.map((row) => {
                const isConfirmed = confirmed.has(row.id);
                return (
                  <tr key={row.id}>
                    <td className="dpack-item"><strong>{row.dataItem}</strong></td>
                    <td>{row.dataPrincipal}</td>
                    <td>{row.dataCategory}</td>
                    <td className="dpack-dim">{row.storedAt}</td>
                    <td><span className="dpack-band" style={{ color: bandColor(row.riskLevel) }}>● {row.riskLevel}</span></td>
                    <td><span className={"dpack-status" + (isConfirmed ? " done" : "")}>{isConfirmed ? "Confirmed" : "Suggested"}</span></td>
                    <td className="dpack-actions">
                      <button type="button" className="dpack-confirm" aria-disabled={isConfirmed} disabled={isConfirmed}
                        onClick={() => setConfirmed((s) => new Set(s).add(row.id))}>{isConfirmed ? "✓" : "Confirm"}</button>
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
