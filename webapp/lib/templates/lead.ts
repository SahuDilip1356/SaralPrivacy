// Payload builder for the template_downloads collection.
//
// Appwrite rejects documents carrying any attribute the collection does not
// define, and both download routes treat a failed save as non-fatal — so a
// field-name drift silently drops every lead while the user still gets their
// template. That exact bug shipped once (contact_email/contact_person/…
// instead of the real attribute names). This module pins the live schema so
// it can't recur unnoticed: lead.test.ts asserts every key the builder emits
// exists in TEMPLATE_DOWNLOAD_ATTRIBUTES.

// Attributes of the live template_downloads collection (verified against the
// Appwrite introspection report, 2026-09-02). If the collection changes,
// update this set in the same PR.
export const TEMPLATE_DOWNLOAD_ATTRIBUTES: ReadonlySet<string> = new Set([
  "business_name",
  "employees",
  "phone",
  "email",
  "template_name",
  "consent_contact",
  "report_token",
  "ip_address",
  "city",
  "country",
  "created_at",
  "contact_name",
  "source",
]);

// The source attribute is capped at 64 chars; a full referer URL overflows it
// and Appwrite rejects the whole document.
const SOURCE_MAX_LENGTH = 64;

export function buildTemplateLeadDocument(props: {
  email: string;
  contactName: string;
  businessName: string;
  templateName: string;
  phone: string;
  consentContact: boolean;
  referer: string | null;
  ip: string;
  city: string;
  country: string;
}): Record<string, string | boolean> {
  return {
    email:           props.email,
    contact_name:    props.contactName,
    business_name:   props.businessName,
    template_name:   props.templateName,
    phone:           props.phone,
    consent_contact: props.consentContact,
    source:          (props.referer || "direct").slice(0, SOURCE_MAX_LENGTH),
    ip_address:      props.ip,
    city:            props.city,
    country:         props.country,
    created_at:      new Date().toISOString(),
  };
}
