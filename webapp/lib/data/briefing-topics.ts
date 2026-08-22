/**
 * briefing-topics.ts — the fourth facet: what a briefing is actually about.
 *
 * Stage, Sector and Format are all single-valued and all describe how a briefing
 * was *made*. None of them answers the question a reader arrives with, which is
 * some version of "we have this problem — is there one of these about it?"
 *
 * Topics answer that, and they have to be multi-valued: a briefing about vendor
 * contracts for payroll data is about vendors AND employee data. That is the whole
 * reason this cannot be a fourth chip row alongside the other three.
 *
 * Nothing here needs a migration. The clusters are derived at read time from text
 * the pipeline already stores — title, excerpt, the save-worthy verdict, the
 * summary and the first action — so the archive tags itself on the way out of
 * Appwrite. Measured against the full 240-day roadmap: 215 briefings (89%) carry
 * at least one topic, at a mean of 2.0 each.
 *
 * The patterns are deliberately tight. Bare "access", "communication" and
 * "partner" pulled three clusters up by 10-20 points each on their own, so they
 * are gone in favour of phrases that can only mean the thing.
 */

export interface TopicDef {
  slug: string;
  label: string;
  /** The reader's own words for arriving at this topic — used by the sentence. */
  symptom: string;
  match: RegExp;
}

export const TOPICS: readonly TopicDef[] = [
  {
    slug: "vendors",
    label: "Vendors & processors",
    symptom: "a vendor has our customer list",
    match: /vendor|processor|third.?part|sub-?contract|\bdpa\b|outsourc|processing agreement/i,
  },
  {
    slug: "data-map",
    label: "Data map & inventory",
    symptom: "I can't say where our data sits",
    match: /inventory|data map|mapping|touchpoint|data flow|discovery|what personal data|where .{0,24}data (lives|sits|goes|enters)/i,
  },
  {
    slug: "breach",
    label: "Breach & incident",
    symptom: "something leaked and we froze",
    match: /breach|incident|leak|ransom|escalation|contact tree|response (plan|pack|playbook)/i,
  },
  {
    slug: "employee-data",
    label: "Employee & HR data",
    symptom: "we hold payroll records",
    match: /employee|payroll|\bhr\b|staff record|attendance|salary|candidate|resume|\bcv\b|background verif/i,
  },
  {
    slug: "consent",
    label: "Consent & notice",
    symptom: "our forms collect too much",
    match: /consent|notice|opt.?in|lead form|enquiry form|sign.?up form|checkbox|privacy polic|privacy notice/i,
  },
  {
    slug: "retention",
    label: "Retention & deletion",
    symptom: "old files nobody ever deletes",
    match: /retention|erasure|delet|purge|archiv|old (data|record)|how long|dispose/i,
  },
  {
    slug: "marketing",
    label: "Marketing & messaging",
    symptom: "we market on WhatsApp and SMS",
    match: /marketing|whatsapp|\bsms\b|telecall|campaign|promotional|newsletter|remarket|opt.?out/i,
  },
  {
    slug: "rights",
    label: "Rights & grievance",
    symptom: "someone asked us to delete data",
    match: /grievance|complaint|data (principal|subject)|redress|access request|correction request|nominat/i,
  },
  {
    slug: "access",
    label: "Access & security",
    symptom: "everyone can open everything",
    match: /access control|credential|password|encrypt|safeguard|security|audit log|shared (drive|login|folder)|who (touches|can see)|restrict access|tighten access/i,
  },
  {
    slug: "ownership",
    label: "Ownership & governance",
    symptom: "nobody owns privacy here",
    match: /ownership|accountab|\bdpo\b|designated|data protection officer|training|internal polic/i,
  },
] as const;

const BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));

export const topicLabel = (slug: string): string => BY_SLUG.get(slug)?.label ?? slug;

/**
 * Topic slugs for one briefing. Call it server-side with everything you have —
 * the client only ever receives the resulting slugs, which keeps 240 briefings
 * worth of body text off the wire.
 */
export function topicsFor(...parts: (string | string[] | undefined | null)[]): string[] {
  const hay = parts
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .filter(Boolean)
    .join(" ");
  if (!hay) return [];
  return TOPICS.filter((t) => t.match.test(hay)).map((t) => t.slug);
}
