import "server-only";
import { headers } from "next/headers";
import { requestHost, siteForHost, type Site } from "@/lib/site";

export class WrongSiteError extends Error {}

// Server Actions are addressed by id, not by page, so a request to the shop
// host could name an admin action. Each action checks it was called on its own site.
export async function assertSite(site: Site) {
  if (siteForHost(requestHost(await headers())) !== site) throw new WrongSiteError(`Not the ${site} site`);
}
