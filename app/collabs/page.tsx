import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
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
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-8">
              We&apos;re open to collabs with artists, photographers, musicians, designers, and creative brands. Reach out with a brief summary of who you are and what you have in mind.
            </p>

            {/* Contact options */}
            <div className="space-y-3">
              {/* Email */}
              <a href="mailto:vintagegallerystore@gmail.com?subject=Collab%20Inquiry"
                className="flex items-center gap-4 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-5 py-4 hover:border-zinc-900 dark:hover:border-zinc-300 transition-all duration-200 group">
                <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-white dark:text-zinc-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-0.5">Email</p>
                  <p className="font-sans text-sm text-zinc-800 dark:text-zinc-100 font-medium">vintagegallerystore@gmail.com</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a href="https://wa.me/233538477072?text=Hi%2C%20I%27d%20love%20to%20discuss%20a%20collab%20with%20Vintage%20Gallery!"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-5 py-4 hover:border-[#25D366] transition-all duration-200 group">
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  {/* WhatsApp icon */}
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-0.5">WhatsApp</p>
                  <p className="font-sans text-sm text-zinc-800 dark:text-zinc-100 font-medium">+233 53 847 7072</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
