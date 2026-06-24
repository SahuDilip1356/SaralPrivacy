// SaralPrivacy — Notice Pack data layer (deterministic, no LLM)
// Canonical sector/data→purpose engine for the Notice Pack Builder (spec v3.0 §14/§15).
import type { NPContext, NPSector, NPBand } from "./types";

export const DATA_GROUPS: { group: string; items: string[] }[] = [
  { group: "Basic identity", items: ["Name", "Phone", "Email", "Address", "Date of birth", "Gender"] },
  { group: "Government IDs", items: ["PAN", "Aadhaar", "Passport", "Voter ID", "Driving licence"] },
  { group: "Financial", items: ["Bank account", "UPI ID", "Payment reference", "Card / token", "Loan details", "Credit score", "Income details"] },
  { group: "Health", items: ["Prescription", "Diagnosis", "Lab report", "Medical history", "Insurance details"] },
  { group: "Education / minor", items: ["Student name", "Parent / guardian name", "Age / class", "Attendance", "Academic record", "Photos / videos"] },
  { group: "Employment / recruitment", items: ["Resume / CV", "Work experience", "Salary expectations", "References", "BGV documents", "Interview notes"] },
  { group: "Digital / technical", items: ["IP address", "Device data", "Cookies", "Website usage", "Location data", "Analytics events"] },
  { group: "Documents / uploads", items: ["ITR documents", "Form 16", "Bank statements", "Agreements", "KYC documents", "Property documents", "Case files", "Visitor records"] },
];

export const SENSITIVE = new Set<string>([
  "PAN", "Aadhaar", "Passport", "Voter ID", "Driving licence",
  "Bank account", "UPI ID", "Payment reference", "Card / token", "Loan details", "Credit score", "Income details",
  "Prescription", "Diagnosis", "Lab report", "Medical history", "Insurance details",
  "KYC documents", "Bank statements", "ITR documents", "Form 16",
]);

export const DATA_PURPOSE: Record<string, string> = {
  "Name": "Identify you and provide the requested service",
  "Phone": "Service updates, scheduling and support",
  "Email": "Send confirmations, invoices and service updates",
  "Address": "Delivery, service at location and correspondence",
  "Date of birth": "Verify age and eligibility",
  "Gender": "Service personalisation where relevant",
  "PAN": "Tax filing and statutory compliance",
  "Aadhaar": "Identity verification where legally required",
  "Passport": "Identity verification and travel documentation",
  "Voter ID": "Identity verification",
  "Driving licence": "Identity verification",
  "Bank account": "Process payments, refunds and settlements",
  "UPI ID": "Process payments and refunds",
  "Payment reference": "Confirm payment and support refunds",
  "Card / token": "Process and confirm payments securely",
  "Loan details": "Assess and service the loan",
  "Credit score": "Assess creditworthiness for the service requested",
  "Income details": "Eligibility assessment and statutory reporting",
  "Prescription": "Dispense medicines and provide clinical care",
  "Diagnosis": "Provide treatment and maintain clinical records",
  "Lab report": "Diagnostic reporting and medical consultation",
  "Medical history": "Provide safe and appropriate care",
  "Insurance details": "Process claims and billing",
  "Student name": "Manage admission, classes and communication",
  "Parent / guardian name": "Parent communication and consent",
  "Age / class": "Class allocation and learning delivery",
  "Attendance": "Track attendance and inform parents",
  "Academic record": "Deliver learning and report progress",
  "Photos / videos": "Records and stated activities only",
  "Resume / CV": "Evaluate candidature for roles",
  "Work experience": "Assess suitability for roles",
  "Salary expectations": "Match roles and structure offers",
  "References": "Verify candidate background",
  "BGV documents": "Background verification before hiring",
  "Interview notes": "Assess and document the hiring decision",
  "IP address": "Security, fraud prevention and service operation",
  "Device data": "Service operation and security",
  "Cookies": "Run the website and remember preferences",
  "Website usage": "Operate and improve the specific service",
  "Location data": "Provide location-based service you requested",
  "Analytics events": "Measure and improve this specific service",
  "ITR documents": "Prepare and file income tax returns",
  "Form 16": "Prepare returns and verify income",
  "Bank statements": "Accounting, audit and tax support",
  "Agreements": "Service delivery and record keeping",
  "KYC documents": "Statutory identity verification",
  "Property documents": "Transaction processing and agreements",
  "Case files": "Provide legal advice and manage the matter",
  "Visitor records": "Premises safety and access control",
};

