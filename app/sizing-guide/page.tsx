import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Sizing Guide" };

const MEASUREMENTS = [
  { size: "XS", chest: "86–91",  waist: "71–76",  hips: "91–96",  length: "67" },
  { size: "S",  chest: "91–97",  waist: "76–81",  hips: "96–101", length: "69" },
  { size: "M",  chest: "97–102", waist: "81–86",  hips: "101–107",length: "71" },
  { size: "L",  chest: "102–107",waist: "86–91",  hips: "107–112",length: "73" },
  { size: "XL", chest: "107–114",waist: "91–97",  hips: "112–117",length: "75" },
  { size: "XXL",chest: "114–122",waist: "97–104", hips: "117–124",length: "77" },
];

const TIPS = [
  { title: "Measure your chest",  desc: "Wrap the tape around the fullest part of your chest, keeping it level." },
  { title: "Measure your waist",  desc: "Measure around the narrowest part of your natural waist, usually just above the navel." },
  { title: "Measure your hips",   desc: "Measure around the fullest part of your hips, about 20 cm below your waist." },
  { title: "Oversize vs. fitted", desc: "Our tees are cut slightly relaxed. If you prefer a fitted look, size down. For an oversized fit, size up or stay true to size." },
];

export default function SizingGuidePage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-14">

          <Link href="/shop" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Shop
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            Fit Guide
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            Sizing Guide.
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12 max-w-lg">
            All measurements are in centimetres (cm). Our pieces are unisex unless stated otherwise. When in doubt, go up a size — our cuts are generous.
          </p>

          {/* Size table */}
          <div className="mb-14 overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  {["Size", "Chest (cm)", "Waist (cm)", "Hips (cm)", "Length (cm)"].map(h => (
                    <th key={h} className="text-left font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-medium px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEASUREMENTS.map((row, i) => (
                  <tr key={row.size} className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/30"}`}>
                    <td className="font-serif text-zinc-900 dark:text-zinc-100 text-lg font-light px-5 py-4">{row.size}</td>
                    <td className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light px-5 py-4">{row.chest}</td>
                    <td className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light px-5 py-4">{row.waist}</td>
                    <td className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light px-5 py-4">{row.hips}</td>
                    <td className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light px-5 py-4">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to measure */}
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            How to Measure
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {TIPS.map((tip) => (
              <div key={tip.title} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
                <h3 className="font-sans text-sm text-zinc-900 dark:text-zinc-100 font-medium mb-2">{tip.title}</h3>
                <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-sans text-sm text-zinc-700 dark:text-zinc-300 font-medium mb-1">Still unsure about your size?</p>
              <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light">Message us on WhatsApp and we&apos;ll help you pick the right fit.</p>
            </div>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-6 py-3.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors whitespace-nowrap">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
