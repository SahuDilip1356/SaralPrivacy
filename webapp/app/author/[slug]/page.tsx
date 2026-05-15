import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { AUTHORS, type Author } from "@/lib/data/authors";
import { breadcrumbSchema } from "@/lib/schema";
import { FRESHNESS, formatReviewDate } from "@/lib/content-freshness";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.values(AUTHORS).map((a) => ({ slug: a.id }));
}

function getAuthor(slug: string): Author | undefined {
  return Object.values(AUTHORS).find((a) => a.id === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getAuthor(slug);
  if (!a) return { title: "Author not found" };
  const url = `https://saralprivacy.com/author/${a.id}`;
  return {
    title: `${a.name} — ${a.jobTitle}`,
    description: a.description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title: a.name,
      description: a.description,
    },
  };
}

function personSchema(a: Author): React.ReactElement {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.name,
    url: `https://saralprivacy.com/author/${a.id}`,
    jobTitle: a.jobTitle,
    description: a.description,
    worksFor: {
      "@type": "Organization",
      name: "SaralPrivacy",
      url: "https://saralprivacy.com",
    },
    ...(a.sameAs && a.sameAs.length > 0 ? { sameAs: a.sameAs } : {}),
    ...(a.image ? { image: a.image } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const REVIEWED_AREAS = [
  { label: "DPDP Act 2023 — Full Text (44 sections)", href: "/learn/dpdp-act-2023" },
  { label: "DPDP Rules 2025 — Plain-English Guide", href: "/learn/dpdp-rules-2025-plain-english-guide" },
  { label: "DPDPA FAQ", href: "/faq" },
  { label: "DPDPA Glossary", href: "/glossary" },
  { label: "Penalty Calculator", href: "/penalty-calculator" },
  { label: "Industry Guides — Recruitment, CA, Training, D2C", href: "/industries" },
  { label: "Daily Briefings", href: "/briefings" },
];

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const a = getAuthor(slug);
  if (!a) notFound();

  const url = `https://saralprivacy.com/author/${a.id}`;

  return (
    <>
      {personSchema(a)}
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Author", url },
      ])}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            About SaralPrivacy
          </Link>

          {/* Hero card */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
              Author
            </p>
            <h1 className="text-3xl font-bold text-navy-700 mb-1">{a.name}</h1>
            <p className="text-sm text-slate-500 mb-5">{a.jobTitle}</p>
            <p className="text-base text-slate-700 leading-relaxed">{a.description}</p>

            {a.sameAs && a.sameAs.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Elsewhere on the web
                </p>
                <ul className="space-y-1.5">
                  {a.sameAs.map((link) => (
                    <li key={link}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
              <Mail size={14} className="text-slate-400" />
              <a
                href="mailto:privacy@saralprivacy.com"
                className="text-green-600 hover:underline"
              >
                privacy@saralprivacy.com
              </a>
            </div>
          </div>

          {/* Reviewed areas */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
            <h2 className="text-base font-bold text-navy-700 mb-3">
              Areas reviewed by {a.name}
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {a.name} reviews and maintains the SaralPrivacy guidance set on the
              Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025.
              All pages carry a last-reviewed date and are checked against the
              official Gazette publications.
            </p>
            <ul className="space-y-2">
              {REVIEWED_AREAS.map((area) => (
                <li key={area.href} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                  <Link
                    href={area.href}
                    className="text-slate-700 hover:text-green-600 transition-colors"
                  >
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial standards */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
            <h2 className="text-base font-bold text-navy-700 mb-3">
              Editorial standards
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              All content authored or reviewed by {a.name} is produced against
              primary sources only — the Act as enacted, the Rules as notified in
              the Official Gazette, and direct communications from the Ministry of
              Electronics and Information Technology (MeitY). Secondary commentary,
              news coverage, and social posts are not treated as authoritative.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              SaralPrivacy is not a law firm and content is published for
              educational purposes only. Businesses should consult a qualified
              data protection professional for legal advice specific to their
              situation.
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Last reviewed: {formatReviewDate(FRESHNESS.core)}
          </p>
        </div>
      </div>
    </>
  );
}
