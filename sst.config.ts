/// <reference path="./.sst/platform/config.d.ts" />

// ─── Vintage Gallery — SST Ion (v3) deployment ───────────────────────────────
//
// First-time setup (run once, then commit the generated .sst/ scaffolding):
//   npm install
//   npx sst init          ← creates .sst/platform/  (needed for the types above)
//
// Local dev against real AWS (live Lambda tunnel):
//   cp .env.example .env.local   ← fill in your values
//   npm run sst:dev
//
// Deploy staging:
//   npm run sst:deploy            ← deploys to "staging" stage
//
// Deploy production:
//   npm run sst:deploy:prod       ← deploys to "production" stage
//
// Required env vars at deploy time — set in CI (GitHub Actions) or shell:
//   STORE_DOMAIN         e.g. vintagegallery.store
//   ADMIN_DOMAIN         e.g. admin.vintagegallery.store
//   DATABASE_URL         postgres://… (RDS endpoint)
//   PAYSTACK_SECRET_KEY
//   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
//   NEXT_PUBLIC_COGNITO_USER_POOL_ID
//   NEXT_PUBLIC_COGNITO_CLIENT_ID
//   GMAIL_USER / GMAIL_APP_PASSWORD
//   ADMIN_EMAILS / ADMIN_PHONE
//   S3_BUCKET / S3_REGION
//   OPENWEATHER_API_KEY
//   FAL_KEY

