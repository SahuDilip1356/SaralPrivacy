"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { TERMS, CATEGORIES } from "./glossaryData";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryClient() {
  const [query, setQuery]       = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((t) => {
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      const matchesQuery    = !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) || t.section.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, activeCategory]);

  // Letters that have at least one visible term
  const activeLetters = useMemo(
    () => new Set(filtered.map((t) => t.term[0].toUpperCase())),
    [filtered]
  );

  // Group by first letter for rendering
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(term);
    }
    return map;
  }, [filtered]);

  const termMap = useMemo(() => Object.fromEntries(TERMS.map((t) => [t.id, t.term])), []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-slate-300">Glossary</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-snug">
            DPDPA Glossary
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
            {TERMS.length} key terms from the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.
            Every definition cites the exact section of the statute.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-[calc(4rem+32px)] z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-lg">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search terms, sections, or definitions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-navy-400 focus:outline-none transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? "bg-navy-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-navy-700 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* A–Z jump strip */}
        {!query && (
          <div className="flex flex-wrap gap-1 mb-8">
            {ALPHABET.map((letter) => (
              activeLetters.has(letter) ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold text-navy-700 bg-white border border-slate-200 hover:bg-navy-700 hover:text-white hover:border-navy-700 transition-colors"
                >
                  {letter}
                </a>
              ) : (
                <span
                  key={letter}
                  className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold text-slate-300 bg-slate-50"
                >
                  {letter}
                </span>
              )
            ))}
          </div>
        )}

        {/* Results count */}
        {query && (
          <p className="text-sm text-slate-500 mb-6">
            {filtered.length === 0
              ? "No terms match your search."
              : `${filtered.length} term${filtered.length === 1 ? "" : "s"} found`}
          </p>
        )}

        {/* Term list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium mb-2">No terms found</p>
            <p className="text-sm">Try a different search or select a different category.</p>
          </div>
        ) : (
          <dl className="space-y-0">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, terms]) => (
              <div key={letter}>
                {/* Letter heading */}
                <div id={`letter-${letter}`} className="sticky top-[calc(4rem+32px+108px)] bg-slate-50 z-10 py-2 mb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{letter}</span>
                </div>

                {terms.map((term) => (
                  <div
                    key={term.id}
                    id={term.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 mb-3 scroll-mt-40"
                  >
                    {/* Term + section badge */}
                    <div className="flex flex-wrap items-start gap-3 mb-2">
                      <dt className="text-base font-bold text-navy-700 leading-snug flex-1">
                        {term.term}
                      </dt>
                      <span className="shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {term.section}
                      </span>
                    </div>

                    {/* Definition */}
                    <dd className="text-sm text-slate-700 leading-relaxed mb-3">
                      {term.definition}
                    </dd>

                    {/* Related terms */}
                    {term.relatedIds && term.relatedIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">See also:</span>
                        {term.relatedIds.map((id) =>
                          termMap[id] ? (
                            <a
                              key={id}
                              href={`#${id}`}
                              className="text-xs text-navy-600 hover:text-navy-800 underline underline-offset-2 transition-colors"
                            >
                              {termMap[id]}
                            </a>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </dl>
        )}

        {/* Disclaimer */}
        <div className="mt-10 p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 leading-relaxed">
          <strong>Statutory reference note:</strong> All definitions are sourced from the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025. Section numbers cited are those of the Act unless stated otherwise. This glossary is for educational reference only and does not constitute legal advice. Consult a qualified lawyer for compliance guidance.
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-4">Ready to check your compliance posture?</p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            Take the Free DPDPA Assessment →
          </Link>
        </div>
      </div>
    </div>
  );
}
