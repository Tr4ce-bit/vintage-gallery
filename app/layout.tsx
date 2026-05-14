import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalClerkProvider from "@/components/ConditionalClerkProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Vintage Gallery | Premium Streetwear",
  description: "Curated vintage streetwear. Limited drops. Delivered across Ghana.",
  openGraph: {
    title: "Vintage Gallery Store",
    description: "Premium vintage streetwear — Ghana's finest.",
    images: ["/asset/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConditionalClerkProvider>
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
        <body className="bg-vg-black text-vg-cream antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ConditionalClerkProvider>
  );
}
