export const metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

// Admin sign-in (password + required authenticator app) is built in the
// sign-in pull request. Accounts are created by the owner in the admin pool.
export default function AdminSignIn() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Admin sign-in</h1>
      <p className="max-w-sm text-zinc-600 dark:text-zinc-400">Sign-in isn&apos;t switched on yet.</p>
    </main>
  );
}
