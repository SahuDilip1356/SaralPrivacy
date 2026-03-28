/**
 * analytics.ts — GA4 custom event helpers for SaralPrivacy
 *
 * Usage (client components only):
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent.assessmentComplete({ score: 4, band: "Moderate Risk" });
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function gtag(event: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

export const trackEvent = {

  // ── Assessment (old /assessment route) ─────────────────────────────────
  assessmentComplete: (params: {
    score: number;
    band: string;
    industry?: string;
  }) => gtag("assessment_complete", {
    event_category:  "engagement",
    score:           params.score,
    risk_band:       params.band,
    industry:        params.industry || "",
  }),

  // ── Survey (new /assessment survey flow) ────────────────────────────────
  surveyComplete: (params: {
    score: number;
    band: string;
    role?: string;
    sector?: string;
    wants_report?: boolean;
  }) => gtag("survey_complete", {
    event_category:  "engagement",
    score:           params.score,
    risk_band:       params.band,
    role:            params.role    || "",
    sector:          params.sector  || "",
    wants_report:    params.wants_report ? "yes" : "no",
  }),

  // ── White paper download ────────────────────────────────────────────────
  download: (params: {
    industry?: string;
    company_size?: string;
  }) => gtag("file_download", {
    event_category:  "lead",
    file_name:       "DPDPA_Visual_Guide",
    industry:        params.industry     || "",
    company_size:    params.company_size || "",
  }),

  // ── Newsletter subscribe ────────────────────────────────────────────────
  subscribe: (params: {
    industry?: string;
    frequency?: string;
  }) => gtag("subscribe", {
    event_category:  "lead",
    industry:        params.industry  || "",
    frequency:       params.frequency || "weekly",
  }),

  // ── Consultation / contact request ─────────────────────────────────────
  consultationRequest: (params: {
    industry?: string;
    preferred_contact?: string;
  }) => gtag("generate_lead", {
    event_category:    "lead",
    industry:          params.industry          || "",
    preferred_contact: params.preferred_contact || "",
  }),

  // ── Briefing read ───────────────────────────────────────────────────────
  briefingRead: (params: {
    slug: string;
    title?: string;
    category?: string;
  }) => gtag("briefing_read", {
    event_category:  "content",
    slug:            params.slug,
    title:           params.title    || "",
    category:        params.category || "",
  }),

  // ── CTA clicks ──────────────────────────────────────────────────────────
  ctaClick: (params: {
    label: string;
    location: string;
  }) => gtag("cta_click", {
    event_category:  "engagement",
    cta_label:       params.label,
    page_location:   params.location,
  }),
};
