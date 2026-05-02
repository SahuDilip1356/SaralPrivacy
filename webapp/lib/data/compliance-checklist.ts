/**
 * compliance-checklist.ts
 *
 * Single source of truth for the DPDPA Compliance Checklist page.
 * Based on the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.
 *
 * Two parts:
 *   Part 1 — Statutory and Rule-Based requirements (15 sections, ~49 items)
 *   Part 2 — Operational Evidence and Governance controls (12 sections, ~41 items)
 *
 * Text is stored plain — linkifyText() applies hyperlinks at render time.
 */

export type ItemType =
  | "statutory"    // Directly required by DPDPA Act, 2023
  | "rule"         // Required by DPDP Rules, 2025
  | "conditional"  // Applies only in specific cases (SDF, Consent Manager, etc.)
  | "operational"  // Evidence/governance control — not always statutory word-for-word
  | "best-practice"; // Strengthens governance but not mandatory

export interface ChecklistItem {
  id: string;        // "1.1", "4.3" etc.
  subsection: string;
  reference: string;
  requirement: string;
  guardrail: string;
  type: ItemType;
}

export interface ChecklistSection {
  part: 1 | 2;
  sectionId: string; // "1", "2" … "15"
  title: string;
  items: ChecklistItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 1 — Statutory and Rule-Based DPDPA Compliance Checklist
// ─────────────────────────────────────────────────────────────────────────────

export const part1Sections: ChecklistSection[] = [
  {
    part: 1,
    sectionId: "1",
    title: "Applicability & Scope",
    items: [
      {
        id: "1.1",
        subsection: "1.1 Determine applicability",
        reference: "Act Sec. 3",
        requirement:
          "Confirm whether the organisation processes digital personal data within India or processes digital personal data outside India in connection with offering goods or services to Data Principals in India.",
        guardrail:
          "DPDPA applies to digital personal data, not every form of business data. Anonymised or non-personal business data should be assessed separately.",
        type: "statutory",
      },
      {
        id: "1.2",
        subsection: "1.2 Identify organisational role",
        reference: "Act Sec. 2",
        requirement:
          "Identify whether the organisation acts as a Data Fiduciary, Data Processor, Consent Manager, or another relevant participant.",
        guardrail:
          "The primary accountability sits with the Data Fiduciary. Processors act on behalf of the Data Fiduciary.",
        type: "statutory",
      },
      {
        id: "1.3",
        subsection: "1.3 Assess Significant Data Fiduciary status",
        reference: "Act Sec. 10",
        requirement:
          "Check whether the organisation or class of organisations has been notified as a Significant Data Fiduciary by the Central Government.",
        guardrail:
          "Do not assume SDF status. Additional SDF obligations apply only where notified.",
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "2",
    title: "Lawful Processing",
    items: [
      {
        id: "2.1",
        subsection: "2.1 Lawful purpose",
        reference: "Act Sec. 4",
        requirement:
          "Process personal data only for a lawful purpose and in accordance with the Act.",
        guardrail:
          '"Business convenience" is not enough. Purpose must be lawful and specific.',
        type: "statutory",
      },
      {
        id: "2.2",
        subsection: "2.2 Consent or certain legitimate uses",
        reference: "Act Sec. 4, Sec. 7",
        requirement:
          "Map every processing activity to either valid consent or a permitted legitimate use under the Act.",
        guardrail:
          "Do not stretch legitimate use. Use it only where the Act permits it.",
        type: "statutory",
      },
    ],
  },
  {
    part: 1,
    sectionId: "3",
    title: "Notice Management",
    items: [
      {
        id: "3.1",
        subsection: "3.1 Notice before consent",
        reference: "Act Sec. 5(1)",
        requirement:
          "Provide notice before or along with the request for consent, describing the personal data and the purpose of processing.",
        guardrail:
          "A generic privacy policy alone may not be enough where a specific consent notice is required.",
        type: "statutory",
      },
      {
        id: "3.2",
        subsection: "3.2 Notice for legacy consent",
        reference: "Act Sec. 5(2)",
        requirement:
          "For consent obtained before commencement, provide notice as soon as reasonably practicable.",
        guardrail:
          "Legacy consent clean-up is essential. Old databases often have weak consent evidence.",
        type: "statutory",
      },
      {
        id: "3.3",
        subsection: "3.3 Language option",
        reference: "Act Sec. 5(3), Sec. 6(3)",
        requirement:
          "Give the Data Principal the option to access the notice in English or any language specified in the Eighth Schedule to the Constitution.",
        guardrail:
          "Especially important for consumer-facing websites, apps, and public platforms.",
        type: "statutory",
      },
      {
        id: "3.4",
        subsection: "3.4 Rule-based notice content",
        reference: "Rule 3",
        requirement:
          "Notice should be clear, plain, independently understandable, and include itemised personal data, processing purpose, withdrawal mechanism, rights mechanism, and complaint path to the Board. The notified Rules prescribe this structure.",
        guardrail:
          "Avoid burying notice inside unrelated legal text. The notice must stand on its own.",
        type: "rule",
      },
    ],
  },
  {
    part: 1,
    sectionId: "4",
    title: "Consent Management",
    items: [
      {
        id: "4.1",
        subsection: "4.1 Valid consent",
        reference: "Act Sec. 6(1)",
        requirement:
          "Consent must be free, specific, informed, unconditional, unambiguous, given through clear affirmative action, and limited to personal data necessary for the specified purpose.",
        guardrail:
          "No pre-ticked boxes. No bundled consent. No consent traps.",
        type: "statutory",
      },
      {
        id: "4.2",
        subsection: "4.2 Invalid consent terms",
        reference: "Act Sec. 6(2)",
        requirement:
          "Any consent term that violates the Act, Rules, or another applicable law is invalid to that extent.",
        guardrail:
          "Do not insert waiver clauses that dilute Data Principal rights.",
        type: "statutory",
      },
      {
        id: "4.3",
        subsection: "4.3 Clear consent request",
        reference: "Act Sec. 6(3)",
        requirement:
          "Consent requests must be in clear and plain language and include contact details of the DPO or authorised person, where applicable.",
        guardrail: "Legalese is camouflage, not compliance.",
        type: "statutory",
      },
      {
        id: "4.4",
        subsection: "4.4 Withdrawal of consent",
        reference: "Act Sec. 6(4)–6(6)",
        requirement:
          "Allow withdrawal of consent at any time, with ease comparable to giving consent. After withdrawal, the Data Fiduciary must cease processing within a reasonable time unless continued processing is authorised by law.",
        guardrail:
          "Withdrawal must propagate to processors, downstream systems, and campaign lists.",
        type: "statutory",
      },
      {
        id: "4.5",
        subsection: "4.5 Consent proof burden",
        reference: "Act Sec. 6(10)",
        requirement:
          "Where consent is the basis of processing, the Data Fiduciary must be able to prove that notice was given and consent was obtained in accordance with the Act and Rules.",
        guardrail:
          "Maintain consent timestamp, purpose, notice version, user/channel details, and withdrawal logs.",
        type: "statutory",
      },
      {
        id: "4.6",
        subsection: "4.6 Consent Manager obligations",
        reference: "Act Sec. 6(7)–6(9), Rule 4",
        requirement:
          "If acting as or using a Consent Manager, comply with registration and prescribed technical, operational, financial, and fiduciary requirements.",
        guardrail:
          'Do not casually label a consent tool as a "Consent Manager" unless it meets regulated requirements.',
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "5",
    title: "Certain Legitimate Uses",
    items: [
      {
        id: "5.1",
        subsection: "5.1 Voluntary provision of data",
        reference: "Act Sec. 7(a)",
        requirement:
          "Process data for the specified purpose for which the Data Principal voluntarily provided personal data, where applicable.",
        guardrail:
          "Voluntary provision is not a blank cheque. Keep processing tied to the stated purpose.",
        type: "statutory",
      },
      {
        id: "5.2",
        subsection: "5.2 State benefits, services, certificates, licences",
        reference: "Act Sec. 7(b), 7(c)",
        requirement:
          "Processing may be permitted for certain State functions, benefits, subsidies, certificates, licences, or permits.",
        guardrail: "Mostly relevant to government and public-sector contexts.",
        type: "conditional",
      },
      {
        id: "5.3",
        subsection: "5.3 Medical emergency, disaster, epidemic, public safety",
        reference: "Act Sec. 7(d)–7(f)",
        requirement:
          "Processing may be permitted for specified emergency, disaster, epidemic, or public safety situations.",
        guardrail:
          "Document the emergency basis. Do not use emergency provisions for routine processing.",
        type: "conditional",
      },
      {
        id: "5.4",
        subsection: "5.4 Employment-related processing",
        reference: "Act Sec. 7(i)",
        requirement:
          "Processing may be permitted for employment purposes and safeguarding the employer from loss or liability, where covered.",
        guardrail:
          "HR data is still personal data. Apply purpose limitation, access control, and retention discipline.",
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "6",
    title: "Data Fiduciary Obligations",
    items: [
      {
        id: "6.1",
        subsection: "6.1 Accountability for processing",
        reference: "Act Sec. 8(1)",
        requirement:
          "The Data Fiduciary is responsible for complying with the Act for processing undertaken by it or on its behalf.",
        guardrail:
          "Outsourcing processing does not outsource accountability.",
        type: "statutory",
      },
      {
        id: "6.2",
        subsection: "6.2 Processor engagement",
        reference: "Act Sec. 8(2)",
        requirement: "Engage a Data Processor only under a valid contract.",
        guardrail: "Vendor Data Processing Agreements are mandatory hygiene.",
        type: "statutory",
      },
      {
        id: "6.3",
        subsection: "6.3 Accuracy and completeness",
        reference: "Act Sec. 8(3)",
        requirement:
          "Make reasonable efforts to ensure completeness, accuracy, and consistency where personal data is used to make decisions or disclosed to another Data Fiduciary.",
        guardrail:
          "Highly relevant for KYC, credit, payroll, collections, support, and employee records.",
        type: "statutory",
      },
      {
        id: "6.4",
        subsection: "6.4 Security safeguards",
        reference: "Act Sec. 8(5), Rule 6",
        requirement:
          "Implement reasonable security safeguards, including controls such as access control, encryption, masking, obfuscation, tokenisation, logging, monitoring, backups, and breach detection where applicable.",
        guardrail:
          "Keep technical evidence: policies, configurations, audit logs, access reports, backup reports, incident records.",
        type: "rule",
      },
      {
        id: "6.5",
        subsection: "6.5 Personal data breach notification",
        reference: "Act Sec. 8(6), Rule 7",
        requirement:
          "Notify the Data Protection Board and affected Data Principals of personal data breaches in the prescribed manner.",
        guardrail:
          "Breach SOP must support rapid assessment, notification, impact analysis, remediation, and evidence preservation.",
        type: "rule",
      },
      {
        id: "6.6",
        subsection: "6.6 Erasure after purpose completion or withdrawal",
        reference: "Act Sec. 8(7), Rule 8",
        requirement:
          "Erase personal data when consent is withdrawn or the specified purpose is no longer served, unless retention is necessary for legal compliance.",
        guardrail:
          "Deletion must cover source systems, processors, archives, exports, and downstream platforms.",
        type: "rule",
      },
      {
        id: "6.7",
        subsection: "6.7 Grievance mechanism",
        reference: "Act Sec. 8(9), Rule 13",
        requirement:
          "Publish contact details of the DPO or authorised person and provide an effective grievance redressal mechanism.",
        guardrail:
          "Rule 13 workflows should be tracked against the maximum response period of 90 days.",
        type: "rule",
      },
    ],
  },
  {
    part: 1,
    sectionId: "7",
    title: "Children's Data and Persons with Disability",
    items: [
      {
        id: "7.1",
        subsection: "7.1 Verifiable parental consent",
        reference: "Act Sec. 9(1), Rule 10",
        requirement:
          "Obtain verifiable parental consent before processing personal data of a child.",
        guardrail:
          "Under the Act, a child means a person below 18 years of age.",
        type: "rule",
      },
      {
        id: "7.2",
        subsection: "7.2 Consent for persons with disability",
        reference: "Rule 11",
        requirement:
          "Obtain verifiable consent of the lawful guardian where applicable for persons with disability.",
        guardrail: "Apply only where Rule conditions are met.",
        type: "rule",
      },
      {
        id: "7.3",
        subsection: "7.3 Prohibited tracking and targeted advertising",
        reference: "Act Sec. 9(3)",
        requirement:
          "Do not undertake tracking, behavioural monitoring, or targeted advertising directed at children.",
        guardrail:
          "Product, analytics, and ad-tech teams must implement technical controls. Policy text alone is not enough.",
        type: "statutory",
      },
      {
        id: "7.4",
        subsection: "7.4 No detrimental processing",
        reference: "Act Sec. 9(2)",
        requirement:
          "Do not process children's personal data in a manner likely to cause detrimental effect on child wellbeing.",
        guardrail:
          "Run child-risk review before launching child-facing features.",
        type: "statutory",
      },
      {
        id: "7.5",
        subsection: "7.5 Exemptions for certain classes",
        reference: "Act Sec. 9(4), 9(5), Rule 12",
        requirement:
          "Check whether any notified exemption applies for specific classes of Data Fiduciaries or purposes.",
        guardrail:
          "Do not self-declare exemption. Verify the notification or rule basis.",
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "8",
    title: "Significant Data Fiduciary Controls",
    items: [
      {
        id: "8.1",
        subsection: "8.1 DPO appointment",
        reference: "Act Sec. 10(2)(a)",
        requirement:
          "If notified as an SDF, appoint a Data Protection Officer based in India.",
        guardrail:
          "Useful for many organisations, but mandatory under DPDPA only where SDF obligations apply.",
        type: "conditional",
      },
      {
        id: "8.2",
        subsection: "8.2 Independent data auditor",
        reference: "Act Sec. 10(2)(b)",
        requirement:
          "If notified as an SDF, appoint an independent data auditor.",
        guardrail:
          "Maintain audit scope, report, findings, remediation tracker, and management sign-off.",
        type: "conditional",
      },
      {
        id: "8.3",
        subsection: "8.3 DPIA, periodic audit, and additional measures",
        reference: "Act Sec. 10(2)(c), Rule 15",
        requirement:
          "If notified as an SDF, conduct DPIA, periodic audit, and prescribed compliance measures.",
        guardrail:
          "DPIA is a statutory SDF control, not a universal DPDPA obligation for every organisation.",
        type: "conditional",
      },
      {
        id: "8.4",
        subsection: "8.4 Restrictions for notified categories of data",
        reference: "Rule 14; Act Sec. 10; Act Sec. 16",
        requirement:
          "If applicable to an SDF, comply with Central Government requirements or restrictions relating to notified categories of personal data and traffic data.",
        guardrail:
          "Do not describe this as general \"data localisation\" under DPDPA. DPDPA follows a negative-list model for cross-border transfers. Localisation may arise from sectoral laws or specific notifications, not as a blanket DPDPA mandate.",
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "9",
    title: "Data Principal Rights",
    items: [
      {
        id: "9.1",
        subsection: "9.1 Access to information",
        reference: "Act Sec. 11; Rule 13",
        requirement:
          "Provide a mechanism for Data Principals to obtain information about personal data processing and sharing, as applicable.",
        guardrail:
          "Maintain request intake, identity verification, response template, fulfilment evidence, and SLA tracker. Rule 13 workflows should not exceed 90 days.",
        type: "rule",
      },
      {
        id: "9.2",
        subsection: "9.2 Correction, completion, updating, and erasure",
        reference: "Act Sec. 12; Rule 13",
        requirement:
          "Enable Data Principals to request correction, completion, updating, and erasure of personal data.",
        guardrail:
          "Track request date, system owner, fulfilment date, exception reason, and closure evidence. Rule 13 workflows should not exceed 90 days.",
        type: "rule",
      },
      {
        id: "9.3",
        subsection: "9.3 Grievance redressal",
        reference: "Act Sec. 13; Rule 13",
        requirement:
          "Provide readily available means of grievance redressal.",
        guardrail:
          "The Data Principal should normally exhaust this mechanism before escalating to the Board.",
        type: "statutory",
      },
      {
        id: "9.4",
        subsection: "9.4 Nomination",
        reference: "Act Sec. 14; Rule 13",
        requirement:
          "Enable a Data Principal to nominate another person to exercise rights in the event of death or incapacity.",
        guardrail:
          "Collect only necessary nominee details and verify before fulfilment.",
        type: "rule",
      },
    ],
  },
  {
    part: 1,
    sectionId: "10",
    title: "Duties of Data Principal",
    items: [
      {
        id: "10.1",
        subsection: "10.1 Lawful exercise of rights",
        reference: "Act Sec. 15",
        requirement:
          "Data Principals must comply with applicable laws while exercising rights.",
        guardrail:
          "Useful for handling fraudulent, abusive, or impersonation-based requests.",
        type: "statutory",
      },
      {
        id: "10.2",
        subsection: "10.2 No false complaints or impersonation",
        reference: "Act Sec. 15",
        requirement:
          "Data Principals must not impersonate another person or suppress material information.",
        guardrail: "Include identity verification in rights workflows.",
        type: "statutory",
      },
    ],
  },
  {
    part: 1,
    sectionId: "11",
    title: "Cross-Border Transfer",
    items: [
      {
        id: "11.1",
        subsection: "11.1 Transfer outside India",
        reference: "Act Sec. 16",
        requirement:
          "Personal data may be transferred outside India except to countries or territories restricted by Central Government notification.",
        guardrail:
          "This is a negative-list model, not a blanket localisation requirement. Maintain a transfer register and monitor restricted-country notifications.",
        type: "statutory",
      },
      {
        id: "11.2",
        subsection: "11.2 Sectoral law overlay",
        reference: "Act Sec. 16 and other applicable laws",
        requirement:
          "Check whether stricter sectoral laws, regulatory directions, contracts, or government notifications impose additional transfer or localisation requirements.",
        guardrail:
          "RBI, telecom, insurance, health, payments, tax, and employment rules may impose separate requirements.",
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "12",
    title: "Exemptions",
    items: [
      {
        id: "12.1",
        subsection: "12.1 Personal or domestic exemption",
        reference: "Act Sec. 3 / Sec. 17",
        requirement:
          "Identify whether processing is exempt, such as personal or domestic processing.",
        guardrail:
          "Enterprise processing should not casually rely on domestic-use exemptions.",
        type: "conditional",
      },
      {
        id: "12.2",
        subsection: "12.2 Research, statistical, or archival exemption",
        reference: "Act Sec. 17(2)(b)",
        requirement:
          "Processing may be exempt for research, archival, or statistical purposes if not used to make decisions specific to a Data Principal and if done according to prescribed standards.",
        guardrail:
          "Use output controls, de-identification, and purpose restrictions.",
        type: "conditional",
      },
      {
        id: "12.3",
        subsection: "12.3 Legal, court, enforcement, and State exemptions",
        reference: "Act Sec. 17",
        requirement:
          "Check exemptions for legal claims, courts, enforcement, security, sovereignty, and other statutory purposes.",
        guardrail:
          "Keep legal sign-off. These exemptions are context-specific.",
        type: "conditional",
      },
    ],
  },
  {
    part: 1,
    sectionId: "13",
    title: "Data Protection Board Readiness",
    items: [
      {
        id: "13.1",
        subsection: "13.1 Board interface readiness",
        reference: "Act Sec. 18–28; Rules 17–21",
        requirement:
          "Prepare for Board notices, inquiries, directions, digital proceedings, and compliance interactions.",
        guardrail:
          "Maintain response owner, evidence pack, legal escalation matrix, and management reporting.",
        type: "rule",
      },
    ],
  },
  {
    part: 1,
    sectionId: "14",
    title: "Penalties",
    items: [
      {
        id: "14.1",
        subsection: "14.1 Penalty exposure",
        reference: "Act Sec. 33, Sec. 33(2), Schedule; Sec. 42",
        requirement:
          "Track penalty exposure for breach of obligations including security safeguards, breach notification, children's data obligations, SDF obligations, Consent Manager obligations, and Data Principal duties.",
        guardrail:
          "The Act's penalty factors are in Section 33(2), not Section 33(3). The power to amend the Schedule, with a cap that an amount must not exceed more than twice the original amount, appears under Section 42.",
        type: "statutory",
      },
    ],
  },
  {
    part: 1,
    sectionId: "15",
    title: "Commencement Tracking",
    items: [
      {
        id: "15.1",
        subsection: "15.1 Phased implementation",
        reference: "Rule 1",
        requirement:
          "Track phased commencement of DPDP Rules: Rules 1, 2, and 17–21 from publication; Rule 4 after one year; Rules 3, 5–16, 22, and 23 after eighteen months.",
        guardrail:
          "Maintain a compliance roadmap by effective date, not just by policy priority.",
        type: "rule",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PART 2 — Operational Evidence and Governance Checklist
// ─────────────────────────────────────────────────────────────────────────────

export const part2Sections: ChecklistSection[] = [
  {
    part: 2,
    sectionId: "O1",
    title: "Data Governance Foundation",
    items: [
      {
        id: "O1.1",
        subsection: "O1.1 Personal data inventory",
        reference: "Supports Act Sec. 4, 5, 6, 8",
        requirement:
          "Maintain a system-wise register of personal data collected, stored, processed, shared, archived, and deleted.",
        guardrail:
          'Do not call this a GDPR RoPA unless your policy defines it. Use "DPDPA Processing Register."',
        type: "operational",
      },
      {
        id: "O1.2",
        subsection: "O1.2 Processing activity register",
        reference: "Supports Act Sec. 4, 7, 8",
        requirement:
          "Map each activity to purpose, data category, Data Principal category, lawful basis, owner, processor, retention, and transfer location.",
        guardrail:
          'This prevents "mystery processing." Mystery is fun in novels, not audits.',
        type: "operational",
      },
      {
        id: "O1.3",
        subsection: "O1.3 Data flow maps",
        reference: "Supports Act Sec. 8(1), 8(2), 8(5)",
        requirement:
          "Document flow from collection to storage, use, sharing, archival, deletion, and processor handoff.",
        guardrail:
          "Include SaaS tools, APIs, data lake, BI reports, logs, backups, and exports.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O2",
    title: "Notice and Consent Evidence",
    items: [
      {
        id: "O2.1",
        subsection: "O2.1 Notice register",
        reference: "Act Sec. 5; Rule 3",
        requirement:
          "Maintain notice versions, publication date, language versions, purpose mapping, approval record, and publishing channel.",
        guardrail:
          "Proves what was shown to the Data Principal at the time of consent.",
        type: "operational",
      },
      {
        id: "O2.2",
        subsection: "O2.2 Consent ledger",
        reference: "Act Sec. 6(10)",
        requirement:
          "Capture user ID, consent timestamp, purpose, notice version, channel, language, consent status, and withdrawal status.",
        guardrail: "Consent without evidence is just a bedtime story.",
        type: "operational",
      },
      {
        id: "O2.3",
        subsection: "O2.3 Withdrawal log",
        reference: "Act Sec. 6(4)–6(6); Rule 3",
        requirement:
          "Track withdrawal request, date, systems affected, processor notification, cessation confirmation, and exceptions.",
        guardrail: "Withdrawal must not die in the website front end.",
        type: "operational",
      },
      {
        id: "O2.4",
        subsection: "O2.4 Legacy consent remediation",
        reference: "Act Sec. 5(2)",
        requirement:
          "Identify pre-commencement consents and issue required notices where applicable.",
        guardrail:
          "Old databases usually carry the highest consent risk.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O3",
    title: "Rights Management",
    items: [
      {
        id: "O3.1",
        subsection: "O3.1 Rights request SOP",
        reference: "Act Sec. 11–14; Rule 13",
        requirement:
          "Define SOP for access, correction, completion, update, erasure, grievance, and nomination requests.",
        guardrail:
          "Include identity verification, request classification, SLA tracking, and exception handling.",
        type: "operational",
      },
      {
        id: "O3.2",
        subsection: "O3.2 Rights request tracker",
        reference: "Rule 13",
        requirement:
          "Track request date, request type, identity check, owner, response date, closure evidence, and pending ageing.",
        guardrail:
          "Configure dashboard alerts before the 90-day maximum is breached.",
        type: "operational",
      },
      {
        id: "O3.3",
        subsection: "O3.3 Erasure fulfilment proof",
        reference: "Act Sec. 8(7), Sec. 12; Rule 8",
        requirement:
          "Maintain deletion tickets, database confirmation, processor deletion certificate, exception note, and legal-hold record.",
        guardrail: "Erasure is a chain, not a button.",
        type: "operational",
      },
      {
        id: "O3.4",
        subsection: "O3.4 Nomination workflow",
        reference: "Act Sec. 14; Rule 13",
        requirement:
          "Maintain nomination capture, verification, trigger event process, and fulfilment records.",
        guardrail: "Avoid over-collecting nominee data.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O4",
    title: "Security and Technology Controls",
    items: [
      {
        id: "O4.1",
        subsection: "O4.1 Security control matrix",
        reference: "Act Sec. 8(5); Rule 6",
        requirement:
          "Map each system to encryption, masking, tokenisation, RBAC, MFA, PAM, logging, monitoring, DLP, backup, and DR controls.",
        guardrail: "Technical safeguards need technical proof.",
        type: "operational",
      },
      {
        id: "O4.2",
        subsection: "O4.2 Access review",
        reference: "Supports Act Sec. 8(5); Rule 6",
        requirement:
          "Conduct periodic access certification for HRMS, CRM, ERP, support tools, data lake, BI tools, and production databases.",
        guardrail:
          "Privileged access is where privacy often goes to die. Review it.",
        type: "operational",
      },
      {
        id: "O4.3",
        subsection: "O4.3 Logging and monitoring",
        reference: "Rule 6",
        requirement:
          "Maintain SIEM alerts, access logs, anomaly detection evidence, and incident tickets.",
        guardrail:
          "Logs must be retained according to security policy and applicable law.",
        type: "operational",
      },
      {
        id: "O4.4",
        subsection: "O4.4 Backup and resilience proof",
        reference: "Rule 6",
        requirement:
          "Maintain backup reports, restore test results, DR test evidence, and resilience review.",
        guardrail:
          "A backup never restored is only a prayer with a timestamp.",
        type: "operational",
      },
      {
        id: "O4.5",
        subsection: "O4.5 Vulnerability and patch evidence",
        reference: "Supports Act Sec. 8(5); Rule 6",
        requirement:
          "Maintain VA/PT reports, patch tickets, risk acceptance, exception approvals, and closure evidence.",
        guardrail: "Prioritise systems holding personal data.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O5",
    title: "Breach Management",
    items: [
      {
        id: "O5.1",
        subsection: "O5.1 Breach response SOP",
        reference: "Act Sec. 8(6); Rule 7",
        requirement:
          "Define detection, classification, escalation, containment, legal review, Board notification, Data Principal notification, RCA, and remediation.",
        guardrail:
          "Must support prescribed breach notification duties.",
        type: "operational",
      },
      {
        id: "O5.2",
        subsection: "O5.2 Board update readiness",
        reference: "Rule 7",
        requirement:
          "Maintain breach evidence template: facts, timeline, affected data, impact, containment, mitigation, and remedial actions.",
        guardrail:
          "Start tracking from awareness. Do not spend three days arguing over definitions.",
        type: "operational",
      },
      {
        id: "O5.3",
        subsection: "O5.3 Breach register",
        reference: "Act Sec. 8(6); Rule 7",
        requirement:
          "Maintain breach ID, detection date, awareness date, systems affected, data impacted, notification status, RCA, and closure.",
        guardrail: "Track near-misses separately for learning.",
        type: "operational",
      },
      {
        id: "O5.4",
        subsection: "O5.4 Breach simulation",
        reference: "Supports Rule 7",
        requirement:
          "Conduct tabletop exercises and retain minutes, observations, and action tracker.",
        guardrail:
          "The first breach drill should not happen during the breach.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O6",
    title: "Vendor and Processor Governance",
    items: [
      {
        id: "O6.1",
        subsection: "O6.1 Vendor inventory",
        reference: "Act Sec. 8(2)",
        requirement:
          "List all Data Processors and third parties receiving or processing personal data.",
        guardrail:
          "Include SaaS, cloud, payroll, call centre, analytics, marketing, and support tools.",
        type: "operational",
      },
      {
        id: "O6.2",
        subsection: "O6.2 Data Processing Agreement",
        reference: "Act Sec. 8(2), 8(5)",
        requirement:
          "Include purpose limitation, confidentiality, security safeguards, breach reporting, subprocessor control, deletion, audit, and liability clauses.",
        guardrail:
          "Vendor contracts must mirror the accountability model of DPDPA.",
        type: "operational",
      },
      {
        id: "O6.3",
        subsection: "O6.3 Vendor risk assessment",
        reference: "Supports Act Sec. 8(1), 8(2), 8(5)",
        requirement:
          "Maintain due diligence questionnaire, security certifications, risk score, remediation plan, and approval record.",
        guardrail:
          "High-risk vendors need stronger controls and shorter review cycles.",
        type: "operational",
      },
      {
        id: "O6.4",
        subsection: "O6.4 Processor deletion proof",
        reference: "Act Sec. 8(7); Rule 8",
        requirement:
          "Obtain deletion certificate or system evidence after purpose closure, consent withdrawal, or contract termination.",
        guardrail: '"We emailed the vendor" is not proof.',
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O7",
    title: "Retention and Disposal",
    items: [
      {
        id: "O7.1",
        subsection: "O7.1 Retention schedule",
        reference: "Act Sec. 8(7); Rule 8",
        requirement:
          "Define retention period by data category: customer, employee, vendor, finance, tax, logs, tickets, recordings, and app data.",
        guardrail:
          "Align with company law, tax law, labour law, sectoral rules, and legal-hold requirements.",
        type: "operational",
      },
      {
        id: "O7.2",
        subsection: "O7.2 Legal hold process",
        reference: "Supports Act Sec. 8(7)",
        requirement:
          "Define when data must be retained for legal claim, litigation, investigation, statutory requirement, or regulatory process.",
        guardrail:
          "Legal hold can override deletion, but it must be documented.",
        type: "operational",
      },
      {
        id: "O7.3",
        subsection: "O7.3 Disposal evidence",
        reference: "Supports Act Sec. 8(7); Rule 8",
        requirement:
          "Maintain disposal logs, deletion scripts, archival purge reports, and media destruction certificates.",
        guardrail: "Retention without deletion is data obesity.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O8",
    title: "Children's Data Controls",
    items: [
      {
        id: "O8.1",
        subsection: "O8.1 Age-gating",
        reference: "Act Sec. 9; Rule 10",
        requirement:
          "Implement age declaration, verification method, parental consent trigger, and child-user handling.",
        guardrail:
          "Avoid collecting children's data unless genuinely required.",
        type: "operational",
      },
      {
        id: "O8.2",
        subsection: "O8.2 Verifiable parental consent evidence",
        reference: "Rule 10",
        requirement:
          "Maintain parent/guardian verification evidence according to the approved mechanism.",
        guardrail: "Keep it proportionate and privacy-preserving.",
        type: "operational",
      },
      {
        id: "O8.3",
        subsection: "O8.3 No targeted advertising controls",
        reference: "Act Sec. 9(3)",
        requirement:
          "Disable behavioural tracking, profiling, and targeted advertising directed at children.",
        guardrail:
          "Product, analytics, and ad-tech implementation must match policy.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O9",
    title: "SDF Governance Pack",
    items: [
      {
        id: "O9.1",
        subsection: "O9.1 SDF applicability review",
        reference: "Act Sec. 10",
        requirement:
          "Maintain periodic assessment of whether the organisation is notified as an SDF.",
        guardrail: "Re-check government notifications periodically.",
        type: "operational",
      },
      {
        id: "O9.2",
        subsection: "O9.2 DPO file",
        reference: "Act Sec. 10(2)(a)",
        requirement:
          "Maintain DPO appointment letter, India contact details, reporting line, and responsibility charter.",
        guardrail:
          "Mandatory for SDFs; useful governance for larger non-SDF organisations too.",
        type: "operational",
      },
      {
        id: "O9.3",
        subsection: "O9.3 DPIA template and reports",
        reference: "Act Sec. 10(2)(c); Rule 15",
        requirement:
          "Maintain DPIA template, completed DPIAs, risk ratings, mitigation plan, and approval record.",
        guardrail:
          "Do not call every risk note a DPIA. Use a structured assessment.",
        type: "operational",
      },
      {
        id: "O9.4",
        subsection: "O9.4 Independent audit evidence",
        reference: "Act Sec. 10(2)(b); Rule 15",
        requirement:
          "Maintain audit scope, audit report, findings, remediation tracker, and management sign-off.",
        guardrail: "Make findings visible to senior management.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O10",
    title: "Cross-Border and Sectoral Compliance",
    items: [
      {
        id: "O10.1",
        subsection: "O10.1 Transfer register",
        reference: "Act Sec. 16",
        requirement:
          "Maintain destination country, recipient, data category, purpose, contract reference, and safeguard details.",
        guardrail:
          "Track restricted countries or territories if notified by the Central Government.",
        type: "operational",
      },
      {
        id: "O10.2",
        subsection: "O10.2 Sectoral law overlay",
        reference: "Act Sec. 16 and other laws",
        requirement:
          "Map RBI, IRDAI, TRAI, telecom, health, tax, employment, and contractual restrictions where applicable.",
        guardrail: "DPDPA is not the only law in the room.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O11",
    title: "Training and Awareness",
    items: [
      {
        id: "O11.1",
        subsection: "O11.1 Role-based training",
        reference: "Supports Act Sec. 8; Rule 6, Rule 7, Rule 13",
        requirement:
          "Train IT, HR, marketing, customer support, procurement, product, legal, and leadership teams.",
        guardrail:
          "Generic privacy training is weak. Role-based training is sharper.",
        type: "operational",
      },
      {
        id: "O11.2",
        subsection: "O11.2 Training evidence",
        reference: "Supports compliance proof",
        requirement:
          "Maintain attendance, quiz scores, acknowledgement, refresher schedule, and training material versions.",
        guardrail:
          "Auditors love proof. Employees love forgetting. Keep records.",
        type: "operational",
      },
    ],
  },
  {
    part: 2,
    sectionId: "O12",
    title: "Management Reporting",
    items: [
      {
        id: "O12.1",
        subsection: "O12.1 Compliance dashboard",
        reference: "Supports overall accountability",
        requirement:
          "Report consent gaps, rights requests, grievances, breaches, vendor risks, deletion backlog, SDF actions, and exceptions.",
        guardrail:
          "What leadership cannot see, leadership cannot govern.",
        type: "operational",
      },
      {
        id: "O12.2",
        subsection: "O12.2 Risk and exception register",
        reference: "Supports Act compliance",
        requirement:
          "Track exceptions, risk owner, mitigation, due date, approval, and expiry.",
        guardrail: "Permanent exceptions are policy sabotage.",
        type: "operational",
      },
      {
        id: "O12.3",
        subsection: "O12.3 Senior management reporting",
        reference: "Supports governance",
        requirement:
          "Prepare quarterly privacy compliance reporting for leadership or the board.",
        guardrail:
          "Especially important for regulated, high-volume, or consumer-facing businesses.",
        type: "operational",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const statusLabels = [
  {
    type: "statutory" as ItemType,
    label: "Statutory Requirement",
    meaning: "Directly required by the DPDPA Act, 2023.",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
  },
  {
    type: "rule" as ItemType,
    label: "Rule Requirement",
    meaning: "Required by the DPDP Rules, 2025.",
    badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  {
    type: "conditional" as ItemType,
    label: "Conditional Requirement",
    meaning:
      "Applies only in specific cases, such as SDFs, Consent Managers, children's data, or notified transfer restrictions.",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  {
    type: "operational" as ItemType,
    label: "Operational Evidence Control",
    meaning:
      "Not always explicitly named in the law, but needed to prove compliance.",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  {
    type: "best-practice" as ItemType,
    label: "Best Practice",
    meaning:
      "Strengthens governance but should not be represented as mandatory.",
    badgeClass: "bg-purple-100 text-purple-700 border border-purple-200",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KEY GUARDRAILS
// ─────────────────────────────────────────────────────────────────────────────

export const keyGuardrails = [
  {
    id: 1,
    heading: "DPDPA is not a blanket data localisation law",
    body: "DPDPA permits transfer of personal data outside India except to countries or territories restricted by the Central Government. Localisation may still arise under sectoral laws, contractual obligations, or specific government notifications, but it should not be described as a general DPDPA mandate.",
  },
  {
    id: 2,
    heading: "Consent must be provable",
    body: "If consent is the basis of processing, the organisation should be able to prove notice, consent, purpose, timestamp, and withdrawal status. Consent without evidence is not a control; it is a hope with a checkbox.",
  },
  {
    id: 3,
    heading: "Rights workflows need SLA discipline",
    body: "Data Principal rights and grievance workflows should be tracked against the Rule 13 maximum response period of 90 days, including access, correction, completion, updating, erasure, grievance redressal, and nomination handling.",
  },
  {
    id: 4,
    heading: "SDF obligations are conditional",
    body: "DPO appointment, independent data audit, DPIA, periodic audit, and additional prescribed measures apply as statutory obligations where the organisation is notified as a Significant Data Fiduciary. Other organisations may adopt these as best practice, but should not mislabel them as universal statutory duties.",
  },
  {
    id: 5,
    heading: "Penalty tracking must use the correct statutory basis",
    body: "Penalty exposure should be mapped to Section 33, Section 33(2), and the Schedule. The \"twice the original amount\" concept relates to the Central Government's power to amend the Schedule under Section 42, not Section 33(3). This is a small citation correction but a big credibility point.",
  },
];

export const DISCLAIMER =
  "This DPDPA compliance checklist is prepared for general readiness and governance purposes. It is based on the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025. Applicability may vary depending on organisational role, sector, data type, processing purpose, geography, government notifications, and sector-specific laws. Organisations should obtain legal advice before treating any checklist item as a final legal determination.";