export const VAGUE = ["business purposes", "internal use", "better experience", "service improvement", "operational needs", "operational", "analytics", "marketing", "future communication", "other", "general", "misc"];

export const USE_CASES = ["Website", "Mobile app", "WhatsApp enquiries", "Offline form", "Customer onboarding", "Appointment booking", "Checkout / order form", "Admission form", "Job application form", "Newsletter / signup"];

export const CONTEXTS: NPContext[] = [
  { key: "contact", label: "Website contact form", mini: (b) => `We use your name, email and phone number to respond to your enquiry and provide service-related communication. You can contact ${b} to access, correct, delete or withdraw consent where applicable.` },
  { key: "whatsapp", label: "WhatsApp enquiry", mini: (b) => `We use your name and phone number to respond to your enquiry and provide service-related updates. ${b} sends promotional messages only if you opt in.` },
  { key: "checkout", label: "Checkout / order page", mini: () => `We use your name, phone number, address, order details and payment reference to process your order, arrange delivery, manage returns and provide customer support.` },
  { key: "appointment", label: "Appointment booking", mini: () => `We use your name, phone number, appointment details and, where relevant, health information to schedule consultations, maintain records and share reports with you.` },
  { key: "admission", label: "Admission form", mini: () => `We use student and parent details to process admission, manage classes, communicate updates, maintain attendance and provide learning support.` },
  { key: "job", label: "Job application form", mini: () => `We use your CV, contact details and work history to evaluate your application, coordinate interviews and, with your consent, conduct background verification.` },
  { key: "onboarding", label: "Client onboarding form", mini: () => `We use the details you provide to set up your account, deliver the agreed service and meet record-keeping and legal obligations.` },
  { key: "support", label: "Customer support form", mini: () => `We use your contact details and the information you share to resolve your request and improve our response.` },
  { key: "newsletter", label: "Newsletter signup", mini: () => `We use your email to send updates you have asked for. You can unsubscribe at any time.` },
  { key: "feedback", label: "Feedback / review form", mini: () => `We use your feedback and contact details to respond to you and improve our service.` },
  { key: "offline", label: "Offline paper form", mini: (b) => `We collect the details on this form only for the stated purpose. To access, correct or withdraw consent, contact ${b}.` },
  { key: "app", label: "Mobile app", mini: () => `We process the data you provide in the app to deliver its features. Permissions such as location are used only for the function you enable.` },
  { key: "cctv", label: "CCTV / visitor entry", mini: () => `We record visitor details and CCTV footage at our premises for safety, security and access control. Footage is retained only for a limited period.` },
  { key: "employee", label: "Employee / contractor onboarding", mini: () => `We process your details to manage employment or contracting, payroll, statutory filings and site access.` },
];

export const VENDORS = ["Payment gateway", "Logistics / courier", "WhatsApp / SMS / email provider", "Cloud storage", "CRM", "Accounting / tax consultant", "Legal consultant", "HR / payroll software", "Recruitment / BGV vendor", "LMS / EdTech platform", "Diagnostic lab partner", "Insurance partner", "Hotel / travel platform", "Analytics / advertising", "CCTV / security vendor"];

