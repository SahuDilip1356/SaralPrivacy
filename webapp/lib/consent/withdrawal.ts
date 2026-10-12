// withdrawal.ts — the consent_log record written when a subscriber withdraws
// email-marketing consent (DPDPA s.6(4)). Pure and import-free so node:test can
// run it without Next or a DB; the caller passes in the privacy version.
// Run tests: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/withdrawal.test.ts

export interface WithdrawalInput {
  email: string;
  name?: string | null;
  at: string;
  privacyVersion: string;
  ip?: string | null;
  userAgent?: string | null;
  city?: string | null;
  country?: string | null;
  region?: string | null;
}

export type WithdrawalRecord = {
  email: string;
  name: string;
  source: "unsubscribe";
  consent_type: "email_marketing";
  consent_value: false;
  privacy_version: string;
  timestamp: string;
  withdrawn_at: string;
  ip_address: string;
  user_agent: string;
  city: string;
  country: string;
  region: string;
};

// Only a real transition is recorded: a repeat unsubscribe writes nothing and
// keeps the original withdrawal time. Bounced/complained/unknown still count.
export function shouldRecordWithdrawal(prevStatus: unknown): boolean {
  return prevStatus !== "unsubscribed";
}

// Spec field limits: truncate, never reject.
function clip(value: string | null | undefined, max: number): string {
  return (value ?? "").slice(0, max);
}

export function buildWithdrawalRecord(input: WithdrawalInput): WithdrawalRecord {
  const at = clip(input.at, 50);
  return {
    email: input.email.trim().toLowerCase(),
    name: input.name ?? "",
    source: "unsubscribe",
    consent_type: "email_marketing",
    consent_value: false,
    privacy_version: input.privacyVersion,
    timestamp: at,
    withdrawn_at: at,
    ip_address: clip(input.ip, 100),
    user_agent: clip(input.userAgent, 500),
    city: clip(input.city, 100),
    country: clip(input.country, 100),
    region: clip(input.region, 100),
  };
}
