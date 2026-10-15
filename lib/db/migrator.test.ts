import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { freshDatabase, TEST_DATABASE_URL } from "@/test/db";
import { loadMigrations, migrate } from "./migrator";

describe.skipIf(!TEST_DATABASE_URL)("migrator (needs TEST_DATABASE_URL)", () => {
  let db: Awaited<ReturnType<typeof freshDatabase>>;
  let client: Client;
  beforeAll(async () => {
    db = await freshDatabase("migrator");
    client = new Client({ connectionString: db.url });
    await client.connect();
  });
  afterAll(async () => {
    await client?.end();
    await db?.drop();
  });

  it("runs nothing the second time", async () => {
    const migrations = await loadMigrations(path.resolve(import.meta.dirname, "../../prisma/migrations"));
    expect(await migrate(client, migrations)).toEqual([]);
  });

  it("stops if an applied migration was edited", async () => {
    const migrations = await loadMigrations(path.resolve(import.meta.dirname, "../../prisma/migrations"));
    const edited = migrations.map((m, i) => (i === 0 ? { ...m, checksum: "changed" } : m));
    await expect(migrate(client, edited)).rejects.toThrow("was edited after it was applied");
  });

  it("rolls back a failing migration", async () => {
    const migrations = await loadMigrations(path.resolve(import.meta.dirname, "../../prisma/migrations"));
    const bad = { name: "99999999999999_bad", sql: "CREATE TABLE half_done (id int); SELECT broken;", checksum: "x" };
    await expect(migrate(client, [...migrations, bad])).rejects.toThrow("99999999999999_bad failed");
    const { rows } = await client.query(`SELECT to_regclass('half_done') AS t`);
    expect(rows[0].t).toBeNull();
  });
});
