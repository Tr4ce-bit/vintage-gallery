const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Without this, Next.js detects the monorepo root (vintage-gallery/) as the
  // workspace root and nests the standalone output under standalone/admin-app/
  // instead of standalone/ — causing Amplify's Lambda to not find server.js.
  outputFileTracingRoot: path.resolve(__dirname),
  // NOTE: Do NOT add a "turbopack" key here. In Next.js 16, having a `turbopack`
  // config object enables Turbopack for production builds. Turbopack SSR chunks
  // use an externalRequire() mechanism that fails on Amplify WEB_COMPUTE because
  // the Lambda splits node_modules from the app pages. Webpack (the default when
  // `turbopack` is absent) works correctly with Amplify WEB_COMPUTE.
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
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY"   },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
