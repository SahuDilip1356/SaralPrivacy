import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail, ArrowUpRight } from "lucide-react";
import { DPO, VENDORS } from "@/lib/data/privacy-vendors";

export const metadata: Metadata = {
  title: "Privacy Notice: How We Handle Your Data",
  description:
    "SaralPrivacy's Privacy Notice — what we collect, why, who we share it with, where it is stored, and how to exercise your DPDPA rights.",
  alternates: { canonical: "https://saralprivacy.com/privacy" },
};

/** Inline **bold** → <strong>, preserving single newlines. */
function renderProse(text: string) {
  return text.split("\n\n").map((para, i) => (
    <p
      key={i}
      dangerouslySetInnerHTML={{
        __html: para
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
          .replace(/\n/g, "<br />"),
      }}
    />
  ));
}

const COLLECTION_ROWS = [
  {
    data: "Name and email address",
    why: "To send the briefings, guide, or report you asked for",
    basis: "Your consent",
  },
  {
    data: "Mobile number (optional)",
    why: "To reach you about a consultation you requested",
    basis: "Your consent",
  },
  {
    data: "Company, industry, company size",
    why: "To make the content and assessment results relevant to your business",
    basis: "Your consent",
  },
  {
    data: "Assessment and discovery answers",
    why: "To generate your readiness score and report",
    basis: "Contractual necessity — it is the service you asked for",
  },
  {
    data: "IP address and approximate location",
    why: "Recorded with your consent record, to evidence when and where consent was given",
    basis: "Legitimate use — Section 7",
  },
  {
    data: "Pages visited (aggregated)",
    why: "Website analytics — understanding which pages are useful",
    basis: "Not personal data — no cookie, no cross-day identifier",
  },
];

const RETENTION_ROWS = [
  { what: "Briefing subscribers", how: "Until you unsubscribe. We then keep a minimal suppression record (your email + the date) so we never email you again — full deletion on request via Your Rights" },
  { what: "Assessment and discovery reports", how: "24 months from completion" },
  { what: "Guide and template downloads", how: "24 months from download" },
  { what: "Consultation records", how: "12 months from the consultation" },
  { what: "Analytics", how: "Aggregated only; the daily visitor hash is discarded after 24 hours" },
];