export const VENDOR_CLAUSE: Record<string, string> = {
  generic: "We may share personal data with service providers such as payment gateways, logistics partners, communication tools, cloud storage providers, CRM systems, professional advisors or other vendors, only for the purposes described in this notice.",
  d2c: "We may share order and contact details with payment gateways, delivery partners, customer-support tools, communication providers and analytics platforms.",
  ca: "We may share client data with authorised tax portals, accounting systems, audit tools, cloud storage providers and professional advisors where required for service delivery or legal compliance.",
  clinic: "We may share patient data with diagnostic labs, pharmacies, insurance partners, cloud software providers and communication tools where required for medical service delivery.",
};

export const CHILD_WHY = ["Admission / enrolment", "Classes & learning delivery", "Attendance & safety", "Parent communication", "Activities, photos or videos", "Transport"];

export function consentBlocks(b: string) {
  const n = b || "[Business Name]";
  return {
    service: `I consent to ${n} processing my personal data for the purposes explained in the Privacy Notice.`,
    marketing: `I agree to receive promotional messages from ${n} on WhatsApp, SMS, email or phone. I can opt out anytime.`,
    parental: `I confirm that I am the parent or lawful guardian and consent to ${n} processing the child's personal data for the stated purposes.`,
    vendor: `I understand that ${n} may share my personal data with service providers only for the purposes described in the Privacy Notice.`,
  };
}

