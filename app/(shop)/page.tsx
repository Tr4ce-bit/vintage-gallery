import Image from "next/image";

// Placeholder home page for the rebuild. The catalogue, cart and checkout
// arrive in the next pull requests.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Image src="/asset/logo.png" alt="Vintage Gallery" width={160} height={160} priority />
      <h1 className="text-3xl font-semibold tracking-tight">Vintage Gallery</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">The new shop is being built. Check back soon.</p>
    </main>
  );
}
