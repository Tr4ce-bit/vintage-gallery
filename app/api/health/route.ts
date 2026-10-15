// Uptime check target. Says nothing about the database on purpose, so a
// public probe can't be used to load it.
export function GET() {
  return Response.json({ ok: true });
}
