import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalClerkProvider from "@/components/ConditionalClerkProvider";

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
    <ConditionalClerkProvider>
      <html lang="en">
        <body className="bg-brand-black text-brand-cream antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ConditionalClerkProvider>
  );
}
