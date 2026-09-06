import { insertDocument, findOneByEmail } from "@/lib/db";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";

export async function upsertSubscriber({
  email,
  name = "",
  industry = "",
  source,
  ip = "",
  userAgent = "",
  city = "",
  country = "",
  region = "",
}: {
  email: string;
  name?: string;
  industry?: string;
  source: string;
  ip?: string;
  userAgent?: string;
  city?: string;
  country?: string;
  region?: string;
}) {
  const normalised = email.trim().toLowerCase();

  const existing = await findOneByEmail("subscribers", normalised);
  if (existing) return;

  const now = new Date().toISOString();

  await insertDocument("subscribers", {
    name,
    email:           normalised,
    industry,
    frequency:       "daily",
    status:          "active",
    consent_version: PRIVACY_NOTICE_VERSION,
    created_at:      now,
    ip_address:      ip,
    city,
    country,
    region,
    user_agent:      userAgent,
  });

  insertDocument("consent_log", {
    email:           normalised,
    name,
    source,
    consent_type:    "email_marketing",
    consent_value:   true,
    privacy_version: PRIVACY_NOTICE_VERSION,
    ip_address:      ip,
    user_agent:      userAgent,
    city,
    country,
    region,
    timestamp:       now,
  }).catch((err) => console.error("[upsertSubscriber] consent_log:", err));
}
