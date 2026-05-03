import { z } from "zod";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

// Template IDs match the filenames in public/templates/ AND in Vercel Blob
export const templateOptions = [
  "privacy-notice",
  "consent-language-examples",
  "data-inventory-register",
  "dsr-grievance-sop",
  "vendor-data-sharing-register",
] as const;

export type TemplateOption = typeof templateOptions[number];

export const templateNames: Record<TemplateOption, string> = {
  "privacy-notice":                "Privacy Notice Template",
  "consent-language-examples":     "Consent Language Examples",
  "data-inventory-register":       "Data Inventory Register",
  "dsr-grievance-sop":             "DSR & Grievance SOP",
  "vendor-data-sharing-register":  "Vendor Data Sharing Register",
};

// File extensions for each template
export const templateExtensions: Record<TemplateOption, string> = {
  "privacy-notice":                ".docx",
  "consent-language-examples":     ".docx",
  "data-inventory-register":       ".xlsx",
  "dsr-grievance-sop":             ".docx",
  "vendor-data-sharing-register":  ".xlsx",
};

export const validateIndianPhoneNumber = (phone: string): boolean => {
  try {
    return isValidPhoneNumber(phone, "IN");
  } catch {
    return false;
  }
};

export const TemplateDownloadFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  contactPersonName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name too long"),
  templateSelected: z.enum(templateOptions, {
    errorMap: () => ({ message: "Please select a template" }),
  }),
  phoneNumber: z
    .string()
    .refine(validateIndianPhoneNumber, "Please enter a valid Indian phone number (+91 format)"),
  // DPDPA-compliant: consent must be freely given — not forced
  // Defaults are handled in useForm({ defaultValues }) to keep the Zod type strict
  consentContact: z.boolean(),
  consentBriefings: z.boolean(),
});

export type TemplateDownloadFormData = z.infer<typeof TemplateDownloadFormSchema>;

export const formatPhoneNumber = (phone: string): string => {
  try {
    const parsed = parsePhoneNumber(phone, "IN");
    return parsed?.format("E.164") || phone;
  } catch {
    return phone;
  }
};
