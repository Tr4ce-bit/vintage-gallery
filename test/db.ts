import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { loadMigrations, migrate } from "@/lib/db/migrator";

// Integration tests run against a throwaway Postgres named by TEST_DATABASE_URL
// (CI starts one; locally use Docker). Each test file gets a fresh database.
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

export async function freshDatabase(name: string) {
  const admin = new Client({ connectionString: TEST_DATABASE_URL });
  await admin.connect();
  const db = `vg_test_${name}_${process.pid}`;
  await admin.query(`DROP DATABASE IF EXISTS "${db}"`);
  await admin.query(`CREATE DATABASE "${db}"`);
  await admin.end();

  const url = new URL(TEST_DATABASE_URL!);
  url.pathname = `/${db}`;
  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  await migrate(client, await loadMigrations(path.resolve(import.meta.dirname, "../prisma/migrations")));
  await client.end();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url.toString(), max: 5 }) });
  return {
    prisma,
    url: url.toString(),
    async drop() {
      await prisma.$disconnect();
      const c = new Client({ connectionString: TEST_DATABASE_URL });
      await c.connect();
      await c.query(`DROP DATABASE IF EXISTS "${db}" WITH (FORCE)`);
      await c.end();
    },
  };
}
