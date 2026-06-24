import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @resvg/resvg-js loads platform-specific native binaries
  // (@resvg/resvg-js-darwin-arm64 locally, @resvg/resvg-js-linux-x64-gnu on
  // Vercel, etc.) via a conditional require pattern that Turbopack's static
  // resolver can't follow. Marking it external means Next.js falls back to
  // Node's native require, which handles the platform branch correctly.
  // @sparticuz/chromium + puppeteer-core ship a platform-specific chromium
  // binary and use dynamic requires the bundler can't trace — keep them external
  // so the serverless function loads them via Node's native require.
  serverExternalPackages: ["@resvg/resvg-js", "puppeteer-core", "@sparticuz/chromium"],
  // The infographic route reads Inter font files from lib/fonts/ via
  // fs.readFileSync(join(process.cwd(), "lib/fonts", ...)). Next.js's File
  // Trace builder can't always follow that path expression, so include the
  // fonts explicitly to guarantee Vercel bundles them with the serverless
  // function. Without this, the route 500s on Vercel with ENOENT.
  outputFileTracingIncludes: {
    "/api/blog/infographic": ["./lib/fonts/**/*"],
  },
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
