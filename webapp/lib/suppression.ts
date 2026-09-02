import { findOneByEmail } from "./db";

const BLOCKED_STATUSES = ["unsubscribed", "bounced", "complained"];

export async function isSuppressed(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  const sub = await findOneByEmail("subscribers", normalized);
  if (sub && BLOCKED_STATUSES.includes(sub.status as string)) {
    return true;
  }

  const out = await findOneByEmail("outreach_contacts", normalized);
  if (out && BLOCKED_STATUSES.includes(out.status as string)) {
    return true;
  }

  return false;
}
