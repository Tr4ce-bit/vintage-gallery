import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Lambda spins up many concurrent instances, each opening its own connection pool.
// RDS db.t3.micro supports ~85 connections total. Without a cap, 10 concurrent
// Lambda instances × Prisma's default pool of 10 = 100 connections → RDS errors.
// connection_limit=1 means each Lambda instance holds at most 1 connection.
function buildDatasourceUrl(): string {
  const base = process.env.DATABASE_URL ?? "";
  // LAMBDA_TASK_ROOT is set in all Lambda environments (/var/task)
  if (!process.env.LAMBDA_TASK_ROOT) return base;
  try {
    const url = new URL(base);
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "1");
    if (!url.searchParams.has("pool_timeout"))     url.searchParams.set("pool_timeout", "10");
    return url.toString();
  } catch {
    return base;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:           process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
