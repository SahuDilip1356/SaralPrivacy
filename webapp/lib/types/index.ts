// ─── Core Entity Types ───────────────────────────────────────────────────────

export type Industry =
  | "recruitment"
  | "ca-firms"
  | "training-institutes"
  | "d2c-brands"
  | "general"
  | "healthcare"
  | "fintech"
  | "edtech"
  | "manufacturing"
  | "retail";

export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export type ResourceType =
  | "white-paper"
  | "checklist"
  | "explainer"
  | "template"
  | "faq"
  | "webinar"
  | "guide"
  | "case-study";

export type RiskLevel = "green" | "amber" | "red";

// ─── Briefing Types ───────────────────────────────────────────────────────────

export interface Briefing {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: BriefingCategory;
  tags: string[];
  industries: Industry[];
  excerpt: string;
  whyItMatters: string;
  summary: string;
  businessImpact: string;
  whoIsAffected: string[];
  actionChecklist: string[];
  relatedIds: string[];
  author: Author;
  featured: boolean;
  readTime: number;
  /** Optional editorial note displayed as a banner on the briefing page (e.g. post-notification updates) */
  editorNote?: string;
}

/**
 * Values the `category` attribute can hold. Two eras coexist:
 *   - Legacy topic categories, written by the pre-taxonomy pipeline.
 *   - Journey stages, written by the current pipeline — `category` is where the
 *     Stage facet is stored (see `lib/data/briefing-taxonomy.ts`; the collection
 *     was at attribute capacity, so the facets ride on existing fields).
 * Both must render a human label — see `getCategoryLabel`.
 */
export type BriefingCategory =
  // Legacy topic categories
  | "regulatory-update"
  | "consent-management"
  | "data-rights"
  | "enforcement"
  | "compliance-guidance"
  | "sector-specific"
  | "technology"
  | "international"
  // Stage facet (current pipeline)
  | "learn"
  | "assess"
  | "fix"
  | "sustain";

export interface Author {
  name: string;
  role: string;
  initials: string;
}

// ─── Resource Types ───────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ResourceType;
  industries: Industry[];
  tags: string[];
  gated: boolean;
  downloadUrl?: string;
  publishedAt: string;
  featured: boolean;
}

// ─── Assessment Types ─────────────────────────────────────────────────────────

export interface AssessmentQuestion {
  id: string;
  text: string;
  helpText?: string;
  options: AssessmentOption[];
  category: string;
  weight: number;
}

export interface AssessmentOption {
  id: string;
  text: string;
  score: number; // 0 = low risk, 3 = high risk
}

export interface AssessmentResult {
  applicabilityScore: number;
  maturityScore: number;
  riskScore: number;
  urgencyScore: number;
  riskLevel: RiskLevel;
  headline: string;
  summary: string;
  recommendations: string[];
  nextStep: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface WhitePaperDownloadForm {
  fullName: string;
  workEmail: string;
  mobileNumber: string;
  companyName: string;
  industry: Industry;
  companySize: CompanySize;
  consentEmail: boolean;
  consentPhone: boolean;
  consentWebinars: boolean;
  privacyVersion: string;
}

export interface NewsletterForm {
  name: string;
  email: string;
  industry?: Industry;
  frequency: "daily" | "weekly";
  consentEmail: boolean;
}

export interface ConsultationForm {
  fullName: string;
  workEmail: string;
  mobileNumber: string;
  companyName: string;
  industry: Industry;
  companySize: CompanySize;
  issueSummary: string;
  preferredContact: "email" | "phone" | "whatsapp";
  preferredTime: string;
  consentContact: boolean;
}

export interface ConsentRecord {
  id: string;
  identifier: string;
  timestamp: string;
  sourcePage: string;
  purpose: string;
  consentText: string;
  privacyVersion: string;
  withdrawn: boolean;
  withdrawnAt?: string;
}

// ─── Lead / User Types ────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  email: string;
  name: string;
  company: string;
  industry: Industry;
  companySize: CompanySize;
  source: LeadSource;
  score: number;
  riskLevel?: RiskLevel;
  createdAt: string;
  tags: string[];
  consents: ConsentRecord[];
}

export type LeadSource =
  | "white-paper"
  | "newsletter"
  | "assessment"
  | "consultation"
  | "rights-request"
  | "webinar";

// ─── FAQ Types ────────────────────────────────────────────────────────────────

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  industries?: Industry[];
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  badge?: string;
}
