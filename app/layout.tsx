import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://saralprivacy.com'),
  title: {
    default: 'SaralPrivacy — DPDPA Compliance Made Simple for Indian Businesses',
    template: '%s | SaralPrivacy',
  },
  description: "India's practical DPDPA compliance platform. Free readiness assessments, daily briefings, industry guides, and expert consultation for recruitment agencies, CA firms, training institutes, and D2C brands.",
  keywords: ['DPDPA', 'Digital Personal Data Protection Act', 'India data protection', 'data privacy India', 'DPDPA compliance', 'data protection India', 'Indian privacy law', 'DPDPA for businesses', 'DPDPA assessment', 'SaralPrivacy'],
  authors: [{ name: 'SaralPrivacy Editorial Team' }],
  alternates: { canonical: 'https://saralprivacy.com' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://saralprivacy.com',
    siteName: 'SaralPrivacy',
    title: 'SaralPrivacy — DPDPA Compliance Made Simple for Indian Businesses',
    description: 'Free DPDPA readiness assessments, daily briefings, and practical compliance guides for Indian businesses.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SaralPrivacy — DPDPA Compliance' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaralPrivacy — DPDPA Compliance Made Simple for Indian Businesses',
    description: 'Free DPDPA readiness assessments, daily briefings, and practical compliance guides for Indian businesses.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-[4rem]" style={{ paddingTop: "calc(4rem + 32px)" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
