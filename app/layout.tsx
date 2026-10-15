import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Vintage Gallery", template: "%s · Vintage Gallery" },
  description: "Vintage-inspired streetwear from Ghana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
