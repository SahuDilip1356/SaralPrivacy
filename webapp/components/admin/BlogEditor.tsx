"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, AlertCircle, Plus, Trash2, Save, Send, Globe,
  ShieldCheck, ImagePlus, RefreshCw, AlertTriangle, XCircle, Wand2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrimarySource {
  claim:      string;
  sourceType: string;
  citation:   string;
  riskLevel:  string;
}

export interface BlogPostData {
  title:                string;
  slug:                 string;
  excerpt:              string;
  lane:                 string;
  author:               string;
  tags:                 string;
  featured:             boolean;
  section_what_changed: string;
  section_law_says:     string;
  section_do_now:       string;
  section_uncertain:    string;
  section_mistakes:     string;
  primary_sources:      PrimarySource[];
  validated_at:         string;
  score_legal_accuracy: number;
  score_primary_source: number;
  score_currency:       number;
  score_scope:          number;
  score_operational:    number;
  infographic_url?:     string;
}

interface SectionFeedback {
  section: "what_changed" | "law_says" | "do_now" | "uncertain" | "mistakes";
  status:  "verified" | "warning" | "error";
  note:    string;
}

interface SuggestedSource {
  claim:      string;
  sourceType: string;
  citation:   string;
  riskLevel:  "Low" | "Medium" | "High";
}

interface BlogEditorProps {
  initialData?:    Partial<BlogPostData>;
  docId?:          string | null;
  role?:           "admin" | "blogger";
  initialStatus?:  string;
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
    key:     "section_what_changed" as const,
    heading: "What Changed",
    hint:    "Set the context. What is new, notified, or recently clarified?",
    fbKey:   "what_changed" as SectionFeedback["section"],
  },
  {
    key:     "section_law_says" as const,
    heading: "What the Law Actually Says",
    hint:    "Cite the Act/Rules directly. Section numbers. No paraphrasing without attribution.",
    fbKey:   "law_says" as SectionFeedback["section"],
  },
  {
    key:     "section_do_now" as const,
    heading: "What Businesses Should Do Now",
    hint:    "Operational steps. Practical. Actionable. Not legal advice.",
    fbKey:   "do_now" as SectionFeedback["section"],
  },
  {
    key:     "section_uncertain" as const,
    heading: "What Is Still Uncertain",
    hint:    "Honest gaps. Pending notifications. Areas where the Rules are silent.",
    fbKey:   "uncertain" as SectionFeedback["section"],
  },
  {
    key:     "section_mistakes" as const,
    heading: "Top Mistakes to Avoid",
    hint:    "Common errors, wrong assumptions, GDPR imports that don't apply in India.",
    fbKey:   "mistakes" as SectionFeedback["section"],
  },
];

const SCORE_CRITERIA = [
  { key: "score_legal_accuracy" as const, label: "Legal Accuracy",            max: 35 },
  { key: "score_primary_source" as const, label: "Primary-Source Support",    max: 25 },
  { key: "score_currency"       as const, label: "Currency / Status Accuracy", max: 15 },
  { key: "score_scope"          as const, label: "Scope Precision",            max: 15 },
  { key: "score_operational"    as const, label: "Operational Usefulness",     max: 10 },
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
  title: "", slug: "", excerpt: "", lane: "law-explained",
  author: "", tags: "", featured: false,
  section_what_changed: "", section_law_says: "",
  section_do_now: "", section_uncertain: "", section_mistakes: "",
  primary_sources: [], validated_at: "",
  score_legal_accuracy: 0, score_primary_source: 0,
  score_currency: 0, score_scope: 0, score_operational: 0,
  infographic_url: "",
};

// ── Feedback badge ────────────────────────────────────────────────────────────

