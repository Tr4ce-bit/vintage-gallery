import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Drop Schedule" };

const UPCOMING = [
  {
    date:       "Jun 2025",
    name:       "Icons Series Vol. II",
    desc:       "The next chapter of our Icons Series. New silhouettes, same energy.",
    status:     "Coming Soon",
    statusColor:"bg-amber-100 text-amber-700",
  },
  {
    date:       "Jul 2025",
    name:       "Summer Limited Drop",
    desc:       "12 pieces. One weekend. No restocks.",
    status:     "Announced",
    statusColor:"bg-blue-100 text-blue-700",
  },
  {
    date:       "Aug 2025",
    name:       "HOPE Collection SS25 Expansion",
    desc:       "New colourways and cuts added to the HOPE family.",
    status:     "In Production",
    statusColor:"bg-zinc-100 text-zinc-600",
  },
];

export default function DropSchedulePage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">

          <Link href="/" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            What&apos;s Next
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            Drop Schedule.
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-14 max-w-lg">
            Every drop is planned, curated, and limited. Sign up to be first in line — we don&apos;t do restocks.
          </p>

          {/* Drops list */}
          <div className="space-y-6 mb-16">
            {UPCOMING.map((drop) => (
              <div key={drop.name}
                className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-7 flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="shrink-0">
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-light">{drop.date}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <h2 className="font-serif text-zinc-900 dark:text-zinc-100 text-2xl font-light">{drop.name}</h2>
                    <span className={`font-sans text-[9px] tracking-[0.15em] uppercase font-medium px-3 py-1 rounded-full ${drop.statusColor}`}>
                      {drop.status}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light">{drop.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Notify CTA */}
          <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-800 p-8 text-center">
            <Bell size={24} strokeWidth={1.5} className="text-zinc-400 mx-auto mb-4" />
            <h3 className="font-serif text-white text-2xl font-light mb-3">Never miss a drop.</h3>
            <p className="font-sans text-sm text-zinc-400 font-light mb-6 max-w-sm mx-auto">
              Follow us on Instagram or join our WhatsApp broadcast for real-time drop alerts.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-zinc-900 font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-6 py-3 rounded-full hover:bg-zinc-100 transition-colors">
                Follow on Instagram
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-300 font-sans text-[10px] tracking-[0.15em] uppercase px-6 py-3 rounded-full hover:border-zinc-400 hover:text-white transition-colors">
                WhatsApp Alerts
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
