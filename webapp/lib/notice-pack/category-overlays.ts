// Notice Pack — category overlays (the thin, notice-specific layer on top of the
// discovery taxonomy). Discovery provides data items + purposes + risk tags + obligations
// per niche; these overlays add what discovery doesn't carry: collection points, vendor
// categories, and retention guidance — keyed by discovery Category.id (≈23), not per niche.
// Launch = 6 categories; others fall back to GENERIC. Collection-point keys and vendor
// labels reference the shared pools in ./data.ts (CONTEXTS, VENDORS).

export interface CategoryOverlay {
  collectionPoints: string[]; // CONTEXTS keys
  vendorCategories: string[]; // VENDORS labels
  retentionGuidance: string;
}

export const GENERIC_OVERLAY: CategoryOverlay = {
  collectionPoints: ["contact", "whatsapp", "onboarding"],
  vendorCategories: ["Payment gateway", "Cloud storage", "WhatsApp / SMS / email provider"],
  retentionGuidance: "for as long as needed for the stated purposes and any legal requirement",
};

// Keyed by discovery Category.id.
export const CATEGORY_OVERLAYS: Record<string, CategoryOverlay> = {
  healthcare: {
    collectionPoints: ["appointment", "whatsapp", "contact", "offline"],
    vendorCategories: ["Diagnostic lab partner", "Insurance partner", "Cloud storage", "WhatsApp / SMS / email provider"],
    retentionGuidance: "for the period required for clinical records and applicable medical record-keeping law",
  },
  professional: {
    collectionPoints: ["contact", "onboarding", "whatsapp", "job"],
    vendorCategories: ["Accounting / tax consultant", "Recruitment / BGV vendor", "Cloud storage", "WhatsApp / SMS / email provider"],
    retentionGuidance: "for the engagement plus the statutory record-keeping period",
  },
  education: {
    collectionPoints: ["admission", "whatsapp", "app", "cctv"],
    vendorCategories: ["LMS / EdTech platform", "WhatsApp / SMS / email provider", "CCTV / security vendor", "Cloud storage"],
    retentionGuidance: "for the duration of enrolment plus the statutory period",
  },
  retail: {
    collectionPoints: ["checkout", "whatsapp", "support", "newsletter"],
    vendorCategories: ["Payment gateway", "Logistics / courier", "WhatsApp / SMS / email provider", "Analytics / advertising", "CRM"],
    retentionGuidance: "until the order and return window closes, plus tax record-keeping",
  },
  finance: {
    collectionPoints: ["onboarding", "contact", "app"],
    vendorCategories: ["Payment gateway", "CRM", "Cloud storage", "Analytics / advertising"],
    retentionGuidance: "as required by KYC, RBI and tax law",
  },
  realestate: {
    collectionPoints: ["contact", "whatsapp", "onboarding"],
    vendorCategories: ["CRM", "WhatsApp / SMS / email provider", "Cloud storage"],
    retentionGuidance: "for the transaction plus the statutory record-keeping period",
  },
};

export function overlayFor(categoryId: string): CategoryOverlay {
  return CATEGORY_OVERLAYS[categoryId] ?? GENERIC_OVERLAY;
}
