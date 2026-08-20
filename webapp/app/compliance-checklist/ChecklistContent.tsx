"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Shield,
  CheckSquare,
  FileText,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  BookOpen,
  Scale,
  Info,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  part1Sections,
  part2Sections,
  statusLabels,
  keyGuardrails,
  DISCLAIMER,
  type ItemType,
  type ChecklistItem,
  type ChecklistSection,
} from "@/lib/data/compliance-checklist";
import { linkifyText } from "@/lib/linkifyText";

// ─── Badge config ────────────────────────────────────────────���───────────────

const BADGE: Record<ItemType, { label: string; className: string }> = {
  statutory: {
    label: "Statutory",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  rule: {
    label: "Rule",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  conditional: {
    label: "Conditional",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  operational: {
    label: "Operational",
    className: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  "best-practice": {
    label: "Best Practice",
    className: "bg-purple-100 text-purple-700 border border-purple-200",
  },
};

const BORDER: Record<ItemType, string> = {
  statutory: "border-l-red-400",
  rule: "border-l-blue-400",
  conditional: "border-l-amber-400",
  operational: "border-l-slate-300",
  "best-practice": "border-l-purple-400",
};

// ─── Filter types ─────────────────────────────────────────────────────────────

type Filter = "all" | "part1" | "part2";

// ─── Single checklist item card ───────────────────────────────────────────────

function ChecklistItemCard({ item }: { item: ChecklistItem }) {
  const badge = BADGE[item.type];
  const border = BORDER[item.type];

  return (
    <div
      className={`border-l-4 ${border} bg-white rounded-r-xl border border-l-4 border-slate-100 p-4 mb-3 last:mb-0`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 font-mono">
            {item.id}
          </span>
          <span className="text-xs font-semibold text-navy-700">
            {item.subsection.replace(/^\S+\s/, "")}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Act reference */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <Scale size={11} className="text-slate-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-500 font-mono">
          {item.reference}
        </span>
      </div>

      {/* Requirement */}
      <p className="text-sm text-slate-700 leading-relaxed mb-2.5">
        {linkifyText(item.requirement)}
      </p>

      {/* Guardrail */}
      <div className="flex gap-2 bg-slate-50 rounded-lg px-3 py-2">
        <Shield
          size={13}
          className="text-teal-500 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-xs text-slate-600 leading-relaxed">
          {linkifyText(item.guardrail)}
        </p>
      </div>
    </div>
  );
}

// ─── Section accordion item ───────────────────────────────────────────────────

function ChecklistSectionAccordion({
  section,
  defaultOpen,
}: {
  section: ChecklistSection;
  defaultOpen?: boolean;
}) {
  const totalItems = section.items.length;
  const typeCount = section.items.reduce<Partial<Record<ItemType, number>>>(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <Accordion.Item
      value={`${section.part}-${section.sectionId}`}
      className="border border-slate-200 rounded-xl overflow-hidden mb-3"
    >
      <Accordion.Header>
        <Accordion.Trigger className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-slate-50 transition-colors group text-left">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {section.sectionId.replace("O", "")}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-navy-700 group-hover:text-green-900 transition-colors">
                {section.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] text-slate-400">
                  {totalItems} {totalItems === 1 ? "control" : "controls"}
                </span>
                {typeCount.statutory && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                    {typeCount.statutory} statutory
                  </span>
                )}
                {typeCount.rule && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {typeCount.rule} rule
                  </span>
                )}
                {typeCount.conditional && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold">
                    {typeCount.conditional} conditional
                  </span>
                )}
                {typeCount.operational && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                    {typeCount.operational} operational
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown
            size={16}
            className="text-slate-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordion-down_0.2s_ease-out] data-[state=closed]:animate-[accordion-up_0.2s_ease-out]">
        <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100">
          {section.items.map((item) => (
            <ChecklistItemCard key={item.id} item={item} />
          ))}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

// ─── Mid-page CTA banner ──────────────────────────────────────────────────────

function MidPageCTA() {
  return (
    <div className="bg-navy-700 rounded-2xl p-6 my-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="flex-1">
        <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">
          Free Compliance Assessment
        </p>
        <h3 className="text-white text-lg font-semibold mb-1">
          See exactly where your business stands
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          The checklist tells you what the law requires. The assessment tells
          you which gaps apply to your business — with a personalised risk score
          and next actions.
        </p>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Link
          href="/assessment"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          aria-label="Take the free DPDPA compliance assessment"
        >
          Take Free Assessment <ArrowRight size={14} />
        </Link>
        <Link
          href="/white-paper"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          aria-label="Download the DPDPA guide"
        >
          Download the Guide <FileText size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Status legend ──────────────────────────────────────────────────────────��─

function StatusLegend() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Info size={13} />
        How to read this checklist
      </h2>
      <div className="flex flex-wrap gap-2">
        {statusLabels.map((s) => (
          <div key={s.type} className="flex items-center gap-2 group">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${s.badgeClass}`}
            >
              {s.label}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {s.meaning}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
        {statusLabels.map((s) => (
          <div key={s.type} className="flex items-start gap-2 sm:hidden">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${s.badgeClass}`}
            >
              {s.label}
            </span>
            <span className="text-xs text-slate-500">{s.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Key guardrails ───────────────────────────────────────────────────────────

function KeyGuardrails() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-teal-500" />
        <h2 className="text-base font-semibold text-navy-700">
          Key Guardrails for This Checklist
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keyGuardrails.map((g) => (
          <div
            key={g.id}
            className="bg-white border-l-4 border-l-teal-400 border border-slate-100 rounded-r-xl p-4"
          >
            <h3 className="text-sm font-semibold text-navy-700 mb-1.5">
              {g.id}. {g.heading}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {linkifyText(g.body)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Related resources ────────────────────────────────────────────────────────

function RelatedResources() {
  const resources = [
    {
      icon: CheckSquare,
      label: "Free Risk Assessment",
      desc: "Personalised compliance score for your business",
      href: "/assessment",
      accent: "text-green-500",
      bg: "bg-green-50",
      cta: "Start assessment",
    },
    {
      icon: FileText,
      label: "Download the Guide",
      desc: "DPDPA guide — Act 2023 + Rules 2025",
      href: "/white-paper",
      accent: "text-navy-600",
      bg: "bg-navy-50",
      cta: "Download free",
    },
    {
      icon: ClipboardList,
      label: "Compliance Templates",
      desc: "5 ready-to-use DPDPA templates for your business",
      href: "/resources",
      accent: "text-teal-600",
      bg: "bg-teal-50",
      cta: "Get templates",
    },
    {
      icon: BookOpen,
      label: "DPDPA Learning Hub",
      desc: "Plain-English guides on every area of the Act",
      href: "/learn",
      accent: "text-indigo-600",
      bg: "bg-indigo-50",
      cta: "Start learning",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-navy-700 mb-4">
        Related Compliance Resources
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map(({ icon: Icon, label, desc, href, accent, bg, cta }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all group"
            aria-label={`${label} — ${desc}`}
          >
            <div
              className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}
            >
              <Icon size={17} className={accent} />
            </div>
            <h3 className="text-sm font-semibold text-navy-700 group-hover:text-green-900 transition-colors mb-1">
              {label}
            </h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{desc}</p>
            <span className="text-xs font-semibold text-green-800 flex items-center gap-1 group-hover:gap-2 transition-all">
              {cta} <ArrowRight size={11} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────��──

export default function ChecklistContent() {
  const [filter, setFilter] = useState<Filter>("all");

  const filterButtons: { id: Filter; label: string; count: string }[] = [
    {
      id: "all",
      label: "All Controls",
      count: `${
        part1Sections.reduce((a, s) => a + s.items.length, 0) +
        part2Sections.reduce((a, s) => a + s.items.length, 0)
      }`,
    },
    {
      id: "part1",
      label: "Statutory & Rules",
      count: `${part1Sections.reduce((a, s) => a + s.items.length, 0)}`,
    },
    {
      id: "part2",
      label: "Operational Evidence",
      count: `${part2Sections.reduce((a, s) => a + s.items.length, 0)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-700/40 border border-green-500/50 flex items-center justify-center">
              <CheckSquare size={20} className="text-green-300" />
            </div>
            <span className="text-green-300 text-xs font-semibold uppercase tracking-widest">
              Compliance Checklist
            </span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
              DPDPA Compliance Checklist
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-2">
              Based on the Digital Personal Data Protection Act, 2023 and DPDP
              Rules, 2025
            </p>
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 max-w-2xl mt-4">
              <p className="text-slate-200 text-sm leading-relaxed">
                Designed for organisations that collect, store, process, share,
                or handle digital personal data in India — or process such data
                outside India in connection with offering goods or services to{" "}
                <Link
                  href="/glossary#data-principal"
                  className="text-green-300 hover:text-green-200 underline decoration-dotted"
                >
                  Data Principals
                </Link>{" "}
                in India. The checklist separates legal obligations from
                operational evidence controls. The Act tells you what must be
                true; the Rules explain how; the evidence controls prove the
                wiring is connected.
              </p>
              <p className="text-amber-300 text-xs mt-3 font-medium">
                ⚠ Compliance-readiness guide only — not legal advice.
                Organisations in regulated sectors (banking, telecom, insurance,
                health, payments, employment) should validate sector-specific
                obligations separately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Status legend */}
        <StatusLegend />

        {/* Filter pills */}
        <div
          className="flex items-center gap-2 mb-6 flex-wrap"
          role="group"
          aria-label="Filter checklist sections"
        >
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                filter === btn.id
                  ? "bg-navy-700 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-navy-300 hover:text-navy-700"
              }`}
              aria-pressed={filter === btn.id}
            >
              {btn.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  filter === btn.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Section 1: Statutory & Rule-Based ─────────────────────── */}
        {(filter === "all" || filter === "part1") && (
          <section aria-labelledby="section1-heading" className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100">
                <Scale size={16} className="text-red-600" />
              </div>
              <div>
                <h2
                  id="section1-heading"
                  className="text-lg font-bold text-navy-700"
                >
                  Section 1 — Statutory and Rule-Based DPDPA Compliance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  15 sections · {part1Sections.reduce((a, s) => a + s.items.length, 0)} controls ·{" "}
                  <Link
                    href="/learn/dpdp-rules-2025-plain-english-guide"
                    className="text-blue-600 hover:underline"
                  >
                    DPDP Rules 2025
                  </Link>{" "}
                  +{" "}
                  <Link
                    href="/learn/dpdp-act-2023"
                    className="text-blue-600 hover:underline"
                  >
                    DPDPA Act 2023
                  </Link>
                </p>
              </div>
            </div>

            <Accordion.Root
              type="multiple"
              defaultValue={["1-1"]}
              className="space-y-0"
            >
              {part1Sections.map((section) => (
                <ChecklistSectionAccordion
                  key={`${section.part}-${section.sectionId}`}
                  section={section}
                />
              ))}
            </Accordion.Root>
          </section>
        )}

        {/* ── Mid-page CTA ───────────────────────────────────────────── */}
        {(filter === "all" || filter === "part1") && <MidPageCTA />}

        {/* ── Section 2: Operational Evidence ───────────────────────── */}
        {(filter === "all" || filter === "part2") && (
          <section aria-labelledby="section2-heading" className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                <ClipboardList size={16} className="text-slate-600" />
              </div>
              <div>
                <h2
                  id="section2-heading"
                  className="text-lg font-bold text-navy-700"
                >
                  Section 2 — Operational Evidence and Governance Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  12 sections · {part2Sections.reduce((a, s) => a + s.items.length, 0)} controls ·
                  These are the evidence controls that prove statutory compliance is operational,
                  not just documented.
                </p>
              </div>
            </div>

            <Accordion.Root
              type="multiple"
              defaultValue={["2-O1"]}
              className="space-y-0"
            >
              {part2Sections.map((section) => (
                <ChecklistSectionAccordion
                  key={`${section.part}-${section.sectionId}`}
                  section={section}
                />
              ))}
            </Accordion.Root>
          </section>
        )}

        {/* ── Key Guardrails ─────────────────────────────────────────── */}
        {filter === "all" && <KeyGuardrails />}

        {/* ── Related Resources ──────────────────────────────────────── */}
        <RelatedResources />

        {/* ── Disclaimer ─────────────────────────────────────────────── */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-5 py-4 text-xs text-slate-500 leading-relaxed mt-4">
          <strong className="text-slate-600">Disclaimer — </strong>
          {DISCLAIMER}
        </div>

        {/* ── Bottom spacer ──────────────────────────────────────────── */}
        <div className="h-10" />
      </div>
    </div>
  );
}
