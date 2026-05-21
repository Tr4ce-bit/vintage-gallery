/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output packages everything Lambda needs into .next/standalone/.
  // Without this, node_modules/ is not included in the artifact and Lambda fails
  // at runtime with "failed to create symbolic link ... Read-only file system".
  output: "standalone",
  // NOTE: Do NOT set outputFileTracingRoot here. When set to __dirname (admin-app/),
  // relativeAppDir becomes "" in required-server-files.json. Amplify's "Next.js - SSR"
  // Lambda bootstrap uses relativeAppDir="" to locate server.js at the standalone root,
  // then tries to create X/X symlinks (node_modules/node_modules, public/public, etc.)
  // inside read-only Lambda directories — causing runtime 500 errors on every request.
  // Without outputFileTracingRoot, Next.js walks up to vintage-gallery/ as workspace
  // root, setting relativeAppDir="admin-app". The amplify.yml flat-assembly script
  // reads this value and copies standalone/admin-app/ to the artifact root, so the
  // generic WEB_COMPUTE bootstrap finds server.js at the artifact root and starts
  // the app correctly — no symlinks needed.
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
