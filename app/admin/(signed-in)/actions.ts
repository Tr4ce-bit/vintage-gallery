"use server";

import { redirect } from "next/navigation";
import { endAdminSession } from "@/lib/auth/admin";
import { assertSite } from "@/lib/auth/host";

export async function adminSignOut() {
  await assertSite("admin");
  await endAdminSession();
  redirect("/sign-in");
}
