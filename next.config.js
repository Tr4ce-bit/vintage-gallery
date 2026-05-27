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
  // NOTE: never add server-only secrets here; NEXT_PUBLIC_ vars are baked into the JS bundle
  env: {
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          // preload makes the domain eligible for browser HSTS preload lists
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          // Prevent this page from being embedded by other origins (defense-in-depth over X-Frame-Options)
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' is required for Next.js __NEXT_DATA__ scripts and Tailwind.
              // 'unsafe-eval' has been removed — it is not needed in production builds
              // and opens eval()-based XSS vectors.
              "script-src 'self' 'unsafe-inline' https://js.paystack.co https://checkout.paystack.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.amazonaws.com https://res.cloudinary.com",
              "font-src 'self'",
              // fal.ai WebSocket endpoint for AI image generation
              "connect-src 'self' https://api.paystack.co https://cognito-idp.us-east-1.amazonaws.com https://*.auth.us-east-1.amazoncognito.com https://fal.run wss://fal.run",
              "frame-src https://checkout.paystack.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Webhook endpoint must never be cached — Paystack retries need fresh handling
      {
        source: "/api/paystack/webhook",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
    // NOTE: CORS for /api/admin/* is handled dynamically in middleware.ts,
    // NOT here. Static next.config.js headers cannot vary per-request origin.
  },
};

module.exports = nextConfig;
