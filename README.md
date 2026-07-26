# Vintage Gallery

A production e-commerce platform for a streetwear brand in Accra, Ghana. Built with
Next.js and TypeScript, running on AWS Lambda behind CloudFront.

This is a real store handling real orders — mobile money payments through Paystack,
weather-aware delivery pricing, and a separate admin application for catalog, orders,
payments, and analytics.

---

## Architecture

```
Browser
  │
  ▼
CloudFront ──────────────┬────────────────────────┐
  │                      │                        │
  ▼                      ▼                        ▼
Store (Lambda)      Admin (Lambda)          S3 (static assets
Next.js 16          Next.js 15               + product images)
  │                      │
  └──────────┬───────────┘
             ▼
   ┌─────────────────────┐
   │ RDS PostgreSQL      │  ← Prisma ORM
   │ Cognito (auth)      │
   │ Paystack (payments) │
   │ WeatherAPI          │
   └─────────────────────┘
```

Two independently deployed Next.js applications sharing one database. Infrastructure
is defined as code with [SST Ion](https://sst.dev) (`sst.config.ts`) and deployed by
GitHub Actions on push.

---

## The interesting parts

If you're reading this to evaluate the code, these are the files worth your time.

### Payments — never trust the client with money

| File | What it does |
|---|---|
| [`app/api/paystack/route.ts`](app/api/paystack/route.ts) | Initialises a transaction. **Every price is recalculated server-side from the database** — the client-supplied cart is treated as a list of intents, not amounts. Also enforces the same-day delivery region rule against server time so it can't be spoofed. |
| [`app/api/paystack/webhook/route.ts`](app/api/paystack/webhook/route.ts) | Verifies an HMAC-SHA512 signature before trusting anything. Idempotent — a replayed `charge.success` is a no-op. Marks the order paid and decrements per-size stock in a **single atomic transaction**, so a partial failure can't oversell inventory. |

### Business logic specific to this market

| File | What it does |
|---|---|
| [`lib/weather.ts`](lib/weather.ts) | Live Accra conditions from WeatherAPI, cached 15 minutes, with a 3-second timeout and a neutral fallback. Rain triggers a same-day delivery surcharge. |
| [`lib/sameday.ts`](lib/sameday.ts) | Same-day delivery is available in Greater Accra all day, but Ashanti only before 12:30 Ghana time. Pure functions that give the same answer on the server and in the browser, so the rule resets at midnight with no cron job. |

### Reliability on serverless

| File | What it does |
|---|---|
| [`lib/db.ts`](lib/db.ts) | Prisma singleton that injects `connection_limit=1` when running on Lambda. Without this, concurrent Lambda instances each open a pool and exhaust RDS connections. |
| [`lib/fetch-with-timeout.ts`](lib/fetch-with-timeout.ts) | Every outbound HTTP call is bounded. An unbounded `fetch` can hang a Lambda for its full timeout, burning GB-seconds and stalling the user — and it prevents graceful fallback code from ever running. |
| [`lib/rate-limit.ts`](lib/rate-limit.ts) | Sliding-window limiter. Reads the client IP from the **end** of `X-Forwarded-For`, because CloudFront appends the real viewer IP and everything before it is attacker-controlled. |

### Analytics

| File | What it does |
|---|---|
| [`app/api/events/route.ts`](app/api/events/route.ts) | Anonymous product interaction events — views, dwell time, wishlist, cart. Identified only by a client-generated session UUID, never linked to a user account. Prunes its own table opportunistically to stay bounded. |
| [`lib/events.ts`](lib/events.ts) | Client sender. Uses `sendBeacon` on page unload so dwell-time events survive tab close, `keepalive` fetch otherwise. Failures are silent by design — analytics must never degrade the shopping experience. |

---

## Stack

- **Next.js 16 / 15**, React, TypeScript, Tailwind
- **Prisma** → PostgreSQL on Amazon RDS
- **AWS Lambda** (arm64) + CloudFront + S3, deployed via SST Ion
- **Cognito** for authentication, group-based admin authorisation
- **Paystack** for card, mobile money, and bank transfer payments

---

## Running locally

```bash
npm install
cp .env.example .env      # fill in your own values
npx prisma generate
npx prisma db push
npm run dev               # store on :3000

cd admin-app && npm install && npm run dev   # admin on :3001
```

Deploying requires AWS credentials:

```bash
npx sst deploy --stage staging
```

---

## Repository layout

```
app/              Store — pages and API routes
admin-app/        Admin application (separate Next.js app)
lib/              Shared server utilities
prisma/           Schema and seed
sst.config.ts     Infrastructure as code
.github/workflows Deployment pipeline
```
