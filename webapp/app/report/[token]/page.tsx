import { Metadata } from "next";
import { notFound } from "next/navigation";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { QUESTIONS } from "@/lib/data/dpdpa-assessment";

export const metadata: Metadata = {
  title: "DPDPA Readiness Report | SaralPrivacy",
  robots: { index: false, follow: false },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreStatus(s: number): { label: string; color: string; bg: string; bar: string } {
  if (s >= 70) return { label: "Strong",     color: "text-green-700",  bg: "bg-green-50",  bar: "bg-green-500"  };
  if (s >= 40) return { label: "Developing", color: "text-amber-700",  bg: "bg-amber-50",  bar: "bg-amber-500"  };
  return              { label: "Needs Work", color: "text-red-700",    bg: "bg-red-50",    bar: "bg-red-500"    };
}

function ScoreBar({ label, score, dpdpa }: { label: string; score: number; dpdpa: string }) {
  const st  = scoreStatus(score);
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <span className="ml-2 text-xs text-slate-400">{dpdpa}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{score}/100</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${st.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </section>
  );
}

function buildAnswerSummary(answers: Record<string, unknown>) {
  const result: Array<{ question: string; answer: string }> = [];
  for (const q of QUESTIONS) {
    const val = answers[q.key as keyof typeof answers];
    if (!val) continue;
    if (Array.isArray(val)) {
      const texts = (val as string[]).map((id) => q.options.find((o) => o.id === id)?.text).filter(Boolean) as string[];
      if (texts.length) result.push({ question: q.text, answer: texts.join(", ") });
    } else {
      const opt = q.options.find((o) => o.id === val);
      if (opt) result.push({ question: q.text, answer: opt.text });
    }
  }
  return result;
}

function computeProjection(score: number, cats: Record<string, number>) {
  const gaps = Object.values(cats).filter((v) => v < 70).length;
  const potential = gaps * 10;
  const conservative = Math.min(100, score + Math.round(potential * 0.3));
  const likely      = Math.min(100, score + Math.round(potential * 0.6));
  const bestCase    = Math.min(100, score + Math.round(potential * 0.9));
  return { conservative, likely, bestCase };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Fetch assessment by report_token
  let doc: Record<string, unknown> | null = null;
  try {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.ASSESSMENTS, [
      Query.equal("report_token", [token]),
      Query.limit(1),
    ]);
    doc = (res.documents[0] as Record<string, unknown>) ?? null;
  } catch {
    notFound();
  }

  if (!doc) notFound();

  // Check token expiry
  const expiresAt = doc.report_token_expires_at as string | undefined;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">This report has expired</h1>
          <p className="text-slate-500 mb-6">Report links are valid for 90 days. Retake the assessment to get a fresh report.</p>
          <a href="/assessment" className="inline-block bg-[#1E3A5F] text-white font-semibold px-6 py-3 rounded-xl text-sm">
            Retake Assessment →
          </a>
        </div>
      </div>
    );
  }

  // Parse stored JSON fields
  let categoryScores: Record<string, number> = {};
  let answers: Record<string, unknown> = {};
  let redFlags: string[] = [];
  let immediateActions: string[] = [];
  let thirtyDayActions: string[] = [];
  try { categoryScores   = JSON.parse(doc.category_scores_json as string || "{}"); } catch { /* noop */ }
  try { answers          = JSON.parse(doc.answers_json           as string || "{}"); } catch { /* noop */ }
  try { redFlags         = JSON.parse(doc.red_flags_json         as string || "[]"); } catch { /* noop */ }
  try { immediateActions = JSON.parse(doc.immediate_actions_json as string || "[]"); } catch { /* noop */ }
  try { thirtyDayActions = JSON.parse(doc.thirty_day_actions_json as string || "[]"); } catch { /* noop */ }

  const score       = (doc.final_score as number) || (doc.overall_score as number) || 0;
  const band        = (doc.verdict_band as string) || "Early Stage";
  const businessName = (doc.business_name as string) || "";
  const name        = (doc.name as string) || "";
  const answerSummary = buildAnswerSummary(answers);
  const projection  = computeProjection(score, categoryScores);

  // 5 display blocks mapped from 6 engine categories
  const dataInventoryScore = categoryScores.retentionDeletion !== undefined
    ? Math.round(((categoryScores.retentionDeletion ?? 0) + (categoryScores.vendorPartnerRisk ?? 0)) / 2)
    : 0;

  const BAND_COLOR: Record<string, string> = {
    "Not Started":           "text-red-600",
    "Early Stage":           "text-orange-500",
    "Building Foundations":  "text-yellow-600",
    "Progressing Well":      "text-lime-600",
    "Operationally Strong":  "text-green-600",
  };
  const BAND_HEX: Record<string, string> = {
    "Not Started":           "#DC2626",
    "Early Stage":           "#F97316",
    "Building Foundations":  "#EAB308",
    "Progressing Well":      "#65A30D",
    "Operationally Strong":  "#16A34A",
  };
  const BAND_BG: Record<string, string> = {
    "Not Started":           "bg-red-50 border-red-200",
    "Early Stage":           "bg-orange-50 border-orange-200",
    "Building Foundations":  "bg-yellow-50 border-yellow-200",
    "Progressing Well":      "bg-lime-50 border-lime-200",
    "Operationally Strong":  "bg-green-50 border-green-200",
  };
  const BAND_DESCRIPTIONS: Record<string, string> = {
    "Not Started":           "Your business shows high exposure or very weak controls. Immediate action is needed on the fundamentals before your risk compounds.",
    "Early Stage":           "You have some awareness of DPDPA obligations but important gaps remain. A focused 30-day effort will close most of the critical gaps.",
    "Building Foundations":  "Basic elements exist but are not applied consistently across your business. Focus on ownership, consent, and operational readiness.",
    "Progressing Well":      "Good momentum and some operational maturity. Tighten documentation, vendor controls, and test your incident response.",
    "Operationally Strong":  "Strong readiness signals across most areas. Your controls are well above average for Indian MSMEs.",
  };

  const bandColor = BAND_COLOR[band] ?? "text-orange-500";
  const bandBg    = BAND_BG[band]    ?? "bg-orange-50 border-orange-200";
  const bandHex   = BAND_HEX[band]   ?? "#F97316";
  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Report header */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">DPDPA Readiness Assessment — Your Report</p>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">
            {businessName ? `${businessName}'s Readiness Report` : "Your DPDPA Readiness Report"}
          </h1>
          {name && <p className="text-sm text-slate-500 mt-0.5">Prepared for {name}</p>}
        </div>

        {/* Section 1: Executive Summary */}
        <Section title="Executive Summary">
          <div className={`rounded-xl border px-5 py-4 mb-4 ${bandBg}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className={`text-5xl font-black ${bandColor}`}>{score}</div>
                <div className="text-sm text-slate-500">out of 100</div>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${bandBg} ${bandColor}`}>
                {band}
              </span>
            </div>
            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full opacity-80"
                style={{ width: `${score}%`, backgroundColor: bandHex }}
              />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{BAND_DESCRIPTIONS[band]}</p>
          </div>
          {expiryDate && (
            <p className="text-xs text-slate-400 text-right">Report valid until {expiryDate}</p>
          )}
        </Section>

        {/* Section 2: 5 Scoring Blocks */}
        {Object.keys(categoryScores).length > 0 && (
          <Section title="Your Readiness by Area">
            <p className="text-sm text-slate-500 mb-4">These 5 areas explain why your overall score is {score}/100.</p>
            <ScoreBar label="Notice & Consent"                  score={categoryScores.noticeConsent       ?? 0} dpdpa="Sections 7, 9"    />
            <ScoreBar label="Data Inventory & Storage"          score={dataInventoryScore}                     dpdpa="Section 8, Principle 2" />
            <ScoreBar label="Data Principal Rights & Control"   score={categoryScores.accessControl       ?? 0} dpdpa="Sections 12–14"  />
            <ScoreBar label="Ownership & Governance"            score={categoryScores.ownershipGovernance ?? 0} dpdpa="Sections 8, 10"  />
            <ScoreBar label="Incident & Operational Readiness"  score={categoryScores.incidentReadiness   ?? 0} dpdpa="Section 8(6–7)"  />
          </Section>
        )}

        {/* Section 3: Your Answers */}
        {answerSummary.length > 0 && (
          <Section title="Your Responses">
            <p className="text-sm text-slate-500 mb-4">These are the answers you provided during the assessment.</p>
            <div className="space-y-3">
              {answerSummary.map((row, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3.5">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Q{i + 1}</p>
                  <p className="text-sm font-medium text-slate-700 mb-1">{row.question}</p>
                  <p className="text-sm font-semibold text-[#E07B39]">{row.answer}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 4: Red Flags */}
        {redFlags.length > 0 && (
          <Section title="Risk Flags Detected">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <ul className="space-y-2">
                {redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="mt-0.5 text-red-500 flex-shrink-0">⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Section 5: Quick Wins */}
        {immediateActions.length > 0 && (
          <Section title="Quick Wins — Do This Week">
            <p className="text-sm text-slate-500 mb-4">These actions have the highest impact on your score. Focus on these first.</p>
            <div className="space-y-3">
              {immediateActions.map((action, i) => (
                <div key={i} className="flex gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-[#1E3A5F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 6: 30-Day Plan */}
        {thirtyDayActions.length > 0 && (
          <Section title="30-Day Plan">
            <p className="text-sm text-slate-500 mb-4">After completing quick wins, work through these for sustained improvement.</p>
            <div className="space-y-2">
              {thirtyDayActions.map((action, i) => (
                <div key={i} className="flex gap-3 items-start py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-[#E07B39] font-bold text-sm flex-shrink-0">→</span>
                  <p className="text-sm text-slate-700">{action}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 7: Score Projection */}
        <Section title="Score Projection">
          <p className="text-sm text-slate-500 mb-5">If you implement the quick wins above and retake the assessment in 14 days:</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Conservative", value: projection.conservative, color: "border-slate-200 bg-slate-50" },
              { label: "Likely",       value: projection.likely,       color: "border-[#1E3A5F]/20 bg-[#1E3A5F]/5" },
              { label: "Best Case",    value: projection.bestCase,     color: "border-green-200 bg-green-50" },
            ].map((p) => (
              <div key={p.label} className={`border rounded-xl p-3 text-center ${p.color}`}>
                <div className="text-2xl font-black text-slate-800">{p.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Projection assumes quick wins are implemented and reflected in reassessment answers. Ranges are estimates, not guarantees.
          </p>
        </Section>

        {/* Section 8: Downloadable Resources */}
        <Section title="Free Templates — Download &amp; Adapt">
          <p className="text-sm text-slate-500 mb-4">DPDPA-aligned templates to help you close the gaps identified above. Click to open in Google Docs/Sheets, then make a copy for your business.</p>
          <div className="space-y-3">
            {[
              {
                title: "Data Inventory Register",
                desc:  "Map every data type, storage location, retention period, and legal basis — the foundation of DPDPA compliance",
                href:  "https://docs.google.com/spreadsheets/d/1BDx_ogcBa1sxrXocGLXVFa43KV58VbDX4sdZKTtqgDs/edit?usp=sharing",
                tag:   "Google Sheet",
              },
              {
                title: "Privacy Notice Template",
                desc:  "DPDPA-aligned privacy notice covering all 10 required sections — adapt for your website, app, or printed materials",
                href:  "https://docs.google.com/document/d/1Fk4flzdHr8krs9qNl3HWLrgXdZFD6CRwdOYlnx7bU08/edit?usp=sharing",
                tag:   "Google Doc",
              },
              {
                title: "Consent Language Examples",
                desc:  "8 ready-to-use consent statements for website forms, WhatsApp, checkout, app onboarding, in-person, and employee data",
                href:  "https://docs.google.com/document/d/1ATzdVDG8uZxHl13MYFDJwVozx5EcoQ1kGLq6XcltUWo/edit?usp=sharing",
                tag:   "Google Doc",
              },
              {
                title: "DSR & Grievance Handling SOP",
                desc:  "Step-by-step process to handle access, correction, erasure, and grievance requests from customers and employees",
                href:  "https://docs.google.com/document/d/1OOmymHsA8wmFwmU86D9BoydRIu0NeByUMCv8UShaUu8/edit?usp=sharing",
                tag:   "Google Doc",
              },
              {
                title: "Vendor Data-Sharing Register",
                desc:  "Track every third party who receives personal data, what DPAs are in place, and when to review each relationship",
                href:  "https://docs.google.com/spreadsheets/d/1ddNx1HbWgqY0N9NqpDVXsOkjDIBcX3OzC6qu-74swRU/edit?usp=sharing",
                tag:   "Google Sheet",
              },
              {
                title: "DPDPA White Paper",
                desc:  "Comprehensive plain-English guide to the Digital Personal Data Protection Act for Indian businesses",
                href:  "https://saralprivacy.com/white-paper",
                tag:   "PDF Guide",
              },
            ].map((r) => (
              <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#1E3A5F]/30 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1E3A5F]">{r.title}</p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 whitespace-nowrap">{r.tag}</span>
                  </div>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
                <span className="text-[#E07B39] font-bold text-sm ml-4 flex-shrink-0">↓</span>
              </a>
            ))}
          </div>
        </Section>

        {/* Section 9: Reassessment CTA */}
        <div className="bg-[#1E3A5F] rounded-2xl p-6 mb-5 text-center">
          <h2 className="text-lg font-bold text-white mb-1">Track Your Improvement</h2>
          <p className="text-sm text-white/70 mb-4">
            Implement the quick wins, then retake the assessment in 14 days to measure your progress.
          </p>
          <a href="/assessment"
            className="inline-block bg-[#E07B39] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#c96a2e] transition-colors">
            Retake Assessment →
          </a>
        </div>

        {/* Section 10: Implementation Support */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 text-center">
          <h2 className="text-base font-bold text-[#1E3A5F] mb-1">Need help moving from diagnosis to execution?</h2>
          <p className="text-sm text-slate-500 mb-4">
            Our experts help Indian businesses implement DPDPA-ready practices — from privacy notices to data inventory.
          </p>
          <a href="https://saralprivacy.com/contact"
            className="inline-block border-2 border-[#1E3A5F] text-[#1E3A5F] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#1E3A5F] hover:text-white transition-colors">
            Book Expert Consultation →
          </a>
        </div>

        {/* Footer disclaimer */}
        <div className="text-center pb-8">
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
            <strong className="text-slate-500">Disclaimer:</strong> Information on this report is for educational purposes only and does not constitute formal legal advice. Consult a qualified professional for legal guidance.
          </p>
          <p className="text-xs text-slate-300 mt-2">
            Generated by <a href="https://saralprivacy.com" className="underline">SaralPrivacy</a> · DPDPA Compliance Made Simple
          </p>
        </div>

      </div>
    </div>
  );
}
