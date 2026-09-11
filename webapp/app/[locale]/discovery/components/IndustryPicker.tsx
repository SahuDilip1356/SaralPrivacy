"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CATEGORIES, nichesInCategory, getNiche } from "@/lib/discovery/data";

interface Option {
  id: string;
  label: string;
  aliases?: string[];
  risk?: string;
}

/* Accessible combobox: button → listbox popup, with keyboard nav (§8). */
function Dropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
  searchable,
  showRisk,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: Option[];
  onChange: (id: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  showRisk?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0); // active option index for keyboard
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const sel = options.find((o) => o.id === value) || null;
  const term = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      term
        ? options.filter(
            (o) =>
              o.label.toLowerCase().includes(term) ||
              (o.aliases || []).some((a) => a.toLowerCase().includes(term)),
          )
        : options,
    [options, term],
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setActive(Math.max(0, shown.findIndex((o) => o.id === value)));
      if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setActive(0), [term]);

  // keep active option scrolled into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(id: string) {
    onChange(id);
    setOpen(false);
    setQ("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(shown.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) choose(shown[active].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQ("");
    }
  }

  return (
    <div className={"dd" + (disabled ? " disabled" : "")} ref={ref}>
      <div className="dd-label" id={`${baseId}-label`}>
        {label}
      </div>
      <button
        type="button"
        className={"dd-field" + (sel ? " filled" : "")}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={`${baseId}-label`}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={sel ? "dd-val" : "dd-ph"}>{sel ? sel.label : placeholder}</span>
        <span className="dd-caret" aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="dd-pop">
          {searchable && (
            <div className="dd-search">
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type to search…"
                aria-label="Search business types"
                aria-controls={listboxId}
                aria-activedescendant={shown[active] ? `${baseId}-opt-${shown[active].id}` : undefined}
              />
            </div>
          )}
          <div className="dd-list" role="listbox" id={listboxId} ref={listRef} aria-label={label}>
            {shown.length === 0 && <div className="dd-empty">No matches. Try a broader word.</div>}
            {shown.map((o, i) => (
              <button
                type="button"
                key={o.id}
                id={`${baseId}-opt-${o.id}`}
                data-idx={i}
                role="option"
                aria-selected={o.id === value}
                className={"dd-item" + (o.id === value ? " on" : "") + (i === active ? " active" : "")}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o.id)}
              >
                <span>{o.label}</span>
                {showRisk && o.risk && (
                  <span className={"risk-dot r-" + o.risk} title={o.risk + " baseline risk"} aria-hidden="true" />
                )}
                {o.id === value && <span className="dd-tick" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
          {searchable && (
            <div className="dd-foot">
              {shown.length} business type{shown.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IndustryPicker({
  value,
  industry,
  onIndustry,
  onPick,
}: {
  value: string | null;
  industry: string | null;
  onIndustry: (catId: string) => void;
  onPick: (nicheId: string) => void;
}) {
  const cats: Option[] = CATEGORIES.map((c) => ({ id: c.id, label: c.name }));
  const curCat = value ? getNiche(value)?.cat : undefined;
  const indVal = industry || curCat || null;
  const niches: Option[] = indVal
    ? nichesInCategory(indVal).map((n) => ({ id: n.id, label: n.name, aliases: n.aliases, risk: n.risk }))
    : [];

  return (
    <div className="picker2">
      <Dropdown
        label="1 · Industry group"
        placeholder="Choose your industry…"
        value={indVal}
        options={cats}
        onChange={onIndustry}
      />
      <Dropdown
        label="2 · Business type"
        placeholder={indVal ? "Choose your business type…" : "Select an industry first"}
        value={value}
        options={niches}
        onChange={onPick}
        disabled={!indVal}
        searchable
        showRisk
      />
    </div>
  );
}
