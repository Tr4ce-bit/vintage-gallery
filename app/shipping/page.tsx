import Link from "next/link";
import { ArrowLeft, Package, Clock, MapPin, AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Shipping" };

const ZONES = [
  { zone: "Greater Accra",   time: "24–48 hours",   fee: "GH₵ 30" },
  { zone: "Kumasi",          time: "48–72 hours",   fee: "GH₵ 35" },
  { zone: "Cape Coast",      time: "48–72 hours",   fee: "GH₵ 35" },
  { zone: "Tamale",          time: "3–5 days",       fee: "GH₵ 45" },
  { zone: "Other Regions",   time: "3–7 days",       fee: "GH₵ 45–60" },
];

const FAQS = [
  {
    q: "When does my order ship?",
    a: "Orders are processed within 24 hours of payment confirmation (weekdays). You will receive an SMS once your order has been dispatched.",
  },
  {
    q: "Do you deliver on weekends?",
    a: "We dispatch Monday–Saturday. Sunday orders are processed first thing Monday morning.",
  },
  {
    q: "Can I track my order?",
    a: "Yes — once dispatched, you will receive an SMS with a tracking reference. You can also check your order status in your account under Orders.",
  },
  {
    q: "What if I'm not home?",
    a: "Our delivery partner will attempt to reach you by phone. If you miss the delivery, they will reschedule. You may also arrange pickup from a nearby hub.",
  },
  {
    q: "Do you ship outside Ghana?",
    a: "Not yet. We currently deliver within Ghana only. International shipping is on our roadmap — follow our Instagram for updates.",
  },
];

export default function ShippingPage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">

          <Link href="/shop" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Shop
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            Delivery
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            Shipping.
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12 max-w-lg">
            We deliver across Ghana. All orders are shipped via our trusted local courier partners after payment is confirmed.
          </p>

          {/* Key facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Package, label: "Flat fee",    value: "GH₵ 30 (Accra)" },
              { icon: Clock,   label: "Processing",  value: "Within 24 hours" },
              { icon: MapPin,  label: "Delivery",    value: "Nationwide" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Icon size={16} strokeWidth={1.5} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-1">{label}</p>
                  <p className="font-sans text-sm text-zinc-700 dark:text-zinc-300 font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery zones */}
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            Delivery Zones
          </p>
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-12">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  {["Region", "Est. Delivery", "Fee"].map(h => (
                    <th key={h} className="text-left font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-medium px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ZONES.map((z, i) => (
                  <tr key={z.zone} className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/30"}`}>
                    <td className="font-sans text-sm text-zinc-700 dark:text-zinc-300 font-light px-5 py-4">{z.zone}</td>
                    <td className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light px-5 py-4">{z.time}</td>
                    <td className="font-sans text-sm text-zinc-700 dark:text-zinc-300 font-medium px-5 py-4">{z.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQs */}
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            Common Questions
          </p>
          <div className="space-y-5 mb-12">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
                <h3 className="font-sans text-sm text-zinc-900 dark:text-zinc-100 font-medium mb-2">{faq.q}</h3>
                <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-5">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="font-sans text-sm text-amber-700 dark:text-amber-400 font-light leading-relaxed">
              Delivery times are estimates and may be affected by public holidays, weather, or courier delays. We always do our best to get your order to you on time.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
