import { defineConfig } from "prisma/config";

// DATABASE_URL (and SHADOW_DATABASE_URL for drift checks) are only needed for
// local development and CI against a throwaway Postgres. `prisma generate`
// works without them. Deployed databases are migrated by functions/migrate.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
