import type { NextConfig } from "next";

// Shared security headers applied across the app
const securityHeaders = [
  // Opt out of DNS prefetching where possible
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // Enforce HTTPS (handled by Vercel in production, this is an extra hint)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Mitigate clickjacking
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Reduce referrer data leakage
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Lock down powerful browser features we don't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const SUBDOMAIN_HOST = 'lydei.crypticsolutionsltd.com';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Pass through Next.js static assets so they aren't caught by the subdomain rewrite.
        // No host condition: this is a harmless no-op for all domains but ensures _next paths
        // are matched before the catch-all rewrite on the subdomain.
        {
          source: '/_next/:path*',
          destination: '/_next/:path*',
        },
        // Rewrite all other paths on the subdomain to the kitchen-to-cash page
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: SUBDOMAIN_HOST,
            },
          ],
          destination: '/from-kitchen-to-cash/:path*',
        },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: '/from-kitchen-to-cash',
        destination: `https://${SUBDOMAIN_HOST}`,
        permanent: true,
      },
      {
        source: '/from-kitchen-to-cash/:path*',
        destination: `https://${SUBDOMAIN_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Global security headers for all routes (pages, assets, APIs)
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Prevent sensitive authenticated pages from being cached by browsers or intermediaries
      {
        source: "/(dashboard|progress|settings)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, must-revalidate",
          },
        ],
      },
      // API routes often return user-specific or sensitive data
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  // Prevent optional Node-only deps from breaking client builds
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // pdfjs-dist conditionally requires 'canvas' in Node; not needed in browser
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