const SECTIONS: Array<{ id: string; title: string; content: string }> = [
  {
    id: "who-we-are",
    title: "1. Who We Are",
    content: `${DPO.org} (${DPO.site}) is a DPDPA readiness platform for Indian businesses. We publish daily briefings, industry assessments, and practical compliance tools.

For everything described in this notice, ${DPO.org} is the **Data Fiduciary** — we decide why and how your personal data is processed.

**Data Protection Officer:** ${DPO.name}
**Contact:** ${DPO.email}`,
  },
  {
    id: "why",
    title: "3. Why We Collect It",
    content: `**Briefings and guides** — to deliver what you subscribed to or downloaded, and to send follow-up content where you separately consented to that.

**Assessments and discovery** — to score your answers, generate your report, and email it to you.

**Consultations** — to schedule the session you requested and follow up afterwards.

**Analytics** — to understand which pages are useful so we can improve them. Our analytics are cookieless and aggregated: we can see that a page was read, not who read it.

We do not:
- Sell your personal data
- Share it with third parties for their own marketing
- Send you marketing you did not consent to
- Use your assessment answers for anything except producing your report
- Use analytics cookies, or track you across sessions or other websites`,
  },
  {
    id: "legal-basis",
    title: "4. Our Legal Basis",
    content: `Under the DPDPA we rely on:

**Your consent** — for briefings, marketing, and optional contact permissions. You opted in, and you can opt out just as easily.

**Contractual necessity** — to deliver a report, guide, or consultation you specifically asked for.

**Certain legitimate uses (Section 7)** — narrowly, to keep the consent record that evidences your own opt-in.

We do not use "legitimate uses" as a backdoor for marketing. If you did not consent to it, we do not send it.`,
  },
  {
    id: "security",
    title: "8. How We Protect It",
    content: `Your data is encrypted in transit (HTTPS everywhere) and at rest by our storage providers. Access to production data is limited to those who need it and protected by authentication.

No system is perfectly secure, and we will not pretend otherwise. If a breach affects your personal data, we will notify you and the Data Protection Board of India as the DPDPA requires.`,
  },
  {
    id: "childrens-data",
    title: "10. Children's Data",
    content: `Our platform is built for businesses and is not directed at children. We do not knowingly collect personal data from anyone under 18.

Under Section 9 of the DPDPA, processing a child's data requires verifiable parental consent, and behavioural advertising to children is prohibited. We do not do either.

If you believe a child has given us personal data, email ${DPO.email} and we will delete it.`,
  },
  {
    id: "changes",
    title: "11. Changes to This Notice",
    content: `We may update this notice as our platform changes. The version and date are shown at the top of this page and in our footer.

If a change is material — a new processor, a new purpose, a new category of data — we will email subscribed users rather than quietly editing the page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Privacy Notice v2.0</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">Privacy Notice</h1>
          <p className="text-slate-300 mt-2">
            What {DPO.org} collects, why, who we share it with, and where it is stored.
          </p>
          <p className="text-sm text-slate-400 mt-1">Last updated: July 2026 | Version 2.0</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>We practice what we preach.</strong> We sell DPDPA readiness, so this notice
            names every processor we use, tells you where your data physically sits, and avoids
            the vague “we may share with selected partners” language we tell our own customers to
            delete.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Who we are */}
          <Section {...SECTIONS[0]} />

          {/* 2. What we collect — table */}
          <div id="what-we-collect" className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
            <h2 className="font-semibold text-navy-700 text-xl mb-3">2. What We Collect</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Only what the thing you asked for actually needs:
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-semibold text-slate-700 pb-2 pr-4">Data</th>
                    <th className="text-left font-semibold text-slate-700 pb-2 pr-4">Why</th>
                    <th className="text-left font-semibold text-slate-700 pb-2">Legal basis</th>
                  </tr>
                </thead>
                <tbody>
                  {COLLECTION_ROWS.map((row) => (
                    <tr key={row.data} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-slate-800 font-medium align-top">{row.data}</td>
                      <td className="py-3 pr-4 text-slate-600 align-top">{row.why}</td>
                      <td className="py-3 text-slate-500 align-top">{row.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-600 text-xs leading-relaxed">
                <strong className="text-slate-800">On high-impact data:</strong> our assessments ask
                how your business handles categories like health or financial data. Those answers
                describe your <em>practices</em> — we never ask for, and you should never send us,
                the underlying customer records themselves. We do not collect Aadhaar, PAN,
                financial account details, health records, or biometrics through this platform.
              </p>
            </div>
          </div>

          {/* 3, 4 */}
          <Section {...SECTIONS[1]} />
          <Section {...SECTIONS[2]} />

          {/* 5. Sub-processors */}
          <div id="sub-processors" className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
            <h2 className="font-semibold text-navy-700 text-xl mb-3">5. Who We Share It With</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              These are every third party that touches your personal data. Each acts as a Data
              Processor on our instructions — none may use your data for their own purposes.
            </p>
            <div className="space-y-3">
              {VENDORS.map((v) => (
                <div
                  key={v.name}
                  className="rounded-lg border border-slate-200 p-4 bg-slate-50/60"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                    <span className="font-semibold text-slate-800 text-sm">{v.name}</span>
                    <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                      {v.location}
                    </span>
                    <span
                      className={
                        v.dpa === "executed"
                          ? "text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"
                          : "text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5"
                      }
                    >
                      {v.dpa === "executed"
                        ? "Data Processing Agreement in place"
                        : "Standard Data Processing Agreement available"}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{v.purpose}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    <strong className="text-slate-600">Receives:</strong> {v.dataReceived}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mt-4">
              We do not sell your personal data, and we do not share it with anyone for their own
              marketing. If we add a processor, this list changes in the same release.
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-600 text-xs leading-relaxed">
                <strong className="text-slate-800">A note on AI:</strong> we use AI tools
                (Anthropic&apos;s Claude) to help write our briefings and blog posts. Only our own
                editorial content is sent to them — never your personal data, and never your
                assessment answers. That is why AI does not appear in the list above: it is not a
                processor of your data.
              </p>
            </div>
          </div>

          {/* 6. Cross-border */}
          <div id="cross-border" className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
            <h2 className="font-semibold text-navy-700 text-xl mb-3">6. Where Your Data Is Stored</h2>
            <div className="text-slate-600 text-sm leading-relaxed space-y-2">
              <p>
                <strong className="text-slate-800">
                  Your records are stored in Singapore, not the United States.
                </strong>{" "}
                The substantive personal data we hold — your contact details and your assessment
                answers — lives in our database&apos;s Singapore region.
              </p>
              <p>
                Supporting services process data in the United States: our hosting, email
                delivery, and analytics. The exact split is in the table above.
              </p>
              <p>
                Section 16 of the DPDPA permits transferring personal data outside India, except
                to countries the Central Government has specifically restricted. Neither Singapore
                nor the United States is restricted.
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-600 text-xs leading-relaxed">
                <strong className="text-slate-800">To be precise:</strong> this is lawful
                cross-border processing — it is not data localisation, and we do not claim it is.
                If your own business is subject to sectoral localisation rules (for example RBI
                directions on payment data), those are separate obligations that the DPDPA does not
                displace.
              </p>
            </div>
          </div>

          {/* 7. Retention */}
          <div id="retention" className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
            <h2 className="font-semibold text-navy-700 text-xl mb-3">7. How Long We Keep It</h2>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-semibold text-slate-700 pb-2 pr-4">Record</th>
                    <th className="text-left font-semibold text-slate-700 pb-2">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {RETENTION_ROWS.map((row) => (
                    <tr key={row.what} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-slate-800 font-medium align-top">{row.what}</td>
                      <td className="py-3 text-slate-600 align-top">{row.how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mt-4">
              You can ask us to delete your data sooner — see{" "}
              <Link href="/rights#erasure" className="text-green-700 underline">
                your right to erasure
              </Link>
              . We review these periods annually.
            </p>
          </div>

          {/* 8 */}
          <Section {...SECTIONS[3]} />

          {/* 9. Rights — summary, canonical detail lives on /rights */}
          <div id="data-rights" className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
            <h2 className="font-semibold text-navy-700 text-xl mb-3">9. Your Rights</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Under the DPDPA you can ask us to show you your data, correct it, delete it,
              nominate someone to act for you, or hear your complaint. You can withdraw consent at
              any time. All of it is free, and we respond within 30 days.
            </p>
            <ul className="text-slate-600 text-sm leading-relaxed space-y-1.5 list-disc pl-5 mb-4">
              <li>
                <strong className="text-slate-800">Access</strong> — a summary of what we hold
                (Section 11)
              </li>
              <li>
                <strong className="text-slate-800">Correction and erasure</strong> — fix it or
                delete it (Section 12)
              </li>
              <li>
                <strong className="text-slate-800">Withdraw consent</strong> — as easily as you
                gave it (Section 6)
              </li>
              <li>
                <strong className="text-slate-800">Nomination</strong> — appoint someone to act for
                you (Section 14)
              </li>
              <li>
                <strong className="text-slate-800">Grievance redressal</strong> — complain to us
                first (Section 13)
              </li>
            </ul>
            <Link
              href="/rights"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 underline underline-offset-2"
            >
              How to exercise each right
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* 10, 11 */}
          <Section {...SECTIONS[4]} />
          <Section {...SECTIONS[5]} />

          {/* 12. Contact */}
          <div id="contact" className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
            <h2 className="font-semibold text-navy-700 text-xl mb-3">12. Contact and Grievances</h2>
            <div className="text-slate-600 text-sm leading-relaxed space-y-2">
              <p>
                For any privacy question, request, or complaint, our Data Protection Officer is{" "}
                <strong className="text-slate-800">{DPO.name}</strong>.
              </p>
              <p>
                <strong className="text-slate-800">Email:</strong>{" "}
                <a href={`mailto:${DPO.email}`} className="text-green-700 underline">
                  {DPO.email}
                </a>
                <br />
                <strong className="text-slate-800">We respond within:</strong> 30 days
              </p>
              <p>
                If you are not satisfied with our response, you may escalate to the Data Protection
                Board of India.
              </p>
            </div>
          </div>
        </div>

        {/* Contact box */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <Mail size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-700 text-sm">
              Data Protection Officer — {DPO.name}
            </p>
            <p className="text-green-800 text-sm">
              For access, correction, erasure, or any privacy question:{" "}
              <a href={`mailto:${DPO.email}`} className="underline">
                {DPO.email}
              </a>
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/rights" className="text-xs text-green-800 underline">
                Your Rights
              </Link>
              <Link href="/consent-preferences" className="text-xs text-green-800 underline">
                Manage Consent
              </Link>
              <Link href="/rights#erasure" className="text-xs text-green-800 underline">
                Request Erasure
              </Link>
              <Link href="/unsubscribe" className="text-xs text-green-800 underline">
                Unsubscribe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, content }: { id: string; title: string; content: string }) {
  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28">
      <h2 className="font-semibold text-navy-700 text-xl mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-2">
        {renderProse(content)}
      </div>
    </div>
  );
}
