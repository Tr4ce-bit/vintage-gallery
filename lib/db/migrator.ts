import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Client } from "pg";

// Applies prisma/migrations/*/migration.sql in name order, once each.
// Used by functions/migrate.ts inside the VPC during every deploy, so the
// database never has to be reachable from GitHub. Rules:
//  - one Postgres advisory lock, so two deploys can't migrate at once
//  - each migration runs in its own transaction
//  - an applied migration whose file changed afterwards stops the deploy

const LOCK_ID = 7_281_946; // arbitrary, constant for this app

export interface Migration {
  name: string;
  sql: string;
  checksum: string;
}

export async function loadMigrations(dir: string): Promise<Migration[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const names = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(path.join(dir, name, "migration.sql"), "utf8");
      return { name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
    }),
  );
}

export async function migrate(client: Client, migrations: Migration[]): Promise<string[]> {
  await client.query(`CREATE TABLE IF NOT EXISTS "_vg_migrations" (
    "name" text PRIMARY KEY,
    "checksum" text NOT NULL,
    "appliedAt" timestamptz NOT NULL DEFAULT now()
  )`);
  await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
  try {
    const { rows } = await client.query<{ name: string; checksum: string }>(
      `SELECT "name", "checksum" FROM "_vg_migrations"`,
    );
    const applied = new Map(rows.map((r) => [r.name, r.checksum]));

    for (const [name, checksum] of applied) {
      const m = migrations.find((x) => x.name === name);
      if (!m) throw new Error(`Applied migration ${name} is missing from this build`);
      if (m.checksum !== checksum) throw new Error(`Migration ${name} was edited after it was applied`);
    }

    const ran: string[] = [];
    for (const m of migrations) {
      if (applied.has(m.name)) continue;
      await client.query("BEGIN");
      try {
        await client.query(m.sql);
        await client.query(`INSERT INTO "_vg_migrations" ("name", "checksum") VALUES ($1, $2)`, [m.name, m.checksum]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${m.name} failed: ${(err as Error).message}`);
      }
      ran.push(m.name);
    }
    return ran;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]);
  }
}
