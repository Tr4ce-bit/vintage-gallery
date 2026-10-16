# Vintage Gallery

The shop at **vintagegallery.store** and its admin panel at **admin.vintagegallery.store**, served by one Next.js app on AWS. This is the rebuild described in the design doc, [Vintage Gallery: built from scratch](https://claude.ai/code/artifact/92b025e7-e1f7-41a6-9e2d-61a044da96a3). The original code is kept on the `legacy-v1` branch.

## How it fits together

| Piece | Where |
| --- | --- |
| Shop, API and admin panel | One Next.js app (`app/`), deployed with SST to Lambda behind CloudFront |
| Shop vs admin | `proxy.ts` routes by host name. `admin.*` serves `app/admin`, and the shop host returns 404 for anything admin. |
| Admin access | A separate Cognito user pool with no self sign-up and an authenticator app required, checked on the server (`lib/auth/admin.ts`). First sign-in asks for a new password and sets up the authenticator. |
| Shopper accounts | Sign-in, sign-up with an emailed code and password reset, all done by the server against the shop user pool (`app/(shop)/auth-actions.ts`). Tokens live only in httpOnly cookies; `proxy.ts` renews the 1-hour session from a 30-day refresh token. |
| Database | Postgres 17 on RDS in private subnets, TLS required (`sst.config.ts`) |
| Schema | `prisma/schema.prisma`. Money is whole pesewas, and stock lives in `Variant` rows. |
| Migrations | Files in `prisma/migrations`, applied in AWS by `functions/migrate.ts` before each app update |
| Money rules | `lib/domain/` (pricing, delivery, order states) and `lib/orders/mark-paid.ts` |

## Local development

You need Node 22 and Postgres 16 or newer (local or Docker).

```bash
cp .env.example .env          # local database only, never a deployed one
npm install                   # also generates the Prisma client
npx prisma migrate dev        # create/update the local database
npm run dev
```

The shop is at http://localhost:3000 and the admin panel at http://admin.localhost:3000.

Before pushing, run these checks. CI runs the same ones on every pull request.

```bash
npm run lint
npm run typecheck             # needs `npx sst install --stage dev` once
npm test                      # database tests run when TEST_DATABASE_URL is set
```

### Changing the database

1. Edit `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name what_changed` against your local database. This writes a new folder in `prisma/migrations`.
3. Commit both. Never edit a migration that has been deployed, because the migrator will refuse to run.
4. Make changes additive: add first, then remove in a later release.

## Setting up AWS (one time)

Deploys are off until this is done.

1. Create an AWS Organization with two member accounts, **vg-staging** and **vg-production**. Don't use the account shared with CDR Africa.
2. In each account, add an IAM OIDC identity provider for `token.actions.githubusercontent.com`. Then add a deploy role that trusts only this repo's `staging` or `production` GitHub Environment.
3. Create the Route 53 hosted zone for `vintagegallery.store` in the production account, and point the domain's name servers at it. Staging uses `staging.vintagegallery.store` delegated to the staging account.
4. In GitHub, create the Environments **staging** and **production**. Set `AWS_DEPLOY_ROLE_ARN` in each, and add yourself as a required reviewer on production.
5. Set the repository variable `DEPLOY_ENABLED` to `true`.
6. After the first deploy, create admin accounts in the admin user pool (the stack outputs its id) and add them to the `admin` group:

```bash
aws cognito-idp admin-create-user --user-pool-id <pool id> --username you@example.com
aws cognito-idp admin-add-user-to-group --user-pool-id <pool id> --username you@example.com --group-name admin
```

Pushing to `master` deploys staging, then waits for your approval before deploying production.
