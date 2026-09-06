// Shared, device-local memory for the two template-download surfaces —
// the header modal (TemplateDownloadForm) and the /resources gate
// (ResourceTemplateGate). Completing either one saves the contact and
// unlocks the gate's instant downloads, so a visitor is asked for their
// details once, not once per surface.
//
// Consent is NEVER stored or restored — every submission re-asks with
// unchecked boxes.
//
// localStorage keys:
//   saral_template_contact — the saved contact (JSON)
//   sp_rg_v1               — the /resources instant-download unlock flag
//                            (pre-existing key, kept for back-compat with
//                            visitors who already unlocked via the gate)

export interface SavedContact {
  email?: string;
  contactPersonName?: string;
  businessName?: string;
  phoneNumber?: string;
  employees?: string;
}

const CONTACT_KEY = "saral_template_contact";
const UNLOCK_KEY = "sp_rg_v1";

export function loadSavedContact(): SavedContact | null {
  if (typeof window === "undefined") return null;
  try {
    // Also read the older sessionStorage-only location the modal used to
    // write, so a contact saved just before this shipped still restores.
    const raw =
      localStorage.getItem(CONTACT_KEY) ?? sessionStorage.getItem(CONTACT_KEY);
    if (!raw) return null;
    const contact = JSON.parse(raw) as SavedContact;
    return contact?.email ? contact : null;
  } catch {
    return null;
  }
}

/** Merge-save: fields absent from `contact` keep their stored value, so the
 *  modal (no employees field) never wipes what the gate captured. */
export function saveContact(contact: SavedContact): void {
  if (typeof window === "undefined") return;
  try {
    const merged = { ...(loadSavedContact() ?? {}), ...contact };
    localStorage.setItem(CONTACT_KEY, JSON.stringify(merged));
  } catch {
    // Storage unavailable (private mode) — remembering is best-effort.
  }
}

export function areTemplatesUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(UNLOCK_KEY);
  } catch {
    return false;
  }
}

export function markTemplatesUnlocked(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    // Best-effort, same as saveContact.
  }
}
