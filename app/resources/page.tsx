import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download, Lock, ExternalLink } from "lucide-react";
import { resources } from "@/lib/data/resources";
import { getResourceTypeLabel, getIndustryLabel, formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "DPDPA Resources — Templates & Guides",
  description:
    "Free DPDPA resources for Indian businesses: compliance checklists, consent templates, white papers, sector guides, and rights request forms.",
  alternates: { canonical: 'https://saralprivacy.com/resources' },
};

const resourceTypes = [
  { id: "all", label: "All Resources" },
  { id: "white-paper", label: "White Papers" },
  { id: "guide", label: "Sector Guides" },
  { id: "checklist", label: "Checklists" },
  { id: "template", label: "Templates" },
  { id: "explainer", label: "Explainers" },
];

const typeIcons: Record<string, string> = {
  "white-paper": "📄",
  "guide": "📖",
  "checklist": "✅",
  "template": "📋",
  "explainer": "💡",
  "faq": "❓",
  "webinar": "🎥",
  "case-study": "📊",
};

export default function ResourcesPage() {
  const featured = resources.filter((r) => r.featured);
  const rest = resources.filter((r) => !r.featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-brand-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              DPDPA Resource Library
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Practical resources for Indian businesses preparing for DPDPA compliance — checklists,
              templates, sector guides, and white papers. Free wherever possible.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-[calc(4rem+32px)] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  type.id === "all"
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featured.map((resource) => (
                <div key={resource.id} className="bg-brand-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{typeIcons[resource.type] || "📄"}</span>
                    <Badge variant="teal">{getResourceTypeLabel(resource.type)}</Badge>
                    {resource.gated ? (
                      <Badge variant="amber">
                        <Lock size={10} className="mr-1" />
                        Gated
                      </Badge>
                    ) : (
                      <Badge variant="green">Free</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 leading-snug">{resource.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">{resource.description}</p>
                  <Link
                    href={resource.gated ? "/white-paper" : `/resources/${resource.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-400 hover:text-saffron-300 transition-colors"
                  >
                    {resource.gated ? (
                      <>
                        <Lock size={14} />
                        Download (free, requires email)
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Download Free
                      </>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All resources */}
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          All Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col hover:shadow-sm hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{typeIcons[resource.type] || "📄"}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {getResourceTypeLabel(resource.type)}
                </span>
                {resource.gated ? (
                  <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Lock size={9} />
                    Email required
                  </span>
                ) : (
                  <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </div>
              <h3 className="font-bold text-brand-700 text-sm leading-snug mb-2 flex-1">
                {resource.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-3">{resource.description}</p>

              {/* Industries */}
              <div className="flex flex-wrap gap-1 mb-3">
                {resource.industries.slice(0, 2).map((ind) => (
                  <span key={ind} className="text-[10px] font-semibold text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded-full">
                    {ind === "general" ? "All Businesses" : getIndustryLabel(ind)}
                  </span>
                ))}
              </div>

              <Link
                href={resource.gated ? "/white-paper" : `/resources/${resource.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 hover:text-saffron-700"
              >
                <Download size={12} />
                {resource.gated ? "Download (requires email)" : "Download Free"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
