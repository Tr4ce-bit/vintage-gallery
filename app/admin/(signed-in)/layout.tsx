import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { adminSignOut } from "./actions";

// Served only on the admin host (see proxy.ts). The proxy's cookie check is
// just routing; this server-side check is the real gate.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await getAdminSession();
  if (!admin) redirect("/sign-in");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <span className="font-semibold">Vintage Gallery admin</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-500">{admin.email}</span>
          <form action={adminSignOut}>
            <button type="submit" className="underline underline-offset-4">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
