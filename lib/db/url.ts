import { Resource } from "sst";

// Deployed: built from the linked SST Database resource, TLS verified against
// the Amazon CA bundle (NODE_EXTRA_CA_CERTS, set in sst.config.ts).
// Local: DATABASE_URL from .env (Docker or local Postgres, never production).
export function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const db = Resource.Database;
  const user = encodeURIComponent(db.username);
  const pass = encodeURIComponent(db.password);
  return `postgresql://${user}:${pass}@${db.host}:${db.port}/${db.database}?sslmode=verify-full`;
}
