"use client";

import { useState } from "react";
import { FileText, CheckCircle, Download, Shield, Lock } from "lucide-react";
import { Input, Select, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";

const industryOptions = [
  { value: "recruitment", label: "Recruitment & Staffing" },
  { value: "ca-firms", label: "CA / Accounting Firm" },
  { value: "training-institutes", label: "Training / Coaching Institute" },
  { value: "d2c-brands", label: "D2C / E-commerce Brand" },
  { value: "healthcare", label: "Healthcare" },
  { value: "fintech", label: "Fintech / Financial Services" },
  { value: "general", label: "Other / General Business" },
];

const companySizeOptions = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const whitePaperSections = [
  "Understanding DPDPA — scope, key definitions, and applicability",
  "Data Fiduciary vs Data Processor — which are you and what does it mean?",
  "Consent framework — what valid consent looks like under DPDPA",
  "Notice requirements — what you must tell individuals before collecting data",
  "Rights of individuals — access, correction, erasure, and grievance",
  "Data breach obligations — notification timelines and scope",
  "Sector breakdown — recruitment, CA firms, training institutes, D2C",
  "Penalty structure — what violations attract what penalties",
  "30-day compliance action plan — prioritised steps for each sector",
];

export default function WhitePaperContent() {
  const [form, setForm] = useState({
    fullName: "",
    workEmail: "",
    mobileNumber: "",
    companyName: "",
    industry: "",
    companySize: "",
    consentEmail: false,
    consentPhone: false,
    consentWebinars: false,
  });
  const [submitted, setSubmitted]     = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName) e.fullName = "Required";
    if (!form.workEmail || !/\S+@\S+\.\S+/.test(form.workEmail)) e.workEmail = "Valid email required";
    if (!form.companyName) e.companyName = "Required";
    if (!form.industry) e.industry = "Please select your industry";
    if (!form.companySize) e.companySize = "Please select company size";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/white-paper", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setSubmitted(true);
      } else {
        setServerError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-brand-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1.5 mb-4">
              <FileText size={12} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold">45-page practitioner guide · Free</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              DPDPA: The Complete Guide for Indian Businesses
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Everything your business needs to understand the Digital Personal Data Protection Act —
              from applicability to enforcement — in plain English, with sector-specific guidance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: about the white paper */}
          <div>
            <h2 className="text-2xl font-bold text-brand-700 mb-5">
              What&apos;s inside the white paper
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <ul className="space-y-3">
                {whitePaperSections.map((section, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-lg bg-saffron-50 border border-saffron-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-saffron-600 text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    {section}
                  </li>
                ))}
              </ul>
            </div>

            {/* Who it is for */}
            <div className="bg-brand-700 rounded-xl p-6">
              <h3 className="font-bold text-white text-base mb-3">Who this is for</h3>
              <div className="space-y-2">
                {[
                  "Founders and CEOs of Indian SMEs",
                  "Operations, HR, and compliance heads",
                  "Recruitment agency owners and managers",
                  "CA firm partners and senior staff",
                  "Training institute directors and admin leads",
                  "D2C brand founders and marketing leads",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle size={14} className="text-saffron-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: download form */}
          <div>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-green-800 text-xl mb-2">Your download is ready</h3>
                <p className="text-green-700 text-sm mb-5">
                  We&apos;ve sent a download link to your email. The white paper is also available below.
                </p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg text-sm hover:bg-green-800 transition-colors"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
                <h2 className="font-bold text-brand-700 text-lg mb-1">
                  Get the white paper — free
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Fill in your details to download. We use this to understand who reads our content
                  and to send you relevant follow-ups (only if you opt in).
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Priya Sharma"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      error={errors.fullName}
                      required
                    />
                    <Input
                      label="Work Email"
                      type="email"
                      placeholder="priya@firm.in"
                      value={form.workEmail}
                      onChange={(e) => update("workEmail", e.target.value)}
                      error={errors.workEmail}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Mobile Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.mobileNumber}
                      onChange={(e) => update("mobileNumber", e.target.value)}
                    />
                    <Input
                      label="Company Name"
                      placeholder="Your Company Ltd."
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                      error={errors.companyName}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Industry"
                      options={industryOptions}
                      placeholder="Select your industry"
                      value={form.industry}
                      onChange={(e) => update("industry", e.target.value)}
                      error={errors.industry}
                      required
                    />
                    <Select
                      label="Company Size"
                      options={companySizeOptions}
                      placeholder="Select size"
                      value={form.companySize}
                      onChange={(e) => update("companySize", e.target.value)}
                      error={errors.companySize}
                      required
                    />
                  </div>

                  {/* Consent section */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-saffron-500" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Consent — please read and choose
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      We collect your information to deliver the white paper and, only if you
                      consent below, to send relevant follow-up content. Each consent below is
                      separate and optional. No boxes are pre-checked.
                    </p>

                    <Checkbox
                      label="I consent to receive DPDPA briefings, updates, and educational content from SaralPrivacy by email."
                      checked={form.consentEmail}
                      onChange={(e) => update("consentEmail", e.target.checked)}
                      description="You can unsubscribe at any time. We do not share your email with third parties for marketing."
                    />

                    <Checkbox
                      label="I consent to being contacted by phone or WhatsApp about DPDPA assessments or advisory services."
                      checked={form.consentPhone}
                      onChange={(e) => update("consentPhone", e.target.checked)}
                      description="We will only call during business hours. You can withdraw this consent at any time."
                    />

                    <Checkbox
                      label="I consent to receiving invitations to DPDPA webinars, events, and additional resources."
                      checked={form.consentWebinars}
                      onChange={(e) => update("consentWebinars", e.target.checked)}
                    />

                    <p className="text-xs text-slate-400 pt-1">
                      Your data is processed under our{" "}
                      <a href="/privacy" className="text-saffron-500 underline">Privacy Notice</a>{" "}
                      (v{PRIVACY_NOTICE_VERSION}). You can request access, correction, or erasure
                      at any time by emailing{" "}
                      <a href="mailto:privacy@saralprivacy.com" className="text-saffron-500 underline">
                        privacy@saralprivacy.com
                      </a>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Lock size={12} className="shrink-0" />
                    Secure submission. Your data is not shared with third parties for marketing.
                  </div>

                  {serverError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
                  )}

                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    loading={loading}
                  >
                    <Download size={18} />
                    Download White Paper
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
