import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
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
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
        <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased transition-colors duration-300">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <NextTopLoader
              color="#c9a84c"
              shadow="0 0 10px #c9a84c,0 0 5px #c9a84c"
              height={2}
              showSpinner={false}
              easing="ease"
              speed={200}
            />
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