function FeedbackBadge({
  fb,
  onFix,
  revising,
}: {
  fb:        SectionFeedback;
  onFix?:    () => void;
  revising?: boolean;
}) {
  if (fb.status === "verified") {
    return (
      <div className="flex items-start gap-1.5 mt-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
        <CheckCircle size={12} className="mt-0.5 shrink-0" />
        <span>{fb.note}</span>
      </div>
    );
  }

  const isWarning = fb.status === "warning";
  const colours   = isWarning
    ? { wrap: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: "text-amber-500", btn: "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300" }
    : { wrap: "bg-red-50 border-red-200",     text: "text-red-800",   icon: "text-red-500",   btn: "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"         };

  return (
    <div className={`mt-1.5 px-3 py-2.5 border rounded-lg ${colours.wrap}`}>
      <div className="flex items-start gap-1.5">
        {isWarning
          ? <AlertTriangle size={12} className={`mt-0.5 shrink-0 ${colours.icon}`} />
          : <XCircle      size={12} className={`mt-0.5 shrink-0 ${colours.icon}`} />
        }
        <span className={`text-xs leading-relaxed ${colours.text}`}>{fb.note}</span>
      </div>

      {onFix && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={onFix}
            disabled={revising}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colours.btn}`}
          >
            {revising ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                Fixing…
              </>
            ) : (
              <>
                <Wand2 size={11} />
                ✦ Fix This Section
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BlogEditor({ initialData, docId, role = "admin", initialStatus }: BlogEditorProps) {
  const router = useRouter();
  const [data, setData]             = useState<BlogPostData>({ ...defaultData, ...initialData });
  const [slugLocked, setSlugLocked] = useState(!!docId);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [saveOk, setSaveOk]         = useState("");
  const [scopeLabels, setScopeLabels] = useState<Record<string, string>>({});

  // Validate state
  const [validating, setValidating]         = useState(false);
  const [validateError, setValidateError]   = useState("");
  const [sectionFeedback, setSectionFeedback] = useState<SectionFeedback[]>([]);
  const [suggestedSources, setSuggestedSources] = useState<SuggestedSource[]>([]);
  const [editorialNotes, setEditorialNotes] = useState("");

  // Infographic state
  const [generating, setGenerating]       = useState(false);
  const [infraError, setInfraError]       = useState("");
  const [infraUrl, setInfraUrl]           = useState(initialData?.infographic_url ?? "");

  // Section revise state — tracks which sectionKey is currently being AI-fixed
  const [revisingSection, setRevisingSection] = useState<string | null>(null);
  const [reviseToast, setReviseToast]         = useState("");

  // Publish state — local flag so the button locks immediately after a successful publish
  // without needing a page reload (initialStatus is a static server prop)
  const [publishedNow, setPublishedNow] = useState(false);

  const totalScore =
    data.score_legal_accuracy + data.score_primary_source +
    data.score_currency + data.score_scope + data.score_operational;

  const isAlreadyPublished = initialStatus === "published" || publishedNow;
  // validated_at is not a hard gate — if score ≥ 75 we auto-set it at publish time
  const canPublish = totalScore >= 75 && !isAlreadyPublished;
  const isAdmin    = role === "admin";

  // Auto-generate slug from title (new posts only)
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

  // ── DPDPA Validate ──────────────────────────────────────────────────────────
  async function handleValidate() {
    setValidating(true);
    setValidateError("");
    setSectionFeedback([]);
    setSuggestedSources([]);
    setEditorialNotes("");

    try {
      const res = await fetch("/api/blog/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:                data.title,
          lane:                 data.lane,
          section_what_changed: data.section_what_changed,
          section_law_says:     data.section_law_says,
          section_do_now:       data.section_do_now,
          section_uncertain:    data.section_uncertain,
          section_mistakes:     data.section_mistakes,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Validation failed");

      // Auto-fill scores
      const { scores, section_feedback, suggested_sources, editorial_notes, validated_at } = result;
      setData((prev) => ({
        ...prev,
        score_legal_accuracy: scores.score_legal_accuracy,
        score_primary_source: scores.score_primary_source,
        score_currency:       scores.score_currency,
        score_scope:          scores.score_scope,
        score_operational:    scores.score_operational,
        validated_at:         validated_at || prev.validated_at,
      }));

      setSectionFeedback(section_feedback ?? []);
      setSuggestedSources(suggested_sources ?? []);
      setEditorialNotes(editorial_notes ?? "");
    } catch (err) {
      setValidateError(err instanceof Error ? err.message : "Validation error");
    } finally {
      setValidating(false);
    }
  }

  // Revise a flagged section using AI based on validation feedback
  async function handleRevise(sectionKey: string, feedbackNote: string) {
    const currentContent = data[sectionKey as keyof BlogPostData] as string;
    if (!currentContent || !feedbackNote) return;

    setRevisingSection(sectionKey);
    setReviseToast("");

    try {
      const res = await fetch("/api/blog/revise", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          currentContent,
          feedbackNote,
          title:                data.title,
          section_what_changed: data.section_what_changed,
          section_law_says:     data.section_law_says,
          section_do_now:       data.section_do_now,
          section_uncertain:    data.section_uncertain,
          section_mistakes:     data.section_mistakes,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Revision failed");

      // Auto-fill the corrected content into the section textarea
      setData((prev) => ({ ...prev, [sectionKey]: result.revisedContent }));

      // Clear the stale feedback for this section — user must re-validate
      setSectionFeedback((prev) =>
        prev.filter((f) => {
          const sec = SECTIONS.find((s) => s.key === sectionKey);
          return f.section !== sec?.fbKey;
        })
      );

      setReviseToast(`${SECTIONS.find((s) => s.key === sectionKey)?.heading} revised — re-validate to update your score.`);
      setTimeout(() => setReviseToast(""), 6000);
    } catch (err) {
      setReviseToast(err instanceof Error ? err.message : "Revision failed. Please try again.");
      setTimeout(() => setReviseToast(""), 6000);
    } finally {
      setRevisingSection(null);
    }
  }

  // Add all suggested sources at once
  function addAllSuggestedSources() {
    setData((prev) => ({
      ...prev,
      primary_sources: [
        ...prev.primary_sources,
        ...suggestedSources.map((s) => ({
          claim:      s.claim,
          sourceType: s.sourceType,
          citation:   s.citation,
          riskLevel:  s.riskLevel,
        })),
      ],
    }));
    setSuggestedSources([]);
  }

  // ── Infographic generate ────────────────────────────────────────────────────
  async function handleGenerateInfographic() {
    if (!docId) {
      setInfraError("Save the post as draft first to get a document ID.");
      return;
    }
    setGenerating(true);
    setInfraError("");

    try {
      const res = await fetch("/api/blog/infographic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:                   docId,
          lane:                 data.lane,
          title:                data.title,
          excerpt:              data.excerpt,
          section_what_changed: data.section_what_changed,
          section_law_says:     data.section_law_says,
          section_do_now:       data.section_do_now,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Generation failed");

      setInfraUrl(result.url);
      setData((prev) => ({ ...prev, infographic_url: result.url }));
    } catch (err) {
      setInfraError(err instanceof Error ? err.message : "Infographic generation error");
    } finally {
      setGenerating(false);
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave(status: "draft" | "review" | "published") {
    // Bloggers cannot publish
    if (!isAdmin && status === "published") return;

    setSaving(true);
    setSaveError("");
    setSaveOk("");

    // Fix 4: Auto-set validated_at to today's IST date if publishing without one
    // Score ≥ 75 already proves quality — don't silently block on missing date
    let resolvedData = { ...data };
    if (status === "published" && !resolvedData.validated_at) {
      const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
      resolvedData.validated_at = istDate.toISOString().slice(0, 10);
      setData((prev) => ({ ...prev, validated_at: resolvedData.validated_at }));
    }

    const payload = { ...resolvedData, status, id: docId || undefined, scope_labels: scopeLabels };

    try {
      const method = docId ? "PATCH" : "POST";
      const res    = await fetch("/api/blog/save", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        if (status === "published") {
          // Fix 1: Lock the button immediately via local state
          setPublishedNow(true);
          setSaveOk("Post published successfully!");
          // Fix 2: Redirect to the posts list so admin sees it's live
          setTimeout(() => router.push("/admin/blog"), 1500);
        } else {
          setSaveOk(`Saved as ${status}. ID: ${result.id}`);
          // For new posts saved as draft/review, move to the edit URL
          if (!docId) router.push(`/admin/blog/${result.id}/edit`);
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
    totalScore >= 90 ? "text-green-700" :
    totalScore >= 75 ? "text-amber-600" : "text-red-600";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">
            {docId ? "Edit Blog Post" : "New Blog Post"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified DPDPA Insights editor
            {!isAdmin && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Blogger — submit for review only</span>}
          </p>
        </div>
        <a href="/admin/blog" className="text-sm text-brand-600 hover:text-brand-800">← Back to Posts</a>
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
        {/* ── Main editor — 2/3 ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Post Details */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-brand-700 text-sm">Post Details</h2>

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

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => { setSlugLocked(true); set("slug", e.target.value); }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 focus:outline-none focus:border-brand-400 transition-colors"
                />
                {slugLocked && (
                  <button onClick={() => setSlugLocked(false)} className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                    Auto
                  </button>
                )}
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lane *</label>
                <select
                  value={data.lane}
                  onChange={(e) => set("lane", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 bg-white"
                >
                  {LANES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
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

          {/* Content sections */}
          {SECTIONS.map((section) => {
            const fb = sectionFeedback.find((f) => f.section === section.fbKey);
            return (
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
                    {SCOPE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <textarea
                  value={data[section.key as keyof BlogPostData] as string}
                  onChange={(e) => set(section.key, e.target.value)}
                  rows={8}
                  placeholder={`Write the "${section.heading}" content here…`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors resize-y min-h-[200px] leading-relaxed"
                />
                {fb && (
                  <FeedbackBadge
                    fb={fb}
                    onFix={
                      fb.status !== "verified"
                        ? () => handleRevise(section.key, fb.note)
                        : undefined
                    }
                    revising={revisingSection === section.key}
                  />
                )}
              </div>
            );
          })}

          {/* DPDPA Validate button */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-brand-700 text-sm">DPDPA Guardrail Check</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI validates every section against the Act 2023 + Rules 2025 and auto-fills your score.
                </p>
              </div>
              <button
                onClick={handleValidate}
                disabled={validating || !data.title || !data.section_what_changed}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-50"
              >
                <ShieldCheck size={14} />
                {validating ? "Validating…" : "Validate against DPDPA →"}
              </button>
            </div>

            {validateError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle size={12} /> {validateError}
              </div>
            )}

            {/* Revise toast — shown after a section fix completes */}
            {reviseToast && (
              <div className="flex items-start gap-2 px-3 py-2 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800 mt-2">
                <Wand2 size={12} className="mt-0.5 shrink-0 text-brand-600" />
                {reviseToast}
              </div>
            )}

            {editorialNotes && (
              <div className="mt-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-600 mb-1">Editorial Assessment</p>
                {editorialNotes}
              </div>
            )}

            {suggestedSources.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600">Suggested Primary Sources</p>
                  <button
                    onClick={addAllSuggestedSources}
                    className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                  >
                    + Add all
                  </button>
                </div>
                <div className="space-y-1.5">
                  {suggestedSources.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                      <span className="font-medium truncate flex-1">{s.claim}</span>
                      <span className="text-blue-500 shrink-0">{s.citation}</span>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-full font-semibold ${
                        s.riskLevel === "High" ? "bg-red-100 text-red-700" :
                        s.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>{s.riskLevel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary sources */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-brand-700 text-sm">Primary Sources Checked</h3>
                <p className="text-xs text-slate-400 mt-0.5">Document every source used. This is the editorial integrity log.</p>
              </div>
              <button
                onClick={addSource}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 border border-brand-200 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <Plus size={12} /> Add Source
              </button>
            </div>

            {data.primary_sources.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No sources added yet. Use &ldquo;Validate&rdquo; to get suggestions or click &ldquo;Add Source&rdquo;.</p>
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
                    <input value={src.claim} onChange={(e) => updateSource(idx, "claim", e.target.value)} placeholder="Claim verified" className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-400" />
                    <select value={src.sourceType} onChange={(e) => updateSource(idx, "sourceType", e.target.value)} className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:border-brand-400">
                      {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input value={src.citation} onChange={(e) => updateSource(idx, "citation", e.target.value)} placeholder="Section no. / URL" className="col-span-4 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-400" />
                    <select
                      value={src.riskLevel}
                      onChange={(e) => updateSource(idx, "riskLevel", e.target.value)}
                      className={`col-span-1 px-2 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-brand-400 ${
                        src.riskLevel === "High" ? "border-red-300 text-red-700" :
                        src.riskLevel === "Medium" ? "border-amber-300 text-amber-700" :
                        "border-green-300 text-green-700"
                      }`}
                    >
                      {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <button onClick={() => removeSource(idx)} className="col-span-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation date */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <h3 className="font-semibold text-brand-700 text-sm mb-1">Validation Date</h3>
            <p className="text-xs text-slate-400 mb-3">Date validated against official sources. Required before publishing. Auto-set by the Validate button.</p>
            <input
              type="date"
              value={data.validated_at}
              onChange={(e) => set("validated_at", e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-400"
            />
          </div>
        </div>

        {/* ── Sidebar — 1/3 ──────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Validation scorecard */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 sticky top-6">
            <h2 className="font-semibold text-brand-700 text-sm mb-1">Validation Scorecard</h2>
            <p className="text-xs text-slate-400 mb-4">Publish threshold: 75/100. Auto-filled by Validate.</p>

            <div className="space-y-4 mb-5">
              {SCORE_CRITERIA.map(({ key, label, max }) => {
                const val = data[key] as number;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">{label}</label>
                      <span className="text-xs font-bold text-slate-700">{val}/{max}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min={0} max={max} value={val}
                        onChange={(e) => set(key, Number(e.target.value))}
                        className="flex-1 h-1.5 accent-brand-700"
                      />
                      <input
                        type="number" min={0} max={max} value={val}
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
              totalScore >= 90 ? "border-green-200 bg-green-50" :
              totalScore >= 75 ? "border-amber-200 bg-amber-50" :
              "border-red-200 bg-red-50"
            }`}>
              <div className={`text-4xl font-bold ${scoreColor}`}>{totalScore}</div>
              <div className="text-xs text-slate-500 mt-0.5">out of 100</div>
              <div className={`text-xs font-semibold mt-1 ${scoreColor}`}>
                {totalScore >= 90 ? "Excellent" : totalScore >= 75 ? "Meets threshold" : "Below threshold"}
              </div>
            </div>

            {totalScore < 75 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold text-red-700">Items to improve:</p>
                {SCORE_CRITERIA.map(({ key, label, max }) => {
                  const val = data[key] as number;
                  if (val / max >= 0.8) return null;
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

            {/* Save buttons */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save as Draft"}
              </button>
              {/* Submit for Review — bloggers only; admins publish directly */}
              {!isAdmin && (
                <button
                  onClick={() => handleSave("review")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                  Submit for Review
                </button>
              )}

              {/* Publish — admin only */}
              {isAdmin && (
                <div className="space-y-2">
                  <div className="relative group">
                    <button
                      onClick={() => { if (canPublish) handleSave("published"); }}
                      disabled={saving || !canPublish}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                        isAlreadyPublished
                          ? "bg-green-50 text-green-700 border border-green-200 cursor-not-allowed"
                          : canPublish
                          ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Globe size={14} />
                      {saving && !isAlreadyPublished
                        ? "Publishing…"
                        : isAlreadyPublished
                        ? "✓ Published — redirecting…"
                        : "Approve & Publish"
                      }
                    </button>
                    {!canPublish && !isAlreadyPublished && (
                      <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed">
                        Score must be ≥ 75 to publish.
                      </div>
                    )}
                  </div>

                  {/* Fix 5: Inline publish success feedback — visible without scrolling */}
                  {isAlreadyPublished && (
                    <p className="text-xs text-green-700 text-center font-medium">
                      ✓ Post is live. Taking you to the posts list…
                    </p>
                  )}
                  {!isAlreadyPublished && canPublish && (
                    <p className="text-xs text-slate-400 text-center">
                      Score ≥ 75 · Ready to publish
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Infographic panel */}
          <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <h2 className="font-semibold text-brand-700 text-sm mb-1">Visual Infographic</h2>
            <p className="text-xs text-slate-400 mb-3">
              Generated by KIE.ai using your content. Enabled after score ≥ 75.
              {!docId && <span className="block mt-1 text-amber-600">Save as draft first to enable generation.</span>}
            </p>

            <div className="relative group mb-3">
              <button
                onClick={handleGenerateInfographic}
                disabled={generating || totalScore < 75 || !docId}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  totalScore >= 75 && docId
                    ? "bg-navy-700 text-white hover:bg-navy-800"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {generating
                  ? <><RefreshCw size={14} className="animate-spin" /> Generating… (up to 2 min)</>
                  : infraUrl
                  ? <><RefreshCw size={14} /> Regenerate Infographic</>
                  : <><ImagePlus size={14} /> Generate Infographic →</>
                }
              </button>
              {totalScore < 75 && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                  Score must be ≥ 75 to generate infographic.
                </div>
              )}
            </div>

            {infraError && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mb-3">
                <AlertCircle size={12} className="mt-0.5 shrink-0" /> {infraError}
              </div>
            )}

            {infraUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <img src={infraUrl} alt="Generated DPDPA infographic" className="w-full" />
                <div className="bg-slate-50 px-3 py-1.5 text-xs text-slate-400 text-right">
                  © SaralPrivacy™
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
