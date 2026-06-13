"use client";
import { TAG_GROUP } from "@/lib/discovery/engine";
import type { ItemGroup, ResolvedItem } from "@/lib/discovery/types";

const GROUP_META: Record<string, { tag: string; cls: string }> = {
  core: { tag: "Core", cls: "g-core" },
  operational: { tag: "Operational", cls: "g-op" },
  hidden: { tag: "Often-missed", cls: "g-hidden" },
};

function sensitivity(item: ResolvedItem): string[] {
  // friendly group names, deduped, preserving order
  const seen = new Set<string>();
  return (item.tags || [])
    .map((t) => TAG_GROUP[t])
    .filter((g): g is string => !!g && !seen.has(g) && (seen.add(g), true));
}

/**
 * Personal Data Map — a mini-RoPA inventory of the confirmed items, grouped by
 * bucket. One real <table> per group (semantics preserved on every viewport);
 * CSS turns rows into labelled cards on mobile via data-label. (spec §13)
 */
export default function PersonalDataMap({ groups }: { groups: ItemGroup[] }) {
  if (!groups.length) return null;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section className="pdmap" aria-labelledby="pdmap-h">
      <h4 className="rc-h" id="pdmap-h" style={{ marginBottom: 6 }}>
        Your personal data map
      </h4>
      <p className="pdmap-lead">
        The {total} data points you confirmed — what they are, who they’re about, why you hold them, and where they
        live. This is your starting data inventory (a DPDPA “record of processing”).
      </p>

      {groups.map((g) => {
        const meta = GROUP_META[g.key] || GROUP_META.core;
        return (
          <div className={"pdmap-group " + meta.cls} key={g.key}>
            <div className="pdmap-grouphead">
              <span className={"gtag " + meta.cls}>{meta.tag}</span>
              <span className="pdmap-groupcount">
                {g.items.length} data point{g.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="pdmap-scroll" tabIndex={0} role="group" aria-label={`${meta.tag} data, scrollable`}>
              <table className="pdmap-table">
                <thead>
                  <tr>
                    <th scope="col">Data point</th>
                    <th scope="col">Who</th>
                    <th scope="col">Why</th>
                    <th scope="col">Where it lives</th>
                    <th scope="col">Sensitivity</th>
                    <th scope="col">DPDPA duty</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((it) => (
                    <tr key={it.id}>
                      <td data-label="Data point">
                        <span className="pdmap-item">{it.item}</span>
                        {it.examples && <span className="pdmap-ex">{it.examples}</span>}
                      </td>
                      <td data-label="Who">{it.dataSubjects || "—"}</td>
                      <td data-label="Why">{it.processingPurposes || "—"}</td>
                      <td data-label="Where it lives">{it.sources || "—"}</td>
                      <td data-label="Sensitivity">
                        <span className="pdmap-chips">
                          {sensitivity(it).map((s) => (
                            <span className="pdmap-chip" key={s}>{s}</span>
                          ))}
                        </span>
                      </td>
                      <td data-label="DPDPA duty">
                        <span className="pdmap-chips">
                          {it.obligations.map((o) => (
                            <span className={"oblig-chip" + (o.startsWith("Children") ? " child" : "")} key={o}>
                              {o}
                            </span>
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
