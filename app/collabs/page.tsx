import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Collabs" };

const PAST = [
  {
    partner: "Local Artists",
    title:   "Icons Series",
    year:    "2025",
    desc:    "The Icons Series was born out of a collab with Ghanaian graphic artists who reimagined legends of music and culture through a West African lens.",
  },
];

export default function CollabsPage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">

          <Link href="/" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            Partnerships
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            Collabs.
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-14 max-w-lg">
            We believe in building together. Whether you&apos;re an artist, a brand, or a creative studio — if your values align with ours, we want to hear from you.
          </p>

          {/* Past collabs */}
          {PAST.length > 0 && (
            <div className="mb-14">
              <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Past Work
              </p>
              <div className="space-y-6">
                {PAST.map((p) => (
                  <div key={p.title} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-7">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-1">{p.partner} · {p.year}</p>
                        <h3 className="font-serif text-zinc-900 dark:text-zinc-100 text-2xl font-light">{p.title}</h3>
                      </div>
                    </div>
                    <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collab pitch */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8">
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-3">Work With Us</p>
            <h3 className="font-serif text-zinc-900 dark:text-zinc-100 text-2xl font-light mb-4">
              Got an idea?
            </h3>
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-6">
              We&apos;re open to collabs with artists, photographers, musicians, designers, and creative brands. Reach out with a brief summary of who you are and what you have in mind.
            </p>
            <a href="mailto:vintagegallerystore@gmail.com?subject=Collab%20Inquiry"
              className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors group">
              Get in Touch
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
