"use client";
import { useMemo, useState } from "react";
import { resolveGroups } from "@/lib/discovery/engine";
import type { ItemGroup } from "@/lib/discovery/types";

const GROUP_META: Record<string, { tag: string; cls: string }> = {
  core: { tag: "Core", cls: "g-core" },
  operational: { tag: "Operational", cls: "g-op" },
  hidden: { tag: "Often-missed", cls: "g-hidden" },
};

export default function DataReview({
  niche,
  selected,
  setSelected,
}: {
  niche: string;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
}) {
  const groups = useMemo<ItemGroup[]>(() => resolveGroups(niche), [niche]);
  const [openItem, setOpenItem] = useState<string | null>(null);

  function toggle(id: string) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  }
  function toggleGroup(g: ItemGroup, on: boolean) {
    const s = new Set(selected);
    g.items.forEach((i) => (on ? s.add(i.id) : s.delete(i.id)));
    setSelected(s);
  }

  return (
    <div className="review">
      <p className="review-lead">
        These are the personal-data items a business like yours usually handles — the full list, so you can decide.
        <strong> Uncheck anything you don’t collect</strong>, and check any often-missed items you do.
      </p>
      {groups.map((g) => {
        const meta = GROUP_META[g.key] || GROUP_META.core;
        const onCount = g.items.filter((i) => selected.has(i.id)).length;
        const allOn = onCount === g.items.length;
        return (
          <div className={"dgroup " + meta.cls} key={g.key}>
            <div className="dgroup-h">
              <div className="dgroup-titles">
                <span className={"gtag " + meta.cls}>{meta.tag}</span>
                <h4>{g.title}</h4>
                <p>{g.sub}</p>
              </div>
              <button type="button" className="dgroup-all" onClick={() => toggleGroup(g, !allOn)}>
                {allOn ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="ditems">
              {g.items.map((it) => {
                const on = selected.has(it.id);
                const ex = openItem === it.id;
                return (
                  <div className={"ditem" + (on ? " on" : "")} key={it.id}>
                    <label className="ditem-main">
                      <input type="checkbox" checked={on} onChange={() => toggle(it.id)} />
                      <span className="ditem-box" aria-hidden="true" />
                      <span className="ditem-name">{it.item}</span>
                      {it.uiShort && <span className="ditem-ug">{it.uiShort}</span>}
                    </label>
                    <button
                      type="button"
                      className="ditem-info"
                      aria-expanded={ex}
                      aria-label={ex ? `Hide examples for ${it.item}` : `Show examples for ${it.item}`}
                      onClick={() => setOpenItem(ex ? null : it.id)}
                    >
                      {ex ? "–" : "i"}
                    </button>
                    {ex && (
                      <div className="ditem-ex">
                        <strong>Includes:</strong> {it.examples}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
