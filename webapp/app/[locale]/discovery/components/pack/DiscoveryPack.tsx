"use client";
// The Personal Data Discovery Pack — the three-report handoff that replaces the old
// single result panel's tail. Pure presentation over one DiscoveryRegister object.
import type { DiscoveryRegister } from "@/lib/discovery/register";
import { bandColor } from "@/lib/discovery/engine";
import MasterRegister from "./MasterRegister";
import HandoffCTA from "./HandoffCTA";

export default function DiscoveryPack({ register }: { register: DiscoveryRegister }) {
  const { counts, rows, retention, risks, actions } = register;
  if (rows.length === 0) {
    return (
      <div className="dpack-empty-pack">
        No personal-data items confirmed yet. Go back and confirm what your business handles to generate your pack.
      </div>
    );
  }

  return (
    <div className="dpack">
      <header className="dpack-head">
        <div className="dpack-eyebrow">Your Personal Data Discovery Pack is ready</div>
        <div className="dpack-tiles">
          <Tile n={counts.items} label="personal-data items" />
          <Tile n={counts.categories} label="data categories" />
          <Tile n={counts.storageLocations} label="storage locations" />
          <Tile n={counts.recipients} label="external recipients" zero="None identified" />
          <Tile n={counts.highRisk} label="high-risk findings" accent />
          <Tile n={counts.retentionToConfirm} label="retention rules to confirm" />
        </div>
      </header>

      <MasterRegister rows={rows} risks={risks} retention={retention} />

      {/* Report 2 — Retention Matrix */}
      <section className="dpack-report" aria-labelledby="ret-h">
        <header className="dpack-rh">
          <h3 id="ret-h">2 · Retention Matrix</h3>
          <p>How long each category may need to be kept. DPDPA sets no period — a firm number only ever comes from another law. Everything here is <strong>Suggested — validate before adoption</strong>.</p>
        </header>
        <div className="dpack-tablewrap">
          <table className="dpack-table">
            <caption className="dpack-sr">Retention matrix</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Trigger (clock starts)</th>
                <th scope="col">As per DPDPA</th>
                <th scope="col">As per other law</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {retention.map((r) => (
                <tr key={r.retentionRuleId}>
                  <td className="dpack-item"><strong>{r.dataItem}</strong></td>
                  <td>{r.retentionTrigger}</td>
                  <td className="dpack-dim">{r.dpdpaBaseline}</td>
                  <td>{r.otherLaw ? <><strong>{r.otherLaw.period}</strong> <span className="dpack-dim">— {r.otherLaw.citation}</span></> : <span className="dpack-dim">None identified — erase when purpose served</span>}</td>
                  <td>
                    <span className={"dpack-flag " + r.status}>{r.status === "statutory_floor" ? "Statutory floor" : "You determine"}</span>
                    <span className="dpack-suggested">Suggested — validate</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Report 3 — Data Risk Register */}
      <section className="dpack-report" aria-labelledby="risk-h">
        <header className="dpack-rh">
          <h3 id="risk-h">3 · Data Risk Register</h3>
          <p>What can go wrong, most urgent first — and the question each risk raises for your data map.</p>
        </header>
        {risks.length === 0 ? (
          <p className="dpack-dim">No high-priority risks identified from the items you confirmed.</p>
        ) : (
          <ul className="dpack-risklist">
            {risks.map((r) => (
              <li key={r.riskId} className="dpack-risk">
                <div className="dpack-risk-top">
                  <span className="dpack-band" style={{ color: bandColor(r.severity) }}>● {r.severity}</span>
                  <span className={"dpack-prio " + r.priority.toLowerCase()}>{r.priority}</span>
                  <span className="dpack-risk-cat">{r.category}</span>
                </div>
                <h4>{r.risk}</h4>
                <p className="dpack-dim">{r.reason}</p>
                <p className="dpack-control"><strong>Control:</strong> {r.recommendedControl}</p>
                <p className="dpack-bridge">→ For your data map: {r.suggestedMappingQuestion}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Prioritised Action Summary */}
      {(actions.immediate.length + actions.days30.length + actions.days90.length) > 0 && (
        <section className="dpack-report" aria-labelledby="act-h">
          <header className="dpack-rh"><h3 id="act-h">Prioritised actions</h3><p>Where to start — no more than five per horizon.</p></header>
          <div className="dpack-actions-grid">
            <ActionCol title="Immediate" items={actions.immediate} />
            <ActionCol title="Next 30 days" items={actions.days30} />
            <ActionCol title="Next 90 days" items={actions.days90} />
          </div>
        </section>
      )}

      <HandoffCTA register={register} />

      <p className="dpack-disclaimer">
        You have identified the personal data your business is likely to handle. We have organised it into a working
        register and suggested retention matrix. Review the assumptions before treating the outputs as final. This is a
        practical starting point, not legal advice.
      </p>
    </div>
  );
}

function Tile({ n, label, accent, zero }: { n: number; label: string; accent?: boolean; zero?: string }) {
  return (
    <div className={"dpack-tile" + (accent ? " accent" : "")}>
      <span className="dpack-tile-n">{n}</span>
      <span className="dpack-tile-l">{n === 0 && zero ? zero : label}</span>
    </div>
  );
}

function ActionCol({ title, items }: { title: string; items: { action: string; reason: string }[] }) {
  return (
    <div className="dpack-actcol">
      <div className="dpack-actcol-h">{title}</div>
      {items.length === 0 ? <p className="dpack-dim">Nothing flagged.</p> : (
        <ol>{items.map((a, i) => <li key={i}>{a.action}</li>)}</ol>
      )}
    </div>
  );
}
