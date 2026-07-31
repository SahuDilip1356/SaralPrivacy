import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Industry, RiskLevel, BriefingCategory, ResourceType } from "./types";
import { STAGE_SLUGS, stageLabel } from "./data/briefing-taxonomy";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getIndustryLabel(industry: Industry): string {
  const labels: Record<Industry, string> = {
    "recruitment": "Recruitment & Staffing",
    "ca-firms": "CA Firms",
    "training-institutes": "Training Institutes",
    "d2c-brands": "D2C Brands",
    "general": "General Business",
    "healthcare": "Healthcare",
    "fintech": "Fintech",
    "edtech": "EdTech",
    "manufacturing": "Manufacturing",
    "retail": "Retail",
  };
  return labels[industry] || industry;
}

export function getRiskLevelLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    green: "Low Complexity",
    amber: "Moderate Exposure",
    red: "High-Priority Action Needed",
  };
  return labels[level];
}

export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    green: "text-green-700 bg-green-50 border-green-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    red: "text-red-700 bg-red-50 border-red-200",
  };
  return colors[level];
}

/**
 * Human label for a briefing's `category`, which holds one of two vocabularies:
 * a legacy topic category, or a journey-stage slug (the Stage facet rides on this
 * attribute — see `lib/data/briefing-taxonomy.ts`).
 *
 * Stage labels are NOT duplicated here — they delegate to `stageLabel`, the single
 * source of truth. Duplicating them is what caused raw slugs to render as badges on
 * the homepage and briefing pages: this map simply had no entry for "assess", and the
 * `|| category` fallback printed the slug.
 */
export function getCategoryLabel(category: BriefingCategory | string): string {
  const labels: Record<string, string> = {
    "regulatory-update": "Regulatory Update",
    "consent-management": "Consent Management",
    "data-rights": "Data Rights",
    "enforcement": "Enforcement",
    "compliance-guidance": "Compliance Guidance",
    "sector-specific": "Sector Specific",
    "technology": "Technology",
    "international": "International",
  };
  if (labels[category]) return labels[category];
  if (STAGE_SLUGS.has(category)) return stageLabel(category);
  return category;
}

export function getResourceTypeLabel(type: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    "white-paper": "White Paper",
    "checklist": "Checklist",
    "explainer": "Explainer",
    "template": "Template",
    "faq": "FAQ",
    "webinar": "Webinar",
    "guide": "Guide",
    "case-study": "Case Study",
  };
  return labels[type] || type;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export const PRIVACY_NOTICE_VERSION = "1.0.0";
export const PRIVACY_NOTICE_DATE = "2025-01-01";
