import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { articleSchema, breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { topicNav } from "@/lib/learnNav";
import { linkifyText } from "@/lib/linkifyText";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";

export const metadata: Metadata = {
  title: "DPDP Rules 2025: Plain-English Guide",
  description:
    "Read the DPDP Rules 2025 in simple English. A section-by-section guide covering every Rule and Schedule under the Digital Personal Data Protection Rules, 2025.",
  alternates: { canonical: "https://saralprivacy.com/learn/dpdp-rules-2025-plain-english-guide" },
  openGraph: {
    type: "article",
    url: "https://saralprivacy.com/learn/dpdp-rules-2025-plain-english-guide",
    title: "DPDP Rules 2025: Plain-English Guide",
    description:
      "Read the DPDP Rules 2025 in simple English. A section-by-section guide covering every Rule and Schedule under the Digital Personal Data Protection Rules, 2025.",
  },
};

const faqs = [
  {
    question: "What are the DPDP Rules, 2025?",
    answer:
      "The DPDP Rules, 2025 set out the operational details under the Digital Personal Data Protection Act, 2023.",
  },
  {
    question: "When do the DPDP Rules, 2025 come into force?",
    answer:
      "Different Rules come into force on different dates. Some start on the date of publication, some after one year, and others after eighteen months.",
  },
  {
    question: "How many Rules are there in the DPDP Rules, 2025?",
    answer: "There are 23 Rules in the Digital Personal Data Protection Rules, 2025.",
  },
  {
    question: "How many Schedules are there in the DPDP Rules, 2025?",
    answer: "There are 7 Schedules in the Rules.",
  },
  {
    question: "Does Rule 3 deal with notice?",
    answer:
      "Yes. Rule 3 sets out what a Data Fiduciary notice must contain and says it must be clear and in plain language.",
  },
  {
    question: "Does Rule 7 deal with personal data breach?",
    answer:
      "Yes. Rule 7 covers intimation of personal data breach to affected Data Principals and to the Board.",
  },
  {
    question: "Does Rule 10 deal with child consent?",
    answer:
      "Yes. Rule 10 deals with verifiable consent for processing personal data of a child.",
  },
  {
    question: "Does Rule 13 apply to Significant Data Fiduciaries?",
    answer:
      "Yes. Rule 13 sets out additional obligations for Significant Data Fiduciaries.",
  },
  {
    question: "Does Rule 15 allow transfer of personal data outside India?",
    answer:
      "Yes. Rule 15 allows transfer outside India, subject to any restriction specified by the Central Government.",
  },
  {
    question: "Does Rule 22 allow digital appeals?",
    answer:
      "Yes. Rule 22 provides for appeal to the Appellate Tribunal in digital form.",
  },
];

const tocRules = [
  { id: "rule-1", label: "Rule 1. Short title and commencement" },
  { id: "rule-2", label: "Rule 2. Definitions" },
  { id: "rule-3", label: "Rule 3. Notice" },
  { id: "rule-4", label: "Rule 4. Consent Manager" },
  { id: "rule-5", label: "Rule 5. State processing" },
  { id: "rule-6", label: "Rule 6. Security safeguards" },
  { id: "rule-7", label: "Rule 7. Data breach" },
  { id: "rule-8", label: "Rule 8. Retention period" },
  { id: "rule-9", label: "Rule 9. Contact information" },
  { id: "rule-10", label: "Rule 10. Child consent" },
  { id: "rule-11", label: "Rule 11. Guardian consent" },
  { id: "rule-12", label: "Rule 12. Child exemptions" },
  { id: "rule-13", label: "Rule 13. SDF obligations" },
  { id: "rule-14", label: "Rule 14. Rights of Data Principals" },
  { id: "rule-15", label: "Rule 15. Cross-border transfer" },
  { id: "rule-16", label: "Rule 16. Research exemption" },
  { id: "rule-17", label: "Rule 17. Board appointments" },
  { id: "rule-18", label: "Rule 18. Board salaries" },
  { id: "rule-19", label: "Rule 19. Board meetings" },
  { id: "rule-20", label: "Rule 20. Digital office" },
  { id: "rule-21", label: "Rule 21. Board officers" },
  { id: "rule-22", label: "Rule 22. Appeal" },
  { id: "rule-23", label: "Rule 23. Calling for information" },
];

const tocSchedules = [
  { id: "first-schedule", label: "First Schedule. Consent Manager" },
  { id: "second-schedule", label: "Second Schedule. State & research standards" },
  { id: "third-schedule", label: "Third Schedule. Retention time period" },
  { id: "fourth-schedule", label: "Fourth Schedule. Child exemptions" },
  { id: "fifth-schedule", label: "Fifth Schedule. Board salaries" },
  { id: "sixth-schedule", label: "Sixth Schedule. Board officers" },
  { id: "seventh-schedule", label: "Seventh Schedule. Information purposes" },
];

// Sidebar nav is driven by the shared topicNav from learnNav.ts
// so any new entries (e.g. DPDP Act 2023) appear here automatically.

function RuleSection({
  id,
  ruleNumber,
  title,
  children,
}: {
  id: string;
  ruleNumber: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-8 pb-6 border-b border-slate-100 last:border-0">
      <h2 className="text-lg font-semibold text-navy-700 mb-1">
        <span className="text-green-500 text-sm font-semibold mr-2">{ruleNumber}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
          <span>{linkifyText(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function SubBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-5 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-slate-500">
          <span className="w-1 h-1 rounded-full bg-slate-300 mt-2.5 shrink-0" />
          <span>{linkifyText(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg px-4 py-3 text-sm text-slate-700">
      {children}
    </div>
  );
}

export default function DpdpRules2025Page() {
  return (
    <>
      {articleSchema(
        "DPDP Rules 2025: Section-by-Section Plain-English Guide",
        "Read the DPDP Rules 2025 in simple English. A section-by-section guide covering every Rule and Schedule under the Digital Personal Data Protection Rules, 2025.",
        "https://saralprivacy.com/learn/dpdp-rules-2025-plain-english-guide",
        "2026-03-30"
      )}
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "DPDPA Guide", url: "https://saralprivacy.com/learn" },
        {
          name: "DPDP Rules 2025 Plain-English Guide",
          url: "https://saralprivacy.com/learn/dpdp-rules-2025-plain-english-guide",
        },
      ])}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com/learn/dpdp-rules-2025-plain-english-guide', 'DPDP Rules 2025: Plain-English Guide')}
      {faqPageSchema(faqs, {
        url: 'https://saralprivacy.com/learn/dpdp-rules-2025-plain-english-guide',
        dateModified: toISODate(FRESHNESS.learn),
      })}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_240px] gap-8">

            {/* Left sidebar — DPDPA Guide nav */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  DPDPA Guide
                </h3>
                <nav className="space-y-1">
                  {topicNav.map((t) => (
                    <Link
                      key={t.slug}
                      href={t.href ?? `/learn/${t.slug}`}
                      className={
                        t.slug === "dpdp-rules-2025-plain-english-guide"
                          ? "block px-3 py-2 rounded-lg text-sm bg-green-50 text-green-600 font-semibold"
                          : "block px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-navy-700 hover:bg-slate-50 transition-colors"
                      }
                    >
                      {t.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main content */}
            <div className="min-w-0">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-5 transition-colors"
              >
                <ArrowLeft size={14} />
                DPDPA Guide
              </Link>

              {/* Hero block */}
              <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-4">
                  <FileText size={12} className="text-green-600" />
                  <span className="text-green-600 text-xs font-semibold">Rules Reference</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy-700 mb-3">
                  DPDP Rules 2025: Section-by-Section Plain-English Guide
                </h1>
                <Byline lastReviewed={FRESHNESS.learn} className="mb-3" />
                <AnswerBlock
                  answer="The Digital Personal Data Protection Rules, 2025 were notified on 14 November 2025. They contain 23 Rules and 7 Schedules that set out the operational details under the DPDPA, 2023 — covering notice content, consent flows, breach notification, children's data, retention, and Significant Data Fiduciary obligations. Different Rules commence on different dates: some on notification, others after 12 or 18 months."
                  className="mb-4"
                />
                <p className="text-slate-600 text-base leading-relaxed mb-5">
                  This page presents each Rule and each Schedule in plain English, in the same
                  order as the official text.
                </p>
                <InfoBox>
                  This guide is designed to help readers understand what each Rule says, using
                  simple language and a clean structure. It does not add legal opinion, commentary,
                  or interpretation.
                </InfoBox>

                {/* What this page covers */}
                <div className="mt-8" id="what-this-page-covers">
                  <h2 className="text-lg font-semibold text-navy-700 mb-3">What this page covers</h2>
                  <BulletList
                    items={[
                      "Rule 1 to Rule 23 of the DPDP Rules, 2025",
                      "First Schedule to Seventh Schedule",
                      "Plain-English summaries based on the official notified text",
                      "A direct structure suitable for reference, reading, and citation",
                    ]}
                  />
                </div>

                {/* ── RULES ── */}

                <RuleSection id="rule-1" ruleNumber="Rule 1." title="Short title and commencement">
                  <p>These Rules are called the Digital Personal Data Protection Rules, 2025.</p>
                  <p>Different Rules start on different dates:</p>
                  <BulletList
                    items={[
                      "Rules 1, 2, and 17 to 21 start on the date of publication in the Official Gazette.",
                      "Rule 4 starts one year from the date of publication.",
                      "Rules 3, 5 to 16, 22 and 23 start eighteen months from the date of publication.",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="rule-2" ruleNumber="Rule 2." title="Definitions">
                  <p>This Rule defines key terms used in the Rules.</p>
                  <BulletList
                    items={[
                      "Act means the Digital Personal Data Protection Act, 2023.",
                      "Techno-legal measures means the measures referred to in Rules 20 and 22.",
                      "User account includes an online account, profile, page, handle, email address, mobile number, or similar online presence used by the Data Principal to access the Data Fiduciary's services.",
                      "Verifiable consent means consent as specified in Rule 10 or Rule 11.",
                    ]}
                  />
                  <p className="text-slate-500 text-xs mt-2">
                    Words used in the Rules but not defined here have the same meaning as in the Act.
                  </p>
                </RuleSection>

                <RuleSection id="rule-3" ruleNumber="Rule 3." title="Notice given by Data Fiduciary to Data Principal">
                  <p>
                    The notice must be understandable on its own and must be written in clear and
                    plain language.
                  </p>
                  <p>The notice must include:</p>
                  <BulletList
                    items={[
                      "An itemised description of the personal data",
                      "The specified purpose or purposes",
                      "A specific description of the goods, services, or uses enabled by the processing",
                      "The communication link for the Data Fiduciary's website or app",
                    ]}
                  />
                  <p>The notice must also include the other means, if any, for:</p>
                  <SubBulletList
                    items={[
                      "Withdrawing consent",
                      "Exercising rights under the Act",
                      "Making a complaint to the Board",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="rule-4" ruleNumber="Rule 4." title="Registration and obligations of Consent Manager">
                  <p>
                    A person that meets the conditions in Part A of the First Schedule may apply
                    to the Board for registration as a Consent Manager.
                  </p>
                  <p>The Board may:</p>
                  <BulletList
                    items={[
                      "Examine the application",
                      "Register the applicant and publish its details on the Board's website",
                      "Reject the application and communicate the reasons",
                    ]}
                  />
                  <p>
                    A registered Consent Manager must follow the obligations listed in Part B of
                    the First Schedule.
                  </p>
                  <p>
                    If the Board believes a Consent Manager is not meeting the conditions or
                    obligations, it may:
                  </p>
                  <BulletList
                    items={[
                      "Direct corrective measures",
                      "Suspend registration",
                      "Cancel registration",
                      "Issue directions to protect Data Principals",
                    ]}
                  />
                  <p>The Board may also ask the Consent Manager for information for this purpose.</p>
                </RuleSection>

                <RuleSection id="rule-5" ruleNumber="Rule 5." title="Processing by the State for subsidy, benefit, service, certificate, licence or permit">
                  <p>
                    Where personal data is processed by the State or its instrumentalities for
                    giving or issuing a subsidy, benefit, service, certificate, licence, or permit,
                    the processing must follow the standards in the Second Schedule.
                  </p>
                  <p>
                    This Rule also explains how these terms apply where the subsidy, benefit,
                    service, certificate, licence, or permit is provided:
                  </p>
                  <BulletList items={["Under law", "Under policy", "Using public funds"]} />
                </RuleSection>

                <RuleSection id="rule-6" ruleNumber="Rule 6." title="Reasonable security safeguards">
                  <p>
                    A Data Fiduciary must protect personal data in its possession or under its
                    control, including where processing is done by a Data Processor.
                  </p>
                  <p>The minimum safeguards include:</p>
                  <BulletList
                    items={[
                      "Suitable data security measures such as encryption, obfuscation, masking, or virtual tokens",
                      "Access controls for relevant computer resources",
                      "Logs, monitoring, and review to detect unauthorised access and prevent recurrence",
                      "Backups and continuity measures where confidentiality, integrity, or availability is affected",
                      "Retention of relevant logs and personal data for at least one year for detection, investigation, remediation, and continued processing, unless another law requires otherwise",
                      "Contractual provisions with Data Processors",
                      "Suitable technical and organisational measures for effective observance of safeguards",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="rule-7" ruleNumber="Rule 7." title="Intimation of personal data breach">
                  <p>
                    When a Data Fiduciary becomes aware of a personal data breach, it must inform
                    each affected Data Principal without delay, in clear and plain language,
                    through the user account or another registered mode of communication.
                  </p>
                  <p>The intimation to the affected Data Principal must include:</p>
                  <BulletList
                    items={[
                      "Description of the breach, including its nature, extent, and timing",
                      "Likely consequences for the Data Principal",
                      "Mitigation measures already taken or being taken",
                      "Safety steps the Data Principal may take",
                      "Business contact information for queries",
                    ]}
                  />
                  <p>The Data Fiduciary must also inform the Board without delay.</p>
                  <InfoBox>
                    Within 72 hours of becoming aware of the breach, or within a longer period
                    allowed by the Board on written request, the Data Fiduciary must provide
                    updated and detailed information, including broad facts, mitigation measures,
                    findings about the person who caused the breach (if known), remedial measures
                    to prevent recurrence, and a report on the intimation sent to affected Data
                    Principals.
                  </InfoBox>
                </RuleSection>

                <RuleSection id="rule-8" ruleNumber="Rule 8." title="Time period for specified purpose to be deemed as no longer being served">
                  <p>
                    For the classes of Data Fiduciaries and purposes listed in the Third Schedule,
                    personal data must be erased if the Data Principal does not approach the Data
                    Fiduciary for the specified purpose and does not exercise her rights in
                    relation to that processing, for the relevant period stated in the Schedule,
                    unless retention is necessary under law.
                  </p>
                  <p>At least 48 hours before that period ends, the Data Fiduciary must inform the Data Principal that the personal data will be erased unless she:</p>
                  <BulletList
                    items={[
                      "Logs into her user account",
                      "Initiates contact for the specified purpose",
                      "Exercises her rights",
                    ]}
                  />
                  <p>
                    For processing covered by this Rule, the Data Fiduciary must keep the personal
                    data, associated traffic data, and other logs of processing for at least one
                    year from the date of processing for the purposes stated in the Seventh
                    Schedule, and erase them after that unless a law or government notification
                    requires longer retention.
                  </p>
                </RuleSection>

                <RuleSection id="rule-9" ruleNumber="Rule 9." title="Contact information for questions about processing">
                  <p>
                    Every Data Fiduciary must prominently publish on its website or app the
                    business contact information of:
                  </p>
                  <BulletList
                    items={[
                      "The Data Protection Officer, where applicable, or",
                      "Another person able to answer questions on behalf of the Data Fiduciary about the processing of personal data",
                    ]}
                  />
                  <p>
                    This contact information must also be mentioned in every response to a
                    communication for exercising rights under the Act.
                  </p>
                </RuleSection>

                <RuleSection id="rule-10" ruleNumber="Rule 10." title="Verifiable consent for processing personal data of a child">
                  <p>
                    Before processing personal data of a child, the Data Fiduciary must take
                    suitable technical and organisational measures to ensure that verifiable
                    consent of the parent is obtained.
                  </p>
                  <p>The Data Fiduciary must check that the person identifying herself as the parent:</p>
                  <BulletList
                    items={[
                      "Is an adult, and",
                      "Is identifiable where required under Indian law",
                    ]}
                  />
                  <p>This may be checked using:</p>
                  <BulletList
                    items={[
                      "Reliable identity and age details already available with the Data Fiduciary, or",
                      "Identity and age details voluntarily given by the individual, directly or through a virtual token mapped to those details and issued by an authorised entity",
                    ]}
                  />
                  <p className="text-slate-500 text-xs">
                    For this Rule, adult means an individual who has completed eighteen years.
                  </p>
                </RuleSection>

                <RuleSection id="rule-11" ruleNumber="Rule 11." title="Verifiable consent for processing personal data of a person with disability who has a lawful guardian">
                  <p>
                    Where an individual identifies herself as the lawful guardian of a person
                    with disability, the Data Fiduciary must check that the guardian has been
                    appointed by:
                  </p>
                  <BulletList
                    items={[
                      "A court of law",
                      "A designated authority",
                      "A local level committee",
                    ]}
                  />
                  <p>This verification must be done under the law applicable to guardianship.</p>
                </RuleSection>

                <RuleSection id="rule-12" ruleNumber="Rule 12." title="Exemptions from certain obligations for processing personal data of a child">
                  <p>
                    This Rule states that section 9(1) and section 9(3) of the Act do not apply to:
                  </p>
                  <BulletList
                    items={[
                      "The classes of Data Fiduciaries listed in Part A of the Fourth Schedule, subject to the conditions in that Part",
                      "The purposes listed in Part B of the Fourth Schedule, subject to the conditions in that Part",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="rule-13" ruleNumber="Rule 13." title="Additional obligations of Significant Data Fiduciary">
                  <p>
                    A Significant Data Fiduciary must, once in every period of twelve months from
                    the date of notification or inclusion in a notified class:
                  </p>
                  <BulletList
                    items={[
                      "Carry out a Data Protection Impact Assessment",
                      "Carry out an audit to ensure observance of the Act and the Rules",
                    ]}
                  />
                  <p>
                    The person conducting the assessment and audit must submit a report to the
                    Board with significant observations.
                  </p>
                  <p>A Significant Data Fiduciary must also:</p>
                  <BulletList
                    items={[
                      "Verify with due diligence that technical measures, including algorithmic software used for hosting, display, uploading, modification, publishing, transmission, storage, updating, or sharing of personal data, are not likely to pose a risk to the rights of Data Principals",
                      "Ensure that any personal data specified by the Central Government is processed subject to a restriction that the personal data and related traffic data are not transferred outside India",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="rule-14" ruleNumber="Rule 14." title="Rights of Data Principals">
                  <p>
                    To enable the exercise of rights under the Act, the Data Fiduciary and, where
                    applicable, the Consent Manager, must prominently publish on its website or app:
                  </p>
                  <BulletList
                    items={[
                      "The means by which a Data Principal may make a request",
                      "The particulars that may be required to identify her under the terms of service, such as a username or another identifier",
                    ]}
                  />
                  <p>
                    Every Data Fiduciary and Consent Manager must publish, in its grievance
                    redressal system, a response period that is reasonable and does not exceed
                    ninety days. They must also take suitable technical and organisational measures
                    to ensure the grievance system works effectively within that period.
                  </p>
                  <p>
                    This Rule also allows a Data Principal to nominate one or more individuals for
                    exercising her rights, in accordance with the Data Fiduciary's terms of service
                    and applicable law.
                  </p>
                </RuleSection>

                <RuleSection id="rule-15" ruleNumber="Rule 15." title="Transfer of personal data outside India">
                  <p>
                    Personal data processed by a Data Fiduciary under the Act may be transferred
                    outside India, but only subject to any restriction that the Central Government
                    may specify by general or special order.
                  </p>
                  <p>
                    The Central Government may also specify requirements for making such personal
                    data available to any foreign State, or any person or entity under the control
                    of an agency of such a State.
                  </p>
                </RuleSection>

                <RuleSection id="rule-16" ruleNumber="Rule 16." title="Exemption for research, archiving or statistical purposes">
                  <p>
                    The provisions of the Act do not apply to personal data processing that is
                    necessary for research, archiving, or statistical purposes, where the
                    processing is carried out in accordance with the standards in the Second
                    Schedule.
                  </p>
                </RuleSection>

                <RuleSection id="rule-17" ruleNumber="Rule 17." title="Appointment of Chairperson and other Members">
                  <p>
                    The Central Government must create a Search-cum-Selection Committee to
                    recommend individuals for appointment.
                  </p>
                  <p>For appointment of the Chairperson, the Committee includes:</p>
                  <BulletList
                    items={[
                      "Cabinet Secretary as chairperson",
                      "Secretary, Department of Legal Affairs",
                      "Secretary, Ministry of Electronics and Information Technology",
                      "Two experts of repute",
                    ]}
                  />
                  <p>For appointment of a Member other than the Chairperson, the Committee includes:</p>
                  <BulletList
                    items={[
                      "Secretary, Ministry of Electronics and Information Technology as chairperson",
                      "Secretary, Department of Legal Affairs",
                      "Two experts of repute",
                    ]}
                  />
                  <p>
                    The Central Government appoints the Chairperson or Member after considering
                    the recommendations. A vacancy or defect in the Committee does not make its
                    acts or proceedings invalid.
                  </p>
                </RuleSection>

                <RuleSection id="rule-18" ruleNumber="Rule 18." title="Salary, allowances and service conditions of Chairperson and Members">
                  <p>
                    The salary, allowances, and other terms and conditions of service of the
                    Chairperson and Members are given in the Fifth Schedule.
                  </p>
                </RuleSection>

                <RuleSection id="rule-19" ruleNumber="Rule 19." title="Procedure for meetings of the Board and authentication of orders, directions and instruments">
                  <p>
                    The Chairperson fixes the date, time, and place of Board meetings, approves
                    the agenda, and causes notice to be issued.
                  </p>
                  <p>Key meeting rules include:</p>
                  <BulletList
                    items={[
                      "The Chairperson presides over the meeting",
                      "In the Chairperson's absence, a Member chosen by those present presides",
                      "One-third of the membership is the quorum",
                      "Decisions are made by majority of Members present and voting",
                      "In case of equality, the presiding person has a second or casting vote",
                      "A Member with an interest in an item must not take part in or vote on that item",
                    ]}
                  />
                  <p>
                    In urgent cases, the Chairperson may act immediately after recording reasons
                    in writing. That action must be communicated within seven days to all Members
                    and placed before the Board for ratification at its next meeting. Matters may
                    also be decided by circulation if the Chairperson so directs.
                  </p>
                  <InfoBox>
                    An inquiry by the Board must be completed within six months from receipt of
                    the intimation, complaint, reference, or direction under section 27, unless
                    extended in writing by up to three months at a time.
                  </InfoBox>
                </RuleSection>

                <RuleSection id="rule-20" ruleNumber="Rule 20." title="Functioning of Board as digital office">
                  <p>The Board must function as a digital office.</p>
                  <p>
                    It may adopt techno-legal measures to conduct proceedings in a way that does
                    not require physical presence, without affecting its power to summon persons,
                    enforce attendance, or examine persons on oath.
                  </p>
                </RuleSection>

                <RuleSection id="rule-21" ruleNumber="Rule 21." title="Service conditions of officers and employees of the Board">
                  <p>
                    The Board may, with prior approval of the Central Government, appoint officers
                    and employees needed for efficient discharge of its functions.
                  </p>
                  <p>
                    Their terms and conditions of appointment and service are set out in the Sixth
                    Schedule.
                  </p>
                </RuleSection>

                <RuleSection id="rule-22" ruleNumber="Rule 22." title="Appeal to Appellate Tribunal">
                  <p>
                    A person aggrieved by an order or direction of the Board may file an appeal
                    before the Appellate Tribunal in digital form, in the manner decided by the
                    Tribunal.
                  </p>
                  <p>
                    The appeal must be accompanied by the applicable fee under the Telecom
                    Regulatory Authority of India Act, 1997, unless the Chairperson of the
                    Appellate Tribunal reduces or waives it.
                  </p>
                  <p>The fee must be paid digitally through:</p>
                  <BulletList
                    items={[
                      "UPI, or",
                      "Another payment system authorised by the Reserve Bank of India",
                    ]}
                  />
                  <p>
                    The Tribunal is guided by natural justice and may regulate its own procedure.
                    It also functions as a digital office and may adopt techno-legal measures to
                    conduct proceedings without requiring physical presence.
                  </p>
                </RuleSection>

                <RuleSection id="rule-23" ruleNumber="Rule 23." title="Calling for information from Data Fiduciary or intermediary">
                  <p>
                    For the purposes listed in the Seventh Schedule, the Central Government,
                    acting through the corresponding authorised person in that Schedule, may
                    require any Data Fiduciary or intermediary to furnish information within the
                    stated period.
                  </p>
                  <p>
                    Where disclosure of the fact of furnishing information is likely to
                    prejudicially affect the sovereignty and integrity of India or the security
                    of the State, the Government may require the Data Fiduciary or intermediary
                    not to disclose that fact to the affected Data Principal or any other person,
                    unless prior written permission is given by the authorised person.
                  </p>
                  <p className="text-slate-500 text-xs">
                    For this Rule, intermediary has the same meaning as under the Information
                    Technology Act, 2000.
                  </p>
                </RuleSection>

                {/* ── SCHEDULES ── */}

                <section id="schedules" className="scroll-mt-24 pt-10 pb-4">
                  <h2 className="text-xl font-semibold text-navy-700 mb-1">
                    Schedules under the DPDP Rules, 2025
                  </h2>
                  <p className="text-sm text-slate-500">
                    There are seven Schedules. Each is summarised below in the same order as the
                    official text.
                  </p>
                </section>

                <RuleSection id="first-schedule" ruleNumber="First Schedule." title="Consent Manager">
                  <p className="font-semibold text-navy-700">Part A — Conditions for registration</p>
                  <p>A Consent Manager applicant must:</p>
                  <BulletList
                    items={[
                      "Be a company incorporated in India",
                      "Have sufficient technical, operational, and financial capacity",
                      "Have sound financial condition and sound management character",
                      "Have net worth of at least ₹2 crore",
                      "Have adequate expected business volume, capital structure, and earning prospects",
                      "Have directors, key managerial personnel, and senior management with a reputation for fairness and integrity",
                      "Have constitutional documents requiring compliance with the obligations in Part B",
                      "Have policies and procedures supporting such compliance",
                      "Operate in the interests of Data Principals",
                      "Have independent certification showing that its interoperable platform is consistent with the Board's standards and assurance framework, and that suitable technical and organisational measures are in place",
                    ]}
                  />
                  <p className="font-semibold text-navy-700 mt-4">Part B — Obligations of Consent Manager</p>
                  <p>A Consent Manager must:</p>
                  <BulletList
                    items={[
                      "Enable the Data Principal to give consent to an onboarded Data Fiduciary",
                      "Ensure personal data made available or shared is not readable by the Consent Manager",
                      "Maintain records of consent given, denied, or withdrawn",
                      "Maintain records of notices related to consent requests",
                      "Maintain records of sharing of personal data with a transferee Data Fiduciary",
                      "Give the Data Principal access to those records",
                      "Provide that information in machine-readable form on request",
                      "Retain those records for at least seven years, or longer if agreed or required by law",
                      "Provide services mainly through a website or app",
                      "Not sub-contract or assign its obligations under the Act and Rules",
                      "Take reasonable security safeguards",
                      "Act in a fiduciary capacity in relation to the Data Principal",
                      "Avoid conflicts of interest with Data Fiduciaries",
                      "Maintain measures to prevent conflicts arising from its directors, key managerial personnel, and senior management",
                      "Publish key ownership and management information",
                      "Maintain effective audit mechanisms",
                      "Not transfer control of the company without prior approval of the Board and fulfilment of any conditions specified by the Board",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="second-schedule" ruleNumber="Second Schedule." title="Standards for processing by the State and for research, archiving or statistical purposes">
                  <p>The required standards include:</p>
                  <BulletList
                    items={[
                      "Processing must be lawful",
                      "Processing must be for the permitted use or purpose",
                      "Processing must be limited to personal data necessary for that use or purpose",
                      "Reasonable efforts must be made to ensure completeness, accuracy, and consistency",
                      "Retention must continue only as long as needed for the purpose or legal compliance",
                      "Reasonable security safeguards must be taken",
                      "Where processing is under section 7(b), the Data Principal must receive an intimation with business contact information and the communication link or other means for exercising rights",
                    ]}
                  />
                  <p>
                    The person deciding the purpose and means of processing remains accountable
                    for following these standards.
                  </p>
                </RuleSection>

                <RuleSection id="third-schedule" ruleNumber="Third Schedule." title="Time period when a specified purpose is no longer being served">
                  <p>This Schedule applies to:</p>
                  <BulletList
                    items={[
                      "An e-commerce entity with not less than 2 crore registered users in India",
                      "An online gaming intermediary with not less than 50 lakh registered users in India",
                      "A social media intermediary with not less than 2 crore registered users in India",
                    ]}
                  />
                  <p>
                    For each of these classes, the time period is three years from the later of:
                  </p>
                  <BulletList
                    items={[
                      "The date on which the Data Principal last approached the Data Fiduciary for the specified purpose, or exercised her rights, or",
                      "The commencement of the DPDP Rules, 2025",
                    ]}
                  />
                  <p>The Schedule excludes purposes relating to:</p>
                  <BulletList
                    items={[
                      "Enabling the Data Principal to access her user account",
                      "Enabling access to certain virtual tokens stored on the platform that may be used to obtain money, goods, or services",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="fourth-schedule" ruleNumber="Fourth Schedule." title="Exemptions for processing personal data of a child">
                  <p className="font-semibold text-navy-700">Part A — Classes of Data Fiduciaries</p>
                  <p>The listed classes include:</p>
                  <BulletList
                    items={[
                      "Clinical establishments, mental health establishments, and healthcare professionals, for health services to the child to the extent necessary for protection of health",
                      "Allied healthcare professionals, for supporting implementation of a healthcare treatment and referral plan recommended for the child",
                      "Educational institutions, for tracking and behavioural monitoring for educational activities or child safety",
                      "Individuals entrusted with infants and children in a crèche or child day care centre, for tracking and behavioural monitoring in the interests of safety",
                      "Persons engaged by educational institutions, crèches, or child care centres for transport of enrolled children, for tracking location during travel",
                    ]}
                  />
                  <p className="font-semibold text-navy-700 mt-4">Part B — Purposes</p>
                  <p>The listed purposes include:</p>
                  <BulletList
                    items={[
                      "Exercise of power, performance of function, or discharge of duties in the interests of a child under Indian law",
                      "Provision or issue of subsidy, benefit, service, certificate, licence, or permit in the interests of a child under law, policy, or public funds",
                      "Creation of a user account for communication by email, where use is limited to that purpose",
                      "Determining the real-time location of a child in the interests of safety, protection, or security",
                      "Ensuring that information, services, or advertisements likely to harm a child's well-being are not accessible to the child",
                      "Confirming that the Data Principal is not a child and carrying out due diligence under Rule 10",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="fifth-schedule" ruleNumber="Fifth Schedule." title="Service conditions of Chairperson and Members">
                  <BulletList
                    items={[
                      "The Chairperson receives a consolidated salary of ₹4,50,000 per month.",
                      "Each other Member receives a consolidated salary of ₹4,00,000 per month.",
                    ]}
                  />
                  <p>The Schedule also covers:</p>
                  <SubBulletList
                    items={[
                      "Travelling allowance",
                      "Medical assistance",
                      "Leave",
                      "Leave encashment",
                      "Leave travel concession",
                      "Conflict of interest requirements",
                      "Other service conditions",
                    ]}
                  />
                  <p>They are eligible for provident fund, but not pension or gratuity for Board service.</p>
                </RuleSection>

                <RuleSection id="sixth-schedule" ruleNumber="Sixth Schedule." title="Service conditions of officers and employees of the Board">
                  <p>
                    The Board may appoint officers and employees on deputation, generally for a
                    period not exceeding five years, from:
                  </p>
                  <BulletList
                    items={[
                      "The Central Government",
                      "A State Government",
                      "Autonomous bodies",
                      "Statutory bodies",
                      "Public sector enterprises",
                    ]}
                  />
                  <p>
                    The Board may also take officers or employees on deputation from the National
                    Institute for Smart Government for up to five years.
                  </p>
                  <p>The Schedule also covers:</p>
                  <SubBulletList
                    items={[
                      "Salary and allowances",
                      "Gratuity",
                      "Travelling allowance",
                      "Medical assistance",
                      "Leave",
                      "Leave travel concession",
                      "Conduct rules",
                      "Disciplinary rules",
                      "Other service matters",
                    ]}
                  />
                </RuleSection>

                <RuleSection id="seventh-schedule" ruleNumber="Seventh Schedule." title="Purposes for which information may be called for, and the authorised person">
                  <p>The Seventh Schedule lists three purposes:</p>
                  <div className="space-y-3">
                    {[
                      "Use by the State or its instrumentalities of personal data in the interests of sovereignty and integrity of India or security of the State",
                      "Use by the State or its instrumentalities of personal data for performance of a function under law or disclosure of information for fulfilling an obligation under law",
                      "Assessment for notifying any Data Fiduciary or class of Data Fiduciaries as a Significant Data Fiduciary",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3">
                    For each purpose, the Schedule also identifies the corresponding authorised
                    person.
                  </p>
                </RuleSection>

                {/* ── FAQ ── */}
                <section id="faq" className="scroll-mt-24 pt-10">
                  <h2 className="text-xl font-semibold text-navy-700 mb-5">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-5">
                    {faqs.map((faq, i) => (
                      <div key={i} className="border-b border-slate-100 pb-5 last:border-0">
                        <h3 className="font-semibold text-navy-700 text-sm mb-1.5">
                          {faq.question}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Source note */}
                <div className="mt-10 pt-6 border-t border-slate-200 space-y-1 text-xs text-slate-400">
                  <p>
                    <strong>Source note:</strong> This page is based on the official text of the
                    Digital Personal Data Protection Rules, 2025 and should be read together with
                    the Digital Personal Data Protection Act, 2023.
                  </p>
                  <p>This page is for educational purposes and does not constitute legal advice.</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-5">
                <strong>Educational content only.</strong> This guide is for educational purposes
                and does not constitute legal advice. Please consult a qualified data protection
                lawyer for formal legal opinions specific to your business situation.
              </div>

              {/* Back link */}
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to DPDPA Guide
              </Link>
            </div>

            {/* Right ToC — visible on xl screens */}
            <div className="hidden xl:block">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  On this page
                </h3>
                <nav className="space-y-0.5">
                  <a
                    href="#what-this-page-covers"
                    className="block px-2 py-1.5 rounded text-xs text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    What this page covers
                  </a>
                  <p className="px-2 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rules
                  </p>
                  {tocRules.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block px-2 py-1 rounded text-xs text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors leading-tight"
                    >
                      {item.label}
                    </a>
                  ))}
                  <p className="px-2 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Schedules
                  </p>
                  {tocSchedules.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block px-2 py-1 rounded text-xs text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors leading-tight"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a
                    href="#faq"
                    className="block px-2 py-1.5 mt-1 rounded text-xs text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors font-medium"
                  >
                    FAQ
                  </a>
                </nav>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
