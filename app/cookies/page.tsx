import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = { title: "Cookies Policy" };

const LAST_UPDATED = "21 May 2026";

const COOKIE_TABLE = [
  {
    name:     "Session / Auth token",
    provider: "Vintage Gallery (AWS Cognito)",
    purpose:  "Keeps you signed in to your account. Without this cookie you would be logged out on every page.",
    duration: "Until you sign out",
    type:     "Essential",
  },
  {
    name:     "cart (Zustand / localStorage)",
    provider: "Vintage Gallery",
    purpose:  "Remembers items in your shopping cart so they persist between page visits.",
    duration: "30 days or until cleared",
    type:     "Essential",
  },
  {
    name:     "theme",
    provider: "Vintage Gallery (next-themes)",
    purpose:  "Remembers your light / dark mode preference.",
    duration: "1 year",
    type:     "Preference",
  },
  {
    name:     "AWS Amplify session (if applicable)",
    provider: "AWS Amplify",
    purpose:  "Used by the hosting platform for deployment previews and performance optimisation.",
    duration: "Session",
    type:     "Technical",
  },
];

const TYPE_COLORS: Record<string, string> = {
  Essential:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Preference: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Technical:  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function CookiesPage() {
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
            Cookies Policy.
          </h1>
          <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light mb-12">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="space-y-10 font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                What Are Cookies?
              </h2>
              <p>
                Cookies are small text files stored on your device by your web browser when you visit a website. They help websites remember information about your visit — like whether you&apos;re signed in — so you don&apos;t have to re-enter it every time.
              </p>
              <p className="mt-3">
                Some data (like your cart) is stored in <strong className="font-medium text-zinc-700 dark:text-zinc-300">localStorage</strong>, which works similarly but is stored only on your device and never sent to a server.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                How We Use Cookies
              </h2>
              <p>
                We use only <strong className="font-medium text-zinc-700 dark:text-zinc-300">essential and functional cookies</strong>. We do not use advertising cookies, cross-site tracking, or sell any data to third parties.
              </p>
              <p className="mt-3">
                We do not use Google Analytics or any advertising pixels.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Cookies We Use
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      {["Cookie / Storage", "Provider", "Purpose", "Duration", "Type"].map(h => (
                        <th key={h} className="text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-medium px-4 py-4 align-top">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_TABLE.map((row, i) => (
                      <tr key={row.name} className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/30"}`}>
                        <td className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 px-4 py-4 align-top">{row.name}</td>
                        <td className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 px-4 py-4 align-top">{row.provider}</td>
                        <td className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 px-4 py-4 align-top leading-relaxed">{row.purpose}</td>
                        <td className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 px-4 py-4 align-top whitespace-nowrap">{row.duration}</td>
                        <td className="px-4 py-4 align-top">
                          <span className={`font-sans text-[9px] tracking-[0.12em] uppercase font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[row.type]}`}>
                            {row.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Managing Cookies
              </h2>
              <p>
                You can control and delete cookies through your browser settings. However, disabling essential cookies may prevent you from signing in or using the shopping cart. Here&apos;s how to manage cookies in common browsers:
              </p>
              <ul className="mt-3 space-y-2 list-disc list-inside marker:text-zinc-300 dark:marker:text-zinc-600">
                <li><strong className="font-medium text-zinc-700 dark:text-zinc-300">Chrome</strong>: Settings → Privacy and Security → Cookies</li>
                <li><strong className="font-medium text-zinc-700 dark:text-zinc-300">Safari</strong>: Settings → Safari → Privacy</li>
                <li><strong className="font-medium text-zinc-700 dark:text-zinc-300">Firefox</strong>: Settings → Privacy &amp; Security</li>
              </ul>
              <p className="mt-4">
                To clear your localStorage (cart data), you can clear your browser&apos;s site data for vintagegallerystore.com.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Third-Party Cookies
              </h2>
              <p>
                Paystack (our payment provider) may set its own cookies during the payment process on their hosted page. We have no control over these cookies. Please review{" "}
                <a href="https://paystack.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">
                  Paystack&apos;s Privacy Policy
                </a>{" "}for details.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Changes to This Policy
              </h2>
              <p>
                We may update this Cookies Policy as our practices change. If we make significant changes, we will notify you by email <strong className="font-medium text-zinc-700 dark:text-zinc-300">at least 30 days before</strong> the changes take effect. The updated date at the top of this page will always reflect the latest revision.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Contact
              </h2>
              <p>
                Questions about our cookie use? Email:{" "}
                <a href="mailto:vintagegallerystore@gmail.com" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">
                  vintagegallerystore@gmail.com
                </a>
              </p>
              <p className="mt-3">
                Also see our{" "}
                <Link href="/privacy" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">Privacy Policy</Link>
                {" "}and{" "}
                <Link href="/terms" className="text-zinc-900 dark:text-zinc-200 underline underline-offset-2">Terms of Service</Link>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
