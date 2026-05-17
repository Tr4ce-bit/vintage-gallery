import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
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
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
        <body className="bg-zinc-950 text-zinc-100 antialiased">
          <NextTopLoader
            color="#ffffff"
            shadow="0 0 8px rgba(255,255,255,0.4)"
            height={2}
            showSpinner={false}
            easing="ease"
            speed={200}
          />
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
