"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    heading: "Orders & Payment",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept MTN Mobile Money, Telecel Cash, and AirtelTigo Money. All payments are processed securely through Paystack.",
      },
      {
        q: "Can I pay on delivery?",
        a: "We do not currently offer pay-on-delivery. All orders must be paid in full before dispatch.",
      },
      {
        q: "How do I know my order went through?",
        a: "After a successful payment you will be redirected to a confirmation page with your order reference. You will also receive an SMS from our payment provider. Your order will appear in your account under Orders.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can only be cancelled within 1 hour of placement, before they are handed off to our dispatch team. Contact us via WhatsApp immediately if you need to change anything.",
      },
    ],
  },
  {
    heading: "Shipping & Delivery",
    faqs: [
      {
        q: "How long does delivery take?",
        a: "Greater Accra: 24–48 hours. Kumasi / Cape Coast: 48–72 hours. Other regions: 3–7 days. See our full Shipping page for details.",
      },
      {
        q: "Do you deliver nationwide?",
        a: "Yes, we deliver across all regions of Ghana. Delivery fees and times vary by location.",
      },
      {
        q: "Can I track my delivery?",
        a: "Yes. Once your order is dispatched you will receive an SMS with a tracking reference. You can also check your account under Orders.",
      },
    ],
  },
  {
    heading: "Products & Sizing",
    faqs: [
      {
        q: "Are your pieces limited edition?",
        a: "Most drops are limited. Once they sell out, we do not restock. Follow our Instagram or check the Drop Schedule page to stay ahead.",
      },
      {
        q: "How do I find my size?",
        a: "Visit our Sizing Guide page for full measurements in cm. When in doubt, size up — our cuts are relaxed.",
      },
      {
        q: "What fabric are the tees made from?",
        a: "Our tees are 100% heavyweight cotton (240–280 gsm) for structure and comfort in Ghana's climate.",
      },
      {
        q: "How should I care for my piece?",
        a: "Machine wash cold, inside out. Do not tumble dry. Hang to air dry. Do not bleach or dry-clean.",
      },
    ],
  },
  {
    heading: "Returns & Exchanges",
    faqs: [
      {
        q: "What is your returns policy?",
        a: "We accept returns within 24 hours of delivery for defective, damaged, or incorrectly sent items. Change-of-mind returns are not accepted. See the full Returns page for details.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed to your original MoMo number within 5 business days of us receiving the returned item.",
      },
    ],
  },
  {
    heading: "Account & Other",
    faqs: [
      {
        q: "Do I need an account to shop?",
        a: "No — but creating an account lets you track orders, save items to your wishlist, and get early access to drops.",
      },
      {
        q: "How do I get in touch?",
        a: "Email us at vintagegallerystore@gmail.com or message us on WhatsApp. We respond within 24 hours on business days.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-sans text-sm text-zinc-700 dark:text-zinc-300 font-light group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors leading-snug">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed pb-5">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">

          <Link href="/" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            Help
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            FAQs.
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12 max-w-lg">
            Answers to the most common questions. Can&apos;t find what you need? We&apos;re one message away.
          </p>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  {section.heading}
                </p>
                <div>
                  {section.faqs.map((faq) => (
                    <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 text-center">
            <h3 className="font-serif text-zinc-900 dark:text-zinc-100 text-2xl font-light mb-3">Still have a question?</h3>
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light mb-6">We&apos;re happy to help. Reach out directly.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="mailto:vintagegallerystore@gmail.com"
                className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors">
                Email Us
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-sans text-[10px] tracking-[0.15em] uppercase px-6 py-3.5 rounded-full hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
