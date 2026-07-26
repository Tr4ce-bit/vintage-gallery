import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Lookbook" };

// Lookbook = a curated photo editorial showing how pieces are styled in real life
const EDITORIALS = [
  {
    image:      "/asset/product-hope.jpg",
    season:     "Spring 2025",
    title:      "HOPE",
    subtitle:   "Accra, April 2025",
    desc:       "Shot across the streets of Accra. The HOPE collection styled the way it was meant to be worn — loose, confident, lived in.",
  },
  {
    image:      "/asset/product-tupac.jpg",
    season:     "Icons '25",
    title:      "Icons Series",
    subtitle:   "Studio, February 2025",
    desc:       "A tribute to the legends. The Icons Series photographed in monochrome to let the graphics speak for themselves.",
  },
];

export default function LookbookPage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">

        {/* Header */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 px-5 md:px-8 py-14">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-8 block">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Link>
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
              Editorial
            </p>
            <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300 }}>
              Lookbook.
            </h1>
          </div>
        </div>

        {/* What is a lookbook — small explainer */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 pb-2">
          <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500 font-light max-w-xl">
            A lookbook is our visual editorial — real outfits, real locations, showing how each piece fits into everyday Accra life. Think of it as a styling guide meets photo story.
          </p>
        </div>

        {/* Editorials */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 space-y-20">
          {EDITORIALS.map((ed, i) => (
            <div key={ed.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:flex lg:flex-row-reverse" : ""}`}>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image src={ed.image} alt={ed.title} fill className="object-cover object-center" />
              </div>
              <div className="max-w-sm">
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
                  {ed.season} · {ed.subtitle}
                </p>
                <h2 className="font-serif text-zinc-900 dark:text-zinc-100 leading-none mb-5"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300 }}>
                  {ed.title}
                </h2>
                <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-8">
                  {ed.desc}
                </p>
                <Link href="/shop"
                  className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors group">
                  Shop the Look
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon banner */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 mt-10 py-16 text-center px-5">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">More Coming</p>
          <h3 className="font-serif text-zinc-900 dark:text-zinc-100 text-3xl font-light mb-4">New editorials drop with every collection.</h3>
          <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500 font-light mb-8">Follow us on Instagram for behind-the-scenes content.</p>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-sans text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            @vintagegallerygh
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
