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

  // ── Personal Data Discovery (/discovery) ────────────────────────────────
  // Fires when the snapshot renders — captures on-screen completions, not just
  // the subset who download the CSV (lead capture).
  discoveryComplete: (params: {
    niche: string;
    band: string;
    score: number;
    items: number;
  }) => gtag("discovery_complete", {
    event_category:  "engagement",
    niche:           params.niche,
    risk_band:       params.band,
    score:           params.score,
    items_confirmed: params.items,
  }),

  // Fires when the user downloads the data-inventory CSV (lead).
  discoveryInventoryDownload: (params: { niche: string }) =>
    gtag("discovery_inventory_download", {
      event_category: "lead",
      niche:          params.niche,
    }),

  // ── Discovery → Data Mapping handoff seam ───────────────────────────────
  // THE metric that unlocks Phases B–E: does a Discovery completer choose to
  // continue into Data Mapping? Fires on the "Build My Data Flow Map" click.
  discoveryHandoffClick: (params: {
    niche: string;
    highRisk: number;
    recipients: number;
  }) => gtag("discovery_handoff_click", {
    event_category: "engagement",
    niche:          params.niche,
    high_risk:      params.highRisk,
    recipients:     params.recipients,
  }),

  // ── Landing hero (Beat 1 — is-this-me) ──────────────────────────────────
  // Fires when a visitor picks their business type in the hero (top-of-funnel
  // engagement signal + lead segmentation by sector).
  heroSectorSelect: (params: { sector: string }) =>
    gtag("hero_sector_select", {
      event_category: "engagement",
      sector:         params.sector,
    }),

  // Landing primary-CTA clicks (Discover / Assess), with the picked sector.
  landingCtaClick: (params: { cta: string; sector?: string }) =>
    gtag("landing_cta_click", {
      event_category: "engagement",
      cta:            params.cta,
      sector:         params.sector || "",
    }),

  // ── How it works spine (Beat 4) ─────────────────────────────────────────
  // Fires when a visitor clicks a step card (Discover / Assess / Fix) — measures
  // whether the step artifacts (Phase 2) drive clicks into the tools.
  hiwStepClick: (params: { step: string }) =>
    gtag("hiw_step_click", {
      event_category: "engagement",
      step:           params.step,
    }),

  // ── Verdict preview (Beat 5 — "See a real verdict") ─────────────────────
  // Tab switches + CTA clicks feed the pre-committed 7-day keep/kill gate.
  beat5TabSelect: (params: { sector: string }) =>
    gtag("beat5_tab_select", {
      event_category: "engagement",
      sector:         params.sector,
    }),

  beat5CtaClick: (params: { sector: string }) =>
    gtag("beat5_cta_click", {
      event_category: "engagement",
      sector:         params.sector,
    }),

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
    language?: string;
  }) => gtag("file_download", {
    event_category:  "lead",
    file_name:       "DPDPA_Visual_Guide",
    industry:        params.industry     || "",
    company_size:    params.company_size || "",
    language:        params.language     || "en",
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

  // ── Assessment funnel (PR-traffic measurement) ──────────────────────────
  assessmentStart: () => gtag("assessment_start", {
    event_category: "engagement",
  }),

  // Fires assessment_step_3 / assessment_step_6 so GA4 shows where people drop off
  assessmentStep: (step: number) => gtag(`assessment_step_${step}`, {
    event_category: "engagement",
    step,
  }),

  reportRequested: (params: { band?: string; sector?: string }) => gtag("report_requested", {
    event_category: "lead",
    risk_band:      params.band   || "",
    sector:         params.sector || "",
  }),

  callBookingClicked: (params: { band?: string; location?: string }) => gtag("call_booking_clicked", {
    event_category: "lead",
    risk_band:      params.band     || "",
    page_location:  params.location || "assessment_result",
  }),

  // ── Notice Pack Builder (/tools/dpdpa-privacy-notice-generator) ──────────
  notice: (name: string, params: Record<string, any> = {}) =>
    gtag(name, { event_category: name === "notice_lead_captured" ? "lead" : "engagement", ...params }),

  // ── Personal Data Flow Map (/industries/{industry}/data-flow) ────────────
  // CTA clicks are funnel events ("lead" category); everything else engagement.
  dataFlow: (name: string, params: Record<string, any> = {}) =>
    gtag(name, {
      event_category:
        name === "assessment_cta_clicked" || name === "discovery_cta_clicked"
          ? "lead"
          : "engagement",
      ...params,
    }),
};
