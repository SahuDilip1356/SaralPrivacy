import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
// Vercel Web Analytics — cookieless, no cross-session identifier, so it needs no
// consent gate. Replaced GA4 (2026-07-17): GA set a cookie-based client id and
// tracked across sessions with no consent banner, which we cannot square with
// selling DPDPA readiness. See PRIVACY_RIGHTS_PAGES_SPEC.md §2.
import { Analytics } from "@vercel/analytics/next";
import SetuChat from "@/components/chat/SetuChat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Hindi and Marathi guide/briefing content falls to a mismatched system face
// without this — Inter carries no Devanagari glyphs.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://saralprivacy.com'),
  title: {
    default: 'SaralPrivacy — DPDPA Compliance for Indian Businesses',
    template: '%s | SaralPrivacy',
  },
  description: "India's practical DPDPA compliance platform. Free readiness assessments, daily briefings, industry guides, and expert consultation for recruitment agencies, CA firms, training institutes, and D2C brands.",
  keywords: ['DPDPA', 'Digital Personal Data Protection Act', 'India data protection', 'data privacy India', 'DPDPA compliance', 'data protection India', 'Indian privacy law', 'DPDPA for businesses', 'DPDPA assessment', 'SaralPrivacy'],
  authors: [{ name: 'SaralPrivacy Editorial Team' }],
  // No site-wide canonical/og:url — a hardcoded homepage URL here is inherited
  // by every page that doesn't override it, telling crawlers those pages are
  // duplicates of the homepage. Each indexable page sets its own canonical.
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SaralPrivacy',
    title: 'SaralPrivacy — DPDPA Compliance for Indian Businesses',
    description: 'Free DPDPA readiness assessments, daily briefings, and practical compliance guides for Indian businesses.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SaralPrivacy — DPDPA Compliance' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaralPrivacy — DPDPA Compliance for Indian Businesses',
    description: 'Free DPDPA readiness assessments, daily briefings, and practical compliance guides for Indian businesses.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: {
    google: 'bb55c3c7def99de4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${notoDevanagari.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* LLM-friendly site summary — emerging convention, probed by some AI crawlers */}
        <link rel="alternate" type="text/markdown" title="LLM-friendly site summary" href="/llms.txt" />
        <link rel="alternate" type="text/markdown" title="LLM extended reference" href="/llms-full.txt" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-[4rem]" style={{ paddingTop: "calc(4rem + 32px)" }}>
          {children}
        </main>
        <Footer />
        <SetuChat />
        <Analytics />
      </body>
    </html>
  );
}
