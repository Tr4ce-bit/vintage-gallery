import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";

// Served only on the admin host (see proxy.ts). The proxy's cookie check is
// just routing; this server-side check is the real gate.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await getAdminSession();
  if (!admin) redirect("/sign-in");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <span className="font-semibold">Vintage Gallery admin</span>
        <span className="text-sm text-zinc-500">{admin.email}</span>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
