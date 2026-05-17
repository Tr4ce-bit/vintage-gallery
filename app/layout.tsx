import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

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

export const metadata: Metadata = {
  title: {
    default:  "Vintage Gallery | Premium Streetwear · Accra",
    template: "%s · Vintage Gallery",
  },
  description: "Curated vintage streetwear. Limited drops. Delivered across Ghana.",
  icons: {
    icon:             "/icon.svg",
    shortcut:         "/icon.svg",
    apple:            "https://vintage-gallery-products.s3.amazonaws.com/branding/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
        <body className="bg-white text-zinc-900 antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </AuthProvider>
  );
}
