/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for AWS Amplify / Lambda deployment
  output: "standalone",

  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    unoptimized: false,
  },

  // Reduce Lambda cold-start by tree-shaking unused locales
  i18n: undefined,

  // Disable x-powered-by header (security best practice)
  poweredByHeader: false,

  // Enable compression (Amplify ALB handles gzip, but keep for local)
  compress: true,

  // Keep bundle size lean for Free Tier Lambda (250 MB limit)
  experimental: {
    // Reduce serverless function bundle sizes
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Required env variables exposed to client bundle
  env: {
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },

  // Custom headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