export default $config({
  app(input) {
    return {
      name:    "vintage-gallery",
      home:    "aws",
      // "retain" keeps RDS data if `sst remove` is accidentally run in production
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      providers: {
        aws: { region: "us-east-1" },
      },
    };
  },

  async run() {
    const isProd   = $app.stage === "production";
    const isStaging = $app.stage === "staging";

    // ── Domain config ─────────────────────────────────────────────────────────
    // In staging, append "-staging" to avoid clashing with production records.
    // e.g. staging store → staging.vintagegallery.store (or no domain at all —
    // SST will print a CloudFront URL you can use for smoke-testing).
    const storeDomain = process.env.STORE_DOMAIN;   // e.g. vintagegallery.store
    const adminDomain = process.env.ADMIN_DOMAIN;   // e.g. admin.vintagegallery.store

    // Domains only in production. Staging uses the auto-generated CloudFront URL.
    // Route 53 hosted zone must exist before this runs — register the domain first.
    const storeDomainConfig = storeDomain && isProd ? {
      domain: {
        name: storeDomain,
        dns:  sst.aws.dns(),
      },
    } : {};

    const adminDomainConfig = adminDomain && isProd ? {
      domain: {
        name: adminDomain,
        dns:  sst.aws.dns(),
      },
    } : {};

    // ── Shared env vars ───────────────────────────────────────────────────────
    const storeUrl = storeDomain && isProd
      ? `https://${storeDomain}`
      : (process.env.NEXT_PUBLIC_APP_URL ?? "");

    const adminUrl = adminDomain && isProd
      ? `https://${adminDomain}`
      : (process.env.ADMIN_APP_URL ?? "");

    const cognitoEnv = {
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      NEXT_PUBLIC_COGNITO_CLIENT_ID:    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    };

    // ── VPC config (uncomment if your RDS is in a private subnet) ─────────────
    // When enabled, Lambda joins the VPC so it can reach RDS privately.
    // You need the subnet IDs and a security group that allows port 5432 outbound.
    //
    // const vpc = {
    //   vpc: {
    //     securityGroups: [process.env.LAMBDA_SECURITY_GROUP_ID!],
    //     subnets:        (process.env.LAMBDA_SUBNET_IDS ?? "").split(","),
    //   },
    // };
    //
    // Add `...vpc` to both NextjsSite server configs below once filled in.

    // ── Main store (Next.js 16) ───────────────────────────────────────────────
    const store = new sst.aws.Nextjs("VintageStore", {
      path: ".",
      ...storeDomainConfig,

      server: {
        memory:       "512 MB",
        timeout:      "29 seconds",
        // arm64 Graviton: ~20% faster and cheaper. Prisma schema has matching binary target.
        architecture: "arm64",
        // Node 20 hit EOL on 2026-04-30 (no patches); updates blocked from 2027-03-03.
        // Node 22 is the current LTS, supported until April 2027.
        runtime:      "nodejs22.x",
      },

      // Grant the Lambda role direct S3 + SNS access.
      // On Lambda, AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are auto-injected
      // from the IAM role — no hardcoded credentials needed.
      permissions: [
        {
          actions:   ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
          resources: [`arn:aws:s3:::${process.env.S3_BUCKET ?? "vintage-gallery-products"}/*`],
        },
        {
          actions:   ["sns:Publish"],
          resources: ["*"],
        },
      ],

      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        ...cognitoEnv,

        PAYSTACK_SECRET_KEY:             process.env.PAYSTACK_SECRET_KEY!,
        NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,

        S3_BUCKET: process.env.S3_BUCKET ?? "vintage-gallery-products",
        S3_REGION: process.env.S3_REGION ?? "us-east-1",
        // S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are intentionally omitted here.
        // On Lambda, the IAM role above provides S3 access via the default credential chain.
        // For local dev (sst dev), keep them in your .env.local file.

        // Email — lib/mailer.ts prefers Resend and falls back to Gmail SMTP,
        // so leaving RESEND_API_KEY empty keeps the existing behaviour.
        RESEND_API_KEY:         process.env.RESEND_API_KEY         ?? "",
        RESEND_WEBHOOK_SECRET:  process.env.RESEND_WEBHOOK_SECRET  ?? "",
        MAIL_FROM:          process.env.MAIL_FROM          ?? "",
        GMAIL_USER:         process.env.GMAIL_USER         ?? "",
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ?? "",
        ADMIN_EMAILS:       process.env.ADMIN_EMAILS        ?? "",
        ADMIN_PHONE:        process.env.ADMIN_PHONE         ?? "",

        // ADMIN_APP_URL drives CORS in middleware.ts. Must be exact — no trailing slash.
        ADMIN_APP_URL:       adminUrl,
        NEXT_PUBLIC_APP_URL: storeUrl,

        WEATHER_API_KEY: process.env.WEATHER_API_KEY ?? "",
        FAL_KEY:             process.env.FAL_KEY             ?? "",
      },
    });

    // ── Admin app (Next.js 15, admin-app/ subfolder) ──────────────────────────
    const admin = new sst.aws.Nextjs("VintageAdmin", {
      path: "admin-app",
      ...adminDomainConfig,

      server: {
        memory:       "512 MB",
        timeout:      "29 seconds",
        architecture: "arm64",
        // Node 20 hit EOL on 2026-04-30 (no patches); updates blocked from 2027-03-03.
        // Node 22 is the current LTS, supported until April 2027.
        runtime:      "nodejs22.x",
      },

      permissions: [
        {
          actions:   ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
          resources: [`arn:aws:s3:::${process.env.S3_BUCKET ?? "vintage-gallery-products"}/*`],
        },
      ],

      environment: {
        ...cognitoEnv,

        S3_BUCKET: process.env.S3_BUCKET ?? "vintage-gallery-products",
        S3_REGION: process.env.S3_REGION ?? "us-east-1",

        ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",

        // Client-side admin gate in admin-app/app/(admin)/layout.tsx reads this.
        // Baked into the JS bundle at build time — must be set during `next build`.
        // Without it the admin allowlist is empty and EVERY user is denied.
        NEXT_PUBLIC_ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",

        // "View Store" link in the admin sidebar
        NEXT_PUBLIC_STORE_URL: storeUrl,

        // The admin app's browser code fetches /api/admin/* on the main store.
        // Also used in the admin CSP connect-src header (admin-app/next.config.js).
        NEXT_PUBLIC_API_URL: storeUrl,
      },
    });

    return {
      storeUrl: store.url,
      adminUrl: admin.url,
    };
  },
});
