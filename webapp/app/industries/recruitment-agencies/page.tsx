import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { AssessmentCTA } from "@/components/cta/AssessmentCTA";
import { industryAssessmentCopy } from "@/lib/cta-copy";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";

const faqs = [
  {
    question: "Does the DPDPA apply to recruitment agencies?",
    answer: "Yes. Recruitment agencies process personal data of candidates — names, contact details, CVs, experience, salaries, and identity documents — making them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Compliance obligations apply regardless of agency size.",
  },
  {
    question: "Do we need consent before sharing a candidate's CV with a client company?",
    answer: "Yes. Sharing a candidate's CV with a client is a disclosure of personal data to a third party. Under DPDPA, you must have valid consent from the candidate that covers this purpose. The consent notice must clearly state that CVs may be shared with prospective employers.",
  },
  {
    question: "How long can we keep candidate data in our ATS after a placement or rejection?",
    answer: "DPDPA requires data to be deleted once the purpose for which it was collected is fulfilled. For candidates not placed, a reasonable retention window is 12–24 months for potential future roles, after which data should be erased unless the candidate opts in to remain in your database.",
  },
  {
    question: "Are background check documents like Aadhaar and PAN copies covered under DPDPA?",
    answer: "Yes. Aadhaar numbers and PAN details are personal data under DPDPA. Recruitment agencies must collect only what is necessary for the specific check, store it securely with restricted access, and delete it once the verification purpose is complete.",
  },
  {
    question: "What should we do if a candidate asks to erase their data?",
    answer: "Under Section 13 of the DPDPA, candidates have the right to erasure of personal data no longer needed for the purpose it was collected. You must acknowledge the request, verify identity, and erase the data unless retention is required by law. A documented process with a response timeline of 30 days is recommended.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Recruitment Agencies",
  description:
    "Practical DPDPA guidance for recruitment agencies covering candidate consent, CV sharing, ATS vendors, retention, and data rights workflows.",
  alternates: { canonical: 'https://saralprivacy.com/industries/recruitment-agencies' },
};

const riskAreas = [
  {
    title: "CV / Resume Databases",
    risk: "High",
    description: "Storing thousands of CVs without defined consent, purpose, or retention period creates significant exposure.",
    action: "Audit your ATS and email for all stored CVs. Implement a consent-at-submission form and a deletion policy for inactive candidates.",
  },
  {
    title: "Candidate Profile Sharing",
    risk: "High",
    description: "Sharing resumes with clients without explicit candidate consent is a disclosure violation.",
    action: "Update your candidate submission forms to include consent for specific sharing purposes. Update client agreements to reflect data sharing scope.",
  },
  {
    title: "Background Check Documents",
    risk: "High",
    description: "Aadhaar, PAN, education certificates, and employment letters collected for background checks must be handled with strict controls.",
    action: "Collect only documents necessary for the specific check. Define retention limits. Store with access restrictions.",
  },
  {
    title: "ATS and Third-Party Platforms",
    risk: "Medium",
    description: "Cloud-based ATS platforms are Data Processors. Without a Data Processing Agreement, you have unmanaged third-party risk.",
    action: "Sign DPAs with all ATS vendors. Verify their security certifications. Understand where they store data.",
  },
  {
    title: "Cross-Border Data Flows",
    risk: "Medium",
    description: "International placements or overseas clients require careful review of data transfer obligations.",
    action: "Map all cross-border data flows. Monitor permitted destinations list when notified. Update contracts with overseas clients.",
  },
  {
    title: "Candidate Data Rights",
    risk: "Medium",
    description: "Candidates can request access, correction, or deletion of their data. Without a process, you risk Board complaints.",
    action: "Create a candidate data rights request process. Publish contact details in your job posting terms and website.",
  },
];

const checklistItems = [
  "Map all candidate data locations (ATS, email, cloud, spreadsheets)",
  "Add consent language to all candidate submission forms",
  "Separate consent: data storage vs profile sharing vs future opportunities",
  "Define and document candidate data retention periods",
  "Implement a deletion process for inactive candidates (e.g., 12 months post-rejection)",
  "Sign Data Processing Agreements with all ATS and HR tech vendors",
  "Update client agreements to specify data sharing scope and restrictions",
  "Create a candidate data rights request process and publish it",
  "Train recruiters on what data they can share and with whom",
  "Audit cloud storage and email for legacy candidate data",
];

export default function RecruitmentIndustryPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'Industries', url: 'https://saralprivacy.com/industries' },
        { name: 'Recruitment Agencies', url: 'https://saralprivacy.com/industries/recruitment-agencies' },
      ])}
      {faqPageSchema(faqs, {
        url: 'https://saralprivacy.com/industries/recruitment-agencies',
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com/industries/recruitment-agencies')}
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <span className="text-green-300 text-sm font-semibold">Industry Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            DPDPA for Recruitment and Staffing Agencies
          </h1>
          <div className="answer-block bg-white/10 border border-white/20 rounded-xl px-5 py-4 max-w-2xl mb-6" data-speakable="true">
            <p className="text-slate-200 text-sm leading-relaxed">Recruitment agencies sit on a mountain of personal data: CVs, job applications, background documents, interview notes, and client submissions. Under DPDPA, your biggest risks usually sit in candidate consent, profile sharing, ATS vendors, retention, and rights handling. This guide shows where recruitment workflows break, and what to tighten before they become liabilities.</p>
            <p className="text-green-300 text-xs mt-2 font-medium">If your CV database has no clear consent, purpose, or deletion logic, it is not a talent asset. It is a compliance trap.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-700/40 border border-green-500/50 rounded-full px-3.5 py-1.5">
            <span className="text-green-300 text-xs font-semibold">
              &ldquo;Find out whether your recruitment workflows create DPDPA exposure in 10 minutes.&rdquo;
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Byline lastReviewed={FRESHNESS.industry} className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Risk areas */}
            <div>
              <h2 className="text-2xl font-bold text-navy-700 mb-5">Key Risk Areas</h2>
              <div className="space-y-4">
                {riskAreas.map((area) => (
                  <div key={area.title} className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-navy-700 text-base">{area.title}</h3>
                      <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                        area.risk === "High"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {area.risk} Risk
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">{area.description}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700 text-xs">
                        <strong>Recommended action: </strong>{area.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h2 className="text-2xl font-bold text-navy-700 mb-5">Compliance Checklist</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="space-y-3">
                  {checklistItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border-2 border-slate-300 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry-specific Assessment CTA */}
            <AssessmentCTA
              variant="full"
              copy={industryAssessmentCopy["recruitment-agencies"]}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Assessment CTA */}
            <div className="bg-green-500 rounded-xl p-5 text-white">
              <h3 className="font-bold text-base mb-2">Take the Free Assessment</h3>
              <p className="text-green-100 text-sm mb-4">
                8 questions. 10 minutes. Get your personalised risk score and recommendations.
              </p>
              <Link
                href="/assessment/recruitment"
                className="block text-center py-2.5 px-4 bg-white text-green-700 font-bold rounded-lg text-sm hover:bg-green-50 transition-colors"
              >
                Start Assessment →
              </Link>
            </div>

            {/* White Paper */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-2">Free White Paper</h3>
              <p className="text-slate-600 text-xs mb-3">45-page visual guide to DPDPA compliance for Indian businesses.</p>
              <Link
                href="/white-paper"
                className="block text-center py-2.5 px-4 bg-navy-700 text-white font-semibold rounded-lg text-sm hover:bg-navy-800 transition-colors"
              >
                Download DPDPA White Paper →
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-3">Related Briefings</h3>
              <div className="space-y-2">
                <Link href="/briefings/recruitment-agencies-dpdpa-cv-database-risk" className="block text-sm text-green-600 hover:underline">
                  → CV Database Risk for Recruitment Agencies
                </Link>
                <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-sm text-green-600 hover:underline">
                  → Consent Notice Requirements
                </Link>
                <Link href="/briefings/rights-of-data-principals-dpdpa-explained" className="block text-sm text-green-600 hover:underline">
                  → Rights of Data Principals
                </Link>
              </div>
            </div>

            {/* Consultation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-2">Need specific guidance?</h3>
              <p className="text-slate-600 text-xs mb-3">
                Our advisory team has worked with recruitment agencies of all sizes on DPDPA compliance.
              </p>
              <Link
                href="/contact"
                className="block text-center py-2.5 px-4 bg-navy-700 text-white font-semibold rounded-lg text-sm hover:bg-navy-800 transition-colors"
              >
                Request Consultation →
              </Link>
            </div>
          </div>
        </div>
        <div data-nosnippet className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
      </div>
    </div>
    </>
  );
}
