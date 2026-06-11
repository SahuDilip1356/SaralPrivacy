import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Scale } from "lucide-react";
import { articleSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";
import { dpdpAct2023, type ActSection, type ActChapter } from "@/content/dpdp-act-2023";
import { linkifyText } from "@/lib/linkifyText";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS } from "@/lib/content-freshness";

export const metadata: Metadata = {
  title: "DPDPA 2023: Full Act Text with Plain-English Guide — Section by Section",
  description:
    "Read the Digital Personal Data Protection Act, 2023 in full. Official text of all 44 sections across 9 chapters with plain-English summaries and key takeaways for Indian businesses.",
  alternates: { canonical: "https://saralprivacy.com/learn/dpdp-act-2023" },
  openGraph: {
    type: "article",
    url: "https://saralprivacy.com/learn/dpdp-act-2023",
    title: "DPDPA 2023: Full Act Text with Plain-English Guide",
    description:
      "Official text of the Digital Personal Data Protection Act, 2023 — all 44 sections with plain-English summaries and key takeaways.",
  },
};

// ─── Left sidebar nav ─────────────────────────────────────────────────────────

const guideNav = [
  { slug: "dpdp-act-2023", label: "DPDP Act 2023 (Full Text)", href: "/learn/dpdp-act-2023", active: true },
  { slug: "dpdp-rules-2025-plain-english-guide", label: "DPDP Rules 2025", href: "/learn/dpdp-rules-2025-plain-english-guide" },
  { slug: "what-is-dpdpa", label: "What is DPDPA?" },
  { slug: "applicability", label: "Who It Applies To" },
  { slug: "key-terms", label: "Must Learn: Key Terms" },
  { slug: "glossary", label: "Glossary (50+ Terms)", href: "/glossary" },
  { slug: "consent", label: "Consent" },
  { slug: "notice", label: "Notice Requirements" },
  { slug: "rights", label: "Rights" },
  { slug: "duties", label: "Business Duties" },
  { slug: "childrens-data", label: "Children's Data" },
  { slug: "data-breach", label: "Data Breach" },
  { slug: "penalties", label: "Penalties", href: "/penalty-calculator" },
  { slug: "retention", label: "Retention" },
  { slug: "cross-border", label: "Cross-Border" },
  { slug: "myths", label: "Myth vs Fact" },
];

// ─── Right TOC ────────────────────────────────────────────────────────────────

const tocChapters = dpdpAct2023.chapters.map((ch) => ({
  chapterLabel: `Ch. ${ch.chapterNumber}: ${ch.chapterTitle}`,
  chapterId: `chapter-${ch.chapterNumber}`,
  sections: ch.sections.map((s) => ({
    id: `section-${s.sectionNumber}`,
    label: `#${s.sectionNumber}. ${s.title}`,
  })),
}));

// ─── Helper components ────────────────────────────────────────────────────────

function OfficialText({ text }: { text: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mt-3">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
        Official Text
      </p>
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {linkifyText(text)}
      </div>
    </div>
  );
}

