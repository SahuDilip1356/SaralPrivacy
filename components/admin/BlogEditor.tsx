"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Plus, Trash2, Save, Send, Globe } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrimarySource {
  claim: string;
  sourceType: string;
  citation: string;
  riskLevel: string;
}

export interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  lane: string;
  author: string;
  tags: string;
  featured: boolean;
  // 7 content sections
  section_what_changed: string;
  section_law_says: string;
  section_do_now: string;
  section_uncertain: string;
  section_mistakes: string;
  primary_sources: PrimarySource[];
  validated_at: string;
  // Scores
  score_legal_accuracy: number;
  score_primary_source: number;
  score_currency: number;
  score_scope: number;
  score_operational: number;
}

interface BlogEditorProps {
  initialData?: Partial<BlogPostData>;
  docId?: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LANES = [
  { value: "law-explained",       label: "Law Explained"       },
  { value: "compliance-playbook", label: "Compliance Playbooks" },
  { value: "myth-fact",           label: "Myth vs Fact"        },
  { value: "sector-notes",        label: "Sector Notes"        },
  { value: "governance-watch",    label: "Governance Watch"    },
];

const SCOPE_OPTIONS = [
  "Black-letter law",
  "Operational guidance",
  "Interpretation",
  "Open question",
];

const SOURCE_TYPES = [
  "Act text",
  "Notified Rules",
  "Gazette",
  "Official press release",
  "Court judgment",
  "Regulator analysis",
  "Law firm commentary",
];

const RISK_LEVELS = ["Low", "Medium", "High"];

const SECTIONS = [
  {
    key: "section_what_changed" as const,
    heading: "What Changed",
    hint: "Set the context. What is new, notified, or recently clarified?",
  },
  {
    key: "section_law_says" as const,
    heading: "What the Law Actually Says",
    hint: "Cite the Act/Rules directly. Section numbers. No paraphrasing without attribution.",
  },
  {
    key: "section_do_now" as const,
    heading: "What Businesses Should Do Now",
    hint: "Operational steps. Practical. Actionable. Not legal advice.",
  },
  {
    key: "section_uncertain" as const,
    heading: "What Is Still Uncertain",
    hint: "Honest gaps. Pending notifications. Areas where the Rules are silent.",
  },
  {
    key: "section_mistakes" as const,
    heading: "Top Mistakes to Avoid",
    hint: "Common errors, wrong assumptions, GDPR imports that don't apply in India.",
  },
];

const SCORE_CRITERIA = [
  { key: "score_legal_accuracy" as const,   label: "Legal Accuracy",           max: 35 },
  { key: "score_primary_source" as const,   label: "Primary-Source Support",   max: 25 },
  { key: "score_currency" as const,         label: "Currency / Status Accuracy",max: 15 },
  { key: "score_scope" as const,            label: "Scope Precision",           max: 15 },
  { key: "score_operational" as const,      label: "Operational Usefulness",    max: 10 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

const defaultData: BlogPostData = {
  title: "",
  slug: "",
  excerpt: "",
  lane: "law-explained",
  author: "",
  tags: "",
  featured: false,
  section_what_changed: "",
  section_law_says: "",
  section_do_now: "",
  section_uncertain: "",
  section_mistakes: "",
  primary_sources: [],
  validated_at: "",
  score_legal_accuracy: 0,
  score_primary_source: 0,
  score_currency: 0,
  score_scope: 0,
  score_operational: 0,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function BlogEditor({ initialData, docId }: BlogEditorProps) {
  const router = useRouter();
  const [data, setData] = useState<BlogPostData>({ ...defaultData, ...initialData });
  const [slugLocked, setSlugLocked] = useState(!!docId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");
  const [scopeLabels, setScopeLabels] = useState<Record<string, string>>({});

  const totalScore =
    data.score_legal_accuracy +
    data.score_primary_source +
    data.score_currency +
    data.score_scope +
    data.score_operational;

  const canPublish = totalScore >= 85 && !!data.validated_at;

  // Auto-generate slug from title (only on new posts)
  useEffect(() => {
    if (!slugLocked && data.title) {
      setData((prev) => ({ ...prev, slug: slugify(data.title) }));
    }
  }, [data.title, slugLocked]);

  const set = useCallback(<K extends keyof BlogPostData>(key: K, value: BlogPostData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  function setScope(sectionKey: string, value: string) {
    setScopeLabels((prev) => ({ ...prev, [sectionKey]: value }));
  }

  // Primary sources
  function addSource() {
    setData((prev) => ({
      ...prev,
      primary_sources: [
        ...prev.primary_sources,
        { claim: "", sourceType: "Act text", citation: "", riskLevel: "Low" },
      ],
    }));
  }
  function updateSource(idx: number, field: keyof PrimarySource, value: string) {
    setData((prev) => {
      const sources = [...prev.primary_sources];
      sources[idx] = { ...sources[idx], [field]: value };
      return { ...prev, primary_sources: sources };
    });
  }
  function removeSource(idx: number) {
    setData((prev) => ({
      ...prev,
      primary_sources: prev.primary_sources.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave(status: "draft" | "review" | "published") {
    setSaving(true);
    setSaveError("");
    setSaveOk("");

    const payload = {
      ...data,
      status,
      id: docId || undefined,
      scope_labels: scopeLabels,
    };

    try {
      const method = docId ? "PATCH" : "POST";
      const res = await fetch("/api/blog/save", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        setSaveOk(`Saved successfully. ID: ${result.id}`);
        if (!docId) {
          router.push(`/admin/blog/${result.id}/edit`);
        }
      } else {
        setSaveError(result.error || "Save failed");
      }
    } catch {
      setSaveError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const scoreColor =
    totalScore >= 90
      ? "text-green-700"
      : totalScore >= 85
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">
            {docId ? "Edit Blog Post" : "New Blog Post"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Verified DPDPA Insights editor</p>
        </div>
        <a href="/admin/blog" className="text-sm text-brand-600 hover:text-brand-800">
          ← Back to Posts
        </a>
      </div>

      {/* Status messages */}
      {saveOk && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
          <CheckCircle size={14} /> {saveOk}
        </div>
      )}
      {saveError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
          <AlertCircle size={14} /> {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor — 2/3 */}
        <div className="lg:col-span-2 space-y-5">

          {/* Metadata card */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-brand-700 text-sm">Post Details</h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. What the DPDPA Actually Requires for Consent"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-brand-700 font-medium focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    set("slug", e.target.value);
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 focus:outline-none focus:border-brand-400 transition-colors"
                />
                {slugLocked && (
                  <button
                    onClick={() => setSlugLocked(false)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Auto
                  </button>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Excerpt * &nbsp;
                <span className={`font-normal ${data.excerpt.length > 580 ? "text-red-500" : "text-slate-400"}`}>
                  {data.excerpt.length}/600
                </span>
              </label>
              <textarea
                value={data.excerpt}
                onChange={(e) => set("excerpt", e.target.value.slice(0, 600))}
                rows={3}
                placeholder="One-paragraph summary for card previews and SEO."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors resize-none"
              />
            </div>

            {/* Lane + Author row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lane *</label>
                <select
                  value={data.lane}
                  onChange={(e) => set("lane", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 bg-white"
                >
                  {LANES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Author *</label>
                <input
                  type="text"
                  value={data.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="Name / team"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>

            {/* Tags + Featured row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={data.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="consent, data principal, rules"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">Featured post</span>
                </label>
              </div>
            </div>
          </div>

          {/* 7 Section Editor */}
          {SECTIONS.map((section) => (
            <div key={section.key} className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-brand-700 text-sm">{section.heading}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{section.hint}</p>
                </div>
                <select
                  value={scopeLabels[section.key] || ""}
                  onChange={(e) => setScope(section.key, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white focus:outline-none focus:border-brand-400 ml-4 shrink-0"
                >
                  <option value="">Scope label…</option>
                  {SCOPE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={data[section.key as keyof BlogPostData] as string}
                onChange={(e) => set(section.key, e.target.value)}
                rows={8}
                placeholder={`Write the "${section.heading}" content here…`}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors resize-y min-h-[200px] leading-relaxed"
              />
            </div>
          ))}

          {/* Primary Sources table */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-brand-700 text-sm">Primary Sources Checked</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Document every source used. This is the editorial integrity log.
                </p>
              </div>
              <button
                onClick={addSource}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 border border-brand-200 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <Plus size={12} /> Add Source
              </button>
            </div>

            {data.primary_sources.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No sources added yet. Click &ldquo;Add Source&rdquo; above.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
                  <div className="col-span-3">Claim</div>
                  <div className="col-span-3">Source Type</div>
                  <div className="col-span-4">Citation</div>
                  <div className="col-span-1">Risk</div>
                  <div className="col-span-1"></div>
                </div>
                {data.primary_sources.map((src, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={src.claim}
                      onChange={(e) => updateSource(idx, "claim", e.target.value)}
                      placeholder="Claim verified"
                      className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-400"
                    />
                    <select
                      value={src.sourceType}
                      onChange={(e) => updateSource(idx, "sourceType", e.target.value)}
                      className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:border-brand-400"
                    >
                      {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input
                      value={src.citation}
                      onChange={(e) => updateSource(idx, "citation", e.target.value)}
                      placeholder="Section no. / URL / document"
                      className="col-span-4 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-400"
                    />
                    <select
                      value={src.riskLevel}
                      onChange={(e) => updateSource(idx, "riskLevel", e.target.value)}
                      className={`col-span-1 px-2 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-brand-400 ${
                        src.riskLevel === "High"
                          ? "border-red-300 text-red-700"
                          : src.riskLevel === "Medium"
                          ? "border-amber-300 text-amber-700"
                          : "border-green-300 text-green-700"
                      }`}
                    >
                      {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={() => removeSource(idx)}
                      className="col-span-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation Date */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <h3 className="font-semibold text-brand-700 text-sm mb-1">Validation Date</h3>
            <p className="text-xs text-slate-400 mb-3">
              Date validated against official sources. Required before publishing.
            </p>
            <input
              type="date"
              value={data.validated_at}
              onChange={(e) => set("validated_at", e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400"
            />
          </div>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-5">

          {/* Validation Scorecard */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 sticky top-6">
            <h2 className="font-semibold text-brand-700 text-sm mb-1">Validation Scorecard</h2>
            <p className="text-xs text-slate-400 mb-4">Publish threshold: 85/100</p>

            <div className="space-y-4 mb-5">
              {SCORE_CRITERIA.map(({ key, label, max }) => {
                const val = data[key] as number;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">{label}</label>
                      <span className="text-xs font-bold text-slate-700">
                        {val}/{max}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={max}
                        value={val}
                        onChange={(e) => set(key, Number(e.target.value))}
                        className="flex-1 h-1.5 accent-brand-700"
                      />
                      <input
                        type="number"
                        min={0}
                        max={max}
                        value={val}
                        onChange={(e) => set(key, Math.min(max, Math.max(0, Number(e.target.value))))}
                        className="w-12 px-1.5 py-1 border border-slate-200 rounded text-xs text-center text-slate-700 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total score */}
            <div className={`text-center py-3 rounded-xl border-2 ${
              totalScore >= 90
                ? "border-green-200 bg-green-50"
                : totalScore >= 85
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            }`}>
              <div className={`text-4xl font-bold ${scoreColor}`}>{totalScore}</div>
              <div className="text-xs text-slate-500 mt-0.5">out of 100</div>
              <div className={`text-xs font-semibold mt-1 ${scoreColor}`}>
                {totalScore >= 90 ? "Excellent" : totalScore >= 85 ? "Meets threshold" : "Below threshold"}
              </div>
            </div>

            {/* Auto-holds checklist */}
            {totalScore < 85 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold text-red-700">Items to improve:</p>
                {SCORE_CRITERIA.map(({ key, label, max }) => {
                  const val = data[key] as number;
                  const pct = val / max;
                  if (pct >= 0.8) return null;
                  return (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-red-600">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      {label} ({val}/{max})
                    </div>
                  );
                })}
                {!data.validated_at && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    Validation date not set
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save as Draft"}
              </button>
              <button
                onClick={() => handleSave("review")}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                Submit for Review
              </button>
              <div className="relative group">
                <button
                  onClick={() => { if (canPublish) handleSave("published"); }}
                  disabled={saving || !canPublish}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    canPublish
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Globe size={14} />
                  Publish
                </button>
                {!canPublish && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed">
                    Score must be ≥ 85 and validation date must be set to publish.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
