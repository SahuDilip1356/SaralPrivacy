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
  title: {
    default: "DPDPAIndia — DPDPA Compliance for Indian Businesses",
    template: "%s | DPDPAIndia",
  },
  description:
    "India's leading DPDPA compliance intelligence platform. Daily briefings, industry assessments, practical resources, and expert consultation for Indian businesses navigating the Digital Personal Data Protection Act.",
  keywords: [
    "DPDPA",
    "Digital Personal Data Protection Act",
    "India data protection",
    "data privacy India",
    "DPDPA compliance",
    "data protection India",
    "Indian privacy law",
    "DPDPA for businesses",
  ],
  authors: [{ name: "DPDPAIndia Editorial Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dpdpaindia.in",
    siteName: "DPDPAIndia",
    title: "DPDPAIndia — DPDPA Compliance for Indian Businesses",
    description:
      "Daily briefings, industry assessments, and practical resources for DPDPA compliance in India.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DPDPAIndia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DPDPAIndia — DPDPA Compliance for Indian Businesses",
    description:
      "Daily briefings, industry assessments, and practical resources for DPDPA compliance in India.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://dpdpaindia.in"),
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
