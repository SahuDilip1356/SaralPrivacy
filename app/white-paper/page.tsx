import type { Metadata } from "next";
import WhitePaperContent from "./WhitePaperContent";

export const metadata: Metadata = {
  title: "Free DPDPA White Paper Download",
  description:
    "Download our free 45-page DPDPA white paper — a practical visual guide for Indian businesses covering applicability, consent, rights, breach notification, and sector-specific guidance.",
  alternates: { canonical: 'https://saralprivacy.com/white-paper' },
};

export default function WhitePaperPage() {
  return <WhitePaperContent />;
}