function PlainEnglishBox({ text }: { text: string }) {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg px-4 py-3 mt-3">
      <p className="text-[11px] font-semibold text-green-600 uppercase tracking-widest mb-1.5">
        Plain English
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{linkifyText(text)}</p>
    </div>
  );
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
        Key Takeaways
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
            <span>{linkifyText(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionCard({ section }: { section: ActSection }) {
  return (
    <section
      id={`section-${section.sectionNumber}`}
      className="scroll-mt-24 pt-7 pb-6 border-b border-slate-100 last:border-0"
    >
      <h3 className="text-base font-bold text-navy-700">
        <span className="text-green-500 font-semibold mr-2">#{section.sectionNumber}.</span>
        {section.title}
      </h3>
      <OfficialText text={section.officialText} />
      {section.plainEnglish && <PlainEnglishBox text={section.plainEnglish} />}
      {section.keyTakeaways && section.keyTakeaways.length > 0 && (
        <KeyTakeaways items={section.keyTakeaways} />
      )}
    </section>
  );
}

function ChapterBlock({ chapter }: { chapter: ActChapter }) {
  return (
    <div id={`chapter-${chapter.chapterNumber}`} className="scroll-mt-24">
      <div className="bg-navy-700 text-white rounded-xl px-5 py-4 mb-1 mt-10 first:mt-0">
        <p className="text-xs font-semibold text-green-300 uppercase tracking-widest mb-0.5">
          Chapter {chapter.chapterNumber}
        </p>
        <h2 className="text-lg font-bold">{chapter.chapterTitle}</h2>
        <p className="text-xs text-slate-300 mt-1">
          {chapter.sections.length} section{chapter.sections.length !== 1 ? "s" : ""} —{" "}
          #{chapter.sections[0].sectionNumber}
          {chapter.sections.length > 1
            ? ` to #${chapter.sections[chapter.sections.length - 1].sectionNumber}`
            : ""}
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {chapter.sections.map((section) => (
          <SectionCard key={section.sectionNumber} section={section} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DpdpAct2023Page() {
  const { schedule } = dpdpAct2023;

  return (
    <>
      {articleSchema(
        "DPDPA 2023: Full Act Text with Plain-English Guide — Section by Section",
        "Read the Digital Personal Data Protection Act, 2023 in full. Official text of all 44 sections across 9 chapters with plain-English summaries and key takeaways for Indian businesses.",
        "https://saralprivacy.com/learn/dpdp-act-2023",
        "2026-04-30"
      )}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com/learn/dpdp-act-2023', 'DPDPA 2023: Full Act Text with Plain-English Guide — Section by Section')}
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "DPDPA Guide", url: "https://saralprivacy.com/learn" },
        { name: "DPDP Act 2023 — Full Text", url: "https://saralprivacy.com/learn/dpdp-act-2023" },
      ])}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_240px] gap-8">

            {/* ── Left sidebar ── */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  DPDPA Guide
                </h3>
                <nav className="space-y-1">
                  {guideNav.map((t) => (
                    <Link
                      key={t.slug}
                      href={t.href ?? `/learn/${t.slug}`}
                      className={
                        t.active
                          ? "block px-3 py-2 rounded-lg text-sm bg-green-50 text-green-600 font-semibold"
                          : "block px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-navy-700 hover:bg-slate-50 transition-colors"
                      }
                    >
                      {t.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* ── Main content ── */}
            <div className="min-w-0">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-5 transition-colors"
              >
                <ArrowLeft size={14} />
                DPDPA Guide
              </Link>

              {/* Hero */}
              <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
                <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-full px-3 py-1 mb-4">
                  <Scale size={12} className="text-navy-600" />
                  <span className="text-navy-600 text-xs font-semibold">Act Reference</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 mb-3">
                  Digital Personal Data Protection Act, 2023
                </h1>
                <Byline lastReviewed={FRESHNESS.learn} className="mb-3" />
                <AnswerBlock
                  answer="The Digital Personal Data Protection Act, 2023 is India's primary law governing how digital personal data is collected, used, stored, shared, and deleted. It has 9 chapters and 44 sections plus a Schedule of penalties up to ₹250 crore. The DPDP Rules, 2025 were notified on 14 November 2025, and implementation is phased. This page reproduces the full official text with plain-English summaries for each section."
                  className="mb-4"
                />
                <p className="text-slate-600 text-base leading-relaxed mb-2">
                  This page presents the full text of the{" "}
                  <strong>Digital Personal Data Protection Act, 2023</strong> — all 9 chapters and
                  44 sections — alongside plain-English summaries and key takeaways for each
                  section. Scroll to read in order, or use the table of contents on the right to
                  jump to any section.
                </p>
                <p className="text-xs text-slate-400 mb-5">
                  Act No. {dpdpAct2023.actNumber} · Presidential assent: {dpdpAct2023.assentDate} ·
                  Source: {dpdpAct2023.source} · Last verified: {dpdpAct2023.lastVerified}
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-4 py-3 text-sm text-slate-700">
                  <strong className="text-amber-700">Educational use only.</strong> Official text
                  is reproduced for reference. Plain-English summaries are editorial additions by
                  SaralPrivacy and are not legal interpretations. Consult a qualified legal
                  professional for compliance advice.
                </div>

                {/* What this page covers */}
                <div className="mt-8">
                  <h2 className="text-base font-bold text-navy-700 mb-3">
                    What this page covers
                  </h2>
                  <ul className="space-y-2">
                    {[
                      "All 9 chapters — from Preliminary to Miscellaneous",
                      "All 44 sections — official text reproduced verbatim",
                      "Plain-English summaries for business-critical sections",
                      "Key Takeaways for each section with real-world relevance",
                      "The Schedule — 7 penalty items with rupee amounts",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Chapters ── */}
              <div className="bg-white rounded-xl border border-slate-200 px-7 py-6 mb-5">
                {dpdpAct2023.chapters.map((chapter) => (
                  <ChapterBlock key={chapter.chapterNumber} chapter={chapter} />
                ))}
              </div>

              {/* ── Schedule ── */}
              <div
                id="schedule"
                className="scroll-mt-24 bg-white rounded-xl border border-slate-200 px-7 py-6 mb-5"
              >
                <div className="bg-navy-700 text-white rounded-xl px-5 py-4 mb-6">
                  <p className="text-xs font-semibold text-green-300 uppercase tracking-widest mb-0.5">
                    Schedule
                  </p>
                  <h2 className="text-lg font-bold">{schedule.title}</h2>
                  <p className="text-xs text-slate-300 mt-1">{schedule.reference}</p>
                </div>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  The Schedule sets out the maximum financial penalties for different categories of
                  breach under the Act. The Data Protection Board determines the actual penalty
                  within these ceilings after considering the factors listed in Section 33(2).
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border border-slate-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                          S. No.
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Breach
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Maximum Penalty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedule.rows.map((row) => (
                        <tr key={row.serialNumber} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-medium align-top">
                            {row.serialNumber}
                          </td>
                          <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">
                            {row.breach}
                          </td>
                          <td className="px-4 py-3 text-navy-700 font-semibold align-top whitespace-nowrap">
                            {row.penalty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Source: The Schedule to the Digital Personal Data Protection Act, 2023 — No. 22
                  of 2023, Gazette of India Extraordinary.
                </p>
              </div>

              {/* Source + disclaimer footer */}
              <div className="bg-white rounded-xl border border-slate-200 px-7 py-5 text-sm text-slate-500 leading-relaxed">
                <div className="flex items-start gap-3">
                  <BookOpen size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-600 mb-1">Source & Accuracy</p>
                    <p>
                      Official text sourced from the{" "}
                      <strong className="text-slate-600">
                        Gazette of India Extraordinary, Part II — Section 1, No. 22 of 2023
                      </strong>
                      , dated 11th August, 2023. The Act received Presidential assent and was
                      published by the Ministry of Electronics and Information Technology (MeitY).
                      Plain-English summaries and Key Takeaways are SaralPrivacy editorial
                      additions for educational purposes only — they are not legal interpretations
                      and should not be relied upon as legal advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right TOC ── */}
            <div className="hidden xl:block">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  On this page
                </h3>
                <nav className="space-y-3">
                  {tocChapters.map((ch) => (
                    <div key={ch.chapterId}>
                      <a
                        href={`#${ch.chapterId}`}
                        className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 hover:text-navy-700 transition-colors"
                      >
                        {ch.chapterLabel}
                      </a>
                      <div className="space-y-0.5 pl-2">
                        {ch.sections.map((s) => (
                          <a
                            key={s.id}
                            href={`#${s.id}`}
                            className="block text-xs text-slate-500 hover:text-green-600 py-0.5 transition-colors truncate"
                            title={s.label}
                          >
                            {s.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Schedule */}
                  <div>
                    <a
                      href="#schedule"
                      className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 hover:text-navy-700 transition-colors"
                    >
                      Schedule
                    </a>
                    <div className="space-y-0.5 pl-2">
                      <a
                        href="#schedule"
                        className="block text-xs text-slate-500 hover:text-green-600 py-0.5 transition-colors"
                      >
                        Penalty Table (7 items)
                      </a>
                    </div>
                  </div>
                </nav>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
