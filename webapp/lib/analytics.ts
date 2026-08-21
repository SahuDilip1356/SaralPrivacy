/**
 * analytics.ts — custom event helpers for SaralPrivacy.
 *
 * Usage (client components only):
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent.assessmentComplete({ score: 4, band: "Moderate Risk" });
 *
 * Backend: Vercel Web Analytics (cookieless, no cross-session identifier — the
 * July 2026 decision that replaced GA4). Every helper below used to route through
 * `window.gtag`, which no loader ever defined once GA4 was removed, so all 23
 * events were silent no-ops — including `discovery_handoff_click`, the metric
 * gating Discovery Phase B. It collected zero data for months.
 *
 * ⛔ Never add an event here without verifying on preview that it actually
 * reaches the dashboard (network tab: POST /_vercel/insights/event).
 * ⛔ No PII in payloads — sector / band / score / counts only.
 */
import { track as vercelTrack } from "@vercel/analytics";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/** Flatten to the primitives Vercel accepts; drop anything else rather than fail. */
type EventValue = string | number | boolean | null | undefined;

function gtag(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;

  const properties: Record<string, EventValue> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (
      value === null ||
      value === undefined ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      properties[key] = value;
    } else {
      properties[key] = String(value);
    }
  }

  try {
    vercelTrack(event, properties);
  } catch {
    // Analytics must never break a user flow.
  }

  // Still forward to gtag if a GA loader is ever reintroduced. No-op today.
  if (typeof window.gtag === "function") {
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

  // ── Header navigation ───────────────────────────────────────────────────
  // ⚠️ UNVERIFIED. The rule at the top of this file says never add an event
  // without confirming on preview that it reaches the dashboard, and that
  // confirmation cannot be done from the build container — saralprivacy.com
  // is blocked by its egress policy. Both events below are written to the
  // same `gtag` helper every working event uses, so there is no reason to
  // expect them to fail, but "no reason to expect" is exactly what left 23
  // events silently dead for months. Check the network tab for
  // POST /_vercel/insights/event on the first preview deploy, then delete
  // this notice.
  //
  // Why these two: the four-menu IA is a bet that the labels match how people
  // actually look for things. navMenuOpen says which of the four they reach
  // for; navItemClick says whether the panel then answered them or they left.
  // Without the pair, the restructure cannot be evaluated, only asserted.
  navMenuOpen: (params: { menu: string }) => gtag("nav_menu_open", {
    event_category: "navigation",
    menu:           params.menu,
  }),

  navItemClick: (params: { menu: string; item: string }) => gtag("nav_item_click", {
    event_category: "navigation",
    menu:           params.menu,
    item:           params.item,
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

  // ── Flow-map cross-links (the swap that feeds the flow maps) ─────────────
  // One event, three sources: homepage sector cards, the assessment report
  // screen, the Discovery results view. `sector` is a sectors.ts slug, or
  // "hub" when the link falls back to /data-mapping. No PII.
  flowCrosslinkClick: (params: {
    source: "home_cards" | "assessment" | "discovery";
    sector: string;
  }) => gtag("flow_crosslink_click", {
    event_category: "engagement",
    source:         params.source,
    sector:         params.sector,
  }),

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

  // ── Setu chatbot (spec §9.4) — no message text, no PII, ever ────────────
  chatOpened: (params: { page: string; proactive: boolean }) =>
    gtag("chat_opened", { event_category: "engagement", ...params }),

  chatMessageSent: (params: { journey?: string; industry?: string; turn: number }) =>
    gtag("chat_message_sent", { event_category: "engagement", ...params }),

  chatLinkClicked: (params: { url: string; kind: "citation" | "action" }) =>
    gtag("chat_link_clicked", { event_category: "engagement", ...params }),

  // Deliberate referral seam into the starved tools funnel (decision D4).
  chatToolCta: (params: { url: string; journey?: string }) =>
    gtag("chat_tool_cta", { event_category: "lead", ...params }),

  chatFeedback: (params: { helpful: boolean }) =>
    gtag("chat_feedback", { event_category: "engagement", ...params }),

  chatEscalation: (params: { reason: string }) =>
    gtag("chat_escalation", { event_category: "lead", ...params }),

  chatProactiveShown: (params: { page: string }) =>
    gtag("chat_proactive_shown", { event_category: "engagement", ...params }),

  chatProactiveDismissed: (params: { page: string; muted: boolean }) =>
    gtag("chat_proactive_dismissed", { event_category: "engagement", ...params }),
};
