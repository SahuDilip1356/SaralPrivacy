import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgp.cloud.appwrite.io",
        pathname: "/v1/storage/**",
      },
      {
        protocol: "https",
        hostname: "*.appwrite.io",
        pathname: "/v1/storage/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: '/subscribe', destination: '/#newsletter', permanent: false },
      { source: '/unsubscribe', destination: '/consent-preferences', permanent: true },
      { source: '/rights/access', destination: '/privacy#data-rights', permanent: true },
      { source: '/rights/erasure', destination: '/privacy#data-rights', permanent: true },
      { source: '/webinars', destination: '/resources', permanent: false },
      { source: '/resources/dpdpa-explainer-for-founders', destination: '/learn/what-is-dpdpa', permanent: true },
      { source: '/resources/consent-notice-template-forms', destination: '/resources', permanent: true },
      { source: '/resources/dpdpa-compliance-checklist-2025', destination: '/resources', permanent: true },
      { source: '/resources/privacy-notice-template-b2c', destination: '/resources', permanent: true },
      { source: '/resources/data-rights-request-form-template', destination: '/resources', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://sgp.cloud.appwrite.io https://api.resend.com;" },
        ],
      },
    ]
  },
};

export default nextConfig;
