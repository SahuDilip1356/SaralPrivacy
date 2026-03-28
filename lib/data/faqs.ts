import { FAQItem } from "../types";

export const faqs: FAQItem[] = [
  {
    id: "f001",
    question: "What is the Digital Personal Data Protection Act (DPDPA)?",
    answer:
      "The Digital Personal Data Protection Act, 2023 is India's first comprehensive data protection legislation. It governs how personal data of Indian citizens can be collected, stored, processed, and used by businesses and organisations. The Act was passed by Parliament in August 2023. The DPDP Rules, 2025 have been notified, with phased commencement, making this implementation time for businesses. It establishes rights for individuals over their personal data and obligations for businesses that process that data.",
    category: "basics",
  },
  {
    id: "f002",
    question: "Does DPDPA apply to my small business?",
    answer:
      "If your business collects, stores, or processes personal data of Indian citizens — even just names, email addresses, or mobile numbers — it is likely covered by the DPDPA. There is no explicit exemption for small or micro businesses in the current text of the Act. However, the government may notify specific exemptions for certain categories of businesses through rules. Until then, all businesses collecting personal data should plan for compliance. The first step is understanding what data you collect and why.",
    category: "applicability",
  },
  {
    id: "f003",
    question: "What counts as 'personal data' under the DPDPA?",
    answer:
      "Personal data means any data about an individual who is identifiable from that data. This includes obvious examples like name, email, mobile number, PAN, Aadhaar, and bank account details. It also includes less obvious data like IP addresses, device identifiers, location data, and behavioural data tied to a specific individual. If a piece of data can be linked back to a real, identifiable person — directly or in combination with other data — it is personal data under the Act.",
    category: "basics",
  },
  {
    id: "f004",
    question: "What is 'consent' under DPDPA and how must it be collected?",
    answer:
      "Under DPDPA, consent must be: free (not coerced), specific (tied to a defined purpose), informed (accompanied by a clear notice explaining what data is collected and why), unconditional (not bundled with other terms), and unambiguous (a clear affirmative action, not silence or a pre-checked box). Businesses must provide a 'consent notice' before or at the time of collecting personal data. Each distinct purpose requires separate consent. Pre-ticked checkboxes, bundled consent in Terms and Conditions, and vague statements like 'by using this site you agree' are not compliant.",
    category: "consent",
  },
  {
    id: "f005",
    question: "Can I still send marketing emails to existing customers?",
    answer:
      "If your existing customers explicitly consented to receive marketing communications when they first shared their email, and that consent was specific and informed, you may continue to communicate with them. However, if you collected email addresses primarily for transactional purposes (order confirmations, delivery updates) and have been using them for promotional marketing without specific consent, you are in a grey area. The safest approach is to run a re-consent campaign for your existing marketing list and honour all opt-outs promptly. Any new subscriber must go through a DPDPA-compliant consent flow.",
    category: "consent",
    industries: ["d2c-brands"],
  },
  {
    id: "f006",
    question: "What rights do individuals have under DPDPA?",
    answer:
      "Individuals (called 'Data Principals' in the Act) have four core rights: (1) Right to access information — they can ask what personal data you hold about them and for what purpose; (2) Right to correction and erasure — they can request inaccurate data to be corrected or data that is no longer necessary to be deleted; (3) Right to grievance redressal — every Data Fiduciary must have a designated contact to handle data-related complaints, and if unresolved, the individual can escalate to the Data Protection Board; (4) Right of nomination — individuals can nominate someone to exercise these rights on their behalf in case of death or incapacity. Businesses must have processes in place to receive, verify, and respond to these requests.",
    category: "rights",
  },
  {
    id: "f007",
    question: "What are the penalties for non-compliance with DPDPA?",
    answer:
      "The Act prescribes penalties for specific violations: up to ₹250 crore for failure to implement adequate security safeguards; up to ₹200 crore for failure to notify the Data Protection Board of a data breach; up to ₹200 crore for failure to observe special provisions for children's data; up to ₹10,000 for an individual Data Principal who files a frivolous complaint. Penalties are imposed by the Data Protection Board after due process, not automatically. The Board is empowered to conduct inquiries and issue orders. Note that penalties can be imposed per instance of non-compliance, not per company.",
    category: "enforcement",
  },
  {
    id: "f008",
    question: "Who is the Data Protection Board of India?",
    answer:
      "The Data Protection Board of India (DPBI) is the regulatory authority established under the DPDPA. It is responsible for adjudicating complaints from Data Principals, conducting inquiries into data breaches and non-compliance, issuing orders and imposing penalties, and issuing directions to Data Fiduciaries. The Board is expected to operate as an independent body. Businesses can appeal Board decisions to the Appellate Tribunal and thereafter to the High Court. The Data Protection Board of India is established under the Act.",
    category: "regulatory",
  },
  {
    id: "f009",
    question: "Do recruitment agencies need to get consent from candidates?",
    answer:
      "Yes. When a candidate submits their CV or profile to your agency, they are sharing personal data. You need their consent to store that data, share it with clients, and retain it for future opportunities. Specifically: (1) If you share a candidate's resume with a client, the candidate must know this and have consented to it; (2) If you retain a rejected candidate's data for future matching, you need consent for that specific purpose; (3) If you use their contact details to market your services to them, that requires separate marketing consent. The consent must be obtained at the point of data collection — typically when they submit their application or profile.",
    category: "sector-specific",
    industries: ["recruitment"],
  },
  {
    id: "f010",
    question: "How should a CA firm handle PAN and Aadhaar data?",
    answer:
      "PAN and Aadhaar data are particularly sensitive. Aadhaar is additionally governed by the Aadhaar Act, 2016. For DPDPA purposes: (1) Collect only what you genuinely need for the specific engagement (data minimisation); (2) Store it securely with access limited to staff who need it; (3) Define retention periods — you should not keep PAN copies longer than required for the filing or audit they were collected for; (4) Inform clients (in your engagement letter or a separate notice) what data you are collecting and why; (5) If you use cloud storage or shared drives, ensure they are access-controlled and the vendor has appropriate security practices. Consider adding data handling terms to your standard client engagement letters.",
    category: "sector-specific",
    industries: ["ca-firms"],
  },
  {
    id: "f011",
    question: "What is a 'Data Fiduciary' and am I one?",
    answer:
      "A Data Fiduciary is any person (including a company, firm, or individual) who alone or jointly with others determines the purpose and means of processing personal data. In plain language: if your business decides what data to collect, why to collect it, and how to use it — you are a Data Fiduciary. Most businesses that deal with customers, clients, employees, or leads are Data Fiduciaries for at least some of their data processing activities. As a Data Fiduciary, you have obligations around consent, notice, security, breach notification, and honouring individual rights.",
    category: "basics",
  },
  {
    id: "f012",
    question: "When will DPDPA be enforced? Is there a grace period?",
    answer:
      "The DPDP Rules, 2025 were notified on 14 November 2025. Implementation is phased: some rules took effect immediately, others take effect 12 and 18 months later. For most businesses, the priority is to use this transition window productively — fix consent flows, privacy notices, rights-handling workflows, and retention policies now.",
    category: "regulatory",
  },
  {
    id: "f013",
    question: "Do I need to appoint a Data Protection Officer?",
    answer:
      "Not every business is required to appoint a DPO. The obligation to appoint a Data Protection Officer applies specifically to 'Significant Data Fiduciaries' — entities that the Central Government designates as such based on factors like volume of data processed, sensitivity of data, and risk to individuals. For most small and medium businesses, a formal DPO is not a statutory requirement. However, you do need to designate a point of contact for data-related grievances and rights requests — this could be an existing role such as a Privacy Champion, Compliance Manager, or even a founder in a small business.",
    category: "compliance",
  },
  {
    id: "f014",
    question: "Can I store customer data in foreign countries?",
    answer:
      "The DPDPA permits the transfer of personal data outside India, subject to restrictions. The Central Government has the power to restrict data transfers to specific countries or territories. Initially, the Act takes a 'whitelist' approach — transfers can be made to countries notified by the government as permissible destinations. The specific list of permitted countries has not yet been finalised. Businesses that transfer personal data internationally (for example, using US-based SaaS tools, cloud services, or offshore data centres) must monitor this closely and be prepared to comply with transfer restrictions when they are notified. Data localisation requirements (if any) will be specified in the rules.",
    category: "compliance",
  },
  {
    id: "f015",
    question: "How do I handle a 'delete my data' request from a customer?",
    answer:
      "When a customer requests deletion of their data, you should: (1) Verify their identity to confirm they are the person whose data is being requested for deletion; (2) Assess whether there is a lawful reason to retain the data — for example, an ongoing contract, a legal obligation (like tax records), or an active dispute; (3) If no such reason applies, delete the data across all systems (primary database, backups, email archives, third-party tools) within a reasonable period; (4) Inform the customer when the deletion is complete; (5) Document the request and your response for your records. If you are unable to comply, explain the specific legal reason for retaining the data. Ignoring deletion requests is a violation of the DPDPA and grounds for a complaint to the Data Protection Board.",
    category: "rights",
  },
];

export function getFAQsByCategory(category: string): FAQItem[] {
  return faqs.filter((f) => f.category === category);
}

export function getFAQsByIndustry(industry: string): FAQItem[] {
  return faqs.filter(
    (f) => !f.industries || f.industries.includes(industry as any)
  );
}

export const faqCategories = [
  { id: "basics", label: "DPDPA Basics" },
  { id: "applicability", label: "Who It Applies To" },
  { id: "consent", label: "Consent" },
  { id: "rights", label: "Individual Rights" },
  { id: "enforcement", label: "Enforcement & Penalties" },
  { id: "regulatory", label: "Regulatory Authority" },
  { id: "compliance", label: "Compliance Steps" },
  { id: "sector-specific", label: "Sector-Specific" },
];
