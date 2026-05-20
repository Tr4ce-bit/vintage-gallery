import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from "nextjs-toploader";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Vintage Gallery · Admin",
  description: "Vintage Gallery admin panel",
  robots: "noindex, nofollow",   // keep admin out of search engines
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* suppressHydrationWarning: the inline script mutates <html> classname before hydration */}
      <html lang="en" suppressHydrationWarning
        className={`${cormorant.variable} ${inter.variable}`}>
        <head>
          {/* Apply saved theme class before first paint — prevents flash */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              try {
                var t = localStorage.getItem('vg-admin-theme') || 'dark';
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
          `}} />
        </head>
        <body className="bg-zinc-950 dark:bg-zinc-950 antialiased">
          <ThemeProvider>
            <NextTopLoader
              color="#ffffff"
              shadow="0 0 8px rgba(255,255,255,0.4)"
              height={2}
              showSpinner={false}
              easing="ease"
              speed={200}
            />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
