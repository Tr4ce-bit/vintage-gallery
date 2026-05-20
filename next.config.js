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

  // Custom headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Block clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Reduce referrer leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 1 year (enable once fully on HTTPS)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Disable browser features we don't use
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Content Security Policy — restricts where scripts/styles/media can load from
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + inline (Next.js needs this) + Paystack
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com",
              // Styles: self + inline (Tailwind inlines styles)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + S3 + Cloudinary + data URIs (canvas toDataURL)
              "img-src 'self' data: blob: https://*.amazonaws.com https://res.cloudinary.com",
              // Fonts: self
              "font-src 'self'",
              // Connect (fetch/XHR): self + Paystack + Cognito + our API
              "connect-src 'self' https://api.paystack.co https://cognito-idp.us-east-1.amazonaws.com https://*.auth.us-east-1.amazoncognito.com",
              // Frames: Paystack checkout uses an iframe
              "frame-src https://checkout.paystack.com",
              // Block object/embed
              "object-src 'none'",
              // Upgrade insecure requests in production
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // API routes: allow cross-origin from admin app only
      {
        source: "/api/:path*",
        headers: [
          {
            key:   "Access-Control-Allow-Origin",
            value: process.env.ADMIN_APP_URL ?? "https://admin.vintagegallery.com",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Authorization,Content-Type" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