export const SECTORS: NPSector[] = [
  { key: "ca", label: "CA Firm", data: ["Name", "Phone", "Email", "PAN", "Aadhaar", "ITR documents", "Form 16", "Bank statements", "Income details"], purposes: ["Tax filing", "Accounting", "Audit support", "GST compliance", "Payroll processing", "Client communication", "Statutory record keeping"], vendors: ["Accounting / tax consultant", "Cloud storage", "WhatsApp / SMS / email provider"], contexts: ["contact", "onboarding", "whatsapp"], children: false, vclause: "ca" },
  { key: "recruitment", label: "Recruitment / Staffing", data: ["Name", "Phone", "Email", "Resume / CV", "Work experience", "Salary expectations", "References", "BGV documents", "Interview notes"], purposes: ["Candidate matching", "Client sharing", "Interview coordination", "Background verification", "Offer processing", "Hiring communication"], vendors: ["Recruitment / BGV vendor", "CRM", "WhatsApp / SMS / email provider", "Cloud storage"], contexts: ["job", "contact", "whatsapp"], children: false, vclause: "generic" },
  { key: "coaching", label: "Coaching / Training Institute", data: ["Student name", "Parent / guardian name", "Phone", "Email", "Age / class", "Attendance", "Academic record", "Photos / videos"], purposes: ["Admission", "Class management", "Parent communication", "Learning delivery", "Attendance tracking", "Placement support"], vendors: ["LMS / EdTech platform", "WhatsApp / SMS / email provider", "Cloud storage"], contexts: ["admission", "whatsapp", "app"], children: true, vclause: "generic" },
  { key: "d2c", label: "D2C Brand", data: ["Name", "Phone", "Email", "Address", "Payment reference", "Website usage", "Analytics events"], purposes: ["Order processing", "Delivery", "Returns", "Customer support", "Marketing with consent", "Fraud prevention", "Analytics"], vendors: ["Payment gateway", "Logistics / courier", "WhatsApp / SMS / email provider", "Analytics / advertising", "CRM"], contexts: ["checkout", "whatsapp", "support", "newsletter"], children: false, vclause: "d2c" },
  { key: "clinic", label: "Clinic / Diagnostic Lab", data: ["Name", "Phone", "Date of birth", "Prescription", "Diagnosis", "Lab report", "Medical history", "Payment reference"], purposes: ["Appointment booking", "Medical consultation", "Diagnostic reporting", "Billing", "Patient communication", "Statutory record keeping"], vendors: ["Diagnostic lab partner", "Insurance partner", "Cloud storage", "WhatsApp / SMS / email provider"], contexts: ["appointment", "whatsapp", "contact"], children: false, vclause: "clinic" },
  { key: "school", label: "School / College", data: ["Student name", "Parent / guardian name", "Age / class", "Attendance", "Academic record", "Photos / videos", "Visitor records"], purposes: ["Admission", "Education delivery", "Safety", "Attendance", "Parent communication", "Fee administration", "Transport management"], vendors: ["LMS / EdTech platform", "WhatsApp / SMS / email provider", "CCTV / security vendor", "Cloud storage"], contexts: ["admission", "cctv", "app"], children: true, vclause: "generic" },
  { key: "law", label: "Law Firm", data: ["Name", "Phone", "Email", "Case files", "Agreements", "KYC documents", "Payment reference"], purposes: ["Legal advice", "Case management", "Court filing", "Client communication", "Billing", "Statutory compliance"], vendors: ["Legal consultant", "Cloud storage", "WhatsApp / SMS / email provider"], contexts: ["contact", "onboarding"], children: false, vclause: "generic" },
  { key: "realestate", label: "Real Estate Broker", data: ["Name", "Phone", "Email", "PAN", "Aadhaar", "Property documents", "Payment reference"], purposes: ["Property matching", "Site visits", "Agreement preparation", "KYC", "Client communication", "Transaction support"], vendors: ["CRM", "WhatsApp / SMS / email provider", "Cloud storage"], contexts: ["contact", "whatsapp", "onboarding"], children: false, vclause: "generic" },
  { key: "hotel", label: "Hotel / Travel", data: ["Name", "Phone", "Email", "Address", "Passport", "Payment reference"], purposes: ["Booking", "Check-in", "Travel coordination", "Legal compliance", "Guest support", "Billing"], vendors: ["Hotel / travel platform", "Payment gateway", "WhatsApp / SMS / email provider", "Cloud storage"], contexts: ["checkout", "contact", "support"], children: false, vclause: "generic" },
  { key: "pharmacy", label: "Pharmacy", data: ["Name", "Phone", "Prescription", "Medical history", "Address", "Payment reference"], purposes: ["Medicine dispensing", "Prescription verification", "Refill reminders", "Delivery", "Billing", "Legal compliance"], vendors: ["Logistics / courier", "Cloud storage", "WhatsApp / SMS / email provider"], contexts: ["contact", "whatsapp", "checkout"], children: false, vclause: "clinic" },
  { key: "fintech", label: "Financial Services / NBFC", data: ["Name", "Phone", "Email", "PAN", "Aadhaar", "Bank account", "Income details", "Credit score", "Loan details"], purposes: ["KYC", "Loan evaluation", "Credit assessment", "Mandate setup", "Regulatory compliance", "Customer support"], vendors: ["Payment gateway", "CRM", "Cloud storage", "Analytics / advertising"], contexts: ["onboarding", "contact", "app"], children: false, vclause: "generic" },
  { key: "manufacturing", label: "Manufacturing / Industrial", data: ["Name", "Phone", "Bank account", "Attendance", "Visitor records"], purposes: ["Employment management", "Contractor onboarding", "Site safety", "Attendance", "Payroll", "Access control", "Legal compliance"], vendors: ["HR / payroll software", "CCTV / security vendor", "Cloud storage"], contexts: ["employee", "cctv"], children: false, vclause: "generic" },
];

export const SCORE_WEIGHTS = { businessType: 5, dataCategories: 10, purposeMapped: 20, contexts: 10, withdrawal: 10, rightsContact: 10, vendorDisclosed: 10, retention: 10, children: 10, dsar: 5 };

export const SCORE_BANDS: NPBand[] = [
  { min: 85, label: "Strong", color: "#059669", bg: "#E6F7F0", msg: "Your notice pack is well-structured and ready for final review." },
  { min: 70, label: "Good", color: "#0E9F73", bg: "#E6F7F0", msg: "Your notice covers most practical requirements. Review before publishing." },
  { min: 40, label: "Basic", color: "#B98A1E", bg: "#FBF3E2", msg: "You have a usable draft, but important gaps remain." },
  { min: 0, label: "Weak", color: "#E24B4A", bg: "#FCEBEB", msg: "Your notice is incomplete. Add missing data, purpose, contact and withdrawal details." },
];
