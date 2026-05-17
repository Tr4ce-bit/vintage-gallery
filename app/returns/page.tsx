import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Returns & Exchanges" };

const ELIGIBLE = [
  "Item received damaged or defective",
  "Wrong item or size sent by us",
  "Item significantly different from the product description",
];

const NOT_ELIGIBLE = [
  "Change of mind after delivery",
  "Items that have been worn, washed, or altered",
  "Items without original tags and packaging",
  "Sale or final-sale items (marked clearly on product page)",
  "Items returned after the 24-hour window",
];

const STEPS = [
  { step: "01", title: "Contact us within 24 hours", desc: "Email or WhatsApp us within 24 hours of receiving your order. Include your order reference and photos of the item." },
  { step: "02", title: "We review your request",   desc: "Our team will review your request within 1–2 business days and confirm whether it qualifies." },
  { step: "03", title: "Return the item",          desc: "Once approved, ship the item back in its original packaging. We will cover return shipping costs for defective items." },
  { step: "04", title: "Exchange or refund",       desc: "Your replacement will be dispatched within 3 business days, or your refund processed to your MoMo within 5 business days." },
];

export default function ReturnsPage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">

          <Link href="/shop" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Shop
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            Policy
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            Returns &amp; Exchanges.
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12 max-w-lg">
            We stand behind every piece we sell. If something isn&apos;t right, we want to fix it. Our return window is <strong className="text-zinc-700 dark:text-zinc-300 font-medium">24 hours</strong> from the date of delivery.
          </p>

          {/* Eligible / Not eligible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
              <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-500 font-medium mb-4 flex items-center gap-2">
                <CheckCircle size={12} /> Eligible for Return
              </p>
              <ul className="space-y-3">
                {ELIGIBLE.map((item) => (
                  <li key={item} className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light leading-snug flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-6">
              <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-400 font-medium mb-4 flex items-center gap-2">
                <AlertCircle size={12} /> Not Eligible
              </p>
              <ul className="space-y-3">
                {NOT_ELIGIBLE.map((item) => (
                  <li key={item} className="font-sans text-sm text-zinc-500 dark:text-zinc-500 font-light leading-snug flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Process steps */}
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            How It Works
          </p>
          <div className="space-y-5 mb-12">
            {STEPS.map((s) => (
              <div key={s.step} className="flex gap-5 items-start">
                <span className="font-serif text-zinc-200 dark:text-zinc-700 text-3xl font-light leading-none shrink-0 mt-0.5">{s.step}</span>
                <div>
                  <h3 className="font-sans text-sm text-zinc-900 dark:text-zinc-100 font-medium mb-1">{s.title}</h3>
                  <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-800 p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-serif text-white text-xl font-light mb-1">Ready to start a return?</p>
              <p className="font-sans text-sm text-zinc-400 font-light">Reach out and we&apos;ll take it from there.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a href="mailto:vintagegallerystore@gmail.com?subject=Return%20Request"
                className="inline-flex items-center justify-center gap-2 bg-white text-zinc-900 font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-6 py-3.5 rounded-full hover:bg-zinc-100 transition-colors whitespace-nowrap">
                Email Us
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-300 font-sans text-[10px] tracking-[0.15em] uppercase px-6 py-3.5 rounded-full hover:border-zinc-400 hover:text-white transition-colors whitespace-nowrap">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-5">
            <RefreshCw size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="font-sans text-sm text-amber-700 dark:text-amber-400 font-light leading-relaxed">
              Refunds are processed to the original MoMo number used at checkout. Bank transfers may take an additional 2–3 business days to reflect.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
