import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Vintage Gallery Store | Premium Streetwear",
  description:
    "Curated vintage streetwear. Limited drops. Delivered across Ghana.",
  openGraph: {
    title: "Vintage Gallery Store",
    description: "Premium vintage streetwear — Ghana's finest.",
    images: ["/asset/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-brand-black text-brand-cream antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
