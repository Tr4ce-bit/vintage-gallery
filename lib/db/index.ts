import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseUrl } from "./url";

// One client per Lambda instance, with a small pool: each Lambda handles one
// request at a time, so a couple of connections is plenty and keeps the
// db.t4g.micro well under its connection limit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Created on first use, not at import, so `next build` can load pages
// without database settings.
export function db(): PrismaClient {
  globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl(), max: 2 }),
  });
  return globalForPrisma.prisma;
}
