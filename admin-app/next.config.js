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
  // Proxy all /api/* requests to the main store's API so the browser never
  // makes a cross-origin request (avoids CORS entirely). The Authorization
  // header is forwarded automatically by Vercel's server-side rewrite.
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY"   },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
