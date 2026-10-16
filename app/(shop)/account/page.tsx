import { redirect } from "next/navigation";
import { getShopSession } from "@/lib/auth/shop";
import { shopSignOut } from "../auth-actions";

export const metadata = { title: "Your account", robots: { index: false } };

// Orders and saved designs join this page with checkout and the studio.
export default async function Account() {
  const session = await getShopSession();
  if (!session) redirect("/sign-in?next=/account");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-500">Name</dt>
        <dd>{session.name || "Not set"}</dd>
        <dt className="text-zinc-500">Email</dt>
        <dd>{session.email}</dd>
      </dl>
      <form action={shopSignOut}>
        <button type="submit" className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">
          Sign out
        </button>
      </form>
    </main>
  );
}
