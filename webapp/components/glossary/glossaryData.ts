export interface GlossaryTerm {
  id: string;
  term: string;
  section: string;
  category: string;
  definition: string;
  relatedIds?: string[];
}

export const CATEGORIES = [
  { id: "all",          label: "All Terms"               },
  { id: "roles",        label: "Actors & Entities"       },
  { id: "concepts",     label: "Core Concepts"           },
  { id: "consent",      label: "Consent & Processing"    },
  { id: "rights",       label: "Rights & Duties"         },
  { id: "obligations",  label: "Compliance Obligations"  },
  { id: "cross-border", label: "Cross-Border Transfers"  },
  { id: "enforcement",  label: "Enforcement & Penalties" },
  { id: "exemptions",   label: "Exemptions"              },
] as const;

export const TERMS: GlossaryTerm[] = [

  // ── Actors & Entities ──────────────────────────────────────────────────────

  {
    id: "data-principal",
    term: "Data Principal",
    section: "Section 2(j)",
    category: "roles",
    definition:
      "The individual to whom personal data relates. Where the individual is a child, the term includes the parents or lawful guardian of that child. The Act confers rights — access, correction, erasure, nomination, and grievance redressal — exclusively on Data Principals.",
    relatedIds: ["data-fiduciary", "rights-access", "right-nominate", "duties-data-principal"],
  },
  {
    id: "data-fiduciary",
    term: "Data Fiduciary",
    section: "Section 2(i)",
    category: "roles",
    definition:
      "Any person who, alone or in conjunction with other persons, determines the purpose and means of processing of personal data. Includes the State, companies, juristic entities, and individuals. A Data Fiduciary bears the primary compliance obligations under the Act.",
    relatedIds: ["data-principal", "data-processor", "data-fiduciary-obligations"],
  },
  {
    id: "data-processor",
    term: "Data Processor",
    section: "Section 2(k)",
    category: "roles",
    definition:
      "Any person who processes personal data on behalf of a Data Fiduciary. A Data Processor acts only under the instructions of the Data Fiduciary pursuant to a valid contract. The Data Fiduciary remains responsible for ensuring the Processor complies with the Act.",
    relatedIds: ["data-fiduciary", "data-processing-agreement"],
  },
  {
    id: "significant-data-fiduciary",
    term: "Significant Data Fiduciary",
    section: "Section 10",
    category: "roles",
    definition:
      "A Data Fiduciary notified by the Central Government based on its assessment of factors including: volume and sensitivity of personal data processed, risk to rights of Data Principals, risk to sovereignty and national security, risk to public order, and risk to electoral democracy. SDFs are subject to additional obligations under Section 10(2).",
    relatedIds: ["sdf-obligations", "dpo", "dpia", "data-audit", "algorithmic-accountability"],
  },
  {
    id: "consent-manager",
    term: "Consent Manager",
    section: "Section 2(g) and Section 11",
    category: "roles",
    definition:
      "A person registered with the Data Protection Board who acts as a single point of contact through which a Data Principal may give, manage, review, and withdraw consent given to Data Fiduciaries. Consent Managers are subject to obligations prescribed by the Central Government.",
    relatedIds: ["consent", "consent-artefact", "withdrawal-of-consent"],
  },
  {
    id: "dpo",
    term: "Data Protection Officer",
    section: "Section 10(2)(a)",
    category: "roles",
    definition:
      "An individual appointed by a Significant Data Fiduciary who serves as the point of contact for the grievance redressal mechanism and for the Data Protection Board. Must be resident in India. Appointment of a DPO is mandatory only for Significant Data Fiduciaries — general Data Fiduciaries are not required to appoint a DPO under the Act.",
    relatedIds: ["significant-data-fiduciary", "sdf-obligations"],
  },
  {
    id: "dpb",
    term: "Data Protection Board of India",
    section: "Section 18",
    category: "roles",
    definition:
      "A quasi-judicial body established by the Central Government under Section 18 of the Act. The Board may receive and adjudicate complaints from Data Principals, conduct inquiries on its own motion, issue directions to Data Fiduciaries, and impose monetary penalties within the statutory limits prescribed in the Schedule. Appeals against Board orders lie to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT).",
    relatedIds: ["monetary-penalty", "inquiry", "appellate-tribunal"],
  },

  // ── Core Concepts ──────────────────────────────────────────────────────────

  {
    id: "personal-data",
    term: "Personal Data",
    section: "Section 2(t)",
    category: "concepts",
    definition:
      "Any data about an individual who is identifiable by or in relation to such data. The Act applies to processing of digital personal data. The Act does not create tiered categories of personal data — all personal data is governed under the same framework.",
    relatedIds: ["digital-personal-data", "processing", "data-principal"],
  },
  {
    id: "digital-personal-data",
    term: "Digital Personal Data",
    section: "Section 2(n)",
    category: "concepts",
    definition:
      "Personal data in digital form. Includes personal data that was originally collected in non-digital form and subsequently digitised. The Act applies only to digital personal data.",
    relatedIds: ["personal-data", "processing"],
  },
  {
    id: "processing",
    term: "Processing",
    section: "Section 2(x)",
    category: "concepts",
    definition:
      "An automated operation or set of operations performed on digital personal data. Includes collection, recording, organisation, structuring, storage, adaptation, retrieval, use, alignment, combination, indexing, sharing, disclosure by transmission, dissemination or otherwise making available, restriction, erasure, or destruction.",
    relatedIds: ["personal-data", "data-fiduciary", "data-processor"],
  },
  {
    id: "personal-data-breach",
    term: "Personal Data Breach",
    section: "Section 2(l)",
    category: "concepts",
    definition:
      "Any unauthorised processing of personal data, or accidental disclosure, acquisition, sharing, use, alteration, destruction, or loss of access to personal data, that compromises the confidentiality, integrity, or availability of personal data.",
    relatedIds: ["breach-notification", "security-safeguards", "data-fiduciary-obligations"],
  },
  {
    id: "de-identified-data",
    term: "De-identified Data",
    section: "Section 17(3)",
    category: "concepts",
    definition:
      "Personal data from which a Data Fiduciary has removed the means by which the data can be attributed to a specific Data Principal. Under Section 17(3), when de-identified data is shared with a Data Processor under a contractual obligation not to re-identify the data, the Act does not restrict use of that data for research, archiving, or statistical purposes with prescribed safeguards.",
    relatedIds: ["anonymised-data", "exemptions"],
  },
  {
    id: "anonymised-data",
    term: "Anonymised Data",
    section: "Section 3(a)",
    category: "concepts",
    definition:
      "Data that is not personal data within the meaning of Section 2(t). The Act does not apply to data that has been anonymised. The Act does not itself define the standard or process for anonymisation.",
    relatedIds: ["de-identified-data", "personal-data"],
  },
  {
    id: "publicly-available-data",
    term: "Publicly Available Data",
    section: "Section 3(b)",
    category: "concepts",
    definition:
      "Personal data made publicly available by the Data Principal themselves, or personal data whose publication is required under any law in force. Processing of such data does not require consent under Section 4. The exception applies only to data voluntarily made public by the Data Principal — accidental or unauthorised public disclosure does not bring data within this exception.",
    relatedIds: ["consent", "exemptions"],
  },

  // ── Consent & Processing ───────────────────────────────────────────────────

  {
    id: "consent",
    term: "Consent",
    section: "Section 2(h) and Section 6",
    category: "consent",
    definition:
      "A freely given, specific, informed, unconditional, and unambiguous indication of the Data Principal's wishes, signified by a clear affirmative action. Consent must be for a specified purpose only. A request for consent must be accompanied or preceded by a notice. Consent must not be bundled with other terms and conditions unrelated to the purpose of processing. Consent is required for all processing unless a deemed consent provision under Section 7 applies.",
    relatedIds: ["notice", "deemed-consent", "withdrawal-of-consent", "affirmative-action", "unconditional-consent"],
  },
  {
    id: "affirmative-action",
    term: "Affirmative Action (Consent)",
    section: "Section 6(1)",
    category: "consent",
    definition:
      "Consent must be signified by a clear affirmative action by the Data Principal. The Data Principal must take a deliberate, positive step to indicate agreement. Silence, pre-ticked boxes, or inactivity do not constitute consent under the Act.",
    relatedIds: ["consent", "unconditional-consent"],
  },
  {
    id: "unconditional-consent",
    term: "Unconditional Consent",
    section: "Section 6(1)",
    category: "consent",
    definition:
      "One of the required attributes of valid consent under Section 6(1). Consent must not be conditional on acceptance of any other terms or conditions. Consent obtained as a condition of receiving a service is conditional and does not meet the statutory standard.",
    relatedIds: ["consent", "affirmative-action"],
  },
  {
    id: "notice",
    term: "Notice",
    section: "Section 5",
    category: "consent",
    definition:
      "Before seeking consent, or at the time of seeking consent, a Data Fiduciary must provide the Data Principal with a notice in clear and plain language describing: (a) the personal data to be collected, (b) the purpose of processing, (c) the manner in which the Data Principal may exercise their rights under the Act, and (d) the manner in which a complaint may be made to the Board.",
    relatedIds: ["consent", "data-fiduciary-obligations"],
  },
  {
    id: "deemed-consent",
    term: "Deemed Consent",
    section: "Section 7",
    category: "consent",
    definition:
      "Processing for which the Data Principal's explicit consent is not required. Section 7 specifies eight exhaustive circumstances: (a) voluntary provision of data for a specific purpose, (b) State functions such as subsidies, benefits, licences, or certificates, (c) compliance with a court order or judgment, (d) medical emergency or epidemic, (e) employment-related processing, (f) public interest functions, (g) protecting sovereignty or security, and (h) purposes prescribed by the Central Government. This list is exhaustive.",
    relatedIds: ["consent", "processing-by-state"],
  },
  {
    id: "processing-by-state",
    term: "Processing by the State",
    section: "Section 7(b), (c), (d)",
    category: "consent",
    definition:
      "The State and its instrumentalities may process personal data under deemed consent for: (b) performance of State functions including issuance of licences, permits, benefits, and subsidies; (c) compliance with any law or court order or judgment; and (d) response to a medical emergency or epidemic. Such processing does not require prior consent from the Data Principal.",
    relatedIds: ["deemed-consent", "state-instrumentalities"],
  },
  {
    id: "withdrawal-of-consent",
    term: "Withdrawal of Consent",
    section: "Section 6(4)",
    category: "consent",
    definition:
      "A Data Principal may withdraw consent at any time. Withdrawal must be as easy as giving consent. Withdrawal does not affect the lawfulness of processing carried out based on consent before its withdrawal. The Data Principal must bear any consequential effects of withdrawing consent.",
    relatedIds: ["consent", "erasure-obligation"],
  },
  {
    id: "data-processing-agreement",
    term: "Data Processing Agreement",
    section: "Section 8(2)",
    category: "consent",
    definition:
      "A Data Fiduciary must ensure that a Data Processor processes personal data only for the purpose specified by the Data Fiduciary pursuant to a valid contract. The Act uses the term 'contract' — Data Processing Agreement is the industry label for this statutory contract. The contract must restrict the Processor to processing only as instructed by the Data Fiduciary.",
    relatedIds: ["data-processor", "data-fiduciary"],
  },
  {
    id: "consent-artefact",
    term: "Consent Artefact",
    section: "Rule 3(3) of the DPDP Rules, 2025",
    category: "consent",
    definition:
      "A machine-readable record that captures the terms under which consent has been given or withdrawn by a Data Principal through a Consent Manager. The format and required contents of a consent artefact are specified in the DPDP Rules, 2025.",
    relatedIds: ["consent-manager", "consent"],
  },

  // ── Rights & Duties ────────────────────────────────────────────────────────

  {
    id: "rights-access",
    term: "Right to Access Information",
    section: "Section 12",
    category: "rights",
    definition:
      "A Data Principal may request a Data Fiduciary to provide: (a) a summary of personal data being processed and the processing activities undertaken, and (b) the identities of all Data Processors and other Data Fiduciaries with whom personal data has been shared. The Data Fiduciary must respond within the period prescribed by the Central Government.",
    relatedIds: ["data-principal", "right-correction-erasure"],
  },
  {
    id: "right-correction-erasure",
    term: "Right to Correction and Erasure",
    section: "Section 13",
    category: "rights",
    definition:
      "A Data Principal may request a Data Fiduciary to: (a) correct inaccurate or misleading personal data, (b) complete incomplete personal data, (c) update personal data, and (d) erase personal data that is no longer necessary for the purpose for which it was collected or for which consent has been withdrawn. Data Fiduciaries must comply within the prescribed period.",
    relatedIds: ["erasure-obligation", "rights-access"],
  },
  {
    id: "right-grievance",
    term: "Right to Grievance Redressal",
    section: "Section 13(3)",
    category: "rights",
    definition:
      "A Data Principal may make a complaint to the Data Fiduciary's grievance redressal mechanism. If the complaint is not resolved within the period prescribed by the Central Government, the Data Principal may escalate the complaint to the Data Protection Board.",
    relatedIds: ["dpb", "right-correction-erasure"],
  },
  {
    id: "right-nominate",
    term: "Right to Nominate",
    section: "Section 14",
    category: "rights",
    definition:
      "A Data Principal may nominate another individual who, in the event of the Data Principal's death or incapacity to exercise their rights, will exercise the rights of the Data Principal under the Act. The manner of nomination is to be prescribed by the Central Government.",
    relatedIds: ["data-principal"],
  },
  {
    id: "duties-data-principal",
    term: "Duties of Data Principal",
    section: "Section 15",
    category: "rights",
    definition:
      "A Data Principal must not: (a) impersonate another person while providing personal data, (b) suppress material information or provide false particulars while providing personal data for documents or identifiers, (c) register false or frivolous complaints with the Board, or (d) furnish false particulars or impersonate another person when providing personal data for any purpose. Breach of duties attracts a penalty of up to ₹10,000.",
    relatedIds: ["data-principal", "monetary-penalty"],
  },

  // ── Compliance Obligations ─────────────────────────────────────────────────

  {
    id: "data-fiduciary-obligations",
    term: "Data Fiduciary Obligations",
    section: "Section 8",
    category: "obligations",
    definition:
      "General obligations applicable to all Data Fiduciaries: (a) ensuring personal data is complete, accurate, and consistent with purpose (Section 8(3)); (b) implementing reasonable security safeguards (Section 8(5)); (c) notifying the Board and affected Data Principals of any personal data breach (Section 8(6)); and (d) erasing personal data when the purpose is served or consent is withdrawn (Section 8(7)).",
    relatedIds: ["security-safeguards", "breach-notification", "erasure-obligation", "data-minimisation"],
  },
  {
    id: "security-safeguards",
    term: "Security Safeguards",
    section: "Section 8(5)",
    category: "obligations",
    definition:
      "A Data Fiduciary must implement appropriate technical and organisational measures to prevent personal data breaches. The Act uses the phrase 'reasonable security safeguards.' Failure to implement reasonable security safeguards is subject to a penalty of up to ₹250 crore under the Schedule.",
    relatedIds: ["data-fiduciary-obligations", "personal-data-breach", "breach-notification"],
  },
  {
    id: "breach-notification",
    term: "Breach Notification",
    section: "Section 8(6)",
    category: "obligations",
    definition:
      "Upon becoming aware of a personal data breach, a Data Fiduciary must notify the Data Protection Board and each affected Data Principal in the prescribed manner and within the prescribed time period. Failure to notify is subject to a penalty of up to ₹200 crore under the Schedule.",
    relatedIds: ["personal-data-breach", "security-safeguards", "dpb"],
  },
  {
    id: "data-minimisation",
    term: "Data Minimisation",
    section: "Section 8(3)",
    category: "obligations",
    definition:
      "Personal data collected and processed must be limited to what is necessary for the specified purpose for which consent was obtained. The phrase 'data minimisation' is not used in the Act; the obligation arises from Section 8(3), which requires data to be consistent with and necessary for the specified purpose.",
    relatedIds: ["data-fiduciary-obligations", "purpose-limitation"],
  },
  {
    id: "erasure-obligation",
    term: "Erasure Obligation",
    section: "Section 8(7)",
    category: "obligations",
    definition:
      "A Data Fiduciary must erase personal data as soon as the purpose for which it was collected is no longer being served by its retention, unless retention is required under any law in force. Upon withdrawal of consent by the Data Principal, the Data Fiduciary must also cause the Data Processor to erase the data.",
    relatedIds: ["data-fiduciary-obligations", "withdrawal-of-consent", "purpose-limitation"],
  },
  {
    id: "purpose-limitation",
    term: "Purpose Limitation",
    section: "Section 6 and Section 8(7)",
    category: "obligations",
    definition:
      "Personal data may only be processed for the specified purpose for which consent was obtained (Section 6). Once that purpose is served, the data must be erased (Section 8(7)). The phrase 'purpose limitation' does not appear in the Act; the obligation arises from reading Sections 6 and 8(7) together.",
    relatedIds: ["consent", "erasure-obligation", "data-minimisation"],
  },
  {
    id: "childrens-data",
    term: "Children's Data",
    section: "Section 9",
    category: "obligations",
    definition:
      "Processing personal data of a child (a person under 18 years) requires verifiable consent of the parent or lawful guardian before processing. A Data Fiduciary must not track or monitor children, conduct behavioural targeting of children, or process personal data of children in a manner that may be detrimental to their well-being. Breach attracts a penalty of up to ₹200 crore.",
    relatedIds: ["verifiable-parental-consent", "significant-data-fiduciary"],
  },
  {
    id: "verifiable-parental-consent",
    term: "Verifiable Parental Consent",
    section: "Section 9(1) and Rule 10 of the DPDP Rules, 2025",
    category: "obligations",
    definition:
      "Before processing personal data of a child, a Data Fiduciary must verify that the individual is a child and obtain verifiable consent of the parent or lawful guardian. The mechanism for verifying the age of the child and the identity of the parent or guardian is prescribed in Rule 10 of the DPDP Rules, 2025.",
    relatedIds: ["childrens-data", "consent"],
  },
  {
    id: "sdf-obligations",
    term: "Significant Data Fiduciary Obligations",
    section: "Section 10(2)",
    category: "obligations",
    definition:
      "In addition to general Data Fiduciary obligations, a Significant Data Fiduciary must: (a) appoint a Data Protection Officer resident in India; (b) appoint an independent data auditor; (c) undertake periodic Data Protection Impact Assessments; (d) undertake periodic data audits; and (e) publish algorithmic accountability standards.",
    relatedIds: ["significant-data-fiduciary", "dpo", "dpia", "data-audit", "algorithmic-accountability"],
  },
  {
    id: "dpia",
    term: "Data Protection Impact Assessment",
    section: "Section 10(2)(b)",
    category: "obligations",
    definition:
      "A periodic assessment that a Significant Data Fiduciary must conduct to evaluate the risk to the rights of Data Principals arising from the processing of personal data. The frequency, scope, and process of the assessment are to be prescribed by the Central Government. Mandatory only for Significant Data Fiduciaries.",
    relatedIds: ["sdf-obligations", "significant-data-fiduciary"],
  },
  {
    id: "data-audit",
    term: "Data Audit",
    section: "Section 10(2)(d)",
    category: "obligations",
    definition:
      "A periodic audit conducted by an independent data auditor appointed by a Significant Data Fiduciary to assess compliance with the Act and Rules. The obligation to undergo a data audit applies only to Significant Data Fiduciaries.",
    relatedIds: ["sdf-obligations", "dpia"],
  },
  {
    id: "algorithmic-accountability",
    term: "Algorithmic Accountability",
    section: "Section 10(2)(e)",
    category: "obligations",
    definition:
      "Significant Data Fiduciaries are required to publish algorithmic accountability standards. This obligation is limited to entities notified as SDFs. The Act uses the phrase 'algorithmic accountability' — broader concepts of algorithmic transparency or fairness beyond this obligation are not imposed by the Act.",
    relatedIds: ["sdf-obligations", "significant-data-fiduciary"],
  },

  // ── Cross-Border Transfers ──────────────────────────────────────────────────

  {
    id: "cross-border-transfer",
    term: "Cross-Border Data Transfer",
    section: "Section 16",
    category: "cross-border",
    definition:
      "A Data Fiduciary may transfer personal data to countries outside India, except to countries notified by the Central Government under Section 16(1). The Central Government may, by notification, restrict or impose conditions on transfer to specific countries. As of April 2026, the restricted countries notification has not been issued. The Act does not impose data localisation.",
    relatedIds: ["negative-list", "data-fiduciary"],
  },
  {
    id: "negative-list",
    term: "Negative List",
    section: "Section 16(1)",
    category: "cross-border",
    definition:
      "The list of countries to which transfer of personal data is restricted, to be notified by the Central Government under Section 16(1). 'Negative List' is the industry label for this anticipated regulatory instrument — the term does not appear in the Act. As of April 2026, this notification has not been issued.",
    relatedIds: ["cross-border-transfer"],
  },

  // ── Enforcement & Penalties ─────────────────────────────────────────────────

  {
    id: "monetary-penalty",
    term: "Monetary Penalty",
    section: "Section 33 and the Schedule",
    category: "enforcement",
    definition:
      "The Board may impose a monetary penalty on a Data Fiduciary or Data Processor found to have breached the Act, after completing an inquiry and giving the person an opportunity to be heard. Penalties are subject to the statutory maximums in the Schedule. There is no arithmetic formula for calculating penalties — the Board exercises full discretion within the Schedule caps after considering the Section 33(2) factors.",
    relatedIds: ["penalty-schedule", "section-33-factors", "inquiry"],
  },
  {
    id: "penalty-schedule",
    term: "Penalty Schedule",
    section: "Schedule (appended to the Act)",
    category: "enforcement",
    definition:
      "The Schedule prescribes statutory maximum penalties by breach category: security safeguards failure (Section 8(5)) — up to ₹250 crore; breach notification failure (Section 8(6)) — up to ₹200 crore; children's data obligations breach (Section 9) — up to ₹200 crore; Significant Data Fiduciary obligations breach (Section 10) — up to ₹150 crore; Data Principal duties breach (Section 15) — up to ₹10,000; breach of voluntary undertaking (Section 32) — up to original breach cap; breach of any other Act or Rules provision — up to ₹50 crore.",
    relatedIds: ["monetary-penalty", "section-33-factors"],
  },
  {
    id: "section-33-factors",
    term: "Section 33(2) Factors",
    section: "Section 33(2)",
    category: "enforcement",
    definition:
      "Before imposing a penalty, the Board must consider: (a) nature, gravity, and duration of the breach; (b) type and nature of personal data affected; (c) repetitive nature of the breach; (d) financial gain realised or loss avoided by the Data Fiduciary due to the breach; (e) timeliness and effectiveness of mitigation action taken; (f) whether the penalty is proportionate and effective for observance and deterrence; and (g) likely impact of the penalty on the person.",
    relatedIds: ["monetary-penalty", "inquiry"],
  },
  {
    id: "inquiry",
    term: "Inquiry",
    section: "Section 28",
    category: "enforcement",
    definition:
      "The Board may conduct an inquiry into a complaint received from a Data Principal or on its own motion if it has reason to believe that a breach of the Act has occurred. The Board must give the person against whom the inquiry is conducted an opportunity to be heard before imposing any penalty or direction.",
    relatedIds: ["dpb", "monetary-penalty", "right-grievance"],
  },
  {
    id: "voluntary-undertaking",
    term: "Voluntary Undertaking",
    section: "Section 32",
    category: "enforcement",
    definition:
      "A person against whom proceedings are pending before the Board may offer a voluntary undertaking to take specific remedial action. The Board may accept such undertaking and stay the proceedings. Breach of an accepted voluntary undertaking is subject to a penalty up to the statutory maximum applicable to the original breach.",
    relatedIds: ["inquiry", "penalty-schedule"],
  },
  {
    id: "appellate-tribunal",
    term: "Appellate Tribunal",
    section: "Section 29",
    category: "enforcement",
    definition:
      "Appeals against orders of the Data Protection Board lie to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT). Appeals must be filed within the prescribed period. Further appeals from TDSAT lie to the High Court.",
    relatedIds: ["dpb", "inquiry"],
  },

  // ── Exemptions ─────────────────────────────────────────────────────────────

  {
    id: "exemptions",
    term: "Exemptions",
    section: "Section 17",
    category: "exemptions",
    definition:
      "The Act exempts specified processing from its provisions, including: processing by the Central Government for national security, sovereignty, public order, or prevention of incitement to offences (Section 17(1)(a)); processing for prevention, detection, or investigation of offences (Section 17(1)(b)); and processing for research, archiving, or statistical purposes with prescribed safeguards (Section 17(3)). The Central Government may by notification exempt additional Data Fiduciaries or classes of Data Principals.",
    relatedIds: ["state-instrumentalities", "de-identified-data"],
  },
  {
    id: "state-instrumentalities",
    term: "State and its Instrumentalities",
    section: "Section 2(y) and Section 7",
    category: "exemptions",
    definition:
      "Section 2(y) defines the 'State' to include the Central Government, State Governments, Parliament, State Legislatures, and any body established under a law in force. The State and its instrumentalities may process personal data under deemed consent for specified State functions under Section 7(b), (c), and (d). The Central Government may by notification exempt the State or its instrumentalities from specified provisions of the Act.",
    relatedIds: ["deemed-consent", "exemptions", "processing-by-state"],
  },
];
