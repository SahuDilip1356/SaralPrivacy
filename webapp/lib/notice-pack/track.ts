// Notice Pack — client event tracking. Fires to GA (gtag) and the owned
// /api/notice/events sink. No PII in payloads — sector/score/counts only.
import { trackEvent } from "@/lib/analytics";

export type NoticeEvent =
  | "notice_builder_started"
  | "business_type_selected"
  | "data_categories_confirmed"
  | "purpose_matrix_completed"
  | "collection_contexts_selected"
  | "notice_preview_generated"
  | "notice_score_calculated"
  | "notice_lead_captured"
  | "notice_pdf_downloaded"
  | "notice_html_copied"
  | "mini_notice_copied"
  | "consent_block_copied"
  | "dsar_cta_clicked"
  | "notice_evidence_record_created";

let sessionId = "";
function getSession(): string {
  if (sessionId) return sessionId;
  if (typeof window === "undefined") return "";
  try {
    sessionId = sessionStorage.getItem("np_sid") || crypto.randomUUID();
    sessionStorage.setItem("np_sid", sessionId);
  } catch {
    sessionId = Math.random().toString(36).slice(2);
  }
  return sessionId;
}

export function track(name: NoticeEvent, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  trackEvent.notice(name, params);
  // Owned funnel sink — fire-and-forget; never block UX.
  try {
    fetch("/api/notice/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, session_id: getSession(), ...params }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* no-op */
  }
}
