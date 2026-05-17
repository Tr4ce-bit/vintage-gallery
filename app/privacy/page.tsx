import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy" };

const LAST_UPDATED = "17 May 2025";

export default function PrivacyPage() {
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
            Privacy Policy.
          </h1>
          <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light mb-12">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="prose-vg space-y-10 font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                1. Who We Are
              </h2>
              <p>
                Vintage Gallery (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a streetwear brand based in Ghana operating at{" "}
                <a href="https://vintagegallerystore.com" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">vintagegallerystore.com</a>.
                We are committed to protecting your personal information and your right to privacy.
              </p>
              <p className="mt-3">
                If you have any questions about this policy, please contact us at{" "}
                <a href="mailto:vintagegallerystore@gmail.com" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">
                  vintagegallerystore@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                2. Information We Collect
              </h2>
              <p>We collect information you provide directly to us when you:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside marker:text-zinc-300 dark:marker:text-zinc-600">
                <li>Create an account (name, email address, password)</li>
                <li>Place an order (delivery name, address, phone number, MoMo number)</li>
                <li>Contact us (email content, name)</li>
                <li>Subscribe to updates (email address)</li>
              </ul>
              <p className="mt-4">
                We also collect limited technical information automatically when you visit our website, including your IP address, browser type, device type, pages visited, and referring URL. This is standard web analytics data.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside marker:text-zinc-300 dark:marker:text-zinc-600">
                <li>Process and fulfil your orders</li>
                <li>Send you order confirmations, updates, and delivery notifications via SMS or email</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve and maintain our website and services</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Send you marketing communications (only if you have opted in)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                4. Payment Processing
              </h2>
              <p>
                All payments are processed by <strong className="font-medium text-zinc-700 dark:text-zinc-300">Paystack</strong>, a PCI-DSS compliant payment provider. We do not store your MoMo number, bank details, or any payment credentials on our servers. Please review Paystack&apos;s own privacy policy at paystack.com/privacy.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                5. Sharing Your Information
              </h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We share data only with:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside marker:text-zinc-300 dark:marker:text-zinc-600">
                <li><strong className="font-medium text-zinc-700 dark:text-zinc-300">Delivery partners</strong> — your name, phone, and address to complete delivery</li>
                <li><strong className="font-medium text-zinc-700 dark:text-zinc-300">Paystack</strong> — for payment processing</li>
                <li><strong className="font-medium text-zinc-700 dark:text-zinc-300">AWS</strong> — for secure cloud hosting and account management</li>
              </ul>
              <p className="mt-4">
                We may disclose information if required by law, court order, or government authority.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                6. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide services. Order records are retained for a minimum of 5 years for financial compliance. You may request deletion of your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                7. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside marker:text-zinc-300 dark:marker:text-zinc-600">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, email us at{" "}
                <a href="mailto:vintagegallerystore@gmail.com" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">
                  vintagegallerystore@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                8. Cookies
              </h2>
              <p>
                We use essential cookies to keep you signed in and to remember your cart. We do not use third-party advertising or tracking cookies. See our{" "}
                <Link href="/cookies" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">
                  Cookies Policy
                </Link>{" "}
                for details.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                9. Security
              </h2>
              <p>
                We use industry-standard measures to protect your information, including HTTPS encryption, secure cloud infrastructure (AWS), and hashed passwords. No method of transmission over the internet is 100% secure. We will notify you promptly if a data breach affects your information.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this policy from time to time. If we make significant changes, we will notify you by email or by prominently displaying a notice on our website. Continued use of our services after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                11. Contact
              </h2>
              <p>
                For any privacy-related questions or concerns, contact us at:<br />
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
