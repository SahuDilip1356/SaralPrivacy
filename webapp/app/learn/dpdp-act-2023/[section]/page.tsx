import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Scale } from "lucide-react";
import { articleSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";
import { dpdpAct2023, allSections, type ActSection } from "@/content/dpdp-act-2023";
import { linkifyText } from "@/lib/linkifyText";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";

interface Props {
  params: Promise<{ section: string }>;
}

export function generateStaticParams() {
  return allSections.map((s) => ({ section: s.slug }));
}

function getSection(slug: string): ActSection | undefined {
  return allSections.find((s) => s.slug === slug);
}

function getPlainAnswer(s: ActSection): string {
  if (s.plainEnglish && s.plainEnglish.length > 0) return s.plainEnglish;
  const stripped = s.officialText.replace(/\s+/g, " ").trim();
  return stripped.length > 320 ? stripped.slice(0, 317) + "…" : stripped;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const s = getSection(section);
  if (!s) return { title: "Section not found" };
  const url = `https://saralprivacy.com/learn/dpdp-act-2023/${s.slug}`;
  const title = `DPDPA 2023 Section ${s.sectionNumber} — ${s.title}`;
  const description =
    s.plainEnglish ??
    `Official text of Section ${s.sectionNumber} (${s.title}) of the Digital Personal Data Protection Act, 2023, with plain-English summary and key takeaways for Indian businesses.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
    },
  };
}

function OfficialText({ text }: { text: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 mt-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
        Official Text
      </p>
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {linkifyText(text)}
      </div>
    </div>
  );
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div className="mt-5">
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

export default async function ActSectionPage({ params }: Props) {
  const { section: slug } = await params;
  const s = getSection(slug);
  if (!s) notFound();

  const idx = allSections.findIndex((x) => x.slug === s.slug);
  const prev = idx > 0 ? allSections[idx - 1] : null;
  const next = idx < allSections.length - 1 ? allSections[idx + 1] : null;

  const url = `https://saralprivacy.com/learn/dpdp-act-2023/${s.slug}`;
  const title = `DPDPA 2023 Section ${s.sectionNumber} — ${s.title}`;
  const answer = getPlainAnswer(s);

  return (
    <>
      {articleSchema(
        title,
        answer,
        url,
        toISODate(FRESHNESS.learn),
        toISODate(FRESHNESS.learn),
      )}
      {speakableSchema([".answer-block"], url)}
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "DPDPA Guide", url: "https://saralprivacy.com/learn" },
        {
          name: "DPDP Act 2023",
          url: "https://saralprivacy.com/learn/dpdp-act-2023",
        },
        {
          name: `Section ${s.sectionNumber}`,
          url,
        },
      ])}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <Link
            href="/learn/dpdp-act-2023"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            DPDP Act 2023 — Full Text
          </Link>

          {/* Hero */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
            <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-full px-3 py-1 mb-4">
              <Scale size={12} className="text-navy-600" />
              <span className="text-navy-600 text-xs font-semibold">
                Chapter {s.chapterNumber} · {s.chapterTitle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 mb-2">
              <span className="text-green-500 mr-2">
                Section {s.sectionNumber}.
              </span>
              {s.title}
            </h1>

            <Byline lastReviewed={FRESHNESS.learn} className="mb-4" />

            <AnswerBlock
              question={`Section ${s.sectionNumber} — ${s.title}`}
              answer={answer}
              className="mb-4"
            />

            <OfficialText text={s.officialText} />

            {s.keyTakeaways && s.keyTakeaways.length > 0 && (
              <KeyTakeaways items={s.keyTakeaways} />
            )}

            {/* Source footer */}
            <div className="mt-7 pt-5 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
              <BookOpen size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p>
                Official source:{" "}
                <strong className="text-slate-600">
                  Gazette of India Extraordinary, Part II — Section 1, No. 22 of
                  2023
                </strong>
                , dated 11 August 2023. Reproduced for educational reference.
                Plain-English summary by SaralPrivacy.
              </p>
            </div>
          </div>

          {/* Prev / Next */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {prev ? (
              <Link
                href={`/learn/dpdp-act-2023/${prev.slug}`}
                className="bg-white rounded-xl border border-slate-200 px-5 py-4 hover:border-green-300 transition-colors group"
              >
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  <ArrowLeft size={11} className="inline mr-1" /> Previous
                </p>
                <p className="text-sm font-semibold text-navy-700 group-hover:text-green-600 transition-colors">
                  Section {prev.sectionNumber}. {prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/learn/dpdp-act-2023/${next.slug}`}
                className="bg-white rounded-xl border border-slate-200 px-5 py-4 hover:border-green-300 transition-colors group text-right sm:text-left"
              >
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Next <ArrowRight size={11} className="inline ml-1" />
                </p>
                <p className="text-sm font-semibold text-navy-700 group-hover:text-green-600 transition-colors">
                  Section {next.sectionNumber}. {next.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Related */}
          <div className="bg-white rounded-xl border border-slate-200 px-7 py-5">
            <h2 className="text-sm font-bold text-navy-700 mb-3">
              Part of the full Act
            </h2>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              This section sits within{" "}
              <strong>
                Chapter {s.chapterNumber} — {s.chapterTitle}
              </strong>{" "}
              of the Digital Personal Data Protection Act, 2023 ({dpdpAct2023.actNumber}).
            </p>
            <Link
              href="/learn/dpdp-act-2023"
              className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              Read all 44 sections
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
