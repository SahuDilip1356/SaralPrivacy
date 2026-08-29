import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

// The service worker's navigation fallback (public/sw.js precaches this route).
// Styles are inline on purpose: when this page is served from the SW cache the
// global CSS chunk may not be cached yet, so it must be readable with no
// stylesheet at all.
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem",
        backgroundColor: "#0D1322",
        color: "#E8ECF2",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
        You&apos;re offline
      </h1>
      <p style={{ maxWidth: "26rem", lineHeight: 1.6, color: "#C5CDD9" }}>
        This page isn&apos;t available without a connection. Pages you&apos;ve
        already visited stay readable offline — everything else needs the
        network.
      </p>
      <a
        href="/"
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "#047857",
          color: "#FFFFFF",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Try the homepage
      </a>
    </div>
  );
}
