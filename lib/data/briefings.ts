import { Briefing } from "../types";

export const briefings: Briefing[] = [
  {
    id: "b001",
    slug: "dpdpa-consent-notice-requirements-2025",
    title: "DPDPA Consent Notice Requirements: What Your Forms Must Say From Day One",
    date: "2025-03-15",
    category: "consent-management",
    tags: ["consent", "notice", "forms", "data-principal"],
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands"],
    excerpt:
      "The DPDPA mandates that every consent request must be accompanied by a clear, standalone notice. Generic 'I agree to T&Cs' checkboxes are no longer sufficient. Here is what Indian businesses must implement.",
    whyItMatters:
      "Most Indian business websites currently bundle consent into Terms and Conditions, which the DPDPA explicitly prohibits. If your sign-up form, enquiry form, or checkout page uses pre-checked boxes or bundled consent language, you are operating outside the framework of the Act. Rectifying this before enforcement begins is significantly easier than retrofitting it under regulatory scrutiny.",
    summary:
      "Under Section 6 of the Digital Personal Data Protection Act, 2023, every Data Fiduciary must provide a 'notice' to the Data Principal before or at the time of collecting personal data. This notice must be itemised, clear, and in plain language. It must specify exactly what data is being collected, the purpose for which it is being processed, and how the individual can exercise their rights. Crucially, consent must be free, specific, informed, unconditional, and unambiguous — meaning each distinct purpose requires a separate consent signal. You cannot combine marketing consent with transaction processing consent in the same checkbox.",
    businessImpact:
      "Businesses collecting personal data through websites, apps, or offline forms must redesign their consent flows. This affects customer acquisition, CRM onboarding, newsletter subscriptions, lead generation forms, and employee data collection. Penalties for non-compliant consent can reach up to ₹250 crore per instance of non-compliance.",
    whoIsAffected: [
      "Any business with an online presence collecting customer or lead data",
      "HR teams processing job applications and candidate information",
      "Educational institutions collecting student and parent contact details",
      "E-commerce brands running email, SMS, or WhatsApp marketing",
      "CA firms processing client data for tax, audit, or payroll services",
    ],
    actionChecklist: [
      "Audit every form on your website and mobile app for consent language",
      "Remove pre-checked consent boxes immediately",
      "Separate marketing consent from service delivery consent",
      "Add a purpose statement to each consent item",
      "Link to your Privacy Notice from every consent point",
      "Log consent with timestamp, IP, and privacy notice version",
      "Test your consent withdrawal mechanism works end-to-end",
    ],
    relatedIds: ["b002", "b005", "b007"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: true,
    readTime: 5,
  },
  {
    id: "b002",
    slug: "recruitment-agencies-dpdpa-cv-database-risk",
    title: "Recruitment Agencies: Your CV Database Is Now a Regulated Data Asset",
    date: "2025-03-14",
    category: "sector-specific",
    tags: ["recruitment", "cv-database", "candidate-data", "retention"],
    industries: ["recruitment"],
    excerpt:
      "Every resume stored in your ATS or shared folder is personal data under DPDPA. Recruitment agencies handling candidate profiles for multiple clients face layered obligations they may not be aware of.",
    whyItMatters:
      "Recruitment agencies routinely collect, store, and share sensitive candidate data — resumes, identity documents, salary expectations, reference contacts — across multiple clients and platforms. Many of these practices were unregulated. DPDPA changes that fundamentally. Agencies that process personal data as part of their core business model are Data Fiduciaries with significant obligations.",
    summary:
      "A recruitment agency sits at the intersection of multiple data flows: candidate personal data, client confidential requirements, background check documents, reference information, and in some cases, sensitive financial or medical data. Under DPDPA, collecting a resume constitutes collection of personal data. Sharing that resume with a client without specific consent from the candidate could constitute a violation. Retaining rejected candidate data beyond a reasonable period without notice is also a compliance gap. Agencies using third-party ATS platforms must ensure those vendors qualify as Data Processors under compliant agreements.",
    businessImpact:
      "Agencies must implement candidate consent flows at the point of CV submission. Data sharing with clients must be disclosed in the consent notice. Retention policies for rejected candidates must be defined and communicated. Third-party ATS vendors must sign Data Processing Agreements.",
    whoIsAffected: [
      "Recruitment and staffing agencies of all sizes",
      "Body-shopping and IT resource deployment firms",
      "Executive search and headhunting firms",
      "In-house recruiters using ATS platforms",
      "Background verification companies processing candidate data",
    ],
    actionChecklist: [
      "Map every location where candidate data is stored (ATS, email, cloud drives, spreadsheets)",
      "Define a retention policy for active, passive, and rejected candidates",
      "Add explicit consent language to your candidate submission forms",
      "Update client agreements to specify data sharing scope",
      "Sign Data Processing Agreements with your ATS vendor",
      "Create a process for candidates to request deletion of their data",
      "Train recruiters on what data they can and cannot share without consent",
    ],
    relatedIds: ["b001", "b003"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 6,
  },
  {
    id: "b003",
    slug: "ca-firms-pan-aadhaar-obligations-dpdpa",
    title: "CA Firms and DPDPA: Your Obligations When Handling PAN, Aadhaar, and Client Financial Records",
    date: "2025-03-13",
    category: "sector-specific",
    tags: ["ca-firms", "aadhaar", "pan", "financial-data", "retention"],
    industries: ["ca-firms"],
    excerpt:
      "Chartered Accountant firms handle some of the most sensitive personal data in India — PAN, Aadhaar, bank account details, payroll records, and tax filings. DPDPA treats this as regulated personal data with specific handling obligations.",
    whyItMatters:
      "CA firms have traditionally relied on client relationships and professional confidentiality as their primary data governance framework. DPDPA creates a parallel statutory layer with enforceable obligations. Firms that process payroll for clients are acting as Data Processors. Firms that manage their own employee data are Data Fiduciaries. Both roles create compliance obligations that must be addressed proactively.",
    summary:
      "Under DPDPA, processing personal data for tax filings, audits, payroll, or advisory services requires a lawful basis. Where the client is a company, the firm processes personal data of third-party individuals (employees, directors, shareholders). This creates obligations around notice, purpose limitation, and retention. Aadhaar data is particularly sensitive — its use is already governed by the Aadhaar Act, and DPDPA adds further requirements. Bank account numbers, salary slips, and investment records are personal data that must be handled with access controls, encryption, and documented retention schedules.",
    businessImpact:
      "Firms must audit their client data flows and identify where personal data of individuals (not just companies) is processed. Shared drives, email attachments, and cloud accounting tools are all vectors for personal data that need governance. Staff must be trained on data handling. Retention and deletion schedules must be documented.",
    whoIsAffected: [
      "Chartered Accountant firms processing payroll",
      "Tax consultants handling individual ITR filings",
      "Audit firms with access to employee and director records",
      "Accounting firms using cloud tools like Tally, Zoho Books, or QuickBooks",
      "Professionals managing GST compliance for clients",
    ],
    actionChecklist: [
      "List all categories of personal data your firm processes (PAN, Aadhaar, bank, salary)",
      "Identify which engagements make you a Data Fiduciary vs Data Processor",
      "Audit access controls on your shared drives and email",
      "Define retention periods for client files (including digital scans)",
      "Add data handling terms to your client engagement letters",
      "Train staff on data minimisation and secure handling",
      "Create a documented process for responding to data access or deletion requests",
    ],
    relatedIds: ["b001", "b004"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 7,
  },
  {
    id: "b004",
    slug: "d2c-brands-whatsapp-marketing-consent-dpdpa",
    title: "D2C Brands: WhatsApp and SMS Marketing Under DPDPA — What Changes Now",
    date: "2025-03-12",
    category: "consent-management",
    tags: ["d2c", "whatsapp", "sms", "marketing-consent", "opt-in"],
    industries: ["d2c-brands"],
    excerpt:
      "If your D2C brand sends promotional messages via WhatsApp, SMS, or email, you need to verify that your consent collection is DPDPA-compliant. Implied consent from a past purchase is no longer a reliable basis for marketing.",
    whyItMatters:
      "India's D2C ecosystem is heavily reliant on WhatsApp marketing, SMS retargeting, and email flows. Most brands use a customer's purchase history as implied permission to market to them. DPDPA's consent framework challenges this. Going forward, marketing communications require specific, informed consent that is separate from transactional consent.",
    summary:
      "A customer placing an order on your website gives consent for order fulfilment — shipping updates, payment confirmations, return processing. That consent does not automatically extend to promotional messages, loyalty programme nudges, or retargeting campaigns. Under DPDPA, each of these purposes requires separate consent. Brands using Meta's WhatsApp Business API, for example, must ensure their opt-in flows meet DPDPA requirements in addition to Meta's own policies. Brands using third-party analytics tools (Meta Pixel, Google Analytics, Clevertap, WebEngage) that process personal data must also disclose this in their Privacy Notice.",
    businessImpact:
      "D2C brands will need to redesign their checkout flows to separate transactional and marketing consent. Existing customer databases may need re-consent campaigns. Marketing automation workflows must include consent verification before sending. Third-party tool disclosures must be added to Privacy Notices.",
    whoIsAffected: [
      "D2C brands sending WhatsApp, SMS, or email marketing",
      "E-commerce platforms using customer data for retargeting",
      "Brands running loyalty or referral programmes",
      "Companies using Meta Pixel, Google Analytics, or marketing automation tools",
      "Subscription box businesses collecting recurring customer data",
    ],
    actionChecklist: [
      "Separate marketing consent from order/transaction consent at checkout",
      "Audit your WhatsApp opt-in and opt-out flows",
      "Update your Privacy Notice to disclose third-party analytics tools",
      "Build an unsubscribe mechanism for every marketing channel",
      "Verify that your CRM tags consented vs non-consented customers",
      "Run a consent refresh campaign for your existing subscriber list",
      "Set up consent withdrawal processing within 72 hours",
    ],
    relatedIds: ["b001", "b005"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 5,
  },
  {
    id: "b005",
    slug: "data-breach-notification-obligations-dpdpa",
    title: "Data Breach Notification Under DPDPA: Timeline, Scope, and What Businesses Must Do",
    date: "2025-03-11",
    category: "regulatory-update",
    tags: ["data-breach", "notification", "incident-response", "dpb"],
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands"],
    excerpt:
      "DPDPA requires Data Fiduciaries to notify the Data Protection Board and affected Data Principals in the event of a data breach. The rules on timing, scope, and format are now taking shape.",
    whyItMatters:
      "Many Indian businesses have no formal incident response plan. A ransomware attack, leaked database, or accidental email disclosure that exposes customer or employee personal data triggers mandatory notification obligations under DPDPA. Failing to notify can result in penalties up to ₹200 crore. More importantly, delayed or mishandled breach communication dramatically erodes customer trust.",
    summary:
      "Section 8(6) of DPDPA requires every Data Fiduciary to notify the Data Protection Board (DPB) of a personal data breach 'in such manner and within such period as may be prescribed'. Draft rules suggest a two-stage notification: an initial report within 72 hours of becoming aware of the breach, followed by a detailed investigation report. Data Principals who are affected must also be informed, unless the breach is assessed as low-risk. Businesses should now build basic incident response capabilities: detection, containment, assessment, notification, and remediation.",
    businessImpact:
      "Businesses must develop or update incident response plans to include DPDPA notification requirements. Contracts with vendors and cloud providers must include breach notification SLAs. Security practices around access logs, encryption, and monitoring should be reviewed. Internal escalation protocols must be documented.",
    whoIsAffected: [
      "All businesses processing personal data",
      "Cloud and SaaS vendors holding customer data",
      "HR teams managing employee records",
      "Businesses using third-party payment gateways",
      "Any company storing sensitive personal data",
    ],
    actionChecklist: [
      "Designate a Data Protection point of contact internally",
      "Create a basic incident response runbook with DPDPA notification steps",
      "Review your cloud and vendor contracts for breach notification clauses",
      "Test whether you can detect a data breach within 24 hours",
      "Document what constitutes a 'personal data breach' for your business",
      "Identify all systems containing personal data and their access logs",
      "Prepare breach notification templates for the DPB and for customers",
    ],
    relatedIds: ["b001", "b006"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 6,
  },
  {
    id: "b006",
    slug: "training-institutes-student-data-dpdpa",
    title: "Training Institutes and DPDPA: Managing Student, Parent, and Admissions Data",
    date: "2025-03-10",
    category: "sector-specific",
    tags: ["training-institutes", "student-data", "admissions", "marketing-consent"],
    industries: ["training-institutes"],
    excerpt:
      "Education and training institutes collect student data at scale — from lead forms and admissions to attendance and placements. DPDPA creates specific obligations around how this data is collected, stored, and used for marketing.",
    whyItMatters:
      "Training institutes are significant personal data processors. They handle student identity documents, payment details, parent contact information, academic records, and placement data. Many run aggressive digital marketing campaigns using remarketing pixels and purchased lead lists. These practices now carry legal risk under DPDPA.",
    summary:
      "An admissions enquiry form that captures a student's name, mobile, email, city, and course interest is collecting personal data. If that data is used to retarget the student via Facebook ads or shared with counsellors who call them repeatedly, each of these activities requires specific consent. Institutes that deal with students under 18 face additional obligations — parental consent is required for processing minors' data. Placement data is particularly sensitive: it may include salary information, employer identity, and employment contracts. This data should be retained only as long as necessary and accessed only by authorised staff.",
    businessImpact:
      "Admissions forms need consent redesign. Marketing databases need consent verification. Student data retention policies need to be formalised. Placement cell data practices need to be reviewed. Staff handling student data need to be trained.",
    whoIsAffected: [
      "Training institutes and coaching centres",
      "EdTech platforms with physical campuses",
      "University and college admissions teams",
      "Placement cells handling employer and student data",
      "Institutes running digital marketing campaigns for admissions",
    ],
    actionChecklist: [
      "Add clear consent language to all admissions and enquiry forms",
      "Implement parental consent for students under 18",
      "Define what student data is retained after course completion and for how long",
      "Audit your remarketing pixels and third-party lead tools",
      "Create a process for students to access or delete their data",
      "Restrict placement data access to authorised staff only",
      "Update your website Privacy Notice to reflect all data processing activities",
    ],
    relatedIds: ["b001", "b002"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 5,
  },
  {
    id: "b007",
    slug: "rights-of-data-principals-dpdpa-explained",
    title: "Rights of Data Principals Under DPDPA: What Individuals Can Demand and How Businesses Must Respond",
    date: "2025-03-09",
    category: "data-rights",
    tags: ["data-rights", "access", "correction", "erasure", "grievance-redressal"],
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands"],
    excerpt:
      "Chapter IV of the DPDPA grants individuals new rights over their personal data. Businesses must build operational processes to receive, verify, and respond to these requests — or face penalties.",
    whyItMatters:
      "The rights framework in DPDPA is enforceable. Individuals can file complaints with the Data Protection Board if their rights requests are ignored or mishandled. For businesses, this means that a 'delete my data' email from a former customer is now a legal request with a response obligation, not an optional feedback message.",
    summary:
      "The DPDPA grants Data Principals four core rights: (1) Right to access information about personal data being processed; (2) Right to correction and erasure of inaccurate or unnecessary data; (3) Right to grievance redressal through a designated contact at the organisation; and (4) Right to nominate someone to exercise these rights in case of death or incapacity. Businesses must designate a point of contact, establish a process to verify the identity of the requester, respond within the prescribed period, and document the outcome. Deletion requests may have exceptions — for example, where data is required for legal compliance — but these exceptions must be documented and communicated.",
    businessImpact:
      "Businesses need a designated contact for data-related requests. They need a workflow to receive, verify, and resolve access and deletion requests. Response timelines must be built into operational procedures. Refusals must be documented with reasons.",
    whoIsAffected: [
      "All businesses processing personal data of individuals",
      "Companies with customer-facing operations",
      "HR teams managing employee and candidate records",
      "Marketing teams holding subscriber and lead databases",
    ],
    actionChecklist: [
      "Designate a Data Protection contact (email or web form) on your website",
      "Build a simple intake form for access, correction, and deletion requests",
      "Define your identity verification process for rights requests",
      "Set internal SLAs for responding to rights requests",
      "Document exceptions to deletion (legal hold, contractual obligation)",
      "Train customer-facing teams to recognise and escalate data rights requests",
      "Test your rights request process end-to-end quarterly",
    ],
    relatedIds: ["b001", "b005"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 6,
  },
  {
    id: "b008",
    slug: "significant-data-fiduciary-status-dpdpa",
    title: "Significant Data Fiduciaries: Who Gets Designated and What Additional Obligations Apply",
    date: "2025-03-08",
    category: "regulatory-update",
    tags: ["significant-data-fiduciary", "sdf", "high-volume", "dpia"],
    industries: ["d2c-brands", "general"],
    excerpt:
      "The government can designate certain businesses as 'Significant Data Fiduciaries' based on data volumes, sensitivity, and risk. These entities face additional obligations including Data Protection Impact Assessments and a Data Protection Officer.",
    whyItMatters:
      "Growing D2C brands, large HR platforms, and any business that processes high volumes of sensitive personal data may be designated as Significant Data Fiduciaries. This designation triggers additional compliance obligations — a DPO appointment, periodic DPIA, audits, and algorithmic impact assessments. Understanding whether your business is likely to be in scope is an important strategic question.",
    summary:
      "Section 10 of the DPDPA allows the Central Government to designate any Data Fiduciary as a Significant Data Fiduciary (SDF) based on factors such as: volume of personal data processed, sensitivity of the data, potential risk to Data Principals, impact on national security, and risk to electoral democracy. SDFs must: appoint a Data Protection Officer; conduct periodic Data Protection Impact Assessments; carry out periodic audits; and comply with algorithmic transparency requirements. The DPO must be a senior officer based in India and be a point of contact for the Data Protection Board.",
    businessImpact:
      "Businesses approaching high data volumes should begin building the internal governance structures that would be required under SDF designation. Appointing a DPO early, even informally, demonstrates good-faith compliance and positions the business well ahead of regulatory pressure.",
    whoIsAffected: [
      "Large e-commerce and D2C platforms",
      "HR tech and recruitment platforms",
      "EdTech platforms with high student enrolment",
      "Financial services and fintech companies",
      "Social platforms and community apps",
    ],
    actionChecklist: [
      "Estimate the volume of personal data records your business processes monthly",
      "Identify whether you process any sensitive personal data categories",
      "Assess whether your data processing could impact national security or public order",
      "Consider appointing a DPO or Privacy Champion internally",
      "Begin documenting your data processing activities in a data map",
      "Review your vendor list for any third-country data transfers",
    ],
    relatedIds: ["b005", "b007"],
    author: {
      name: "DPDPA Editorial Team",
      role: "Regulatory Intelligence",
      initials: "DE",
    },
    featured: false,
    readTime: 7,
  },
];

export function getBriefingBySlug(slug: string): Briefing | undefined {
  return briefings.find((b) => b.slug === slug);
}

export function getFeaturedBriefing(): Briefing | undefined {
  return briefings.find((b) => b.featured);
}

export function getLatestBriefings(count: number): Briefing[] {
  return [...briefings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

export function getBriefingsByIndustry(industry: string): Briefing[] {
  return briefings.filter((b) => b.industries.includes(industry as any));
}

export function getBriefingsByCategory(category: string): Briefing[] {
  return briefings.filter((b) => b.category === category);
}
