import path from "node:path";
import { Client } from "pg";
import { Resource } from "sst";
import { loadMigrations, migrate } from "../lib/db/migrator";

// Invoked once per deploy (see sst.config.ts) before the web app updates.
// Throwing fails the invocation, which fails the deploy.
// TLS is verified against the Amazon CA bundle that NODE_EXTRA_CA_CERTS points
// to (set in sst.config.ts), and the database refuses non-TLS connections.
export async function handler() {
  const db = Resource.Database;
  const client = new Client({
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    database: db.database,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();
  try {
    const ran = await migrate(client, await loadMigrations(path.join(process.cwd(), "migrations")));
    console.log(JSON.stringify({ msg: "migrations applied", ran }));
    return { ran };
  } finally {
    await client.end();
  }
}
