"use client";

import { useState } from "react";
import { Phone, Mail, MessageSquare, CheckCircle, Shield, Calendar } from "lucide-react";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

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
  { value: "1000+", label: "1000+ employees" },
];

const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "video", label: "Video call" },
];

const preferredTimes = [
  { value: "morning", label: "Morning (9am – 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm – 4pm)" },
  { value: "evening", label: "Evening (4pm – 7pm)" },
  { value: "flexible", label: "Flexible / Anytime" },
];

export default function ContactContent() {
  const [form, setForm] = useState({
    fullName: "",
    workEmail: "",
    mobileNumber: "",
    companyName: "",
    industry: "",
    companySize: "",
    issueSummary: "",
    preferredContact: "",
    preferredTime: "",
    consentContact: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        trackEvent.consultationRequest({
          industry:          form.industry,
          preferred_contact: form.preferredContact,
        });
        setSubmitted(true);
      }
    } catch {
      // non-blocking — still show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Request a Free Consultation
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Tell us about your business and your DPDPA situation. We&apos;ll respond within one
              business day with a proposed time for a free 30-minute call.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar */}
          <div className="space-y-5">
            {/* What to expect */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-4">What to expect</h3>
              <div className="space-y-4">
                {[
                  { icon: Calendar, title: "Response within 1 business day", desc: "We confirm a time that works for you." },
                  { icon: Phone, title: "30-minute free call", desc: "Discovery call with our advisory team." },
                  { icon: Mail, title: "Written summary after the call", desc: "Next steps and recommendations by email." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy-700">{title}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact alternatives */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-3">Direct contact</h3>
              <div className="space-y-3">
                <a
                  href="mailto:privacy@saralprivacy.com"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors"
                >
                  <Mail size={14} className="text-green-500" />
                  privacy@saralprivacy.com
                </a>
                <a
                  href="mailto:privacy@saralprivacy.com"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors"
                >
                  <Shield size={14} className="text-green-500" />
                  privacy@saralprivacy.com (data requests)
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Note:</strong> This consultation is an advisory and educational service. It
                does not constitute formal legal advice. For a formal legal opinion, please engage a
                qualified data protection lawyer.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <CheckCircle size={40} className="text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-green-800 text-xl mb-2">Request received</h3>
                <p className="text-green-700 text-sm leading-relaxed">
                  Thank you for reaching out. We will review your details and respond within one
                  business day to confirm a call time. Check your inbox — including your spam
                  folder.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
                <h2 className="font-bold text-navy-700 text-lg mb-1">Consultation Request</h2>
                <p className="text-slate-500 text-sm mb-6">
                  All fields marked * are required. We will use this information to prepare for your call.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Rajesh Mehta"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      required
                    />
                    <Input
                      label="Work Email"
                      type="email"
                      placeholder="rajesh@yourfirm.in"
                      value={form.workEmail}
                      onChange={(e) => update("workEmail", e.target.value)}
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
                      required
                    />
                    <Input
                      label="Company Name"
                      placeholder="Mehta Associates"
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
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
                      required
                    />
                    <Select
                      label="Company Size"
                      options={companySizeOptions}
                      placeholder="Select size"
                      value={form.companySize}
                      onChange={(e) => update("companySize", e.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Briefly describe your situation or question"
                    placeholder="E.g. We run a recruitment agency with 200 clients and store candidate CVs in Google Drive. We want to understand what we need to change for DPDPA."
                    value={form.issueSummary}
                    onChange={(e) => update("issueSummary", e.target.value)}
                    rows={4}
                    required
                    hint="A brief description helps us prepare. No need for technical detail — plain English is fine."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Preferred contact method"
                      options={contactMethods}
                      placeholder="Select method"
                      value={form.preferredContact}
                      onChange={(e) => update("preferredContact", e.target.value)}
                    />
                    <Select
                      label="Preferred time"
                      options={preferredTimes}
                      placeholder="Select time"
                      value={form.preferredTime}
                      onChange={(e) => update("preferredTime", e.target.value)}
                    />
                  </div>

                  {/* Consent */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={14} className="text-green-500" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Consent</p>
                    </div>
                    <Checkbox
                      label={
                        <span>
                          I consent to SaralPrivacy contacting me via my chosen method to discuss my
                          DPDPA consultation request.{" "}
                          <span className="text-slate-500">
                            I understand this is for the purpose of scheduling and conducting an
                            advisory call only.
                          </span>
                        </span>
                      }
                      checked={form.consentContact}
                      onChange={(e) => update("consentContact", e.target.checked)}
                      required
                    />
                    <p className="text-xs text-slate-400 mt-2 pl-7">
                      Your data is handled under our{" "}
                      <a href="/privacy" className="text-green-500 underline">Privacy Notice</a>.
                      You can withdraw this consent by emailing privacy@saralprivacy.com.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={loading}
                    disabled={!form.consentContact}
                  >
                    Submit Consultation Request
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
