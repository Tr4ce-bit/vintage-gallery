/// <reference path="./.sst/platform/config.d.ts" />

// Vintage Gallery infrastructure. Two stages, each in its own AWS account:
//   staging     → staging.vintagegallery.store, admin.staging.vintagegallery.store
//   production  → vintagegallery.store,         admin.vintagegallery.store
// Any other stage name is a personal dev stage with no custom domain.
// Region eu-west-1; CloudFront certificates are created in us-east-1 by SST.

const ROOT_DOMAIN = "vintagegallery.store";

export default $config({
  app(input) {
    return {
      name: "vintage-gallery",
      home: "aws",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      providers: { aws: { region: "eu-west-1" } },
    };
  },

  async run() {
    const { createHash } = await import("node:crypto");
    const { readdirSync, readFileSync } = await import("node:fs");

    const isProd = $app.stage === "production";
    const isStaging = $app.stage === "staging";
    const shopHost = isProd ? ROOT_DOMAIN : isStaging ? `staging.${ROOT_DOMAIN}` : undefined;
    const adminHost = shopHost ? `admin.${shopHost}` : undefined;

    // ── Network ──────────────────────────────────────────────────────────────
    // Private subnets for the database and Lambdas; one fck-nat instance
    // (t4g.nano) for outbound calls to Paystack and other providers.
    const vpc = new sst.aws.Vpc("Vpc", {
      az: 2,
      nat: { type: "ec2", ec2: { instance: "t4g.nano" } },
    });

    // ── Database ─────────────────────────────────────────────────────────────
    const database = new sst.aws.Postgres("Database", {
      vpc,
      version: "17",
      instance: "t4g.micro",
      storage: "20 GB",
      transform: {
        parameterGroup: (args) => {
          // Refuse any connection that isn't TLS.
          args.parameters = [{ name: "rds.force_ssl", value: "1" }];
        },
        instance: (args) => {
          args.backupRetentionPeriod = 14;
          args.deletionProtection = isProd;
          args.skipFinalSnapshot = !isProd;
          if (isProd) args.finalSnapshotIdentifier = "vintage-gallery-final";
          args.copyTagsToSnapshot = true;
        },
      },
    });

    // ── Sign-in ──────────────────────────────────────────────────────────────
    // Customers: self sign-up with email. A changed email stays unverified and
    // inactive until confirmed, so nobody can claim an address they don't own.
    const shopUsers = new sst.aws.CognitoUserPool("ShopUserPool", {
      usernames: ["email"],
      transform: {
        userPool: (args) => {
          args.userAttributeUpdateSettings = { attributesRequireVerificationBeforeUpdates: ["email"] };
          args.passwordPolicy = { minimumLength: 10, requireLowercase: true, requireNumbers: true, requireUppercase: false, requireSymbols: false };
          args.deletionProtection = isProd ? "ACTIVE" : "INACTIVE";
        },
      },
    });

    // Admins: a separate pool, accounts created only by you, MFA required.
    const adminUsers = new sst.aws.CognitoUserPool("AdminUserPool", {
      usernames: ["email"],
      mfa: "on",
      softwareToken: true,
      transform: {
        userPool: (args) => {
          args.adminCreateUserConfig = { allowAdminCreateUserOnly: true };
          args.userAttributeUpdateSettings = { attributesRequireVerificationBeforeUpdates: ["email"] };
          args.passwordPolicy = { minimumLength: 14, requireLowercase: true, requireNumbers: true, requireUppercase: true, requireSymbols: true };
          args.deletionProtection = isProd ? "ACTIVE" : "INACTIVE";
        },
      },
    });
    new aws.cognito.UserGroup("AdminGroup", { userPoolId: adminUsers.id, name: "admin" });

    // Server-side clients with a secret: the browser never talks to Cognito
    // directly and never holds a token outside an httpOnly cookie.
    const serverClient = (args: aws.cognito.UserPoolClientArgs, callbackHost?: string, hours = 1) => {
      args.generateSecret = true;
      args.explicitAuthFlows = ["ALLOW_USER_SRP_AUTH", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"];
      args.preventUserExistenceErrors = "ENABLED";
      args.allowedOauthFlows = ["code"];
      args.allowedOauthScopes = ["openid", "email", "profile"];
      args.callbackUrls = [callbackHost ? `https://${callbackHost}/auth/callback` : "http://localhost:3000/auth/callback"];
      args.idTokenValidity = hours;
      args.accessTokenValidity = hours;
      args.tokenValidityUnits = { idToken: "hours", accessToken: "hours", refreshToken: "days" };
      args.refreshTokenValidity = hours > 1 ? 1 : 30;
    };
    const shopClient = shopUsers.addClient("ShopWebClient", {
      transform: { client: (args) => { serverClient(args, shopHost); } },
    });
    const adminClient = adminUsers.addClient("AdminWebClient", {
      transform: { client: (args) => { serverClient(args, adminHost, 8); } },
    });

    // ── Storage ──────────────────────────────────────────────────────────────
    // Product photos: private, readable only through CloudFront.
    const productImages = new sst.aws.Bucket("ProductImages", {
      access: "cloudfront",
      versioning: true,
    });
    // Customer studio uploads: private, deleted after 30 days.
    const studioUploads = new sst.aws.Bucket("StudioUploads", {
      lifecycle: [{ expiresIn: "30 days" }],
    });

    // ── Migrations ───────────────────────────────────────────────────────────
    // Runs inside the VPC on every deploy where prisma/migrations changed,
    // before the web app updates. A failed migration fails the deploy.
    const migrator = new sst.aws.Function("Migrator", {
      handler: "functions/migrate.handler",
      vpc,
      link: [database],
      timeout: "5 minutes",
      architecture: "arm64",
      copyFiles: [{ from: "prisma/migrations", to: "migrations" }],
      environment: { NODE_EXTRA_CA_CERTS: "/var/runtime/ca-cert.pem" },
    });
    const migrationsHash = createHash("sha256");
    for (const dir of readdirSync("prisma/migrations", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
      migrationsHash.update(dir).update(readFileSync(`prisma/migrations/${dir}/migration.sql`));
    }
    const migrations = new aws.lambda.Invocation("RunMigrations", {
      functionName: migrator.name,
      input: JSON.stringify({}),
      triggers: { migrations: migrationsHash.digest("hex") },
    });

    // ── Web app: shop + admin ────────────────────────────────────────────────
    const web = new sst.aws.Nextjs(
      "Web",
      {
        vpc,
        link: [database, shopClient, adminClient, productImages, studioUploads],
        environment: {
          NODE_EXTRA_CA_CERTS: "/var/runtime/ca-cert.pem",
          SHOP_USER_POOL_ID: shopUsers.id,
          ADMIN_USER_POOL_ID: adminUsers.id,
        },
        server: { memory: "1024 MB", architecture: "arm64" },
        // Lambda URLs answer only to CloudFront. Edge signing keeps Paystack's
        // webhook POSTs working without the caller signing the body.
        protection: "oac-with-edge-signing",
        domain: shopHost
          ? { name: shopHost, aliases: [adminHost!], dns: sst.aws.dns() }
          : undefined,
      },
      { dependsOn: [migrations] },
    );

    return {
      shop: shopHost ? `https://${shopHost}` : web.url,
      admin: adminHost ? `https://${adminHost}` : "admin.localhost (dev only)",
      adminUserPool: adminUsers.id,
    };
  },
});
