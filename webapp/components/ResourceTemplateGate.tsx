"use client";
import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

const STORAGE_KEY = "sp_rg_v1";

const EMPLOYEE_OPTIONS = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
];

export interface ResourceTemplate {
  title: string;
  file: string;
  tag: string;
  desc: string;
}

interface Props {
  templates: ResourceTemplate[];
}

export default function ResourceTemplateGate({ templates }: Props) {
  const [pendingTemplate, setPendingTemplate] = useState<ResourceTemplate | null>(null);
  const [gateCompleted, setGateCompleted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    contactName: "",
    businessName: "",
    employees: "",
    phone: "",
    consentContact: false,
    consentBriefings: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setGateCompleted(!!localStorage.getItem(STORAGE_KEY));
  }, []);

  const triggerDownload = (file: string) => {
    const a = document.createElement("a");
    a.href = `/templates/${file}`;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClick = (template: ResourceTemplate) => {
    if (gateCompleted) {
      triggerDownload(template.file);
    } else {
      setPendingTemplate(template);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.contactName || !form.businessName || !form.employees || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/template-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:            form.email,
          contactName:      form.contactName,
          businessName:     form.businessName,
          employees:        form.employees,
          phone:            form.phone,
          consentContact:   form.consentContact,
          consentBriefings: form.consentBriefings,
          templateName:     pendingTemplate?.title ?? "",
          reportToken:      "",
          source:           "resources_page",
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(STORAGE_KEY, "1");
        setGateCompleted(true);
        if (pendingTemplate) triggerDownload(pendingTemplate.file);
        setPendingTemplate(null);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Template list */}
      <div className="space-y-3">
        {templates.map((t) => (
          <button
            key={t.title}
            onClick={() => handleClick(t)}
            className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#1E3A5F]/30 hover:bg-slate-50 transition-colors group text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1E3A5F]">{t.title}</p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 whitespace-nowrap">{t.tag}</span>
              </div>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </div>
            <Download size={15} className="text-[#E07B39] ml-4 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Gate modal */}
      {pendingTemplate && !gateCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setPendingTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X size={16} />
            </button>

            <div className="mb-5">
              <p className="text-xs font-semibold text-[#E07B39] uppercase tracking-wide mb-1">Free Download</p>
              <h2 className="text-lg font-semibold text-[#1E3A5F]">{pendingTemplate.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Tell us about your business to download this template. All 5 templates unlock instantly after this.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => setForm(f => ({ ...f, contactName: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm(f => ({ ...f, businessName: e.target.value }))}
                  placeholder="e.g. Acme Solutions Pvt Ltd"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Number of Employees *</label>
                <select
                  required
                  value={form.employees}
                  onChange={(e) => setForm(f => ({ ...f, employees: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 bg-white"
                >
                  <option value="">Select size</option>
                  {EMPLOYEE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
                />
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="rg-consent"
                  checked={form.consentContact}
                  onChange={(e) => setForm(f => ({ ...f, consentContact: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[#1E3A5F] flex-shrink-0"
                />
                <label htmlFor="rg-consent" className="text-xs text-slate-500 leading-relaxed">
                  I agree to SaralPrivacy contacting me about DPDPA compliance guidance. I can opt out at any time.
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="rg-briefings"
                  checked={form.consentBriefings}
                  onChange={(e) => setForm(f => ({ ...f, consentBriefings: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[#1E3A5F] flex-shrink-0"
                />
                <label htmlFor="rg-briefings" className="text-xs text-slate-500 leading-relaxed">
                  Also send me free daily DPDPA briefings (2-min reads, unsubscribe anytime).
                </label>
              </div>

              {error && <p className="text-xs text-red-500 pt-1">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1E3A5F] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#162d4a] disabled:opacity-50 transition-colors mt-1"
              >
                <Download size={14} />
                {submitting ? "Preparing download…" : "Download Template"}
              </button>
            </form>

            <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
              Your details are handled under our{" "}
              <a href="/privacy-policy" className="underline">Privacy Notice</a>.
              We will never share your data with third parties.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
