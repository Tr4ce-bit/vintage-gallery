import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service" };

const LAST_UPDATED = "7 August 2026";

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">

          <Link href="/" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group mb-10">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
            Legal
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-3"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}>
            Terms of Service.
          </h1>
          <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light mb-12">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="space-y-10 font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using the Vintage Gallery website (vintagegallery.store) and placing an order, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                2. Eligibility
              </h2>
              <p>
                You must be at least 18 years of age to place an order. By using our website, you represent that you meet this requirement. If you are under 18, you may only use the site under the supervision of a parent or guardian who agrees to these terms.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                3. Products & Pricing
              </h2>
              <p>
                All prices are listed in Ghana Cedis (GH₵) and are inclusive of applicable taxes. Delivery fees are added at checkout. We reserve the right to change prices at any time without notice. Product images are illustrative — actual colours may vary slightly due to screen calibration.
              </p>
              <p className="mt-3">
                We reserve the right to limit quantities, discontinue products, or cancel orders at our discretion. If your order is cancelled after payment, you will receive a full refund.
              </p>
              <p className="mt-3">
                <strong className="font-medium text-zinc-700 dark:text-zinc-300">No warranties.</strong> Our products are sold &ldquo;as is.&rdquo; To the fullest extent permitted by Ghanaian law, we disclaim all implied warranties of merchantability and fitness for a particular purpose, except where those warranties cannot legally be excluded.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                4. Payment
              </h2>
              <p>
                All payments are processed securely through Paystack. By providing your payment details, you authorise us to charge the total amount including delivery. Payment must be completed before your order is processed. We do not store your MoMo number or payment credentials.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                5. Delivery
              </h2>
              <p>
                Delivery times are estimates only and are not guaranteed. We are not liable for delays caused by courier partners, weather, public holidays, or circumstances beyond our control. Risk of loss passes to you upon delivery to the address you provided.
              </p>
              <p className="mt-3">
                You are responsible for providing an accurate delivery address. We are not responsible for orders delivered to an incorrect address provided by you.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                6. Returns & Refunds
              </h2>
              <p>
                Returns are accepted within 24 hours of delivery for defective, damaged, or incorrectly sent items only. Change-of-mind returns are not accepted. See our{" "}
                <Link href="/returns" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">Returns Policy</Link>{" "}
                for the full process.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                7. Intellectual Property
              </h2>
              <p>
                All content on this website — including text, images, logos, graphics, product designs, and artwork — is the property of Vintage Gallery or its licensed creators and is protected by copyright. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                8. User Accounts
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately if you suspect unauthorised use of your account. We are not liable for losses caused by unauthorised access resulting from your failure to secure your account.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                9. Prohibited Conduct
              </h2>
              <p>You agree not to:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside marker:text-zinc-300 dark:marker:text-zinc-600">
                <li>Use our website for any unlawful purpose</li>
                <li>Attempt to gain unauthorised access to any part of our systems</li>
                <li>Scrape, copy, or redistribute our content without permission</li>
                <li>Submit false or fraudulent orders</li>
                <li>Resell our products for commercial gain without written approval</li>
              </ul>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                10. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, Vintage Gallery shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability to you for any claim shall not exceed the amount you paid for the specific order in question.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                11. Governing Law & Dispute Resolution
              </h2>
              <p>
                These terms are governed by the laws of the Republic of Ghana. If you have a dispute with us, please contact us first at{" "}
                <a href="mailto:vintagegallerystore@gmail.com" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">vintagegallerystore@gmail.com</a>{" "}
                so we can try to resolve it informally. If we cannot reach a resolution within 30 days, the dispute shall be referred to the courts of Ghana.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                12. Changes to These Terms
              </h2>
              <p>
                We may update these Terms from time to time. If we make material changes, we will notify you by email <strong className="font-medium text-zinc-700 dark:text-zinc-300">at least 30 days before</strong> the changes take effect. The updated date at the top of this page will always reflect the latest revision. Continued use of our services after the effective date constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                13. Contact
              </h2>
              <p>
                For any questions about these Terms, contact us at:{" "}
                <a href="mailto:vintagegallerystore@gmail.com" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">
                  vintagegallerystore@gmail.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
