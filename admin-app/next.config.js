const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output packages everything Lambda needs into .next/standalone/.
  output: "standalone",

  // CRITICAL for Amplify WEB_COMPUTE (framework: null / generic bootstrap):
  // Setting outputFileTracingRoot to this directory (__dirname = admin-app/) forces
  // Next.js to treat admin-app/ as the workspace root, which sets relativeAppDir=""
  // in required-server-files.json. The generic WEB_COMPUTE bootstrap hardcodes
  // `node standalone/server.js` — so server.js MUST be at standalone/server.js
  // (not standalone/admin-app/server.js which results from relativeAppDir="admin-app").
  //
  // Without this setting, Next.js on Linux walks up to vintage-gallery/ as workspace
  // root, producing relativeAppDir="admin-app" and placing server.js at
  // standalone/admin-app/server.js — the bootstrap then can't find it → HTTP 500.
  //
  // NOTE: This only causes the X/X symlink crash when framework is "Next.js - SSR"
  // (the dedicated SSR bootstrap creates node_modules/node_modules symlinks when
  // relativeAppDir=""). With framework: null (generic bootstrap) no symlinks are
  // created, so this setting is safe.
  //
  // NOTE: Do NOT add a "turbopack" key here. In Next.js 16, having a `turbopack`
  // config object enables Turbopack for production builds. Turbopack SSR chunks
  // use an externalRequire() mechanism that fails on Amplify WEB_COMPUTE because
  // the Lambda splits node_modules from the app pages. Webpack (the default when
  // `turbopack` is absent) works correctly with Amplify WEB_COMPUTE.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Admin app: no Paystack scripts — no payment processing here
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.amazonaws.com https://res.cloudinary.com",
              "font-src 'self'",
              // connect-src must include the main store API origin for admin API calls,
              // and Cognito for auth. NEXT_PUBLIC_API_URL is the main store's domain.
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ""} https://cognito-idp.us-east-1.amazonaws.com https://*.auth.us-east-1.amazoncognito.com`,
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
