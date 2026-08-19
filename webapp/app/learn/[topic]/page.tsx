import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList, FileSearch, CheckSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { articleSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";
import { topicNav } from "@/lib/learnNav";
import { AssessmentCTA } from "@/components/cta/AssessmentCTA";
import { WhitepaperCTA } from "@/components/cta/WhitepaperCTA";
import { TemplatesCTA } from "@/components/cta/TemplatesCTA";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { learnContent } from "@/lib/data/learn-content";


/** Slugs of related topics shown as chips at the bottom of each page */
const RELATED_TOPICS: Record<string, string[]> = {
  "what-is-dpdpa":  ["applicability", "key-terms", "consent"],
  "applicability":  ["what-is-dpdpa", "key-terms", "duties"],
  "key-terms":      ["what-is-dpdpa", "applicability", "consent"],
  "consent":        ["notice", "rights", "duties"],
  "notice":         ["consent", "duties", "rights"],
  "rights":         ["duties", "data-breach", "notice"],
  "duties":         ["consent", "rights", "data-breach"],
  "data-breach":    ["duties", "retention", "rights"],
  "childrens-data": ["consent", "duties", "applicability"],
  "retention":      ["duties", "data-breach", "cross-border"],
  "cross-border":   ["duties", "retention", "applicability"],
  "myths":          ["what-is-dpdpa", "applicability", "consent"],
};

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const content = learnContent[topic];
  if (!content) return {};
  const canonicalUrl = `https://saralprivacy.com/learn/${topic}`;
  return {
    title: topic === 'what-is-dpdpa'
      ? "What Is DPDPA? Practical India Guide"
      : content.title,
    description: content.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: content.title,
      description: content.description,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(learnContent).map((topic) => ({ topic }));
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-semibold text-navy-700 mt-8 mb-3">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-navy-700 mt-6 mb-2">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("1. ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || /^\d+\. /.test(lines[i]))) {
        items.push(lines[i].replace(/^[-\d.] /, "").replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="space-y-2 my-3 pl-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim()) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={i} className="text-slate-600 text-sm leading-relaxed mb-3">
          {parts.map((part, idx) =>
            idx % 2 === 1 ? <strong key={idx} className="text-navy-700">{part}</strong> : part
          )}
        </p>
      );
    }

    i++;
  }

  return elements;
}


export default async function LearnTopicPage({ params }: Props) {
  const { topic } = await params;
  const content = learnContent[topic];

  if (!content) {
    // Unknown topic slug → render a proper 404 (handled by ./not-found.tsx).
    // Previously returned a 200 OK with "Content Coming Soon" which left phantom
    // URLs indexable by Google with thin content — bad for topical authority.
    notFound();
  }

  const currentIndex = topicNav.findIndex((t) => t.slug === topic);
  const prev = currentIndex > 0 ? topicNav[currentIndex - 1] : null;
  const next = currentIndex < topicNav.length - 1 ? topicNav[currentIndex + 1] : null;

  return (
    <>
      {articleSchema(
        content.title,
        content.description,
        `https://saralprivacy.com/learn/${topic}`,
        '2025-03-01',
        toISODate(FRESHNESS.learn)
      )}
      {speakableSchema(['.answer-block'], `https://saralprivacy.com/learn/${topic}`, content.title)}
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'DPDPA Guide', url: 'https://saralprivacy.com/learn' },
        { name: content.title, url: `https://saralprivacy.com/learn/${topic}` },
      ])}
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar nav */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                DPDPA Guide
              </h3>
              <nav className="space-y-1">
                {topicNav.map((t) => (
                  <Link
                    key={t.slug}
                    href={t.href ?? `/learn/${t.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      t.slug === topic
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-slate-600 hover:text-navy-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Compliance Tools widget */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-4">
              <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">
                Compliance Tools
              </h3>
              <nav className="space-y-1">
                <Link
                  href="/compliance-checklist"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-colors"
                >
                  <ClipboardList size={14} className="text-teal-500 shrink-0" />
                  Compliance Checklist
                </Link>
                <Link
                  href="/assessment"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-colors"
                >
                  <FileSearch size={14} className="text-teal-500 shrink-0" />
                  DPDPA Assessment
                </Link>
                <Link
                  href="/white-paper"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-colors"
                >
                  <CheckSquare size={14} className="text-teal-500 shrink-0" />
                  Guide
                </Link>
              </nav>
            </div>

            {/* Templates CTA — sidebar */}
            <div className="mt-4">
              <TemplatesCTA variant="sidebar" />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-5 transition-colors"
            >
              <ArrowLeft size={14} />
              DPDPA Guide
            </Link>

            <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-navy-700 mb-2">{content.title}</h1>
              <Byline lastReviewed={FRESHNESS.learn} className="mb-3" />
              {topic === 'what-is-dpdpa' ? (
                <AnswerBlock
                  answer="The Digital Personal Data Protection Act, 2023 governs how digital personal data is collected, used, stored, shared, and deleted in India. With the DPDP Rules, 2025 now notified and phased implementation underway, businesses should focus on fixing notices, consent, rights handling, retention, and vendor controls. This guide explains what the law covers, who it applies to, and what practical steps matter first."
                  className="mt-3 mb-2"
                />
              ) : (
                <AnswerBlock answer={content.description} className="mt-3 mb-2" />
              )}
              <div className="mt-5 pt-5 border-t border-slate-100">
                {renderContent(content.content)}
              </div>
              <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
                <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
                <p>This page is for educational purposes and does not constitute legal advice.</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-5">
              <strong>Educational content only.</strong> This guide is for educational purposes and
              does not constitute legal advice. Please consult a qualified data protection lawyer
              for formal legal opinions specific to your business situation.
            </div>

            {/* Contextual CTAs — Assessment + Whitepaper after article content */}
            <div className="space-y-4 mb-5">
              <AssessmentCTA variant="full" />
              <WhitepaperCTA variant="full" />
            </div>

            {/* Related topics strip */}
            {RELATED_TOPICS[topic] && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Related topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {RELATED_TOPICS[topic].map((relSlug) => {
                    const relTopic = topicNav.find((t) => t.slug === relSlug);
                    if (!relTopic) return null;
                    return (
                      <Link
                        key={relSlug}
                        href={relTopic.href ?? `/learn/${relSlug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {relTopic.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prev/Next nav */}
            <div className="flex items-center justify-between gap-4">
              {prev ? (
                <Link
                  href={`/learn/${prev.slug}`}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  {prev.label}
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/learn/${next.slug}`}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
                >
                  {next.label}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
